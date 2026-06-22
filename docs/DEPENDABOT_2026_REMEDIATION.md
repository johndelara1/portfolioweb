# Dependabot 2026 Remediation

Date: 2026-06-22

## Scope

This remediation covers the npm Dependabot alerts investigated in June 2026, including:

- `lodash` / CVE-2026-4800 / GHSA-r5fr-rjxr-66jc
- `tmp` / CVE-2026-44705
- `shell-quote` / CVE-2026-9277
- follow-up development-scope alerts for `elliptic`, `browserify-sign`, `xmlhttprequest-ssl`, `object-path`, `chownr`, `connect`, `express`, `serve-static`, `send`, `cookie`, and related transitive build packages

The repository remains a legacy Jekyll/Gulp GitHub Pages portfolio. No framework migration, redesign, portfolio content change, deployment setting change, Dependabot alert dismissal, or `npm audit fix --force` was performed.

## Direct vs Transitive Dependencies

The vulnerable packages were not application runtime dependencies in the portfolio source. They were introduced through legacy Node/Gulp build and development dependencies.

- `lodash`, `lodash.template`, `tmp`, and `shell-quote` were transitive.
- `elliptic`, `browserify-sign`, `xmlhttprequest-ssl`, `object-path`, `chownr`, `connect`, `express`, `serve-static`, `send`, `cookie`, and `tar` were transitive.
- Several final `npm audit` findings were transitive through legacy build tooling: `gulp-imagemin`, `gulp-sourcemaps`, `sw-precache`, `critical`, and `gulp`.

## Dependency Paths Before Remediation

Representative vulnerable paths observed before remediation:

| Package | Before remediation path |
| --- | --- |
| `lodash` | root -> legacy `critical`, Babel 6, BrowserSync, ESLint 4, Gulp, Node Sass, and image optimization dependency trees -> `lodash` |
| `lodash.template` | root -> `gulp-util`, `gulp-notify`, and `sw-precache` dependency trees -> `lodash.template` |
| `tmp` | root -> `critical@1.0.0` -> `tmp@0.0.33`; root -> `eslint@4.15.0` -> `inquirer` -> `external-editor` -> `tmp@0.0.33` |
| `shell-quote` | root -> `browserify@15.2.0` -> `shell-quote@1.6.1` |
| `elliptic` | root -> Browserify crypto signing stack -> `browserify-sign` -> `elliptic` |
| `browserify-sign` | root -> `browserify` -> crypto polyfill/signing stack -> `browserify-sign` |
| `xmlhttprequest-ssl` | root -> `browser-sync` -> Socket.IO client stack -> `xmlhttprequest-ssl` |
| `object-path` | root -> legacy BrowserSync/server tooling -> `object-path` |
| `chownr` / `tar` | root -> legacy native/module install tooling -> `tar` -> `chownr` |
| `connect` | root -> `browser-sync` -> `connect` |
| `express` | root -> BrowserSync UI/server stack -> `express` |
| `serve-static` | root -> `browser-sync` -> `serve-static` |
| `send` | root -> `browser-sync` / `serve-static` -> `send` |
| `cookie` | root -> Socket.IO engine stack -> `cookie` |
| `brace-expansion` | root -> `gulp-responsive`, `critical`, BrowserSync, Gulp clean, and `sw-precache` glob/minimatch stacks -> `brace-expansion@1.1.8` |
| `hosted-git-info` | root -> `critical` -> `postcss-image-inliner` -> `asset-resolver` -> `meow` -> `normalize-package-data` -> `hosted-git-info@2.5.0` |
| `ini` | root -> `gulp` -> `gulp-cli` -> `liftoff` -> `findup-sync` -> `resolve-dir` -> `global-modules` -> `global-prefix` -> `ini@1.3.4` |
| `meow` / `trim-newlines` | root -> `sw-precache@4.1.0` -> `meow@3.7.0` -> `trim-newlines@1.0.0` |
| `path-to-regexp` | root -> `sw-precache@4.1.0` -> `sw-toolbox@3.6.0` -> `path-to-regexp@1.7.0` |
| `urijs` | root -> `sw-precache@4.1.0` -> `dom-urls@1.1.0` -> `urijs@1.19.0` |
| `source-map-resolve` / `atob` | root -> `gulp-sourcemaps@2.6.1` -> `css@2.2.1` -> `source-map-resolve@0.3.1` -> `atob@1.1.3` |
| image optimizer chain | root -> `gulp-imagemin@9.2.0` -> `imagemin` / image binary wrapper stack |

## Changes Made

Changed files:

- `package.json`
- `package-lock.json`
- `gulpfile.babel.js` renamed to `gulpfile.js`
- `docs/DEPENDABOT_2026_REMEDIATION.md`

Dependency and build changes:

- Added targeted npm `overrides` for patched transitive packages, including `lodash@4.18.1`, `lodash.template@4.18.1`, `tmp@0.2.7`, `shell-quote@1.8.4`, `xmlhttprequest-ssl@4.0.0`, `object-path@0.11.8`, `chownr@1.1.4`, `connect@3.6.6`, `express@4.21.2`, `serve-static@1.16.2`, `send@0.19.2`, `cookie@0.7.2`, `sharp@0.35.2`, `brace-expansion@1.1.15`, `hosted-git-info@2.8.9`, `ini@1.3.8`, `meow@6.1.1`, `path-to-regexp@1.9.0`, `trim-newlines@3.0.1`, and `urijs@1.19.11`.
- Replaced the legacy Browserify/Babel/Uglify JavaScript build with `esbuild`.
- Replaced `gulp-htmlmin` with `html-minifier-terser`.
- Updated `critical`, `gulp-autoprefixer`, `gulp`, `gulp-sass`, `sass`, `browser-sync`, `eslint`, `jquery`, and `lazysizes` to compatible maintained versions.
- Removed `gulp-imagemin`; image generation still uses `gulp-responsive`/`sharp` with the existing resize and quality settings.
- Removed `gulp-sourcemaps` from the Sass pipeline to remove the vulnerable source map parser chain.
- Renamed the Gulpfile to `gulpfile.js`, matching `package.json`, `_config.yml`, and the README, and removing the non-fatal Gulp attempt to load Babel for `gulpfile.babel.js`.
- Kept `package-lock.json` at `lockfileVersion: 1` for compatibility with the existing legacy lockfile format.

## Before and After Versions

| Package | Before | After |
| --- | --- | --- |
| `lodash` | `2.4.2`, `3.10.1`, `4.17.4` | `4.18.1` |
| `lodash.template` | `3.6.2`, `4.4.0` | `4.18.1` |
| `tmp` | `0.0.33` | `0.2.7` |
| `shell-quote` | `1.6.1` | `1.8.4` |
| `xmlhttprequest-ssl` | vulnerable transitive version | `4.0.0` |
| `object-path` | vulnerable transitive version | `0.11.8` |
| `chownr` | vulnerable transitive version | `1.1.4` |
| `connect` | vulnerable transitive version | `3.6.6` |
| `express` | vulnerable transitive version | `4.21.2` |
| `serve-static` | vulnerable transitive version | `1.16.2` |
| `send` | vulnerable transitive version | `0.19.2` |
| `cookie` | vulnerable transitive version | `0.7.2` |
| `elliptic` | present through Browserify signing stack | removed from the installed dependency tree |
| `browserify-sign` | present through Browserify signing stack | removed from the installed dependency tree |
| `browserify` | `17.0.1` during stabilization | removed; replaced by `esbuild` |
| Babel 6 build stack | present | removed from the installed dependency tree |
| `gulp-imagemin` | `9.2.0` during stabilization | removed |
| `gulp-sourcemaps` | `2.6.1` | removed |
| `brace-expansion` | `1.1.8` | `1.1.15` under `minimatch@3.1.5` |
| `hosted-git-info` | `2.5.0` | `2.8.9` |
| `ini` | `1.3.4` | `1.3.8` |
| `meow` | `3.7.0` under `sw-precache` | `6.1.1` under `sw-precache` |
| `path-to-regexp` | `1.7.0` | `1.9.0` |
| `trim-newlines` | `1.0.0` under `sw-precache` | `3.0.1` |
| `urijs` | `1.19.0` | `1.19.11` |

## Vulnerable API Usage Check

Command:

```sh
rg -n "_\\.template|tmp\\.file|tmp\\.dir|tmp\\.tmpName|shell-quote|quote\\(|child_process|\\bexec\\b|\\bspawn\\b" --glob '!package-lock.json' --glob '!assets/js/bundle.js' --glob '!assets/css/main.map' --glob '!sw.js'
```

Findings:

- No repository source or build script directly uses `_.template`.
- No repository source or build script directly uses `tmp.file`, `tmp.dir`, or `tmp.tmpName`.
- No repository source or build script directly imports `shell-quote` or calls `quote()`.
- `gulpfile.js` directly imports `child_process` and uses `cp.spawn(jekyll, [ "build" ], { stdio: "inherit" })`.
- No direct `child_process.exec` use was found.
- `script/server` and `script/cibuild` use shell commands with `bundle exec jekyll ...`; these are not uses of the vulnerable `shell-quote` API.

The direct exposure risk in the portfolio source is low because the vulnerable APIs are not called by repository code. The practical risk was in local development, CI, or future workflows that execute the legacy build dependency tree.

## Validation

### Required Investigation Commands

Commands run during remediation:

```sh
npm ls lodash tmp shell-quote
npm explain lodash
npm explain tmp
npm explain shell-quote
npm audit
```

Additional commands were run for follow-up findings:

```sh
npm ls lodash tmp shell-quote elliptic serve-static chownr send express connect cookie xmlhttprequest-ssl object-path browserify-sign tar gulp-imagemin gulp-sourcemaps brace-expansion hosted-git-info ini meow path-to-regexp trim-newlines urijs
npm explain lodash.template
npm explain brace-expansion
npm explain hosted-git-info
npm explain ini
npm explain meow
npm explain path-to-regexp
npm explain trim-newlines
npm explain urijs
```

### npm audit before remediation

Command:

```sh
npm audit
```

Original result from the legacy lockfile:

- Exit code: `1`
- `218 vulnerabilities`
- `8 low`
- `45 moderate`
- `106 high`
- `59 critical`

### npm audit after first targeted remediation

Command:

```sh
npm audit
```

Result after fixing the initial `lodash`, `tmp`, and `shell-quote` alerts:

- Exit code: `1`
- `208 vulnerabilities`
- `6 low`
- `44 moderate`
- `101 high`
- `57 critical`

Those original targeted packages were no longer reported, but the legacy build tree still had a large backlog.

### npm audit after full dependency stabilization

Command:

```sh
npm audit
```

Final result:

- Exit code: `0`
- `found 0 vulnerabilities`

### Post-remediation dependency tree

Command:

```sh
npm ls lodash tmp shell-quote elliptic serve-static chownr send express connect cookie xmlhttprequest-ssl object-path browserify-sign tar gulp-imagemin gulp-sourcemaps brace-expansion hosted-git-info ini meow path-to-regexp trim-newlines urijs
```

Result: exit code `0`.

Key resolved versions:

- `lodash@4.18.1`
- `tmp@0.2.7`
- `shell-quote@1.8.4`
- `xmlhttprequest-ssl@4.0.0`
- `connect@3.6.6`
- `express@4.21.2`
- `serve-static@1.16.2`
- `send@0.19.2`
- `cookie@0.7.2`
- `brace-expansion@1.1.15` under legacy `minimatch@3.1.5`
- `hosted-git-info@2.8.9`
- `ini@1.3.8`
- `meow@6.1.1` under `sw-precache`
- `path-to-regexp@1.9.0`
- `trim-newlines@3.0.1`
- `urijs@1.19.11`

`browserify`, `browserify-sign`, `elliptic`, `gulp-imagemin`, and `gulp-sourcemaps` are no longer present in the installed dependency tree.

### Build validation

Command:

```sh
./node_modules/.bin/gulp build
```

Result: exit code `1`.

What passed before the failure:

- Gulp loaded `gulpfile.js` without the previous Babel loader warning.
- `clean` completed.
- `sass` completed.
- `js` completed through `esbuild`.
- `img` completed through `gulp-responsive`/`sharp`.

Failure:

- `jekyll-build` failed with `Error: spawn jekyll ENOENT`.

Classification:

- Pre-existing local Ruby/Jekyll environment issue, not introduced by the dependency remediation.
- The Node/Gulp tasks touched by this remediation ran before the failure.

Additional Sass warnings:

- Dart Sass reports deprecation warnings for legacy `@import`, `darken()`, and `lighten()` usage.
- These are pre-existing Sass content issues and were not rewritten in this security-only change.

Command:

```sh
bundle exec jekyll build
```

Result: exit code `127`.

Failure:

- `bundler: command not found: jekyll`
- Bundler suggested running `bundle install`.

Classification:

- Pre-existing Ruby/Jekyll dependency installation issue.
- No Ruby gems were installed or changed during this remediation.

Command:

```sh
node -e 'const sw=require("sw-precache"); Promise.resolve(sw.write("/tmp/portfolioweb-sw-test.js",{staticFileGlobs:["package.json"],stripPrefix:"."})).then(()=>console.log("sw-precache write ok"));'
```

Result: exit code `0`; `sw-precache write ok`.

This validates the programmatic `sw-precache.write()` API used by the Gulp `sw` task after the `meow` override.

## Remaining Risks and Compatibility Concerns

- `npm audit` is clean at the time of validation.
- `sw-precache` is still legacy and should be replaced in a later stabilization or Portfolio V2 phase, even though the current audited dependency tree is clean.
- The `sw-precache` override forces `meow@6.1.1` under an older package. The programmatic `sw-precache.write()` API was validated, but the old `sw-precache` CLI was not a repository workflow and was not separately validated.
- Full end-to-end Gulp build remains blocked until the local Ruby/Jekyll environment provides the `jekyll` executable.
- Sass deprecation warnings remain and should be handled as a separate content/CSS modernization task.
- The build no longer creates Sass source maps; this was an intentional security stabilization tradeoff to remove the vulnerable `gulp-sourcemaps` parser chain.
- Image generation no longer runs `gulp-imagemin`; `gulp-responsive`/`sharp` still handles resizing and compression with the existing quality settings.

## Conclusion

The requested Dependabot alert families and follow-up npm audit findings were remediated with the smallest compatible dependency and build-pipeline changes available for the legacy Gulp/Jekyll site. `npm audit` now reports `found 0 vulnerabilities`. The remaining validation blocker is the pre-existing missing local Jekyll executable, not a new npm remediation failure.
