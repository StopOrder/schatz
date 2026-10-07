// tests/smoke.spec.js — PRD.md 8절 완료 조건 AC1~AC9 와 1:1.
// 이 파일은 수정·삭제·skip·only 금지(AGENTS.md). 테스트를 통과시키려면 앱을 고친다.
const { test, expect } = require('@playwright/test');
const path = require('path');
const fs = require('fs');

const INDEX = 'file://' + path.resolve(__dirname, '..', 'index.html');
const FIX = (name) => path.resolve(__dirname, 'fixtures', name);
const ALLOWED_HOSTS = new Set([
  'tile.openstreetmap.org', 'a.tile.openstreetmap.org', 'b.tile.openstreetmap.org', 'c.tile.openstreetmap.org',
]);

function haversineKm(a, b) {
  const R = 6371, rad = (d) => (d * Math.PI) / 180;
  const dLat = rad(b.lat - a.lat), dLng = rad(b.lng - a.lng);
  const s = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}

async function open(page) {
  const errors = [];
  page.on('pageerror', (e) => errors.push('pageerror: ' + String(e)));
  page.on('console', (m) => {
    if (m.type() !== 'error') return;
    const url = (m.location() && m.location().url) || '';
    if (/tile\.openstreetmap\.org/.test(url)) return; // 시연장 네트워크로 타일이 안 와도 앱 결함이 아니다
    errors.push('console: ' + m.text() + (url ? ` (${url})` : ''));
  });
  await page.goto(INDEX);
  await expect(page.getByTestId('map')).toBeVisible();
  return errors;
}

async function gotoDemoRegion(page) {
  const chip = page.getByTestId('region-chip').first();
  await expect(chip).toBeVisible();
  const name = (await chip.textContent()).trim();
  const lat = parseFloat(await chip.getAttribute('data-lat'));
  const lng = parseFloat(await chip.getAttribute('data-lng'));
  expect(Number.isFinite(lat) && Number.isFinite(lng), 'region-chip 에 data-lat/data-lng 가 있어야 한다').toBe(true);
  await chip.click();
  await expect(page.getByTestId('region-title')).toContainText(name);
  return { name, lat, lng };
}

async function openNearby(page) {
  await gotoDemoRegion(page);
  const famous = page.getByTestId('famous-chip').first();
  await expect(famous).toBeVisible();
  await famous.click();
  await expect(page.getByTestId('nearby-panel')).toBeVisible();
  const items = page.getByTestId('nearby-item');
  await expect(items.first()).toBeVisible();
  return items;
}

test('AC0 하네스: index.html 과 픽스처가 있다', async () => {
  expect(fs.existsSync(FIX('with-gps.jpg')), 'tests/fixtures/with-gps.jpg 없음').toBe(true);
  expect(fs.existsSync(FIX('no-gps.jpg')), 'tests/fixtures/no-gps.jpg 없음').toBe(true);
  expect(fs.existsSync(path.resolve(__dirname, '..', 'index.html')), 'index.html 없음').toBe(true);
});

test('AC1 file:// 로 열면 콘솔 에러 0, 지도가 보이고 유명 마커 12+·시드 마커 1+', async ({ page }) => {
  const errors = await open(page);
  await expect(page.getByTestId('famous-marker').first()).toBeAttached();
  await expect(page.getByTestId('seed-marker').first()).toBeAttached();
  expect(await page.getByTestId('famous-marker').count()).toBeGreaterThanOrEqual(12);
  expect(await page.getByTestId('seed-marker').count()).toBeGreaterThanOrEqual(1);
  await page.waitForTimeout(1500);
  expect(errors, errors.join('\n')).toEqual([]);
});

test('AC2 첫 지역 칩을 누르면 그 지역으로 이동한다', async ({ page }) => {
  await open(page);
  const r = await gotoDemoRegion(page);
  await expect.poll(async () => {
    const c = await page.evaluate(() => window.__yeogido && window.__yeogido.center());
    return c ? haversineKm(c, r) : 9999;
  }, { timeout: 8000, message: '지도 중심이 지역 중심 30km 안으로 와야 한다' }).toBeLessThan(30);
});

test('AC3 유명 스팟을 누르면 「여기 말고 여기」 목록이 거리순으로 뜬다', async ({ page }) => {
  await open(page);
  const items = await openNearby(page);
  const texts = await items.allTextContents();
  expect(texts.length).toBeGreaterThanOrEqual(1);
  const kms = texts.map((t) => {
    const m = t.match(/(\d+(?:\.\d+)?)\s?km/);
    expect(m, `항목에 거리 표기(N km)가 없다: ${t}`).not.toBeNull();
    return parseFloat(m[1]);
  });
  for (let i = 1; i < kms.length; i++) expect(kms[i], `거리 오름차순이 아니다: ${kms.join(', ')}`).toBeGreaterThanOrEqual(kms[i - 1]);
});

test('AC4 목록 항목을 누르면 사진·촬영 시각·최근접 유명지 거리가 보인다', async ({ page }) => {
  await open(page);
  const items = await openNearby(page);
  await items.first().click();
  const detail = page.getByTestId('spot-detail');
  await expect(detail).toBeVisible();
  const img = detail.locator('img').first();
  await expect(img).toBeVisible();
  await expect.poll(() => img.evaluate((el) => el.complete && el.naturalWidth > 0), { timeout: 8000, message: '상세 이미지가 로드되어야 한다' }).toBe(true);
  await expect(page.getByTestId('taken-at')).toContainText(/\d{4}|없음/);
  await expect(page.getByTestId('nearest-famous')).toContainText(/km/);
});

test('AC5 GPS 사진을 올리면 핀이 박히고 새로고침 후에도 남는다', async ({ page }) => {
  await open(page);
  const before = await page.getByTestId('user-marker').count();
  await page.getByTestId('upload-input').setInputFiles(FIX('with-gps.jpg'));
  await expect(page.getByTestId('user-marker')).toHaveCount(before + 1, { timeout: 5000 });
  await expect(page.getByTestId('spot-detail')).toBeVisible();
  await expect(page.getByTestId('coords')).toContainText(/\d+\.\d+/);
  await page.reload();
  await expect(page.getByTestId('map')).toBeVisible();
  await expect(page.getByTestId('user-marker')).toHaveCount(before + 1, { timeout: 8000 });
});

test('AC6 GPS 없는 사진은 지도를 눌러 직접 배치한다', async ({ page }) => {
  await open(page);
  const before = await page.getByTestId('user-marker').count();
  await page.getByTestId('upload-input').setInputFiles(FIX('no-gps.jpg'));
  await expect(page.getByTestId('manual-place-hint')).toBeVisible();
  const map = page.getByTestId('map');
  const box = await map.boundingBox();
  await map.click({ position: { x: box.width * 0.15, y: box.height * 0.75 } });
  await expect(page.getByTestId('user-marker')).toHaveCount(before + 1, { timeout: 5000 });
});

test('AC7 페이지가 부르는 외부 호스트는 OSM 타일뿐이다', async ({ page }) => {
  const hosts = new Set();
  page.on('request', (r) => {
    try { const u = new URL(r.url()); if (u.protocol === 'http:' || u.protocol === 'https:') hosts.add(u.hostname); } catch (_) {}
  });
  await open(page);
  const items = await openNearby(page);
  await items.first().click();
  await expect(page.getByTestId('spot-detail')).toBeVisible();
  await page.waitForTimeout(1500);
  const bad = [...hosts].filter((h) => !ALLOWED_HOSTS.has(h));
  expect(bad, `허용되지 않은 외부 호스트: ${bad.join(', ')}`).toEqual([]);
});

test('AC8 같은 조작을 두 번 하면 같은 목록이 나온다(랜덤 없음)', async ({ page }) => {
  await open(page);
  const first = await (await openNearby(page)).allTextContents();
  await page.goto(INDEX);
  await expect(page.getByTestId('map')).toBeVisible();
  const second = await (await openNearby(page)).allTextContents();
  expect(second).toEqual(first);
});

test('AC9 폰 폭에서 가로 스크롤이 없고, 데스크톱에서는 왼쪽 패널 + 전체 지도로 그려진다', async ({ page }) => {
  await open(page);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
  expect(overflow, '390px 폭에서 가로 스크롤이 생긴다').toBe(false);
  await page.setViewportSize({ width: 1280, height: 800 });
  const frame = page.getByTestId('phone-frame');
  await expect(frame).toBeVisible();
  expect((await frame.boundingBox()).width, '데스크톱에서 프레임이 창 폭을 채운다').toBeGreaterThanOrEqual(1270);
  const search = await page.getByTestId('region-search').boundingBox();
  expect(search.x + search.width, '검색창(패널)은 왼쪽 320~400px 안').toBeLessThanOrEqual(400);
  expect(search.x + search.width).toBeGreaterThanOrEqual(300);
  const map = await page.getByTestId('map').boundingBox();
  expect(map.x, '지도는 패널 오른쪽에서 시작').toBeGreaterThanOrEqual(340);
  expect(map.width, '지도가 나머지 폭을 채운다').toBeGreaterThanOrEqual(700);
  expect(map.height, '지도가 세로를 채운다').toBeGreaterThanOrEqual(780);
  // 상세를 열어도 지도를 덮지 않고 패널 안에 선다.
  await gotoDemoRegion(page);
  await page.getByTestId('famous-chip').first().click();
  await page.getByTestId('nearby-item').first().click();
  const detail = await page.getByTestId('spot-detail').boundingBox();
  expect(detail.x + detail.width).toBeLessThanOrEqual(400);
  const overflowDesktop = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
  expect(overflowDesktop, '1280px 폭에서 가로 스크롤이 생긴다').toBe(false);
});
