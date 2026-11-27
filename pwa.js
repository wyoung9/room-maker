/* 방 만들기 — 앱 설치 (PWA)
   ● 오프라인 기능(sw.js)을 등록하고, 바닥글에 「앱으로 설치」 버튼을 넣어요.
   ● 이미 앱으로 열었을 때(설치된 상태)는 버튼을 보이지 않아요. */
(function () {
  "use strict";
  // 앱 바: 로고(‹ 방 만들기)를 누르면 앱 홈으로 — 앱처럼 쓰는 화면(body.app)에서 휴대폰 폭일 때만
  var logo = document.querySelector(".logo");
  if (logo && document.body.classList.contains("app") && !document.body.classList.contains("home") && window.matchMedia && matchMedia("(max-width: 760px)").matches) {
    logo.setAttribute("href", "/%ED%99%88.html");
  }
  if ("serviceWorker" in navigator && (location.protocol === "https:" || location.hostname === "localhost")) {
    window.addEventListener("load", function () { navigator.serviceWorker.register("/sw.js").catch(function () {}); });
  }
  // 설치용 앱 주소: 웹사이트에서 「앱으로 설치」를 누르면 이 주소로 이동해요. (이미 이 주소에 있거나, 내 컴퓨터(localhost)에서 시험 중이면 이동하지 않고 그 자리에서 설치해요)
  var APP_URL = "https://room-maker-app-rho.vercel.app/";
  function installTarget(hostname) {
    var appHost; try { appHost = new URL(APP_URL).hostname; } catch (e) { return null; }
    if (!hostname || hostname === appHost || hostname === "localhost" || hostname === "127.0.0.1") return null;
    return APP_URL;
  }
  window.RM_PWA = { installTarget: installTarget, appUrl: APP_URL };

  var standalone = (window.matchMedia && matchMedia("(display-mode: standalone)").matches) || navigator.standalone === true;
  if (standalone || !window.I18N) return;

  var deferred = null, btn = null;
  window.addEventListener("beforeinstallprompt", function (e) { e.preventDefault(); deferred = e; });   // 안드로이드·컴퓨터 크롬: 설치 창을 직접 띄울 수 있음
  window.addEventListener("appinstalled", function () { deferred = null; if (btn) btn.hidden = true; });

  var host = (document.body.classList.contains("home") && document.getElementById("installHost")) ||
             (window.matchMedia && matchMedia("(max-width: 760px)").matches && document.getElementById("installHost")) || document.querySelector(".footer");   // 휴대폰 배치 화면: 더보기 시트 안
  if (!host) return;
  btn = document.createElement("button");
  btn.type = "button"; btn.className = "install-btn";
  function label() { btn.textContent = I18N.t("app.install"); }
  label(); I18N.onChange(label);
  btn.addEventListener("click", async function () {
    var target = installTarget(location.hostname);
    if (target) { location.href = target; return; }                                  // 웹사이트 → 앱 주소로 이동
    if (deferred) {
      deferred.prompt();
      try { await deferred.userChoice; } catch (e) {}
      deferred = null;
      return;
    }
    var ua = navigator.userAgent || "";
    var ios = /iphone|ipad|ipod/i.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);   // 아이폰·아이패드는 설치 창이 없어서 방법을 안내
    alert(I18N.t(ios ? "app.helpIos" : "app.helpOther"));
  });
  host.appendChild(btn);
})();
