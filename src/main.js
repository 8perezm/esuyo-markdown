import { invoke } from "@tauri-apps/api/core";
import { open } from "@tauri-apps/plugin-dialog";
import { Marked } from "marked";
import { markedHighlight } from "marked-highlight";
import hljs from "highlight.js";

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
const menuBtn = document.getElementById("menu-btn");
const menuDropdown = document.getElementById("menu-dropdown");
const recentFoldersList = document.getElementById("recent-folders-list");
const menuOpenFolderItem = document.getElementById("menu-open-folder-item");
const menuSettingsItem = document.getElementById("menu-settings-item");
const settingsOverlay = document.getElementById("settings-overlay");
const settingsCloseBtn = document.getElementById("settings-close-btn");
const fontDefaultSelect = document.getElementById("font-default-select");
const fontHeaderSelect = document.getElementById("font-header-select");
const useGitignoreCheckbox = document.getElementById("use-gitignore-checkbox");
const currentFolderBar = document.getElementById("current-folder-bar");
const currentFolderName = document.getElementById("current-folder-name");

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
    // Ensure use_gitignore is a boolean (Rust serde default is `true`, but
    // guard against any `undefined` from cached or legacy state).
    settings.use_gitignore = settings.use_gitignore !== false;
    applyTheme(settings.theme);
    applyFonts(settings.default_font, settings.header_font);
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

// ── Fonts ───────────────────────────────────────────────────────────────────

function applyFonts(defaultFont, headerFont) {
    // Load Google Fonts if needed
    loadGoogleFont(defaultFont);
    if (headerFont !== defaultFont) {
        loadGoogleFont(headerFont);
    }

    // Apply body font
    document.documentElement.style.setProperty("--font-sans", `'${defaultFont}', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`);
    document.documentElement.style.setProperty("--user-font-sans", `'${defaultFont}', Georgia, 'Times New Roman', serif`);

    // Apply heading font
    document.documentElement.style.setProperty("--user-font-heading", `'${headerFont}', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`);

    settings.default_font = defaultFont;
    settings.header_font = headerFont;
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

function openSettings() {
    // Pre-load all Google Fonts so dropdown options render in their own typeface
    GOOGLE_FONTS.forEach((f) => loadGoogleFont(f.family));
    buildFontSelect(fontDefaultSelect, settings.default_font);
    buildFontSelect(fontHeaderSelect, settings.header_font);
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
    const val = fontDefaultSelect.value;
    applyFonts(val, settings.header_font);
    persistSettings();
});

fontHeaderSelect.addEventListener("change", () => {
    const val = fontHeaderSelect.value;
    applyFonts(settings.default_font, val);
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
        showLoading(true);
        const files = await invoke("scan_md_files", {
            folderPath: currentFolder,
            useGitignore: settings.use_gitignore,
        });
        currentFiles = files;
        currentFileIndex = -1;
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

    if (e.key === "ArrowDown") {
        e.preventDefault();
        const next = Math.min(currentFileIndex + 1, currentFiles.length - 1);
        selectFile(next);
    } else if (e.key === "ArrowUp") {
        e.preventDefault();
        const prev = Math.max(currentFileIndex - 1, 0);
        selectFile(prev);
    }
});

// ── Highlight.js theme ──────────────────────────────────────────────────────

import "highlight.js/styles/atom-one-dark.css";
