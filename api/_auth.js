// 로그인 확인 도구 (login.js · render.js · read-furniture.js 가 같이 씁니다)
// 파일 이름이 _ 로 시작하면 Vercel 이 이 파일을 따로 주소로 열어 주지 않습니다. (서버 안에서만 쓰는 부품)
//
// ● 테스트 계정: 아이디 test / 비밀번호 test1234 (Vercel 환경 변수 TEST_ID · TEST_PW 로 바꿀 수 있어요)
//   ※ 이 저장소는 공개라서 기본값이 코드에 보입니다. 운영 중에는 반드시 환경 변수로 바꾸세요. (사용법.md 8장)
// ● 로그인하면 서명한 쿠키(rm_auth)를 줍니다. 서명 열쇠는 AUTH_SECRET 환경 변수, 없으면 OPENAI_API_KEY 에서 만들어 써서
//   저장소에는 열쇠가 없어요. 쿠키 값을 바꾸면 서명이 틀려서 로그인한 것으로 인정되지 않습니다.
import { createHmac, createHash, timingSafeEqual, randomBytes } from "node:crypto";

export const AUTH_COOKIE = "rm_auth";
export const TOKEN_TTL_SEC = 7 * 24 * 3600;             // 로그인 유지 7일
const PROCESS_FALLBACK = randomBytes(32).toString("hex"); // 환경 변수가 하나도 없을 때(내 컴퓨터 시험용): 서버를 다시 켜면 로그인이 풀려요

function secretKey() {
  const base = process.env.AUTH_SECRET || process.env.OPENAI_API_KEY || PROCESS_FALLBACK;
  return createHash("sha256").update("roommaker-auth:" + base).digest();
}
export function testAccount() {
  return { id: process.env.TEST_ID || "test", pw: process.env.TEST_PW || "test1234" };
}
function sameText(a, b) {                               // 글자 비교가 걸리는 시간으로 힌트를 주지 않게 같은 길이의 해시로 비교
  const A = createHash("sha256").update(String(a)).digest();
  const B = createHash("sha256").update(String(b)).digest();
  return timingSafeEqual(A, B);
}
export function checkLogin(id, password) {
  const t = testAccount();
  const okId = sameText(id, t.id), okPw = sameText(password, t.pw);   // 둘 다 계산해서 어느 쪽이 틀렸는지 시간으로 드러나지 않게
  return okId && okPw;
}

export function makeToken(user, nowMs = Date.now()) {
  const payload = Buffer.from(JSON.stringify({ u: user, exp: Math.floor(nowMs / 1000) + TOKEN_TTL_SEC })).toString("base64url");
  const sig = createHmac("sha256", secretKey()).update(payload).digest("base64url");
  return payload + "." + sig;
}
// 쿠키에서 로그인한 사람의 아이디를 읽음. 서명이 틀리거나 기간이 지났으면 null
export function readUser(req, nowMs = Date.now()) {
  const m = /(?:^|;\s*)rm_auth=([A-Za-z0-9_.-]{1,600})(?:;|$)/.exec((req.headers && req.headers.cookie) || "");
  if (!m) return null;
  const [payload, sig] = m[1].split(".");
  if (!payload || !sig) return null;
  const want = createHmac("sha256", secretKey()).update(payload).digest("base64url");
  const a = Buffer.from(sig), b = Buffer.from(want);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    if (!data || typeof data.u !== "string" || typeof data.exp !== "number" || data.exp * 1000 <= nowMs) return null;
    return data.u;
  } catch { return null; }
}
// 횟수 제한이 없는 계정(테스트 계정)인지
export function isUnlimited(req) {
  const user = readUser(req);
  return user !== null && user === testAccount().id;
}
export function cookieHeader(req, value, maxAgeSec) {
  const secure = req.headers && req.headers["x-forwarded-proto"] === "https" ? "; Secure" : "";
  return `${AUTH_COOKIE}=${value}; Max-Age=${maxAgeSec}; Path=/; HttpOnly; SameSite=Lax${secure}`;
}
