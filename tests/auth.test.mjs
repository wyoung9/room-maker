// api/login.js · api/_auth.js 와 '테스트 계정은 렌더 횟수 제한 없음' 시험. 가짜 AI 를 써서 키 없이·돈 안 들이고 확인합니다.
// 실행: npm test
import { test, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { createHandler as createLogin } from "../api/login.js";
import { createHandler as createRender } from "../api/render.js";
import { createHandler as createRead } from "../api/read-furniture.js";
import { makeToken, readUser, isUnlimited } from "../api/_auth.js";

const TINY = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";
let seq = 0;
const newIp = () => `10.9.${Math.floor(seq / 200)}.${seq++ % 200}`;
function fakeReq(body, { method = "POST", headers = {}, ip = newIp() } = {}) {
  return { method, body, headers: { host: "room-maker.test", "x-forwarded-for": ip, ...headers }, socket: {} };
}
function fakeRes() {
  return { statusCode: 200, headers: {}, body: null,
    setHeader(k, v) { this.headers[k.toLowerCase()] = v; },
    end(text) { this.body = text ? JSON.parse(text) : null; } };
}
async function call(handler, body, opts) { const res = fakeRes(); await handler(fakeReq(body, opts), res); return res; }
const cookieOf = (res) => (res.headers["set-cookie"] || "").split(";")[0];       // "rm_auth=...."

const renderBody = () => ({
  layout: { media_type: "image/png", data: TINY }, room: { w: 300, h: 400 }, style: "nordic",
  items: [{ type: "furniture", name: "침대", kind: "bed", w: 100, h: 200, x: 200, y: 0 }]
});
const fakeAi = () => ({
  calls: [],
  images: { edit: async function () { this.calls = (this.calls || []); return { data: [{ b64_json: TINY }], usage: { input_tokens: 1, output_tokens: 1 } }; } }
});

beforeEach(() => {
  delete process.env.TEST_ID; delete process.env.TEST_PW; delete process.env.AUTH_SECRET;
  delete process.env.RENDER_FREE_COUNT; delete process.env.RENDER_DAILY_PER_IP; delete process.env.RENDER_TEST_DAILY;
  process.env.OPENAI_API_KEY = "test-not-a-real-key";
});

test("test / test1234 로 로그인하면 200 + 로그인 쿠키(HttpOnly), 상태 확인에서 무제한 계정으로 보임", async () => {
  const login = createLogin();
  const res = await call(login, { id: "test", password: "test1234" });
  assert.equal(res.statusCode, 200);
  assert.deepEqual(res.body, { loggedIn: true, user: "test", unlimited: true });
  assert.match(res.headers["set-cookie"], /^rm_auth=[A-Za-z0-9_.-]+;.*HttpOnly/);
  const status = await call(login, null, { method: "GET", headers: { cookie: cookieOf(res) } });
  assert.deepEqual(status.body, { loggedIn: true, user: "test", unlimited: true });
});

test("틀린 아이디·비밀번호는 401 이고 쿠키를 주지 않음. 로그인 안 한 상태 확인은 loggedIn false", async () => {
  const login = createLogin();
  for (const body of [{ id: "test", password: "wrong" }, { id: "other", password: "test1234" }, { id: "TEST", password: "test1234" }]) {
    const res = await call(login, body);
    assert.equal(res.statusCode, 401, JSON.stringify(body));
    assert.equal(res.headers["set-cookie"], undefined);
  }
  const status = await call(login, null, { method: "GET" });
  assert.deepEqual(status.body, { loggedIn: false, user: null, unlimited: false });
});

test("빈 값·이상한 모양은 400", async () => {
  const login = createLogin();
  assert.equal((await call(login, { id: "", password: "" })).statusCode, 400);
  assert.equal((await call(login, { id: 123, password: {} })).statusCode, 400);
  assert.equal((await call(login, null)).statusCode, 400);
});

test("틀린 시도가 10번을 넘으면 그 IP 는 429 (맞는 비밀번호도 잠시 막힘)", async () => {
  const login = createLogin(), ip = newIp();
  for (let i = 0; i < 10; i++) assert.equal((await call(login, { id: "test", password: "x" + i }, { ip })).statusCode, 401);
  assert.equal((await call(login, { id: "test", password: "test1234" }, { ip })).statusCode, 429);
  assert.equal((await call(login, { id: "test", password: "test1234" }, { ip: newIp() })).statusCode, 200);   // 다른 IP 는 영향 없음
});

test("로그아웃하면 쿠키를 지움", async () => {
  const res = await call(createLogin(), { action: "logout" });
  assert.equal(res.statusCode, 200);
  assert.match(res.headers["set-cookie"], /^rm_auth=; Max-Age=0/);
});

test("쿠키를 바꾸거나 기간이 지난 것은 로그인으로 인정하지 않음", () => {
  const good = makeToken("test");
  const reqWith = (v) => ({ headers: { cookie: "rm_auth=" + v } });
  assert.equal(readUser(reqWith(good)), "test");
  const [p, s] = good.split(".");
  const forged = Buffer.from(JSON.stringify({ u: "test", exp: 9999999999 })).toString("base64url") + "." + s;   // 내용만 바꾸고 서명은 그대로
  assert.equal(readUser(reqWith(forged)), null);
  assert.equal(readUser(reqWith(p + "." + "A".repeat(s.length))), null);
  assert.equal(readUser(reqWith("abc")), null);
  assert.equal(readUser({ headers: {} }), null);
  assert.equal(readUser(reqWith(makeToken("test", Date.now() - 8 * 24 * 3600 * 1000))), null);   // 8일 전 토큰 = 만료
  assert.equal(isUnlimited(reqWith(makeToken("someone-else"))), false);                            // 서명이 맞아도 test 계정이 아니면 무제한 아님
});

test("서명 열쇠가 다르면(환경 변수가 바뀌면) 예전 로그인은 무효", () => {
  const token = makeToken("test");
  process.env.AUTH_SECRET = "another-secret";
  assert.equal(readUser({ headers: { cookie: "rm_auth=" + token } }), null);
});

test("TEST_ID · TEST_PW 환경 변수로 계정을 바꿀 수 있음 (기본 계정은 막힘)", async () => {
  process.env.TEST_ID = "demo"; process.env.TEST_PW = "s3cret!";
  const login = createLogin();
  assert.equal((await call(login, { id: "test", password: "test1234" })).statusCode, 401);
  const ok = await call(login, { id: "demo", password: "s3cret!" });
  assert.equal(ok.statusCode, 200);
  assert.equal(isUnlimited({ headers: { cookie: cookieOf(ok) } }), true);
});

test("렌더: 로그인 안 하면 무료 횟수를 넘길 때 402, test 로그인하면 계속 만들 수 있고 횟수·쿠키가 늘지 않음", async () => {
  const render = createRender({ client: fakeAi() });
  const login = await call(createLogin(), { id: "test", password: "test1234" });
  const auth = cookieOf(login);
  const usedUp = "rm_render=2";                                    // 이 브라우저는 무료 2회를 이미 씀

  const anon = await call(render, renderBody(), { headers: { cookie: usedUp } });
  assert.equal(anon.statusCode, 402);

  const info = await call(render, null, { method: "GET", headers: { cookie: usedUp + "; " + auth } });
  assert.equal(info.body.unlimited, true);

  for (let i = 0; i < 3; i++) {
    const res = await call(render, renderBody(), { headers: { cookie: usedUp + "; " + auth }, ip: newIp() });
    assert.equal(res.statusCode, 200, "test 계정 " + (i + 1) + "번째");
    assert.equal(res.body.unlimited, true);
    assert.equal(res.headers["set-cookie"], undefined, "무료 횟수 쿠키를 건드리면 안 됨");
  }
});

test("렌더: 테스트 계정도 하루 상한(RENDER_TEST_DAILY)은 있음 — 요금 폭주 방지", async () => {
  process.env.RENDER_TEST_DAILY = "2";
  const render = createRender({ client: fakeAi() });
  const auth = cookieOf(await call(createLogin(), { id: "test", password: "test1234" }));
  const ip = newIp();
  assert.equal((await call(render, renderBody(), { headers: { cookie: auth }, ip })).statusCode, 200);
  assert.equal((await call(render, renderBody(), { headers: { cookie: auth }, ip })).statusCode, 200);
  assert.equal((await call(render, renderBody(), { headers: { cookie: auth }, ip })).statusCode, 429);
});

test("렌더: 가짜 쿠키로는 무제한이 안 됨", async () => {
  const render = createRender({ client: fakeAi() });
  const res = await call(render, renderBody(), { headers: { cookie: "rm_render=2; rm_auth=" + makeToken("test").slice(0, -3) + "abc" } });
  assert.equal(res.statusCode, 402);
});

test("사진 읽기: 로그인 안 하면 시간당 사진 수(기본 20장) 제한이 있고, test 계정은 제한 없음", async () => {
  const ai = { responses: { create: async () => ({ status: "completed", output_text: JSON.stringify({ items: [], notes: "" }),
    output: [{ type: "message", content: [{ type: "output_text", text: JSON.stringify({ items: [], notes: "" }) }] }], usage: {} }) } };
  const read = createRead({ client: ai });
  const four = { images: Array(4).fill({ media_type: "image/png", data: TINY }) };       // 한 번에 4장
  const auth = cookieOf(await call(createLogin(), { id: "test", password: "test1234" }));
  const anonIp = newIp(), testIp = newIp();
  for (let i = 0; i < 5; i++) assert.equal((await call(read, four, { ip: anonIp })).statusCode, 200, "일반 " + (i + 1) + "번째 (누적 " + (i + 1) * 4 + "장)");
  assert.equal((await call(read, four, { ip: anonIp })).statusCode, 429, "21장째부터 막힘");
  for (let i = 0; i < 8; i++) assert.equal((await call(read, four, { ip: testIp, headers: { cookie: auth } })).statusCode, 200, "test 계정 " + (i + 1) + "번째");
});
