# MSIX packaging notes

`scripts/build-msix.ps1` stages the Tauri release `.exe`, its manifest, logos and
**`WebView2Loader.dll`** into `src-tauri/target/msix/staging`, then packs an unsigned
`.msix` with `makeappx.exe`.

## Why WebView2Loader.dll is here

The project builds with the **GNU** Rust toolchain (`stable-x86_64-pc-windows-gnu`),
per `docs/build-and-deployment.md`. With that toolchain `wry` loads the WebView2
loader dynamically from the executable's directory. The Tauri
`bundle.windows.webviewInstallMode` setting only affects MSI/NSIS installers — it
does nothing for this hand-packed MSIX. If the DLL is absent, launching the
installed app fails with:

> The code execution cannot proceed because WebView2Loader.dll was not found.

`build-msix.ps1` therefore copies the loader next to the exe in the staging
folder. It prefers the DLL produced by the Cargo build; the vendored copies in
this folder are a fallback so a release build always contains it:

| File | Architecture |
|------|--------------|
| `WebView2Loader-x64.dll` | x64 (default Store build) |
| `WebView2Loader-arm64.dll` | arm64 (`-Architecture arm64`) |

Both are the Microsoft-signed loader from the `webview2-com-sys` crate pinned in
`src-tauri/Cargo.lock` (currently **0.39.1**, loader v1.0.3800.47). When that crate
is upgraded, refresh them from:

```
%USERPROFILE%\.cargo\registry\src\index.crates.io-*\
  webview2-com-sys-<new version>\x64\WebView2Loader.dll
  webview2-com-sys-<new version>\arm64\WebView2Loader.dll
```

Verify with `Get-AuthenticodeSignature` that the status is `Valid` before committing.

## What this does not bundle

The **WebView2 Evergreen Runtime** itself is not packaged. It is built into
Windows 11 and present on most Windows 10 installations. Machines without it need
the runtime installed separately (bootstrapper/standalone installer from
Microsoft). Adding a `win32dependencies:ExternalDependency` to the manifest is
not reliable for WebView2 in Store MSIX packages, so the app relies on the
system runtime.

## Manifest

`AppxManifest.template.xml` is the tracked source of truth. `build-msix.ps1`
replaces its `__…__` tokens (identity, publisher, version, exe name, architecture,
display names, description) at pack time. Do not edit the generated
`staging/AppxManifest.xml`.
