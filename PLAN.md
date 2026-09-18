# PLAN.md — 샤츠(Schatz) 실행 계획

규칙: 위에서 아래 순서. 항목을 끝내면 `- [ ]` 를 `- [x]` 로 바꾸고 맨 아래 진행 로그에 한 줄 남긴다. 각 마일스톤의 **검증**이 통과해야 다음으로 간다. 이 파일의 체크박스와 진행 로그만 수정한다(항목 문구·순서 변경 금지).

## M0 하네스 (목표 15분) — 앱 코드 없이 도구만 돈다

- [x] `git init` → `.gitignore` 확인 → 첫 커밋 `M0 하네스`
- [x] `npm install` (package.json 에 고정된 버전 그대로). `npx playwright install` 은 **실행하지 않는다** — `~/.cache/ms-playwright/chromium-1234` 가 이미 있다. 없을 때만 `npx playwright install chromium`
- [x] `vendor/` 에 복사: `node_modules/leaflet/dist/leaflet.js`, `leaflet.css`, `images/` 폴더, `node_modules/exifr/dist/full.umd.js` → `vendor/exifr.umd.js`
- [x] `scripts/build-seed.mjs`: `seed/photos/*.jpg|jpeg` → exifr(**Buffer 입력**)로 GPS·DateTimeOriginal·GPSImgDirection → GPS 없으면 `seed/captions.txt` 의 위도·경도(방향) 폴백 → 둘 다 없으면 콘솔에 `제외:` → 지역표 최근접 → 유명지 최근접 km → 캡션 → `seed/spots.js` 출력. `seed/demo-upload/` 는 읽지 않음
- [x] `scripts/make-synthetic.mjs`: 시드 사진 0장일 때만 쓰는 합성 6장(jpeg-js + piexifjs 로 GPS 삽입, 포항 근처 좌표). `build-seed` 가 0장을 감지하면 자동 호출
- [x] `npm run seed` 성공 → `seed/spots.js` 생성 확인. `npx playwright test --list` 로 테스트 10개(AC0~AC9)가 나열되는지 확인
- 검증: `npm run seed && npx playwright test --list`

## M1 지도 + 시드 핀 (AC1 · AC2 · AC9)

- [x] `index.html` 골격: `phone-frame` → 헤더 한 줄 「유명한 데 말고, 여기도 예뻐요.」 → 지역 칩 바 → `map` → 하단 「내 사진 올리기」 버튼(숨은 `upload-input`). `styles.css`
- [x] Leaflet 초기화(중심 36.3,127.8 줌 7, OSM 타일). 프레임: 430px 이하 뷰포트에서 폭 100%, 1280 폭에서 360~440px 가운데 정렬
- [x] `famous` 표 12곳 이상 + 붉은 divIcon 마커(`famous-marker`, `data-id`)
- [x] `seed/spots.js` 로드 → 초록 썸네일 divIcon 마커(`seed-marker`, `data-id`)
- [x] 지역표 60곳 이상 + 칩(데모 지역 첫 번째, `data-region data-lat data-lng`) + 검색 입력(지역표 부분 일치) → `flyTo` + `region-title`
- [x] `window.__yeogido = { center(), state() }` 테스트 훅
- 검증: `npx playwright test -g "AC1|AC2|AC9"`

## M2 여기 말고 여기 + 상세 (AC3 · AC4 · AC8)

- [x] 지역 화면에 그 지역 유명 스팟 칩(`famous-chip`, `data-id`). 지역에 유명 스팟이 없으면 최근접 유명 스팟 1곳을 거리와 함께 칩으로
- [x] 유명 칩·마커 클릭 → `nearby-panel`: 반경 30km 숨은 스팟(시드 + 사용자) 하버사인 거리순, 없으면 최근접 3곳. 항목(`nearby-item`)에 썸네일·장소 이름·**거리 한 개**(`N.N km`, 1km 미만도 km, m 금지)·방향(있으면). 항목 안에 다른 거리 숫자 금지. 동률은 `id` 순으로 결정적
- [x] 항목 클릭 → `spot-detail`: 큰 사진, `taken-at`(「YYYY-MM-DD HH:mm」 또는 「시각 정보 없음」), 방향(있으면 「북동 45°」 + 지도 위 부채꼴 폴리곤), `nearest-famous`(「호미곶에서 3.2km」), `coords`(소수 4자리), 캡션
- [x] 패널·상세 닫기 버튼
- 검증: `npx playwright test -g "AC3|AC4|AC8"`

## M3 업로드 + 저장 (AC5 · AC6)

- [x] 「내 사진 올리기」 → `upload-input` change → exifr.gps + parse(DateTimeOriginal, GPSImgDirection) → 좌표 있으면 핀 드롭 애니메이션(`user-marker`) → 지도 이동 → `spot-detail`
- [x] GPS 없음·파싱 실패 → `manual-place-hint` 표시(상단 토스트) → 다음 지도 클릭 위치에 핀. 마커 위를 눌러도 그 좌표에 배치(마커 클릭 핸들러가 수동 모드일 때는 배치로 위임) → 상세
- [x] IndexedDB 에 blob, localStorage 에 메타 → 로드 시 복원 → 시드와 함께 근처 목록에 포함
- 검증: `npx playwright test -g "AC5|AC6"`

## M4 네트워크 봉인 + 데모 마감 (AC7 · 전체)

- [x] 외부 요청 감사: 폰트·CDN·아이콘 등 OSM 외 요청 0. Leaflet 기본 마커 이미지 경로가 `vendor/images/` 를 가리키는지 확인
- [x] `seed/demo-upload/` 가 비어 있으면 `seed/photos` 에서 GPS 있는 **마지막** 사진 1장을 복사해 넣고, 시드 빌드에서 그 파일명을 제외해 재빌드(중복 핀 방지). 사진이 0장이면 `tests/fixtures/with-gps.jpg` 복사. demo-upload 사진에 GPS EXIF 가 없으면 piexifjs 로 captions 좌표를 심은 사본으로 교체
- [x] `README.md` 의 「15:00 확인 절차」를 실제 칩 이름·유명 스팟 이름으로 갱신
- [x] 전체 `npm test` 녹색 → 커밋 → `DONE` 파일에 요약(통과 테스트 수·시드 사진 수·데모 지역·미완 항목) 작성
- 검증: `npm test`

## 진행 로그 (에이전트가 추가한다)

| 시각 | 반복 | 한 일 | 테스트 결과 |
|---|---|---|---|
| 13:08 | 1 | M0 하네스: git init·vendor 복사·build-seed(vm으로 app.js 표 재사용)·make-synthetic·spots.js 6장(데모 지역 jeju). 결정: 시드 `file`은 index.html 기준 경로, 합성은 `seed/synthetic/`에 출력, 유명지 `region`은 지역표 최근접으로 런타임 계산 | `npm run seed` OK · `--list` 10개 |
| 13:20 | 1 | M1 지도+시드 핀: index.html·styles.css·app.js(FAMOUS 25곳·REGIONS 93곳·칩·검색·훅), store.js·upload.js 분리. 결정: 지역 flyTo 줌은 그 지역 스팟 최대 거리로 9~12 자동, 칩 순서 = 사진 수 → 주요 도시 | AC1·AC2·AC9 3 passed |
| 13:27 | 1 | M2 여기 말고 여기+상세: famous-chip(근처 사진 수→표 순), nearby-panel 30km 거리순/최근접 3, spot-detail(부채꼴·좌표·유명지 거리), 닫기. 시트가 덮지 않는 지도 윗부분에 핀이 오도록 중심 오프셋 계산 | AC3·AC4·AC8 3 passed |
| 13:32 | 1 | M3 업로드+저장: upload.js(exifr gps/parse → 핀 드롭 → 상세), 수동 배치(토스트·지도/마커 클릭 위임), store.js(IDB blob + localStorage 메타, 실패 시 메모리). 결정: 사용자 스팟 이름은 파일명, 캡션은 「지역 · 유명지에서 Nkm」 자동 | AC5·AC6 2 passed |
| 13:38 | 1 | M4 마감: 외부 요청 감사(OSM 타일만, Leaflet imagePath=vendor/images/, Math.random·fetch 0). 결정: demo-upload 에 GPS 있는 jeju-songaksan-trail.jpg 가 이미 있고 시드와 겹치지 않아 복사·재빌드 생략. README 15:00 절차를 실제 이름으로 갱신, DONE 작성 | `npm test` 10 passed |
