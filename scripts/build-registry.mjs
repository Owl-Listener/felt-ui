// Generates the shadcn-compatible registry from source so `felt add <name>`
// (and `npx shadcn add <url>`) ship the real component code without drift.
//
//   node scripts/build-registry.mjs
//
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = resolve(root, "registry");

const read = (p) => readFile(resolve(root, p), "utf8");

// One registry item per primitive. `files[].target` is where the file lands
// in the consumer's project; `@/` imports resolve against their shadcn setup.
const items = [
  {
    name: "tool-call",
    type: "registry:component",
    title: "Tool Call",
    description:
      "A calm action card for agent tool use: intent + parameters before acting, approve/deny, an irreversible 'can't be undone' guard, and an honest status lifecycle. Accessible by default.",
    dependencies: [
      "@radix-ui/react-slot",
      "class-variance-authority",
      "clsx",
      "tailwind-merge",
      "lucide-react",
    ],
    registryDependencies: [],
    files: [
      { src: "src/lib/utils.ts", target: "lib/utils.ts", type: "registry:lib" },
      {
        src: "src/components/ui/button.tsx",
        target: "components/ui/button.tsx",
        type: "registry:ui",
      },
      {
        src: "src/components/ui/badge.tsx",
        target: "components/ui/badge.tsx",
        type: "registry:ui",
      },
      {
        src: "src/components/tool-call/tool-call.tsx",
        target: "components/felt/tool-call.tsx",
        type: "registry:component",
      },
    ],
  },
  {
    name: "plan",
    type: "registry:component",
    title: "Plan / Steps",
    description:
      "Agent plan visibility with live per-step status. Accessible ordered list — status as text + colour, aria-current on the active step, progress summary, and ARIA live announcements.",
    dependencies: ["clsx", "tailwind-merge", "lucide-react"],
    registryDependencies: [],
    files: [
      { src: "src/lib/utils.ts", target: "lib/utils.ts", type: "registry:lib" },
      {
        src: "src/components/plan/plan.tsx",
        target: "components/felt/plan.tsx",
        type: "registry:component",
      },
    ],
  },
  {
    name: "confidence",
    type: "registry:component",
    title: "Confidence",
    description:
      "Communicate calibrated uncertainty, honestly. An accessible meter (role=meter) whose band is conveyed by label + icon + colour — never colour alone — so low confidence reads as caution.",
    dependencies: ["clsx", "tailwind-merge", "lucide-react"],
    registryDependencies: [],
    files: [
      { src: "src/lib/utils.ts", target: "lib/utils.ts", type: "registry:lib" },
      {
        src: "src/components/confidence/confidence.tsx",
        target: "components/felt/confidence.tsx",
        type: "registry:component",
      },
    ],
  },
];

await mkdir(outDir, { recursive: true });

const index = {
  $schema: "https://ui.shadcn.com/schema/registry.json",
  name: "felt-ui",
  homepage: "https://github.com/owl-listener/felt-ui",
  items: [],
};

for (const item of items) {
  const files = [];
  for (const f of item.files) {
    files.push({
      path: f.target,
      type: f.type,
      target: f.target,
      content: await read(f.src),
    });
  }

  const registryItem = {
    $schema: "https://ui.shadcn.com/schema/registry-item.json",
    name: item.name,
    type: item.type,
    title: item.title,
    description: item.description,
    dependencies: item.dependencies,
    registryDependencies: item.registryDependencies,
    files,
  };

  await writeFile(
    resolve(outDir, `${item.name}.json`),
    JSON.stringify(registryItem, null, 2) + "\n",
  );

  index.items.push({
    name: item.name,
    type: item.type,
    title: item.title,
    description: item.description,
  });
}

await writeFile(
  resolve(outDir, "registry.json"),
  JSON.stringify(index, null, 2) + "\n",
);

console.log(
  `Registry built: ${items.length} item(s) → ${outDir}/registry.json`,
);
