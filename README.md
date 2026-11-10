# Digital Notepad

A minimal always-on-top Windows notepad built with Electron, React, Tailwind, shadcn/ui, Remix icons, and locally bundled Inter. The app starts at 440 × 620 logical pixels and remembers its window position.

## Workspace

This repository uses pnpm 11.25.0 and Turborepo. Install Node.js 22.12 or newer and the pinned pnpm version, then run commands from the repository root:

```powershell
npm install --global pnpm@11.25.0
pnpm install --frozen-lockfile
pnpm start
```

- `apps/desktop/`: complete Electron application, renderer, assets, configuration, scripts, and tests. The workspace package is named `digital-notepad`.
- `apps/web/`: Next.js App Router landing page and Windows download flow, named `@digital-notepad/web`.
- `package.json`, `pnpm-workspace.yaml`, `pnpm-lock.yaml`, and `turbo.json`: workspace dependencies and task orchestration.
- `release/`: Windows artifacts and generated previews, excluded from Git.

There are no shared packages yet. Application dependencies belong in `apps/desktop/package.json`; workspace tooling belongs in the root package. Use `pnpm --filter digital-notepad add <package>` to add an app dependency. Commit the root pnpm lockfile; do not create npm lockfiles.

pnpm uses hoisted dependencies for Electron packaging. When upgrading Electron, update the explicit electronVersion in apps/desktop/electron-builder.yml to match the lockfile. Dependency install scripts are explicitly allowed in the workspace configuration. Exact version exceptions to pnpm's release-age policy preserve dependencies already present in the former npm lockfile.

## Commands

| Command | Behavior |
| --- | --- |
| `pnpm build` | Build both desktop and website, with Turbo caching |
| `pnpm dev` | Run the desktop renderer watcher and Next.js development server |
| `pnpm dev:desktop` | Run only the desktop renderer watcher |
| `pnpm dev:web` | Run the website at http://127.0.0.1:3000 |
| `pnpm build:web` | Create the website production build |
| `pnpm start:web` | Build and serve the production website |
| `pnpm start` | Build and launch Electron |
| `pnpm test` | Build, run reliability tests, and run real Electron regressions |
| `pnpm package:win` | Build unsigned Windows x64 installer and portable executable |
| `pnpm package:dir` | Build the unpacked Windows app |
| `pnpm test:packaged` | Build the unpacked app and verify it across process restarts |
| `pnpm preview` | Build and generate isolated editor/menu screenshots |

Turbo supplies prerequisite builds once. Renderer and Next.js production build outputs are cached; Electron tests, packaging, previews, and app launches always execute. Remote caching is not configured.

For desktop development, run `pnpm dev:desktop` in one terminal and `pnpm --filter digital-notepad exec electron .` in another. Reload Electron after renderer changes; restart it after main-process changes. The watcher does not provide live reload. Direct workspace commands bypass Turbo prerequisites, so use root commands for tests and packaging.

## Website

The landing page lives in `apps/web/app/page.jsx`. It includes a responsive layout, locally bundled Inter, an interactive note preview, and a light/dark preview toggle. The preview is illustrative: typed text is not saved.

The Download button opens `/download`, which checks the latest stable public GitHub release for a Windows installer. It supports both Digital Notepad and older Notepad installer filenames. A valid installer triggers a redirect to its GitHub asset; missing releases, API errors, and timeouts show a download availability page with a releases link. Local executables in `release/` are not published or copied into the website. Publish an installer through GitHub Releases to enable the direct download.

The repository URL is configured in `apps/web/lib/downloads.mjs`. Deploy `apps/web` as a Next.js server application (the download route runs on the server). This change does not deploy the website or publish desktop releases. Run `pnpm --filter @digital-notepad/web test` for download-selection checks.

## Using the app

Use **Pages** to create or switch pages. **File** contains import, export, backup restoration, and deletion. **Settings** switches between light and dark modes. **Help → Keyboard shortcuts** opens a searchable shortcut reference. **Edit → Find** searches the current page. Native undo, selection, and scrolling are preserved while navigating.

Notes save locally with a previous-save backup. Import adds live pages without replacing existing notes. Restore backup replaces the notebook after confirmation; export first to keep a copy. Deleting a page asks for confirmation, and up to 20 deleted pages can be restored across restarts. Deleting the last page leaves a blank note.

Unreadable storage is preserved for recovery and export. A failed save keeps the draft in memory and prompts before closing. Existing single-note and multi-page data remain readable.

Local notes use Electron's `userData` directory, normally `%APPDATA%/notepad` on Windows; window bounds live there in `window-state.json`. The rename preserves the legacy profile location, application ID, and storage keys so existing notes remain available. An explicit `--user-data-dir=<directory>` selects an isolated testing profile. Notes do not sync between computers.

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

- `Digital Notepad-Setup-1.0.0.exe`: per-user installer with an optional desktop shortcut.
- `Digital Notepad-Portable-1.0.0.exe`: runs without installation; notes still live in the Windows user profile.
- `win-unpacked/Digital Notepad.exe`: unpacked app used by packaged smoke tests.

Builds are unsigned. Automated checks cover unpacked and portable execution; installer execution, shortcut creation, and uninstall behavior are not automatically verified. Packaging does not publish releases.

The app remains above ordinary windows; Windows security prompts and exclusive fullscreen apps can appear above it. Renderer startup failures show a retry screen without changing saved notes.
