# Engine update automation

This document describes how the versions listed in `package.json` → `"engines"`
are kept up to date automatically, and how the involved GitHub Actions and
config files fit together.

## The engines and where they live

| Engine  | What pins it                                                                                                                                                                 | Files touched on update                                                                                                                                                                           |
| ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `node`  | `engines.node` (consumed by `actions/setup-node` via `node-version-file`)                                                                                                    | `package.json`, `.nvmrc`                                                                                                                                                                          |
| `pnpm`  | `packageManager` field (consumed by corepack / `pnpm/action-setup`)                                                                                                          | `package.json` (`engines.pnpm`, `packageManager`, `devDependencies.pnpm`), `pnpm-lock.yaml`                                                                                                       |
| `emsdk` | `engines.emsdk`, read at install time by `build/actions/install.ts`                                                                                                          | `package.json`, `build/scripts/install.sh`, `build/emsdk` submodule (pinned to the release tag)                                                                                                   |
| `vcpkg` | `build/vcpkg` submodule commit (= release tag)                                                                                                                               | `package.json` (`engines.vcpkg` **and** `engines.qt`), `build/vcpkg` submodule, README tables                                                                                                     |
| `qt`    | **derived** — whatever `ports/qtbase` ships at the vcpkg baseline                                                                                                            | updated as part of a vcpkg update; not independently pinnable without an overlay port                                                                                                             |
| `qgis`  | overlay port `build/vcpkg-ports/qgis` — pinned to the latest `final-X_Y_Z` **release tag** (`REF` = tag's peeled commit + `SHA512`), guarded by a required-ancestor check (see [insights](#insights-from-the-2026-06-upgrade)) | `package.json`, `build/vcpkg-ports/qgis/vcpkg.json` (version; port-version **bumped** on a same-version re-pin, reset only on a version change), `build/vcpkg-ports/qgis/portfile.cmake`, READMEs |

There are therefore **5 independent update units**, not 6: a vcpkg baseline
bump implies a Qt bump (and bumps of GDAL, PROJ, GEOS, … as well — those are
not listed in `engines` but change with the baseline).

Major version bumps are **deliberately not automated**. The `track` field in
`build/update/engines.json` constrains automation to in-track updates; bumping
the track is a manual, reviewed decision. As of the 2026-06 upgrade the tracks
are **node 24**, **pnpm 11**, **emsdk 5**, **vcpkg** (rolling baseline); the next
majors (pnpm 12, Emscripten 6, Node 26, …) stay manual. `qgis` has **no track**
— it follows the latest `final-X_Y_Z` release tag, guarded by a
required-ancestor check (see [insights](#insights-from-the-2026-06-upgrade)).

## Insights from the 2026-06 upgrade

The first full manual run of this upgrade (node 22→24, pnpm 10→11, emsdk
5.0.2→5.0.7, vcpkg 2025.12.12→2026.06.01 / Qt 6.10→6.11, QGIS → `master` 4.1)
surfaced things the automation has to account for.

### qgis: release tags, never a downgrade

QGIS PR #64469 ("wasm fixes for qgis-js") merged to `master` on 2026-03-13,
carrying build fixes with no equivalent anywhere else. At the time,
`release-4_0` had already branched off `master` **before** that merge, so
`4.0.x` tags never got it and never will — a naïve "latest `final-X_Y_Z` tag"
strategy would have silently pinned a broken build. That's why this port
originally tracked `master` HEAD instead of a tag (`qgis-master-commit`
strategy, since removed): correct, but it meant riding master's instability
and losing the "pin a released version" property entirely.

`release-4_2` branched off `master` **after** PR #64469 merged, so `4.2.x`
tags carry the fix natively — confirmed via `gh api
repos/qgis/QGIS/compare/final-4_2_2...1a63925...` (`ahead_by: 0`, i.e. the fix
commit is an ancestor of the tag). Since that fix is on `master` permanently,
every `final-X_Y_Z` tag cut from here on inherits it automatically — there's
nothing left to keep re-verifying for this specific commit. A **new**
master-only fix landing later (the same situation #64469 once was) wouldn't
be caught by `check`/`apply` at all; the full compile is what would surface
it (wasm build fails to link), the same way it did originally. `engines.json`
now uses **`qgis-release-tag`**: pin the latest `final-X_Y_Z` tag's peeled
commit. `apply.mjs` needed no changes — it only ever consumed
`latest`/`details.commit`, regardless of how `check.mjs` derived them.

`needsUpdate` compares **versions**, not just commits (`commit !== currentRef
&& cmp(latest, current) >= 0`): a backport tag for an older line (e.g. a
hypothetical `final-4_1_6` appearing after `4.2.x` is already pinned) has a
different commit but a lower version, so it's ignored rather than proposed as
an "update." Every other strategy in `check.mjs` gets this for free from the
default `cmp(latest, current) > 0` fallback; `qgis-release-tag` sets it
explicitly because it also needs to allow the equal-version case (a tag
force-moved to a new commit), which the plain `> 0` default would reject. On
that same-version re-pin, `apply.mjs` **increments `port-version`** instead
of resetting it — that logic is strategy-agnostic and unchanged.

### pnpm major bumps are more than a version edit

pnpm 11 changed behaviour the nightly lockfile refresh trips over (a plain
in-track 10.x→10.y bump needs none of this):

- **`minimumReleaseAge` (24h) is on by default** — a supply-chain delay that
  _rejects the lockfile_ if any resolved dep was published within the window.
  `--latest` happily pins a same-day release (e.g. `acorn@8.17.0`), then
  `pnpm install` fails `ERR_PNPM_MINIMUM_RELEASE_AGE_VIOLATION`. It is
  **verify-only** — re-resolving does **not** pick an older version, so the
  options are wait it out, pin the offender via a `pnpm-workspace.yaml`
  override, or relax the policy. For the refresh, pass
  `--config.minimumReleaseAge=0` (lockfile content is unaffected) and let the
  policy gate the contributor/CI install instead.
- **`onlyBuiltDependencies` → `allowBuilds`** (map form) in
  `pnpm-workspace.yaml` — the `pnpm-v10-to-v11` codemod handles it.
- **corepack signature keys**: an old bundled corepack cannot verify a newer
  pnpm and aborts — set `COREPACK_INTEGRITY_KEYS=0` or update corepack.
- **store v10 → v11** purge: `pnpm install` recreates `node_modules`; set
  `CI=true` (or `confirmModulesPurge=false`) non-interactively. `pnpm <script>`
  first spawns a bare `pnpm` deps-check — pass
  `--config.verifyDepsBeforeRun=false` when pnpm is only on PATH via corepack.

### emsdk bumps can break vcpkg ports

A newer emsdk ships a newer Clang with added warnings. emsdk 5.0.7 added
`-Wunused-but-set-global`, which made json-c's `-Werror` sample apps fail to
compile (`apps/json_parse.c`). These breaks surface only in the **full
compile**, not in `check`/`apply`, and are fixed with an **overlay port** in
`build/vcpkg-ports/` (here: a `json-c` overlay passing `-DBUILD_APPS=OFF`) —
never by patching the vcpkg submodule.

### npm package version vs. engines

`package.json` `version` (and the READMEs' `Version:` header) track qgis-js
releases, _not_ the QGIS patch level, so in-track engine PRs must **not** touch
them. A QGIS _minor_-line move (4.0 → 4.1) is the exception: it was paired with
a deliberate `4.0.0 → 4.1.0` package bump across the monorepo + example refs — a
manual, coordinated decision, not something the nightly job does.

## Components

```
build/update/engines.json      declarative config: strategy + track per engine
build/update/check.mjs         finds the latest in-track version (git ls-remote /
                               nodejs.org dist index / npm dist-tags — no API tokens)
build/update/apply.mjs         performs the multi-file edits for one engine,
                               incl. submodule bumps and QGIS tarball SHA512
.github/workflows/update-engines.yml   nightly orchestrator
.github/workflows/build.yml            full compile (reused for update PRs)
```

Everything is plain Node 22 with built-ins only, so the scripts can also be run
locally:

```sh
node build/update/check.mjs qgis                # what's new?
node build/update/check.mjs qgis | node build/update/apply.mjs qgis   # apply it
```

## Flow

```
                       cron (nightly)  /  workflow_dispatch
                                      │
                          update-engines.yml
                  matrix: node · pnpm · emsdk · vcpkg · qgis
                       (max-parallel: 1, fail-fast: false)
                                      │
              ┌── check.mjs ──► up to date? ──► done (no PR)
              │
              └─► apply.mjs (multi-file edit, isolated to one engine)
                                      │
                  peter-evans/create-pull-request
                  branch: update/<engine>   labels: engine-update, engine:<x>
                  (idempotent: re-runs update the existing PR in place,
                   delete-branch after merge/close)
                                      │
                  gh workflow run build.yml --ref update/<engine>
                                      │
                          build.yml (several hours)
                  full Release compile + package build + dev site build
                  Pages deploy is skipped (main only)
                                      │
                        ✅ / ❌ status on the PR branch
                                      │
                              manual review & merge
```

## Why not Dependabot / Renovate

Dependabot only understands package ecosystems (npm, gomod, …) and git
submodules in isolation. The engines here require _coordinated multi-file
edits_: an emsdk update touches `package.json`, a shell script and a submodule
pin in one atomic commit; a QGIS update needs a new upstream commit ref plus a
freshly computed source-tarball SHA512 in a vcpkg overlay port; a vcpkg update
must also rewrite the derived Qt version. Renovate's `regexManagers` get
closer but still can't compute hashes or keep a submodule pinned to the tag
matching a JSON field. A small bespoke script is simpler and fully testable
locally.

## Required repository setup

1. **Secret `UPDATE_BOT_TOKEN`** — a fine-grained PAT (or GitHub App token)
   with `contents: write` and `pull-requests: write` on this repo.
   Without it, the default `GITHUB_TOKEN` is used as a fallback; PRs are still
   created, but GitHub then suppresses workflow triggers on those PRs — only
   the explicitly dispatched build run provides CI status.
2. **Labels** `engine-update` and `engine:<name>` (created automatically on
   first use).
3. Optional: a branch protection rule on `main` requiring the `build-qgis-js`
   check, so update PRs can't be merged before the multi-hour compile passed.

## Operational notes

- **Build time**: a full from-scratch compile takes several hours. The build
  workflow enables **vcpkg binary caching** against the GitHub Actions cache
  (`VCPKG_BINARY_SOURCES=clear;x-gha,readwrite`). Updates that don't touch the
  C++ dependency graph (node, pnpm) then rebuild in minutes; a vcpkg baseline
  bump naturally invalidates the affected ports. Mind the 10 GB repo cache
  quota — Qt artifacts are large.
- **Isolation**: one engine per PR. If two engines need updates the same
  night, two independent PRs are created. `max-parallel: 1` in the update job
  avoids racing pushes; the per-ref concurrency group in `build.yml` lets the
  (long) builds run in parallel without cancelling each other.
- **README dependency tables** (`README.md`, `packages/qgis-js/README.md`)
  list versions of _all_ vcpkg ports. `apply.mjs` does a best-effort bump of
  the Qt/QGIS mentions; after a successful build of a vcpkg-update PR,
  regenerate the full table with `./qgis-js.ts libs -o markdown` and push to
  the PR branch (a checklist item in the PR body reminds about this — can be
  automated later as a follow-up commit step in `build.yml`).
- **QGIS REF vs. tag**: the port pins an exact commit (the peeled commit of
  the `final-X_Y_Z` tag). `check.mjs` verifies every commit in
  `engines.json`'s `qgis.requiredAncestors` (currently PR #64469) is reachable
  from the candidate tag before proposing it, so a release line missing a
  required wasm fix fails the check step instead of silently shipping a
  broken build — no manual review needed for that specific risk.
- **Future: auto-merge** — once trusted, add
  `gh pr merge --auto --squash` after PR creation and let branch protection
  (required `build-qgis-js` check) gate the merge.

## Manual escape hatches

- `workflow_dispatch` on _Update Engines_ with an `engine` input checks a
  single engine on demand.
- `workflow_dispatch` on _Build_ compiles any ref, as before.
- Closing an update PR without merging: the next nightly run will recreate it
  (same branch) as long as the newer version exists; add a `skip` mechanism
  (e.g. don't recreate when a PR with label `engine-update-skip` was closed)
  if that becomes annoying.
