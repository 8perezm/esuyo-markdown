import { invoke } from "@tauri-apps/api/core";
import { open, save } from "@tauri-apps/plugin-dialog";
import { Marked } from "marked";
import { markedHighlight } from "marked-highlight";
import hljs from "highlight.js";
import Quill from "quill";
import "quill/dist/quill.snow.css";
import QuillMarkdown from "quilljs-markdown";
import "quilljs-markdown/dist/quilljs-markdown-common-style.css";
import TurndownService from "turndown";

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

editToggleBtn.addEventListener("click", async () => {
    if (!currentFileIndex || currentFileIndex < 0) return;

    if (isEditMode) {
        // Toggle button just enters edit mode; it's always "enter" from view mode
        await enterEditMode();
    } else {
        // Enter edit mode
        await enterEditMode();
    }
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

    // Use rawMarkdownContent directly — do NOT round-trip through Quill HTML → Turndown,
    // because that corrupts tables, code blocks, fenced blocks, and other complex structures.
    // rawMarkdownContent is kept current by the text-change handler in WYSIWYG mode.
    let md = rawMarkdownContent;

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
            <button class="ql-clean"></button>
        </span>
    `;
    editorContainer.insertBefore(toolbarContainer, editorContainer.firstChild);

    // Convert Markdown to HTML for Quill
    const htmlContent = marked.parse(md);

    // Initialize Quill
    quillEditor = new Quill('#quill-editor', {
        modules: { toolbar: '#quill-toolbar' },
        theme: 'snow',
        placeholder: 'Start writing Markdown...',
    });

    quillEditor.clipboard.dangerouslyPasteHTML(htmlContent);

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
        rawMarkdownContent = turndown.turndown(quillEditor.root.innerHTML);
    });
}

async function enterEditMode() {
    const file = currentFiles[currentFileIndex];
    try {
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
                <button class="ql-clean"></button>
            </span>
        `;
        editorContainer.insertBefore(toolbarContainer, editorContainer.firstChild);

        // Convert Markdown to HTML for Quill display
        const htmlContent = marked.parse(markdownContent);

        // Initialize Quill editor
        quillEditor = new Quill('#quill-editor', {
            modules: {
                toolbar: '#quill-toolbar',
            },
            theme: 'snow',
            placeholder: 'Start writing Markdown...',
        });

        // Set content
        quillEditor.clipboard.dangerouslyPasteHTML(htmlContent);

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

        // Track changes — keep rawMarkdownContent in sync so source mode shows current content
        quillEditor.on('text-change', () => {
            hasUnsavedChanges = true;
            rawMarkdownContent = turndown.turndown(quillEditor.root.innerHTML);
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
        // WYSIWYG mode: get HTML from Quill, convert to Markdown using turndown
        const htmlContent = quillEditor.root.innerHTML;
        markdownContent = turndown.turndown(htmlContent);
    }

    try {
        await invoke("write_file", { filePath: file.path, content: markdownContent });
        hasUnsavedChanges = false;

        // Update file path if it was new
        if (file.path.endsWith('.tmp') || !file.path.endsWith('.md')) {
            file.path = file.path; // Keep the same path
        }
        currentFiles[currentFileIndex] = file;

        // Re-render markdown
        renderMarkdown(markdownContent);

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
        const htmlContent = quillEditor.root.innerHTML;
        markdownContent = turndown.turndown(htmlContent);
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

            // Re-render markdown
            renderMarkdown(markdownContent);

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
