# npm dependency update automation

This document covers `.github/workflows/update-deps.yml`, which keeps the
pnpm workspace's npm/JS dependencies current. It's separate from
[engine updates](engine-updates.md): the 5 engines (node, pnpm, emsdk, vcpkg,
qgis) need bespoke coordinated edits across non-npm files (submodule pins,
tarball hashes, an overlay port) that Dependabot/Renovate can't do -- that's
what `build/update/check.mjs`/`apply.mjs` exist for. Ordinary npm
dependencies don't have that problem: pnpm already understands the whole
10-package workspace (root, `packages/*`, `sites/*`, `docs/examples/*)`
natively, so this workflow is just `pnpm update --recursive --latest` plus
the same PR/build-dispatch shape the engine updates use.

## Flow

```
                       cron (nightly, offset from Update Engines)
                                      │
                            update-deps.yml
              pnpm update --recursive --latest --lockfile-only
                                      │
                       any diff? ──► no ──► done (no PR)
                                      │ yes
                  peter-evans/create-pull-request
                  branch: update/npm-deps   label: dependencies
                  (idempotent: re-runs update the existing PR in place)
                                      │
                  gh workflow run build.yml --ref update/npm-deps
                                      │
                          build.yml (full compile + package + dev-site build;
                          vcpkg binary caching means an npm-only change
                          rebuilds the C++/WASM side in minutes, unchanged)
                                      │
                              manual review & merge
```

## Scope: majors included, one PR for the whole workspace

`--latest` bumps package.json version ranges themselves, not just
lockfile-level resolution within existing ranges -- so this can and will pick
up breaking major-version changes (Vite, TypeScript, API Extractor,
Playwright, etc. are all devDependencies somewhere in the workspace). That's
a deliberate choice, not an oversight: unlike engines, there's no `track`
concept here to gate majors out automatically, so review before merging
matters more here than it does for an in-track engine bump. Auto-merge is not
enabled.

Everything lands in a single PR because `pnpm update -r` writes one shared
`pnpm-lock.yaml` for the whole workspace in one resolution pass -- there's no
clean way to split that into isolated per-package PRs the way
`update/<engine>` isolates each engine.

## `minimumReleaseAge` and the dispatched build

pnpm 11's `minimumReleaseAge` (24h supply-chain delay) is **verify-only**: the
update step resolves `--latest` regardless of a package's age (with
`--config.minimumReleaseAge=0`, same as the pnpm-engine-bump case in
[engine-updates.md](engine-updates.md)), but a plain `pnpm install` afterward
re-enforces the policy and rejects any resolved entry published within the
last 24h. Because `pnpm update -r --latest` walks the full transitive graph
of a 10-package workspace nightly, _some_ freshly-published entry is likely
on any given night — this isn't a one-off like the pnpm engine bump, it's the
common case. Left unhandled, `build.yml`'s `pnpm install` step would fail
almost every night on `ERR_PNPM_MINIMUM_RELEASE_AGE_VIOLATION`, not because
anything is actually wrong.

`build.yml` therefore only bypasses the policy (`--config.minimumReleaseAge=0`)
when installing on the `update/npm-deps` branch specifically — every other
ref (`main`, `update/<engine>`, manual dispatch) keeps it enforced. This is a
narrow, deliberate carve-out, not a global weakening: the policy still
protects against installing a just-published (and potentially compromised)
package everywhere else in CI.

## Why `--lockfile-only` in the workflow step

The update step itself never materializes `node_modules` or runs
`postinstall` (`./qgis-js.ts install`, the emsdk/vcpkg bootstrap) -- that
bootstrap is entirely unrelated to npm dependency content and would waste a
multi-GB toolchain download on every nightly run just to test a lockfile
change. Real validation (does `pnpm install` + `pnpm run build` actually
succeed with the new versions) happens when the dispatched `build.yml` run
does a full install on an isolated runner, which needs that bootstrap anyway
to compile.

## Not covered by this workflow

- **GitHub Actions version pins** (`uses: owner/action@version` in
  `.github/workflows/*.yml`) drift the same way npm deps do and aren't
  automated by anything here. `pnpm/action-setup@v2` is currently behind
  (v4 is current) as of this writing.
- **vcpkg overlay ports other than `qgis`** (`json-c`, `libspatialindex` in
  `build/vcpkg-ports/`) are independently version-pinned C++ dependencies,
  not npm packages, so `pnpm update` doesn't touch them and they aren't in
  `engines.json` either. Both pins are deliberate, not staleness:
  - `json-c` carries the `-DBUILD_APPS=OFF` workaround for the emsdk 5.0.7
    `-Werror` break, see [engine-updates.md](engine-updates.md) — though
    vcpkg's registry has since moved to json-c 0.19, which appears to have
    fixed the underlying issue upstream (the `strict_mode` variable the
    warning flagged as unused is now actually read); worth dropping the
    overlay once that's confirmed with a real compile.
  - `libspatialindex` is held below vcpkg's registry version (2.1+) because
    QGIS's own `CMakeLists.txt` hard-rejects it (`Cannot build QGIS using
libspatialindex >= 2.1`, see
    [libspatialindex#276](https://github.com/libspatialindex/libspatialindex/issues/276))
    — confirmed by an actual compile failure at `CMakeLists.txt:455`, not a
    wasm-specific concern. **Do not remove this overlay** without confirming
    QGIS has lifted that restriction; a 2026-09 attempt to remove it as
    apparently-redundant (its portfile has no other customization vs. the
    registry copy, which reads as "dead weight" if you don't check the
    version ceiling QGIS enforces) broke the build and had to be reverted.

## Required repository setup

Shares `UPDATE_BOT_TOKEN` and the `build-qgis-js` branch protection check
with engine updates -- see [engine-updates.md](engine-updates.md#required-repository-setup),
nothing additional needed here.
