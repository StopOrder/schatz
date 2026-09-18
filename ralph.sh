#!/usr/bin/env bash
# 랄프 루프 — DONE 파일이 생기거나 마감이 지나거나 최대 반복에 닿을 때까지 에이전트를 재호출한다.
# 사용:  ./ralph.sh claude     또는     ./ralph.sh codex
# 환경(선택): NO_NEW_ITER=14:40  FINAL_AT=14:30  HARD_STOP=14:48  MAX_ITER=10  CLAUDE_MODEL=
#   FINAL_AT 이후 반복은 PROMPT-FINAL.md 를 쓴다. HARD_STOP 에는 실행 중인 에이전트를 강제 종료한다.
#   HARD_STOP 뒤 작업 트리가 더러우면 npm test 를 돌려 통과하면 자동 커밋, 실패하면 git stash 로 마지막 커밋 상태로 되돌린다.
set -u
cd "$(dirname "$0")"
AGENT="${1:-claude}"
NO_NEW_ITER="${NO_NEW_ITER:-14:40}"
FINAL_AT="${FINAL_AT:-14:30}"
HARD_STOP="${HARD_STOP:-14:48}"
MAX_ITER="${MAX_ITER:-10}"
FALLBACK_MODEL="${FALLBACK_MODEL:-claude-opus-5}"   # 기본 모델 과부하(529) 시 자동 전환. 빈 문자열이면 끔
FAST_FAIL_SEC="${FAST_FAIL_SEC:-90}"               # 이보다 빨리 끝난 반복은 실패로 보고 5분 쉰다
to_epoch() { date -d "today $1" +%s; }
NO_NEW_E=$(to_epoch "$NO_NEW_ITER"); FINAL_E=$(to_epoch "$FINAL_AT"); HARD_E=$(to_epoch "$HARD_STOP")
mkdir -p logs
log() { echo "[ralph $(date '+%H:%M:%S')] $*" | tee -a logs/ralph.log; }
log "시작 agent=$AGENT no_new=$NO_NEW_ITER final=$FINAL_AT hard=$HARD_STOP max=$MAX_ITER"
END_REASON="max_iter"

for i in $(seq 1 "$MAX_ITER"); do
  now=$(date +%s)
  if [ -f DONE ]; then log "DONE 발견 → 종료"; END_REASON="done"; break; fi
  if [ "$now" -ge "$NO_NEW_E" ]; then log "새 반복 금지 시각($NO_NEW_ITER) 경과 → 종료"; END_REASON="time"; break; fi
  if [ "$now" -ge "$FINAL_E" ]; then PROMPT_FILE=PROMPT-FINAL.md; else PROMPT_FILE=PROMPT.md; fi
  remain=$((HARD_E - now)); [ "$remain" -lt 60 ] && { log "남은 시간 1분 미만 → 종료"; END_REASON="time"; break; }
  PROMPT="$(cat "$PROMPT_FILE")"
  log "반복 $i 시작 (prompt=$PROMPT_FILE, 최대 ${remain}s)"
  iter_start=$(date +%s)
  case "$AGENT" in
    claude)
      MODEL_ARGS=(); [ -n "${CLAUDE_MODEL:-}" ] && MODEL_ARGS=(--model "$CLAUDE_MODEL")
      [ -n "$FALLBACK_MODEL" ] && MODEL_ARGS+=(--fallback-model "$FALLBACK_MODEL")
      env -u CLAUDECODE -u CLAUDE_CODE_CHILD_SESSION -u CLAUDE_CODE_ENTRYPOINT \
        CLAUDE_CONFIG_DIR="$HOME/.ralph-claude" \
        timeout -k 15s "${remain}s" \
        claude -p "$PROMPT" --dangerously-skip-permissions "${MODEL_ARGS[@]}" 2>&1 | tee -a "logs/iter-$i.log"
      ;;
    codex)
      timeout -k 15s "${remain}s" \
        codex exec --dangerously-bypass-approvals-and-sandbox --skip-git-repo-check -C . "$PROMPT" 2>&1 | tee -a "logs/iter-$i.log"
      ;;
    *) echo "알 수 없는 에이전트: $AGENT (claude|codex)"; exit 2;;
  esac
  rc=${PIPESTATUS[0]}; took=$(( $(date +%s) - iter_start ))
  log "반복 $i 끝 (exit=$rc, ${took}s)"
  if [ -f DONE ]; then continue; fi
  if [ "$took" -lt "$FAST_FAIL_SEC" ]; then
    log "경고: ${took}s 만에 끝났다 → 인증·사용량 한도·크래시 의심. logs/iter-$i.log 확인. 5분 뒤 재시도"
    sleep 300
  else
    sleep 5
  fi
done

# 시간 종료(또는 최대 반복)로 끝났을 때만 정리한다. DONE 으로 끝났으면 손대지 않는다.
if [ -f DONE ]; then END_REASON="done"; fi
if [ "$END_REASON" != "done" ] && [ -d .git ] && [ -n "$(git status --porcelain)" ]; then
  log "작업 트리가 더럽다 → npm test 로 판정"
  if timeout 300s npm test >logs/hardstop-test.log 2>&1; then
    git add -A && git commit -qm "하드 스톱 자동 커밋(테스트 통과)" && log "테스트 통과 → 자동 커밋"
  else
    git stash push -u -qm "hard-stop $(date '+%H:%M')"; mkdir -p logs; log "테스트 실패 → stash 로 마지막 커밋 상태 복원 (git stash list 로 회수 가능)"
  fi
fi
log "종료 사유: $END_REASON"
log "종료. DONE=$([ -f DONE ] && echo 있음 || echo 없음)"
[ -f DONE ] && cat DONE
echo "--- PLAN 체크 상태 ---"; grep -c '^- \[x\]' PLAN.md | xargs -I{} echo "완료 {} / $(grep -c '^- \[' PLAN.md)"
