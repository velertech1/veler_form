document.addEventListener('DOMContentLoaded', () => {

    // --- 1. CONFIGURACIÓN CENTRALIZADA (ACTUALIZADA CON 11 SECCIONES) ---
    const config = {
        menuItems: [
            { id: 'solicitante', icon: 'person', text: 'Solicitantes' },
            { id: 'domicilio', icon: 'home', text: 'Domicilio' },
            { id: 'contratante-asegurado', icon: 'how_to_reg', text: 'Contratante' },
            { id: 'actividades-riesgo', icon: 'warning', text: 'Actividades de Riesgo' },
            { id: 'habitos', icon: 'health_and_safety', text: 'Hábitos' },
            { id: 'deportes', icon: 'sports_soccer', text: 'Deportes' },
            { id: 'info-medica', icon: 'medical_services', text: 'Información Médica' },
            { id: 'detalles-solicitud', icon: 'description', text: 'Detalles de la Solicitud' },
            { id: 'forma-pago', icon: 'payment', text: 'Forma de Pago' },
            { id: 'declaraciones', icon: 'gavel', text: 'Declaraciones' },
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
            form: '#formulario-completo',
            sections: '.seccion-formulario',
            menuItems: '.sidebar-menu .menu-item',
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

    // --- 2. ESTADO DE LA APLICACIÓN (SIN CAMBIOS) ---
    let state = {
        currentSectionIndex: 0,
        isLightMode: false,
        formSections: [],
        menuItems: []
    };

    // --- PARA LO DE SOLICITANTES EXTRA ---
    let solicitanteCount = 1;
    const MAX_SOLICITANTES = 10;

    // --- 3. FUNCIONES DE INICIALIZACIÓN (CON LÓGICA AÑADIDA) ---
    function initialize() {
        state.isLightMode = (localStorage.getItem(config.storageKeys.themeMode) || 'dark') === 'light';
        buildHeader();
        buildSidebar();

        state.formSections = document.querySelectorAll(config.domSelectors.sections);
        state.menuItems = document.querySelectorAll(config.domSelectors.menuItems);
        
        setupFormNavigation();
        setupConditionalFields(); // <--- LÓGICA NUEVA AÑADIDA AQUÍ
        document.getElementById('btn-agregar-asegurado').addEventListener('click', agregarNuevoSolicitante);
        showSection(0);
    }

    // El resto de tus funciones originales se mantienen, pero actualizadas
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
        config.availableThemes.forEach(theme => {
            const option = new Option(theme.name, theme.file);
            themeSelector.add(option);
        });
        themeSelector.addEventListener('change', (e) => setThemePalette(e.target.value));
        themeCheckbox.addEventListener('change', (e) => setThemeMode(e.target.checked ? 'light' : 'dark'));
        const savedFile = localStorage.getItem(config.storageKeys.themeFile) || config.availableThemes[config.availableThemes.length - 1].file;
        themeSelector.value = savedFile;
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
            </li>`).join('');
        sidebarContainer.innerHTML = `
            <div class="sidebar-top-area">
                <img id="logo-veler-sidebar" src="assets/img/veler_light.png" alt="Logo Veler Technologies">
                <button class="sidebar-toggle material-symbols-outlined" title="Contraer/Expandir menú">menu_open</button>
            </div>
            <div class="sidebar-bottom-area">
                <nav class="sidebar-menu"><ul class="menu-navegacion">${menuItemsHTML}</ul></nav>
            </div>`;
        sidebarContainer.querySelector('.sidebar-toggle').addEventListener('click', toggleSidebar);
        sidebarContainer.querySelectorAll('.menu-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const targetIndex = parseInt(e.currentTarget.dataset.sectionIndex, 10);
                showSection(targetIndex);
            });
        });
        if (localStorage.getItem(config.storageKeys.sidebarCollapsed) === 'true') {
            document.body.classList.replace('body-sidebar-expanded', 'body-sidebar-collapsed');
        }
    }

        /**
         * Clona los campos del solicitante titular para registrar asegurados adicionales.
         */
        function agregarNuevoSolicitante() {
            // 1. Validar el límite
            if (solicitanteCount >= MAX_SOLICITANTES) {
                console.log("DEBUG: Límite de solicitantes alcanzado.");
                document.getElementById('btn-agregar-asegurado').disabled = true;
                document.getElementById('btn-agregar-asegurado').textContent = "Límite de 10 solicitantes alcanzado";
                return;
            }

            solicitanteCount++;
            console.log(`DEBUG: Agregando Solicitante número ${solicitanteCount}`);

            // 2. Definir el contenedor principal y el punto de inserción
            const seccionSolicitante = document.getElementById('seccion-solicitante');
            const contenedorBoton = document.querySelector('.accion-adicional-container');

            // 3. Crear el nuevo bloque
            const nuevoBloque = document.createElement('div');
            nuevoBloque.className = 'bloque-solicitante-adicional';
            
            // 4. Clonar los campos del primer solicitante
            const camposOriginales = document.querySelector('#seccion-solicitante .form-columns-container');
            let camposClonadosHTML = camposOriginales.innerHTML;
            
            // 5. Crear identificadores únicos para los nuevos campos
            const sufijo = `_solicitante_${solicitanteCount}`;
            camposClonadosHTML = camposClonadosHTML.replace(/id="/g, `id="`);
            camposClonadosHTML = camposClonadosHTML.replace(/for="([a-zA-Z0-9_]+)"/g, `for="$1${sufijo}"`);
            camposClonadosHTML = camposClonadosHTML.replace(/id="([a-zA-Z0-9_]+)"/g, `id="$1${sufijo}"`);
            camposClonadosHTML = camposClonadosHTML.replace(/name="([a-zA-Z0-9_]+)"/g, `name="$1${sufijo}"`);

            // 6. Construir el HTML del nuevo bloque
            nuevoBloque.innerHTML = `
                <hr class="form-separator">
                <h3>Solicitante ${solicitanteCount}</h3>
                <div class="form-columns-container">
                    ${camposClonadosHTML}
                </div>
            `;

            // 7. Insertar el nuevo bloque en el DOM, antes del botón
            seccionSolicitante.insertBefore(nuevoBloque, contenedorBoton);

            // 8. Limpiar los valores de los campos recién creados
            const camposNuevos = nuevoBloque.querySelectorAll('input, select');
            camposNuevos.forEach(campo => {
                if (campo.type === 'radio' || campo.type === 'checkbox') {
                    campo.checked = false;
                } else if (campo.tagName === 'SELECT') {
                    campo.selectedIndex = 0;
                } else {
                    campo.value = '';
                }
            });

            // Después de limpiar, establecemos explícitamente el 'No' como seleccionado.
            const radioNoGobierno = nuevoBloque.querySelector(`input[name="cargo_gobierno${sufijo}"][value="no"]`);
            if (radioNoGobierno) {
                radioNoGobierno.checked = true;
            }

            // 9. Reactivar la lógica condicional para los campos del nuevo bloque
            const nuevosRadiosGobierno = nuevoBloque.querySelectorAll(`input[name="cargo_gobierno${sufijo}"]`);
            const nuevoGrupoDependencia = nuevoBloque.querySelector(`#cargo_dependencia_group${sufijo}`);

            // Nos aseguramos que los elementos existan antes de añadir el 'listener'
            if (nuevosRadiosGobierno && nuevoGrupoDependencia) {
                nuevosRadiosGobierno.forEach(radio => {
                    radio.addEventListener('change', (event) => {
                        if (event.target.value === 'si') {
                            nuevoGrupoDependencia.style.display = 'block';
                        } else {
                            nuevoGrupoDependencia.style.display = 'none';
                        }
                    });
                });
                console.log(`DEBUG: Lógica condicional de 'cargo gobierno' activada para Solicitante ${solicitanteCount}`);
            }

        }
    
    // --- 4. LÓGICA DE FORMULARIO (ACTUALIZADA) ---
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
            const lastEditableSectionIndex = config.menuItems.length - 2;
            showSection(lastEditableSectionIndex);
        });
    }

    function setupConditionalFields() {
            // --- INICIA LÓGICA PARA SOLICITANTES Y CONTRATANTES ---

    // Lógica para mostrar/ocultar el selector de número de asegurados
    const radiosAgregarAsegurados = document.querySelectorAll('input[name="agregarAsegurados"]');
    const cantidadContainer = document.getElementById('cantidadAseguradosContainer');

    radiosAgregarAsegurados.forEach(radio => {
        radio.addEventListener('change', (event) => {
            console.log(`DEBUG: Opción 'agregar asegurados' cambiada a: ${event.target.value}`); // Línea de depuración
            if (event.target.value === 'si') {
                cantidadContainer.style.display = 'block';
            } else {
                cantidadContainer.style.display = 'none';
                // Futuro: Aquí pondremos la lógica para eliminar asegurados si el usuario cambia a "No".
            }
        });
    });

    // INICIA CONTRATANTE

    // Lógica para mostrar/ocultar el formulario completo del Contratante
    const radiosContratanteEsTitular = document.querySelectorAll('input[name="contratanteEsTitular"]');
    // Apuntamos al nuevo contenedor principal
    const datosContratanteContainer = document.getElementById('datosContratanteDiferenteContainer'); 

    radiosContratanteEsTitular.forEach(radio => {
        radio.addEventListener('change', (event) => {
            console.log(`DEBUG: Opción 'contratante es titular' cambiada a: ${event.target.value}`); // Línea de depuración
            if (event.target.value === 'no') {
                datosContratanteContainer.style.display = 'block';
            } else {
                datosContratanteContainer.style.display = 'none';
            }
        });
    });

    // Nueva lógica para el checkbox de "domicilio diferente"
    const checkDomicilioDiferente = document.getElementById('contratanteDomicilioDiferente');
    const domicilioContainer = document.getElementById('domicilioContratanteContainer');

    checkDomicilioDiferente.addEventListener('change', (event) => {
        const esDiferente = event.target.checked;
        console.log(`DEBUG: Checkbox 'domicilio diferente' cambió a: ${esDiferente}`); // Línea de depuración
        if (esDiferente) {
            domicilioContainer.style.display = 'grid'; // Usamos grid para que respete las columnas
        } else {
            domicilioContainer.style.display = 'none';
        }
    });

    // --- AÑADE ESTE NUEVO BLOQUE DENTRO DE setupConditionalFields() ---

    // Lógica para el checkbox de "domicilio fiscal"
    const checkFiscalIgual = document.getElementById('contratanteFiscalIgual');
    const domicilioFiscalContainer = document.getElementById('domicilioFiscalContainer');

    checkFiscalIgual.addEventListener('change', (event) => {
        const esIgual = event.target.checked;
        console.log(`DEBUG: Checkbox 'domicilio fiscal es igual' cambió a: ${esIgual}`); // Línea de depuración
        
        // Si la casilla está marcada, el domicilio es igual, por lo tanto OCULTAMOS el contenedor.
        // Si se desmarca, el domicilio es diferente, por lo tanto MOSTRAMOS el contenedor.
        if (esIgual) {
            domicilioFiscalContainer.style.display = 'none';
        } else {
            domicilioFiscalContainer.style.display = 'grid'; // Usamos grid para que respete las columnas
        }
    });
    
    // --- FIN DE CONTRATANTE-- //

    // --- TERMINA LÓGICA PARA SOLICITANTES Y CONTRATANTES ---

        const addListener = (selector, event, handler) => {
            const element = document.querySelector(selector);
            if (element) element.addEventListener(event, handler);
        };
        const addListenerAll = (selector, event, handler) => {
            document.querySelectorAll(selector).forEach(el => el.addEventListener(event, handler));
        };
        const toggleDisplay = (id, show) => {
            const element = document.getElementById(id);
            if (element) element.style.display = show ? 'block' : 'none';
        };

        addListenerAll('input[name="cargo_gobierno"]', 'change', e => toggleDisplay('cargo_dependencia_group', e.target.value === 'si'));
        addListener('input[value="motocicleta"]', 'change', e => toggleDisplay('moto_details', e.target.checked));
        addListener('input[value="aviones"]', 'change', e => toggleDisplay('avion_details', e.target.checked));
        addListener('#genero', 'change', e => toggleDisplay('embarazo_group', e.target.value === 'femenino'));
        addListenerAll('input[name="fuma"]', 'change', e => {
            toggleDisplay('fuma_details', e.target.value === 'si');
            toggleDisplay('no_fuma_details', e.target.value === 'no');
        });
        addListenerAll('input[name="alcohol"]', 'change', e => toggleDisplay('alcohol_details', e.target.value === 'si'));
        addListenerAll('input[name="drogas"]', 'change', e => toggleDisplay('drogas_details', e.target.value === 'si'));
        addListenerAll('input[name="embarazo"]', 'change', e => toggleDisplay('embarazo_details', e.target.value === 'si'));
        const deportesCheckboxes = document.querySelectorAll('input[name="deporte_riesgo"]');
        deportesCheckboxes.forEach(cb => cb.addEventListener('change', () => {
            const algunoMarcado = Array.from(deportesCheckboxes).some(c => c.checked);
            toggleDisplay('deporte_details', algunoMarcado);
        }));
        const padecimientosRadios = document.querySelectorAll('input[name="enf_cronica"], input[name="trat_medico"], input[name="hospitalizado"], input[name="discapacidad"], input[name="otro_padecimiento"]');
        padecimientosRadios.forEach(radio => radio.addEventListener('change', () => {
            const algunoSi = Array.from(padecimientosRadios).some(r => r.checked && r.value === 'si');
            toggleDisplay('detalle_padecimientos_group', algunoSi);
        }));
        addListenerAll('input[name="viajar"]', 'change', e => toggleDisplay('viajar_details', e.target.value === 'si'));
        addListenerAll('input[name="antiguedad"]', 'change', e => toggleDisplay('antiguedad_details', e.target.value === 'si'));
        addListener('#pago_medio', 'change', e => {
            toggleDisplay('pago_tarjeta_details', e.target.value === 'tarjeta');
            toggleDisplay('pago_clabe_details', e.target.value === 'clabe');
        });
    }

    function showSection(index) {
        const mainForm = document.querySelector(config.domSelectors.form);
        if (!mainForm) return;

        const isReviewMode = config.menuItems[index].id === 'revision';
        mainForm.classList.toggle('modo-revision', isReviewMode);

        state.formSections.forEach(section => {
            section.querySelectorAll('input, select, textarea').forEach(el => {
                el.disabled = isReviewMode;
            });
        });

        if (!isReviewMode) {
            state.formSections.forEach((section, i) => {
                section.classList.toggle('seccion-activa', i === index);
            });
        }
        
        state.currentSectionIndex = index;
        document.querySelectorAll(config.domSelectors.menuItems).forEach((item, i) => {
            item.classList.toggle('active', i === index);
        });
        updateButtons();
    }
    
    function updateButtons() {
        const isLastSection = state.currentSectionIndex === config.menuItems.length - 1;
        document.querySelector(config.domSelectors.prevBtn).style.display = (state.currentSectionIndex > 0 && !isLastSection) ? 'inline-block' : 'none';
        document.querySelector(config.domSelectors.nextBtn).style.display = isLastSection ? 'none' : 'inline-block';
        document.querySelector(config.domSelectors.submitBtn).style.display = isLastSection ? 'inline-block' : 'none';
        document.querySelector(config.domSelectors.editBtn).style.display = isLastSection ? 'inline-block' : 'none';
    }

    // --- 5. LÓGICA DE TEMAS Y SIDEBAR (TU CÓDIGO ORIGINAL) ---
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
            logo.src = state.isLightMode ? 'assets/img/VELER_LIGHT.png' : 'assets/img/VELER_DARK.png';
        }
    }

    function setThemePalette(themeFile) {
        const dynamicThemeLink = document.querySelector(config.domSelectors.dynamicThemeLink);
        if (dynamicThemeLink) {
            dynamicThemeLink.href = themeFile;
            localStorage.setItem(config.storageKeys.themeFile, themeFile);
        }
    }

    // --- 6. EJECUTAR LA APLICACIÓN ---
    initialize();
});