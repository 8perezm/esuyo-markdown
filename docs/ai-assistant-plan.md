# Plan: Add AI Assistant to Esuyo Markdown

## TL;DR

Add an "AI Assistant" feature that lets users invoke an OpenAI-compatible chat
completion model (OpenAI, Ollama, LM Studio, Groq, OpenRouter, Azure OpenAI…)
against selected text or whole-document context. The Tauri HTTP plugin
performs the request from JS, streams results into a side panel that can be
accepted/rejected and applied back to the editor. Configuration lives in
`settings.json` with environment-variable fallback
(`OPENAI_API_KEY` / `OPENAI_BASE_URL` / `OPENAI_MODEL`).

**Six built-in actions**: Improve · Summarize · Translate · Continue writing ·
Ask AI (selection as context + user question) · Custom prompt (free-form
instruction).

---

## Steps

### Phase 1 — Backend wiring (Tauri + plugin)

1. `src-tauri/Cargo.toml` — add `tauri-plugin-http = "2"` (matches existing
   `tauri = "2"`).
2. `src-tauri/src/lib.rs` — register `tauri_plugin_http::init()` in
   `tauri::Builder::default()` next to the existing dialog plugin.
3. `src-tauri/capabilities/default.json` — add `"http:default"` to the
   `permissions` array. The CSP is already `null` in `tauri.conf.json`, so
   no URL allow-list is required.
4. `package.json` — add `"@tauri-apps/plugin-http": "^2.0.0"`.

### Phase 2 — Settings storage (Rust struct + persistence)

5. `src-tauri/src/lib.rs` — extend `AppSettings` with an `AiConfig` struct
   (all fields `Option<…>` + `#[serde(default)]` so old `settings.json`
   files load cleanly):
   - `enabled: bool` (default `false`)
   - `base_url: Option<String>` — e.g. `https://api.openai.com/v1`
   - `api_key: Option<String>` — optional; env-var fallback
   - `model: Option<String>` — e.g. `gpt-4o-mini`, `llama3.1:8b`
   - `system_prompt: Option<String>` — override the default
   - `temperature: Option<f32>` (default `0.7`)
   - `max_tokens: Option<u32>` (default `1024`)
   - `stream: bool` (default `true`)
6. Env-var fallback lives in JS (Phase 4), not Rust — read at request time
   so users can `export OPENAI_API_KEY=…` after the app is already running.

### Phase 3 — Settings UI

7. `index.html` — append a new `<div class="settings-section">` inside
   `#settings-overlay`'s `.settings-body`, with: enable toggle, provider
   preset dropdown (OpenAI / Ollama / LM Studio / Custom), base URL, API
   key (password input with show/hide eye toggle + a hint about env vars),
   model name, system prompt textarea (collapsible), temperature, max
   tokens, stream toggle, and a "Test connection" button.
8. `src/main.js` — extend `loadSettings()` defaults, add a
   `buildAiSettingsUI()` / `persistAiSettings()` pair that mirrors the
   existing font-handler pattern. Provider preset auto-fills `base_url`.
9. `src/style.css` — styles for the AI section, password-show eye, and
   the advanced-section disclosure.

### Phase 4 — Core AI client (new module)

10. **NEW** `src/ai.js` — pure JS module exporting:
    - `resolveConfig(ai)` — merge `settings.ai` with env vars
      (`OPENAI_API_KEY`, `OPENAI_BASE_URL`, `OPENAI_MODEL`); env wins only
      when the setting is `null` / empty.
    - `chatCompletion({ messages, onDelta, signal })` — POSTs to
      `${baseUrl}/chat/completions` via `fetch` from
      `@tauri-apps/plugin-http`. Branches on `stream` for SSE vs JSON.
      - **Non-streaming**: parse `choices[0].message.content`, return once.
      - **Streaming**: iterate `ReadableStream`, parse SSE frames
        (`data: {…}\n\n`), call `onDelta(text)` per delta, resolve on
        `[DONE]`.
      - Throws structured errors: `NetworkError`, `AuthError`,
        `ModelError`, `RateLimitError` for the UI to show useful messages.
    - `ACTION_PRESETS` — built-in system prompts for each action, so the
      UI can pass `messages = [{role:"system", content: preset},
      {role:"user", content: userText}]` without hard-coding in `main.js`.
    - `AbortController` plumbed through `signal` so users can cancel.

### Phase 5 — Action menu + result panel (UI integration)

11. `index.html` — add hidden containers:
    - `#ai-action-menu` (floating popover that follows the selection)
    - `#ai-result-panel` (right-side drawer)
    - `#ai-prompt-modal` (for "Ask AI" and "Custom prompt")
12. `src/ai-ui.js` — **NEW** module exposing:
    - `showActionMenu(selectionRange)` — anchored above current selection
      in read view (`window.getSelection()`), WYSIWYG view
      (`quillEditor.getSelection()`), or source view (textarea coords).
    - `hideActionMenu()`.
    - `openResultPanel({ title, streamingText, onAccept, onReject,
      onCancel })`.
    - `openPromptModal({ title, placeholder, onSubmit })` for Ask / Custom.
13. `src/main.js` — wire selection events:
    - Read view: `mouseup` on `#rendered-content-inner`, debounced 200ms.
    - WYSIWYG: `selection-change` on Quill (only when range non-empty).
    - Source: `select` event on `#source-editor`.
    - Keyboard shortcut: `Ctrl+K` opens AI menu with current selection
      (or last selection if none).
14. `src/main.js` — apply results:
    - Read view: not directly editable, so offer "Copy" + "Open in editor".
    - WYSIWYG: `quillEditor.deleteText(start, len)` +
      `insertText(start, result)`, preserving formatting where possible.
    - Source: `textarea.setRangeText(result, start, end, 'select')`.
    - For full-doc actions, "Open in editor" jumps to edit mode and
      inserts at cursor.

### Phase 6 — Actions implementation

15. Wire each of the six built-in actions to `ai.chatCompletion`:
    - **Improve** — system: "Rewrite for clarity, concision, and
      grammar; preserve meaning and Markdown formatting." → user:
      selection.
    - **Summarize** — system: "Summarize the following Markdown in 2–4
      bullets." → user: selection.
    - **Translate** — submenu picks language (top 12 common ones +
      "Other" → prompt for ISO code) → system: "Translate the following
      Markdown to <lang>; preserve Markdown formatting." → user:
      selection.
    - **Continue writing** — system: "Continue the following Markdown in
      the same style, voice, and formatting. Produce only the new
      content, no preamble." → user: up to 1,500 chars of preceding
      context.
    - **Ask AI** — system: "You are a helpful writing assistant. Answer
      the user's question about the following selection." → user:
      `<selection>\n\n${question}`.
    - **Custom prompt** — system: default writing-assistant prompt → user:
      `{ context: selection, instruction: userInput }`.

### Phase 7 — Polish

16. "Test connection" button in settings: posts a 1-token
    `chat/completions` with `max_tokens: 1` and reports success/failure
    inline.
17. Cancel button on result panel — calls `signal.abort()` and closes
    panel.
18. Error toasts / inline messages — map `ai.js` error types to friendly
    copy ("Check your API key", "Model not found — check the model name",
    "Provider unreachable — is Ollama running?").
19. `README.md` — short "AI Assistant" section: supported providers,
    env-var names, security note about keys.

---

## Relevant files

- `src-tauri/Cargo.toml` — add `tauri-plugin-http = "2"`.
- `src-tauri/src/lib.rs` — register plugin; extend `AppSettings` with
  `AiConfig`.
- `src-tauri/capabilities/default.json` — add `http:default` permission.
- `src-tauri/tauri.conf.json` — already has `csp: null`, no changes
  needed.
- `package.json` — add `@tauri-apps/plugin-http` dep.
- `index.html` — AI settings section, action menu, result panel, prompt
  modal containers.
- `src/main.js` — settings UI wiring (mirrors font handlers); selection
  event handlers; result-apply logic for each editor mode; `Ctrl+K`
  shortcut.
- `src/ai.js` — **NEW** — config resolution, `chatCompletion`, action
  presets, error types.
- `src/ai-ui.js` — **NEW** — action menu, result panel, prompt modal
  controllers.
- `src/style.css` — AI section + floating menu + result panel styles.
- `README.md` — AI Assistant docs.

---

## Verification

1. `cd src-tauri; cargo check` — Rust compiles, `AppSettings` backward
   compat preserved (old `settings.json` files load without errors).
2. `npm run build` — frontend builds, new module imports resolve.
3. `npx tauri dev` — app launches, settings overlay shows new AI
   section.
4. **Ollama (no key)**: enable AI → base URL
   `http://localhost:11434/v1` → model `llama3.1:8b` → leave API key
   empty. Improve a sentence → streaming text appears. Cancel mid-stream
   works.
5. **OpenAI**: set base URL `https://api.openai.com/v1`, paste key,
   model `gpt-4o-mini` → Test connection succeeds → Improve /
   Summarize / Translate all work.
6. **Env-var fallback**: clear API key in settings, set
   `OPENAI_API_KEY=sk-…` in shell, restart app → request still succeeds.
7. **Selection sources**: pick text in read view, WYSIWYG view, source
   view → action menu appears anchored to selection in all three.
8. **Result application**: Improve a sentence in WYSIWYG → result
   replaces selection; same in source view; in read view, copy-to-
   clipboard is offered.
9. **Backward compat**: rename `settings.json` to a backup, launch app
   → new `settings.json` is created with `ai` defaults; restore the
   backup → no error in console.
10. **Errors**: bogus API key → "AuthError" toast; unreachable URL →
    "Provider unreachable"; invalid model → "ModelError".

---

## Decisions

- **HTTP layer**: Tauri HTTP plugin from JS. Simpler than `reqwest` in
  Rust, CSP is already `null` so cross-origin to `api.openai.com` and
  `localhost:11434` works out of the box. User-supplied keys (the
  stated requirement) make the "key in bundle" concern moot.
- **Key storage**: `settings.json` + env-var fallback. Env wins when
  the setting is empty. No OS keyring for v1 — adds the `keyring` crate
  and platform-specific bugs without a clear win for a developer-
  focused tool.
- **Streaming default ON**, non-streaming as a settings toggle. Matches
  the modern expectation for chat UIs; non-streaming remains available
  for low-end local models.
- **All six actions ship in v1**.
- **Apply results in-place for WYSIWYG / source; copy-only in read
  view** (read view isn't editable, so we offer "Copy" + "Open in
  editor").
- **Backward-compatible settings**: every new `AiConfig` field uses
  `Option<…>` + `#[serde(default)]` so old `settings.json` files keep
  loading.

---

## Further considerations

1. **Result panel placement** — side-drawer (right) vs bottom-drawer
   vs modal. **Recommendation**: side-drawer — keeps the markdown
   visible while the result streams, which is the natural fit for a
   read-heavy app. Confirm during implementation.
2. **Surrounding context for Improve / Continue** — the model benefits
   from ~500–1,500 chars of context. Decide whether to send a sliding
   window automatically (good UX) or expose a "Include surrounding
   context" checkbox (more transparent). **Recommendation**: automatic
   window, documented in README.
3. **Multiple model presets** — instead of one model, store a small
   list (e.g. "fast: gpt-4o-mini", "smart: gpt-4o") and let the user
   pick at action time. Adds a "Model preset" dropdown next to the
   action menu. Not in v1 scope but a trivial follow-up.
