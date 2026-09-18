// scripts/make-synthetic.mjs — 시드 사진이 0장일 때만 쓰는 합성 이미지 6장(그라데이션 + 큰 글자, 포항 근처 GPS).
// build-seed.mjs 가 0장을 감지하면 호출한다. 단독 실행: node scripts/make-synthetic.mjs [출력폴더]
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import jpeg from "jpeg-js";
import piexif from "piexifjs";

const SPOTS = [
  { file: "synthetic-guryongpo-stairs.jpg", label: "구룡포 계단", lat: 35.9895, lng: 129.556, heading: 250, rgb: [[240, 120, 80], [60, 30, 90]] },
  { file: "synthetic-daebo-lighthouse.jpg", label: "대보 등대", lat: 36.0768, lng: 129.5626, heading: 90, rgb: [[80, 160, 220], [20, 40, 80]] },
  { file: "synthetic-yeongildae.jpg", label: "영일대 밤", lat: 36.0565, lng: 129.3785, heading: 45, rgb: [[30, 30, 60], [200, 160, 60]] },
  { file: "synthetic-chilpo-beach.jpg", label: "칠포 해변", lat: 36.1494, lng: 129.4067, heading: 120, rgb: [[120, 200, 190], [30, 80, 120]] },
  { file: "synthetic-oeosa.jpg", label: "오어사 저수지", lat: 35.9557, lng: 129.3979, heading: null, rgb: [[90, 140, 70], [20, 50, 30]] },
  { file: "synthetic-igari-anchor.jpg", label: "이가리 닻", lat: 36.1364, lng: 129.4281, heading: 60, rgb: [[250, 200, 120], [120, 60, 40]] }
];

// 5x7 도트 글꼴: 숫자와 라틴 대문자만. 한글 라벨은 파일명·캡션으로 대신하고 화면 글자는 번호로 찍는다.
const GLYPHS = {
  "1": ["00100", "01100", "00100", "00100", "00100", "00100", "01110"],
  "2": ["01110", "10001", "00001", "00010", "00100", "01000", "11111"],
  "3": ["11110", "00001", "00001", "01110", "00001", "00001", "11110"],
  "4": ["00010", "00110", "01010", "10010", "11111", "00010", "00010"],
  "5": ["11111", "10000", "11110", "00001", "00001", "10001", "01110"],
  "6": ["00110", "01000", "10000", "11110", "10001", "10001", "01110"]
};

function drawImage(width, height, c0, c1, text) {
  const data = Buffer.alloc(width * height * 4);
  for (let y = 0; y < height; y++) {
    const t = y / (height - 1);
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      data[i] = Math.round(c0[0] + (c1[0] - c0[0]) * t);
      data[i + 1] = Math.round(c0[1] + (c1[1] - c0[1]) * t);
      data[i + 2] = Math.round(c0[2] + (c1[2] - c0[2]) * t);
      data[i + 3] = 255;
    }
  }
  const glyph = GLYPHS[text];
  if (glyph) {
    const cell = Math.floor(width / 10);
    const ox = Math.floor((width - 5 * cell) / 2), oy = Math.floor((height - 7 * cell) / 2);
    for (let gy = 0; gy < 7; gy++) for (let gx = 0; gx < 5; gx++) {
      if (glyph[gy][gx] !== "1") continue;
      for (let y = 0; y < cell; y++) for (let x = 0; x < cell; x++) {
        const i = ((oy + gy * cell + y) * width + (ox + gx * cell + x)) * 4;
        data[i] = 255; data[i + 1] = 255; data[i + 2] = 255;
      }
    }
  }
  return jpeg.encode({ data, width, height }, 85).data;
}

function toRational(deg) {
  const abs = Math.abs(deg);
  const d = Math.floor(abs), m = Math.floor((abs - d) * 60), s = Math.round(((abs - d) * 60 - m) * 60 * 100);
  return [[d, 1], [m, 1], [s, 100]];
}

function withGps(jpegBuf, spot) {
  const gps = {};
  gps[piexif.GPSIFD.GPSLatitudeRef] = spot.lat >= 0 ? "N" : "S";
  gps[piexif.GPSIFD.GPSLatitude] = toRational(spot.lat);
  gps[piexif.GPSIFD.GPSLongitudeRef] = spot.lng >= 0 ? "E" : "W";
  gps[piexif.GPSIFD.GPSLongitude] = toRational(spot.lng);
  if (spot.heading !== null) {
    gps[piexif.GPSIFD.GPSImgDirectionRef] = "T";
    gps[piexif.GPSIFD.GPSImgDirection] = [Math.round(spot.heading * 100), 100];
  }
  const exif = { "0th": {}, Exif: {}, GPS: gps };
  exif["0th"][piexif.ImageIFD.Software] = "make-synthetic";
  const bin = jpegBuf.toString("binary");
  const out = piexif.insert(piexif.dump(exif), bin);
  return Buffer.from(out, "binary");
}

export async function makeSynthetic(outDir) {
  fs.mkdirSync(outDir, { recursive: true });
  const lines = ["# 합성 시드 (make-synthetic.mjs). 실사진이 1장이라도 있으면 쓰지 않는다."];
  SPOTS.forEach((s, i) => {
    const img = drawImage(640, 480, s.rgb[0], s.rgb[1], String(i + 1));
    fs.writeFileSync(path.join(outDir, s.file), withGps(img, s));
    lines.push(`${s.file} | ${s.label} | 합성 이미지 ${i + 1} | ${s.lat} | ${s.lng} | ${s.heading === null ? "" : s.heading}`);
  });
  fs.writeFileSync(path.join(outDir, "captions.synthetic.txt"), lines.join("\n") + "\n");
  console.log(`합성 ${SPOTS.length}장 → ${outDir}`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const out = process.argv[2] || path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "seed", "synthetic");
  makeSynthetic(out).catch((e) => { console.error(e); process.exit(1); });
}
