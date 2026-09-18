/* 샤츠 — store.js. 사용자 업로드 저장: IndexedDB(yeogido/photos: blob) + localStorage(yeogido.user: 메타). */
/* IndexedDB 가 안 되면 메모리만 쓰고 조용히 진행한다(PRD 11). */

var STORE_DB = "yeogido";
var STORE_PHOTOS = "photos";
var STORE_META_KEY = "yeogido.user";

var Store = (function () {
  var dbPromise = null;
  var memoryBlobs = {};

  function openDb() {
    if (dbPromise) return dbPromise;
    dbPromise = new Promise(function (resolve) {
      try {
        if (!window.indexedDB) return resolve(null);
        var req = window.indexedDB.open(STORE_DB, 1);
        req.onupgradeneeded = function () {
          var db = req.result;
          if (!db.objectStoreNames.contains(STORE_PHOTOS)) db.createObjectStore(STORE_PHOTOS, { keyPath: "id" });
        };
        req.onsuccess = function () { resolve(req.result); };
        req.onerror = function () { resolve(null); };
        req.onblocked = function () { resolve(null); };
      } catch (_) { resolve(null); }
    });
    return dbPromise;
  }

  function putBlob(id, blob) {
    memoryBlobs[id] = blob;
    return openDb().then(function (db) {
      if (!db) return false;
      return new Promise(function (resolve) {
        try {
          var tx = db.transaction(STORE_PHOTOS, "readwrite");
          tx.objectStore(STORE_PHOTOS).put({ id: id, blob: blob });
          tx.oncomplete = function () { resolve(true); };
          tx.onerror = function () { resolve(false); };
          tx.onabort = function () { resolve(false); };
        } catch (_) { resolve(false); }
      });
    });
  }

  function getBlob(id) {
    if (memoryBlobs[id]) return Promise.resolve(memoryBlobs[id]);
    return openDb().then(function (db) {
      if (!db) return null;
      return new Promise(function (resolve) {
        try {
          var tx = db.transaction(STORE_PHOTOS, "readonly");
          var req = tx.objectStore(STORE_PHOTOS).get(id);
          req.onsuccess = function () { resolve(req.result ? req.result.blob : null); };
          req.onerror = function () { resolve(null); };
        } catch (_) { resolve(null); }
      });
    });
  }

  function loadMeta() {
    try {
      var raw = window.localStorage.getItem(STORE_META_KEY);
      var arr = raw ? JSON.parse(raw) : [];
      return Array.isArray(arr) ? arr : [];
    } catch (_) { return []; }
  }

  function saveMeta(list) {
    try { window.localStorage.setItem(STORE_META_KEY, JSON.stringify(list)); return true; }
    catch (_) { return false; }
  }

  function addMeta(meta) {
    var list = loadMeta().filter(function (m) { return m.id !== meta.id; });
    list.push(meta);
    return saveMeta(list);
  }

  return { putBlob: putBlob, getBlob: getBlob, loadMeta: loadMeta, saveMeta: saveMeta, addMeta: addMeta };
})();
