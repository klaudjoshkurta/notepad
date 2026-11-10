# Notepad

A minimal always-on-top Windows notepad built with Electron, React, Tailwind, shadcn/ui, Remix icons, and locally bundled Inter. The app starts at 440 × 620 logical pixels and remembers its window position.

## Workspace

This repository uses pnpm 11.25.0 and Turborepo. Install Node.js 22.12 or newer and the pinned pnpm version, then run commands from the repository root:

```powershell
npm install --global pnpm@11.25.0
pnpm install --frozen-lockfile
pnpm start
```

- `apps/desktop/`: complete Electron application, renderer, assets, configuration, scripts, and tests. The workspace package remains named `notepad`.
- `package.json`, `pnpm-workspace.yaml`, `pnpm-lock.yaml`, and `turbo.json`: workspace dependencies and task orchestration.
- `release/`: Windows artifacts and generated previews, excluded from Git.

There are no shared packages yet. Application dependencies belong in `apps/desktop/package.json`; workspace tooling belongs in the root package. Use `pnpm --filter notepad add <package>` to add an app dependency. Commit the root pnpm lockfile; do not create npm lockfiles.

pnpm uses hoisted dependencies for Electron packaging. When upgrading Electron, update the explicit electronVersion in apps/desktop/electron-builder.yml to match the lockfile. Dependency install scripts are explicitly allowed in the workspace configuration. Exact version exceptions to pnpm's release-age policy preserve dependencies already present in the former npm lockfile.

## Commands

| Command | Behavior |
| --- | --- |
| `pnpm build` | Build the renderer into `apps/desktop/dist/`, with Turbo caching |
| `pnpm dev` | Watch and rebuild the renderer |
| `pnpm start` | Build and launch Electron |
| `pnpm test` | Build, run reliability tests, and run real Electron regressions |
| `pnpm package:win` | Build unsigned Windows x64 installer and portable executable |
| `pnpm package:dir` | Build the unpacked Windows app |
| `pnpm test:packaged` | Build the unpacked app and verify it across process restarts |
| `pnpm preview` | Build and generate isolated editor/menu screenshots |

Turbo supplies prerequisite builds once. Only renderer build outputs are cached; Electron tests, packaging, previews, and app launches always execute. Remote caching is not configured.

For development, run `pnpm dev` in one terminal and `pnpm --filter notepad exec electron .` in another. Reload Electron after renderer changes; restart it after main-process changes. The watcher does not provide live reload. Direct workspace commands bypass Turbo prerequisites, so use root commands for tests and packaging.

## Using the app

Use **Pages** to create or switch pages. **File** contains import, export, backup restoration, and deletion. **Settings** switches between light and dark modes. **Help → Keyboard shortcuts** opens a searchable shortcut reference. **Edit → Find** searches the current page. Native undo, selection, and scrolling are preserved while navigating.

Notes save locally with a previous-save backup. Import adds live pages without replacing existing notes. Restore backup replaces the notebook after confirmation; export first to keep a copy. Deleting a page asks for confirmation, and up to 20 deleted pages can be restored across restarts. Deleting the last page leaves a blank note.

Unreadable storage is preserved for recovery and export. A failed save keeps the draft in memory and prompts before closing. Existing single-note and multi-page data remain readable.

Local notes use Electron's `userData` directory, normally `%APPDATA%/notepad` on Windows; window bounds live there in `window-state.json`. The workspace migration preserves the app name, application ID, and storage keys. An explicit `--user-data-dir=<directory>` selects an isolated testing profile. Notes do not sync between computers.

## Shortcuts

| Shortcut | Action |
| --- | --- |
| Ctrl+N | New page |
| Ctrl+Shift+P | Open the Pages menu |
| Ctrl+F | Find in the current page |
| Ctrl+E | Export the current page as text |
| Ctrl+Shift+E | Export all pages as JSON |
| Ctrl+Shift+T | Restore the last deleted page |
| Ctrl+Z / Ctrl+Y | Native undo / redo |
| Escape | Close a menu, Find, or the shortcuts view |

## Windows distribution

Artifacts stay in the root `release/` directory:

- `Notepad-Setup-1.0.0.exe`: per-user installer with an optional desktop shortcut.
- `Notepad-Portable-1.0.0.exe`: runs without installation; notes still live in the Windows user profile.
- `win-unpacked/Notepad.exe`: unpacked app used by packaged smoke tests.

Builds are unsigned. Automated checks cover unpacked and portable execution; installer execution, shortcut creation, and uninstall behavior are not automatically verified. Packaging does not publish releases.

The app remains above ordinary windows; Windows security prompts and exclusive fullscreen apps can appear above it. Renderer startup failures show a retry screen without changing saved notes.
