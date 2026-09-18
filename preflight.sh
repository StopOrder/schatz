#!/usr/bin/env bash
# 12:55 에 한 번 실행. 엔터 뒤 끊길 만한 것을 미리 잡는다. 앱을 만들지는 않는다.
cd "$(dirname "$0")"
ok=0; bad=0
pass(){ echo "  ✔ $*"; ok=$((ok+1)); }
fail(){ echo "  ✘ $*"; bad=$((bad+1)); }
echo "== 프리플라이트 $(date '+%H:%M:%S')"
[ -f DONE ] && fail "DONE 파일이 이미 있다(지워야 새로 돈다)" || pass "DONE 없음"
git config --global user.name >/dev/null && pass "git 신원 있음" || fail "git user.name 없음 → git config --global user.name/email"
[ -d node_modules/@playwright/test ] && pass "node_modules 있음" || fail "node_modules 없음 → npm install"
node -e "require('playwright-core').chromium.executablePath()" >/dev/null 2>&1 && [ -x "$(node -e "console.log(require('playwright-core').chromium.executablePath())")" ] && pass "크로미움 캐시 있음" || fail "크로미움 없음"
n=$(ls seed/photos/*.jpg seed/photos/*.jpeg 2>/dev/null | wc -l); [ "$n" -ge 1 ] && pass "시드 사진 ${n}장" || fail "시드 사진 0장(합성 폴백으로 간다)"
d=$(ls seed/demo-upload/*.jpg 2>/dev/null | wc -l); [ "$d" -ge 1 ] && pass "데모 업로드 사진 ${d}장" || fail "데모 업로드 사진 없음(M4 에서 자동 복사)"
ls tests/fixtures/with-gps.jpg tests/fixtures/no-gps.jpg >/dev/null 2>&1 && pass "테스트 픽스처 있음" || fail "픽스처 없음"
curl -s -m 8 -o /dev/null -w "%{http_code}" https://tile.openstreetmap.org/7/109/50.png | grep -q 200 && pass "OSM 타일 응답" || fail "OSM 타일 안 옴(테스트는 통과 가능, 데모 지도는 회색)"
[ -e "$HOME/.ralph-claude/.credentials.json" ] && pass "격리 자격증명 있음" || fail "~/.ralph-claude/.credentials.json 없음"
echo "  … 격리 claude -p 실행 시험(읽기만)"
out=$(env -u CLAUDECODE -u CLAUDE_CODE_CHILD_SESSION -u CLAUDE_CODE_ENTRYPOINT CLAUDE_CONFIG_DIR="$HOME/.ralph-claude" timeout 120 claude -p "이 폴더의 AGENTS.md 첫 줄(제목)만 그대로 출력하라. 파일을 만들거나 고치지 마라." --dangerously-skip-permissions 2>&1)
echo "$out" | grep -q "AGENTS.md" && pass "claude -p 응답: $(echo "$out" | head -1)" || fail "claude -p 실패: $(echo "$out" | tail -2 | tr '\n' ' ')"
[ -z "$(git status --porcelain 2>/dev/null)" ] || echo "  (참고) 작업 트리에 미커밋 변경 있음 — M0 첫 커밋이 포함한다"
echo "== 결과: 통과 $ok · 실패 $bad"
echo "== 남은 확인은 사람이: 대화형 claude 에서 /usage 로 5시간 창 사용량 확인, 디스코드 화면 공유 켜기"
[ "$bad" -eq 0 ]
