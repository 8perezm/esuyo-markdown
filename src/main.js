import { invoke } from "@tauri-apps/api/core";
import { getCurrentWindow } from "@tauri-apps/api/window";
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
// Tree-view state. `treeExpanded` holds relative directory paths (forward
// slashes); `null` means "expand everything on the next render".
let treeExpanded = null;
let treeExpandedAuto = true;
let treeDirs = null;
let treeDirsFolder = null;
let treeDirsLoading = null;
let contextDir = "";
let settings = {
    recent_folders: [],
    theme: "dark",
    use_gitignore: true,
    file_view: "list",
    tree_show_all_dirs: false,
};
let isEditMode = false;
let hasUnsavedChanges = false;
let isSourceMode = false;
let rawMarkdownContent = "";
let savedScrollRatio = 0;

// ── Tabs ────────────────────────────────────────────────────────────────────
// Each tab owns its file identity, draft state and (lazily created) editor
// pane. Tabs are keyed by absolute path so they survive folder rescans.
let tabs = [];
let activeTabId = null;
let nextTabId = 1;
let settingsFlushTimer = null;
let dirtyResolve = null;
let dirtyDialogOpen = false;
let closeDialogOpen = false;

// ── Tab model ───────────────────────────────────────────────────────────────

function getTabById(id) {
    return tabs.find((t) => t.id === id) || null;
}

function getActiveTab() {
    return getTabById(activeTabId);
}

function getTabByPath(path) {
    const normalized = normalizePath(path);
    return tabs.find((t) => t.normalizedPath === normalized) || null;
}

function getTabIndexInFiles(tab) {
    if (!tab) return -1;
    return currentFiles.findIndex((f) => normalizePath(f.path) === tab.normalizedPath);
}

function syncCurrentFileFromTab() {
    currentFileIndex = getTabIndexInFiles(getActiveTab());
    updateActiveFile(currentFileIndex);
    if (currentFileIndex >= 0 && settings.file_view === "tree") revealTreeFile(currentFileIndex);
    updateDeleteBtnVisibility();
    updateEditorBar();
}

function createTab(file) {
    const tab = {
        id: nextTabId++,
        path: file.path,
        normalizedPath: normalizePath(file.path),
        fileName: basename(file.path),
        relativePath: file.relative_path,
        content: null,
        dirty: false,
        missing: false,
        isEditMode: false,
        isSourceMode: false,
        rawMarkdownContent: "",
        savedScrollRatio: 0,
        editorScrollRatio: 0,
        pane: null,
        quillEditor: null,
        quillMarkdown: null,
    };
    tabs.push(tab);
    renderTabBar();
    return tab;
}

function renderTabBar() {
    tabBar.innerHTML = "";
    if (tabs.length === 0) {
        tabBar.classList.add("hidden");
        return;
    }
    tabBar.classList.remove("hidden");
    for (const tab of tabs) {
        const el = document.createElement("div");
        el.className =
            "tab-item" +
            (tab.id === activeTabId ? " active" : "") +
            (tab.dirty ? " dirty" : "");
        el.dataset.tabId = String(tab.id);
        el.setAttribute("role", "tab");
        el.setAttribute("aria-selected", String(tab.id === activeTabId));
        el.title = tab.relativePath;
        el.innerHTML = `
            <span class="tab-icon">${FILE_ICON_SVG}</span>
            <span class="tab-name"></span>
            <span class="tab-dirty-dot"></span>
            <button class="tab-close" title="Close tab" aria-label="Close tab">×</button>
        `;
        el.querySelector(".tab-name").textContent = tab.fileName;
        el.addEventListener("click", () => activateTab(tab.id));
        el.addEventListener("auxclick", (e) => {
            if (e.button === 1) {
                e.preventDefault();
                closeTab(tab.id);
            }
        });
        el.querySelector(".tab-close").addEventListener("click", (e) => {
            e.stopPropagation();
            closeTab(tab.id);
        });
        tabBar.appendChild(el);
    }
}

function scrollActiveTabIntoView() {
    const activeEl = tabBar.querySelector(".tab-item.active");
    if (activeEl) activeEl.scrollIntoView({ block: "nearest", inline: "nearest" });
}

function captureRenderedScrollRatio() {
    if (renderedContent.scrollHeight <= renderedContent.clientHeight) return 0;
    return renderedContent.scrollTop / (renderedContent.scrollHeight - renderedContent.clientHeight);
}

function showTabPane(tab) {
    for (const t of tabs) {
        if (t.pane) {
            t.pane.style.display = t.id === activeTabId && t.isEditMode ? "flex" : "none";
        }
    }
}

function markTabDirty(tab) {
    if (!tab || tab.dirty) return;
    tab.dirty = true;
    isEditMode = true;
    hasUnsavedChanges = true;
    renderTabBar();
}

function getTabMarkdown(tab) {
    if (!tab) return "";
    if (tab.isSourceMode && tab.pane) {
        const textarea = tab.pane.querySelector("textarea.source-editor-pane");
        if (textarea) return textarea.value;
    }
    if (!tab.isSourceMode && tab.quillEditor) return getEditorMarkdown(tab);
    return tab.rawMarkdownContent || tab.content || "";
}

async function saveTabToDisk(tab) {
    const markdown = getTabMarkdown(tab);
    try {
        await invoke("write_file", { filePath: tab.path, content: markdown });
        tab.dirty = false;
        tab.content = markdown;
        const active = getActiveTab();
        hasUnsavedChanges = active ? active.dirty : false;
        renderTabBar();
        return true;
    } catch (error) {
        console.error("Failed to save file:", error);
        return false;
    }
}

async function activateTab(id, opts = {}) {
    const tab = getTabById(id);
    if (!tab) return;

    const previous = getActiveTab();
    if (previous && previous.id !== id) {
        if (previous.isEditMode) previous.editorScrollRatio = captureEditorScrollRatio(previous);
        else previous.savedScrollRatio = captureRenderedScrollRatio();
    }

    activeTabId = id;
    isEditMode = tab.isEditMode;
    isSourceMode = tab.isSourceMode;
    hasUnsavedChanges = tab.dirty;
    renderTabBar();
    scrollActiveTabIntoView();
    syncCurrentFileFromTab();

    if (tab.content === null && !tab.missing) {
        try {
            tab.content = await invoke("read_file", { filePath: tab.path });
        } catch (error) {
            console.error("Failed to read file:", error);
            tab.missing = true;
            tab.content = "";
        }
    }
    if (getActiveTab() !== tab) return; // user switched away while loading

    if (tab.isEditMode) {
        renderedContent.style.display = "none";
        editorContainer.classList.remove("hidden");
        editorContainer.style.display = "flex";
        showTabPane(tab);
        sourceCheckbox.checked = tab.isSourceMode;
    } else {
        showTabPane(null);
        editorContainer.classList.add("hidden");
        editorContainer.style.display = "none";
        renderedContent.style.display = "block";
        const content = tab.missing
            ? `<div class="error">File no longer exists: ${escapeHtml(tab.relativePath)}</div>`
            : tab.content;
        renderMarkdown(content);
        restoreRenderedScrollPosition(tab.savedScrollRatio);
    }
    if (!opts.skipPersist) persistCurrentTabs();
}

async function openTabForIndex(index) {
    if (index < 0 || index >= currentFiles.length) return;
    const file = currentFiles[index];
    let tab = getTabByPath(file.path);
    if (!tab) {
        tab = createTab(file);
    } else {
        tab.relativePath = file.relative_path;
        tab.fileName = basename(file.path);
        tab.missing = false;
    }
    await activateTab(tab.id);
}

async function closeTab(id) {
    const tab = getTabById(id);
    if (!tab) return;
    if (tab.dirty) {
        const result = await resolveDirty("close", [tab]);
        if (result.action !== "save" && result.action !== "discard") return;
    }
    const closedIndex = tabs.indexOf(tab);
    destroyTabEditor(tab);
    tabs.splice(closedIndex, 1);
    if (activeTabId === id) {
        activeTabId = null;
        if (tabs.length > 0) {
            const next = tabs[Math.min(closedIndex, tabs.length - 1)];
            await activateTab(next.id);
        } else {
            showWelcomeState();
        }
    }
    renderTabBar();
    persistCurrentTabs();
}

function showWelcomeState() {
    activeTabId = null;
    currentFileIndex = -1;
    welcome.classList.remove("hidden");
    markdownViewer.classList.add("hidden");
    loadingIndicator.classList.add("hidden");
    editorContainer.classList.add("hidden");
    renderTabBar();
    updateEditorBar();
    updateDeleteBtnVisibility();
}

function updateEditorBar() {
    const tab = getActiveTab();
    if (!tab) {
        currentFilePath.textContent = "";
        editActions.style.display = "none";
        editToggleBtn.style.display = "none";
        sourceCheckboxLabel.style.display = "none";
        deleteFileBtn.style.display = "none";
        menuSaveItem.classList.add("hidden");
        menuSaveAsItem.classList.add("hidden");
        menuEditDivider.classList.add("hidden");
        return;
    }
    currentFilePath.textContent = tab.relativePath + (tab.missing ? " (missing)" : "");
    deleteFileBtn.style.display = currentFileIndex >= 0 ? "" : "none";
    if (tab.isEditMode) {
        editToggleBtn.style.display = "none";
        editActions.style.display = "flex";
        sourceCheckboxLabel.style.display = "";
        sourceCheckbox.checked = tab.isSourceMode;
        menuSaveItem.classList.remove("hidden");
        menuSaveAsItem.classList.remove("hidden");
        menuEditDivider.classList.remove("hidden");
    } else {
        editActions.style.display = "none";
        editToggleBtn.style.display = "";
        sourceCheckboxLabel.style.display = "none";
        menuSaveItem.classList.add("hidden");
        menuSaveAsItem.classList.add("hidden");
        menuEditDivider.classList.add("hidden");
    }
}

async function restoreTabsForFolder() {
    const entry = settings.folder_tabs && settings.folder_tabs[normalizePath(currentFolder)];
    if (!entry || !Array.isArray(entry.tabs)) return;
    const byPath = new Map(currentFiles.map((f) => [normalizePath(f.path), f]));
    for (const path of entry.tabs) {
        const file = byPath.get(normalizePath(path));
        if (file) createTab(file);
    }
    const savedActive = entry.active ? getTabByPath(entry.active) : null;
    if (savedActive || tabs.length > 0) {
        await activateTab((savedActive || tabs[0]).id, { skipPersist: true });
    }
}

// ── Unsaved-changes dialog ──────────────────────────────────────────────────

function showDirtyDialog(dirtyTabs, verb) {
    dirtyTitle.textContent = "Unsaved changes";
    dirtySaveBtn.textContent = `Save selected & ${verb}`;
    dirtyDiscardBtn.textContent = `Discard & ${verb}`;
    dirtyMessage.textContent =
        dirtyTabs.length === 1
            ? `“${dirtyTabs[0].fileName}” has unsaved changes. What would you like to do?`
            : `${dirtyTabs.length} files have unsaved changes. Choose which ones to save.`;
    dirtyFileList.innerHTML = "";
    for (const tab of dirtyTabs) {
        const row = document.createElement("label");
        row.className = "dirty-row";
        row.dataset.tabId = String(tab.id);
        row.innerHTML = `
            <input type="checkbox" checked />
            <span class="dirty-name"></span>
            <span class="dirty-path"></span>
        `;
        row.querySelector(".dirty-name").textContent = tab.fileName;
        row.querySelector(".dirty-path").textContent = tab.relativePath;
        dirtyFileList.appendChild(row);
    }
    dirtyOverlay.classList.remove("hidden");
    dirtyDialogOpen = true;
    return new Promise((resolve) => {
        dirtyResolve = resolve;
    });
}

function finishDirtyDialog(action) {
    if (!dirtyDialogOpen || !dirtyResolve) return;
    const ids = Array.from(dirtyFileList.querySelectorAll(".dirty-row"))
        .filter((row) => row.querySelector("input").checked)
        .map((row) => Number(row.dataset.tabId));
    const resolve = dirtyResolve;
    dirtyResolve = null;
    dirtyDialogOpen = false;
    dirtyOverlay.classList.add("hidden");
    resolve({ action, ids });
}

async function resolveDirty(verb, onlyTabs = null) {
    const dirty = (onlyTabs || tabs).filter((t) => t.dirty);
    if (dirty.length === 0) return { action: "none", ids: [] };
    const result = await showDirtyDialog(dirty, verb);
    if (result.action === "save") {
        for (const id of result.ids) {
            const tab = getTabById(id);
            if (!tab) continue;
            const ok = await saveTabToDisk(tab);
            if (!ok) {
                alert(`Failed to save ${tab.fileName}. The operation was cancelled.`);
                return { action: "error", ids: [] };
            }
        }
    }
    return result;
}

// ── Per-tab editors ─────────────────────────────────────────────────────────

function buildToolbarHtml() {
    return `
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
}

function ensureTabPane(tab) {
    if (tab.pane) return tab.pane;
    const pane = document.createElement("div");
    pane.className = "editor-pane";
    pane.style.display = "none";
    pane.dataset.tabId = String(tab.id);
    tab.pane = pane;
    editorContainer.appendChild(pane);
    return pane;
}

function destroyQuillOnly(tab) {
    if (tab.quillMarkdown) {
        try {
            tab.quillMarkdown.destroy();
        } catch (err) {
            console.warn("Error destroying QuillMarkdown:", err);
        }
        tab.quillMarkdown = null;
    }
    tab.quillEditor = null;
}

function destroyTabEditor(tab) {
    destroyQuillOnly(tab);
    if (tab.pane) {
        tab.pane.remove();
        tab.pane = null;
    }
    tab.isEditMode = false;
    tab.isSourceMode = false;
    tab.rawMarkdownContent = "";
}

function initQuillForTab(tab, markdown) {
    const pane = ensureTabPane(tab);
    pane.innerHTML = "";

    const toolbar = document.createElement("div");
    toolbar.className = "quill-toolbar-pane";
    toolbar.id = `quill-toolbar-${tab.id}`;
    toolbar.innerHTML = buildToolbarHtml();
    pane.appendChild(toolbar);

    const host = document.createElement("div");
    host.className = "quill-host";
    pane.appendChild(host);

    const htmlContent = parseMarkdownForEditor(markdown);
    const editor = new Quill(host, {
        modules: {
            toolbar: `#quill-toolbar-${tab.id}`,
            "table-better": {
                language: "en_US",
                menus: ["column", "row", "merge", "table", "cell", "wrap", "copy", "delete"],
                toolbarTable: true,
            },
            keyboard: {
                bindings: QuillTableBetter.keyboardBindings,
            },
        },
        theme: "snow",
        placeholder: "Start writing Markdown...",
    });
    const delta = editor.clipboard.convert({ html: htmlContent });
    editor.updateContents(delta, Quill.sources.USER);
    editor.setSelection(0, Quill.sources.SILENT);
    tab.quillEditor = editor;

    try {
        tab.quillMarkdown = new QuillMarkdown(editor, {
            markdownShortcut: true,
            markdownShortcutSpaces: 1,
            quoteText: true,
            deleteOnBackspace: true,
            undoLikeWord: true,
        });
    } catch (err) {
        console.warn("QuillMarkdown initialization failed:", err);
    }

    editor.on("text-change", () => markTabDirty(tab));
    showTabPane(tab);
}

function switchToSourceMode(tab) {
    if (!tab) return;
    const markdown = getEditorMarkdown(tab);
    destroyQuillOnly(tab);

    const pane = ensureTabPane(tab);
    pane.innerHTML = "";
    const textarea = document.createElement("textarea");
    textarea.id = `source-editor-${tab.id}`;
    textarea.className = "source-editor-pane";
    textarea.placeholder = "Edit raw Markdown source...";
    textarea.value = markdown;
    textarea.addEventListener("input", () => markTabDirty(tab));
    textarea.addEventListener("keydown", (e) => {
        if (e.key === "Tab") {
            e.preventDefault();
            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;
            textarea.value =
                textarea.value.substring(0, start) + "    " + textarea.value.substring(end);
            textarea.selectionStart = textarea.selectionEnd = start + 4;
            markTabDirty(tab);
        }
    });
    pane.appendChild(textarea);
    tab.rawMarkdownContent = markdown;
    tab.isSourceMode = true;
    sourceCheckbox.checked = true;
    showTabPane(tab);
}

function switchToWysiwygMode(tab) {
    if (!tab) return;
    const textarea = tab.pane && tab.pane.querySelector("textarea.source-editor-pane");
    const markdown = textarea ? textarea.value : tab.rawMarkdownContent || tab.content || "";
    tab.rawMarkdownContent = markdown;
    tab.isSourceMode = false;
    sourceCheckbox.checked = false;
    initQuillForTab(tab, markdown);
}

async function enterEditMode(tab) {
    if (!tab) return;
    try {
        tab.savedScrollRatio = captureRenderedScrollRatio();
        if (tab.content === null) {
            tab.content = await invoke("read_file", { filePath: tab.path });
        }
        if (getActiveTab() !== tab) return;

        renderedContent.style.display = "none";
        editorContainer.classList.remove("hidden");
        editorContainer.style.display = "flex";
        tab.isEditMode = true;
        tab.isSourceMode = false;
        initQuillForTab(tab, tab.content);
        sourceCheckbox.checked = false;
        isEditMode = true;
        isSourceMode = false;
        hasUnsavedChanges = tab.dirty;
        updateEditorBar();

        const qlEditorEl = tab.pane && tab.pane.querySelector(".ql-editor");
        if (qlEditorEl && tab.editorScrollRatio > 0) {
            requestAnimationFrame(() => {
                const maxScroll = qlEditorEl.scrollHeight - qlEditorEl.clientHeight;
                if (maxScroll > 0) qlEditorEl.scrollTop = tab.editorScrollRatio * maxScroll;
            });
        }
    } catch (error) {
        console.error("Failed to enter edit mode:", error);
    }
}

function exitEditMode(tab, opts = {}) {
    if (!tab) return;
    const reRender = opts.reRender !== false;
    destroyTabEditor(tab);
    tab.dirty = false;
    isEditMode = false;
    isSourceMode = false;
    hasUnsavedChanges = false;
    sourceCheckbox.checked = false;
    if (reRender && getActiveTab() === tab) {
        editorContainer.classList.add("hidden");
        editorContainer.style.display = "none";
        renderedContent.style.display = "block";
        renderMarkdown(tab.content || "");
        restoreRenderedScrollPosition(tab.savedScrollRatio);
    }
    renderTabBar();
    updateEditorBar();
}

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
function getEditorMarkdown(tab = getActiveTab()) {
    if (!tab || !tab.quillEditor) return tab ? tab.rawMarkdownContent : "";
    const rawHtml = tab.quillEditor.getSemanticHTML();
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
const fileListContainer = document.getElementById("file-list-container");
const fileTree = document.getElementById("file-tree");
const fileViewBar = document.getElementById("file-view-bar");
const viewListBtn = document.getElementById("view-list-btn");
const viewTreeBtn = document.getElementById("view-tree-btn");
const treeAllDirs = document.getElementById("tree-all-dirs");
const treeAllDirsCheckbox = document.getElementById("tree-all-dirs-checkbox");
const folderContextMenu = document.getElementById("folder-context-menu");
const contextNewFileBtn = document.getElementById("context-new-file");
const emptyState = document.getElementById("empty-state");
const welcome = document.getElementById("welcome");
const markdownViewer = document.getElementById("markdown-viewer");
const renderedContent = document.getElementById("rendered-content");
const renderedContentInner = document.getElementById("rendered-content-inner");
const currentFilePath = document.getElementById("current-file-path");
const zoomIndicator = document.getElementById("zoom-indicator");
const loadingIndicator = document.getElementById("loading-indicator");
const themeToggle = document.getElementById("theme-toggle");
const themeIconSun = document.getElementById("theme-icon-sun");
const themeIconMoon = document.getElementById("theme-icon-moon");
const newFileBtn = document.getElementById("new-file-btn");
const reloadBtn = document.getElementById("reload-btn");
const menuBtn = document.getElementById("menu-btn");
const menuDropdown = document.getElementById("menu-dropdown");
const recentFoldersList = document.getElementById("recent-folders-list");
const menuNewFileItem = document.getElementById("menu-new-file-item");
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
const deleteFileBtn = document.getElementById("delete-file-btn");
const confirmOverlay = document.getElementById("confirm-overlay");
const confirmFileName = document.getElementById("confirm-file-name");
const confirmDeleteBtn = document.getElementById("confirm-delete-btn");
const confirmCancelBtn = document.getElementById("confirm-cancel-btn");
const tabBar = document.getElementById("tab-bar");
const dirtyOverlay = document.getElementById("dirty-overlay");
const dirtyTitle = document.getElementById("dirty-title");
const dirtyMessage = document.getElementById("dirty-message");
const dirtyFileList = document.getElementById("dirty-file-list");
const dirtySaveBtn = document.getElementById("dirty-save-btn");
const dirtyDiscardBtn = document.getElementById("dirty-discard-btn");
const dirtyCancelBtn = document.getElementById("dirty-cancel-btn");

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
    // Zoom is a multiplier on top of the base font sizes; legacy settings
    // files simply fall back to 100%.
    settings.zoom_level = snapZoomToLevel(settings.zoom_level);
    // Ensure use_gitignore is a boolean (Rust serde default is `true`, but
    // guard against any `undefined` from cached or legacy state).
    settings.use_gitignore = settings.use_gitignore !== false;
    settings.file_view = settings.file_view === "tree" ? "tree" : "list";
    settings.tree_show_all_dirs = settings.tree_show_all_dirs === true;
    if (!settings.folder_tabs || typeof settings.folder_tabs !== "object") {
        settings.folder_tabs = {};
    }
    updateViewControls();
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

function persistSettingsDebounced() {
    if (settingsFlushTimer) clearTimeout(settingsFlushTimer);
    settingsFlushTimer = setTimeout(() => {
        settingsFlushTimer = null;
        persistSettings();
    }, 200);
}

async function flushSettings() {
    if (settingsFlushTimer) {
        clearTimeout(settingsFlushTimer);
        settingsFlushTimer = null;
    }
    await persistSettings();
}

function normalizePath(p) {
    return (p || "").replace(/\\/g, "/");
}

/** Remember the open tabs for the current root folder. */
function persistCurrentTabs(immediate = false) {
    if (!currentFolder) return;
    if (!settings.folder_tabs) settings.folder_tabs = {};
    const active = getActiveTab();
    settings.folder_tabs[normalizePath(currentFolder)] = {
        tabs: tabs.map((t) => normalizePath(t.path)),
        active: active ? normalizePath(active.path) : null,
    };
    if (immediate) flushSettings();
    else persistSettingsDebounced();
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

newFileBtn.addEventListener("click", createNewFile);

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

    // Store the base sizes; applyZoom() scales them by the current zoom level
    // and writes the final --md-* size variables.
    settings.default_font = defaultFont;
    settings.header_font = headerFont;
    settings.code_font = codeFont;
    settings.default_font_size = defaultFontSize;
    settings.header_font_size = headerFontSize;
    settings.code_font_size = codeFontSize;
    applyZoom();
}

// ── Zoom ───────────────────────────────────────────────────────────────────
// Chrome-style discrete zoom steps. 100 is the user's "normal" (the base
// font sizes configured in Settings); Ctrl+0 always returns here.

const ZOOM_LEVELS = [50, 67, 75, 80, 90, 100, 110, 125, 150, 175, 200, 250, 300];
const DEFAULT_ZOOM = 100;
const CONTENT_BASE_WIDTH = 800;
let lastWheelZoomTime = 0;

function clampZoom(level) {
    const n = Math.round(Number(level));
    if (!Number.isFinite(n)) return DEFAULT_ZOOM;
    return Math.max(ZOOM_LEVELS[0], Math.min(ZOOM_LEVELS[ZOOM_LEVELS.length - 1], n));
}

function snapZoomToLevel(level) {
    const n = clampZoom(level);
    return ZOOM_LEVELS.reduce(
        (best, candidate) => Math.abs(candidate - n) < Math.abs(best - n) ? candidate : best,
        DEFAULT_ZOOM
    );
}

/** Apply the current zoom level to the markdown/editor font-size variables. */
function applyZoom() {
    const zoom = snapZoomToLevel(settings.zoom_level);
    settings.zoom_level = zoom;
    const factor = zoom / 100;
    const scaled = (base) => `${Math.round(base * factor * 100) / 100}px`;
    document.documentElement.style.setProperty("--md-font-size", scaled(settings.default_font_size ?? 16));
    document.documentElement.style.setProperty("--md-heading-base-size", scaled(settings.header_font_size ?? 32));
    document.documentElement.style.setProperty("--md-code-font-size", scaled(settings.code_font_size ?? 14));
    // Widen the reading column with the text so line lengths stay readable.
    // CSS caps this at 100% of the available width (see --content-max-width).
    document.documentElement.style.setProperty("--content-max-width", `${Math.round(CONTENT_BASE_WIDTH * factor)}px`);

    zoomIndicator.textContent = `${zoom}%`;
    zoomIndicator.classList.toggle("zoomed", zoom !== DEFAULT_ZOOM);
    zoomIndicator.title = zoom === DEFAULT_ZOOM
        ? "Zoom: 100% (normal). Ctrl + mouse wheel or Ctrl + / Ctrl - to change."
        : `Zoom: ${zoom}%. Click or press Ctrl+0 to reset to 100%.`;
}

function setZoom(level) {
    const next = snapZoomToLevel(level);
    if (next === settings.zoom_level) return;
    settings.zoom_level = next;
    applyZoom();
    persistSettingsDebounced();
}

function changeZoom(direction) {
    const current = ZOOM_LEVELS.indexOf(settings.zoom_level);
    const index = current === -1 ? ZOOM_LEVELS.indexOf(DEFAULT_ZOOM) : current;
    const next = Math.max(0, Math.min(ZOOM_LEVELS.length - 1, index + direction));
    setZoom(ZOOM_LEVELS[next]);
}

zoomIndicator.addEventListener("click", () => setZoom(DEFAULT_ZOOM));

// Ctrl/Cmd + wheel zooms anywhere in the app (capture phase so scrollable
// panes don't swallow it). The time throttle keeps trackpads from racing
// through every step in a single gesture.
document.addEventListener("wheel", (e) => {
    if (!(e.ctrlKey || e.metaKey) || e.deltaY === 0) return;
    e.preventDefault();
    const now = Date.now();
    if (now - lastWheelZoomTime < 100) return;
    lastWheelZoomTime = now;
    changeZoom(e.deltaY < 0 ? 1 : -1);
}, { passive: false, capture: true });

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
    // Show/hide the new file button
    newFileBtn.style.display = hasFolder ? "" : "none";
    // Show/hide the reload button
    reloadBtn.style.display = hasFolder ? "" : "none";
    // Show/hide the menu item
    menuOpenFolderItem.classList.toggle("hidden", !hasFolder);
}

// Menu item actions
menuNewFileItem.addEventListener("click", () => {
    menuDropdown.classList.add("hidden");
    createNewFile();
});

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
            requestOpenFolder(folderPath);
        });
        recentFoldersList.appendChild(li);
    });
}

function pushRecent(folderPath) {
    // Normalize to forward slashes so paths don't duplicate due to \ vs /
    const normalized = folderPath.replace(/\\/g, "/");
    const list = (settings.recent_folders || []).filter((p) => p !== normalized);
    list.unshift(normalized);
    settings.recent_folders = list.slice(0, 10);
    persistSettings();
}

// ── Open Folder ─────────────────────────────────────────────────────────────

openFolderBtn.addEventListener("click", openFolder);

// Genuine project switches resolve dirty tabs first. Internal folder changes
// (New File) call openFolderByPath directly and deliberately skip this.
async function requestOpenFolder(folderPath) {
    if (!folderPath) return;
    if (currentFolder && normalizePath(folderPath) === normalizePath(currentFolder)) return;
    const result = await resolveDirty("switch");
    if (result.action === "cancel" || result.action === "error") return;
    await openFolderByPath(folderPath);
}

async function openFolder() {
    try {
        const selected = await open({
            directory: true,
            multiple: false,
            title: "Select a folder with markdown files",
        });

        if (!selected) return;

        await requestOpenFolder(selected);
    } catch (error) {
        showLoading(false);
        console.error("Failed to open folder:", error);
        alert(`Error opening folder: ${error}`);
    }
}

async function openFolderByPath(folderPath) {
    try {
        // Persist the outgoing folder's tab set before anything is cleared.
        if (currentFolder) persistCurrentTabs(true);

        currentFolder = folderPath;
        // A new project starts with the tree fully expanded.
        treeExpanded = null;
        treeExpandedAuto = true;
        treeDirs = null;
        treeDirsFolder = null;
        treeDirsLoading = null;
        closeFolderContextMenu();
        showLoading(true);

        const files = await invoke("scan_md_files", {
            folderPath,
            useGitignore: settings.use_gitignore,
        });

        // The previous project's tabs were just persisted; drop their editors.
        for (const tab of tabs) destroyTabEditor(tab);
        tabs = [];
        activeTabId = null;

        currentFiles = files;
        currentFileIndex = -1;
        updateDeleteBtnVisibility();

        showLoading(false);
        pushRecent(folderPath);
        renderFileView(files);
        updateCurrentFolderBar();
        updateOpenFolderBtnVisibility();
        await restoreTabsForFolder();
        if (!getActiveTab()) showWelcomeState();
    } catch (error) {
        showLoading(false);
        console.error("Failed to open folder:", error);
        alert(`Error opening folder: ${error}`);
    }
}

// ── New File ────────────────────────────────────────────────────────────────

async function createNewFile() {
    try {
        const path = await save({
            filters: [{
                name: "Markdown",
                extensions: ["md", "markdown"],
            }],
            defaultPath: currentFolder
                ? `${currentFolder}/untitled.md`
                : "untitled.md",
        });

        if (!path) return;

        // Extract filename without extension for the template heading
        const parts = path.replace(/\\/g, "/").split("/").pop() || "untitled";
        const title = parts.replace(/\.(md|markdown)$/i, "");
        const content = `# ${title}\n\n`;

        await invoke("write_file", { filePath: path, content });

        // Open the parent folder of the new file as the current context
        const parentDir = path.replace(/\\/g, "/").replace(/\/[^/]+$/, "");
        await openFolderByPath(parentDir);

        // Find and select the newly created file
        const newIndex = currentFiles.findIndex((f) => f.path === path);
        if (newIndex >= 0) {
            await selectFile(newIndex);
        }
    } catch (error) {
        console.error("Failed to create new file:", error);
        alert(`Error creating file: ${error}`);
    }
}

/**
 * Creates a markdown file inside a specific directory of the open project.
 * Unlike the global New File button this keeps the project root as the
 * current folder, so the tree stays in context.
 */
async function createNewFileInFolder(dirRel) {
    if (!currentFolder) return;
    try {
        const segments = normalizeRelPath(dirRel).split("/").filter(Boolean);
        const dirAbs = [currentFolder, ...segments].join("/");
        const path = await save({
            filters: [{
                name: "Markdown",
                extensions: ["md", "markdown"],
            }],
            defaultPath: `${dirAbs}/untitled.md`,
        });
        if (!path) return;

        const fileName = path.replace(/\\/g, "/").split("/").pop() || "untitled.md";
        const title = fileName.replace(/\.(md|markdown)$/i, "");
        await invoke("write_file", { filePath: path, content: `# ${title}\n\n` });

        // Make sure a freshly created folder is visible in the tree.
        if (treeExpanded) {
            let acc = "";
            for (const seg of segments) {
                acc = acc ? `${acc}/${seg}` : seg;
                treeExpanded.add(acc);
            }
        }

        // Refresh the listing (and the directory cache) so the new file shows
        // up under the folder that was right-clicked.
        treeDirs = null;
        treeDirsFolder = null;
        await rescanCurrentFolder();

        const normalized = normalizeRelPath(path);
        const index = currentFiles.findIndex((f) => normalizeRelPath(f.path) === normalized);
        if (index >= 0) await selectFile(index);
    } catch (error) {
        console.error("Failed to create file in folder:", error);
        alert(`Error creating file: ${error}`);
    }
}

// Re-runs the scan against the currently open folder using the latest
// settings. Used when the user toggles "Use .gitignore" in Settings.
async function rescanCurrentFolder() {
    if (!currentFolder) return;
    // Ignore rules may have changed, and files/folders may have been added.
    treeDirs = null;
    treeDirsFolder = null;
    try {
        showLoading(true);
        const files = await invoke("scan_md_files", {
            folderPath: currentFolder,
            useGitignore: settings.use_gitignore,
        });
        currentFiles = files;

        // Reconcile open tabs with the new scan. Dirty tabs whose file has
        // vanished are kept (with their draft); clean ones are closed.
        const byPath = new Map(files.map((f) => [normalizePath(f.path), f]));
        for (const tab of [...tabs]) {
            const file = byPath.get(tab.normalizedPath);
            if (file) {
                tab.relativePath = file.relative_path;
                tab.fileName = basename(file.path);
                tab.missing = false;
                if (!tab.dirty) tab.content = null; // refresh from disk
            } else if (!tab.dirty) {
                destroyTabEditor(tab);
                tabs.splice(tabs.indexOf(tab), 1);
                if (activeTabId === tab.id) activeTabId = null;
            } else {
                tab.missing = true;
            }
        }

        showLoading(false);
        renderFileView(files);
        syncCurrentFileFromTab();
        renderTabBar();
        if (getActiveTab()) {
            await activateTab(activeTabId, { skipPersist: true });
        } else {
            showWelcomeState();
        }
        persistCurrentTabs();
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
        fileViewBar.classList.remove("hidden");
        currentFolderName.textContent = basename(currentFolder);
        currentFolderBar.title = currentFolder;
    } else {
        currentFolderBar.classList.add("hidden");
        fileViewBar.classList.add("hidden");
        currentFolderName.textContent = "";
        currentFolderBar.title = "";
    }
}

// ── File List / Tree ─────────────────────────────────────────────────────────

const FILE_ICON_SVG = `
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
      <polyline points="14 2 14 8 20 8"/>
      <line x1="16" y1="13" x2="8" y2="13"/>
      <line x1="16" y1="17" x2="8" y2="17"/>
      <line x1="10" y1="9" x2="8" y2="9"/>
  </svg>`;

const FOLDER_ICON_SVG = `
  <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5">
      <path d="M2 4.5V12A1.5 1.5 0 003.5 13.5h9A1.5 1.5 0 0014 12V5.5A1.5 1.5 0 0012.5 4H8.707l-1-1H3.5A1.5 1.5 0 002 4.5z"/>
  </svg>`;

const CHEVRON_SVG = `
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <polyline points="6 9 12 15 18 9"/>
  </svg>`;

function normalizeRelPath(p) {
    return (p || "").replace(/\\/g, "/");
}

function renderFileView(files) {
    fileList.innerHTML = "";
    fileTree.innerHTML = "";

    if (files.length === 0) {
        emptyState.innerHTML = `
      <p>No markdown files found</p>
      <p class="hint">This folder doesn't contain any .md or .markdown files.</p>
    `;
        emptyState.classList.remove("hidden");
        fileList.classList.add("hidden");
        fileTree.classList.add("hidden");
        welcome.classList.add("hidden");
        return;
    }

    emptyState.innerHTML = `
      <p>No folder selected</p>
      <p class="hint">Click "Open Folder" to browse for a directory containing markdown files.</p>
    `;
    emptyState.classList.add("hidden");

    if (settings.file_view === "tree") {
        fileList.classList.add("hidden");
        fileTree.classList.remove("hidden");
        renderFileTree(files);
        maybeLoadTreeDirs();
    } else {
        fileTree.classList.add("hidden");
        fileList.classList.remove("hidden");
        renderFlatFileList(files);
    }
}

function renderFlatFileList(files) {
    files.forEach((file, index) => {
        const li = document.createElement("li");
        li.className = "file-item";
        li.dataset.index = index;

        const dirParts = normalizeRelPath(file.relative_path).split("/");
        const fileName = dirParts.pop();
        const dirPath = dirParts.join("/");

        li.innerHTML = `
      <span class="file-icon">${FILE_ICON_SVG}</span>
      <span class="file-label">${escapeHtml(fileName)}</span>
      ${dirPath ? `<span class="file-path-hint">${escapeHtml(dirPath)}</span>` : ""}
    `;

        li.addEventListener("click", () => selectFile(index));
        fileList.appendChild(li);
    });
}

// ── Tree construction ───────────────────────────────────────────────────────

async function loadTreeDirs() {
    if (!currentFolder) return [];
    try {
        treeDirs = await invoke("scan_dirs", {
            folderPath: currentFolder,
            useGitignore: settings.use_gitignore,
        });
    } catch (err) {
        console.warn("Failed to scan directories:", err);
        treeDirs = [];
    }
    treeDirsFolder = currentFolder;
    return treeDirs;
}

function maybeLoadTreeDirs() {
    if (settings.file_view !== "tree" || !settings.tree_show_all_dirs || !currentFolder) return;
    if (treeDirs && treeDirsFolder === currentFolder) return;
    if (treeDirsLoading === currentFolder) return;

    treeDirsLoading = currentFolder;
    const folderAtRequest = currentFolder;
    loadTreeDirs().then(() => {
        treeDirsLoading = null;
        if (settings.file_view !== "tree" || currentFolder !== folderAtRequest) return;
        if (treeExpandedAuto && treeExpanded) {
            treeDirs.forEach((d) => treeExpanded.add(normalizeRelPath(d)));
        }
        renderFileView(currentFiles);
        if (currentFileIndex >= 0) {
            updateActiveFile(currentFileIndex);
            revealTreeFile(currentFileIndex);
        }
    });
}

function buildTree(files, dirs) {
    const makeNode = (name, path) => ({ name, path, dirs: new Map(), files: [] });
    const root = makeNode("", "");

    const getDir = (rel) => {
        if (!rel) return root;
        let node = root;
        let acc = "";
        for (const part of rel.split("/").filter(Boolean)) {
            acc = acc ? `${acc}/${part}` : part;
            if (!node.dirs.has(part)) node.dirs.set(part, makeNode(part, acc));
            node = node.dirs.get(part);
        }
        return node;
    };

    dirs.forEach((d) => getDir(normalizeRelPath(d)));
    files.forEach((file, index) => {
        const parts = normalizeRelPath(file.relative_path).split("/");
        const name = parts.pop();
        getDir(parts.join("/")).files.push({ index, name });
    });
    return root;
}

function collectDirPaths(node) {
    const paths = [];
    node.dirs.forEach((dir) => {
        paths.push(dir.path);
        paths.push(...collectDirPaths(dir));
    });
    return paths;
}

function renderFileTree(files) {
    const dirs = settings.tree_show_all_dirs && treeDirs && treeDirsFolder === currentFolder
        ? treeDirs
        : [];
    const root = buildTree(files, dirs);
    // A new folder starts with everything expanded; after that, respect the
    // user's collapsed choices (they survive rescans and new files).
    if (treeExpanded === null) treeExpanded = new Set(collectDirPaths(root));

    const fragment = document.createDocumentFragment();
    appendTreeNodes(root, fragment, 0);
    fileTree.appendChild(fragment);
}

function appendTreeNodes(node, parent, depth) {
    const dirs = [...node.dirs.values()].sort((a, b) =>
        a.name.localeCompare(b.name, undefined, { sensitivity: "base" })
    );
    dirs.forEach((dir) => parent.appendChild(createDirRow(dir, depth)));
    node.files.forEach((file) => parent.appendChild(createFileRow(file, depth)));
}

function createDirRow(dir, depth) {
    const li = document.createElement("li");
    const row = document.createElement("div");
    const expanded = treeExpanded.has(dir.path);

    row.className = `tree-row tree-dir${expanded ? "" : " collapsed"}`;
    row.dataset.dir = dir.path;
    row.title = dir.path;
    row.style.paddingLeft = `${10 + depth * 14}px`;
    row.innerHTML = `
      <span class="tree-chevron">${CHEVRON_SVG}</span>
      <span class="tree-icon">${FOLDER_ICON_SVG}</span>
      <span class="tree-label"></span>
    `;
    row.querySelector(".tree-label").textContent = dir.name;

    const children = document.createElement("ul");
    children.className = `tree-children${expanded ? "" : " hidden"}`;
    appendTreeNodes(dir, children, depth + 1);

    row.addEventListener("click", () => setDirExpanded(dir.path, !treeExpanded.has(dir.path)));
    row.addEventListener("contextmenu", (e) => {
        e.preventDefault();
        e.stopPropagation();
        openFolderContextMenu(e.clientX, e.clientY, dir.path);
    });

    li.appendChild(row);
    li.appendChild(children);
    return li;
}

function createFileRow(file, depth) {
    const li = document.createElement("li");
    const row = document.createElement("div");

    row.className = "tree-row tree-file";
    row.dataset.index = file.index;
    row.title = file.name;
    row.style.paddingLeft = `${24 + depth * 14}px`;
    row.innerHTML = `
      <span class="tree-icon">${FILE_ICON_SVG}</span>
      <span class="tree-label"></span>
    `;
    row.querySelector(".tree-label").textContent = file.name;
    if (file.index === currentFileIndex) row.classList.add("active");

    row.addEventListener("click", () => selectFile(file.index));
    li.appendChild(row);
    return li;
}

function setDirExpanded(path, expanded) {
    treeExpandedAuto = false;
    if (expanded) treeExpanded.add(path);
    else treeExpanded.delete(path);

    for (const row of fileTree.querySelectorAll(".tree-dir")) {
        if (row.dataset.dir !== path) continue;
        row.classList.toggle("collapsed", !expanded);
        const children = row.nextElementSibling;
        if (children && children.classList.contains("tree-children")) {
            children.classList.toggle("hidden", !expanded);
        }
    }
}

function revealTreeFile(index) {
    const file = currentFiles[index];
    if (!file || settings.file_view !== "tree") return;
    const parts = normalizeRelPath(file.relative_path).split("/");
    parts.pop();
    let rel = "";
    for (const part of parts) {
        rel = rel ? `${rel}/${part}` : part;
        setDirExpanded(rel, true);
    }
}

function updateActiveFile(index) {
    document.querySelectorAll(".file-item.active, .tree-file.active").forEach((el) => {
        el.classList.remove("active");
    });

    let item = null;
    if (settings.file_view === "tree") {
        item = fileTree.querySelector(`.tree-file[data-index="${index}"]`);
    } else {
        item = fileList.querySelectorAll(".file-item")[index];
    }
    if (item) {
        item.classList.add("active");
        item.scrollIntoView({ block: "nearest" });
    }
}

// ── View controls ───────────────────────────────────────────────────────────

function updateViewControls() {
    const isTree = settings.file_view === "tree";
    viewListBtn.classList.toggle("active", !isTree);
    viewTreeBtn.classList.toggle("active", isTree);
    viewListBtn.setAttribute("aria-pressed", String(!isTree));
    viewTreeBtn.setAttribute("aria-pressed", String(isTree));
    treeAllDirs.classList.toggle("hidden", !isTree);
    treeAllDirsCheckbox.checked = settings.tree_show_all_dirs;
}

function switchFileView(view) {
    if (settings.file_view === view) return;
    settings.file_view = view;
    updateViewControls();
    persistSettings();
    closeFolderContextMenu();
    renderFileView(currentFiles);
    if (currentFileIndex >= 0) {
        updateActiveFile(currentFileIndex);
        if (view === "tree") revealTreeFile(currentFileIndex);
    }
}

viewListBtn.addEventListener("click", () => switchFileView("list"));
viewTreeBtn.addEventListener("click", () => switchFileView("tree"));

treeAllDirsCheckbox.addEventListener("change", () => {
    settings.tree_show_all_dirs = treeAllDirsCheckbox.checked;
    persistSettings();
    renderFileView(currentFiles);
    if (currentFileIndex >= 0) {
        updateActiveFile(currentFileIndex);
        revealTreeFile(currentFileIndex);
    }
});

// ── Folder context menu ─────────────────────────────────────────────────────

function openFolderContextMenu(x, y, dirPath) {
    contextDir = dirPath || "";
    folderContextMenu.classList.remove("hidden");
    const rect = folderContextMenu.getBoundingClientRect();
    folderContextMenu.style.left = `${Math.max(8, Math.min(x, window.innerWidth - rect.width - 8))}px`;
    folderContextMenu.style.top = `${Math.max(8, Math.min(y, window.innerHeight - rect.height - 8))}px`;
}

function closeFolderContextMenu() {
    folderContextMenu.classList.add("hidden");
}

fileTree.addEventListener("contextmenu", (e) => {
    const dirRow = e.target.closest(".tree-dir");
    // Right-clicking a file keeps the native menu; folders (and the empty
    // tree background, meaning the project root) get our custom menu.
    if (!dirRow && e.target.closest(".tree-file")) return;
    e.preventDefault();
    openFolderContextMenu(e.clientX, e.clientY, dirRow ? dirRow.dataset.dir : "");
});

currentFolderBar.addEventListener("contextmenu", (e) => {
    e.preventDefault();
    openFolderContextMenu(e.clientX, e.clientY, "");
});

contextNewFileBtn.addEventListener("click", () => {
    const dir = contextDir;
    closeFolderContextMenu();
    createNewFileInFolder(dir);
});

document.addEventListener("click", (e) => {
    if (!folderContextMenu.contains(e.target)) closeFolderContextMenu();
});

document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeFolderContextMenu();
});

fileListContainer.addEventListener("scroll", closeFolderContextMenu);

// ── File Selection ──────────────────────────────────────────────────────────

function updateDeleteBtnVisibility() {
    if (currentFileIndex >= 0 && currentFiles.length > 0) {
        deleteFileBtn.style.display = "";
    } else {
        deleteFileBtn.style.display = "none";
    }
}

async function selectFile(index) {
    // Opening a file from the nav either focuses its existing tab or creates
    // a new one. Unsaved edits are preserved in their own tabs.
    await openTabForIndex(index);
}

function renderMarkdown(content) {
    const html = marked.parse(content);
    renderedContentInner.innerHTML = html;

    welcome.classList.add("hidden");
    markdownViewer.classList.remove("hidden");

    // Intercept clicks on internal markdown links to navigate within the app
    renderedContentInner.querySelectorAll("a[href$='.md']").forEach((link) => {
        link.addEventListener("click", (e) => {
            const href = link.getAttribute("href");
            if (!href || href.startsWith("http://") || href.startsWith("https://")) return;

            // Resolve the link target relative to the current file's folder
            const currentFile = currentFiles[currentFileIndex];
            if (!currentFile) return;

            const currentDir = currentFile.relative_path.split("/").slice(0, -1).join("/");
            const targetPath = (currentDir ? currentDir + "/" : "") + href;

            // Find the matching file in the current file list
            const targetIndex = currentFiles.findIndex((f) => f.relative_path === targetPath);
            if (targetIndex >= 0) {
                e.preventDefault();
                selectFile(targetIndex);
            }
            // If no match, let the browser handle it normally
        });
    });
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
function captureEditorScrollRatio(tab = getActiveTab()) {
    if (!tab || !tab.pane) return 0;
    if (tab.isSourceMode) {
        const textarea = tab.pane.querySelector("textarea.source-editor-pane");
        if (!textarea || textarea.scrollHeight <= textarea.clientHeight) return 0;
        return textarea.scrollTop / (textarea.scrollHeight - textarea.clientHeight);
    }
    const qlEditor = tab.pane.querySelector(".ql-editor");
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

function cycleTab(delta) {
    if (tabs.length < 2) return;
    const index = tabs.findIndex((t) => t.id === activeTabId);
    const next = tabs[(index + delta + tabs.length) % tabs.length];
    activateTab(next.id);
}

document.addEventListener("keydown", (e) => {
    const modifier = e.ctrlKey || e.metaKey;
    if (modifier && e.key.toLowerCase() === "s") {
        e.preventDefault();
        const tab = getActiveTab();
        if (tab && tab.isEditMode) saveCurrentFile();
        return;
    }
    if (modifier && e.key.toLowerCase() === "w") {
        e.preventDefault();
        if (activeTabId !== null) closeTab(activeTabId);
        return;
    }
    if (modifier && (e.key === "Tab" || e.key === "PageDown")) {
        e.preventDefault();
        cycleTab(1);
        return;
    }
    if (modifier && e.key === "PageUp") {
        e.preventDefault();
        cycleTab(-1);
        return;
    }
    // Zoom shortcuts work even with no folder open, so they sit above the guard.
    if (modifier && (e.key === "0" || e.code === "Numpad0")) {
        e.preventDefault();
        setZoom(DEFAULT_ZOOM);
        return;
    }
    if (modifier && (e.key === "+" || e.key === "=" || e.code === "Equal" || e.code === "NumpadAdd")) {
        e.preventDefault();
        changeZoom(1);
        return;
    }
    if (modifier && (e.key === "-" || e.key === "_" || e.code === "Minus" || e.code === "NumpadSubtract")) {
        e.preventDefault();
        changeZoom(-1);
        return;
    }
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
    } else if (modifier && e.key.toLowerCase() === "n") {
        e.preventDefault();
        createNewFile();
    }
});

// ── Edit Mode ────────────────────────────────────────────────────────────────

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
    const tab = getActiveTab();
    if (!tab) return;
    await enterEditMode(tab);
});

saveBtn.addEventListener("click", async () => {
    await saveCurrentFile();
});

cancelBtn.addEventListener("click", () => {
    exitEditMode(getActiveTab());
});

sourceCheckbox.addEventListener("change", () => {
    const tab = getActiveTab();
    if (!tab || !tab.isEditMode) return;
    if (sourceCheckbox.checked) switchToSourceMode(tab);
    else switchToWysiwygMode(tab);
});

// ── Delete File ──────────────────────────────────────────────────────────────

function showDeleteConfirm() {
    if (currentFileIndex < 0) return;
    const file = currentFiles[currentFileIndex];
    confirmFileName.textContent = file.relative_path;
    confirmOverlay.classList.remove("hidden");
}

function closeDeleteConfirm() {
    confirmOverlay.classList.add("hidden");
}

deleteFileBtn.addEventListener("click", showDeleteConfirm);

confirmCancelBtn.addEventListener("click", closeDeleteConfirm);

confirmOverlay.addEventListener("click", (e) => {
    if (e.target === confirmOverlay) closeDeleteConfirm();
});

confirmDeleteBtn.addEventListener("click", async () => {
    if (currentFileIndex < 0) return;
    const file = currentFiles[currentFileIndex];
    const deletedPath = file.path;
    const deletedTab = getTabByPath(deletedPath);
    const tabIndex = deletedTab ? tabs.indexOf(deletedTab) : -1;

    closeDeleteConfirm();

    try {
        await invoke("delete_file", { filePath: deletedPath });

        currentFiles = currentFiles.filter((f) => normalizePath(f.path) !== normalizePath(deletedPath));
        if (deletedTab) {
            destroyTabEditor(deletedTab);
            tabs.splice(tabIndex, 1);
            if (activeTabId === deletedTab.id) activeTabId = null;
        }
        renderFileView(currentFiles);

        if (getActiveTab()) {
            await activateTab(activeTabId, { skipPersist: true });
        } else if (tabs.length > 0) {
            await activateTab(tabs[0].id, { skipPersist: true });
        } else if (currentFiles.length > 0) {
            const newIndex = Math.min(Math.max(tabIndex, 0), currentFiles.length - 1);
            await selectFile(newIndex);
        } else {
            showWelcomeState();
        }
        persistCurrentTabs();
    } catch (error) {
        console.error("Failed to delete file:", error);
        alert(`Error deleting file: ${error}`);
    }
});

// ── Save/Save As ─────────────────────────────────────────────────────────────

menuSaveItem.addEventListener("click", async () => {
    await saveCurrentFile();
});

menuSaveAsItem.addEventListener("click", async () => {
    await saveFileAs();
});

async function saveCurrentFile() {
    const tab = getActiveTab();
    if (!tab || currentFileIndex < 0) return;

    const markdown = getTabMarkdown(tab);
    const editorScrollRatio = captureEditorScrollRatio(tab);
    try {
        await invoke("write_file", { filePath: tab.path, content: markdown });
        tab.dirty = false;
        tab.content = markdown;
        hasUnsavedChanges = false;

        exitEditMode(tab, { reRender: false });
        renderedContent.style.display = "block";
        editorContainer.classList.add("hidden");
        renderMarkdown(markdown);
        restoreRenderedScrollPosition(editorScrollRatio);
        renderTabBar();
        persistCurrentTabs();
    } catch (error) {
        console.error("Failed to save file:", error);
        alert(`Failed to save ${tab.fileName}: ${error}`);
    }
}

async function saveFileAs() {
    const tab = getActiveTab();
    if (!tab) return;

    const markdown = getTabMarkdown(tab);
    try {
        const path = await save({
            filters: [{
                name: "Markdown",
                extensions: ["md", "markdown"],
            }],
            defaultPath: tab.fileName,
        });
        if (!path) return;

        await invoke("write_file", { filePath: path, content: markdown });
        const editorScrollRatio = captureEditorScrollRatio(tab);
        exitEditMode(tab, { reRender: false });

        // Re-key the tab (and the in-memory file entry) to the new path.
        const oldNormalized = tab.normalizedPath;
        tab.path = path;
        tab.normalizedPath = normalizePath(path);
        tab.fileName = basename(path);
        const fileEntry = currentFiles.find((f) => normalizePath(f.path) === oldNormalized);
        if (fileEntry) {
            fileEntry.path = path;
            fileEntry.name = tab.fileName;
        }
        const index = currentFiles.findIndex((f) => normalizePath(f.path) === tab.normalizedPath);
        tab.relativePath = index >= 0 ? currentFiles[index].relative_path : tab.fileName + " (outside folder)";
        tab.missing = false;
        tab.dirty = false;
        tab.content = markdown;
        hasUnsavedChanges = false;

        renderedContent.style.display = "block";
        editorContainer.classList.add("hidden");
        renderMarkdown(markdown);
        restoreRenderedScrollPosition(editorScrollRatio);
        syncCurrentFileFromTab();
        renderTabBar();
        persistCurrentTabs();
    } catch (error) {
        console.error("Failed to save file as:", error);
        alert(`Failed to save file: ${error}`);
    }
}

// ── Dirty dialog + app close ─────────────────────────────────────────────────

dirtySaveBtn.addEventListener("click", () => finishDirtyDialog("save"));
dirtyDiscardBtn.addEventListener("click", () => finishDirtyDialog("discard"));
dirtyCancelBtn.addEventListener("click", () => finishDirtyDialog("cancel"));

async function setupWindowCloseHandler() {
    try {
        const appWindow = getCurrentWindow();
        await appWindow.onCloseRequested(async (event) => {
            if (closeDialogOpen) {
                event.preventDefault();
                return;
            }
            const dirty = tabs.filter((t) => t.dirty);
            if (dirty.length === 0) {
                await flushSettings();
                return; // no preventDefault → Tauri closes the window
            }

            event.preventDefault();
            closeDialogOpen = true;
            try {
                const result = await resolveDirty("quit");
                if (result.action === "cancel" || result.action === "error") return;
                await flushSettings();
                await appWindow.destroy();
            } catch (error) {
                console.error("Failed during application close:", error);
            } finally {
                closeDialogOpen = false;
            }
        });
    } catch (error) {
        console.warn("Window close handler unavailable (browser preview?):", error);
    }
}

setupWindowCloseHandler();

// ── Highlight.js theme ──────────────────────────────────────────────────────

import "highlight.js/styles/atom-one-dark.css";
