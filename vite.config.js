import { defineConfig } from "vite";

const host = process.env.TAURI_DEV_HOST;

// Pre-bundle Quill and the table module. Without this, swapping
// quill-better-table → quill-table-better leaves Vite's optimized-deps
// manifest stale and the dev server returns 504 "Outdated Optimize Dep"
// on the first request. Including them by name forces Vite to
// (re-)optimise on startup whenever the dependency set changes.
const prebundle = [
    "quill",
    "quill-table-better",
    "quilljs-markdown",
    "marked",
    "marked-highlight",
    "highlight.js",
    "turndown",
    "turndown-plugin-gfm",
];

export default defineConfig(async () => ({
    clearScreen: false,
    server: {
        port: 1420,
        strictPort: true,
        host: host || false,
        hmr: host
            ? {
                protocol: "ws",
                host,
                port: 1421,
            }
            : undefined,
        watch: {
            ignored: ["**/src-tauri/**"],
        },
    },
    optimizeDeps: {
        include: prebundle,
    },
}));
