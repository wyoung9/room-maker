// AI 렌더: 배치도(+방 사진) → 분위기 이미지 1장 (Vercel 서버 함수, OpenAI 이미지 편집 사용)
//
// ● AI 키는 환경 변수 OPENAI_API_KEY 에서만 읽습니다. 이 파일·화면·GitHub 어디에도 키를 적지 마세요.
// ● 올린 사진·만든 이미지는 이 서버에 저장하지 않습니다. (만들기 위해 OpenAI 로 전송됩니다.)
// ● 이미지는 '참고용 시안'입니다. 도면 위치를 그대로 정확히 그려 내지 못할 수 있습니다.
//
// 바꿔 쓰는 값(환경 변수, 모두 선택):
//   OPENAI_IMAGE_MODEL    이미지 모델 (기본 gpt-image-2.5-sunburst: 문서가 '편집 정확도 중시'로 소개한 모델)
//   RENDER_QUALITY        low | medium | high (기본 medium)
//   RENDER_FREE_COUNT     브라우저 하나당 무료 렌더 횟수 (기본 2)
//   RENDER_DAILY_PER_IP   한 사람(IP)이 하루에 만들 수 있는 렌더 수 (기본 6, 대략적인 제한)
//   RENDER_ENABLED        0 으로 두면 렌더만 바로 끔 (비상용)
//   AI_ENABLED            0 으로 두면 사진 읽기와 렌더를 모두 끔

import OpenAI, { toFile } from "openai";
import { createHash } from "node:crypto";
import { isUnlimited } from "./_auth.js";

const MODEL = process.env.OPENAI_IMAGE_MODEL || "gpt-image-2.5-sunburst";
const QUALITY = ["low", "medium", "high"].includes(process.env.RENDER_QUALITY) ? process.env.RENDER_QUALITY : "medium";
const SIZE = "1536x1024";                      // 가로로 긴 그림
const envFree = process.env.RENDER_FREE_COUNT;
const FREE = envFree !== undefined && envFree !== "" && Number.isInteger(Number(envFree)) && Number(envFree) >= 0 ? Number(envFree) : 2;
const DAILY_PER_IP = Number(process.env.RENDER_DAILY_PER_IP) > 0 ? Number(process.env.RENDER_DAILY_PER_IP) : 6;
// 로그인한 테스트 계정은 무료 횟수(FREE)를 세지 않습니다. 다만 실수·악용으로 요금이 폭주하지 않게 하루 상한은 넉넉하게 둡니다.
const testDailyCap = () => (Number(process.env.RENDER_TEST_DAILY) > 0 ? Number(process.env.RENDER_TEST_DAILY) : 200);
const TIMEOUT_MS = 170_000;                    // Vercel 함수 최대 시간(vercel.json)보다 짧게

const COOKIE = "rm_render";
const MAX_ITEMS = 30;
const MAX_LAYOUT_B64 = 1_200_000;              // 배치도 한 장 (글자 수 기준, 원본 약 0.9MB)
const MAX_PHOTO_B64 = 2_400_000;               // 방 사진 한 장 (원본 약 1.8MB)
const B64 = /^[A-Za-z0-9+/]+={0,2}$/;
const KIND_LABEL = { bed: "bed", desk: "desk", chair: "chair", storage: "storage unit", sofa: "sofa", fridge: "refrigerator or large appliance", misc: "furniture" };

export const STYLES = {
  modern: "modern minimalist, neutral grey and white palette, clean lines",
  nordic: "Scandinavian, light oak wood, white walls, cozy textiles",
  warm: "warm vintage, walnut wood, soft warm lighting",
  hotel: "clean white hotel-style, crisp linen, soft indirect lighting",
  natural: "natural beige, linen and rattan, a few green plants"
};

// ---------- 남용 막기 (서버 함수는 여러 개로 나뉠 수 있어 '대략적인' 장치) ----------
const daily = new Map();                       // IP → { used, resetAt }
const inflight = new Set();                    // 지금 렌더를 만드는 중인 IP (동시에 두 번 누르기 방지)
function dailyOk(ip, cap = DAILY_PER_IP, now = Date.now()) {
  if (daily.size > 5000) for (const [k, v] of daily) if (v.resetAt <= now) daily.delete(k);
  const e = daily.get(ip);
  return !e || e.resetAt <= now || e.used < cap;
}
function dailyAdd(ip, now = Date.now()) {
  const e = daily.get(ip);
  if (!e || e.resetAt <= now) daily.set(ip, { used: 1, resetAt: now + 86_400_000 }); else e.used += 1;
}

function send(res, status, body) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(body));
}
function clientIp(req) {
  const fwd = req.headers["x-forwarded-for"];
  return (typeof fwd === "string" && fwd.split(",")[0].trim()) || (req.socket && req.socket.remoteAddress) || "unknown";
}
function sameOrigin(req) {
  const origin = req.headers.origin;
  if (!origin) return true;
  try {
    const host = new URL(origin).host;
    return host === req.headers.host || /^(localhost|127\.0\.0\.1)(:\d+)?$/.test(host);
  } catch { return false; }
}
function readUsed(req) {                       // 쿠키에서 이 브라우저가 쓴 무료 횟수
  const m = /(?:^|;\s*)rm_render=(\d{1,3})(?:;|$)/.exec(req.headers.cookie || "");
  return m ? Number(m[1]) : 0;
}
function setUsed(req, res, n) {
  const secure = req.headers["x-forwarded-proto"] === "https" ? "; Secure" : "";
  res.setHeader("Set-Cookie", `${COOKIE}=${n}; Max-Age=31536000; Path=/; HttpOnly; SameSite=Lax${secure}`);
}

// ---------- 요청 검사 ----------
const num = (v, min, max) => typeof v === "number" && Number.isFinite(v) && v >= min && v <= max;
function cleanName(v) { return String(v || "").replace(/[^\p{L}\p{N} ]/gu, " ").replace(/\s+/g, " ").trim().slice(0, 20) || "furniture"; }

function checkImage(img, types, maxLen) {
  return !!img && types.includes(img.media_type) && typeof img.data === "string" &&
    img.data.length > 0 && img.data.length <= maxLen && B64.test(img.data);
}
export function validate(body) {
  if (!body || typeof body !== "object") return { error: "요청 모양이 맞지 않아요." };
  if (!checkImage(body.layout, ["image/png", "image/jpeg"], MAX_LAYOUT_B64)) return { error: "배치도 그림이 올바르지 않아요." };
  const hasPhoto = body.photo !== undefined && body.photo !== null;
  if (hasPhoto && !checkImage(body.photo, ["image/png", "image/jpeg", "image/webp"], MAX_PHOTO_B64)) return { error: "방 사진 형식(JPG·PNG·WEBP)이나 크기가 맞지 않아요." };
  const room = body.room;
  if (!room || !num(room.w, 100, 3000) || !num(room.h, 100, 3000)) return { error: "방 크기가 올바르지 않아요." };
  let poly = null;                                // 사각형이 아닌 방의 윤곽(꼭짓점 3~16개, cm). 없으면 사각형
  if (room.poly !== undefined && room.poly !== null) {
    if (!Array.isArray(room.poly) || room.poly.length < 3 || room.poly.length > 16 ||
        !room.poly.every((p) => Array.isArray(p) && p.length === 2 && num(p[0], -100, 3100) && num(p[1], -100, 3100))) return { error: "방 모양이 올바르지 않아요." };
    poly = room.poly.map((p) => [Math.round(p[0]), Math.round(p[1])]);
  }
  const items = Array.isArray(body.items) ? body.items : null;
  if (!items || items.length < 1 || items.length > MAX_ITEMS) return { error: `가구는 1~${MAX_ITEMS}개까지 넣을 수 있어요.` };
  const clean = [];
  for (const it of items) {
    if (!it || !["furniture", "door", "window"].includes(it.type) || !num(it.w, 5, 1000) || !num(it.h, 5, 1000) ||
        !num(it.x, -500, 4000) || !num(it.y, -500, 4000)) return { error: "가구 정보가 올바르지 않아요." };
    clean.push({ type: it.type, name: cleanName(it.name), kind: KIND_LABEL[it.kind] ? it.kind : "misc", w: it.w, h: it.h, x: it.x, y: it.y });
  }
  if (!clean.some((c) => c.type === "furniture")) return { error: "가구가 하나도 없어요. 가구를 먼저 놓아 주세요." };

  let style;
  if (body.style === "custom") {
    const t = String(body.styleText || "").trim();
    if (!/^[\p{L}\p{N} ,.\-]{2,40}$/u.test(t)) return { error: "분위기 글은 2~40자의 글자·숫자·쉼표만 쓸 수 있어요." };
    style = t;
  } else if (Object.prototype.hasOwnProperty.call(STYLES, body.style)) {
    style = STYLES[body.style];
  } else return { error: "분위기를 골라 주세요." };

  return { ok: { layout: body.layout, photo: hasPhoto ? body.photo : null, room: poly ? { w: room.w, h: room.h, poly } : { w: room.w, h: room.h }, items: clean, style } };
}

// ---------- 가구 위치 설명 (숫자로 서버가 직접 글을 만듦) ----------
const TOL = 10;                                 // 벽에서 10cm 안이면 '벽에 붙음'
function endWord(frac, a, b, c) { return frac < 0.34 ? a : frac > 0.66 ? c : b; }
function wallOfOpening(it, room) {
  const cx = it.x + it.w / 2, cy = it.y + it.h / 2;
  const d = { top: Math.abs(cy), bottom: Math.abs(cy - room.h), left: Math.abs(cx), right: Math.abs(cx - room.w) };
  return Object.keys(d).reduce((best, k) => (d[k] < d[best] ? k : best), "top");
}
export function describeItem(it, room) {
  const size = `${Math.round(it.w)} x ${Math.round(it.h)} cm`;
  if (it.type !== "furniture") {
    const wall = wallOfOpening(it, room);
    const horiz = wall === "top" || wall === "bottom";
    const span = horiz ? it.w : it.h;
    const frac = horiz ? (it.x + it.w / 2) / room.w : (it.y + it.h / 2) / room.h;
    const where = horiz ? endWord(frac, "near the left end", "in the middle", "near the right end")
                        : endWord(frac, "near the top end", "in the middle", "near the bottom end");
    return `- ${it.type === "door" ? "Door" : "Window"}, ${Math.round(span)} cm wide, in the ${wall} wall, ${where}`;
  }
  const t = { top: it.y <= TOL, bottom: it.y + it.h >= room.h - TOL, left: it.x <= TOL, right: it.x + it.w >= room.w - TOL };
  const walls = ["top", "bottom", "left", "right"].filter((k) => t[k]);
  const label = `- "${it.name}" (${KIND_LABEL[it.kind] || "furniture"}), floor footprint ${size}`;
  if (walls.length >= 2) return `${label}: in the corner where the ${walls[0]} wall meets the ${walls[1]} wall`;
  if (walls.length === 1) {
    const horiz = walls[0] === "top" || walls[0] === "bottom";
    const frac = horiz ? (it.x + it.w / 2) / room.w : (it.y + it.h / 2) / room.h;
    const along = horiz ? endWord(frac, "near the left end", "in the middle", "near the right end")
                        : endWord(frac, "near the top end", "in the middle", "near the bottom end");
    return `${label}: against the ${walls[0]} wall, ${along}`;
  }
  const px = Math.round(((it.x + it.w / 2) / room.w) * 100), py = Math.round(((it.y + it.h / 2) / room.h) * 100);
  return `${label}: free-standing away from the walls, its center is ${px}% from the left edge and ${py}% from the top edge`;
}
export function buildPrompt({ room, items, style, hasPhoto }) {
  return [
    "Create ONE photorealistic interior design render of a small Korean apartment room, seen from eye level in a natural three-quarter perspective with soft daylight.",
    hasPhoto
      ? "Image 1 is a top-down floor plan of the room with the furniture drawn to scale. Image 2 is a photo of the real room: keep its real walls, floor, window, door, proportions, light and camera feel, and place the furniture from the plan into this room."
      : "The image is a top-down floor plan of the room with the furniture drawn to scale. Follow its layout.",
    room.poly
      ? `The room is NOT a rectangle. Its floor outline has these corners in the plan, in cm (origin = top-left of the room's bounding box, ${Math.round(room.w)} x ${Math.round(room.h)} cm): ${room.poly.map((p) => `(${p[0]}, ${p[1]})`).join(", ")}. The walls follow this outline exactly, including any slanted or notched walls. Do not make the room rectangular.`
      : `Room size: ${Math.round(room.w)} x ${Math.round(room.h)} cm. In the plan, the top, bottom, left and right edges are the four walls of the room.`,
    "Furniture, doors and windows (keep these positions, sizes and proportions):",
    items.map((it) => describeItem(it, room)).join("\n"),
    `Style: ${style}.`,
    "Rules: show exactly the listed furniture and nothing large that is not listed (small decor such as a plant, a lamp or a rug that suits the style is fine). Keep realistic proportions between the pieces. Do not draw text, labels, dimension numbers, floor-plan lines, people or watermarks. This is a concept image for a customer deciding what to buy."
  ].join("\n");
}

export function createHandler(options = {}) {
  let client = options.client || null;
  return async function handler(req, res) {
    if (req.method !== "GET" && req.method !== "POST") { res.setHeader("Allow", "GET, POST"); return send(res, 405, { error: "get_or_post_only" }); }
    if (process.env.AI_ENABLED === "0" || process.env.RENDER_ENABLED === "0") return send(res, 503, { error: "ai_disabled" });
    const configured = !!(client || process.env.OPENAI_API_KEY);
    if (!sameOrigin(req)) return send(res, 403, { error: "forbidden_origin" });

    const used = readUsed(req);
    const unlimited = isUnlimited(req);          // 로그인한 테스트 계정이면 횟수 제한 없음
    if (req.method === "GET") {                 // 화면에 '무료 남은 횟수'를 보여 줄 때 씀
      return send(res, 200, { enabled: configured, free: FREE, used, remaining: Math.max(0, FREE - used), unlimited });
    }
    if (!configured) return send(res, 503, { error: "ai_not_configured" });

    let body = req.body;
    if (typeof body === "string") { try { body = JSON.parse(body); } catch { body = null; } }
    const checked = validate(body);
    if (!checked.ok) return send(res, 400, { error: "bad_request", message: checked.error });
    const { layout, photo, room, items, style } = checked.ok;

    if (!unlimited && used >= FREE) {
      return send(res, 402, { error: "free_limit", free: FREE, used, remaining: 0,
        message: `무료 렌더 ${FREE}회를 모두 사용했어요. 유료 이용은 준비 중이에요.` });
    }
    const ip = clientIp(req);
    if (!dailyOk(ip, unlimited ? testDailyCap() : DAILY_PER_IP)) return send(res, 429, { error: "daily_limit", message: "오늘 만들 수 있는 렌더 수를 넘었어요. 내일 다시 해 주세요." });
    if (inflight.has(ip)) return send(res, 429, { error: "already_rendering", message: "이미 렌더를 만드는 중이에요. 끝날 때까지 기다려 주세요." });

    inflight.add(ip);
    try {
      if (!client) client = new OpenAI();
      const files = [await toFile(Buffer.from(layout.data, "base64"), layout.media_type === "image/png" ? "plan.png" : "plan.jpg", { type: layout.media_type })];
      if (photo) files.push(await toFile(Buffer.from(photo.data, "base64"), "room." + (photo.media_type === "image/webp" ? "webp" : photo.media_type === "image/png" ? "png" : "jpg"), { type: photo.media_type }));

      // 재시도 없음(maxRetries 0): 시간이 오래 걸렸다고 자동으로 다시 만들면 돈이 두 번 나갈 수 있어서
      const result = await client.images.edit({
        model: MODEL,
        image: files,
        prompt: buildPrompt({ room, items, style, hasPhoto: !!photo }),
        n: 1,
        size: SIZE,
        quality: QUALITY,
        output_format: "jpeg",
        output_compression: 80,
        safety_identifier: createHash("sha256").update(ip).digest("hex").slice(0, 32)
      }, { timeout: TIMEOUT_MS, maxRetries: 0 });

      const b64 = result && result.data && result.data[0] && result.data[0].b64_json;
      if (typeof b64 !== "string" || !b64) return send(res, 502, { error: "no_image", message: "이미지를 받지 못했어요. 다시 해 보세요." });

      const nowUsed = unlimited ? used : used + 1;   // 성공했을 때만 무료 횟수를 차감 (테스트 계정은 차감 없음)
      dailyAdd(ip);
      if (!unlimited) setUsed(req, res, nowUsed);
      const u = (result && result.usage) || {};
      console.log("render 사용량:", MODEL, QUALITY, "입력 토큰", u.input_tokens, "출력 토큰", u.output_tokens, photo ? "(방 사진 있음)" : "(배치도만)");
      return send(res, 200, {
        image: { mime: "image/jpeg", data: b64 },
        free: FREE, used: nowUsed, remaining: Math.max(0, FREE - nowUsed), unlimited,
        model: MODEL, usage: { input_tokens: u.input_tokens ?? null, output_tokens: u.output_tokens ?? null }
      });
    } catch (error) {
      // 사진·그림 내용은 기록하지 않고, 오류 종류와 OpenAI 가 알려 준 번호·항목·메시지만 남깁니다.
      console.error("render 실패:", error && error.status, error && error.code, error && error.param,
        error && error.constructor && error.constructor.name, error && typeof error.message === "string" ? error.message.slice(0, 160) : "");
      if (error instanceof OpenAI.AuthenticationError || error instanceof OpenAI.PermissionDeniedError) {
        return send(res, 503, { error: "ai_not_configured", message: "서버의 AI 설정에 문제가 있어요. 운영자에게 알려 주세요." });
      }
      if (error instanceof OpenAI.RateLimitError) {
        return send(res, 429, { error: "ai_busy", message: "AI가 지금 바쁘거나 사용 한도에 걸렸어요. 잠시 뒤에 다시 눌러 주세요." });
      }
      if (error instanceof OpenAI.BadRequestError) {
        if (error.code === "moderation_blocked") return send(res, 422, { error: "blocked", message: "AI가 이 사진이나 설명으로는 이미지를 만들지 못했어요. 다른 사진으로 해 보세요." });
        return send(res, 400, { error: "bad_request_to_ai", message: "AI가 이 요청을 받아들이지 못했어요. 다른 사진으로 해 보고, 계속되면 운영자에게 알려 주세요." });
      }
      if (OpenAI.APIConnectionTimeoutError && error instanceof OpenAI.APIConnectionTimeoutError) {
        return send(res, 504, { error: "timeout", message: "만드는 데 시간이 너무 오래 걸렸어요. 잠시 뒤에 다시 해 보세요. (무료 횟수는 차감되지 않았어요.)" });
      }
      return send(res, 502, { error: "ai_failed", message: "렌더를 만들지 못했어요. 잠시 뒤에 다시 해 보세요. (무료 횟수는 차감되지 않았어요.)" });
    } finally {
      inflight.delete(ip);
    }
  };
}

export default createHandler();
