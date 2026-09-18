/* 샤츠(Schatz) — app.js. 정적 스크립트(모듈 아님). file:// 에서 동작. */
/* 좌표 상수는 이 파일의 FAMOUS(유명 스팟)·REGIONS(지역표)만. 나머지 데이터는 seed/. */
/* scripts/build-seed.mjs 도 이 파일을 vm 으로 읽어 두 표와 지오 함수를 재사용한다. */

var APP_NAME = "샤츠";

// 6.1 유명 스팟 — id, name, lat, lng, line(왜 몰리나). 순서 = 같은 지역 안에서 칩 우선순위(동률 시).
var FAMOUS = [
  { id: "homigot", name: "호미곶 상생의 손", lat: 36.0761, lng: 129.5686, line: "새해 첫 해 보러 전국이 손 앞에 줄을 선다" },
  { id: "seongsan", name: "성산일출봉", lat: 33.4587, lng: 126.9425, line: "제주 왔으면 한 번은 올라야 한다는 그 계단" },
  { id: "seopjikoji", name: "섭지코지", lat: 33.4240, lng: 126.9300, line: "드라마 촬영지라서 사진 줄이 끝이 없다" },
  { id: "hyeopjae", name: "협재해수욕장", lat: 33.3940, lng: 126.2396, line: "에메랄드 바다 사진은 다 여기서 나온다" },
  { id: "cheonjiyeon", name: "천지연폭포", lat: 33.2470, lng: 126.5590, line: "서귀포 관광버스가 반드시 서는 곳" },
  { id: "haeundae", name: "해운대 해수욕장", lat: 35.1587, lng: 129.1604, line: "여름이면 파라솔이 모래보다 많다" },
  { id: "gamcheon", name: "감천문화마을", lat: 35.0975, lng: 129.0107, line: "어린 왕자 옆자리 한 장에 30분 대기" },
  { id: "gwangalli", name: "광안리 해수욕장", lat: 35.1532, lng: 129.1187, line: "광안대교 야경 앵글은 모두 똑같다" },
  { id: "gyeongbokgung", name: "경복궁", lat: 37.5796, lng: 126.9770, line: "한복 대여점 앞부터 이미 인파" },
  { id: "namsan", name: "N서울타워", lat: 37.5512, lng: 126.9882, line: "자물쇠 앞 셀카 줄이 케이블카보다 길다" },
  { id: "bulguksa", name: "불국사", lat: 35.7900, lng: 129.3320, line: "수학여행 단체 사진의 성지" },
  { id: "donggung", name: "동궁과 월지", lat: 35.8347, lng: 129.2266, line: "야경 반영 사진 자리는 삼각대 전쟁" },
  { id: "gyeongpo", name: "경포해변", lat: 37.8055, lng: 128.9080, line: "강릉 오면 무조건 여기서 인증샷" },
  { id: "jeongdongjin", name: "정동진", lat: 37.6906, lng: 129.0339, line: "기차역 모래시계 앞에서 다 똑같은 포즈" },
  { id: "jeonju-hanok", name: "전주 한옥마을", lat: 35.8150, lng: 127.1530, line: "한복·꼬치·인파, 주말엔 걷기도 힘들다" },
  { id: "namiseom", name: "남이섬", lat: 37.7900, lng: 127.5257, line: "메타세쿼이아 길 한 컷에 배 한 척이 몰린다" },
  { id: "ulsanbawi", name: "설악산 울산바위", lat: 38.1745, lng: 128.4665, line: "케이블카 표가 아침에 매진된다" },
  { id: "daewangam", name: "대왕암공원", lat: 35.4924, lng: 129.4375, line: "울산 일출 사진은 다 이 바위" },
  { id: "odongdo", name: "여수 오동도", lat: 34.7440, lng: 127.7660, line: "동백꽃 시즌엔 다리 위가 정체" },
  { id: "dongpirang", name: "통영 동피랑", lat: 34.8447, lng: 128.4262, line: "벽화 앞 사진 순서 기다리기" },
  { id: "hahoe", name: "안동 하회마을", lat: 36.5390, lng: 128.5180, line: "관광버스 시간표대로 사람이 쏟아진다" },
  { id: "suncheonbay", name: "순천만 국가정원", lat: 34.9300, lng: 127.5000, line: "튤립 시즌 주차장부터 만차" },
  { id: "wolmido", name: "월미도", lat: 37.4753, lng: 126.5975, line: "바이킹과 갈매기 새우깡 사진 한 장" },
  { id: "damyang-meta", name: "담양 메타세쿼이아길", lat: 35.3255, lng: 126.9990, line: "길 한가운데 서려면 앞사람 빠지길 기다린다" },
  { id: "boseong-tea", name: "보성 녹차밭", lat: 34.7150, lng: 127.0815, line: "계단식 녹차밭 그 앵글에 전국이 몰린다" }
];

// 6.3 지역표 — slug, name, lat, lng. 경북·경남·부산·대구·울산·강원 동해안은 시·군, 나머지는 시.
var REGIONS = [
  // 제주
  { slug: "jeju", name: "제주", lat: 33.4996, lng: 126.5312 },
  { slug: "seogwipo", name: "서귀포", lat: 33.2541, lng: 126.5601 },
  // 경북
  { slug: "pohang", name: "포항", lat: 36.0190, lng: 129.3435 },
  { slug: "gyeongju", name: "경주", lat: 35.8562, lng: 129.2247 },
  { slug: "gimcheon", name: "김천", lat: 36.1399, lng: 128.1137 },
  { slug: "andong", name: "안동", lat: 36.5684, lng: 128.7294 },
  { slug: "gumi", name: "구미", lat: 36.1195, lng: 128.3446 },
  { slug: "yeongju", name: "영주", lat: 36.8056, lng: 128.6240 },
  { slug: "yeongcheon", name: "영천", lat: 35.9733, lng: 128.9386 },
  { slug: "sangju", name: "상주", lat: 36.4109, lng: 128.1591 },
  { slug: "mungyeong", name: "문경", lat: 36.5866, lng: 128.1868 },
  { slug: "gyeongsan", name: "경산", lat: 35.8251, lng: 128.7414 },
  { slug: "gunwi", name: "군위", lat: 36.2429, lng: 128.5728 },
  { slug: "uiseong", name: "의성", lat: 36.3527, lng: 128.6970 },
  { slug: "cheongsong", name: "청송", lat: 36.4363, lng: 129.0572 },
  { slug: "yeongyang", name: "영양", lat: 36.6667, lng: 129.1124 },
  { slug: "yeongdeok", name: "영덕", lat: 36.4150, lng: 129.3653 },
  { slug: "cheongdo", name: "청도", lat: 35.6474, lng: 128.7340 },
  { slug: "goryeong", name: "고령", lat: 35.7261, lng: 128.2629 },
  { slug: "seongju", name: "성주", lat: 35.9191, lng: 128.2830 },
  { slug: "chilgok", name: "칠곡", lat: 35.9955, lng: 128.4017 },
  { slug: "yecheon", name: "예천", lat: 36.6577, lng: 128.4528 },
  { slug: "bonghwa", name: "봉화", lat: 36.8931, lng: 128.7325 },
  { slug: "uljin", name: "울진", lat: 36.9930, lng: 129.4005 },
  { slug: "ulleung", name: "울릉", lat: 37.4844, lng: 130.9058 },
  // 경남
  { slug: "changwon", name: "창원", lat: 35.2281, lng: 128.6811 },
  { slug: "jinju", name: "진주", lat: 35.1800, lng: 128.1076 },
  { slug: "tongyeong", name: "통영", lat: 34.8544, lng: 128.4331 },
  { slug: "sacheon", name: "사천", lat: 35.0036, lng: 128.0644 },
  { slug: "gimhae", name: "김해", lat: 35.2285, lng: 128.8894 },
  { slug: "miryang", name: "밀양", lat: 35.5038, lng: 128.7466 },
  { slug: "geoje", name: "거제", lat: 34.8806, lng: 128.6211 },
  { slug: "yangsan", name: "양산", lat: 35.3350, lng: 129.0372 },
  { slug: "uiryeong", name: "의령", lat: 35.3222, lng: 128.2617 },
  { slug: "haman", name: "함안", lat: 35.2724, lng: 128.4065 },
  { slug: "changnyeong", name: "창녕", lat: 35.5444, lng: 128.4923 },
  { slug: "goseong-gn", name: "고성(경남)", lat: 34.9730, lng: 128.3224 },
  { slug: "namhae", name: "남해", lat: 34.8375, lng: 127.8924 },
  { slug: "hadong", name: "하동", lat: 35.0673, lng: 127.7513 },
  { slug: "sancheong", name: "산청", lat: 35.4156, lng: 127.8735 },
  { slug: "hamyang", name: "함양", lat: 35.5205, lng: 127.7252 },
  { slug: "geochang", name: "거창", lat: 35.6866, lng: 127.9094 },
  { slug: "hapcheon", name: "합천", lat: 35.5666, lng: 128.1658 },
  // 부산·대구·울산
  { slug: "busan", name: "부산", lat: 35.1796, lng: 129.0756 },
  { slug: "daegu", name: "대구", lat: 35.8714, lng: 128.6014 },
  { slug: "ulsan", name: "울산", lat: 35.5384, lng: 129.3114 },
  // 강원
  { slug: "gangneung", name: "강릉", lat: 37.7519, lng: 128.8761 },
  { slug: "sokcho", name: "속초", lat: 38.2070, lng: 128.5918 },
  { slug: "donghae", name: "동해", lat: 37.5247, lng: 129.1143 },
  { slug: "samcheok", name: "삼척", lat: 37.4499, lng: 129.1651 },
  { slug: "goseong-gw", name: "고성(강원)", lat: 38.3806, lng: 128.4678 },
  { slug: "yangyang", name: "양양", lat: 38.0754, lng: 128.6189 },
  { slug: "chuncheon", name: "춘천", lat: 37.8813, lng: 127.7298 },
  { slug: "wonju", name: "원주", lat: 37.3422, lng: 127.9202 },
  { slug: "pyeongchang", name: "평창", lat: 37.3706, lng: 128.3903 },
  { slug: "jeongseon", name: "정선", lat: 37.3807, lng: 128.6608 },
  { slug: "taebaek", name: "태백", lat: 37.1640, lng: 128.9856 },
  { slug: "hongcheon", name: "홍천", lat: 37.6971, lng: 127.8887 },
  { slug: "inje", name: "인제", lat: 38.0695, lng: 128.1707 },
  { slug: "yeongwol", name: "영월", lat: 37.1837, lng: 128.4617 },
  // 수도권
  { slug: "seoul", name: "서울", lat: 37.5665, lng: 126.9780 },
  { slug: "incheon", name: "인천", lat: 37.4563, lng: 126.7052 },
  { slug: "suwon", name: "수원", lat: 37.2636, lng: 127.0286 },
  { slug: "yongin", name: "용인", lat: 37.2411, lng: 127.1776 },
  { slug: "seongnam", name: "성남", lat: 37.4200, lng: 127.1265 },
  { slug: "goyang", name: "고양", lat: 37.6584, lng: 126.8320 },
  { slug: "paju", name: "파주", lat: 37.7599, lng: 126.7800 },
  { slug: "gapyeong", name: "가평", lat: 37.8315, lng: 127.5095 },
  { slug: "yangpyeong", name: "양평", lat: 37.4917, lng: 127.4877 },
  // 충청
  { slug: "daejeon", name: "대전", lat: 36.3504, lng: 127.3845 },
  { slug: "sejong", name: "세종", lat: 36.4800, lng: 127.2890 },
  { slug: "cheongju", name: "청주", lat: 36.6424, lng: 127.4890 },
  { slug: "cheonan", name: "천안", lat: 36.8151, lng: 127.1139 },
  { slug: "gongju", name: "공주", lat: 36.4465, lng: 127.1190 },
  { slug: "boryeong", name: "보령", lat: 36.3333, lng: 126.6128 },
  { slug: "taean", name: "태안", lat: 36.7455, lng: 126.2980 },
  { slug: "chungju", name: "충주", lat: 36.9910, lng: 127.9259 },
  { slug: "danyang", name: "단양", lat: 36.9845, lng: 128.3656 },
  // 전라
  { slug: "gwangju", name: "광주", lat: 35.1595, lng: 126.8526 },
  { slug: "jeonju", name: "전주", lat: 35.8242, lng: 127.1480 },
  { slug: "gunsan", name: "군산", lat: 35.9676, lng: 126.7370 },
  { slug: "namwon", name: "남원", lat: 35.4164, lng: 127.3905 },
  { slug: "yeosu", name: "여수", lat: 34.7604, lng: 127.6622 },
  { slug: "suncheon", name: "순천", lat: 34.9507, lng: 127.4872 },
  { slug: "mokpo", name: "목포", lat: 34.8118, lng: 126.3922 },
  { slug: "damyang", name: "담양", lat: 35.3213, lng: 126.9880 },
  { slug: "boseong", name: "보성", lat: 34.7714, lng: 127.0800 },
  { slug: "haenam", name: "해남", lat: 34.5735, lng: 126.5990 },
  { slug: "wando", name: "완도", lat: 34.3110, lng: 126.7550 },
  { slug: "gangjin", name: "강진", lat: 34.6420, lng: 126.7670 }
];

// ---- 지오 유틸 (브라우저·빌드 스크립트 공용) ----

function haversineKm(a, b) {
  var R = 6371;
  var rad = function (d) { return (d * Math.PI) / 180; };
  var dLat = rad(b.lat - a.lat), dLng = rad(b.lng - a.lng);
  var s = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  return 2 * R * Math.asin(Math.sqrt(s));
}

function nearestOf(list, p) {
  var best = null, bestKm = Infinity;
  for (var i = 0; i < list.length; i++) {
    var km = haversineKm(list[i], p);
    if (km < bestKm) { bestKm = km; best = list[i]; }
  }
  return { item: best, km: bestKm };
}

function nearestRegion(p) { return nearestOf(REGIONS, p); }
function nearestFamous(p) { return nearestOf(FAMOUS, p); }

function formatKm(km) { return km.toFixed(1) + " km"; }

function headingLabel(deg) {
  if (deg === null || deg === undefined || isNaN(deg)) return null;
  var names = ["북", "북동", "동", "남동", "남", "남서", "서", "북서"];
  var idx = Math.round((((deg % 360) + 360) % 360) / 45) % 8;
  return names[idx] + " " + Math.round(deg) + "°";
}

function formatTakenAt(iso) {
  if (!iso) return "시각 정보 없음";
  var d = new Date(iso);
  if (isNaN(d.getTime())) return "시각 정보 없음";
  var p = function (n) { return (n < 10 ? "0" : "") + n; };
  return d.getFullYear() + "-" + p(d.getMonth() + 1) + "-" + p(d.getDate()) + " " + p(d.getHours()) + ":" + p(d.getMinutes());
}

// ---- 앱 (브라우저에서만) ----

var App = (function () {
  var map = null;
  var famousLayer = null, seedLayer = null, userLayer = null, overlayLayer = null;
  var famousMarkers = {}, spotMarkers = {};
  var userSpots = [];
  var state = { region: null, famousId: null, spotId: null, manual: null, query: "" };
  var $ = function (id) { return document.getElementById(id); };
  var RADIUS_KM = 30;
  var MAJOR_CITIES = ["seoul", "busan", "gangneung", "gyeongju", "pohang", "yeosu", "jeonju", "daegu", "incheon", "sokcho"];

  // ---- 데이터 ----
  function seedSpots() { return (window.SEED_SPOTS || []).map(function (s) { s.source = s.source || "seed"; return s; }); }
  function allSpots() { return seedSpots().concat(userSpots); }
  function spotById(id) { var all = allSpots(); for (var i = 0; i < all.length; i++) if (all[i].id === id) return all[i]; return null; }
  function famousById(id) { for (var i = 0; i < FAMOUS.length; i++) if (FAMOUS[i].id === id) return FAMOUS[i]; return null; }
  function regionBySlug(slug) { for (var i = 0; i < REGIONS.length; i++) if (REGIONS[i].slug === slug) return REGIONS[i]; return null; }
  function spotSrc(spot) { return spot.url || spot.file || ""; }
  function famousRegion(f) { if (!f._region) f._region = nearestRegion(f).item.slug; return f._region; }

  function byIdAsc(a, b) { return a.id < b.id ? -1 : a.id > b.id ? 1 : 0; }

  /** 지역별 사진 수. 데모 지역 = 최다(동률은 slug 순). */
  function regionCounts() {
    var counts = {};
    seedSpots().forEach(function (s) { counts[s.region] = (counts[s.region] || 0) + 1; });
    return counts;
  }
  function chipRegions() {
    var counts = regionCounts();
    var withPhotos = Object.keys(counts).sort(function (a, b) { return counts[b] - counts[a] || (a < b ? -1 : 1); });
    var out = [];
    withPhotos.concat(MAJOR_CITIES).forEach(function (slug) {
      if (out.length >= 8 || out.indexOf(slug) !== -1 || !regionBySlug(slug)) return;
      out.push(slug);
    });
    return out.map(regionBySlug);
  }
  function searchRegions(q) {
    q = (q || "").trim().toLowerCase();
    if (!q) return chipRegions();
    return REGIONS.filter(function (r) { return r.name.toLowerCase().indexOf(q) !== -1 || r.slug.indexOf(q) !== -1; }).slice(0, 8);
  }

  /** 유명 스팟 기준 근처 숨은 스팟: 30km 안 거리순, 없으면 최근접 3곳. 동률은 id 순(결정적). */
  function nearbyOf(f) {
    var rows = allSpots().map(function (s) { return { spot: s, km: haversineKm(f, s) }; });
    rows.sort(function (a, b) { return a.km - b.km || byIdAsc(a.spot, b.spot); });
    var within = rows.filter(function (r) { return r.km <= RADIUS_KM; });
    return { rows: within.length ? within : rows.slice(0, 3), within: within.length > 0 };
  }
  function famousInRegion(slug) {
    var list = FAMOUS.filter(function (f) { return famousRegion(f) === slug; });
    list.sort(function (a, b) {
      var na = nearbyOf(a).rows.filter(function (r) { return r.km <= RADIUS_KM; }).length;
      var nb = nearbyOf(b).rows.filter(function (r) { return r.km <= RADIUS_KM; }).length;
      return nb - na || FAMOUS.indexOf(a) - FAMOUS.indexOf(b);
    });
    return list;
  }
  function regionZoom(region) {
    var pts = FAMOUS.filter(function (f) { return famousRegion(f) === region.slug; })
      .concat(allSpots().filter(function (s) { return s.region === region.slug; }));
    var maxKm = 0;
    pts.forEach(function (p) { maxKm = Math.max(maxKm, haversineKm(region, p)); });
    if (maxKm < 5) return 12;
    if (maxKm < 11) return 11;
    if (maxKm < 22) return 10;
    if (maxKm < 45) return 9;
    return 8;
  }

  // ---- 지도·마커 ----
  function pinIcon(cls, testid, id, inner, size) {
    var html = '<div class="pin ' + cls + '" data-testid="' + testid + '" data-id="' + id + '">' + (inner || "") + "</div>";
    return L.divIcon({ className: "pin-wrap", html: html, iconSize: [size, size], iconAnchor: [size / 2, size / 2] });
  }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }

  function addFamousMarkers() {
    FAMOUS.forEach(function (f) {
      var m = L.marker([f.lat, f.lng], { icon: pinIcon("pin-famous", "famous-marker", f.id, '<span class="pin-label">' + esc(f.name) + "</span>", 18), title: f.name, zIndexOffset: 100 });
      m.on("click", function (e) { onMarkerClick(e, function () { selectFamous(f.id, true); }); });
      m.addTo(famousLayer);
      famousMarkers[f.id] = m;
    });
  }
  function addSpotMarker(spot, drop) {
    var isUser = spot.source === "user";
    var src = spotSrc(spot);
    var inner = src ? '<img src="' + esc(src) + '" alt="">' : "";
    var cls = (isUser ? "pin-user" : "pin-seed") + (src ? "" : " no-img") + (drop ? " drop" : "");
    var m = L.marker([spot.lat, spot.lng], { icon: pinIcon(cls, isUser ? "user-marker" : "seed-marker", spot.id, inner, 36), title: spot.name, zIndexOffset: isUser ? 300 : 200 });
    m.on("click", function (e) { onMarkerClick(e, function () { showDetail(spot.id); }); });
    m.addTo(isUser ? userLayer : seedLayer);
    spotMarkers[spot.id] = m;
    return m;
  }
  /** 수동 배치 모드면 마커 클릭도 그 자리 배치로 처리한다(Leaflet 마커 클릭은 지도로 안 올라온다). */
  function onMarkerClick(e, fn) {
    if (state.manual) { placeManual(e.latlng); return; }
    fn();
  }

  function centerWithOffset(latlng, zoom, dyPx) {
    var p = map.project(L.latLng(latlng), zoom);
    p.y += dyPx;
    return map.unproject(p, zoom);
  }
  /** 시트가 덮지 않는 지도 윗부분 가운데에 핀이 오도록, 지도 중심을 아래로 내릴 픽셀. */
  function sheetOffset(sheetId) {
    var mapEl = $("map"), sheet = $(sheetId);
    var mapH = mapEl.clientHeight;
    if (!sheet || sheet.classList.contains("hidden")) return 0;
    var mapTop = mapEl.getBoundingClientRect().top;
    // 슬라이드 애니메이션(transform) 중이어도 레이아웃 높이로 계산한다.
    var sheetTop = sheet.offsetParent.getBoundingClientRect().bottom - sheet.offsetHeight;
    var visible = Math.max(80, Math.min(mapH, sheetTop - mapTop));
    return Math.round(mapH / 2 - visible / 2);
  }

  function drawSector(spot) {
    overlayLayer.clearLayers();
    if (spot.heading === null || spot.heading === undefined) return;
    var r = 250, spread = 22, pts = [[spot.lat, spot.lng]];
    for (var b = spot.heading - spread; b <= spot.heading + spread; b += 4) {
      var rad = (b * Math.PI) / 180;
      pts.push([spot.lat + (r * Math.cos(rad)) / 111320, spot.lng + (r * Math.sin(rad)) / (111320 * Math.cos((spot.lat * Math.PI) / 180))]);
    }
    L.polygon(pts, { color: "#2f9e5b", weight: 1, fillColor: "#2f9e5b", fillOpacity: 0.35, interactive: false }).addTo(overlayLayer);
  }
  function drawRadius(f) {
    overlayLayer.clearLayers();
    L.circle([f.lat, f.lng], { radius: RADIUS_KM * 1000, color: "#d93b3b", weight: 1, dashArray: "4 6", fillColor: "#d93b3b", fillOpacity: 0.04, interactive: false }).addTo(overlayLayer);
  }
  function setSelected(id) {
    document.querySelectorAll(".pin.selected").forEach(function (el) { el.classList.remove("selected"); });
    if (!id) return;
    var el = document.querySelector('.pin[data-id="' + id + '"]');
    if (el) el.classList.add("selected");
  }

  // ---- 화면: 지역 ----
  function renderRegionChips() {
    var box = $("region-chips");
    box.innerHTML = "";
    var list = searchRegions(state.query);
    if (!list.length) { box.innerHTML = '<span class="chip chip-empty">일치하는 지역이 없어요</span>'; return; }
    list.forEach(function (r) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "chip" + (state.region === r.slug ? " active" : "");
      b.setAttribute("data-testid", "region-chip");
      b.setAttribute("data-region", r.slug);
      b.setAttribute("data-lat", r.lat);
      b.setAttribute("data-lng", r.lng);
      b.textContent = r.name;
      b.addEventListener("click", function () { selectRegion(r.slug); });
      box.appendChild(b);
    });
  }
  function renderFamousChips() {
    var box = $("famous-chips");
    box.innerHTML = "";
    if (!state.region) return;
    var region = regionBySlug(state.region);
    var list = famousInRegion(state.region);
    var fallback = false;
    if (!list.length) { list = [nearestFamous(region).item]; fallback = true; }
    list.forEach(function (f) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "chip chip-famous" + (state.famousId === f.id ? " active" : "");
      b.setAttribute("data-testid", "famous-chip");
      b.setAttribute("data-id", f.id);
      b.innerHTML = '<span class="tag">몰림</span>' + esc(f.name) + (fallback ? " · " + formatKm(haversineKm(region, f)) : "");
      b.addEventListener("click", function () { selectFamous(f.id, true); });
      box.appendChild(b);
    });
  }
  function selectRegion(slug) {
    var r = regionBySlug(slug);
    if (!r) return;
    state.region = slug; state.famousId = null;
    hideNearby(); hideDetail();
    $("region-title").textContent = r.name;
    $("region-head").classList.remove("hidden");
    renderRegionChips(); renderFamousChips();
    map.flyTo([r.lat, r.lng], regionZoom(r), { duration: 0.8 });
  }
  function clearRegion() {
    state.region = null; state.famousId = null;
    hideNearby(); hideDetail();
    $("region-head").classList.add("hidden");
    renderRegionChips();
    map.flyTo([36.3, 127.8], 7, { duration: 0.8 });
  }

  // ---- 화면: 여기 말고 여기 ----
  function selectFamous(id, fly) {
    var f = famousById(id);
    if (!f) return;
    state.famousId = id;
    if (!state.region || famousRegion(f) !== state.region) {
      state.region = famousRegion(f);
      $("region-title").textContent = regionBySlug(state.region).name;
      $("region-head").classList.remove("hidden");
      renderRegionChips();
    }
    renderFamousChips();
    hideDetail();
    renderNearby(f);
    drawRadius(f);
    setSelected(f.id);
    if (fly) map.flyTo(centerWithOffset([f.lat, f.lng], 11, sheetOffset("nearby-panel")), 11, { duration: 0.8 });
  }
  function renderNearby(f) {
    var res = nearbyOf(f);
    $("nearby-famous").textContent = "몰림 · " + f.name + " — " + f.line;
    $("nearby-title").textContent = "여기 말고 여기 · " + res.rows.length + "곳";
    $("nearby-note").textContent = res.within ? "반경 " + RADIUS_KM + "km 안, 가까운 순" : RADIUS_KM + "km 안에는 아직 없어요. 가장 가까운 " + res.rows.length + "곳";
    var box = $("nearby-items");
    box.innerHTML = "";
    res.rows.forEach(function (r) {
      var s = r.spot;
      var b = document.createElement("button");
      b.type = "button";
      b.className = "item";
      b.setAttribute("data-testid", "nearby-item");
      b.setAttribute("data-id", s.id);
      var head = headingLabel(s.heading);
      b.innerHTML = '<img class="thumb" src="' + esc(spotSrc(s)) + '" alt="">' +
        '<div class="item-body"><div class="item-name">' + esc(s.name) + "</div>" +
        '<div class="item-meta"><b>' + formatKm(r.km) + "</b>" + (head ? " · " + esc(head) : "") +
        (s.source === "user" ? ' · <span class="item-user">내 사진</span>' : "") + "</div></div>";
      b.addEventListener("click", function () { showDetail(s.id); });
      box.appendChild(b);
    });
    $("nearby-panel").classList.remove("hidden");
  }
  function hideNearby() {
    $("nearby-panel").classList.add("hidden");
    if (!state.spotId) overlayLayer.clearLayers();
    setSelected(state.spotId);
  }

  // ---- 화면: 상세 ----
  function showDetail(id, fly) {
    var s = spotById(id);
    if (!s) return;
    state.spotId = id;
    var nf = famousById(s.nearestFamous && s.nearestFamous.id) || nearestFamous(s).item;
    var km = s.nearestFamous && isFinite(s.nearestFamous.km) ? s.nearestFamous.km : haversineKm(nf, s);
    $("detail-name").textContent = s.name;
    var img = $("detail-img");
    img.src = spotSrc(s);
    $("detail-caption").textContent = s.caption || "";
    $("detail-taken").textContent = formatTakenAt(s.takenAt);
    var head = headingLabel(s.heading);
    $("detail-heading-row").classList.toggle("hidden", !head);
    $("detail-heading").textContent = head || "";
    $("detail-nearest").textContent = nf.name + "에서 " + formatKm(km);
    $("detail-coords").textContent = s.lat.toFixed(4) + ", " + s.lng.toFixed(4);
    $("spot-detail").classList.remove("hidden");
    drawSector(s);
    setSelected(s.id);
    var z = Math.max(map.getZoom(), 14);
    if (fly === false) return;
    map.flyTo(centerWithOffset([s.lat, s.lng], z, sheetOffset("spot-detail")), z, { duration: 0.8 });
  }
  function hideDetail() {
    state.spotId = null;
    $("spot-detail").classList.add("hidden");
    var f = state.famousId && famousById(state.famousId);
    if (f && !$("nearby-panel").classList.contains("hidden")) { drawRadius(f); setSelected(f.id); }
    else { overlayLayer.clearLayers(); setSelected(null); }
  }

  // ---- 업로드·저장 ----
  function toast(id, text) {
    var el = $(id);
    el.textContent = text;
    el.classList.remove("hidden");
  }
  function hideToast(id) { $(id).classList.add("hidden"); }
  var msgTimer = null;
  function flash(text) {
    toast("msg", text);
    if (msgTimer) clearTimeout(msgTimer);
    msgTimer = setTimeout(function () { hideToast("msg"); }, 3000);
  }

  function buildUserSpot(pending, p) {
    var region = nearestRegion(p).item;
    var nf = nearestFamous(p);
    var km = Math.round(nf.km * 10) / 10;
    var name = (pending.file && pending.file.name ? pending.file.name.replace(/\.[^.]+$/, "") : "내 사진");
    return {
      id: pending.id, file: null, name: name, lat: p.lat, lng: p.lng,
      takenAt: pending.exif ? pending.exif.takenAt : null,
      heading: pending.exif && isFinite(pending.exif.heading) ? pending.exif.heading : null,
      region: region.slug, nearestFamous: { id: nf.item.id, km: km },
      caption: region.name + " · " + nf.item.name + "에서 " + km + "km",
      source: "user", placed: pending.exif && pending.exif.lat !== null ? "exif" : "manual"
    };
  }
  /** 좌표가 정해진 업로드를 핀으로 박고 저장한 뒤 상세로. */
  function addUserSpot(pending, p) {
    var spot = buildUserSpot(pending, p);
    spot.url = URL.createObjectURL(pending.file);
    userSpots.push(spot);
    addSpotMarker(spot, true);
    var meta = {}; Object.keys(spot).forEach(function (k) { if (k !== "url") meta[k] = spot[k]; });
    Store.addMeta(meta);
    return Store.putBlob(spot.id, pending.file).then(function (ok) {
      if (!ok) flash("이 브라우저는 사진을 저장하지 못해요. 새로고침하면 사진만 사라져요.");
      if (state.region !== spot.region) { state.region = spot.region; state.famousId = null; $("region-title").textContent = nearestRegion(p).item.name; $("region-head").classList.remove("hidden"); renderRegionChips(); renderFamousChips(); }
      hideNearby();
      setTimeout(function () { showDetail(spot.id); }, 250);
    });
  }
  function enterManualPlace(pending, text) {
    state.manual = pending;
    toast("manual-place-hint", text);
    map.getContainer().classList.add("placing");
  }
  function placeManual(latlng) {
    var pending = state.manual;
    if (!pending) return;
    state.manual = null;
    hideToast("manual-place-hint");
    map.getContainer().classList.remove("placing");
    addUserSpot(pending, { lat: latlng.lat, lng: latlng.lng });
  }
  function restoreUserSpots() {
    var metas = Store.loadMeta();
    metas.sort(byIdAsc);
    return Promise.all(metas.map(function (m) {
      return Store.getBlob(m.id).then(function (blob) {
        var spot = {}; Object.keys(m).forEach(function (k) { spot[k] = m[k]; });
        spot.source = "user";
        spot.url = blob ? URL.createObjectURL(blob) : "";
        userSpots.push(spot);
        addSpotMarker(spot, false);
      });
    }));
  }

  // ---- 부트 ----
  function initMap() {
    L.Icon.Default.imagePath = "vendor/images/";
    map = L.map("map", { center: [36.3, 127.8], zoom: 7, zoomControl: false, attributionControl: true });
    L.control.zoom({ position: "topright" }).addTo(map);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19, subdomains: "abc", attribution: "© OpenStreetMap"
    }).addTo(map);
    overlayLayer = L.layerGroup().addTo(map);
    famousLayer = L.layerGroup().addTo(map);
    seedLayer = L.layerGroup().addTo(map);
    userLayer = L.layerGroup().addTo(map);
    map.on("click", function (e) { if (state.manual) placeManual(e.latlng); });
  }
  function bindUi() {
    $("region-back").addEventListener("click", clearRegion);
    $("nearby-close").addEventListener("click", function () { state.famousId = null; renderFamousChips(); hideNearby(); });
    $("detail-close").addEventListener("click", hideDetail);
    var search = $("region-search");
    search.addEventListener("input", function () { state.query = search.value; renderRegionChips(); });
    search.addEventListener("keydown", function (e) {
      if (e.key !== "Enter") return;
      var list = searchRegions(search.value);
      if (list.length) { selectRegion(list[0].slug); search.value = ""; state.query = ""; renderRegionChips(); search.blur(); }
    });
    Upload.bind($("upload-input"), $("upload-btn"));
    $("app-name").textContent = APP_NAME;
    document.title = APP_NAME + " — 유명한 데 말고, 여기도 예뻐요.";
  }
  function boot() {
    initMap();
    addFamousMarkers();
    seedSpots().forEach(function (s) { addSpotMarker(s, false); });
    renderRegionChips();
    bindUi();
    restoreUserSpots();
    window.__yeogido = {
      center: function () { var c = map.getCenter(); return { lat: c.lat, lng: c.lng }; },
      state: function () { return { region: state.region, famousId: state.famousId, spotId: state.spotId, manual: !!state.manual, zoom: map.getZoom(), seed: seedSpots().length, user: userSpots.length }; },
      map: function () { return map; }
    };
  }

  return { boot: boot, addUserSpot: addUserSpot, enterManualPlace: enterManualPlace, showDetail: showDetail, selectFamous: selectFamous, selectRegion: selectRegion };
})();

if (typeof window !== "undefined" && typeof document !== "undefined") {
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", App.boot);
  else App.boot();
}
