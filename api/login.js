// 로그인 (Vercel 서버 함수)
//   GET  /api/login                       → 지금 로그인 상태 {loggedIn, user, unlimited}
//   POST /api/login {id, password}        → 로그인 (맞으면 rm_auth 쿠키를 줌)
//   POST /api/login {action: "logout"}    → 로그아웃 (쿠키 지움)
// ● 비밀번호는 화면(브라우저)에서 비교하지 않고 이 서버에서만 비교합니다.
// ● 틀린 시도가 15분에 10번을 넘으면 그 IP 는 잠시 막습니다. (무작위로 비밀번호를 찍어 보는 것을 막는 장치)
import { checkLogin, makeToken, readUser, isUnlimited, cookieHeader, TOKEN_TTL_SEC } from "./_auth.js";

const MAX_FAILS = 10, WINDOW_MS = 15 * 60 * 1000;
const fails = new Map();                                 // IP → { n, resetAt }  (서버가 여러 개로 나뉠 수 있어 '대략적인' 장치)

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
function blocked(ip, now) {
  if (fails.size > 5000) for (const [k, v] of fails) if (v.resetAt <= now) fails.delete(k);
  const e = fails.get(ip);
  return !!e && e.resetAt > now && e.n >= MAX_FAILS;
}
function addFail(ip, now) {
  const e = fails.get(ip);
  if (!e || e.resetAt <= now) fails.set(ip, { n: 1, resetAt: now + WINDOW_MS }); else e.n += 1;
}

export function createHandler() {
  return async function handler(req, res) {
    if (req.method !== "GET" && req.method !== "POST") { res.setHeader("Allow", "GET, POST"); return send(res, 405, { error: "get_or_post_only" }); }
    if (!sameOrigin(req)) return send(res, 403, { error: "forbidden_origin" });

    if (req.method === "GET") {
      const user = readUser(req);
      return send(res, 200, { loggedIn: user !== null, user, unlimited: isUnlimited(req) });
    }

    let body = req.body;
    if (typeof body === "string") { try { body = JSON.parse(body); } catch { body = null; } }
    if (!body || typeof body !== "object") return send(res, 400, { error: "bad_request" });

    if (body.action === "logout") {
      res.setHeader("Set-Cookie", cookieHeader(req, "", 0));
      return send(res, 200, { loggedIn: false, user: null, unlimited: false });
    }

    const now = Date.now(), ip = clientIp(req);
    if (blocked(ip, now)) return send(res, 429, { error: "too_many_attempts" });
    const id = typeof body.id === "string" ? body.id.trim().slice(0, 64) : "";
    const password = typeof body.password === "string" ? body.password.slice(0, 128) : "";
    if (!id || !password) return send(res, 400, { error: "bad_request" });

    if (!checkLogin(id, password)) {
      addFail(ip, now);
      return send(res, 401, { error: "bad_credentials" });
    }
    fails.delete(ip);
    res.setHeader("Set-Cookie", cookieHeader(req, makeToken(id), TOKEN_TTL_SEC));
    return send(res, 200, { loggedIn: true, user: id, unlimited: true });
  };
}

export default createHandler();
