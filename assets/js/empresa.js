document.addEventListener('DOMContentLoaded', () => {

    // --- 1. CONFIGURACIÓN ---
    const config = {
        menuItems: [
            { id: 'solicitante', icon: 'badge', text: 'Datos del Solicitante' },
            { id: 'empresa', icon: 'apartment', text: 'Info. de la Empresa' },
            { id: 'coberturas', icon: 'checklist', text: 'Selección de Coberturas' },
            { id: 'detalles-coberturas', icon: 'fact_check', text: 'Detalles de Coberturas' },
            { id: 'historial', icon: 'history', text: 'Historial' },
            { id: 'revision', icon: 'preview', text: 'Revisión Final' }
        ],
        domSelectors: {
            sidebar: '#sidebar-navegacion',
            header: '#main-header',
            mainContainer: '#formulario-completo', // Contenedor <main>
            form: '#miFormularioDinamico',      // El <form>
            sections: '.seccion-formulario',
            nextBtn: '#next-btn',
            prevBtn: '#prev-btn',
            submitBtn: '#submit-btn',
            editBtn: '#edit-btn',
            dynamicThemeLink: '#dynamic-theme-style-link'
        },
        storageKeys: {
            themeMode: 'theme_mode',
            themeFile: 'selected_theme_file',
            sidebarCollapsed: 'sidebar_collapsed'
        }
    };

    // --- 2. ESTADO ---
    let state = {
        currentSectionIndex: 0,
        isLightMode: false,
        formSections: [],
        menuItems: []
    };

    // --- 3. INICIALIZACIÓN ---
    function initialize() {
        state.isLightMode = (localStorage.getItem(config.storageKeys.themeMode) || 'dark') === 'light';
        buildHeader();
        buildSidebar(); 
        state.formSections = document.querySelectorAll(config.domSelectors.sections);
        state.menuItems = document.querySelectorAll('.sidebar-menu .menu-item');
        setupFormNavigation();
        setupConditionalFields(); 
        showSection(0);
    }

    // --- 4. CONSTRUCCIÓN DE UI ---
    function buildHeader() {
        const headerContainer = document.querySelector(config.domSelectors.header);
        if (!headerContainer) return;
        headerContainer.innerHTML = `
            <div class="header-content-wrapper">
                <div class="theme-controls">
                    <label class="theme-switch" for="theme-checkbox"><input type="checkbox" id="theme-checkbox" /><div class="slider round"><span class="icon material-symbols-outlined sun">light_mode</span><span class="icon material-symbols-outlined moon">dark_mode</span></div></label>
                </div>
            </div>`;
        const themeCheckbox = headerContainer.querySelector('#theme-checkbox');
        themeCheckbox.addEventListener('change', (e) => setThemeMode(e.target.checked ? 'light' : 'dark'));
        const savedFile = localStorage.getItem(config.storageKeys.themeFile) || config.availableThemes[0].file;
        setThemePalette(savedFile);
        themeCheckbox.checked = state.isLightMode;
        setThemeMode(state.isLightMode ? 'light' : 'dark');
    }

    function buildSidebar() {
        const sidebarContainer = document.querySelector(config.domSelectors.sidebar);
        if (!sidebarContainer) return;
        const menuItemsHTML = config.menuItems.map((item, index) => `
            <li class="menu-item" data-section-index="${index}">
                <span class="menu-icon material-symbols-outlined">${item.icon}</span>
                <span class="menu-text">${item.text}</span>
                <span class="menu-status">
            </li>`).join('');
        sidebarContainer.innerHTML = `
            <div class="sidebar-top-area"><img id="logo-veler-sidebar" src="${state.isLightMode ? 'assets/img/veler_light.png' : 'assets/img/VELER_DARK.png'}" alt="Logo"><button class="sidebar-toggle material-symbols-outlined" title="Contraer/Expandir menú">menu_open</button></div>
            <div class="sidebar-bottom-area"><nav class="sidebar-menu"><ul class="menu-navegacion">${menuItemsHTML}</ul></nav></div>`;
        sidebarContainer.querySelector('.sidebar-toggle').addEventListener('click', toggleSidebar);
        sidebarContainer.querySelectorAll('.menu-item').forEach(item => {
            item.addEventListener('click', (e) => showSection(parseInt(e.currentTarget.dataset.sectionIndex, 10)));
        });
        if (localStorage.getItem(config.storageKeys.sidebarCollapsed) === 'true') {
            document.body.classList.replace('body-sidebar-expanded', 'body-sidebar-collapsed');
        }
    }
    
    // --- 5. LÓGICA DE FORMULARIO ---
    function setupFormNavigation() {
        document.querySelector(config.domSelectors.nextBtn)?.addEventListener('click', () => {
            if (state.currentSectionIndex < config.menuItems.length - 1) {
                showSection(state.currentSectionIndex + 1);
            }
        });
        document.querySelector(config.domSelectors.prevBtn)?.addEventListener('click', () => {
            if (state.currentSectionIndex > 0) {
                showSection(state.currentSectionIndex - 1);
            }
        });
        document.querySelector(config.domSelectors.editBtn)?.addEventListener('click', () => {
            // Vuelve a la primera sección para editar
            showSection(0);
        });
    }

    function setupConditionalFields() {
        document.querySelectorAll('input[name="pep"]').forEach(radio => radio.addEventListener('change', (e) => {
            document.getElementById('pep-detalles').style.display = (e.target.value === 'si' && e.target.checked) ? 'block' : 'none';
        }));
        document.querySelectorAll('input[name="poliza-actual"]').forEach(radio => radio.addEventListener('change', (e) => {
            document.getElementById('poliza-actual-detalles').style.display = (e.target.value === 'si' && e.target.checked) ? 'block' : 'none';
        }));
        document.querySelectorAll('#coberturas-checkboxes input[type="checkbox"]').forEach(checkbox => {
            checkbox.addEventListener('change', updateDetallesCoberturas);
        });
    }

    function updateDetallesCoberturas() {
        const selections = {
            danos: document.getElementById('chk-danos').checked,
            rc: document.getElementById('chk-rc-general').checked || document.getElementById('chk-rc-profesional').checked,
        };
        let anySelection = Object.values(selections).some(isSelected => isSelected);
        document.getElementById('detalles-danos').style.display = selections.danos ? 'block' : 'none';
        document.getElementById('detalles-rc').style.display = selections.rc ? 'block' : 'none';
        document.getElementById('detalles-placeholder').style.display = anySelection ? 'none' : 'block';
    }

    function generateReview() {
        const formElement = document.querySelector(config.domSelectors.form);
        const reviewContainer = document.getElementById('resumen-final-container');
        if (!formElement || !reviewContainer) return;

        const formData = new FormData(formElement);
        let summaryHTML = '<ul>';

        for (const [name, value] of formData.entries()) {
            if (value) { // Solo mostrar campos con valor
                const labelElement = formElement.querySelector(`label[for="${name}"]`);
                const labelText = labelElement ? labelElement.innerText.replace('*', '').trim() : name;
                summaryHTML += `<li><strong>${labelText}:</strong> ${value}</li>`;
            }
        }
        summaryHTML += '</ul>';
        reviewContainer.innerHTML = summaryHTML;
    }

    // --- FUNCIÓN SHOWSECTION CON LÓGICA DE REVISIÓN RESTAURADA ---
    function showSection(index) {
        if (index < 0 || index >= config.menuItems.length) return;

        visibleSection(index);
        state.currentSectionIndex = index;
        
        const nameForm = config.menuItems[state.currentSectionIndex-1].id;

        console.log(nameForm);

        /* ==== Fields validation ====*/

        const currentForm = document.getElementById("seccion-" + nameForm);
        let formGroups = currentForm.getElementsByClassName("form-columns-container")[0].getElementsByClassName("form-group");
        const allResults = [];
        let isEmpty = false;

        for(const element of formGroups) {
            const allInputs = element.querySelectorAll("input, select, textarea");
            allInputs.forEach((input) => {
                if(input !== undefined) {
                    allResults.push(input.value);
                }
            });
        }

        isEmpty = (allResults.length === 0 || allResults.isEmpty || allResults.includes(""));

        /* ======================== */

        if (isEmpty) {
            state.currentSectionIndex = (state.currentSectionIndex === 0) ? 0 : state.currentSectionIndex-1;
            visibleSection(state.currentSectionIndex);
        } else {
                    let lastSectionSelected = document.querySelector(`[data-section-index="${state.currentSectionIndex-1}"]`);
                    let innerStatus = lastSectionSelected.getElementsByClassName("menu-status")[0];
                    let bgStyleInnerStatus = window.getComputedStyle(innerStatus).backgroundColor;
                    let styleToSetInnerStatus = innerStatus.style;
                    console.log(styleToSetInnerStatus);
                    if(bgStyleInnerStatus == "rgb(68, 68, 68)" || bgStyleInnerStatus == "rgb(180, 180, 180)") {
                        styleToSetInnerStatus.backgroundColor = `var(--sidebar-status-completed-bg)`;
                    }
        }
        state.menuItems.forEach((item, i) => item.classList.toggle('active', i === index));

        const sectionId = config.menuItems[index]?.id;
        if (sectionId === 'detalles-coberturas') {
            updateDetallesCoberturas();
        }

        updateButtons();
    }

    function visibleSection(index) {
        const mainContainer = document.querySelector(config.domSelectors.mainContainer);
        const isReviewMode = config.menuItems[index].id === 'revision';

        mainContainer.classList.toggle('modo-revision', isReviewMode);
        if (isReviewMode) {
            generateReview();
            state.formSections.forEach(section => {
                section.querySelectorAll('input, select, textarea').forEach(el => el.disabled = true);
            });
            state.formSections.forEach(section => section.classList.remove('seccion-activa'));
            document.getElementById('seccion-revision')?.classList.add('seccion-activa');

        } else {
            state.formSections.forEach(section => {
                section.querySelectorAll('input, select, textarea').forEach(el => el.disabled = false);
            });
            state.formSections.forEach((section, i) => {
                section.classList.toggle('seccion-activa', i === index);
            });
        }
    }
    
    function updateButtons() {
        const prevBtn = document.querySelector(config.domSelectors.prevBtn);
        const nextBtn = document.querySelector(config.domSelectors.nextBtn);
        const submitBtn = document.querySelector(config.domSelectors.submitBtn);
        const editBtn = document.querySelector(config.domSelectors.editBtn);
        if (!prevBtn || !nextBtn || !submitBtn || !editBtn) return;

        const isReviewMode = config.menuItems[state.currentSectionIndex].id === 'revision';

        prevBtn.style.display = (state.currentSectionIndex > 0 && !isReviewMode) ? 'inline-block' : 'none';
        nextBtn.style.display = isReviewMode ? 'none' : 'inline-block';
        submitBtn.style.display = isReviewMode ? 'inline-block' : 'none';
        editBtn.style.display = isReviewMode ? 'inline-block' : 'none';
        
        // Condición para el último paso antes de la revisión
        if (state.currentSectionIndex === config.menuItems.length - 2) {
             nextBtn.textContent = 'Ir a Revisión';
        } else {
             nextBtn.textContent = 'Siguiente';
        }
    }

    // --- LÓGICA DE TEMAS Y SIDEBAR ---
    function toggleSidebar() {
        const isCollapsed = document.body.classList.contains('body-sidebar-collapsed');
        document.body.classList.replace(isCollapsed ? 'body-sidebar-collapsed' : 'body-sidebar-expanded', isCollapsed ? 'body-sidebar-expanded' : 'body-sidebar-collapsed');
        localStorage.setItem(config.storageKeys.sidebarCollapsed, !isCollapsed);
    }

    function setThemeMode(mode) {
        state.isLightMode = mode === 'light';
        localStorage.setItem(config.storageKeys.themeMode, mode);
        document.documentElement.classList.toggle('light-theme', state.isLightMode);
        const logo = document.getElementById('logo-veler-sidebar');
        if (logo) {
            logo.src = state.isLightMode ? 'assets/img/veler_light.png' : 'assets/img/VELER_DARK.png';
        }
    }

    function setThemePalette(themeFile) {
        const dynamicThemeLink = document.querySelector(config.domSelectors.dynamicThemeLink);
        if (dynamicThemeLink) {
            dynamicThemeLink.href = themeFile;
            localStorage.setItem(config.storageKeys.themeFile, themeFile);
        }
    }

    // --- EJECUTAR LA APLICACIÓN ---
    initialize();
    isMobile();
});

function isMobile() {
    if(window.innerWidth <= 750) {
        collapsed();
    }

    function collapsed() {
        document.body.classList.add('body-sidebar-collapsed');
    }
}

window.onresize = function() {
    isMobile();
}