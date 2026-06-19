import { invoke } from "@tauri-apps/api/core";
import { open, save } from "@tauri-apps/plugin-dialog";
import { Marked } from "marked";
import { markedHighlight } from "marked-highlight";
import hljs from "highlight.js";
import Quill from "quill";
import "quill/dist/quill.snow.css";
import QuillMarkdown from "quilljs-markdown";
import "quilljs-markdown/dist/quilljs-markdown-common-style.css";
import QuillTableBetter from "quill-table-better";
import "quill-table-better/dist/quill-table-better.css";
import TurndownService from "turndown";
import { gfm } from "turndown-plugin-gfm";

// Register quill-table-better module
Quill.register({
    "modules/table-better": QuillTableBetter,
}, true);

// ── Markdown setup ──────────────────────────────────────────────────────────

const marked = new Marked(
    markedHighlight({
        langPrefix: "hljs language-",
        highlight(code, lang) {
            const language = hljs.getLanguage(lang) ? lang : "plaintext";
            return hljs.highlight(code, { language }).value;
        },
    })
);

/**
 * Parse Markdown to HTML suitable for pasting into the Quill editor.
 *
 * Two adjustments are needed before the HTML reaches Quill's clipboard:
 *
 * 1. **Tables**: Quill 2.x's table blot only accepts a single `<tbody>`
 *    per `<table>`. When marked emits the semantically correct
 *    `<thead>`/`<th>` alongside an existing `<tbody>`, the header is
 *    pasted as a separate, detached table above the body table. Flatten
 *    the header into the same `<tbody>` as the body rows. The first row
 *    is styled as a header via CSS.
 *
 * 2. **Code blocks**: `marked` emits `<pre><code class="language-xxx">`
 *    — the language lives in the `<code>`'s class. But Quill 2.x's
 *    clipboard converter discards that class and defaults `data-language`
 *    to `"plain"`, so the language is lost on the editor side and the
 *    Source toggle then produces ` ```plain `. Quill only preserves the
 *    language if the input already has `data-language="xxx"` on the
 *    `<pre>`. Lift the language out of the `<code>`'s class onto the
 *    `<pre>`'s `data-language` so Quill keeps it.
 */
function parseMarkdownForEditor(md) {
    const html = marked.parse(md);
    if (
        !html.includes("<thead") &&
        !html.includes("<th") &&
        !html.includes("<pre>")
    ) {
        return html;
    }
    const doc = new DOMParser().parseFromString(html, "text/html");

    // 1. Flatten <thead>/<th> into the same <tbody> as body rows.
    doc.querySelectorAll("thead").forEach((thead) => {
        thead.querySelectorAll("th").forEach((th) => {
            const td = doc.createElement("td");
            for (const attr of th.attributes) {
                td.setAttribute(attr.name, attr.value);
            }
            td.innerHTML = th.innerHTML;
            th.replaceWith(td);
        });
        const table = thead.closest("table");
        let targetTbody = table && table.querySelector("tbody");
        if (targetTbody == null) {
            targetTbody = doc.createElement("tbody");
            thead.replaceWith(targetTbody);
        } else {
            while (thead.firstChild) {
                targetTbody.insertBefore(thead.firstChild, targetTbody.firstChild);
            }
            thead.remove();
        }
    });

    // 2. Lift `language-xxx` from the <code>'s class onto the <pre>'s
    //    `data-language` so Quill 2.x keeps it.
    doc.querySelectorAll("pre > code").forEach((code) => {
        const pre = code.parentNode;
        if (pre.nodeName !== "PRE") return;
        const match = (code.getAttribute("class") || "").match(/language-(\S+)/);
        if (match) {
            pre.setAttribute("data-language", match[1]);
        }
    });

    return doc.body.innerHTML;
}

marked.use({
    renderer: {
        heading({ tokens, depth }) {
            const text = this.parser.parseInline(tokens);
            const id = text
                .toLowerCase()
                .replace(/<[^>]*>/g, "")
                .replace(/[^\w\s-]/g, "")
                .replace(/\s+/g, "-")
                .replace(/-+/g, "-")
                .trim();
            return `<h${depth} id="${id}">${text}</h${depth}>\n`;
        },
    },
});

// ── Google Fonts list ───────────────────────────────────────────────────────

const GOOGLE_FONTS = [
    // Sans-serif
    { family: "Inter", category: "sans-serif", weights: "wght@400;500;600;700" },
    { family: "Roboto", category: "sans-serif", weights: "wght@400;500;700" },
    { family: "Open Sans", category: "sans-serif", weights: "wght@400;500;600;700" },
    { family: "Lato", category: "sans-serif", weights: "wght@400;700" },
    { family: "Montserrat", category: "sans-serif", weights: "wght@400;500;600;700" },
    { family: "Source Sans 3", category: "sans-serif", weights: "wght@400;500;600;700" },
    { family: "Nunito", category: "sans-serif", weights: "wght@400;500;600;700" },
    { family: "Poppins", category: "sans-serif", weights: "wght@400;500;600;700" },
    { family: "Noto Sans", category: "sans-serif", weights: "wght@400;500;600;700" },
    { family: "DM Sans", category: "sans-serif", weights: "wght@400;500;600;700" },
    { family: "Plus Jakarta Sans", category: "sans-serif", weights: "wght@400;500;600;700" },
    { family: "Manrope", category: "sans-serif", weights: "wght@400;500;600;700" },
    { family: "Figtree", category: "sans-serif", weights: "wght@400;500;600;700" },
    { family: "Outfit", category: "sans-serif", weights: "wght@400;500;600;700" },
    { family: "Nunito Sans", category: "sans-serif", weights: "wght@400;500;600;700" },
    // Serif
    { family: "Merriweather", category: "serif", weights: "wght@400;700" },
    { family: "Lora", category: "serif", weights: "wght@400;500;600;700" },
    { family: "Source Serif 4", category: "serif", weights: "wght@400;500;600;700" },
    { family: "Playfair Display", category: "serif", weights: "wght@400;500;600;700" },
    { family: "EB Garamond", category: "serif", weights: "wght@400;500;600;700" },
    { family: "Spectral", category: "serif", weights: "wght@400;500;600;700" },
    { family: "Literata", category: "serif", weights: "wght@400;500;600;700" },
    { family: "Crimson Pro", category: "serif", weights: "wght@400;500;600;700" },
    { family: "PT Serif", category: "serif", weights: "wght@400;700" },
    // Monospace
    { family: "JetBrains Mono", category: "monospace", weights: "wght@400;600" },
    { family: "Fira Code", category: "monospace", weights: "wght@400;500;600" },
    { family: "Source Code Pro", category: "monospace", weights: "wght@400;500;600;700" },
    { family: "IBM Plex Mono", category: "monospace", weights: "wght@400;500;600" },
    { family: "Space Mono", category: "monospace", weights: "wght@400;700" },
    { family: "DM Mono", category: "monospace", weights: "wght@400;500" },
    { family: "Inconsolata", category: "monospace", weights: "wght@400;500;600;700" },
    { family: "Victor Mono", category: "monospace", weights: "wght@400;500;600" },
];

// Track which Google Fonts have been loaded
const loadedFonts = new Set();

function loadGoogleFont(family) {
    const key = family.toLowerCase().replace(/\s+/g, "-");
    if (loadedFonts.has(key)) return;
    loadedFonts.add(key);

    const font = GOOGLE_FONTS.find((f) => f.family === family);
    if (!font) return;

    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(font.family)}:${font.weights}&display=swap`;
    document.head.appendChild(link);
}

// ── State ───────────────────────────────────────────────────────────────────

let currentFolder = null;
let currentFiles = [];
let currentFileIndex = -1;
let settings = { recent_folders: [], theme: "dark", use_gitignore: true };
let isEditMode = false;
let hasUnsavedChanges = false;
let isSourceMode = false;
let rawMarkdownContent = "";
let savedScrollRatio = 0;

/**
 * Convert the current Quill editor contents to Markdown.
 *
 * The quill-table-better module (attoae) uses internal `table-temporary`
 * blots as row separators. When you call `quill.getSemanticHTML()` directly,
 * those blots serialise as `<temporary>` elements *inside* the `<table>`
 * (not valid HTML structure), and each cell's content is wrapped in
 * `<p class="ql-table-block">…</p>` — both of which break turndown's
 * table handling. `turndown-plugin-gfm` also requires a `<thead>` to
 * recognise a table.
 *
 * We pre-process the HTML to:
 *   1. Remove the `<temporary>` blots
 *   2. Unwrap `<p>` inside `<td>`/`<th>` so cells contain plain text
 *   3. Synthesise a `<thead>` from the first row (GFM requires one)
 *   4. Drop any empty trailing paragraphs
 *
 * The pre-processing is non-destructive — the live editor keeps its
 * cursor, selection, and table interactivity.
 */
function getEditorMarkdown() {
    if (!quillEditor) return rawMarkdownContent;

    const rawHtml = quillEditor.getSemanticHTML();
    const cleanedHtml = stripTableTemporaryArtifacts(rawHtml);
    return turndown.turndown(cleanedHtml);
}

/**
 * Pre-process a Quill HTML string to make it turndown-friendly.
 * See `getEditorMarkdown` for the rationale behind each step.
 *
 * Always runs (DOMParser is cheap) — the attoae table fix and the
 * `<pre>` → `<pre><code>` fix are independent of each other, and the
 * latter applies to code blocks even when no tables are present.
 */
function stripTableTemporaryArtifacts(html) {
    if (!html) return html;

    const doc = new DOMParser().parseFromString(html, "text/html");

    // 1. Drop the attoae module's row-separator blots. DOMParser may
    //    have re-parented <temporary> outside <table> (it's not a valid
    //    child), so querySelectorAll finds them wherever they landed.
    doc.querySelectorAll("temporary.ql-table-temporary").forEach((el) => el.remove());

    // 2. Unwrap <p> inside cells so turndown sees plain text. (Markdown
    //    tables don't support multi-line cells anyway.)
    doc.querySelectorAll("td > p, th > p").forEach((p) => {
        p.replaceWith(doc.createTextNode(p.textContent));
    });

    // 3. Synthesise a <thead> from the first <tbody> row. GFM tables
    //    require a header row; the attoae module flattens <thead>
    //    into <tbody> (see parseMarkdownForEditor), so we have to
    //    re-elevate the first row to recover a valid GFM table.
    //    Drop tables with no rows at all — DOMParser re-parents
    //    <temporary> out of <table> (it's not a valid child), so a
    //    table that lost its temporaries can be left empty, and
    //    turndown-plugin-gfm's isHeadingRow() crashes on those.
    doc.querySelectorAll("table").forEach((table) => {
        if (table.querySelectorAll("tr").length === 0) {
            table.remove();
            return;
        }
        if (table.querySelector("thead")) return;
        const tbody = table.querySelector("tbody");
        const firstRow = tbody && tbody.querySelector("tr");
        if (!firstRow) return;
        const thead = doc.createElement("thead");
        firstRow.querySelectorAll("td").forEach((td) => {
            const th = doc.createElement("th");
            for (const attr of td.attributes) th.setAttribute(attr.name, attr.value);
            th.textContent = td.textContent;
            td.replaceWith(th);
        });
        thead.appendChild(firstRow);
        table.insertBefore(thead, tbody);
    });

    // 4. Quill 2 emits code blocks as bare `<pre data-language="…">…</pre>`.
    //    Turndown 7.x's default code-block rule only matches
    //    `<pre><code>…</code></pre>`, so a bare `<pre>` falls through and
    //    gets emitted as plain text — losing the ``` fence. Wrap the
    //    content in a <code> element (carrying the language as a class
    //    so marked will pick it up on re-parse).
    doc.querySelectorAll("pre").forEach((pre) => {
        if (pre.querySelector("code")) return;
        const code = doc.createElement("code");
        const lang = pre.getAttribute("data-language");
        if (lang) code.className = `language-${lang}`;
        while (pre.firstChild) code.appendChild(pre.firstChild);
        pre.appendChild(code);
    });

    // 5. Drop trailing empty paragraphs left behind by removed temporaries.
    const body = doc.body;
    while (
        body.lastElementChild &&
        body.lastElementChild.tagName === "P" &&
        body.lastElementChild.innerHTML.trim() === ""
    ) {
        body.removeChild(body.lastElementChild);
    }

    return doc.body.innerHTML;
}

// ── DOM references ──────────────────────────────────────────────────────────

const app = document.getElementById("app");
const openFolderBtn = document.getElementById("open-folder-btn");
const sidebarToggle = document.getElementById("sidebar-toggle");
const fileList = document.getElementById("file-list");
const emptyState = document.getElementById("empty-state");
const welcome = document.getElementById("welcome");
const markdownViewer = document.getElementById("markdown-viewer");
const renderedContent = document.getElementById("rendered-content");
const renderedContentInner = document.getElementById("rendered-content-inner");
const currentFilePath = document.getElementById("current-file-path");
const loadingIndicator = document.getElementById("loading-indicator");
const themeToggle = document.getElementById("theme-toggle");
const themeIconSun = document.getElementById("theme-icon-sun");
const themeIconMoon = document.getElementById("theme-icon-moon");
const reloadBtn = document.getElementById("reload-btn");
const menuBtn = document.getElementById("menu-btn");
const menuDropdown = document.getElementById("menu-dropdown");
const recentFoldersList = document.getElementById("recent-folders-list");
const menuOpenFolderItem = document.getElementById("menu-open-folder-item");
const menuSettingsItem = document.getElementById("menu-settings-item");
const settingsOverlay = document.getElementById("settings-overlay");
const settingsCloseBtn = document.getElementById("settings-close-btn");
const fontDefaultSelect = document.getElementById("font-default-select");
const fontHeaderSelect = document.getElementById("font-header-select");
const fontCodeSelect = document.getElementById("font-code-select");
const fontDefaultSize = document.getElementById("font-default-size");
const fontHeaderSize = document.getElementById("font-header-size");
const fontCodeSize = document.getElementById("font-code-size");
const useGitignoreCheckbox = document.getElementById("use-gitignore-checkbox");
const currentFolderBar = document.getElementById("current-folder-bar");
const currentFolderName = document.getElementById("current-folder-name");
const editToggleBtn = document.getElementById("edit-toggle-btn");
const editIconPen = document.getElementById("edit-icon-pen");
const editActions = document.getElementById("edit-actions");
const saveBtn = document.getElementById("save-btn");
const cancelBtn = document.getElementById("cancel-btn");
const editorContainer = document.getElementById("editor-container");
const menuSaveItem = document.getElementById("menu-save-item");
const menuSaveAsItem = document.getElementById("menu-save-as-item");
const menuEditDivider = document.getElementById("menu-edit-divider");
const sourceCheckbox = document.getElementById("source-checkbox");
const sourceCheckboxLabel = document.getElementById("source-checkbox-label");

// ── Settings (theme, recents, fonts) ─────────────────────────────────────────

async function loadSettings() {
    try {
        settings = await invoke("get_settings");
    } catch (err) {
        console.warn("Failed to load settings, using defaults:", err);
        settings = { recent_folders: [], theme: "dark" };
    }
    // Ensure default font fields
    if (!settings.default_font) settings.default_font = "Inter";
    if (!settings.header_font) settings.header_font = "Inter";
    if (!settings.code_font) settings.code_font = "JetBrains Mono";
    if (!settings.default_font_size) settings.default_font_size = 16;
    if (!settings.header_font_size) settings.header_font_size = 32;
    if (!settings.code_font_size) settings.code_font_size = 14;
    // Ensure use_gitignore is a boolean (Rust serde default is `true`, but
    // guard against any `undefined` from cached or legacy state).
    settings.use_gitignore = settings.use_gitignore !== false;
    applyTheme(settings.theme);
    applyFonts(settings.default_font, settings.header_font, settings.code_font, settings.default_font_size, settings.header_font_size, settings.code_font_size);
    renderRecentFolders();
    updateOpenFolderBtnVisibility();
}

async function persistSettings() {
    try {
        await invoke("save_settings", { settings });
    } catch (err) {
        console.warn("Failed to save settings:", err);
    }
}

// ── Theme ───────────────────────────────────────────────────────────────────

function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    const isLight = theme === "light";
    themeIconSun.style.display = isLight ? "none" : "block";
    themeIconMoon.style.display = isLight ? "block" : "none";
    themeToggle.title = isLight ? "Switch to dark theme" : "Switch to light theme";
    settings.theme = theme;
}

themeToggle.addEventListener("click", () => {
    const next = settings.theme === "dark" ? "light" : "dark";
    applyTheme(next);
    persistSettings();
});

// ── Reload ────────────────────────────────────────────────────────────────────

reloadBtn.addEventListener("click", async () => {
    if (!currentFolder) return;
    // Spin animation
    const svg = reloadBtn.querySelector("svg");
    svg.style.transition = "transform 0.3s ease";
    svg.style.transform = "rotate(-360deg)";
    await rescanCurrentFolder();
    // Reset rotation after animation completes
    setTimeout(() => {
        svg.style.transition = "none";
        svg.style.transform = "rotate(0deg)";
    }, 350);
});

// ── Fonts ───────────────────────────────────────────────────────────────────

function applyFonts(defaultFont, headerFont, codeFont, defaultFontSize, headerFontSize, codeFontSize) {
    // Load Google Fonts if needed
    loadGoogleFont(defaultFont);
    if (headerFont !== defaultFont) {
        loadGoogleFont(headerFont);
    }
    if (codeFont !== defaultFont && codeFont !== headerFont) {
        loadGoogleFont(codeFont);
    }

    // Apply body font
    document.documentElement.style.setProperty("--font-sans", `'${defaultFont}', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`);
    document.documentElement.style.setProperty("--user-font-sans", `'${defaultFont}', Georgia, 'Times New Roman', serif`);

    // Apply heading font
    document.documentElement.style.setProperty("--user-font-heading", `'${headerFont}', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`);

    // Apply code / monospace font
    document.documentElement.style.setProperty("--font-mono", `'${codeFont}', 'Consolas', 'Courier New', monospace`);
    document.documentElement.style.setProperty("--md-font-mono", `'${codeFont}', 'Consolas', 'Courier New', monospace`);

    // Apply font sizes
    document.documentElement.style.setProperty("--md-font-size", `${defaultFontSize}px`);
    document.documentElement.style.setProperty("--md-heading-base-size", `${headerFontSize}px`);
    document.documentElement.style.setProperty("--md-code-font-size", `${codeFontSize}px`);

    settings.default_font = defaultFont;
    settings.header_font = headerFont;
    settings.code_font = codeFont;
    settings.default_font_size = defaultFontSize;
    settings.header_font_size = headerFontSize;
    settings.code_font_size = codeFontSize;
}

// ── Sidebar Toggle ──────────────────────────────────────────────────────────

sidebarToggle.addEventListener("click", () => {
    app.classList.toggle("sidebar-hidden");
    const isHidden = app.classList.contains("sidebar-hidden");
    sidebarToggle.title = isHidden ? "Show sidebar" : "Hide sidebar";
});

// ── Menu Dropdown ───────────────────────────────────────────────────────────

menuBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    const isOpen = !menuDropdown.classList.contains("hidden");
    if (isOpen) {
        menuDropdown.classList.add("hidden");
    } else {
        renderRecentFolders();
        updateOpenFolderBtnVisibility();
        menuDropdown.classList.remove("hidden");
        // Clamp menu position so it doesn't clip on the left
        clampMenuPosition();
    }
});

document.addEventListener("click", (e) => {
    if (!menuDropdown.contains(e.target) && e.target !== menuBtn) {
        menuDropdown.classList.add("hidden");
    }
});

// Prevent menu from positioning itself less than 0 horizontally
function clampMenuPosition() {
    // Reset any inline style first
    menuDropdown.style.left = "";
    menuDropdown.style.right = "";
    // Force reflow
    void menuDropdown.offsetWidth;
    const rect = menuDropdown.getBoundingClientRect();
    if (rect.left < 0) {
        menuDropdown.style.left = "8px";
        menuDropdown.style.right = "auto";
    }
    if (rect.right > window.innerWidth) {
        menuDropdown.style.right = "8px";
        menuDropdown.style.left = "auto";
    }
}

function updateOpenFolderBtnVisibility() {
    const hasFolder = currentFolder !== null;
    // Show/hide the standalone "Open Folder" button
    openFolderBtn.style.display = hasFolder ? "none" : "";
    // Show/hide the reload button
    reloadBtn.style.display = hasFolder ? "" : "none";
    // Show/hide the menu item
    menuOpenFolderItem.classList.toggle("hidden", !hasFolder);
}

// Menu item actions
menuOpenFolderItem.addEventListener("click", () => {
    menuDropdown.classList.add("hidden");
    openFolder();
});

menuSettingsItem.addEventListener("click", () => {
    menuDropdown.classList.add("hidden");
    openSettings();
});

// ── Settings Modal ──────────────────────────────────────────────────────────

function buildFontSelect(selectEl, currentFont) {
    // Group fonts by category
    const categories = [
        { label: "Sans-serif", key: "sans-serif" },
        { label: "Serif", key: "serif" },
        { label: "Monospace", key: "monospace" },
    ];

    selectEl.innerHTML = "";
    categories.forEach((cat) => {
        const fonts = GOOGLE_FONTS.filter((f) => f.category === cat.key);
        if (fonts.length === 0) return;
        const group = document.createElement("optgroup");
        group.label = cat.label;
        fonts.forEach((f) => {
            const opt = document.createElement("option");
            opt.value = f.family;
            opt.textContent = f.family;
            opt.style.fontFamily = `'${f.family}', sans-serif`;
            if (f.family === currentFont) opt.selected = true;
            group.appendChild(opt);
        });
        selectEl.appendChild(group);
    });

    // If current font isn't in the list, add it
    const exists = Array.from(selectEl.options).some((o) => o.value === currentFont);
    if (!exists && currentFont) {
        const opt = document.createElement("option");
        opt.value = currentFont;
        opt.textContent = currentFont;
        opt.selected = true;
        selectEl.insertBefore(opt, selectEl.firstChild);
    }
}

function buildCodeFontSelect(selectEl, currentFont) {
    const monospaceFonts = GOOGLE_FONTS.filter((f) => f.category === "monospace");
    selectEl.innerHTML = "";
    monospaceFonts.forEach((f) => {
        const opt = document.createElement("option");
        opt.value = f.family;
        opt.textContent = f.family;
        opt.style.fontFamily = `'${f.family}', monospace`;
        if (f.family === currentFont) opt.selected = true;
        selectEl.appendChild(opt);
    });
    // If current font isn't in the list, add it
    const exists = Array.from(selectEl.options).some((o) => o.value === currentFont);
    if (!exists && currentFont) {
        const opt = document.createElement("option");
        opt.value = currentFont;
        opt.textContent = currentFont;
        opt.selected = true;
        selectEl.insertBefore(opt, selectEl.firstChild);
    }
}

function openSettings() {
    // Pre-load all Google Fonts so dropdown options render in their own typeface
    GOOGLE_FONTS.forEach((f) => loadGoogleFont(f.family));
    buildFontSelect(fontDefaultSelect, settings.default_font);
    buildFontSelect(fontHeaderSelect, settings.header_font);
    buildCodeFontSelect(fontCodeSelect, settings.code_font);
    fontDefaultSize.value = settings.default_font_size;
    fontHeaderSize.value = settings.header_font_size;
    fontCodeSize.value = settings.code_font_size;
    useGitignoreCheckbox.checked = settings.use_gitignore;
    settingsOverlay.classList.remove("hidden");
}

function closeSettings() {
    settingsOverlay.classList.add("hidden");
}

settingsCloseBtn.addEventListener("click", closeSettings);
settingsOverlay.addEventListener("click", (e) => {
    if (e.target === settingsOverlay) closeSettings();
});

fontDefaultSelect.addEventListener("change", () => {
    applyFonts(
        fontDefaultSelect.value,
        settings.header_font,
        settings.code_font,
        +fontDefaultSize.value || settings.default_font_size,
        +fontHeaderSize.value || settings.header_font_size,
        +fontCodeSize.value || settings.code_font_size
    );
    persistSettings();
});

fontHeaderSelect.addEventListener("change", () => {
    applyFonts(
        settings.default_font,
        fontHeaderSelect.value,
        settings.code_font,
        +fontDefaultSize.value || settings.default_font_size,
        +fontHeaderSize.value || settings.header_font_size,
        +fontCodeSize.value || settings.code_font_size
    );
    persistSettings();
});

fontCodeSelect.addEventListener("change", () => {
    applyFonts(
        settings.default_font,
        settings.header_font,
        fontCodeSelect.value,
        +fontDefaultSize.value || settings.default_font_size,
        +fontHeaderSize.value || settings.header_font_size,
        +fontCodeSize.value || settings.code_font_size
    );
    persistSettings();
});

fontDefaultSize.addEventListener("change", () => {
    const val = Math.max(10, Math.min(32, +fontDefaultSize.value || 16));
    fontDefaultSize.value = val;
    applyFonts(
        settings.default_font,
        settings.header_font,
        settings.code_font,
        val,
        +fontHeaderSize.value || settings.header_font_size,
        +fontCodeSize.value || settings.code_font_size
    );
    persistSettings();
});

fontHeaderSize.addEventListener("change", () => {
    const val = Math.max(14, Math.min(48, +fontHeaderSize.value || 32));
    fontHeaderSize.value = val;
    applyFonts(
        settings.default_font,
        settings.header_font,
        settings.code_font,
        +fontDefaultSize.value || settings.default_font_size,
        val,
        +fontCodeSize.value || settings.code_font_size
    );
    persistSettings();
});

fontCodeSize.addEventListener("change", () => {
    const val = Math.max(10, Math.min(28, +fontCodeSize.value || 14));
    fontCodeSize.value = val;
    applyFonts(
        settings.default_font,
        settings.header_font,
        settings.code_font,
        +fontDefaultSize.value || settings.default_font_size,
        +fontHeaderSize.value || settings.header_font_size,
        val
    );
    persistSettings();
});

useGitignoreCheckbox.addEventListener("change", () => {
    settings.use_gitignore = useGitignoreCheckbox.checked;
    persistSettings();
    // Re-scan the current folder so the change is visible immediately.
    rescanCurrentFolder();
});

// ── Recent Folders ──────────────────────────────────────────────────────────

function basename(p) {
    if (!p) return "";
    const parts = p.split(/[/\\]/).filter(Boolean);
    return parts[parts.length - 1] || p;
}

function renderRecentFolders() {
    recentFoldersList.innerHTML = "";
    const items = settings.recent_folders || [];
    if (items.length === 0) {
        const li = document.createElement("li");
        li.className = "recent-empty";
        li.textContent = "No recent folders";
        recentFoldersList.appendChild(li);
        return;
    }
    items.forEach((folderPath) => {
        const li = document.createElement("li");
        li.className = "recent-item";
        li.title = folderPath;
        li.innerHTML = `
      <span class="recent-icon">📁</span>
      <span class="recent-name">${escapeHtml(basename(folderPath) || folderPath)}</span>
      <span class="recent-path">${escapeHtml(folderPath)}</span>
    `;
        li.addEventListener("click", () => {
            menuDropdown.classList.add("hidden");
            openFolderByPath(folderPath);
        });
        recentFoldersList.appendChild(li);
    });
}

function pushRecent(folderPath) {
    const list = (settings.recent_folders || []).filter((p) => p !== folderPath);
    list.unshift(folderPath);
    settings.recent_folders = list.slice(0, 10);
    persistSettings();
}

// ── Open Folder ─────────────────────────────────────────────────────────────

openFolderBtn.addEventListener("click", openFolder);

async function openFolder() {
    try {
        const selected = await open({
            directory: true,
            multiple: false,
            title: "Select a folder with markdown files",
        });

        if (!selected) return;

        await openFolderByPath(selected);
    } catch (error) {
        showLoading(false);
        console.error("Failed to open folder:", error);
        alert(`Error opening folder: ${error}`);
    }
}

async function openFolderByPath(folderPath) {
    try {
        currentFolder = folderPath;
        showLoading(true);

        const files = await invoke("scan_md_files", {
            folderPath,
            useGitignore: settings.use_gitignore,
        });
        currentFiles = files;
        currentFileIndex = -1;

        showLoading(false);
        pushRecent(folderPath);
        renderFileList(files);
        updateCurrentFolderBar();
        updateOpenFolderBtnVisibility();
    } catch (error) {
        showLoading(false);
        console.error("Failed to open folder:", error);
        alert(`Error opening folder: ${error}`);
    }
}

// Re-runs the scan against the currently open folder using the latest
// settings. Used when the user toggles "Use .gitignore" in Settings.
async function rescanCurrentFolder() {
    if (!currentFolder) return;
    try {
        // Remember which file was selected so we can re-render it after rescan
        const selectedRelativePath = currentFileIndex >= 0 ? currentFiles[currentFileIndex]?.relative_path : null;

        showLoading(true);
        const files = await invoke("scan_md_files", {
            folderPath: currentFolder,
            useGitignore: settings.use_gitignore,
        });
        currentFiles = files;

        // Try to restore the previously selected file by relative path
        if (selectedRelativePath) {
            const restoredIndex = files.findIndex((f) => f.relative_path === selectedRelativePath);
            if (restoredIndex >= 0) {
                currentFileIndex = restoredIndex;
                updateActiveFile(restoredIndex);
                const file = files[restoredIndex];
                currentFilePath.textContent = file.relative_path;
                const content = await invoke("read_file", { filePath: file.path });
                renderMarkdown(content);
            } else {
                currentFileIndex = -1;
            }
        } else {
            currentFileIndex = -1;
        }

        showLoading(false);
        renderFileList(files);
    } catch (error) {
        showLoading(false);
        console.error("Failed to rescan folder:", error);
    }
}

// ── Init ────────────────────────────────────────────────────────────────────

loadSettings();
updateCurrentFolderBar();

// ── Current Folder Bar ──────────────────────────────────────────────────────

function updateCurrentFolderBar() {
    if (currentFolder) {
        currentFolderBar.classList.remove("hidden");
        currentFolderName.textContent = basename(currentFolder);
        currentFolderBar.title = currentFolder;
    } else {
        currentFolderBar.classList.add("hidden");
        currentFolderName.textContent = "";
        currentFolderBar.title = "";
    }
}

// ── File List ───────────────────────────────────────────────────────────────

function renderFileList(files) {
    fileList.innerHTML = "";

    if (files.length === 0) {
        emptyState.innerHTML = `
      <p>No markdown files found</p>
      <p class="hint">This folder doesn't contain any .md or .markdown files.</p>
    `;
        emptyState.classList.remove("hidden");
        fileList.classList.add("hidden");
        welcome.classList.add("hidden");
        return;
    }

    emptyState.innerHTML = `
      <p>No folder selected</p>
      <p class="hint">Click "Open Folder" to browse for a directory containing markdown files.</p>
    `;
    emptyState.classList.add("hidden");
    fileList.classList.remove("hidden");

    files.forEach((file, index) => {
        const li = document.createElement("li");
        li.className = "file-item";
        li.dataset.index = index;

        const dirParts = file.relative_path.split(/[/\\]/);
        const fileName = dirParts.pop();
        const dirPath = dirParts.join("/");

        li.innerHTML = `
      <span class="file-icon">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
          <polyline points="14 2 14 8 20 8"/>
          <line x1="16" y1="13" x2="8" y2="13"/>
          <line x1="16" y1="17" x2="8" y2="17"/>
          <line x1="10" y1="9" x2="8" y2="9"/>
        </svg>
      </span>
      <span class="file-label">${escapeHtml(fileName)}</span>
      ${dirPath ? `<span class="file-path-hint">${escapeHtml(dirPath)}</span>` : ""}
    `;

        li.addEventListener("click", () => selectFile(index));
        fileList.appendChild(li);
    });
}

function updateActiveFile(index) {
    document.querySelectorAll(".file-item").forEach((el) => {
        el.classList.remove("active");
    });

    const items = document.querySelectorAll(".file-item");
    if (items[index]) {
        items[index].classList.add("active");
        items[index].scrollIntoView({ block: "nearest" });
    }
}

// ── File Selection ──────────────────────────────────────────────────────────

async function selectFile(index) {
    if (index < 0 || index >= currentFiles.length) return;

    currentFileIndex = index;
    updateActiveFile(index);

    const file = currentFiles[index];
    currentFilePath.textContent = file.relative_path;

    try {
        const content = await invoke("read_file", { filePath: file.path });
        renderMarkdown(content);
    } catch (error) {
        console.error("Failed to read file:", error);
        renderedContentInner.innerHTML = `<div class="error">Error reading file: ${error}</div>`;
    }
}

function renderMarkdown(content) {
    const html = marked.parse(content);
    renderedContentInner.innerHTML = html;

    welcome.classList.add("hidden");
    markdownViewer.classList.remove("hidden");
}

// ── Loading State ───────────────────────────────────────────────────────────

function showLoading(visible) {
    if (visible) {
        welcome.classList.add("hidden");
        markdownViewer.classList.add("hidden");
        loadingIndicator.classList.remove("hidden");
    } else {
        loadingIndicator.classList.add("hidden");
    }
}

// ── Utility ─────────────────────────────────────────────────────────────────

function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Capture the current scroll ratio from the active editor (WYSIWYG .ql-editor
 * or source textarea). Returns a number 0..1, or 0 if not scrollable.
 */
function captureEditorScrollRatio() {
    if (isSourceMode) {
        const textarea = document.getElementById("source-editor");
        if (!textarea || textarea.scrollHeight <= textarea.clientHeight) return 0;
        return textarea.scrollTop / (textarea.scrollHeight - textarea.clientHeight);
    }
    const qlEditor = document.querySelector('.ql-editor');
    if (!qlEditor || qlEditor.scrollHeight <= qlEditor.clientHeight) return 0;
    return qlEditor.scrollTop / (qlEditor.scrollHeight - qlEditor.clientHeight);
}

/**
 * Restore a scroll ratio (0..1) on the #rendered-content container.
 */
function restoreRenderedScrollPosition(ratio) {
    if (ratio <= 0) return;
    const maxScroll = renderedContent.scrollHeight - renderedContent.clientHeight;
    if (maxScroll > 0) {
        renderedContent.scrollTop = ratio * maxScroll;
    }
}

// ── Keyboard navigation ─────────────────────────────────────────────────────

document.addEventListener("keydown", (e) => {
    if (currentFiles.length === 0) return;

    // Don't intercept arrow keys while in edit mode — let the editor handle them
    if (!isEditMode && e.key === "ArrowDown") {
        e.preventDefault();
        const next = Math.min(currentFileIndex + 1, currentFiles.length - 1);
        selectFile(next);
    } else if (!isEditMode && e.key === "ArrowUp") {
        e.preventDefault();
        const prev = Math.max(currentFileIndex - 1, 0);
        selectFile(prev);
    } else if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        if (isEditMode) {
            saveCurrentFile();
        }
    }
});

// ── Edit Mode ────────────────────────────────────────────────────────────────

let quillEditor = null;
let quillMarkdown = null;
const turndown = new TurndownService({
    headingStyle: 'atx',
    codeBlockStyle: 'fenced',
    bulletListMarker: '-',
    emDelimiter: '*',
    strongDelimiter: '**',
    linkStyle: 'inlined',
});
// GFM plugin gives us proper pipe-table output for `<table>` elements
// (the default turndown table rule ignores cells whose content is wrapped
// in `<p>`, which is exactly how quill-table-better serialises cells).
turndown.use(gfm);

editToggleBtn.addEventListener("click", async () => {
    if (currentFileIndex < 0) return;
    await enterEditMode();
});

saveBtn.addEventListener("click", async () => {
    await saveCurrentFile();
});

cancelBtn.addEventListener("click", () => {
    exitEditMode();
});

sourceCheckbox.addEventListener("change", () => {
    if (sourceCheckbox.checked) {
        switchToSourceMode();
    } else {
        switchToWysiwygMode();
    }
});

function switchToSourceMode() {
    isSourceMode = true;

    // Convert the live editor contents to Markdown. `getEditorMarkdown()`
    // strips the attoae table-temporary blots so tables come out as
    // proper GFM pipe-tables in the source view.
    let md = getEditorMarkdown();

    // Destroy Quill editor
    if (quillMarkdown) {
        try { quillMarkdown.destroy(); } catch (err) { /* ignore */ }
        quillMarkdown = null;
    }
    quillEditor = null;

    // Replace editor container with textarea
    editorContainer.innerHTML = '<textarea id="source-editor" placeholder="Edit raw Markdown source..."></textarea>';
    const textarea = document.getElementById("source-editor");
    textarea.value = md;

    // Track changes
    textarea.addEventListener("input", () => {
        hasUnsavedChanges = true;
    });

    // Handle Tab key for indentation
    textarea.addEventListener("keydown", (e) => {
        if (e.key === "Tab") {
            e.preventDefault();
            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;
            textarea.value = textarea.value.substring(0, start) + "    " + textarea.value.substring(end);
            textarea.selectionStart = textarea.selectionEnd = start + 4;
            hasUnsavedChanges = true;
        }
    });
}

function switchToWysiwygMode() {
    isSourceMode = false;

    // Get current markdown from textarea
    const textarea = document.getElementById("source-editor");
    const md = textarea ? textarea.value : rawMarkdownContent;
    rawMarkdownContent = md;

    // Clear container and recreate Quill
    editorContainer.innerHTML = '<div id="quill-editor"></div>';

    // Recreate toolbar
    const toolbarContainer = document.createElement('div');
    toolbarContainer.id = 'quill-toolbar';
    toolbarContainer.innerHTML = `
        <span class="ql-formats">
            <button class="ql-bold"></button>
            <button class="ql-italic"></button>
            <button class="ql-underline"></button>
            <button class="ql-strike"></button>
        </span>
        <span class="ql-formats">
            <button class="ql-blockquote"></button>
            <button class="ql-code-block"></button>
        </span>
        <span class="ql-formats">
            <button class="ql-header" value="1"></button>
            <button class="ql-header" value="2"></button>
            <button class="ql-header" value="3"></button>
        </span>
        <span class="ql-formats">
            <button class="ql-list" value="ordered"></button>
            <button class="ql-list" value="bullet"></button>
        </span>
        <span class="ql-formats">
            <button class="ql-link"></button>
            <button class="ql-image"></button>
        </span>
        <span class="ql-formats">
            <button class="ql-table-better"></button>
        </span>
        <span class="ql-formats">
            <button class="ql-clean"></button>
        </span>
    `;
    editorContainer.insertBefore(toolbarContainer, editorContainer.firstChild);

    // Convert Markdown to HTML for Quill
    const htmlContent = parseMarkdownForEditor(md);

    // Initialize Quill
    quillEditor = new Quill('#quill-editor', {
        modules: {
            toolbar: '#quill-toolbar',
            'table-better': {
                language: 'en_US',
                menus: ['column', 'row', 'merge', 'table', 'cell', 'wrap', 'copy', 'delete'],
                toolbarTable: true,
            },
            keyboard: {
                bindings: QuillTableBetter.keyboardBindings,
            },
        },
        theme: 'snow',
        placeholder: 'Start writing Markdown...',
    });

    // Populate the editor. Use clipboard.convert + updateContents so the
    // table-better module recognises the resulting table blots.
    // (setContents/dangerouslyPasteHTML would leave tables inert.)
    const delta = quillEditor.clipboard.convert({ html: htmlContent });
    quillEditor.updateContents(delta, Quill.sources.USER);

    // Set cursor at the beginning so the editor doesn't scroll to the bottom
    quillEditor.setSelection(0, Quill.sources.SILENT);

    try {
        quillMarkdown = new QuillMarkdown(quillEditor, {
            markdownShortcut: true,
            markdownShortcutSpaces: 1,
            quoteText: true,
            deleteOnBackspace: true,
            undoLikeWord: true,
        });
    } catch (err) {
        console.warn("QuillMarkdown initialization failed:", err);
    }

    quillEditor.on('text-change', () => {
        hasUnsavedChanges = true;
    });
}

async function enterEditMode() {
    const file = currentFiles[currentFileIndex];
    try {
        // Save scroll position as a ratio before hiding rendered content
        if (renderedContent.scrollHeight > renderedContent.clientHeight) {
            savedScrollRatio = renderedContent.scrollTop / (renderedContent.scrollHeight - renderedContent.clientHeight);
        } else {
            savedScrollRatio = 0;
        }

        const markdownContent = await invoke("read_file", { filePath: file.path });

        // Hide rendered content
        renderedContent.style.display = "none";

        // Store raw markdown for source mode
        rawMarkdownContent = markdownContent;

        // Show editor container
        editorContainer.style.display = "block";

        // Clear any existing content in the container
        editorContainer.innerHTML = '<div id="quill-editor"></div>';

        // Create toolbar container
        const toolbarContainer = document.createElement('div');
        toolbarContainer.id = 'quill-toolbar';
        toolbarContainer.innerHTML = `
            <span class="ql-formats">
                <button class="ql-bold"></button>
                <button class="ql-italic"></button>
                <button class="ql-underline"></button>
                <button class="ql-strike"></button>
            </span>
            <span class="ql-formats">
                <button class="ql-blockquote"></button>
                <button class="ql-code-block"></button>
            </span>
            <span class="ql-formats">
                <button class="ql-header" value="1"></button>
                <button class="ql-header" value="2"></button>
                <button class="ql-header" value="3"></button>
            </span>
            <span class="ql-formats">
                <button class="ql-list" value="ordered"></button>
                <button class="ql-list" value="bullet"></button>
            </span>
            <span class="ql-formats">
                <button class="ql-link"></button>
                <button class="ql-image"></button>
            </span>
            <span class="ql-formats">
                <button class="ql-table-better"></button>
            </span>
            <span class="ql-formats">
                <button class="ql-clean"></button>
            </span>
        `;
        editorContainer.insertBefore(toolbarContainer, editorContainer.firstChild);

        // Convert Markdown to HTML for Quill display
        const htmlContent = parseMarkdownForEditor(markdownContent);

        // Initialize Quill editor
        quillEditor = new Quill('#quill-editor', {
            modules: {
                toolbar: '#quill-toolbar',
                'table-better': {
                    language: 'en_US',
                    menus: ['column', 'row', 'merge', 'table', 'cell', 'wrap', 'copy', 'delete'],
                    toolbarTable: true,
                },
                keyboard: {
                    bindings: QuillTableBetter.keyboardBindings,
                },
            },
            theme: 'snow',
            placeholder: 'Start writing Markdown...',
        });

        // Populate the editor. Use clipboard.convert + updateContents so the
        // table-better module recognises the resulting table blots.
        // (setContents/dangerouslyPasteHTML would leave tables inert.)
        const delta = quillEditor.clipboard.convert({ html: htmlContent });
        quillEditor.updateContents(delta, Quill.sources.USER);

        // Set cursor at the beginning so the editor doesn't scroll to the bottom
        quillEditor.setSelection(0, Quill.sources.SILENT);

        // Restore the saved scroll position in the editor
        const qlEditorEl = document.querySelector('.ql-editor');
        if (qlEditorEl && savedScrollRatio > 0) {
            requestAnimationFrame(() => {
                // Need to wait for layout to settle after content is rendered
                const maxScroll = qlEditorEl.scrollHeight - qlEditorEl.clientHeight;
                if (maxScroll > 0) {
                    qlEditorEl.scrollTop = savedScrollRatio * maxScroll;
                }
            });
        }

        // Enable QuillMarkdown plugin for Markdown shortcuts
        try {
            quillMarkdown = new QuillMarkdown(quillEditor, {
                markdownShortcut: true,
                markdownShortcutSpaces: 1,
                quoteText: true,
                deleteOnBackspace: true,
                undoLikeWord: true,
            });
        } catch (err) {
            console.warn("QuillMarkdown initialization failed, continuing without it:", err);
        }

        // Track changes — `rawMarkdownContent` is refreshed on demand by
        // `getEditorMarkdown()` (used by save and source-mode toggle), not on
        // every keystroke, because round-tripping through turndown destroys
        // the attoae module's table format if the temp blots are present.
        quillEditor.on('text-change', () => {
            hasUnsavedChanges = true;
        });

        // Update UI
        isEditMode = true;
        isSourceMode = false;
        sourceCheckbox.checked = false;
        editToggleBtn.style.display = "none";
        editActions.style.display = "flex";
        sourceCheckboxLabel.style.display = "";
        menuSaveItem.classList.remove("hidden");
        menuSaveAsItem.classList.remove("hidden");
        menuEditDivider.classList.remove("hidden");

    } catch (error) {
        console.error("Failed to enter edit mode:", error);
    }
}

function exitEditMode() {
    // Clean up QuillMarkdown if initialized
    if (quillMarkdown) {
        try {
            quillMarkdown.destroy();
        } catch (err) {
            console.warn("Error destroying QuillMarkdown:", err);
        }
        quillMarkdown = null;
    }

    // Destroy Quill editor
    quillEditor = null;

    // Clear editor container
    editorContainer.innerHTML = '';

    // Hide editor container
    editorContainer.style.display = "none";

    // Show rendered content
    renderedContent.style.display = "block";

    // Update UI
    isEditMode = false;
    isSourceMode = false;
    hasUnsavedChanges = false;
    sourceCheckbox.checked = false;
    editActions.style.display = "none";
    sourceCheckboxLabel.style.display = "none";
    editToggleBtn.style.display = "";
    menuSaveItem.classList.add("hidden");
    menuSaveAsItem.classList.add("hidden");
    menuEditDivider.classList.add("hidden");
}

// ── Save/Save As ─────────────────────────────────────────────────────────────

menuSaveItem.addEventListener("click", async () => {
    await saveCurrentFile();
});

menuSaveAsItem.addEventListener("click", async () => {
    await saveFileAs();
});

async function saveCurrentFile() {
    if (currentFileIndex < 0) return;

    const file = currentFiles[currentFileIndex];

    let markdownContent;
    if (isSourceMode) {
        // Source mode: read directly from textarea — no conversion needed
        const sourceTextarea = document.getElementById("source-editor");
        markdownContent = sourceTextarea ? sourceTextarea.value : rawMarkdownContent;
    } else {
        // WYSIWYG mode: get clean HTML from Quill (strips table-temporary
        // blots so turndown produces a proper GFM table), then convert.
        markdownContent = getEditorMarkdown();
    }

    try {
        await invoke("write_file", { filePath: file.path, content: markdownContent });
        hasUnsavedChanges = false;

        // Update file path if it was new
        if (file.path.endsWith('.tmp') || !file.path.endsWith('.md')) {
            file.path = file.path; // Keep the same path
        }
        currentFiles[currentFileIndex] = file;

        // Save editor scroll ratio before re-rendering
        const editorScrollRatio = captureEditorScrollRatio();

        // Re-render markdown
        renderMarkdown(markdownContent);

        // Restore scroll position on rendered content
        restoreRenderedScrollPosition(editorScrollRatio);

        // Exit edit mode
        exitEditMode();
    } catch (error) {
        console.error("Failed to save file:", error);
    }
}

async function saveFileAs() {
    let markdownContent;
    if (isSourceMode) {
        const sourceTextarea = document.getElementById("source-editor");
        markdownContent = sourceTextarea ? sourceTextarea.value : rawMarkdownContent;
    } else {
        markdownContent = getEditorMarkdown();
    }

    try {
        const path = await save({
            filters: [{
                name: "Markdown",
                extensions: ["md", "markdown"],
            }],
            defaultPath: "untitled.md",
        });

        if (path) {
            await invoke("write_file", { filePath: path, content: markdownContent });

            // Update current file path
            if (currentFileIndex >= 0) {
                currentFiles[currentFileIndex].path = path;
            }

            // Save editor scroll ratio before re-rendering
            const editorScrollRatio = captureEditorScrollRatio();

            // Re-render markdown
            renderMarkdown(markdownContent);

            // Restore scroll position on rendered content
            restoreRenderedScrollPosition(editorScrollRatio);

            // Exit edit mode
            exitEditMode();
        }
    } catch (error) {
        console.error("Failed to save file as:", error);
    }
}

// ── Unsaved Changes Warning ──────────────────────────────────────────────────

function checkUnsavedChanges() {
    if (hasUnsavedChanges && isEditMode) {
        if (!confirm("You have unsaved changes. Do you want to discard them?")) {
            return false;
        }
        // Discard changes and exit edit mode
        exitEditMode();
    }
    return true;
}

// Override selectFile to check for unsaved changes
const originalSelectFile = selectFile;
selectFile = async function (index) {
    if (!checkUnsavedChanges()) return;
    await originalSelectFile(index);
};

// ── Highlight.js theme ──────────────────────────────────────────────────────

import "highlight.js/styles/atom-one-dark.css";
