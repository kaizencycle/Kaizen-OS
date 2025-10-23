#!/usr/bin/env bash
set -e
BASE=${BASE:-http://localhost:8080}
SID=$(curl -sX POST $BASE/v1/session/start -H 'content-type: application/json' \
  -d '{"user_id":"michael","mentors":["gemini","claude","deepseek","perplexity"]}' | jq -r .session_id)
echo "session: $SID"
curl -sX POST $BASE/v1/session/submit -H 'content-type: application/json' \
  -d "{\"session_id\":\"$SID\",\"user_id\":\"michael\",\"prompt\":\"Explain gravity\",\"answer\":\"Gravity is the curvature of spacetime; therefore objects follow geodesics...\"}" | jq .
