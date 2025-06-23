document.addEventListener('DOMContentLoaded', () => {

    // --- 1. CONFIGURACIÓN CENTRALIZADA ---
    const config = {
        menuItems: [
            { id: 'contratante', icon: 'person', text: 'Contratante' },
            { id: 'domicilio', icon: 'home', text: 'Domicilio' },
            { id: 'habitos', icon: 'favorite', text: 'Hábitos y Salud' },
            { id: 'beneficiarios', icon: 'group', text: 'Beneficiarios' },
            { id: 'forma-pago', icon: 'payment', text: 'Forma de Pago' },
            { id: 'revision', icon: 'preview', text: 'Revisión Final' }
        ],
        availableThemes: [
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
            { name: "GNP Default", file: "assets/css/theme-default.css" }
        ],
        domSelectors: {
            sidebar: '#sidebar-navegacion',
            header: '#main-header',
            sections: '.seccion-formulario',
            menuItems: '.sidebar-menu .menu-item',
            nextBtn: '#next-btn',
            prevBtn: '#prev-btn',
            submitBtn: '#submit-btn',
            dynamicThemeLink: '#dynamic-theme-style-link'
        },
        storageKeys: {
            themeMode: 'theme_mode',
            themeFile: 'selected_theme_file',
            sidebarCollapsed: 'sidebar_collapsed'
        }
    };

    // --- 2. ESTADO DE LA APLICACIÓN ---
    let state = {
        currentSectionIndex: 0,
        isLightMode: false,
        formSections: [],
        menuItems: []
    };

    // --- 3. FUNCIONES DE INICIALIZACIÓN ---

    function initialize() {
        // Determinar el estado inicial antes de construir nada
        state.isLightMode = (localStorage.getItem(config.storageKeys.themeMode) || 'dark') === 'light';

        // Construir la interfaz
        buildHeader();
        buildSidebar();

        // Guardar referencias a los elementos del DOM
        state.formSections = document.querySelectorAll(config.domSelectors.sections);
        state.menuItems = document.querySelectorAll(config.domSelectors.menuItems);
        
        // Configurar la navegación
        setupFormNavigation();
        showSection(0);
    }

    function buildHeader() {
        const headerContainer = document.querySelector(config.domSelectors.header);
        if (!headerContainer) return;

        headerContainer.innerHTML = `
            <div class="header-content-wrapper">
                <div class="theme-controls">
                    <select id="theme-selector" title="Seleccionar Tema de Color"></select>
                    <label class="theme-switch" for="theme-checkbox">
                        <input type="checkbox" id="theme-checkbox" />
                        <div class="slider round">
                            <span class="icon material-symbols-outlined sun">light_mode</span>
                            <span class="icon material-symbols-outlined moon">dark_mode</span>
                        </div>
                    </label>
                </div>
            </div>`;

        const themeSelector = headerContainer.querySelector('#theme-selector');
        const themeCheckbox = headerContainer.querySelector('#theme-checkbox');
        const dynamicThemeLink = document.querySelector(config.domSelectors.dynamicThemeLink);
        
        // Poblar temas
        config.availableThemes.forEach(theme => {
            const option = document.createElement('option');
            option.value = theme.file;
            option.textContent = theme.name;
            themeSelector.appendChild(option);
        });

        // Eventos
        themeSelector.addEventListener('change', (e) => setThemePalette(e.target.value));
        themeCheckbox.addEventListener('change', (e) => setThemeMode(e.target.checked ? 'light' : 'dark'));

        // Aplicar estado guardado
        const savedFile = localStorage.getItem(config.storageKeys.themeFile) || config.availableThemes[0].file;
        themeSelector.value = savedFile;
        if (dynamicThemeLink) dynamicThemeLink.href = savedFile;
        themeCheckbox.checked = state.isLightMode;
        document.documentElement.classList.toggle('light-theme', state.isLightMode);
    }

    function buildSidebar() {
        const sidebarContainer = document.querySelector(config.domSelectors.sidebar);
        if (!sidebarContainer) return;

        const initialLogo = state.isLightMode ? 'assets/img/veler_light.png' : 'assets/img/veler_dark.png';
        
        sidebarContainer.innerHTML = `
            <div class="sidebar-top-area">
                <img id="logo-veler-sidebar" src="${initialLogo}" alt="Logo Veler Technologies">
                <button class="sidebar-toggle material-symbols-outlined" title="Contraer/Expandir menú">menu_open</button>
            </div>
            <div class="sidebar-bottom-area">
                <nav class="sidebar-menu"><ul class="menu-navegacion"></ul></nav>
            </div>`;
        
        const menuList = sidebarContainer.querySelector('.menu-navegacion');
        config.menuItems.forEach((item, index) => {
            const li = document.createElement('li');
            li.className = 'menu-item';
            li.dataset.sectionId = `seccion-${item.id}`;
            li.dataset.sectionIndex = index;
            li.innerHTML = `<span class="menu-icon material-symbols-outlined">${item.icon}</span><span class="menu-text">${item.text}</span>`;
            li.addEventListener('click', () => {
                 if (index <= state.currentSectionIndex) {
                    showSection(index);
                 }
            });
            menuList.appendChild(li);
        });

        const toggleButton = sidebarContainer.querySelector('.sidebar-toggle');
        toggleButton.addEventListener('click', toggleSidebar);
        if (localStorage.getItem(config.storageKeys.sidebarCollapsed) === 'true') {
            document.body.classList.replace('body-sidebar-expanded', 'body-sidebar-collapsed');
        }
    }

    function setupFormNavigation() {
        const nextBtn = document.querySelector(config.domSelectors.nextBtn);
        const prevBtn = document.querySelector(config.domSelectors.prevBtn);

        nextBtn.addEventListener('click', () => {
            if (state.currentSectionIndex < state.formSections.length - 1) {
                showSection(state.currentSectionIndex + 1);
            }
        });

        prevBtn.addEventListener('click', () => {
            if (state.currentSectionIndex > 0) {
                showSection(state.currentSectionIndex - 1);
            }
        });
    }

    // --- 4. FUNCIONES DE LÓGICA ---
    
    function showSection(index) {
        state.currentSectionIndex = index;
        state.formSections.forEach((section, i) => {
            section.classList.toggle('seccion-activa', i === index);
        });
        state.menuItems.forEach((item, i) => {
            item.classList.toggle('active', i === index);
        });
        updateButtons();
    }

    function updateButtons() {
        const nextBtn = document.querySelector(config.domSelectors.nextBtn);
        const prevBtn = document.querySelector(config.domSelectors.prevBtn);
        const submitBtn = document.querySelector(config.domSelectors.submitBtn);

        prevBtn.style.display = state.currentSectionIndex > 0 ? 'inline-block' : 'none';
        const isLastSection = state.currentSectionIndex === state.formSections.length - 1;
        nextBtn.style.display = isLastSection ? 'none' : 'inline-block';
        submitBtn.style.display = isLastSection ? 'inline-block' : 'none';
    }

    function toggleSidebar() {
        const isCollapsed = document.body.classList.contains('body-sidebar-collapsed');
        if (isCollapsed) {
            document.body.classList.replace('body-sidebar-collapsed', 'body-sidebar-expanded');
            localStorage.setItem(config.storageKeys.sidebarCollapsed, 'false');
        } else {
            document.body.classList.replace('body-sidebar-expanded', 'body-sidebar-collapsed');
            localStorage.setItem(config.storageKeys.sidebarCollapsed, 'true');
        }
    }

    function setThemeMode(mode) {
        state.isLightMode = mode === 'light';
        localStorage.setItem(config.storageKeys.themeMode, mode);
        document.documentElement.classList.toggle('light-theme', state.isLightMode);
        const logo = document.getElementById('logo-veler-sidebar');
        if (logo) {
            logo.src = state.isLightMode ? 'assets/img/veler_light.png' : 'assets/img/veler_dark.png';
        }
    }

    function setThemePalette(themeFile) {
        localStorage.setItem(config.storageKeys.themeFile, themeFile);
        const dynamicThemeLink = document.querySelector(config.domSelectors.dynamicThemeLink);
        if (dynamicThemeLink) {
            dynamicThemeLink.href = themeFile;
        }
    }

    // --- 5. EJECUTAR LA APLICACIÓN ---
    initialize();
    
    // Alerta de depuración final
    console.log("DEBUG: `persona.js` cargado en modo 'Todo en Uno'. Todo debería funcionar ahora.");
});