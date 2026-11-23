// German dictionary. Keys mirror en.js exactly. German is the longest
// "stress" locale used to check layout overflow (see style.css hardening).

export const messages = {
    "app.title": "Esuyo Markdown",

    // Obere Leiste / Menü
    "menu.tooltip": "Menü",
    "theme.toggle": "Thema wechseln",
    "theme.switchToDark": "Zum dunklen Design wechseln",
    "theme.switchToLight": "Zum hellen Design wechseln",
    "file.new": "Neue Datei",
    "file.newTooltip": "Neue Datei",
    "folder.reload": "Ordner neu laden",
    "folder.open": "Ordner öffnen",
    "action.save": "Speichern",
    "action.saveAs": "Speichern unter",
    "settings.title": "Einstellungen",
    "menu.recentFolders": "Zuletzt geöffnete Ordner",
    "menu.noRecentFolders": "Keine zuletzt geöffneten Ordner",
    "about.title": "Über",
    "context.newFileHere": "Neue Markdown-Datei hier erstellen",

    // Dateiansicht / Seitenleiste
    "view.group": "Dateinavigation",
    "view.flatList": "Flache Liste",
    "view.treeView": "Baumansicht",
    "view.allDirs": "Alle Ordner",
    "view.allDirsTooltip": "Ordner ohne Markdown-Dateien anzeigen",
    "sidebar.toggle": "Seitenleiste umschalten",
    "sidebar.show": "Seitenleiste anzeigen",
    "sidebar.hide": "Seitenleiste ausblenden",
    "tabs.ariaLabel": "Geöffnete Dateien",
    "tabs.close": "Tab schließen",

    // Leer-/Willkommens-/Ladezustände
    "empty.noFolderSelected": "Kein Ordner ausgewählt",
    "empty.noFolderHint": 'Klicken Sie auf "Ordner öffnen", um nach einem Verzeichnis mit Markdown-Dateien zu suchen.',
    "empty.noFilesFound": "Keine Markdown-Dateien gefunden",
    "empty.noFilesHint": "Dieser Ordner enthält keine .md- oder .markdown-Dateien.",
    "welcome.title": "Willkommen bei Esuyo Markdown",
    "welcome.hint": "Öffnen Sie einen Ordner, um Markdown-Dateien zu durchsuchen und zu lesen.",
    "loading.scanning": "Ordner wird durchsucht...",

    // Leser / Editor
    "editor.source": "Quelltext",
    "editor.edit": "Bearbeiten",
    "editor.placeholder": "Markdown schreiben...",
    "editor.sourcePlaceholder": "Markdown-Quelltext bearbeiten...",
    "viewer.fileMissing": "Datei existiert nicht mehr: {file}",
    "viewer.missingSuffix": " (nicht verfügbar)",
    "zoom.tooltip": "Zoom: Strg + Mausrad, Strg + / Strg -, Strg 0. Zum Zurücksetzen auf 100 % klicken.",
    "zoom.resetAria": "Zoom auf 100 % zurücksetzen",
    "zoom.normal": "Zoom: 100 % (normal). Mit Strg + Mausrad oder Strg + / Strg - ändern.",
    "zoom.changed": "Zoom: {zoom} %. Klicken oder Strg+0 drücken, um auf 100 % zurückzusetzen.",

    // Allgemeine Aktionen
    "action.cancel": "Abbrechen",
    "action.delete": "Löschen",
    "file.delete": "Datei löschen",

    // Dialoge
    "dialog.delete.title": "Datei löschen",
    "dialog.delete.message": "Möchten Sie diese Datei wirklich löschen?",
    "dialog.delete.hint": "Die Datei wird in den Papierkorb verschoben.",
    "dialog.dirty.title": "Ungespeicherte Änderungen",
    "dialog.dirty.message_one": "„{file}“ hat ungespeicherte Änderungen. Was möchten Sie tun?",
    "dialog.dirty.message_other": "{count} Dateien haben ungespeicherte Änderungen. Wählen Sie aus, welche gespeichert werden sollen.",
    "dialog.dirty.saveSelected": "Auswahl speichern",
    "dialog.dirty.saveSelectedClose": "Auswahl speichern und schließen",
    "dialog.dirty.saveSelectedSwitch": "Auswahl speichern und wechseln",
    "dialog.dirty.saveSelectedQuit": "Auswahl speichern und beenden",
    "dialog.dirty.discard": "Verwerfen",
    "dialog.dirty.discardClose": "Verwerfen und schließen",
    "dialog.dirty.discardSwitch": "Verwerfen und wechseln",
    "dialog.dirty.discardQuit": "Verwerfen und beenden",
    "dialog.openFolder": "Ordner mit Markdown-Dateien auswählen",

    // Fehler in Hinweisfenstern
    "error.saveCancelled": "{file} konnte nicht gespeichert werden. Der Vorgang wurde abgebrochen.",
    "error.openFolder": "Fehler beim Öffnen des Ordners: {error}",
    "error.createFile": "Fehler beim Erstellen der Datei: {error}",
    "error.deleteFile": "Fehler beim Löschen der Datei: {error}",
    "error.saveFile": "{file} konnte nicht gespeichert werden: {error}",
    "error.saveFileAs": "Datei konnte nicht gespeichert werden: {error}",

    // Einstellungen
    "settings.close": "Einstellungen schließen",
    "settings.fileDiscovery": "Dateierkennung",
    "settings.useGitignore": ".gitignore verwenden",
    "settings.useGitignoreHint": "Dateien und Ordner überspringen, die von .gitignore erfasst werden. Deaktivieren, um ignorierte Dateien in die Liste aufzunehmen.",
    "settings.fonts": "Schriftarten",
    "settings.bodyFont": "Fließtextschrift",
    "settings.headingFont": "Überschriftenschrift",
    "settings.codeFont": "Code-Schrift",
    "settings.size": "Größe",
    "settings.language": "Sprache",
    "settings.displayLanguage": "Anzeigesprache",
    "settings.languageHint": "Änderungen werden nach einem Neustart der App übernommen.",
    "settings.systemDefault": "Systemstandard",
    "fonts.sansSerif": "Serifenlos",
    "fonts.serif": "Serifenschrift",
    "fonts.monospace": "Monospace",

    // Über (der Lizenzname bleibt unübersetzt)
    "about.titleFull": "Über Esuyo Markdown",
    "about.close": "Schließen",
    "about.version": "Version",
    "about.unknownVersion": "Unbekannt",
    "about.license": "Lizenz",
    "about.github": "GitHub-Repository",
    "about.store": "Microsoft Store",
};
