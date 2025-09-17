// assets/js/base/_switch.js

// LISTA DE TEMAS ACTUALIZADA Y COMPLETA
const AVAILABLE_THEMES = [
    { name: "Veler Blue v2", file: "assets/css/theme-veler-blue_2.css" },
    { name: "Veler Blue", file: "assets/css/theme-veler-blue.css" },
    { name: "Teal Green v2", file: "assets/css/theme-teal-green_v2.css" },
    { name: "Teal Green", file: "assets/css/theme-teal-green.css" },
    { name: "Slate Mauve v2", file: "assets/css/theme-slate-mauve_2.css" },
    { name: "Slate Mauve", file: "assets/css/theme-slate-mauve.css" },
    { name: "Pink v2", file: "assets/css/theme-pink_2.css"},
    { name: "Pink", file: "assets/css/theme-pink.css" },
    { name: "Gold Teal v2", file: "assets/css/theme-gold-teal_2.css" },
    { name: "Gold Teal", file: "assets/css/theme-gold-teal.css" },
    { name: "Gold v2", file: "assets/css/theme-gold_2.css"},
    { name: "Gold", file: "assets/css/theme-gold.css"},
    { name: "Red Dark v2", file: "assets/css/theme-red-dark_2.css"},
    { name: "Red Dark", file: "assets/css/theme-red-dark.css"},
    { name: "vHealth Default", file: "assets/css/theme-default.css" }
];

/**
 * Crea y controla los elementos para cambiar de tema y modo (claro/oscuro).
 * @param {HTMLElement} headerContainer - El elemento <header> donde se insertarán los controles.
 */
export function initializeTheme(headerContainer) {
    if (!headerContainer) {
        console.error("El contenedor del header no fue encontrado para inicializar el tema.");
        return;
    }

    // 1. Crea el HTML de los controles y lo inyecta en la cabecera
    headerContainer.innerHTML = `
        <div class="header-content-wrapper">
            <div class="theme-controls">
                <select id="theme-selector" title="Seleccionar Tema de Color"></select>
                <div class="theme-switch-wrapper">
                    <label class="theme-switch" for="theme-checkbox">
                        <input type="checkbox" id="theme-checkbox" />
                        <div class="slider round">
                            <span class="icon material-symbols-outlined sun">light_mode</span>
                            <span class="icon material-symbols-outlined moon">dark_mode</span>
                        </div>
                    </label>
                </div>
            </div>
        </div>`;
    
    // 2. Selecciona los elementos recién creados
    const themeSelector = document.getElementById('theme-selector');
    const themeCheckbox = document.getElementById('theme-checkbox');
    const dynamicThemeLink = document.getElementById('dynamic-theme-style-link');

    // 3. Rellena el selector con los temas disponibles
    AVAILABLE_THEMES.forEach(theme => {
        const option = document.createElement('option');
        option.value = theme.file;
        option.textContent = theme.name;
        themeSelector.appendChild(option);
    });

    // 4. Define las funciones para aplicar los cambios
    const applyThemeMode = (mode) => {
        const isLight = mode === 'light';
        document.documentElement.classList.toggle('light-theme', isLight);

        const logoSidebar = document.getElementById('logo-veler-sidebar');
        const logoSrc = isLight ? 'assets/img/veler_light.png' : 'assets/img/veler_dark.png';
        if (logoSidebar) logoSidebar.src = logoSrc;
        
        if (themeCheckbox) themeCheckbox.checked = isLight;
    };

    const applyThemePalette = (themeFile) => {
        if (dynamicThemeLink) dynamicThemeLink.href = themeFile;
        if (themeSelector) themeSelector.value = themeFile;
    };

    // 5. Asigna los eventos a los controles
    themeSelector.addEventListener('change', function() {
        localStorage.setItem('selected_theme_file', this.value);
        applyThemePalette(this.value);
    });

    themeCheckbox.addEventListener('change', function() {
        const mode = this.checked ? 'light' : 'dark';
        localStorage.setItem('theme_mode', mode);
        applyThemeMode(mode);
    });

    // 6. Carga la configuración guardada al iniciar la página
    const savedFile = localStorage.getItem('selected_theme_file') || AVAILABLE_THEMES[0].file;
    const savedMode = localStorage.getItem('theme_mode') || 'dark';
    applyThemePalette(savedFile);
    applyThemeMode(savedMode);
}