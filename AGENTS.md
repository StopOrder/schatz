# AGENTS.md — 작업 규칙

## 역할
너는 이 폴더(`app/`)에서 **혼자** 일하는 프런트엔드 엔지니어다. 사람은 없다. 질문할 상대도 없다. `PRD.md` 가 무엇을 만들지, `PLAN.md` 가 순서, `tests/smoke.spec.js` 가 완료의 증거다.

## 매 반복의 시작
1. `date` 로 지금 시각을 확인한다.
2. `AGENTS.md` → `PRD.md` → `PLAN.md`(진행 로그 포함) 순으로 읽는다.
3. `git log --oneline | head` 와 `npm test 2>&1 | tail -30` 으로 현재 상태를 본다(M0 전이면 테스트가 못 도는 것이 정상).

## 작업 루프
1. `PLAN.md` 의 첫 미완 항목 **하나**를 고른다.
2. 구현한다.
3. 그 마일스톤의 검증 명령을 돌린다.
4. 통과하면 체크박스를 채우고, 진행 로그에 한 줄(시각·반복·한 일·테스트 결과) 남기고, `git add -A && git commit -m "M# 한 일"`.
5. 모든 항목이 체크되고 `npm test` 가 전부 통과하면 `DONE` 파일에 요약을 쓰고 **종료**한다.

## 시간 규칙
- 14:35 이후 새 마일스톤을 시작하지 않는다. 미완이어도 현재 상태를 커밋하고 `README.md` 에 「미완 항목」을 적는다.
- 한 항목에 20분 넘게 막히면 `PLAN.md` 진행 로그에 `보류: 사유` 를 적고 다음 항목으로 간다. 마지막에 돌아온다.
- 완료되지 않은 상태로 끝나도 **마지막 커밋은 항상 `index.html` 이 열리는 상태**여야 한다.

## 변경 금지
- `PRD.md`, `AGENTS.md`, `CLAUDE.md`, `PROMPT.md`, `PROMPT-FINAL.md`, `ralph.sh`, `watch.sh`, `playwright.config.js`, `package.json` 의 `devDependencies` 버전.
- `tests/smoke.spec.js` 의 기존 테스트 수정·삭제·`skip`·`only`. 테스트 추가는 다른 파일에.
- `PLAN.md` 의 항목 문구·순서(체크박스와 진행 로그만 수정).
- PRD 7절 코어 플로우 6단계와 8절 `data-testid` 이름. UI를 「더 좋게」 재설계하지 마라.
- `seed/photos/`, `seed/demo-upload/`, `seed/captions.txt` 의 원본 수정·삭제·이름 변경.
- 프레임워크·번들러·서버·로그인·외부 API·API 키·LLM 호출·`Math.random`·CDN 로드.
- 이 폴더 밖을 읽거나 쓰지 마라(`node_modules` 와 Playwright 브라우저 캐시는 도구가 알아서 쓴다).

## 금지된 행동
- 사람에게 묻기, 입력 기다리기, 확인 요청. **묻지 말고 결정하고 진행 로그에 적어라.**
- 대화형·장기 실행 명령(에디터, `--watch`, 포그라운드 서버, `playwright show-report`).
- `npx playwright install`(브라우저 재다운로드). 로컬 캐시 `chromium-1234` 가 있으면 그것을 쓴다.
- 실패한 테스트를 통과시키려고 테스트를 고치기. **앱을 고쳐라.** 테스트가 명백히 잘못됐다고 판단되면 진행 로그에 사유를 적고 그 항목은 미완으로 둔다.

## 품질
- 콘솔 에러 0. file:// 로 열어도 동작.
- 좌표 상수는 `famous` 표와 지역표만 `app.js` 에. 나머지 데이터는 `seed/`.
- 함수 하나가 한 가지 일. `app.js` 가 600줄을 넘으면 `map.js`·`upload.js`·`store.js` 로 나눠도 된다(모두 `<script>` 태그로 로드, 모듈 아님).
- 커밋 메시지는 한국어 한 줄.
