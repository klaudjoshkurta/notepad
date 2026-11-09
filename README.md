# Notepad

A small always-on-top notepad for quick thoughts. Starts at 440 × 620 logical pixels. Drag the title bar to move it, or drag an edge to resize it.

Built with Electron, React, Vite, Tailwind CSS, shadcn/ui components (Radix variant), and Remix icons. UI components live in `src/components/ui`; `components.json` configures the shadcn CLI for adding more components.

## Run

```sh
npm install
npm start
```

`npm start` builds the React interface and launches Electron. `npm run build` builds only the interface. For development, run `npm run dev` in one terminal and `npx electron .` in another after the first build; reload the Electron window after changes. `npm test` builds and runs an Electron smoke test using separate note storage.

Open the menu button to view the full pages list. The menu becomes a back button that returns to the current note. Each page uses the first line of its note as its label; a blank first line shows Empty note. Selecting a page or creating a new one opens the editor. Delete selected page asks for confirmation. Deleting the last page leaves a new blank page. Existing single notes are automatically imported.

Page contents and the selected page save automatically to this app's local storage and return when you reopen it. Standard text editing shortcuts work, including Ctrl+A, Ctrl+C, Ctrl+V and Ctrl+Z. Minimize sends the app to the taskbar; closing exits it.

The window stays above ordinary apps. Windows secure desktop prompts and exclusive fullscreen applications can appear above it.
