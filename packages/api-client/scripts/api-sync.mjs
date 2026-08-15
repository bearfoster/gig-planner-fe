import { createHash } from "node:crypto";
import {
  copyFileSync,
  existsSync,
  readdirSync,
  readFileSync,
  statSync,
} from "node:fs";
import { spawnSync } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const mode = process.argv[2];
if (mode !== "refresh" && mode !== "check") {
  console.error("Usage: node scripts/api-sync.mjs <refresh|check>");
  process.exit(2);
}

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const backendRoot = resolve(
  process.env.GIG_PLANNER_BACKEND_DIR ??
    resolve(packageRoot, "../../../gig-planner-api-dotnet"),
);
const backendExport = resolve(backendRoot, "scripts/export-openapi.sh");
const backendSnapshot = resolve(backendRoot, "openapi/gig-planner-v1.json");
const frontendSnapshot = resolve(packageRoot, "openapi/gig-planner-v1.json");
const generated = resolve(packageRoot, "src/generated");

for (const required of [backendExport, backendSnapshot]) {
  if (!existsSync(required)) {
    console.error(
      `Backend OpenAPI handoff was not found at ${required}. Set GIG_PLANNER_BACKEND_DIR to the Phase 0B repository.`,
    );
    process.exit(1);
  }
}

const run = (command, args, cwd, env = process.env) => {
  const result = spawnSync(command, args, { cwd, env, stdio: "inherit" });
  if (result.status !== 0) process.exit(result.status ?? 1);
};

run(backendExport, mode === "check" ? ["--check"] : [], backendRoot);

if (mode === "refresh") {
  copyFileSync(backendSnapshot, frontendSnapshot);
  run("npm", ["run", "generate"], packageRoot);
  console.log(
    "Frontend OpenAPI snapshot and generated client refreshed from the backend contract.",
  );
  process.exit(0);
}

if (!readFileSync(backendSnapshot).equals(readFileSync(frontendSnapshot))) {
  console.error(
    "Frontend OpenAPI snapshot is stale. Run npm run api:refresh from the frontend repository root.",
  );
  process.exit(1);
}

const files = (directory) =>
  readdirSync(directory).flatMap((name) => {
    const path = resolve(directory, name);
    return statSync(path).isDirectory() ? files(path) : [path];
  });
const snapshot = () =>
  Object.fromEntries(
    files(generated).map((path) => [
      path.slice(generated.length),
      createHash("sha256").update(readFileSync(path)).digest("hex"),
    ]),
  );

const before = snapshot();
run("npm", ["run", "generate"], packageRoot);
const after = snapshot();
if (JSON.stringify(before) !== JSON.stringify(after)) {
  console.error(
    "Generated API files were stale. Commit the regenerated output.",
  );
  process.exit(1);
}

console.log(
  "Backend contract, frontend snapshot, and generated client are current.",
);
