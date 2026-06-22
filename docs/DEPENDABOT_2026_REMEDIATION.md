# Dependabot 2026 Remediation

Date: 2026-06-22
Branch: `security/dependabot-2026`

## Scope

This remediation covers the Dependabot alerts for:

- `lodash` / CVE-2026-4800 / GHSA-r5fr-rjxr-66jc
- `tmp` / CVE-2026-44705
- `shell-quote` / CVE-2026-9277

The repository is a legacy Jekyll/Gulp GitHub Pages portfolio. No framework migration, redesign, portfolio content change, deployment setting change, alert dismissal, or `npm audit fix --force` was performed.

## Direct vs Transitive Dependencies

`lodash`, `lodash.template`, `tmp`, and `shell-quote` were not direct dependencies in `package.json` before remediation. They were introduced through the legacy Node/Gulp build dependency tree.

The remediation adds npm `overrides` for the vulnerable packages only, plus a lockfile update for the compatible `lodash.template` support package `lodash.templatesettings`.

## Dependency Paths Before Remediation

### lodash

`lodash` was transitive. The original lockfile contained vulnerable `lodash` versions `2.4.2`, `3.10.1`, and `4.17.4`.

Observed dependency paths:

- root -> `critical@1.0.0` -> `penthouse@1.1.2` -> `apartment@1.1.1` -> `lodash@3.10.1`
- root -> `critical@1.0.0` -> `postcss-image-inliner@1.0.6` -> `asset-resolver@0.3.3` -> `lodash@4.17.4`
- root -> `babel-core@6.26.0` -> `lodash@4.17.4`
- root -> `babel-core@6.26.0` -> `babel-generator@6.26.0` -> `lodash@4.17.4`
- root -> `babel-core@6.26.0` -> `babel-register@6.26.0` -> `lodash@4.17.4`
- root -> `babel-core@6.26.0` -> `babel-template@6.26.0` -> `lodash@4.17.4`
- root -> `babel-core@6.26.0` -> `babel-traverse@6.26.0` -> `lodash@4.17.4`
- root -> `babel-core@6.26.0` -> `babel-types@6.26.0` -> `lodash@4.17.4`
- root -> `babel-preset-es2015@6.24.1` -> `babel-plugin-transform-es2015-block-scoping@6.26.0` -> `lodash@4.17.4`
- root -> `babel-preset-es2015@6.24.1` -> `babel-plugin-transform-es2015-classes@6.24.1` -> `babel-helper-define-map@6.26.0` -> `lodash@4.17.4`
- root -> `babel-preset-es2015@6.24.1` -> `babel-plugin-transform-es2015-sticky-regex@6.24.1` -> `babel-helper-regex@6.26.0` -> `lodash@4.17.4`
- root -> `browser-sync@2.18.13` -> `easy-extender@2.3.2` -> `lodash@3.10.1`
- root -> `critical@1.0.0` -> `lodash@4.17.4`
- root -> `critical@1.0.0` -> `filter-css@0.1.2` -> `lodash@4.17.4`
- root -> `critical@1.0.0` -> `group-args@0.1.0` -> `lodash@4.17.4`
- root -> `critical@1.0.0` -> `inline-critical@2.4.2` -> `lodash@4.17.4`
- root -> `critical@1.0.0` -> `inline-critical@2.4.2` -> `cave@2.0.0` -> `lodash@2.4.2`
- root -> `critical@1.0.0` -> `oust@0.4.0` -> `cheerio@0.19.0` -> `lodash@3.10.1`
- root -> `eslint@4.15.0` -> `lodash@4.17.4`
- root -> `eslint@4.15.0` -> `inquirer@3.3.0` -> `lodash@4.17.4`
- root -> `eslint@4.15.0` -> `table@4.0.2` -> `lodash@4.17.4`
- root -> `gulp-responsive@2.8.0` -> `lodash@4.17.4`
- root -> `gulp-responsive@2.8.0` -> `async@2.6.0` -> `lodash@4.17.4`
- root -> `gulp-sass@3.1.0` -> `node-sass@4.7.1` -> `gaze@1.1.2` -> `globule@1.2.0` -> `lodash@4.17.4`
- root -> `gulp-sass@3.1.0` -> `node-sass@4.7.1` -> `sass-graph@2.2.4` -> `lodash@4.17.4`
- root -> `gulp-uglify@3.0.0` -> `lodash@4.17.4`

### lodash.template

`lodash.template` was transitive. The original lockfile contained vulnerable `lodash.template` versions `3.6.2` and `4.4.0`.

Observed dependency paths:

- root -> `gulp-notify@3.2.0` -> `lodash.template@4.4.0`
- root -> `sw-precache@5.2.0` -> `lodash.template@4.4.0`
- root -> `critical@1.0.0` -> `gulp-util@3.0.8` -> `lodash.template@3.6.2`
- root -> `gulp-autoprefixer@4.0.0` -> `gulp-util@3.0.8` -> `lodash.template@3.6.2`
- root -> `gulp-htmlmin@3.0.0` -> `gulp-util@3.0.8` -> `lodash.template@3.6.2`
- root -> `gulp-imagemin@4.0.0` -> `gulp-util@3.0.8` -> `lodash.template@3.6.2`
- root -> `gulp-responsive@2.8.0` -> `gulp-util@3.0.8` -> `lodash.template@3.6.2`
- root -> `gulp-sass@3.1.0` -> `gulp-util@3.0.8` -> `lodash.template@3.6.2`
- root -> image optimization transitive stack -> `download@4.4.3` -> `gulp-decompress@1.2.0` -> `gulp-util@3.0.8` -> `lodash.template@3.6.2`

### tmp

`tmp` was transitive. The original lockfile contained vulnerable `tmp@0.0.33`.

Observed dependency paths:

- root -> `critical@1.0.0` -> `tmp@0.0.33`
- root -> `eslint@4.15.0` -> `inquirer@3.3.0` -> `external-editor@2.1.0` -> `tmp@0.0.33`

### shell-quote

`shell-quote` was transitive. The original lockfile contained vulnerable `shell-quote@1.6.1`.

Observed dependency path:

- root -> `browserify@15.2.0` -> `shell-quote@1.6.1`

## Changes Made

Changed files:

- `package.json`
- `package-lock.json`
- `docs/DEPENDABOT_2026_REMEDIATION.md`

`package.json` now contains targeted npm overrides:

```json
"overrides": {
  "lodash": "4.18.1",
  "lodash.template": "4.18.1",
  "tmp": "0.2.7",
  "shell-quote": "1.8.4"
}
```

`package-lock.json` remains `lockfileVersion: 1` to preserve the legacy lockfile format. The lockfile was updated only for the targeted dependency tree:

| Package | Before | After | Reason |
| --- | --- | --- | --- |
| `lodash` | `2.4.2`, `3.10.1`, `4.17.4` | `4.18.1` | Patched lodash version for CVE-2026-4800 / GHSA-r5fr-rjxr-66jc |
| `lodash.template` | `3.6.2`, `4.4.0` | `4.18.1` | `npm audit` also reported GHSA-r5fr-rjxr-66jc through `lodash.template` |
| `lodash.templatesettings` | `3.1.1` | `4.2.0` | Required compatible dependency for `lodash.template@4.18.1` |
| `tmp` | `0.0.33` | `0.2.7` | Patched version satisfying the requested `0.2.6 or newer` range |
| `shell-quote` | `1.6.1` | `1.8.4` | Patched version for shell command quoting advisory |

No unrelated package upgrades were intentionally applied.

## Vulnerable API Usage Check

Command:

```sh
rg -n "_\\.template|tmp\\.file|tmp\\.dir|tmp\\.tmpName|shell-quote|quote\\(|child_process|\\bexec\\b|\\bspawn\\b" --glob '!package-lock.json' --glob '!assets/js/bundle.js' --glob '!assets/css/main.map' --glob '!sw.js'
```

Findings:

- No repository source or build script directly uses `_.template`.
- No repository source or build script directly uses `tmp.file`, `tmp.dir`, or `tmp.tmpName`.
- No repository source or build script directly imports `shell-quote` or calls `quote()`.
- `gulpfile.babel.js` directly imports `child_process` and uses `cp.spawn(jekyll, [ "build" ], { stdio: "inherit" })`.
- No direct `child_process.exec` use was found.
- `script/server` and `script/cibuild` use shell commands with `bundle exec jekyll ...`; these are not uses of the vulnerable `shell-quote` API.

The direct exposure risk in the portfolio source is low because the vulnerable APIs are not called by repository code. The remaining risk was in local development, CI, or future workflows that execute the legacy build dependency tree.

## Validation

### Required investigation commands

The initial `npm ls` and `npm explain` commands could not resolve package paths before installing `node_modules`, because `node_modules` was absent. The dependency paths above were derived from `package-lock.json` and then confirmed after a script-free install.

Commands run:

```sh
npm ls lodash tmp shell-quote
npm explain lodash
npm explain tmp
npm explain shell-quote
npm audit
```

Additional relevant command run because the lodash advisory was also present through `lodash.template`:

```sh
npm explain lodash.template
```

### Post-remediation dependency tree

Command:

```sh
npm ls lodash lodash.template tmp shell-quote
```

Result: exit code `0`.

Resolved versions:

- `lodash@4.18.1`
- `lodash.template@4.18.1`
- `tmp@0.2.7`
- `shell-quote@1.8.4`

Post-remediation `npm explain` confirmed:

- `tmp@0.2.7` is overridden under `critical@1.0.0` and `external-editor@2.1.0`.
- `shell-quote@1.8.4` is overridden under `browserify@15.2.0`.
- `lodash.template@4.18.1` is overridden under `gulp-notify@3.2.0`, `gulp-util@3.0.8`, and `sw-precache@5.2.0`.
- `lodash@4.18.1` is overridden across the legacy Babel, BrowserSync, Critical, ESLint, Gulp, Node Sass, and image optimization dependency tree.

### npm audit before remediation

Command:

```sh
npm audit
```

Run against a temporary copy of the original `package.json` and `package-lock.json` from `HEAD`.

Result: exit code `1`.

Summary:

- `218 vulnerabilities`
- `8 low`
- `45 moderate`
- `106 high`
- `59 critical`

Targeted vulnerable packages present before remediation:

- `lodash`, severity `critical`, range `<=4.17.23`, including GHSA-r5fr-rjxr-66jc.
- `lodash.template`, severity `high`, range `<=4.5.0`, including GHSA-r5fr-rjxr-66jc.
- `tmp`, severity `high`, range `<=0.2.5`.
- `shell-quote`, severity `critical`, range `1.1.0 - 1.8.3`.

### npm audit after remediation

Command:

```sh
npm audit
```

Result: exit code `1`.

Summary:

- `208 vulnerabilities`
- `6 low`
- `44 moderate`
- `101 high`
- `57 critical`

Targeted vulnerable packages after remediation:

- None. The filtered audit JSON returned no entries for `lodash`, `lodash.template`, `tmp`, or `shell-quote`.

The remaining audit findings are pre-existing legacy dependency issues outside this targeted remediation.

### Build validation

Command:

```sh
./node_modules/.bin/gulp build
```

Result: failed before running build tasks.

Root cause:

- `node-sass@4.7.1` does not support the current macOS arm64 / Node.js runtime.
- Error: `Node Sass does not yet support your current environment: OS X Unsupported architecture (arm64) with Unsupported runtime (115)`.
- Runtime shown by the failing command: `Node.js v20.19.2`.

Classification: pre-existing legacy build incompatibility, not introduced by this remediation. The failure happens while loading `gulp-sass` from `gulpfile.babel.js`, before the targeted packages are exercised.

Command:

```sh
npm start
```

Result: failed with the same `node-sass@4.7.1` unsupported runtime error before starting Gulp's default build/server/watch workflow.

Command:

```sh
bundle exec jekyll build --destination /tmp/portfolioweb-jekyll-build --trace
```

Result: failed.

Root cause:

- Bundler could not find the `jekyll` executable.
- Error: `bundler: command not found: jekyll`
- Suggested by Bundler: `Install missing gem executables with bundle install`

Classification: pre-existing Ruby/Jekyll dependency installation issue, not introduced by this remediation.

## Remaining Risks and Compatibility Concerns

- The repository still has a large pre-existing npm audit backlog: `208 vulnerabilities` after the targeted fix.
- Several remaining issues require major package changes or framework/toolchain modernization and were intentionally not addressed here.
- `node-sass@4.7.1` prevents the current Gulp build from loading on macOS arm64 with Node.js 20. This blocks full build verification.
- `bundle exec jekyll build` is blocked because the Ruby/Jekyll bundle is not currently installed.
- The npm overrides intentionally force old transitive consumers of `lodash`, `lodash.template`, `tmp`, and `shell-quote` onto patched versions. `npm ls` accepts the resulting tree, but the legacy build cannot be fully validated until the pre-existing Node Sass and Ruby/Jekyll issues are handled.
- `tmp@0.2.7` requires a modern Node runtime. This is compatible with the current Node.js 20 environment but would not be compatible with very old Node versions that may have been used by the original Gulp stack.

## Conclusion

The three requested Dependabot alert families were remediated with targeted npm overrides and minimal lockfile updates. `npm audit` no longer reports `lodash`, `lodash.template`, `tmp`, or `shell-quote` as vulnerable, and no repository source directly uses the vulnerable APIs. Full build validation remains blocked by pre-existing legacy toolchain issues unrelated to these dependency overrides.
