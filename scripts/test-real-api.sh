#!/usr/bin/env bash

set -Eeuo pipefail

frontend_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
backend_dir="${GIG_PLANNER_BACKEND_DIR:-$(cd "$frontend_dir/.." && pwd)/gig-planner-api-dotnet}"
api_port="${GIG_PLANNER_TEST_API_PORT:-5091}"
member_port="${GIG_PLANNER_TEST_MEMBER_PORT:-4174}"
api_url="http://127.0.0.1:$api_port"
member_url="http://127.0.0.1:$member_port"
database_path="$(mktemp "${TMPDIR:-/tmp}/gig-planner-integration.XXXXXX.db")"
api_pid=""
member_pid=""

cleanup() {
  trap - EXIT INT TERM
  [[ -z "$member_pid" ]] || kill "$member_pid" >/dev/null 2>&1 || true
  [[ -z "$api_pid" ]] || kill "$api_pid" >/dev/null 2>&1 || true
  [[ -z "$member_pid" ]] || wait "$member_pid" 2>/dev/null || true
  [[ -z "$api_pid" ]] || wait "$api_pid" 2>/dev/null || true
  rm -f "$database_path" "$database_path-shm" "$database_path-wal"
}
trap cleanup EXIT INT TERM

wait_for_url() {
  local url="$1"
  local pid="$2"
  local label="$3"
  for _ in {1..90}; do
    curl --fail --silent --output /dev/null "$url" && return 0
    kill -0 "$pid" >/dev/null 2>&1 || {
      wait "$pid" || true
      printf '%s exited before becoming ready.\n' "$label" >&2
      exit 1
    }
    sleep 1
  done
  printf '%s did not become ready at %s.\n' "$label" "$url" >&2
  exit 1
}

(
  cd "$backend_dir"
  exec env ASPNETCORE_ENVIRONMENT=Development ASPNETCORE_URLS="$api_url" \
    ConnectionStrings__GigPlanner="Data Source=$database_path" \
    Cors__AllowedOrigins__0="$member_url" DOTNET_NOLOGO=1 \
    Logging__LogLevel__Microsoft.EntityFrameworkCore=Warning \
    dotnet run --project src/GigPlanner.Api --no-launch-profile
) &
api_pid=$!
wait_for_url "$api_url/health" "$api_pid" "Backend"

(
  cd "$frontend_dir"
  VITE_ENABLE_MOCK_API=false VITE_API_BASE_URL="$api_url" \
    npm run build --workspace @gig-planner/member-web
  cd apps/member-web
  exec ../../node_modules/.bin/vite preview \
    --host 127.0.0.1 --port "$member_port" --strictPort
) &
member_pid=$!
wait_for_url "$member_url" "$member_pid" "Member web"

cd "$frontend_dir"
PLAYWRIGHT_BASE_URL="$member_url" npx playwright test \
  --config apps/member-web/playwright.real-api.config.ts
