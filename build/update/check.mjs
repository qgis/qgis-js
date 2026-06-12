#!/usr/bin/env node
/**
 * Checks a single engine from package.json "engines" for available updates.
 *
 * - Uses `git ls-remote` for GitHub-hosted upstreams (no API tokens, no rate limits)
 * - Respects the "track" constraint in build/update/engines.json
 *   (only in-track updates are proposed; major bumps are a manual decision)
 *
 * Usage:   node build/update/check.mjs <engine>
 * Output:  single-line JSON on stdout, e.g.
 *   {"engine":"qgis","current":"4.0.0","latest":"4.0.3","needsUpdate":true,
 *    "details":{"tag":"final-4_0_3","commit":"70e40ae..."}}
 *
 * Also writes the same JSON to $GITHUB_OUTPUT (key "result") when run in CI.
 */

import { readFileSync, appendFileSync } from "node:fs";
import { execFileSync } from "node:child_process";

const engine = process.argv[2];
if (!engine) {
  console.error("usage: node build/update/check.mjs <engine>");
  process.exit(2);
}

const pkg = JSON.parse(readFileSync("package.json", "utf-8"));
const config = JSON.parse(readFileSync("build/update/engines.json", "utf-8"));

const current = pkg.engines?.[engine];
const cfg = config[engine];
if (!current || !cfg) {
  console.error(
    `engine "${engine}" not found in package.json engines / engines.json`,
  );
  process.exit(2);
}

/** numeric-aware version compare for dotted versions */
function cmp(a, b) {
  const pa = a.split(".").map(Number);
  const pb = b.split(".").map(Number);
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const d = (pa[i] ?? 0) - (pb[i] ?? 0);
    if (d !== 0) return d;
  }
  return 0;
}

function inTrack(version, track) {
  if (!track) return true;
  return version === track || version.startsWith(track + ".");
}

/** list tags of a remote repo via git ls-remote (no API limits) */
function lsRemoteTags(repo) {
  const out = execFileSync(
    "git",
    ["ls-remote", "--tags", `https://github.com/${repo}.git`],
    { encoding: "utf-8", maxBuffer: 64 * 1024 * 1024 },
  );
  const tags = new Map(); // tag -> { sha, peeled }
  for (const line of out.trim().split("\n")) {
    const [sha, ref] = line.split("\t");
    const m = ref?.match(/^refs\/tags\/(.+?)(\^\{\})?$/);
    if (!m) continue;
    const [, tag, peeled] = m;
    const entry = tags.get(tag) ?? {};
    if (peeled) entry.peeled = sha;
    else entry.sha = sha;
    tags.set(tag, entry);
  }
  return tags;
}

async function check() {
  switch (cfg.strategy) {
    case "node-dist": {
      const res = await fetch("https://nodejs.org/dist/index.json");
      const releases = await res.json();
      const candidates = releases
        .map((r) => r.version.replace(/^v/, ""))
        .filter((v) => inTrack(v, cfg.track));
      candidates.sort(cmp);
      const latest = candidates.at(-1);
      return { latest, details: {} };
    }

    case "npm-dist-tag": {
      const res = await fetch(`https://registry.npmjs.org/${cfg.package}`);
      const data = await res.json();
      const tag = cfg.track ? `latest-${cfg.track}` : "latest";
      const latest = data["dist-tags"]?.[tag];
      if (!latest)
        throw new Error(`dist-tag "${tag}" not found for ${cfg.package}`);
      return { latest, details: { distTag: tag } };
    }

    case "github-semver-tag": {
      const tags = lsRemoteTags(cfg.repo);
      const candidates = [...tags.keys()]
        .filter((t) => /^\d+\.\d+\.\d+$/.test(t))
        .filter((t) => inTrack(t, cfg.track));
      candidates.sort(cmp);
      const latest = candidates.at(-1);
      const entry = tags.get(latest);
      return {
        latest,
        details: { tag: latest, commit: entry.peeled ?? entry.sha },
      };
    }

    case "vcpkg-release-tag": {
      const tags = lsRemoteTags(cfg.repo);
      const candidates = [...tags.keys()].filter((t) =>
        /^20\d{2}\.\d{2}\.\d{2}$/.test(t),
      );
      candidates.sort(cmp);
      const latest = candidates.at(-1);
      const entry = tags.get(latest);
      const details = {
        tag: latest,
        commit: entry.peeled ?? entry.sha,
        derived: {},
      };
      // resolve derived engine versions (e.g. qt from ports/qtbase/vcpkg.json)
      for (const [derivedEngine, path] of Object.entries(cfg.derives ?? {})) {
        const res = await fetch(
          `https://raw.githubusercontent.com/${cfg.repo}/${latest}/${path}`,
        );
        const manifest = await res.json();
        details.derived[derivedEngine] = {
          current: pkg.engines?.[derivedEngine],
          latest: manifest.version ?? manifest["version-semver"],
        };
      }
      return { latest, details };
    }

    case "qgis-master-commit": {
      // qgis-js tracks QGIS *master*, not a final-X_Y_Z release tag: the WASM
      // build fixes (e.g. PR #64469) are merged to master and are NOT
      // backported to the release branches, so a release tag would drop them.
      // We therefore pin the master HEAD commit and detect updates by comparing
      // that commit to the one currently pinned in the overlay portfile —
      // master's declared version (e.g. 4.1.0) barely moves between commits.
      const branch = cfg.branch ?? "master";
      const out = execFileSync(
        "git",
        [
          "ls-remote",
          `https://github.com/${cfg.repo}.git`,
          `refs/heads/${branch}`,
        ],
        { encoding: "utf-8" },
      );
      const commit = out.split("\t")[0]?.trim();
      if (!commit || !/^[0-9a-f]{40}$/.test(commit)) {
        throw new Error(`could not resolve ${branch} HEAD for ${cfg.repo}`);
      }
      // declared version on master -> engines.qgis + README "based on QGIS x"
      const cmlRes = await fetch(
        `https://raw.githubusercontent.com/${cfg.repo}/${commit}/CMakeLists.txt`,
      );
      const cml = await cmlRes.text();
      const ver = ["MAJOR", "MINOR", "PATCH"].map(
        (k) =>
          cml.match(new RegExp(`CPACK_PACKAGE_VERSION_${k} "(\\d+)"`))?.[1],
      );
      const version = ver.every(Boolean) ? ver.join(".") : current;
      // the currently pinned commit lives in the overlay portfile, not in engines
      const portfile = readFileSync(`${cfg.port}/portfile.cmake`, "utf-8");
      const currentRef = portfile.match(/REF\s+([0-9a-f]{40})/)?.[1];
      return {
        latest: version,
        needsUpdate: commit !== currentRef,
        details: { branch, commit, currentRef },
      };
    }

    default:
      throw new Error(`unknown strategy "${cfg.strategy}"`);
  }
}

const checked = await check();
const { latest, details } = checked;
const result = {
  engine,
  current,
  latest,
  // most engines update by version; commit-pinned engines (qgis = master HEAD)
  // provide their own needsUpdate since the declared version barely moves
  needsUpdate: checked.needsUpdate ?? cmp(latest, current) > 0,
  details,
};
const json = JSON.stringify(result);
console.log(json);
if (process.env.GITHUB_OUTPUT) {
  appendFileSync(process.env.GITHUB_OUTPUT, `result=${json}\n`);
  appendFileSync(
    process.env.GITHUB_OUTPUT,
    `needs_update=${result.needsUpdate}\n`,
  );
  appendFileSync(process.env.GITHUB_OUTPUT, `latest=${latest}\n`);
}
