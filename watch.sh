#!/usr/bin/env bash
# 관전용(두 번째 터미널 창): 사람이 손대지 않고 진행만 본다.
cd "$(dirname "$0")"
watch -n 20 -t '
echo "== $(date "+%H:%M:%S")  DONE: $([ -f DONE ] && echo 있음 || echo 없음)";
echo "== PLAN: 완료 $(grep -c "^- \[x\]" PLAN.md) / $(grep -c "^- \[" PLAN.md)";
grep -m1 -n "^- \[ \]" PLAN.md | sed "s/^/   다음: /";
echo "== git";  git log --oneline 2>/dev/null | head -6;
echo "== 진행 로그"; grep "^| [0-9]" PLAN.md | tail -5;
echo "== ralph"; tail -4 logs/ralph.log 2>/dev/null;
'
