/* 방 만들기 — 로그인 표시
   ● 모든 페이지 위쪽(언어 버튼 왼쪽)에 「로그인」 또는 「👤 test」 링크를 넣어요. 누르면 로그인 페이지로 가요.
   ● 로그인 여부는 서버(/api/login)에 물어봐요. (로그인 쿠키는 브라우저 코드가 읽을 수 없게 숨겨 둔 것이라서요)
   ● 서버를 못 부르는 환경(파일로 바로 열기 등)에서는 조용히 「로그인」으로 보여요. */
(function () {
  "use strict";
  if (!window.I18N) return;
  var host = document.querySelector(".top-right");
  if (!host) return;
  var chip = document.createElement("a");
  chip.className = "acct"; chip.href = "/%EB%A1%9C%EA%B7%B8%EC%9D%B8.html";       // 로그인.html
  var user = null;
  function paint() {
    chip.textContent = user ? "👤 " + user : I18N.t("au.chip");
    chip.title = user ? I18N.t("au.chipTitle") : "";
    chip.className = "acct" + (user ? " on" : "");
  }
  var lang = host.querySelector(".lang");
  if (lang) host.insertBefore(chip, lang); else host.appendChild(chip);
  function refresh() {
    return fetch("/api/login").then(function (r) { return r.ok ? r.json() : null; })
      .then(function (s) { user = s && s.loggedIn ? s.user : null; paint(); })
      .catch(function () { user = null; paint(); });
  }
  window.RM_AUTH = { refresh: refresh, get user() { return user; } };
  paint(); refresh();
  I18N.onChange(paint);
})();

/* 바닥글 맨 끝에 작은 「서비스 소개서」 링크 (소개서.html). 각 페이지 파일은 고치지 않고 여기서 넣어요. */
(function () {
  "use strict";
  var footer = document.querySelector(".footer");
  if (!footer || !window.I18N || footer.querySelector(".intro-link")) return;
  var link = document.createElement("a");
  link.className = "intro-link"; link.href = "/%EC%86%8C%EA%B0%9C%EC%84%9C.html";           // 소개서.html
  link.style.cssText = "font-size:12px;color:inherit;opacity:.85;text-decoration:underline;white-space:nowrap";
  function paint() { link.textContent = I18N.t("intro.link"); }
  paint(); I18N.onChange(paint);
  footer.appendChild(link);
})();
