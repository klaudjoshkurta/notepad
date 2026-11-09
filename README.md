# Notepad

A minimal always-on-top Windows notepad built with Electron, React, Tailwind, shadcn/ui, Remix icons, and locally bundled Inter. The window starts at 440 × 620 logical pixels and remembers its size and position. If a monitor is disconnected, the window returns to a visible display.

## Use

Run `npm install` and `npm start`, or use the Windows builds in `release/`:

- `Notepad-Setup-1.0.0.exe`: per-user installer, with an optional desktop shortcut.
- `Notepad-Portable-1.0.0.exe`: runs without installation. Notes still live in the Windows user profile, not beside the executable.

The builds are unsigned. Installer execution, shortcuts, and uninstall behavior have not been exercised automatically.

Open the menu to see the pages list. Select a page or create a new one to open the editor. The back arrow returns to the current note. Labels come from each note's first line. Search matches the entire note, ignoring case. Cursor, scroll position, and native undo history survive page/list navigation during the current session.

Delete selected page asks for confirmation. Restore last deleted page recovers the most recent deletion; up to 20 deletions survive app restarts. Deleting the last live page leaves a blank note.

## Saving and recovery

Notes and deleted pages save locally, with a previous-save backup. Existing single notes and older multi-page storage remain readable. In the pages list, open **Backup and files** to export the notebook as JSON, export the selected note as text, import a JSON backup, or restore the previous saved backup.

Import adds copies of the backup's live pages without replacing current notes. Restore backup replaces the current notebook after confirmation. Export first to retain unsaved changes. If stored data is unreadable, the app preserves it and offers recovery and export; explicitly saving replacement pages archives the unreadable data. A failed save keeps the draft in memory, displays an error, and prompts before closing. Export a copy before quitting.

Local notes use Electron's `userData` directory (normally `%APPDATA%/notepad` on Windows). Window geometry is stored there in `window-state.json`. An explicit `--user-data-dir=<directory>` selects a separate profile for testing. Notes do not sync between computers.

## Shortcuts

| Shortcut | Action |
| --- | --- |
| Ctrl+N | New note |
| Ctrl+Shift+P | Switch between editor and pages list |
| Ctrl+F | Search notes |
| Escape | Return from the pages list |
| Ctrl+E | Export selected note as text |
| Ctrl+Shift+E | Export all notes as JSON |
| Ctrl+Shift+T | Restore last deleted note |
| Ctrl+Z / Ctrl+Y | Native undo / redo |

## Development and verification

- `npm run build`: production React build.
- `npm run dev`: rebuild on changes; run `npx electron .` separately and reload after changes.
- `npm test`: storage and window-bound tests plus real Electron regression checks with an isolated profile and stubbed native file pickers.
- `npm run package:win`: build Windows x64 installer and portable executable without publishing.
- `npm run package:dir`: build the unpacked app only.
- `npm run test:packaged`: launch the unpacked Windows app twice with an isolated profile and verify UI, navigation, persistence, and window-state saving.

The packaging tools currently report six moderate development-only advisories through their minimatch dependency. The suggested automatic fix downgrades electron-builder; it has not been applied. The packaging tool is not included in the shipped app.

The window stays above ordinary apps. Windows security prompts and exclusive fullscreen apps can appear above it. Renderer startup failures show a retry screen; saved notes remain untouched.
