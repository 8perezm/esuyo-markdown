# Plan: Git Sync for Esuyo Markdown

## TL;DR

Add Git repository support to Esuyo Markdown so it can clone repos, show sync status, and manually push/pull changes across devices. Uses the system `git` CLI (piggybacks on Git Credential Manager for auth). Background `git fetch` every 5 minutes to detect remote changes.

---

## Architecture Decision

**Use system `git` CLI** (not `git2` crate). Rationale:
- Auth handled transparently by Git Credential Manager for Windows — no token storage or SSH key management needed in the app
- Zero new Rust dependencies
- Simpler to implement for a "minimal viable" feature set
- `std::process::Command` is already available in the Rust backend
- Can migrate to `git2` later if richer Git operations (diff viewer, branch graph, etc.) are needed

**Drawback**: Requires `git` to be installed on the user's machine. We check availability on startup.

---

## Steps

### Phase 1: Rust Backend — Git Commands

**Step 1** — Add `check_git_available` command to `src-tauri/src/lib.rs`
- Run `git --version`, return `bool`
- Called on app startup to determine if Git features should be shown

**Step 2** — Add `git_clone` command
- Params: `url: String`, `dest_path: String`
- Runs `git clone <url> <dest_path>` in background
- Returns the cloned directory path (or error)

**Step 3** — Add `git_status` command
- Params: `repo_path: String`
- Runs `git status --porcelain` → returns list of changed files
- Runs `git rev-list --count HEAD..origin/main` and `git rev-list --count origin/main..HEAD` for ahead/behind counts
- Returns structured `GitStatus { branch, changes: Vec<GitChange>, ahead: i32, behind: i32 }`

**Step 4** — Add `git_commit` command
- Params: `repo_path: String`, `message: String`
- Runs `git add -A` → `git commit -m "<message>"`
- Returns success/failure

**Step 5** — Add `git_push` command
- Params: `repo_path: String`
- Runs `git push`
- Streams output (for progress / auth prompts — GCM handles interactively)
- Returns success/failure

**Step 6** — Add `git_pull` command
- Params: `repo_path: String`
- Runs `git pull --ff-only` (safe: only fast-forward, errors if diverged)
- Returns success/failure + merge conflict info if any

**Step 7** — Add `git_fetch` command
- Params: `repo_path: String`
- Runs `git fetch` silently in background
- No UI impact, just updates remote refs for `git_status`

**Step 8** — Add `clone_url_from_repo` helper (optional)
- `git remote get-url origin` — for displaying the remote URL in UI

### Phase 2: Frontend — UI for Git Operations

**Step 9** — Add "Clone Repository" button/option (*parallel with Phase 1 after Step 2*)
- In the menu dropdown, add a "Clone Repository..." menu item
- When no folder is open, show it as a primary action alongside "Open Folder"
- UI: `index.html` — add clone button and clone modal

**Step 10** — Add Clone Repository modal to `index.html`
- Dialog with: Git URL input field, destination folder picker (reuse `pick_save_file`/`pick_folder` pattern), and "Clone" button
- After clone succeeds, auto-open the cloned folder

**Step 11** — Add Git status bar to sidebar (`index.html` + `src/style.css`)
- Below `#current-folder-bar`, add a `#git-status-bar` section
- Shows: current branch name, ahead/behind indicators, modified file count
- Git status bar shows only when the current folder is a Git repo (has `.git` subdirectory)

**Step 12** — Add "Pull" and "Push" buttons to `index.html`
- Small icon buttons in the git status bar area
- Disabled when no remote, or when no changes to push/pull

**Step 13** — Add Commit dialog modal to `index.html`
- Textarea for commit message + "Commit" button
- Shows list of staged/changed files (from `git_status`)

**Step 14** — Wire Git actions in `src/main.js`
- `openCloneDialog()`, `executeClone(url, destPath)`
- `refreshGitStatus()` — periodically called + after saves
- `executeCommit(message)`, `executePush()`, `executePull()`
- `startBackgroundFetch()` — `setInterval` every 5 minutes, calls `git_fetch` then `refreshGitStatus`

**Step 15** — Add Git status indicator icons/colors to file list (*depends on Step 3*)
- After each `git_status`, mark files in the sidebar with visual indicators:
  - Modified (M) — yellow/orange dot
  - Added (A) — green dot
  - Deleted (D) — red dot
- Maps `git status --porcelain` output to file paths, cross-references with sidebar file list

**Step 16** — Integrate "Clone" into the initial onboarding flow
- On welcome screen, add "Clone a Repository" as a secondary action below "Open Folder"
- Make `welcome.md`-style first-run feel consistent

### Phase 3: Settings & Persistence

**Step 17** — Extend `AppSettings` in Rust backend
- Add `recent_git_repos: Vec<GitRepoInfo>` to settings (analogous to `recent_folders`)
- `GitRepoInfo { local_path, remote_url, last_branch }`
- Persist with `save_settings`, load with `get_settings`

**Step 18** — Add Git section to Settings panel in `index.html`
- One toggle: "Auto-fetch every 5 minutes" (default: on)
- List of managed Git repos

**Step 19** — Detect `.git` folder on folder open
- After `openFolderByPath()`, check if `{path}/.git` exists
- If yes, run `git_status` to initialize the Git UI
- Store `isGitRepo` flag in app state

### Phase 4: Polish & Error Handling

**Step 20** — Handle edge cases and errors
- Git not installed → hide all Git UI, show tooltip "Install Git to use sync features"
- Not a Git repo → hide Git status bar, show "Init Repository?" option
- No remote configured → disable Push/Pull, show "No remote" indicator
- Merge conflicts on pull → surface error message with conflicting files
- Push rejected (non-fast-forward) → tell user to pull first
- Clone URL invalid or unreachable → show error in clone dialog
- Authentication failure → direct user to configure Git Credential Manager

**Step 21** — Loading/disabled states for async operations
- Show spinner on clone, push, pull
- Disable buttons during operations to prevent double-clicks
- Show success/error toasts (brief non-blocking messages)

---

## Relevant Files

| File | Role |
|------|------|
| `src-tauri/src/lib.rs` | Add 8 new Tauri commands (`check_git`, `clone`, `status`, `commit`, `push`, `pull`, `fetch`, `remote_url`) |
| `src-tauri/Cargo.toml` | No new deps needed |
| `src-tauri/capabilities/default.json` | May need `shell:allow-execute` or similar (Tauri v2 process permissions) |
| `index.html` | Clone modal, commit modal, git status bar HTML, settings Git section |
| `src/style.css` | Git bar styling, status indicators, modal styling |
| `src/main.js` | Git UI logic: dialog handlers, status refresh, background fetch timer, file status indicators |
| `src/markdown-theme.css` | No changes expected |

---

## Verification

1. **Git detection**: Open a non-Git folder → no Git UI shown. Open a git repo folder → branch name appears in status bar.
2. **Status display**: Modify a file in a Git repo → orange dot appears next to file in sidebar. `git status --porcelain` matches.
3. **Commit flow**: Click Commit → dialog opens with modified files listed → type message → click Commit → success toast → status resets.
4. **Push/Pull flow**: Click Push → git pushes via GCM (works if GCM has valid credentials) → success toast. Click Pull → ff-pull succeeds.
5. **Clone flow**: Click "Clone Repository" → enter URL → pick destination → clone runs → folder auto-opens.
6. **Background fetch**: Wait 5 minutes (or set shorter interval for testing) → `git fetch` runs → status bar updates ahead/behind counts.
7. **Error states**: Git not installed → all Git UI hidden. Invalid clone URL → error in dialog. Merge conflict on pull → error message with file list.
8. **Settings persistence**: Close app with a Git repo open → reopen → repo shows in recent list with correct remote info.

---

## Decisions

| Decision | Choice |
|----------|--------|
| Git library | System `git` CLI via `std::process::Command` (not `git2` crate) |
| Authentication | Git Credential Manager for Windows (transparent, no app-level auth code) |
| Sync model | Manual Push/Pull buttons + background `git fetch` every 5 min (fetch-only, no auto-merge) |
| Clone workflow | URL input dialog + also allow opening existing local repos |
| Commit UX | Explicit commit dialog with message textarea |
| File status | Color-coded dots in sidebar (M=orange, A=green, D=red) |

---

## What's Excluded (Future Possibilities)

- Branch switching UI (use `git checkout`/`git switch` via CLI or sidebar)
- Commit history viewer / diff view
- Automatic detection of new repos via file watcher on `.git` folder
- GitHub OAuth / fine-grained token management
- SSH key management
- Stash management
- `git2` crate migration for richer programmatic control
