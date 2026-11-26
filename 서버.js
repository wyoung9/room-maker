/*
  방 만들기 — 로컬 웹 서버
  이 컴퓨터 안에서만 접속할 수 있는 작은 서버입니다. (다른 사람은 들어올 수 없어요)

  켜는 법 : 「사이트_열기.bat」 더블클릭  (또는 터미널에서  node 서버.js --open)
  끄는 법 : 서버 창(검은 창)을 닫거나, 그 창에서 Ctrl + C
  주소    : http://localhost:8080  (8080이 이미 쓰이고 있으면 8081, 8082 … 로 바뀝니다)

  「AI로 읽기」를 이 컴퓨터에서 시험하려면 같은 폴더에 .env.local 파일을 만들고
  OPENAI_API_KEY=여기에_키 한 줄을 적으세요. (이 파일은 GitHub에 올라가지 않고, 사이트로도 보이지 않습니다.)
  배포된 사이트의 키는 Vercel 설정 화면에서 따로 넣습니다.
*/
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { exec } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = path.dirname(fileURLToPath(import.meta.url));   // 이 파일이 있는 폴더 = 사이트 폴더
const START_PORT = Number(process.env.PORT) || 8080;
const OPEN_BROWSER = process.argv.includes("--open");
const MAX_BODY = 4_500_000;                                  // 배포 서버(Vercel)와 같은 요청 크기 상한

// .env.local 읽기 (이미 설정된 환경 변수는 덮어쓰지 않음)
function loadEnvFile(file) {
  let text;
  try { text = fs.readFileSync(file, "utf8"); } catch { return; }
  for (const line of text.split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/);
    if (!m || line.trim().startsWith("#")) continue;
    const value = m[2].replace(/^(['"])(.*)\1$/, "$2");
    if (process.env[m[1]] === undefined) process.env[m[1]] = value;
  }
}
loadEnvFile(path.join(ROOT, ".env.local"));

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css":  "text/css; charset=utf-8",
  ".js":   "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".md":   "text/plain; charset=utf-8",
  ".png":  "image/png",
  ".jpg":  "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg":  "image/svg+xml",
  ".ico":  "image/x-icon"
};
// 사이트에 보여 주지 않을 파일·폴더 (특히 .env* 는 키가 들어 있을 수 있어 반드시 숨김)
const HIDDEN = [
  /^\.claude(\/|$)/, /^\.git(\/|$)/, /^\.env/, /^\.vercel(\/|$)/,
  /^node_modules(\/|$)/, /^api(\/|$)/, /^tests(\/|$)/, /^package(-lock)?\.json$/,
  /^서버\.js$/, /\.bat$/i, /\.md$/i                       // .md = PRD·사용법 같은 내부 문서
];

// AI 요청 길: 주소 → 서버 함수 파일 (배포 서버에서는 api/ 폴더가 자동으로 이 역할을 함)
const API_ROUTES = { "/api/read-furniture": path.join(ROOT, "api", "read-furniture.js") };

function send(res, code, text) {
  res.writeHead(code, { "Content-Type": "text/plain; charset=utf-8" });
  res.end(text);
}
function sendJson(res, code, obj) {
  res.writeHead(code, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" });
  res.end(JSON.stringify(obj));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = []; let size = 0;
    req.on("data", (c) => {
      size += c.length;
      if (size > MAX_BODY) { reject(Object.assign(new Error("too big"), { code: "TOO_BIG" })); req.destroy(); return; }
      chunks.push(c);
    });
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });
}

async function runApi(file, req, res) {
  try {
    if (req.method === "POST") {
      const raw = await readBody(req);
      if (/application\/json/i.test(req.headers["content-type"] || "")) {
        try { req.body = JSON.parse(raw); } catch { req.body = null; }
      } else req.body = raw;
    }
    // 파일을 고치고 서버를 다시 켜지 않아도 바로 반영되도록 매번 새로 불러옴
    const mod = await import(pathToFileURL(file).href + "?t=" + Date.now());
    await mod.default(req, res);
  } catch (err) {
    if (err && err.code === "TOO_BIG") return sendJson(res, 413, { error: "too_big", message: "사진이 너무 커요. 더 작은 사진으로 해 주세요." });
    console.error("API 오류:", err && err.message);
    if (!res.headersSent) sendJson(res, 500, { error: "server_error", message: "서버에서 문제가 생겼어요." });
  }
}

const server = http.createServer((req, res) => {
  let urlPath;
  try { urlPath = decodeURIComponent(req.url.split("?")[0]); }
  catch (e) { return send(res, 400, "잘못된 주소예요."); }

  if (API_ROUTES[urlPath]) return runApi(API_ROUTES[urlPath], req, res);

  if (urlPath.endsWith("/")) urlPath += "index.html";
  const rel = path.normalize(urlPath).replace(/^[\\/]+/, "").replace(/\\/g, "/");
  const file = path.join(ROOT, rel);
  if (!file.startsWith(ROOT) || HIDDEN.some((r) => r.test(rel))) return send(res, 404, "페이지를 찾을 수 없어요.");

  fs.readFile(file, (err, data) => {
    if (err) return send(res, 404, "페이지를 찾을 수 없어요: " + urlPath);
    res.writeHead(200, {
      "Content-Type": TYPES[path.extname(file).toLowerCase()] || "application/octet-stream",
      "Cache-Control": "no-store"                        // 파일을 고치면 새로고침 한 번으로 바로 보이게
    });
    res.end(data);
  });
});

function listen(port) {
  server.once("error", (err) => {
    if (err.code === "EADDRINUSE" && port < START_PORT + 20) return listen(port + 1);
    console.error("서버를 켜지 못했어요:", err.message);
    process.exit(1);
  });
  server.listen(port, "127.0.0.1", () => {
    const url = "http://localhost:" + port;
    console.log("");
    console.log("  방 만들기 사이트가 켜졌어요 →  " + url);
    console.log("  AI로 읽기: " + (process.env.OPENAI_API_KEY ? "켜짐 (키를 찾았어요)" : "꺼짐 (키 없음 — 직접 적는 방식은 그대로 쓸 수 있어요)"));
    console.log("  끄려면 이 창을 닫거나 Ctrl + C 를 누르세요.");
    console.log("");
    if (OPEN_BROWSER) {
      const cmd = process.platform === "win32" ? 'start "" "' + url + '"'
                : process.platform === "darwin" ? 'open "' + url + '"' : 'xdg-open "' + url + '"';
      exec(cmd);
    }
  });
}
listen(START_PORT);
