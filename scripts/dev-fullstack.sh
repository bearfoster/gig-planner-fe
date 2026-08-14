#!/usr/bin/env bash

set -Eeuo pipefail

frontend_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
backend_dir="${GIG_PLANNER_BACKEND_DIR:-$(cd "$frontend_dir/.." && pwd)/gig-planner-api-dotnet}"
backend_project="$backend_dir/src/GigPlanner.Api/GigPlanner.Api.csproj"

api_port="${GIG_PLANNER_API_PORT:-5090}"
frontend_port="${GIG_PLANNER_FRONTEND_PORT:-5173}"
api_url="http://localhost:$api_port"
frontend_url="http://localhost:$frontend_port"

backend_pid=""
frontend_pid=""

fail() {
  printf 'Error: %s\n' "$*" >&2
  exit 1
}

require_command() {
  command -v "$1" >/dev/null 2>&1 || fail "Required command '$1' was not found."
}

require_free_port() {
  local port="$1"
  local label="$2"
  if lsof -nP -iTCP:"$port" -sTCP:LISTEN >/dev/null 2>&1; then
    fail "$label port $port is already in use. Stop the existing process and try again."
  fi
}

stop_process() {
  local pid="$1"
  if [[ -n "$pid" ]] && kill -0 "$pid" >/dev/null 2>&1; then
    kill "$pid" >/dev/null 2>&1 || true
  fi
}

cleanup() {
  trap - EXIT INT TERM
  stop_process "$frontend_pid"
  stop_process "$backend_pid"
  [[ -z "$frontend_pid" ]] || wait "$frontend_pid" 2>/dev/null || true
  [[ -z "$backend_pid" ]] || wait "$backend_pid" 2>/dev/null || true
}

handle_signal() {
  exit 130
}

wait_for_url() {
  local url="$1"
  local pid="$2"
  local label="$3"
  local attempt

  for attempt in {1..60}; do
    if curl --fail --silent --output /dev/null "$url"; then
      return 0
    fi
    if ! kill -0 "$pid" >/dev/null 2>&1; then
      wait "$pid" || true
      fail "$label exited before becoming ready."
    fi
    sleep 1
  done

  fail "$label did not become ready at $url within 60 seconds."
}

trap cleanup EXIT
trap handle_signal INT TERM

require_command curl
require_command dotnet
require_command lsof
require_command npm

[[ -f "$backend_project" ]] || fail \
  "Backend project not found at $backend_project. Set GIG_PLANNER_BACKEND_DIR if it is elsewhere."
[[ -f "$frontend_dir/package.json" ]] || fail "Frontend package.json was not found at $frontend_dir."
[[ -d "$frontend_dir/node_modules" ]] || fail "Frontend dependencies are missing. Run 'npm install' first."

require_free_port "$api_port" "Backend"
require_free_port "$frontend_port" "Frontend"

printf 'Starting backend at %s\n' "$api_url"
(
  cd "$backend_dir"
  exec env ASPNETCORE_ENVIRONMENT=Development ASPNETCORE_URLS="$api_url" \
    Cors__AllowedOrigins__0="$frontend_url" DOTNET_NOLOGO=1 \
    dotnet run --project "$backend_project" --no-launch-profile
) &
backend_pid=$!

wait_for_url "$api_url/health" "$backend_pid" "Backend"
printf 'Backend is ready.\n'

printf 'Starting frontend at %s\n' "$frontend_url"
(
  cd "$frontend_dir"
  exec env VITE_ENABLE_MOCK_API=false VITE_API_BASE_URL="$api_url" \
    npm run dev -- --host localhost --port "$frontend_port" --strictPort
) &
frontend_pid=$!

wait_for_url "$frontend_url" "$frontend_pid" "Frontend"
printf '\nFull stack is ready:\n  Frontend: %s\n  Backend:  %s\n\nPress Ctrl+C to stop both servers.\n' \
  "$frontend_url" "$api_url"

while kill -0 "$backend_pid" >/dev/null 2>&1 && kill -0 "$frontend_pid" >/dev/null 2>&1; do
  sleep 1
done

exit_status=1
if ! kill -0 "$backend_pid" >/dev/null 2>&1; then
  set +e
  wait "$backend_pid"
  exit_status=$?
  set -e
  printf 'Backend exited; stopping frontend.\n' >&2
else
  set +e
  wait "$frontend_pid"
  exit_status=$?
  set -e
  printf 'Frontend exited; stopping backend.\n' >&2
fi

((exit_status == 0)) && exit_status=1
exit "$exit_status"
