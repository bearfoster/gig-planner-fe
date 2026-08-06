import { createHash } from "node:crypto";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { resolve } from "node:path";

const generated = resolve("src/api/generated");
const files = (dir) =>
  readdirSync(dir).flatMap((name) => {
    const path = resolve(dir, name);
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
const result = spawnSync("npm", ["run", "api:generate"], { stdio: "inherit" });
if (result.status !== 0) process.exit(result.status ?? 1);
const after = snapshot();
if (JSON.stringify(before) !== JSON.stringify(after)) {
  console.error(
    "\nGenerated API files were stale. Commit the regenerated output.",
  );
  process.exit(1);
}
console.log("Generated API files are current.");
