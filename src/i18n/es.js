// Spanish dictionary. Keys mirror en.js exactly.
// CJK script hints in the font list stay as-is (they are already in their
// native script); the license name stays untranslated in every locale.

export const messages = {
    "app.title": "Esuyo Markdown",

    // Barra superior / menú
    "menu.tooltip": "Menú",
    "theme.toggle": "Cambiar tema",
    "theme.switchToDark": "Cambiar a tema oscuro",
    "theme.switchToLight": "Cambiar a tema claro",
    "file.new": "Nuevo archivo",
    "file.newTooltip": "Nuevo archivo",
    "folder.reload": "Recargar carpeta",
    "folder.open": "Abrir carpeta",
    "action.save": "Guardar",
    "action.saveAs": "Guardar como",
    "settings.title": "Configuración",
    "menu.recentFolders": "Carpetas recientes",
    "menu.noRecentFolders": "No hay carpetas recientes",
    "about.title": "Acerca de",
    "context.newFileHere": "Nuevo archivo Markdown aquí",

    // Vista de archivos / barra lateral
    "view.group": "Vista de navegación de archivos",
    "view.flatList": "Lista plana",
    "view.treeView": "Vista de árbol",
    "view.allDirs": "Todas las carpetas",
    "view.allDirsTooltip": "Mostrar carpetas sin archivos Markdown",
    "sidebar.toggle": "Alternar barra lateral",
    "sidebar.show": "Mostrar barra lateral",
    "sidebar.hide": "Ocultar barra lateral",
    "tabs.ariaLabel": "Archivos abiertos",
    "tabs.close": "Cerrar pestaña",

    // Estados vacíos / bienvenida / carga
    "empty.noFolderSelected": "No se ha seleccionado ninguna carpeta",
    "empty.noFolderHint": 'Haz clic en "Abrir carpeta" para buscar un directorio con archivos Markdown.',
    "empty.noFilesFound": "No se encontraron archivos Markdown",
    "empty.noFilesHint": "Esta carpeta no contiene archivos .md ni .markdown.",
    "welcome.title": "Bienvenido a Esuyo Markdown",
    "welcome.hint": "Abre una carpeta para explorar y leer archivos Markdown.",
    "loading.scanning": "Escaneando carpeta...",

    // Lector / editor
    "editor.source": "Código fuente",
    "editor.edit": "Editar",
    "editor.placeholder": "Empieza a escribir Markdown...",
    "editor.sourcePlaceholder": "Editar código fuente Markdown...",
    "viewer.fileMissing": "El archivo ya no existe: {file}",
    "viewer.missingSuffix": " (no disponible)",
    "zoom.tooltip": "Zoom: Ctrl + rueda del ratón, Ctrl + / Ctrl -, Ctrl 0. Haz clic para restablecer al 100 %.",
    "zoom.resetAria": "Restablecer zoom al 100 %",
    "zoom.normal": "Zoom: 100 % (normal). Ctrl + rueda del ratón o Ctrl + / Ctrl - para cambiar.",
    "zoom.changed": "Zoom: {zoom} %. Haz clic o pulsa Ctrl+0 para restablecer al 100 %.",

    // Acciones comunes
    "action.cancel": "Cancelar",
    "action.delete": "Eliminar",
    "file.delete": "Eliminar archivo",

    // Diálogos
    "dialog.delete.title": "Eliminar archivo",
    "dialog.delete.message": "¿Seguro que quieres eliminar este archivo?",
    "dialog.delete.hint": "El archivo se moverá a la Papelera de reciclaje.",
    "dialog.dirty.title": "Cambios sin guardar",
    "dialog.dirty.message_one": "“{file}” tiene cambios sin guardar. ¿Qué quieres hacer?",
    "dialog.dirty.message_other": "{count} archivos tienen cambios sin guardar. Elige cuáles guardar.",
    "dialog.dirty.saveSelected": "Guardar seleccionados",
    "dialog.dirty.saveSelectedClose": "Guardar seleccionados y cerrar",
    "dialog.dirty.saveSelectedSwitch": "Guardar seleccionados y cambiar",
    "dialog.dirty.saveSelectedQuit": "Guardar seleccionados y salir",
    "dialog.dirty.discard": "Descartar",
    "dialog.dirty.discardClose": "Descartar y cerrar",
    "dialog.dirty.discardSwitch": "Descartar y cambiar",
    "dialog.dirty.discardQuit": "Descartar y salir",
    "dialog.openFolder": "Selecciona una carpeta con archivos Markdown",

    // Errores mostrados en avisos
    "error.saveCancelled": "No se pudo guardar {file}. La operación se canceló.",
    "error.openFolder": "Error al abrir la carpeta: {error}",
    "error.createFile": "Error al crear el archivo: {error}",
    "error.deleteFile": "Error al eliminar el archivo: {error}",
    "error.saveFile": "No se pudo guardar {file}: {error}",
    "error.saveFileAs": "No se pudo guardar el archivo: {error}",

    // Configuración
    "settings.close": "Cerrar configuración",
    "settings.fileDiscovery": "Descubrimiento de archivos",
    "settings.useGitignore": "Usar .gitignore",
    "settings.useGitignoreHint": "Omitir archivos y carpetas coincidentes con .gitignore. Desmarca esta opción para incluir los archivos ignorados en la lista.",
    "settings.fonts": "Fuentes",
    "settings.bodyFont": "Fuente del cuerpo",
    "settings.headingFont": "Fuente de los títulos",
    "settings.codeFont": "Fuente del código",
    "settings.size": "Tamaño",
    "settings.language": "Idioma",
    "settings.displayLanguage": "Idioma de la interfaz",
    "settings.languageHint": "Los cambios se aplican después de que la aplicación se reinicie.",
    "settings.systemDefault": "Predeterminado del sistema",
    "fonts.sansSerif": "Sans-serif",
    "fonts.serif": "Serif",
    "fonts.monospace": "Monoespacio",

    // Acerca de (el nombre de la licencia no se traduce)
    "about.titleFull": "Acerca de Esuyo Markdown",
    "about.close": "Cerrar",
    "about.version": "Versión",
    "about.unknownVersion": "Desconocida",
    "about.license": "Licencia",
    "about.github": "Repositorio en GitHub",
    "about.store": "Microsoft Store",
};
