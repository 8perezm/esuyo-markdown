# Build and Deployment

Purpose: how production artifacts are built locally and in CI, and how releases reach GitHub + Microsoft Store.

## Version source of truth

Three files must agree (all currently `0.1.10`):

- `package.json:4`
- `src-tauri/tauri.conf.json:4`
- `src-tauri/Cargo.toml:3`

CI auto-increments the **patch** number on every push to `main` and writes it into all three before building (`.github/workflows/publish.yml:30-41`, `:66-84`).

## Local production build

```powershell
$env:Path += ";C:\tools\w64devkit\w64devkit\bin"; $env:Path += ";$env:USERPROFILE\.cargo\bin"; npx tauri build
```

What happens:

1. `beforeBuildCommand: npm run build` (`src-tauri/tauri.conf.json:10`) produces `dist/`.
2. Rust compiles in release profile (`src-tauri/Cargo.toml:23-28`: `lto = true`, `opt-level = "s"`, `strip = true`, `panic = "abort"`).
3. Frontend is embedded; installers are written to `src-tauri/target/release/bundle/` (`targets: "all"` in `src-tauri/tauri.conf.json:29` → `.msi`, NSIS `.exe`, plus per-OS `.dmg`/`.AppImage`/`.deb`).

## CI pipeline (`.github/workflows/publish.yml`)

Triggered on `push` to `main`, with `contents: write` for tags/releases.

| Job | Runs on | Does |
|-----|---------|------|
| `version` | ubuntu | Reads `package.json`, bumps patch, exposes `new_version` output |
| `build` | windows + macos + ubuntu matrix | Writes version into 3 files; installs OS deps; `npm ci`; `npx tauri build --no-bundle` then `npx tauri bundle`; on Windows also Store-config bundle + unsigned MSIX; uploads artifacts |
| `release` | ubuntu | Re-writes version, commits `Bump version to vX [skip ci]`, tags `vX`, pushes, downloads all artifacts, publishes GitHub Release with generated notes |
| `store-submit` | windows | Submits MSIX via `msstore` CLI when Store secrets exist; otherwise prints manual-upload reminder |

Concurrency cancels superseded runs on the same branch (`publish.yml:9-11`).

### OS dependencies in CI

- **Linux:** webkit/GTK/soup/rpm set (`publish.yml:87-98`).
- **Windows:** w64devkit MinGW (`publish.yml:101-109`) + GNU Rust target (`publish.yml:119-125`) + Rust cache (`Swatinem/rust-cache@v2`).
- **Node:** `actions/setup-node@v6` with Node 22 + npm cache.

## Microsoft Store (MSIX)

- Store-specific WebView2 mode: `src-tauri/tauri.microsoftstore.conf.json` sets `webviewInstallMode.type: offlineInstaller` so the Store bundle works without a separate WebView2 download.
- Pack script: `scripts/build-msix.ps1 -Version <3-part semver>` stages the release exe + 4 required logos (`StoreLogo.png`, `Square44x44Logo.png`, `Square150x150Logo.png`, `Square71x71Logo.png` from `src-tauri/icons/`) and runs `makeappx.exe pack` (unsigned — the Store signs on submission).
- MSIX identity defaults (`build-msix.ps1:56-60`): `Esuyo.EsuyoMarkdown` / `CN=Esuyo` / `Esuyo Markdown` / `Esuyo`. Override via repo Variables `MSIX_IDENTITY_NAME`, `MSIX_PUBLISHER`, `MSIX_PUBLISHER_DISPLAY_NAME`, `MSIX_DISPLAY_NAME`, `MSIX_DESCRIPTION`. `DisplayName` must exactly match the Partner Center reserved name.
- Auto-submit requires Secrets `AZURE_AD_TENANT_ID`, `SELLER_ID`, `AZURE_AD_APPLICATION_CLIENT_ID`, `AZURE_AD_APPLICATION_SECRET` plus Variable `STORE_PRODUCT_ID` (`publish.yml:290-299`). Only free products support API update. Without them, CI skips and you upload the `.msix` from the GitHub Release to Partner Center by hand.
- First Store submission must be manual (Store API cannot create the very first submission) — see the setup checklist in `publish.yml:283-300`.

## Artifacts

| OS | Files |
|----|-------|
| Windows | `bundle/msi/*.msi`, `bundle/nsis/*.exe`, `target/msix/*.msix` |
| macOS | `bundle/dmg/*.dmg`, `bundle/macos/**/*.app` |
| Linux | `bundle/appimage/*.AppImage`, `bundle/deb/*.deb` |

All are attached to the GitHub Release tagged `v<version>`.
