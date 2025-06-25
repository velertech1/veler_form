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

    // Objeto con las plantillas para los campos de detalle de actividades de riesgo
    const detalleActividadesPlantillas = {
        motocicleta: (sufijo) => `
            <div class="detalle-actividad-solicitante">
                <h5>Detalles para Solicitante ${sufijo.split('_').pop()}</h5>
                <div class="form-group">
                    <label for="moto_uso${sufijo}">Tipo de Uso</label>
                    <input type="text" id="moto_uso${sufijo}" name="moto_uso${sufijo}" class="form-control" placeholder="Transporte, Recreativo">
                </div>
                <div class="form-group">
                    <label for="moto_cc${sufijo}">Cilindrada (cc)</label>
                    <input type="text" id="moto_cc${sufijo}" name="moto_cc${sufijo}" class="form-control" placeholder="Ej: 250">
                </div>
            </div>
        `,
        aviones: (sufijo) => `
            <div class="detalle-actividad-solicitante">
                <h5>Detalles para Solicitante ${sufijo.split('_').pop()}</h5>
                <div class="form-group">
                    <label for="avion_rol${sufijo}">Rol en Vuelo</label>
                    <input type="text" id="avion_rol${sufijo}" name="avion_rol${sufijo}" class="form-control" placeholder="Piloto, Pasajero">
                </div>
                <div class="form-group">
                    <label for="avion_horas${sufijo}">Horas de Vuelo Anuales</label>
                    <input type="number" id="avion_horas${sufijo}" name="avion_horas${sufijo}" class="form-control" placeholder="Aprox.">
                </div>
            </div>
        `
    };

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
        setupRiskActivities();
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

    const cantidadContainer = document.getElementById('cantidadAseguradosContainer');

    function setupConditionalFields() {

        console.log("DEBUG: Configurando campos condicionales...");

        // --- Lógica para la sección SOLICITANTE ---
        const radiosCargoGobierno = document.querySelectorAll('input[name="cargo_gobierno"]');
        const grupoDependencia = document.getElementById('cargo_dependencia_group');
        if (radiosCargoGobierno.length > 0 && grupoDependencia) {
            radiosCargoGobierno.forEach(radio => {
                radio.addEventListener('change', (event) => {
                    grupoDependencia.style.display = (event.target.value === 'si') ? 'block' : 'none';
                });
            });
        }

        // --- Lógica para la sección DOMICILIO ---
        const checkDomicilioFiscal = document.getElementById('domicilioFiscalDiferente');
        const domicilioFiscalContainer = document.getElementById('domicilioFiscalContainer');
        if (checkDomicilioFiscal && domicilioFiscalContainer) {
            checkDomicilioFiscal.addEventListener('change', (event) => {
                domicilioFiscalContainer.style.display = event.target.checked ? 'grid' : 'none';
            });
        }

        // --- Lógica para la sección DATOS DEL CONTRATANTE ---
        const radiosContratanteEsTitular = document.querySelectorAll('input[name="contratanteEsTitular"]');
        const datosContratanteContainer = document.getElementById('datosContratanteDiferenteContainer');
        if (radiosContratanteEsTitular.length > 0 && datosContratanteContainer) {
            radiosContratanteEsTitular.forEach(radio => {
                radio.addEventListener('change', (event) => {
                    datosContratanteContainer.style.display = (event.target.value === 'no') ? 'block' : 'none';
                });
            });
        }

        const checkDomicilioDiferenteContratante = document.getElementById('contratanteDomicilioDiferente');
        const domicilioContratanteContainer = document.getElementById('domicilioContratanteContainer');
        if (checkDomicilioDiferenteContratante && domicilioContratanteContainer) {
            checkDomicilioDiferenteContratante.addEventListener('change', (event) => {
                domicilioContratanteContainer.style.display = event.target.checked ? 'grid' : 'none';
            });
        }
        
        const checkFiscalIgualContratante = document.getElementById('contratanteFiscalIgual');
        const domicilioFiscalContainerContratante = document.getElementById('domicilioFiscalContainer_contratante'); // Suponiendo que el ID en el HTML es este para diferenciarlo
        if (checkFiscalIgualContratante && domicilioFiscalContainerContratante) {
            checkFiscalIgualContratante.addEventListener('change', (event) => {
                domicilioFiscalContainerContratante.style.display = event.target.checked ? 'none' : 'grid';
            });
        }

        // --- Lógica para la sección HÁBITOS ---
        const selectGenero = document.getElementById('sexo_nacer'); // Actualizado al ID correcto
        const grupoEmbarazo = document.getElementById('embarazo_group');
        if(selectGenero && grupoEmbarazo) {
            selectGenero.addEventListener('change', (event) => {
                grupoEmbarazo.style.display = (event.target.value === 'femenino') ? 'block' : 'none';
            });
        }
        
        const radiosFuma = document.querySelectorAll('input[name="fuma"]');
        const detallesFuma = document.getElementById('fuma_details');
        const detallesNoFuma = document.getElementById('no_fuma_details');
        if(radiosFuma.length > 0 && detallesFuma && detallesNoFuma) {
            radiosFuma.forEach(radio => radio.addEventListener('change', (e) => {
                detallesFuma.style.display = (e.target.value === 'si') ? 'block' : 'none';
                detallesNoFuma.style.display = (e.target.value === 'no') ? 'block' : 'none';
            }));
        }

        // --- Lógica para OTRAS secciones (Actividades, Info Médica, etc.) ---
        const checkMotocicleta = document.querySelector('input[value="motocicleta"]');
        const detallesMoto = document.getElementById('moto_details');
        if(checkMotocicleta && detallesMoto) {
            checkMotocicleta.addEventListener('change', e => {
                detallesMoto.style.display = e.target.checked ? 'block' : 'none';
            });
        }
        
        const padecimientosRadios = document.querySelectorAll('input[name="enf_cronica"], input[name="trat_medico"], input[name="hospitalizado"], input[name="discapacidad"], input[name="otro_padecimiento"]');
        const detallePadecimientos = document.getElementById('detalle_padecimientos_group');
        if(padecimientosRadios.length > 0 && detallePadecimientos){
            padecimientosRadios.forEach(radio => radio.addEventListener('change', () => {
                const algunoSi = Array.from(padecimientosRadios).some(r => r.checked && r.value === 'si');
                detallePadecimientos.style.display = algunoSi ? 'block' : 'none';
            }));
        }

        const selectMedioPago = document.getElementById('pago_medio');
        const detallesTarjeta = document.getElementById('pago_tarjeta_details');
        const detallesClabe = document.getElementById('pago_clabe_details');
        if(selectMedioPago && detallesTarjeta && detallesClabe) {
            selectMedioPago.addEventListener('change', e => {
                detallesTarjeta.style.display = (e.target.value === 'tarjeta') ? 'block' : 'none';
                detallesClabe.style.display = (e.target.value === 'clabe') ? 'block' : 'none';
            });
        }
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

    /**
 * Configura la lógica interactiva para la sección de Actividades de Riesgo.
 */
function setupRiskActivities() {
    const actividadesItems = document.querySelectorAll('.actividad-riesgo-item');

    actividadesItems.forEach(item => {
        const checkbox = item.querySelector('input[type="checkbox"]');
        const asignacionContainer = item.querySelector('.asignacion-container');

        checkbox.addEventListener('change', (event) => {
            // Limpiamos el contenedor cada vez que hay un cambio
            asignacionContainer.innerHTML = '';
            
            if (event.target.checked) {
                asignacionContainer.style.display = 'block';
                crearSelectorDeSolicitantes(asignacionContainer, checkbox.value);
            } else {
                asignacionContainer.style.display = 'none';
            }
        });
    });
}

function crearSelectorDeSolicitantes(container, actividadValue) {
    // 1. Crear el contenedor y la etiqueta
    const selectorContainer = document.createElement('div');
    selectorContainer.className = 'form-group';
    const preguntaLabel = document.createElement('label'); // <-- Creamos el label por separado
    preguntaLabel.className = 'asignacion-label'; // <-- Le asignamos una clase
    preguntaLabel.textContent = '¿Quién(es) la practican?';
    selectorContainer.appendChild(preguntaLabel); // <-- Lo añadimos al contenedor

    // 2. Crear el div que contendrá todos los checkboxes
    const checkboxWrapper = document.createElement('div');
    checkboxWrapper.className = 'solicitante-checkbox-container'; // Le damos una clase para posibles estilos

    // Contenedor para los campos de detalle que se generarán después
    const detallesContainer = document.createElement('div');
    detallesContainer.className = 'detalles-por-solicitante-container';

    // 3. Llenar el wrapper con un checkbox por cada solicitante
    for (let i = 1; i <= solicitanteCount; i++) {
        const solicitanteID = `solicitante_${i}`;
        const checkboxID = `${actividadValue}_${solicitanteID}`;
        
        const label = document.createElement('label');
        const checkbox = document.createElement('input');
        
        checkbox.type = 'checkbox';
        checkbox.id = checkboxID;
        checkbox.name = `quien_practica_${actividadValue}`;
        checkbox.value = i; // El valor es el índice del solicitante
        
        // Añadimos el 'listener' a CADA checkbox
        checkbox.addEventListener('change', () => {
            actualizarCamposDeDetalle(checkboxWrapper, detallesContainer, actividadValue);
        });

        label.appendChild(checkbox);
        label.append((i === 1) ? ' Solicitante 1 - Titular' : ` Solicitante ${i}`);
        
        checkboxWrapper.appendChild(label);
    }
    
    // 4. Añadir los nuevos elementos al DOM
    selectorContainer.appendChild(checkboxWrapper);
    container.appendChild(selectorContainer);
    container.appendChild(detallesContainer);
}

/**
 * Muestra u oculta los campos de detalle para una actividad según los checkboxes marcados.
 * (Versión actualizada para funcionar con checkboxes).
 */
function actualizarCamposDeDetalle(checkboxWrapper, container, actividadValue) {
    // Limpiar detalles anteriores
    container.innerHTML = '';
    
    // Obtener todos los checkboxes que están marcados dentro del wrapper
    const checkboxesSeleccionados = checkboxWrapper.querySelectorAll('input[type="checkbox"]:checked');
    
    // Verificar si para esta actividad se necesitan detalles
    if (detalleActividadesPlantillas[actividadValue]) {
        checkboxesSeleccionados.forEach(checkbox => {
            const index = checkbox.value; // Obtenemos el índice del solicitante desde el valor del checkbox
            const sufijo = `_solicitante_${index}`;
            const plantillaFn = detalleActividadesPlantillas[actividadValue];
            container.innerHTML += plantillaFn(sufijo);
        });
    }
}



});