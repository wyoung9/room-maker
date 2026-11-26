// api/read-furniture.js 시험. 가짜 AI를 써서 키 없이·돈 안 들이고 확인합니다.
// 실행: npm test
import { test, beforeEach } from "node:test";
import assert from "node:assert/strict";
import OpenAI from "openai";
import { createHandler, cleanResult, SCHEMA } from "../api/read-furniture.js";

const TINY_PNG = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";
const goodBody = (extra = {}) => ({ images: [{ media_type: "image/png", data: TINY_PNG }], ...extra });

function fakeReq(body, { method = "POST", headers = {}, ip = "1.2.3.4" } = {}) {
  return { method, body, headers: { host: "room-maker.test", "x-forwarded-for": ip, ...headers }, socket: {} };
}
function fakeRes() {
  return { statusCode: 200, headers: {}, body: null,
    setHeader(k, v) { this.headers[k.toLowerCase()] = v; },
    end(text) { this.body = text ? JSON.parse(text) : null; } };
}
async function call(handler, body, opts) { const res = fakeRes(); await handler(fakeReq(body, opts), res); return res; }

function fakeClient(reply) {
  const calls = [];
  return { calls, responses: { create: async (params) => { calls.push(params); return typeof reply === "function" ? reply(params) : reply; } } };
}
// OpenAI Responses API 답 모양: output_text 에 JSON 글자, output 안에 message 항목
const answer = (obj, extra = {}) => ({
  status: "completed", model: "gpt-test", usage: { input_tokens: 1500, output_tokens: 300 },
  output_text: JSON.stringify(obj),
  output: [{ type: "message", content: [{ type: "output_text", text: JSON.stringify(obj) }] }], ...extra
});
const empty = () => answer({ items: [], notes: "" });

beforeEach(() => {
  delete process.env.ACCESS_CODE; delete process.env.AI_ENABLED; delete process.env.RATE_LIMIT_PER_HOUR; delete process.env.OPENAI_MODEL;
  process.env.OPENAI_API_KEY = "test-not-a-real-key";
});

test("OpenAI 엄격 모드 규칙을 지킨 JSON 모양인지 (모든 항목 required, additionalProperties:false)", () => {
  const check = (node, path) => {
    if (node && node.type === "object") {
      assert.equal(node.additionalProperties, false, `${path} additionalProperties`);
      assert.deepEqual([...node.required].sort(), Object.keys(node.properties).sort(), `${path} required`);
      for (const [k, v] of Object.entries(node.properties)) check(v, `${path}.${k}`);
    }
    if (node && node.type === "array") check(node.items, `${path}[]`);
  };
  assert.equal(SCHEMA.type, "object", "맨 위는 객체여야 함");
  assert.ok(!SCHEMA.anyOf, "맨 위에 anyOf 금지");
  check(SCHEMA, "root");
});

test("POST 가 아니면 405", async () => {
  const res = await call(createHandler({ client: fakeClient(empty()) }), null, { method: "GET" });
  assert.equal(res.statusCode, 405);
});

test("키가 없으면 503 ai_not_configured (AI를 부르지 않음)", async () => {
  delete process.env.OPENAI_API_KEY;
  const res = await call(createHandler(), goodBody());
  assert.equal(res.statusCode, 503);
  assert.equal(res.body.error, "ai_not_configured");
});

test("AI_ENABLED=0 이면 바로 꺼짐", async () => {
  process.env.AI_ENABLED = "0";
  const client = fakeClient(empty());
  const res = await call(createHandler({ client }), goodBody());
  assert.equal(res.statusCode, 503);
  assert.equal(res.body.error, "ai_disabled");
  assert.equal(client.calls.length, 0);
});

test("다른 사이트에서 온 요청은 403", async () => {
  const res = await call(createHandler({ client: fakeClient(empty()) }), goodBody(), { headers: { origin: "https://evil.example" } });
  assert.equal(res.statusCode, 403);
});

test("같은 사이트·localhost 요청은 통과", async () => {
  const handler = createHandler({ client: fakeClient(empty()) });
  assert.equal((await call(handler, goodBody(), { headers: { origin: "https://room-maker.test" } })).statusCode, 200);
  assert.equal((await call(handler, goodBody(), { headers: { origin: "http://localhost:8080" }, ip: "9.9.9.9" })).statusCode, 200);
});

test("잘못된 요청 모양·사진 개수·형식·크기는 400 (AI를 부르지 않음)", async () => {
  const client = fakeClient(empty());
  const handler = createHandler({ client });
  const bad = [
    null, "not json at all", {}, { images: [] },
    { images: Array(5).fill({ media_type: "image/png", data: TINY_PNG }) },
    { images: [{ media_type: "application/pdf", data: TINY_PNG }] },
    { images: [{ media_type: "image/png", data: "<script>alert(1)</script>" }] },
    { images: [{ media_type: "image/png", data: "A".repeat(1_800_001) }] },
    { images: [{ media_type: "image/png" }] }
  ];
  for (const [i, body] of bad.entries()) {
    const res = await call(handler, body, { ip: `10.0.0.${i}` });
    assert.equal(res.statusCode, 400, `case ${i}`);
  }
  assert.equal(client.calls.length, 0);
});

test("이용 코드: 설정하면 없거나 틀릴 때 401, 맞으면 통과", async () => {
  process.env.ACCESS_CODE = "pilot-2026";
  const handler = createHandler({ client: fakeClient(empty()) });
  assert.equal((await call(handler, goodBody(), { ip: "2.0.0.1" })).statusCode, 401);
  assert.equal((await call(handler, goodBody({ accessCode: "wrong" }), { ip: "2.0.0.2" })).statusCode, 401);
  assert.equal((await call(handler, goodBody({ accessCode: "pilot-2026" }), { ip: "2.0.0.3" })).statusCode, 200);
});

test("한 시간 사진 수 제한(기본 20장)을 넘으면 429, 다른 사람은 영향 없음", async () => {
  const client = fakeClient(empty());
  const handler = createHandler({ client });
  for (let i = 0; i < 20; i++) assert.equal((await call(handler, goodBody(), { ip: "3.3.3.3" })).statusCode, 200, `사진 ${i + 1}장째`);
  assert.equal((await call(handler, goodBody(), { ip: "3.3.3.3" })).statusCode, 429);
  assert.equal(client.calls.length, 20);
  assert.equal((await call(handler, goodBody(), { ip: "4.4.4.4" })).statusCode, 200);
});

test("정상: 요청 모양이 맞고, 결과가 정리되어 돌아옴", async () => {
  const client = fakeClient(answer({
    items: [
      { name: "  싱글   침대 프레임  ", kind: "bed", width_cm: 100.4, depth_cm: 200, height_cm: 35, confidence: "high", evidence: '표에 "가로 1000 × 깊이 2000 mm"' },
      { name: "책상", kind: "desk", width_cm: 120, depth_cm: null, height_cm: null, confidence: "low", evidence: "치수 일부만 보임" },
      { name: "이상한 값", kind: "weird-kind", width_cm: 99999, depth_cm: -5, height_cm: "abc", confidence: "sure", evidence: 7 }
    ],
    notes: "사진 한 장에서 읽었어요."
  }));
  const res = await call(createHandler({ client }), goodBody({ accessCode: "ignored" }));
  assert.equal(res.statusCode, 200);

  // AI에게 보낸 요청 확인
  const sent = client.calls[0];
  assert.equal(sent.model, "gpt-6.2-astra");
  assert.equal(sent.store, false);
  assert.ok(sent.max_output_tokens > 0);
  const parts = sent.input[0].content;
  assert.equal(parts[0].type, "input_text");
  assert.equal(parts[1].type, "input_image");
  assert.ok(parts[1].image_url.startsWith("data:image/png;base64,"));
  assert.equal(sent.text.format.type, "json_schema");
  assert.equal(sent.text.format.strict, true);
  assert.equal(sent.text.format.schema, SCHEMA);
  assert.ok(!("temperature" in sent), "추론 모델에서 안 받을 수 있는 값은 보내지 않음");

  // 결과 정리 확인
  const [bed, desk, weird] = res.body.items;
  assert.deepEqual(bed, { name: "싱글 침대 프레임", kind: "bed", w: 100, h: 200, height: 35, confidence: "high", evidence: '표에 "가로 1000 × 깊이 2000 mm"' });
  assert.equal(desk.h, null);
  assert.equal(desk.confidence, "low");
  assert.equal(weird.kind, "misc");
  assert.equal(weird.w, null); assert.equal(weird.h, null); assert.equal(weird.height, null);
  assert.equal(weird.confidence, "low");
  assert.equal(weird.evidence, "");
  assert.deepEqual(res.body.usage, { input_tokens: 1500, output_tokens: 300 });
  assert.equal(res.body.notes, "사진 한 장에서 읽었어요.");
});

test("OPENAI_MODEL 환경 변수로 모델을 바꿀 수 있음", async () => {
  // 모델 이름은 파일을 읽을 때 한 번 정해지므로, 새로 불러와서 확인
  process.env.OPENAI_MODEL = "my-test-model";
  const fresh = await import(`../api/read-furniture.js?model=${Date.now()}`);
  const client = fakeClient(empty());
  await call(fresh.createHandler({ client }), goodBody(), { ip: "8.8.8.8" });
  assert.equal(client.calls[0].model, "my-test-model");
});

test("사진 여러 장이면 모두 input_image 로 보냄", async () => {
  const client = fakeClient(empty());
  await call(createHandler({ client }), { images: [
    { media_type: "image/jpeg", data: TINY_PNG }, { media_type: "image/webp", data: TINY_PNG } ] }, { ip: "8.8.4.4" });
  const parts = client.calls[0].input[0].content;
  assert.equal(parts.filter((p) => p.type === "input_image").length, 2);
  assert.ok(parts[2].image_url.startsWith("data:image/webp;base64,"));
});

test("AI가 거절하면 422, 중간에 끊기면 502, 이상한 답이면 502", async () => {
  const mk = (resp, ip) => call(createHandler({ client: fakeClient(resp) }), goodBody(), { ip });
  const refusal = { status: "completed", output_text: "", output: [{ type: "message", content: [{ type: "refusal", refusal: "죄송합니다" }] }] };
  assert.equal((await mk(refusal, "5.0.0.1")).statusCode, 422);
  assert.equal((await mk({ status: "incomplete", incomplete_details: { reason: "max_output_tokens" }, output: [] }, "5.0.0.2")).statusCode, 502);
  assert.equal((await mk({ status: "completed", output_text: "not json", output: [] }, "5.0.0.3")).statusCode, 502);
  assert.equal((await mk({ status: "completed", output: [] }, "5.0.0.4")).statusCode, 502);
});

test("output_text 가 비어 있어도 output 안의 글자를 읽음", async () => {
  const obj = { items: [{ name: "책상", kind: "desk", width_cm: 120, depth_cm: 60, height_cm: 72, confidence: "high", evidence: "표" }], notes: "" };
  const resp = { status: "completed", output_text: "", output: [{ type: "message", content: [{ type: "output_text", text: JSON.stringify(obj) }] }] };
  const res = await call(createHandler({ client: fakeClient(resp) }), goodBody(), { ip: "5.1.0.1" });
  assert.equal(res.statusCode, 200);
  assert.equal(res.body.items[0].w, 120);
});

test("AI 호출이 실패해도 안전한 안내만 돌려주고 내부 내용은 새지 않음", async () => {
  const boom = { responses: { create: async () => { throw new Error("secret internal detail sk-proj-XXXX"); } } };
  const res = await call(createHandler({ client: boom }), goodBody(), { ip: "6.0.0.1" });
  assert.equal(res.statusCode, 502);
  assert.ok(!JSON.stringify(res.body).includes("secret"));
  assert.ok(!JSON.stringify(res.body).includes("sk-proj"));
});

test("SDK 오류 종류별 응답: 키 문제 503, 한도 429, 잘못된 요청 400", async () => {
  const make = (Cls, ip) => {
    const err = Object.create(Cls.prototype); err.status = 0; err.message = "x";
    return call(createHandler({ client: { responses: { create: async () => { throw err; } } } }), goodBody(), { ip });
  };
  assert.equal((await make(OpenAI.AuthenticationError, "7.0.0.1")).statusCode, 503);
  assert.equal((await make(OpenAI.PermissionDeniedError, "7.0.0.4")).statusCode, 503);
  assert.equal((await make(OpenAI.RateLimitError, "7.0.0.2")).statusCode, 429);
  assert.equal((await make(OpenAI.BadRequestError, "7.0.0.3")).statusCode, 400);
});

test("cleanResult: 이상한 입력에도 죽지 않음", () => {
  assert.deepEqual(cleanResult(null), { items: [], notes: "" });
  assert.deepEqual(cleanResult({ items: "x" }), { items: [], notes: "" });
  assert.equal(cleanResult({ items: Array(20).fill({ name: "a", kind: "bed" }) }).items.length, 8);
});
