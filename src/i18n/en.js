// English (source) dictionary. Flat dotted keys; `{name}` marks are
// interpolated by t() / tp() in index.js. Keep this file as the reference
// when adding a new locale: every key here should exist in every dictionary.

export const messages = {
    "app.title": "Esuyo Markdown",

    // Top bar / menu
    "menu.tooltip": "Menu",
    "theme.toggle": "Toggle theme",
    "theme.switchToDark": "Switch to dark theme",
    "theme.switchToLight": "Switch to light theme",
    "file.new": "New File",
    "file.newTooltip": "New file",
    "folder.reload": "Reload folder",
    "folder.open": "Open Folder",
    "action.save": "Save",
    "action.saveAs": "Save As",
    "settings.title": "Settings",
    "menu.recentFolders": "Recent Folders",
    "menu.noRecentFolders": "No recent folders",
    "about.title": "About",
    "context.newFileHere": "New markdown file here",

    // File view / sidebar
    "view.group": "File navigation view",
    "view.flatList": "Flat list",
    "view.treeView": "Tree view",
    "view.allDirs": "All folders",
    "view.allDirsTooltip": "Show folders without markdown files",
    "sidebar.toggle": "Toggle sidebar",
    "sidebar.show": "Show sidebar",
    "sidebar.hide": "Hide sidebar",
    "tabs.ariaLabel": "Open files",
    "tabs.close": "Close tab",

    // Empty / welcome / loading states
    "empty.noFolderSelected": "No folder selected",
    "empty.noFolderHint": 'Click "Open Folder" to browse for a directory containing markdown files.',
    "empty.noFilesFound": "No markdown files found",
    "empty.noFilesHint": "This folder doesn't contain any .md or .markdown files.",
    "welcome.title": "Welcome to Esuyo Markdown",
    "welcome.hint": "Open a folder to browse and read markdown files.",
    "loading.scanning": "Scanning folder...",

    // Reader / editor
    "editor.source": "Source",
    "editor.edit": "Edit",
    "editor.placeholder": "Start writing Markdown...",
    "editor.sourcePlaceholder": "Edit raw Markdown source...",
    "viewer.fileMissing": "File no longer exists: {file}",
    "viewer.missingSuffix": " (missing)",
    "zoom.tooltip": "Zoom: Ctrl + mouse wheel, Ctrl + / Ctrl -, Ctrl 0. Click to reset to 100%.",
    "zoom.resetAria": "Reset zoom to 100%",
    "zoom.normal": "Zoom: 100% (normal). Ctrl + mouse wheel or Ctrl + / Ctrl - to change.",
    "zoom.changed": "Zoom: {zoom}%. Click or press Ctrl+0 to reset to 100%.",

    // Common actions
    "action.cancel": "Cancel",
    "action.delete": "Delete",
    "file.delete": "Delete file",

    // Dialogs
    "dialog.delete.title": "Delete File",
    "dialog.delete.message": "Are you sure you want to delete this file?",
    "dialog.delete.hint": "The file will be moved to the Recycle Bin.",
    "dialog.dirty.title": "Unsaved changes",
    "dialog.dirty.message_one": "“{file}” has unsaved changes. What would you like to do?",
    "dialog.dirty.message_other": "{count} files have unsaved changes. Choose which ones to save.",
    "dialog.dirty.saveSelected": "Save selected",
    "dialog.dirty.saveSelectedClose": "Save selected & close",
    "dialog.dirty.saveSelectedSwitch": "Save selected & switch",
    "dialog.dirty.saveSelectedQuit": "Save selected & quit",
    "dialog.dirty.discard": "Discard",
    "dialog.dirty.discardClose": "Discard & close",
    "dialog.dirty.discardSwitch": "Discard & switch",
    "dialog.dirty.discardQuit": "Discard & quit",
    "dialog.openFolder": "Select a folder with markdown files",

    // Errors surfaced in alerts
    "error.saveCancelled": "Failed to save {file}. The operation was cancelled.",
    "error.openFolder": "Error opening folder: {error}",
    "error.createFile": "Error creating file: {error}",
    "error.deleteFile": "Error deleting file: {error}",
    "error.saveFile": "Failed to save {file}: {error}",
    "error.saveFileAs": "Failed to save file: {error}",

    // Settings
    "settings.close": "Close settings",
    "settings.fileDiscovery": "File Discovery",
    "settings.useGitignore": "Use .gitignore",
    "settings.useGitignoreHint": "Skip files and folders matched by .gitignore. Uncheck to include ignored files in the list.",
    "settings.fonts": "Fonts",
    "settings.bodyFont": "Body Font",
    "settings.headingFont": "Heading Font",
    "settings.codeFont": "Code Font",
    "settings.size": "Size",
    "settings.language": "Language",
    "settings.displayLanguage": "Display language",
    "settings.languageHint": "Changes take effect after the app reloads.",
    "settings.systemDefault": "System default",
    "fonts.sansSerif": "Sans-serif",
    "fonts.serif": "Serif",
    "fonts.monospace": "Monospace",

    // About (the license name itself stays untranslated)
    "about.titleFull": "About Esuyo Markdown",
    "about.close": "Close",
    "about.version": "Version",
    "about.unknownVersion": "Unknown",
    "about.license": "License",
    "about.github": "GitHub repository",
    "about.store": "Microsoft Store",
};
