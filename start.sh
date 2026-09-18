#!/usr/bin/env bash
# 13:00 에 이것 하나만 실행한다. 터미널 하나가 좌(에이전트)/우(관전)로 갈라진다.
# 사용: ./start.sh            (Claude Code)
#       ./start.sh codex      (Codex)
cd "$(dirname "$0")"
AGENT="${1:-claude}"
if [ -f DONE ]; then echo "DONE 이 이미 있다. 새로 돌리려면 DONE 을 지워라."; exit 1; fi
if [ -n "${TMUX:-}" ]; then
  # 이미 tmux 안이면 현재 창을 가른다: 왼쪽 에이전트, 오른쪽 관전
  tmux split-window -h "./watch.sh"
  tmux select-pane -L
  exec ./ralph.sh "$AGENT"
fi
tmux kill-session -t ralph 2>/dev/null
tmux new-session -d -s ralph -x 220 -y 50 "./ralph.sh $AGENT; echo; echo '[ralph 종료 — 이 창은 그대로 두세요]'; sleep 100000"
tmux split-window -h -t ralph "./watch.sh"
tmux select-pane -t ralph:0.0
exec tmux attach -t ralph
