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

- Store-specific WebView2 mode: `src-tauri/tauri.microsoftstore.conf.json` sets `webviewInstallMode.type: offlineInstaller` **for the Tauri MSI/NSIS installer only**. The hand-packed MSIX described below is not affected by that setting.
- Pack script: `scripts/build-msix.ps1 -Version <3-part semver>` stages the release exe, **`WebView2Loader.dll`**, and the 4 required logos (`StoreLogo.png`, `Square44x44Logo.png`, `Square150x150Logo.png`, `Square71x71Logo.png` from `src-tauri/icons/`) and runs `makeappx.exe pack` (unsigned, the Store signs on submission).
  - The GNU Rust toolchain loads `WebView2Loader.dll` dynamically from the exe's folder. If it is missing, the installed app fails with *"The code execution cannot proceed because WebView2Loader.dll was not found."* The script copies it from the Cargo output or the vendored `src-tauri/msix/WebView2Loader-<arch>.dll` files. See `src-tauri/msix/README.md`.
  - The WebView2 **runtime** itself is not bundled: it is built into Windows 11 and present on most Windows 10 installs. No runtime download is performed by the MSIX.
- MSIX identity defaults (`build-msix.ps1:56-60`): `Esuyo.EsuyoMarkdown` / `CN=Esuyo` / `Esuyo Markdown` / `Esuyo`. Override via repo Variables `MSIX_IDENTITY_NAME`, `MSIX_PUBLISHER`, `MSIX_PUBLISHER_DISPLAY_NAME`, `MSIX_DISPLAY_NAME`, `MSIX_DESCRIPTION`. `DisplayName` must exactly match the Partner Center reserved name.
- Auto-submit requires Secrets `AZURE_AD_TENANT_ID`, `SELLER_ID`, `AZURE_AD_APPLICATION_CLIENT_ID`, `AZURE_AD_APPLICATION_SECRET` plus Variable `STORE_PRODUCT_ID` (`publish.yml:290-299`). Only free products support API update. Without them, CI skips and you upload the `.msix` from the GitHub Release to Partner Center by hand.
- First Store submission must be manual (Store API cannot create the very first submission), see the setup checklist in `publish.yml:283-300`.

### Supported languages on the Store product page

The "Supported languages" section on the Microsoft Store product page, and the "Languages supported in packages" button in Partner Center, are derived from the `<Resources>` block of the MSIX manifest. They are **not** the Store listing languages added under Store listings, and they are **not** the JS i18n dictionaries by themselves.

`src-tauri/msix/AppxManifest.template.xml` declares 73 Store-supported language codes, generated from the 75 app locales in `src/i18n/index.js`:

- `az` becomes `az-latn`, `ky` becomes `ky-kg`, `mn` becomes `mn-cyrl` because the Store does not accept the bare codes.
- `eo` (Esperanto) and `my` (Burmese) are omitted because they are not in the Store's supported-language list. Microsoft warns that unsupported codes can delay or fail certification.
- `en-us` is kept as the first entry (the package default). The other 72 follow.

To make the product page show them, the change has to ship in a package:

1. Bump the app version above the currently submitted package (0.1.16.0), for example `0.1.17.0`.
2. Run `npx tauri build --no-bundle`, then `scripts/build-msix.ps1 -Version 0.1.17`.
3. After the in-flight submission publishes, create a new submission and upload the new `.msix` in Packages.
4. Submit. Once certified, the Store catalog will report the full `SupportedLanguages` list and the product page will show the languages.

Declaring a language here does not translate the UI. The app's JS i18n already does that, so the declarations are accurate.

## Artifacts

| OS | Files |
|----|-------|
| Windows | `bundle/msi/*.msi`, `bundle/nsis/*.exe`, `target/msix/*.msix` |
| macOS | `bundle/dmg/*.dmg`, `bundle/macos/**/*.app` |
| Linux | `bundle/appimage/*.AppImage`, `bundle/deb/*.deb` |

All are attached to the GitHub Release tagged `v<version>`.
