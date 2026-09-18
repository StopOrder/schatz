// scripts/build-seed.mjs — seed/photos/*.jpg 의 EXIF 로 seed/spots.js 를 만든다.
// 사용: npm run seed
// 규칙(PRD 6.2): EXIF GPS → captions 좌표 → 둘 다 없으면 제외. HEIC 제외. 시각은 DateTimeOriginal 만.
//   seed/demo-upload/ 는 읽지 않으며, 그 안에 있는 파일명과 같은 사진은 시드에서 뺀다(중복 핀 방지).
//   Node 26 + exifr: 파일 경로 대신 Buffer 를 넘긴다.
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";
import exifr from "exifr";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PHOTOS_DIR = path.join(ROOT, "seed", "photos");
const SYNTH_DIR = path.join(ROOT, "seed", "synthetic");
const DEMO_DIR = path.join(ROOT, "seed", "demo-upload");
const CAPTIONS = path.join(ROOT, "seed", "captions.txt");
const OUT = path.join(ROOT, "seed", "spots.js");

/** app.js 를 vm 으로 실행해 FAMOUS·REGIONS·지오 함수를 얻는다(브라우저 부트는 window 가 없어 건너뛴다). */
function loadAppTables() {
  const src = fs.readFileSync(path.join(ROOT, "app.js"), "utf8");
  const ctx = vm.createContext({});
  vm.runInContext(src, ctx, { filename: "app.js" });
  return { FAMOUS: ctx.FAMOUS, REGIONS: ctx.REGIONS, nearestRegion: ctx.nearestRegion, nearestFamous: ctx.nearestFamous };
}

/** captions.txt → Map(파일명 → {name, line, lat, lng, heading}) */
function loadCaptions(file = CAPTIONS) {
  const map = new Map();
  if (!fs.existsSync(file)) return map;
  for (const raw of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const cols = line.split("|").map((s) => s.trim());
    if (cols.length < 2) continue;
    const num = (s) => (s === undefined || s === "" ? null : Number.isFinite(parseFloat(s)) ? parseFloat(s) : null);
    map.set(cols[0], { name: cols[1] || "", line: cols[2] || "", lat: num(cols[3]), lng: num(cols[4]), heading: num(cols[5]) });
  }
  return map;
}

function listJpgs(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter((f) => /\.jpe?g$/i.test(f)).sort();
}

async function readExif(buf) {
  let gps = null, tags = null;
  try { gps = await exifr.gps(buf); } catch (_) { gps = null; }
  try { tags = await exifr.parse(buf, { pick: ["DateTimeOriginal", "GPSImgDirection"] }); } catch (_) { tags = null; }
  const lat = gps && Number.isFinite(gps.latitude) ? gps.latitude : null;
  const lng = gps && Number.isFinite(gps.longitude) ? gps.longitude : null;
  const takenAt = tags && tags.DateTimeOriginal instanceof Date && !isNaN(tags.DateTimeOriginal) ? tags.DateTimeOriginal.toISOString() : null;
  const heading = tags && Number.isFinite(tags.GPSImgDirection) ? tags.GPSImgDirection : null;
  return { lat, lng, takenAt, heading };
}

function round(n, d) { return Math.round(n * 10 ** d) / 10 ** d; }

async function buildSpot(dirRel, file, captions, tables) {
  const buf = fs.readFileSync(path.join(ROOT, dirRel, file));
  const exif = await readExif(buf);
  const cap = captions.get(file) || null;
  let lat = exif.lat, lng = exif.lng, coordSource = "exif";
  if (lat === null || lng === null) {
    if (cap && cap.lat !== null && cap.lng !== null) { lat = cap.lat; lng = cap.lng; coordSource = "captions"; }
    else return null;
  }
  const heading = exif.heading !== null ? exif.heading : cap && cap.heading !== null ? cap.heading : null;
  const p = { lat, lng };
  const region = tables.nearestRegion(p).item;
  const nf = tables.nearestFamous(p);
  const km = round(nf.km, 1);
  const caption = cap && cap.name ? (cap.line ? `${cap.name} — ${cap.line}` : cap.name) : `${region.name} · ${nf.item.name}에서 ${km}km`;
  return {
    id: file.replace(/\.[^.]+$/, "").toLowerCase().replace(/[^a-z0-9_-]+/g, "-"),
    file: `${dirRel}/${file}`,
    name: cap && cap.name ? cap.name : `${region.name}의 숨은 자리`,
    lat: round(lat, 6),
    lng: round(lng, 6),
    takenAt: exif.takenAt,
    heading: heading === null ? null : round(heading, 1),
    region: region.slug,
    nearestFamous: { id: nf.item.id, km },
    caption,
    coordSource
  };
}

async function main() {
  const tables = loadAppTables();
  const captions = loadCaptions();
  const demoNames = new Set(listJpgs(DEMO_DIR));
  let dirRel = "seed/photos";
  let files = listJpgs(PHOTOS_DIR).filter((f) => !demoNames.has(f));
  const skippedHeic = fs.existsSync(PHOTOS_DIR) ? fs.readdirSync(PHOTOS_DIR).filter((f) => /\.heic$/i.test(f)) : [];
  for (const h of skippedHeic) console.log(`제외: ${h} (HEIC)`);
  for (const d of listJpgs(PHOTOS_DIR).filter((f) => demoNames.has(f))) console.log(`제외: ${d} (demo-upload 와 같은 파일명)`);

  if (files.length === 0) {
    console.log("시드 사진 0장 → 합성 이미지 6장을 만든다(seed/synthetic/)");
    const { makeSynthetic } = await import("./make-synthetic.mjs");
    await makeSynthetic(SYNTH_DIR);
    dirRel = "seed/synthetic";
    files = listJpgs(SYNTH_DIR);
    for (const [k, v] of loadCaptions(path.join(SYNTH_DIR, "captions.synthetic.txt"))) captions.set(k, v);
  }

  const spots = [];
  for (const f of files) {
    const s = await buildSpot(dirRel, f, captions, tables);
    if (!s) { console.log(`제외: ${f} (GPS 도 captions 좌표도 없음)`); continue; }
    spots.push(s);
    console.log(`포함: ${f} → ${s.lat},${s.lng} ${s.region} ${s.nearestFamous.id} ${s.nearestFamous.km}km [${s.coordSource}]`);
  }
  spots.sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
  for (const s of spots) delete s.coordSource;

  const counts = {};
  for (const s of spots) counts[s.region] = (counts[s.region] || 0) + 1;
  const demoRegion = Object.entries(counts).sort((a, b) => b[1] - a[1] || (a[0] < b[0] ? -1 : 1))[0];

  const header = `// seed/spots.js — 빌드 산출물(scripts/build-seed.mjs). 손으로 고치지 않는다.\n// 생성 ${new Date().toISOString()} · 사진 ${spots.length}장 · 데모 지역 ${demoRegion ? demoRegion[0] : "-"}\n`;
  fs.writeFileSync(OUT, header + "window.SEED_SPOTS = " + JSON.stringify(spots, null, 2) + ";\n");
  console.log(`seed/spots.js 생성: ${spots.length}장, 데모 지역 ${demoRegion ? demoRegion[0] + "(" + demoRegion[1] + "장)" : "-"}`);
  if (spots.length === 0) { console.error("시드 0장 — 실패"); process.exit(1); }
}

main().catch((e) => { console.error(e); process.exit(1); });
