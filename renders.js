/* 방 만들기 — 내가 만든 렌더 이미지 보관함
   ● AI 렌더로 만든 이미지를 이 기기의 브라우저(IndexedDB)에 저장해서, 나중에 「내 렌더」에서 다시 보고 내려받을 수 있게 해요.
   ● 서버에는 저장하지 않아요. (다른 기기에서는 안 보이고, 브라우저 데이터를 지우면 사라져요)
   ● 최대 MAX 장까지 보관하고, 넘으면 가장 오래된 것부터 지워요.
   ● 쓰는 법:  RenderStore.add({...}) · RenderStore.list() · RenderStore.remove(id) · RenderStore.clear() (모두 Promise) */
(function () {
  "use strict";
  var DB_NAME = "roommaker", STORE = "renders", MAX = 40;

  function open() {
    return new Promise(function (resolve, reject) {
      if (!window.indexedDB) { reject(new Error("no_idb")); return; }
      var req;
      try { req = indexedDB.open(DB_NAME, 1); } catch (e) { reject(e); return; }
      req.onupgradeneeded = function () { req.result.createObjectStore(STORE, { keyPath: "id" }); };
      req.onsuccess = function () { resolve(req.result); };
      req.onerror = function () { reject(req.error || new Error("idb_error")); };
      req.onblocked = function () { reject(new Error("idb_blocked")); };
    });
  }
  function wrap(request) {
    return new Promise(function (resolve, reject) {
      request.onsuccess = function () { resolve(request.result); };
      request.onerror = function () { reject(request.error); };
    });
  }
  // 한 번의 작업(트랜잭션)이 끝까지 성공했을 때만 결과를 돌려줌
  async function withStore(mode, fn) {
    var db = await open();
    try {
      var tx = db.transaction(STORE, mode);
      var done = new Promise(function (resolve, reject) {
        tx.oncomplete = resolve;
        tx.onerror = function () { reject(tx.error); };
        tx.onabort = function () { reject(tx.error || new Error("aborted")); };
      });
      var out = await fn(tx.objectStore(STORE));
      await done;
      return out;
    } finally { db.close(); }
  }
  function toBlob(b64, mime) {
    var bin = atob(b64), bytes = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return new Blob([bytes], { type: mime || "image/jpeg" });
  }

  var persistAsked = false;
  function askPersist() {                          // 저장 공간이 모자라도 브라우저가 함부로 지우지 않게 부탁 (안 받아 줘도 괜찮아요)
    if (persistAsked) return; persistAsked = true;
    try { if (navigator.storage && navigator.storage.persist) navigator.storage.persist(); } catch (e) {}
  }

  window.RenderStore = {
    max: MAX,
    supported: !!window.indexedDB,
    // rec: { image: {mime, data(base64)}, style, styleText, room: {w,h}, names: [가구 이름…], recs: [{name,color,w,h,query}…] }
    add: async function (rec) {
      askPersist();
      var item = {
        id: Date.now() + "-" + Math.random().toString(36).slice(2, 8),
        createdAt: Date.now(),
        blob: toBlob(rec.image.data, rec.image.mime),
        style: String(rec.style || ""), styleText: String(rec.styleText || "").slice(0, 40),
        room: rec.room ? { w: Number(rec.room.w) || 0, h: Number(rec.room.h) || 0 } : null,
        names: (rec.names || []).slice(0, 30).map(function (n) { return String(n).slice(0, 20); }),
        recs: (rec.recs || []).slice(0, 10).map(function (r) {
          return { name: String(r.name).slice(0, 20), color: r.color || "", w: Number(r.w) || 0, h: Number(r.h) || 0, query: String(r.query).slice(0, 80) };
        })
      };
      await withStore("readwrite", async function (store) {
        await wrap(store.put(item));
        var all = await wrap(store.getAll());                       // 넘치면 가장 오래된 것부터 지움
        all.sort(function (a, b) { return b.createdAt - a.createdAt; });
        for (var i = MAX; i < all.length; i++) await wrap(store.delete(all[i].id));
      });
      return item.id;
    },
    list: async function () {
      var all = await withStore("readonly", function (store) { return wrap(store.getAll()); });
      return all.sort(function (a, b) { return b.createdAt - a.createdAt; });          // 최신이 먼저
    },
    remove: function (id) { return withStore("readwrite", function (store) { return wrap(store.delete(id)); }); },
    clear: function () { return withStore("readwrite", function (store) { return wrap(store.clear()); }); }
  };
})();
