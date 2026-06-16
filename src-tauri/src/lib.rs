use serde::{Deserialize, Serialize};
use std::collections::HashSet;
use std::fs;
use std::path::{Path, PathBuf};
use tauri::Manager;
use walkdir::WalkDir;

#[derive(Debug, Serialize, Deserialize)]
pub struct MarkdownFile {
    pub name: String,
    pub path: String,
    pub relative_path: String,
}

#[derive(Debug, Serialize, Deserialize, Default)]
pub struct AppSettings {
    /// Last opened folders, newest first. Capped to 10.
    pub recent_folders: Vec<String>,
    /// "light" | "dark"
    pub theme: String,
    /// Google Font name for body text
    pub default_font: Option<String>,
    /// Google Font name for headings
    pub header_font: Option<String>,
}

// ── Built-in ignore list ────────────────────────────────────────────────────

const BUILTIN_IGNORE_DIRS: &[&str] = &[
    "node_modules", ".git", ".svn", ".hg", "dist", "build", "out", "target",
    ".next", ".nuxt", ".svelte-kit", ".cache", ".parcel-cache", ".turbo",
    ".vercel", ".netlify", "coverage", ".vscode", ".idea", "__pycache__",
    ".pytest_cache", ".mypy_cache", "venv", ".venv", "env", "vendor",
    "Pods", ".gradle", ".terraform", ".expo",
];

fn settings_path(app: &tauri::AppHandle) -> Result<PathBuf, String> {
    let dir = app
        .path()
        .app_data_dir()
        .map_err(|e| format!("Failed to resolve app data dir: {}", e))?;
    fs::create_dir_all(&dir).map_err(|e| format!("Failed to create app data dir: {}", e))?;
    Ok(dir.join("settings.json"))
}

/// Opens a native folder dialog and returns the selected folder path.
#[tauri::command]
async fn pick_folder(app: tauri::AppHandle) -> Result<Option<String>, String> {
    use tauri_plugin_dialog::{DialogExt, FilePath};

    let (tx, rx) = std::sync::mpsc::channel();

    app.dialog()
        .file()
        .pick_folder(move |path| {
            let _ = tx.send(path);
        });

    match rx.recv().map_err(|e| format!("Dialog error: {}", e))? {
        Some(FilePath::Path(path)) => Ok(Some(path.to_string_lossy().to_string())),
        Some(_) => Ok(None),
        None => Ok(None),
    }
}

/// Returns the app's settings (creates defaults if missing).
#[tauri::command]
fn get_settings(app: tauri::AppHandle) -> Result<AppSettings, String> {
    let path = settings_path(&app)?;
    if !path.exists() {
        return Ok(AppSettings {
            theme: "dark".to_string(),
            ..Default::default()
        });
    }
    let raw = fs::read_to_string(&path).map_err(|e| format!("Read settings: {}", e))?;
    serde_json::from_str(&raw).map_err(|e| format!("Parse settings: {}", e))
}

/// Persists the app's settings to disk.
#[tauri::command]
fn save_settings(app: tauri::AppHandle, settings: AppSettings) -> Result<(), String> {
    let path = settings_path(&app)?;
    let mut settings = settings;
    // Dedupe and cap recent folders to 10
    let mut seen = HashSet::new();
    settings.recent_folders.retain(|p| seen.insert(p.clone()));
    settings.recent_folders.truncate(10);
    let json =
        serde_json::to_string_pretty(&settings).map_err(|e| format!("Serialize: {}", e))?;
    fs::write(&path, json).map_err(|e| format!("Write settings: {}", e))?;
    Ok(())
}

/// Loads .gitignore patterns from the folder root, if present.
fn load_gitignore(root: &Path) -> Vec<String> {
    let gi = root.join(".gitignore");
    if !gi.exists() {
        return Vec::new();
    }
    fs::read_to_string(&gi)
        .map(|s| {
            s.lines()
                .map(|l| l.trim())
                .filter(|l| !l.is_empty() && !l.starts_with('#'))
                .map(String::from)
                .collect()
        })
        .unwrap_or_default()
}

/// Naïve .gitignore-style matcher (supports `name`, `name/`, `**/name`, leading `/`).
fn is_ignored(rel: &str, name: &str, patterns: &[String]) -> bool {
    if BUILTIN_IGNORE_DIRS
        .iter()
        .any(|d| d.eq_ignore_ascii_case(name))
    {
        return true;
    }
    let rel_posix = rel.replace('\\', "/");
    for raw in patterns {
        let pat = raw.trim_end_matches('/');
        if pat.is_empty() {
            continue;
        }
        let mut p = pat;
        let anchored = p.starts_with('/');
        if anchored {
            p = &p[1..];
        }
        let p = p.trim_end_matches('/');
        if p == name {
            return true;
        }
        if let Some(rest) = p.strip_prefix("**/") {
            if rest == name || p == rest {
                return true;
            }
        }
        if !anchored && rel_posix.split('/').any(|seg| seg == p) {
            return true;
        }
        if !p.contains('/') && p == name {
            return true;
        }
    }
    false
}

/// Recursively scans a directory for markdown (.md) files.
/// Honors .gitignore patterns and a built-in ignore list.
#[tauri::command]
fn scan_md_files(folder_path: &str) -> Result<Vec<MarkdownFile>, String> {
    let root = Path::new(folder_path);
    if !root.exists() || !root.is_dir() {
        return Err(format!("Directory not found: {}", folder_path));
    }

    let ignore_patterns = load_gitignore(root);
    let mut files: Vec<MarkdownFile> = Vec::new();

    for entry in WalkDir::new(folder_path)
        .follow_links(true)
        .into_iter()
        .filter_entry(|e| {
            if e.depth() == 0 {
                return true;
            }
            let name = e.file_name().to_string_lossy();
            let rel = e
                .path()
                .strip_prefix(folder_path)
                .unwrap_or(e.path())
                .to_string_lossy();
            if e.file_type().is_dir() {
                !is_ignored(&rel, &name, &ignore_patterns)
            } else {
                true
            }
        })
        .filter_map(|e| e.ok())
    {
        let entry_path = entry.path();
        if !entry_path.is_file() {
            continue;
        }
        if let Some(ext) = entry_path.extension() {
            if ext.eq_ignore_ascii_case("md") || ext.eq_ignore_ascii_case("markdown") {
                let abs_path = entry_path.to_string_lossy().to_string();
                let relative = entry_path
                    .strip_prefix(folder_path)
                    .unwrap_or(entry_path)
                    .to_string_lossy()
                    .to_string();
                let name = entry_path
                    .file_stem()
                    .unwrap_or_default()
                    .to_string_lossy()
                    .to_string();

                files.push(MarkdownFile {
                    name,
                    path: abs_path,
                    relative_path: relative,
                });
            }
        }
    }

    files.sort_by(|a, b| a.relative_path.to_lowercase().cmp(&b.relative_path.to_lowercase()));

    Ok(files)
}

/// Reads the content of a file at the given absolute path.
#[tauri::command]
fn read_file(file_path: &str) -> Result<String, String> {
    let path = Path::new(file_path);
    if !path.exists() || !path.is_file() {
        return Err(format!("File not found: {}", file_path));
    }

    fs::read_to_string(path).map_err(|e| format!("Failed to read file: {}", e))
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![
            pick_folder,
            scan_md_files,
            read_file,
            get_settings,
            save_settings
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
