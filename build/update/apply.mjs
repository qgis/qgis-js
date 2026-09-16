#!/usr/bin/env node
/**
 * Applies an engine update to the working tree (multi-file edits per engine).
 * Takes the JSON produced by check.mjs on stdin or as argv[3].
 *
 * Usage:
 *   node build/update/check.mjs qgis | node build/update/apply.mjs qgis
 *   node build/update/apply.mjs qgis '{"engine":"qgis","latest":"4.0.3",...}'
 *
 * Edits performed per engine:
 *   node:  package.json engines.node, .nvmrc
 *   pnpm:  package.json engines.pnpm + packageManager + devDependencies.pnpm
 *          (lockfile refresh is done by the workflow: pnpm install --lockfile-only --ignore-scripts)
 *   emsdk: package.json engines.emsdk, build/scripts/install.sh,
 *          build/emsdk submodule -> release tag
 *   vcpkg: package.json engines.vcpkg (+ derived engines.qt),
 *          build/vcpkg submodule -> release tag, README Qt version mentions
 *   qgis:  package.json engines.qgis, build/vcpkg-ports/qgis/vcpkg.json,
 *          build/vcpkg-ports/qgis/portfile.cmake (REF + SHA512, tarball is
 *          downloaded and hashed), README "based on QGIS x" mentions
 */

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";

const engine = process.argv[2];
let input = process.argv[3];
if (!input) input = readFileSync(0, "utf-8"); // stdin
const update = JSON.parse(input);
if (!engine || update.engine !== engine) {
  console.error("usage: node build/update/apply.mjs <engine> [check-json]");
  process.exit(2);
}
if (!update.needsUpdate) {
  console.log(`${engine}: already up to date (${update.current})`);
  process.exit(0);
}

const { current, latest, details } = update;
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// `optional: true` is for best-effort edits (README mentions regenerated
// properly later by `./qgis-js.ts libs -o markdown`) where a missing pattern
// just means the wording moved and isn't worth failing the update over.
// Every other edit is required: a missing pattern there means something we
// actually depend on (engines, packageManager, an emsdk command, the QGIS
// REF/SHA) didn't get updated, so silently reporting success would be wrong.
function editFile(path, edits, { optional = false } = {}) {
  let text = readFileSync(path, "utf-8");
  for (const [pattern, replacement] of edits) {
    const re = new RegExp(pattern, "g");
    if (!re.test(text)) {
      if (optional) {
        console.warn(`WARN: pattern not found in ${path}: ${pattern}`);
        continue;
      }
      throw new Error(`required pattern not found in ${path}: ${pattern}`);
    }
    text = text.replace(re, replacement);
  }
  writeFileSync(path, text);
  console.log(`updated ${path}`);
}

function setEngine(name, version) {
  editFile("package.json", [
    [`"${name}": "${esc(pkgEngines[name])}"`, `"${name}": "${version}"`],
  ]);
  pkgEngines[name] = version;
}

function checkoutSubmoduleTag(path, tag) {
  // shallow-init the submodule, then fetch and check out the release tag
  execFileSync("git", ["submodule", "update", "--init", "--depth", "1", path], {
    stdio: "inherit",
  });
  execFileSync(
    "git",
    ["-C", path, "fetch", "--depth", "1", "origin", "tag", tag],
    {
      stdio: "inherit",
    },
  );
  execFileSync("git", ["-C", path, "checkout", `tags/${tag}`], {
    stdio: "inherit",
  });
  console.log(`submodule ${path} -> ${tag}`);
}

const pkg = JSON.parse(readFileSync("package.json", "utf-8"));
const pkgEngines = { ...pkg.engines };
const readmes = ["README.md", "packages/qgis-js/README.md"].filter(existsSync);

switch (engine) {
  case "node": {
    setEngine("node", latest);
    writeFileSync(".nvmrc", `v${latest}\n`);
    console.log("updated .nvmrc");
    break;
  }

  case "pnpm": {
    // setEngine's global regex replace also catches devDependencies.pnpm,
    // since it's textually identical to engines.pnpm ("pnpm": "<version>");
    // only packageManager needs a separate edit here.
    setEngine("pnpm", latest);
    editFile("package.json", [
      [
        `"packageManager": "pnpm@${esc(current)}"`,
        `"packageManager": "pnpm@${latest}"`,
      ],
    ]);
    break;
  }

  case "emsdk": {
    setEngine("emsdk", latest);
    editFile("build/scripts/install.sh", [
      [`emsdk install ${esc(current)}`, `emsdk install ${latest}`],
      [`emsdk activate ${esc(current)}`, `emsdk activate ${latest}`],
    ]);
    checkoutSubmoduleTag("build/emsdk", details.tag);
    break;
  }

  case "vcpkg": {
    setEngine("vcpkg", latest);
    checkoutSubmoduleTag("build/vcpkg", details.tag);
    // derived engines (qt): version is determined by the new vcpkg baseline
    for (const [derived, info] of Object.entries(details.derived ?? {})) {
      if (info.latest && info.latest !== info.current) {
        setEngine(derived, info.latest);
        // best effort: bump version mentions in the README dependency tables;
        // the canonical table is regenerated after a successful build with
        // `./qgis-js.ts libs -o markdown`
        for (const readme of readmes) {
          editFile(
            readme,
            [[`\\(${esc(info.current)}\\)`, `(${info.latest})`]],
            { optional: true },
          );
        }
      }
    }
    break;
  }

  case "qgis": {
    setEngine("qgis", latest);

    // port manifest: when the declared version changes, set it and reset
    // port-version; when it is unchanged (a force-moved release-tag re-pin --
    // the same final-X_Y_Z tag re-pointed at a different commit) bump
    // port-version instead so vcpkg treats it as a new port revision.
    const portManifestPath = "build/vcpkg-ports/qgis/vcpkg.json";
    const portManifest = JSON.parse(readFileSync(portManifestPath, "utf-8"));
    if (portManifest.version === latest) {
      portManifest["port-version"] = (portManifest["port-version"] ?? 0) + 1;
    } else {
      portManifest.version = latest;
      delete portManifest["port-version"];
    }
    writeFileSync(
      portManifestPath,
      JSON.stringify(portManifest, null, 2) + "\n",
    );
    console.log(`updated ${portManifestPath}`);

    // portfile: new REF (peeled release-tag commit) + SHA512 of the source tarball
    console.log(
      `downloading QGIS source tarball for ${details.commit} to compute SHA512 ...`,
    );
    const res = await fetch(
      `https://github.com/qgis/QGIS/archive/${details.commit}.tar.gz`,
    );
    if (!res.ok) throw new Error(`tarball download failed: ${res.status}`);
    const hash = createHash("sha512");
    for await (const chunk of res.body) hash.update(chunk);
    const sha512 = hash.digest("hex");

    editFile("build/vcpkg-ports/qgis/portfile.cmake", [
      [`REF [0-9a-f]{40}`, `REF ${details.commit}`],
      [`SHA512 [0-9a-f]{128}`, `SHA512 ${sha512}`],
    ]);

    for (const readme of readmes) {
      editFile(readme, [
        [`\\(based on QGIS ${esc(current)}\\)`, `(based on QGIS ${latest})`],
        [`\\*\\*qgis\\*\\* \\(${esc(current)}\\)`, `**qgis** (${latest})`],
      ]);
    }
    break;
  }

  default:
    console.error(`no apply logic for engine "${engine}"`);
    process.exit(2);
}

console.log(`\n${engine}: ${current} -> ${latest} applied`);
