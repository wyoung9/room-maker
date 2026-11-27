/* 방 만들기 — 앱 설치 (PWA)
   ● 오프라인 기능(sw.js)을 등록하고, 바닥글에 「앱으로 설치」 버튼을 넣어요.
   ● 이미 앱으로 열었을 때(설치된 상태)는 버튼을 보이지 않아요. */
(function () {
  "use strict";
  if ("serviceWorker" in navigator && (location.protocol === "https:" || location.hostname === "localhost")) {
    window.addEventListener("load", function () { navigator.serviceWorker.register("/sw.js").catch(function () {}); });
  }
  var standalone = (window.matchMedia && matchMedia("(display-mode: standalone)").matches) || navigator.standalone === true;
  if (standalone || !window.I18N) return;

  var deferred = null, btn = null;
  window.addEventListener("beforeinstallprompt", function (e) { e.preventDefault(); deferred = e; });   // 안드로이드·컴퓨터 크롬: 설치 창을 직접 띄울 수 있음
  window.addEventListener("appinstalled", function () { deferred = null; if (btn) btn.hidden = true; });

  var host = (window.matchMedia && matchMedia("(max-width: 760px)").matches && document.getElementById("installHost")) || document.querySelector(".footer");   // 휴대폰 배치 화면: 더보기 시트 안
  if (!host) return;
  btn = document.createElement("button");
  btn.type = "button"; btn.className = "install-btn";
  function label() { btn.textContent = I18N.t("app.install"); }
  label(); I18N.onChange(label);
  btn.addEventListener("click", async function () {
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
