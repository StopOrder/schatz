# 샤츠(Schatz) — 랄프톤 2026 산출물 폴더

유명지 옆 숨은 스팟을 사진 EXIF로 지도에 박는 국내 사진 스팟 지도. 정적 웹, 서버 없음.

## 사람이 하는 일 (13:00 전)
1. `seed/photos/` 에 카메라 원본 JPG 를 넣는다. `seed/demo-upload/` 에 라이브 업로드용 1~2장.
2. `PRD.md` · `PLAN.md` · `AGENTS.md` 를 읽고 의도와 다른 줄을 고친다.
3. 12:55 `./preflight.sh` 로 끊길 만한 것을 점검한다(인증·브라우저·사진·네트워크). 대화형 claude 에서 `/usage` 로 5시간 창 사용량도 본다.
4. 13:00 터미널 하나에서 `./start.sh` (Codex 면 `./start.sh codex`). 창이 좌우로 갈라져 왼쪽이 에이전트, 오른쪽이 관전. 디스코드 화면 공유. 이후 손대지 않는다.

## 에이전트가 만드는 것
`index.html` `app.js` `styles.css` `seed/spots.js` `vendor/` `scripts/` — 완료되면 `DONE` 파일이 생긴다.

## 15:00 확인 절차 (수정 금지, 열어서 보기만)
1. 브라우저로 `index.html` 을 연다(파일 더블클릭 또는 file://). 폰 프레임 안에 전도·「유명한 데 말고, 여기도 예뻐요.」·지역 칩·붉은 유명 마커 25개·초록 시드 마커 6개.
2. 첫 지역 칩 **「제주」** → 제주로 이동, 붉은 「몰림」 칩 3개(성산일출봉·섭지코지·협재해수욕장).
3. 유명 칩 **「성산일출봉」** → 하단 「여기 말고 여기 · 3곳」: 성산일출봉 우뭇개해안 계단 0.4 km · 광치기해변 잔디밭 2.1 km · 김녕 돌담밭 빨간 지붕집 20.2 km.
4. 첫 항목 **「성산일출봉 우뭇개해안 계단」** → 상세: 사진, 「시각 정보 없음」, 「동 90°」 + 지도 위 부채꼴, 「성산일출봉에서 0.4 km」, 좌표 33.4598, 126.9388.
5. 「내 사진 올리기」 → `seed/demo-upload/jeju-songaksan-trail.jpg` → 핀이 떨어지며 송악산 자리에 박힘 → 상세(서귀포 · 협재해수욕장에서 22.1 km) → 새로고침 → 핀이 남아 있음.
6. (예비) GPS 없는 사진(`tests/fixtures/no-gps.jpg`) → 상단 「위치 정보가 없어요. 지도를 눌러 자리를 정해 주세요」 → 지도 탭 → 그 자리에 핀.
7. 다른 지역: 칩 「강릉」 → 「경포해변」 → 「강릉 알록달록 테트라포드 3.7 km」. 검색창에 「포항」 입력 후 Enter → 「호미곶 상생의 손」 → 30km 안에 없어 가장 가까운 3곳.

## 파일 구조
- `index.html` · `styles.css` · `app.js`(FAMOUS·REGIONS 표 + 지도·화면) · `store.js`(IndexedDB/localStorage) · `upload.js`(EXIF 읽기·업로드 흐름)
- `seed/spots.js` — `npm run seed`(`scripts/build-seed.mjs`)가 `seed/photos/*.jpg` EXIF 로 생성. 사진을 추가하면 다시 돈다.
- `scripts/make-synthetic.mjs` — 시드 사진 0장일 때만 합성 6장(포항 근처)을 `seed/synthetic/` 에 만든다.
- `vendor/` — Leaflet 1.9.4, exifr 7.1.3 (CDN 없음). 런타임 외부 요청은 OSM 타일만.

## 미완 항목
- 없음. PLAN.md 전 항목 완료, `npm test` 10/10 통과(2026-09-18).
- 참고: `seed/pending/maple-lake-castle.jpg` 는 장소 미확인으로 시드에 넣지 않았다(사람이 좌표를 정하면 `seed/photos/` 로 옮기고 `captions.txt` 에 한 줄 추가 후 `npm run seed`).
