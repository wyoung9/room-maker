/*
  방 만들기 — 로컬 웹 서버
  이 컴퓨터 안에서만 접속할 수 있는 작은 서버입니다. (다른 사람은 들어올 수 없어요)

  켜는 법 : 「사이트_열기.bat」 더블클릭  (또는 터미널에서  node 서버.js --open)
  끄는 법 : 서버 창(검은 창)을 닫거나, 그 창에서 Ctrl + C
  주소    : http://localhost:8080  (8080이 이미 쓰이고 있으면 8081, 8082 … 로 바뀝니다)
*/
const http = require("http");
const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");

const ROOT = __dirname;                                  // 이 파일이 있는 폴더 = 사이트 폴더
const START_PORT = Number(process.env.PORT) || 8080;
const OPEN_BROWSER = process.argv.includes("--open");

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
// 사이트에 보여 주지 않을 파일·폴더
const HIDDEN = [/^\.claude(\/|$)/, /^서버\.js$/, /\.bat$/i, /\.md$/i];   // .md = PRD·사용법 같은 내부 문서

function send(res, code, text) {
  res.writeHead(code, { "Content-Type": "text/plain; charset=utf-8" });
  res.end(text);
}

const server = http.createServer((req, res) => {
  let urlPath;
  try { urlPath = decodeURIComponent(req.url.split("?")[0]); }
  catch (e) { return send(res, 400, "잘못된 주소예요."); }
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
