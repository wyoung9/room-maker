/* 방 만들기 — 오프라인 기능 (서비스 워커)
   ● 한 번 열어 본 화면은 인터넷이 끊겨도 열려요. (가구 배치·자동 배치는 인터넷 없이도 돼요)
   ● AI 기능(/api/...)은 인터넷이 꼭 필요해서 저장하지 않아요.
   ● 인터넷이 될 때는 항상 최신 파일을 먼저 받아 와서, 사이트를 고치면 앱도 같이 바뀌어요.
   ● 캐시를 비우고 싶으면 아래 CACHE 이름의 숫자를 올리세요. */
const CACHE = "roommaker-v2";
const CORE = [
  "/", "/index.html", "/%EB%B0%B0%EC%B9%98.html", "/%EC%A7%91%EB%8F%84%EB%A9%B4.html", "/%EB%A0%8C%EB%8D%94%EC%8B%A0%EC%B2%AD.html",
  "/%EA%B3%B5%ED%86%B5.css", "/%EC%84%A4%EC%A0%95.js", "/i18n.js", "/pwa.js", "/auth.js", "/%EB%A1%9C%EA%B7%B8%EC%9D%B8.html", "/manifest.webmanifest",
  "/icons/icon-192.png", "/icons/icon-512.png", "/icons/apple-touch-icon.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((c) => c.addAll(CORE)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

function timeout(ms) { return new Promise((_, reject) => setTimeout(() => reject(new Error("timeout")), ms)); }

self.addEventListener("fetch", (event) => {
  const req = event.request;
  const url = new URL(req.url);
  if (req.method !== "GET" || url.origin !== self.location.origin) return;     // 다른 사이트(글꼴 등)는 건드리지 않음
  if (url.pathname.startsWith("/api/")) return;                                 // AI 요청은 저장하지 않음
  event.respondWith(
    Promise.race([fetch(req), timeout(6000)])                                   // 인터넷이 되면 최신 파일 (6초 넘게 걸리면 저장본)
      .then((res) => {
        if (res && res.ok) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req, copy)); }
        return res;
      })
      .catch(() => caches.match(req, { ignoreSearch: true }).then((hit) =>
        hit || (req.mode === "navigate" ? caches.match("/index.html") : Response.error())))
  );
});
