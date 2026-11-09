# Completion phases

1. Reliability — complete: backup/recovery and import/export, visible startup failures, remembered window bounds. Verified unreadable data, failed writes, actual renderer crash/retry, and offscreen geometry.
2. Everyday use — complete: preserve per-note editing state and undo, recover deleted notes, search, keyboard shortcuts, Escape navigation. Verified native undo, selection/scroll, search, deletion across reload, and native file I/O with stubbed pickers.
3. Distribution — complete: Windows icon, installer and portable executable built. Both unpacked and portable apps passed UI, navigation, persistence across process restarts, and geometry-saving checks. Installer execution is not tested; builds are unsigned. See README for scripts and release limitations.

Each phase includes targeted checks. Existing local notes must remain readable.
