// Copy the generated registry into the docs site's public dir so it's served
// at `<site>/r/<name>.json` — the URL the `felt` CLI points at by default.
//
//   node scripts/copy-registry.mjs
//
import { cp, mkdir, rm } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const from = resolve(root, "registry");
const to = resolve(root, "docs/public/r");

await rm(to, { recursive: true, force: true });
await mkdir(to, { recursive: true });
await cp(from, to, { recursive: true });

console.log(`Registry copied → docs/public/r`);
