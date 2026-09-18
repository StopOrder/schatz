/* 샤츠 — upload.js. 「내 사진 올리기」: 파일 → exifr(GPS·DateTimeOriginal·GPSImgDirection) → 핀 또는 수동 배치. */
/* app.js 의 App.addUserSpot / App.enterManualPlace 를 호출한다(스크립트 로드 후 호출되므로 순서 무관). */

var Upload = (function () {
  var seq = 0;

  function newId() {
    seq += 1;
    return "user-" + Date.now().toString(36) + "-" + seq;
  }

  /** File → { lat, lng, takenAt, heading } (없으면 null 필드). 파싱 실패도 null 로 돌려 수동 배치로 보낸다. */
  function readExif(file) {
    var out = { lat: null, lng: null, takenAt: null, heading: null };
    if (typeof exifr === "undefined") return Promise.resolve(out);
    var pGps = exifr.gps(file).then(function (g) {
      if (g && isFinite(g.latitude) && isFinite(g.longitude)) { out.lat = g.latitude; out.lng = g.longitude; }
    }).catch(function () {});
    var pTags = exifr.parse(file, { pick: ["DateTimeOriginal", "GPSImgDirection"] }).then(function (t) {
      if (!t) return;
      if (t.DateTimeOriginal instanceof Date && !isNaN(t.DateTimeOriginal)) out.takenAt = t.DateTimeOriginal.toISOString();
      else if (typeof t.DateTimeOriginal === "string") { var d = new Date(t.DateTimeOriginal.replace(/^(\d{4}):(\d{2}):(\d{2})/, "$1-$2-$3")); if (!isNaN(d)) out.takenAt = d.toISOString(); }
      if (isFinite(t.GPSImgDirection)) out.heading = Number(t.GPSImgDirection);
    }).catch(function () {});
    return Promise.all([pGps, pTags]).then(function () { return out; });
  }

  /** 파일 하나 처리. 좌표 있으면 바로 핀, 없으면 수동 배치 모드로. */
  function handleFile(file) {
    if (!file) return Promise.resolve();
    var isJpeg = /jpe?g$/i.test(file.name || "") || file.type === "image/jpeg";
    var pending = { id: newId(), file: file, exif: null };
    if (!isJpeg) {
      pending.exif = { lat: null, lng: null, takenAt: null, heading: null };
      App.enterManualPlace(pending, "이 파일은 위치를 읽을 수 없어요(JPG만 가능). 지도를 눌러 자리를 정해 주세요");
      return Promise.resolve();
    }
    return readExif(file).then(function (exif) {
      pending.exif = exif;
      if (exif.lat !== null && exif.lng !== null) return App.addUserSpot(pending, { lat: exif.lat, lng: exif.lng });
      App.enterManualPlace(pending, "위치 정보가 없어요. 지도를 눌러 자리를 정해 주세요");
    });
  }

  function bind(input, button) {
    if (button) button.addEventListener("click", function () { input.click(); });
    input.addEventListener("change", function () {
      var file = input.files && input.files[0];
      handleFile(file).then(function () { input.value = ""; });
    });
  }

  return { bind: bind, handleFile: handleFile, readExif: readExif };
})();
