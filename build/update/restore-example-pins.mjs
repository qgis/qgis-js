#!/usr/bin/env node
/**
 * Restores each docs/examples/<example> package.json's qgis-js / @qgis-js/ol
 * dependency specifiers to a real npm version if `pnpm update` rewrote them
 * to workspace:<star>.
 *
 * The examples intentionally pin a real version (e.g. "4.2.2"), not the
 * workspace: protocol, so they install standalone on StackBlitz, where
 * workspace:* resolves to nothing. linkWorkspacePackages (pnpm-workspace.yaml)
 * still links them to the local packages/* copy during normal monorepo
 * development, as long as the declared version is satisfied by the local
 * package's own version. The catch: `pnpm update -r` "helpfully" rewrites
 * any workspace-satisfied specifier back to workspace:* on *any* run, even
 * without --latest (confirmed by reproducing it in isolation) -- this script
 * undoes that.
 *
 * Run this after `pnpm update`, then a plain `pnpm install --lockfile-only`
 * (NOT update) to reconcile the lockfile -- install doesn't re-trigger the
 * rewrite the way update does.
 *
 * Usage: node build/update/restore-example-pins.mjs
 */

import { readFileSync, writeFileSync, readdirSync } from "node:fs";

const PINNED = {
  "qgis-js": JSON.parse(readFileSync("packages/qgis-js/package.json", "utf-8"))
    .version,
  "@qgis-js/ol": JSON.parse(
    readFileSync("packages/qgis-js-ol/package.json", "utf-8"),
  ).version,
};

for (const dir of readdirSync("docs/examples")) {
  const path = `docs/examples/${dir}/package.json`;
  let pkg;
  try {
    pkg = JSON.parse(readFileSync(path, "utf-8"));
  } catch {
    continue;
  }
  let changed = false;
  for (const [name, version] of Object.entries(PINNED)) {
    if (pkg.dependencies?.[name]?.startsWith("workspace:")) {
      pkg.dependencies[name] = version;
      changed = true;
    }
  }
  if (changed) {
    writeFileSync(path, JSON.stringify(pkg, null, 2) + "\n");
    console.log(`restored ${path}`);
  }
}
