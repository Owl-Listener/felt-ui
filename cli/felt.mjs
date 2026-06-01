#!/usr/bin/env node
// felt — add Felt UI trust primitives to your project.
//
// Thin wrapper around the shadcn CLI that points at the Felt registry, so the
// component source is copied straight into your project (you own the code).
//
//   felt add tool-call
//   felt add plan confidence citation
//   felt list
//
// Any extra flags (e.g. --yes, --overwrite, --cwd, --path) are forwarded to
// shadcn. Override the registry with --registry <url> or FELT_REGISTRY.

import { spawn } from "node:child_process";

const DEFAULT_REGISTRY =
  process.env.FELT_REGISTRY ?? "https://owl-listener.github.io/felt-ui/r";

// Kept in sync with registry/registry.json; used for `list` and validation.
const COMPONENTS = [
  ["tool-call", "Approve/deny an agent action, with a can't-be-undone guard"],
  ["plan", "Agent plan visibility with live per-step status"],
  ["confidence", "Calibrated uncertainty as an accessible meter"],
  ["citation", "Verifiable inline source attribution + sources list"],
  ["refusal", "Graceful decline with ways forward"],
  ["message", "Accessible streaming Message + Composer"],
];

const HELP = `felt — Felt UI's component installer

Usage
  felt add <component...>     Add one or more primitives to your project
  felt list                   List available primitives
  felt help                   Show this help

Options (for \`add\`)
  --registry <url>            Registry base URL (default: ${DEFAULT_REGISTRY})
  All other flags are forwarded to shadcn (e.g. --yes, --overwrite, --cwd).

Examples
  felt add tool-call
  felt add plan confidence --yes
  npx @felt-ui/react add refusal
`;

function fail(message) {
  console.error(`felt: ${message}`);
  process.exit(1);
}

async function listComponents(registry) {
  try {
    const res = await fetch(`${registry}/registry.json`);
    if (res.ok) {
      const json = await res.json();
      if (Array.isArray(json.items) && json.items.length) {
        return json.items.map((i) => [i.name, i.description ?? ""]);
      }
    }
  } catch {
    // Offline or registry unreachable — fall back to the bundled list.
  }
  return COMPONENTS;
}

function runShadcn(args) {
  return new Promise((resolve) => {
    const child = spawn("npx", ["shadcn@latest", ...args], {
      stdio: "inherit",
      shell: process.platform === "win32",
    });
    child.on("error", (err) =>
      fail(`could not launch shadcn (${err.message}). Is npx available?`),
    );
    child.on("close", (code) => resolve(code ?? 0));
  });
}

async function main() {
  const argv = process.argv.slice(2);
  const command = argv[0];

  if (!command || command === "help" || command === "--help" || command === "-h") {
    process.stdout.write(HELP);
    return;
  }

  if (command === "--version" || command === "-v" || command === "version") {
    // Resolved lazily so the CLI works even if package.json moves.
    const { readFile } = await import("node:fs/promises");
    const { fileURLToPath } = await import("node:url");
    try {
      const pkg = JSON.parse(
        await readFile(
          fileURLToPath(new URL("../package.json", import.meta.url)),
          "utf8",
        ),
      );
      console.log(pkg.version);
    } catch {
      console.log("unknown");
    }
    return;
  }

  // Pull out --registry <url> wherever it appears; forward the rest.
  const rest = [];
  let registry = DEFAULT_REGISTRY;
  for (let i = 1; i < argv.length; i++) {
    if (argv[i] === "--registry") {
      registry = argv[++i];
      if (!registry) fail("--registry needs a URL");
    } else if (argv[i].startsWith("--registry=")) {
      registry = argv[i].slice("--registry=".length);
    } else {
      rest.push(argv[i]);
    }
  }

  if (command === "list") {
    const items = await listComponents(registry);
    console.log("Available Felt UI primitives:\n");
    const width = Math.max(...items.map(([n]) => n.length));
    for (const [name, desc] of items) {
      console.log(`  ${name.padEnd(width)}  ${desc}`);
    }
    console.log(`\nAdd one with:  felt add <component>`);
    return;
  }

  if (command === "add") {
    const names = rest.filter((a) => !a.startsWith("-"));
    const flags = rest.filter((a) => a.startsWith("-"));
    if (names.length === 0) {
      fail("nothing to add. Try `felt add tool-call` or `felt list`.");
    }
    const urls = names.map((n) => `${registry}/${n}.json`);
    const code = await runShadcn(["add", ...urls, ...flags]);
    process.exit(code);
  }

  fail(`unknown command "${command}". Run \`felt help\`.`);
}

main();
