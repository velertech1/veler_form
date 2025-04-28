/**
 * Script para Formulario de Solicitud GNP
 * Maneja navegación, temas, sidebar, progreso y envío.
 * VERSIÓN AJUSTADA PARA NUEVO LAYOUT
 */
document.addEventListener('DOMContentLoaded', () => {
    // --- Configuración ---
    const CONFIG = {
        FADE_DURATION: 400,
        SPLASH_DISPLAY_DURATION: 1500,
        SPLASH_FADE_DURATION: 500,
        API_ENDPOINT: '/tu-endpoint-real-en-el-servidor', // Reemplazar
        // Rutas a logos para modo oscuro y claro
        LOGO_VELER_DARK: 'assets/img/VELER_DARK.png',
        LOGO_VELER_LIGHT: 'assets/img/VELER_LIGHT.png',
        LOGO_GNP_DARK: 'assets/img/GNP_DARK.png', // Si se usa en splash
        LOGO_GNP_LIGHT: 'assets/img/GNP_LIGHT.png', // Si se usa en splash
        THEME_STORAGE_KEY: 'theme',
        MOBILE_BREAKPOINT: 767,
    };

    // --- Selección de Elementos DOM ---
    const $html = document.documentElement;
    const $body = document.body;
    const $splashScreen = document.getElementById('splash-screen');
    const $mainHeader = document.getElementById('main-header');
    const $formularioCompleto = document.getElementById('formulario-completo'); // Ahora es <main>
    const $form = document.getElementById('miFormularioDinamico');
    const $modalOverlay = document.getElementById('modal-overlay');
    const $modalContainer = document.getElementById('modal-container');
    const $modalErrorIcon = document.getElementById('modal-error-icon');
    const $modalSuccessLogo = document.getElementById('modal-success-logo');
    const $modalTitle = document.getElementById('modal-title');
    const $modalMessage = document.getElementById('modal-message');
    const $modalCloseBtn = document.getElementById('modal-close-btn');
    const $modalOkBtn = document.getElementById('modal-ok-btn');
    const $themeSwitch = document.getElementById('theme-checkbox');
    const $sidebar = document.getElementById('sidebar-navegacion');
    const $sidebarToggle = $sidebar ? $sidebar.querySelector('.sidebar-toggle') : null; // Botón ahora dentro del sidebar
    const $sidebarMenuItems = $sidebar ? Array.from($sidebar.querySelectorAll('.menu-item')) : [];
    const $progressBarFill = $sidebar ? $sidebar.querySelector('.progress-fill') : null;
    const $progressText = $sidebar ? $sidebar.querySelector('.progress-text') : null;

    // Logos
    const $logoVelerSidebar = document.getElementById('logo-veler-sidebar'); // Logo en el sidebar
    const $logo1Splash = document.getElementById('logo1-splash'); // Logo Veler en splash
    const $logo2Splash = document.getElementById('logo2-splash'); // Logo GNP en splash
    // Ya no hay logos en el header principal

    // Secciones
    const $allSections = $form ? Array.from($form.querySelectorAll('.seccion-formulario')) : [];
    const $seccionRevision = $allSections.find(sec => sec.id === 'seccion-revision');
    const $seccionesNavegables = $allSections.filter(sec => sec.id !== 'seccion-revision');
    const $allFormFields = $form ? Array.from($form.querySelectorAll('input, select, textarea')) : [];

    // --- Estado de la Aplicación ---
    let state = {
        currentSeccionIndex: 0,
        isSidebarExpanded: true,        // Desktop: Inicia expandido
        isSidebarVisibleMobile: false,  // Móvil: Inicia oculto
        lastSubmitButton: null,
        isSubmitting: false,
    };

    // --- Inicialización ---
    function initializeApp() {
        if (!validateEssentialElements()) return;
        initTheme();
        initializeSidebarState(); // Llama ANTES de initAppAnimation si afecta layout inicial
        initFormNavigation();
        initEventListeners();
        initAppAnimation(); // Muestra contenido después de configurar estado inicial
    }

    function validateEssentialElements() {
        const essential = { $form, $formularioCompleto, $sidebar, $sidebarToggle, $themeSwitch, $mainHeader };
         let allPresent = true;
        for (const key in essential) {
            if (!essential[key]) {
                console.error(`Error Init: Elemento ${key.replace('$', '')} no encontrado.`);
                allPresent = false;
                // Puedes decidir si alguno es crítico para detener la app
            }
        }
        if ($seccionesNavegables.length === 0 && $form) {
             console.warn("Warning Init: No se encontraron secciones navegables.");
        }
        return allPresent;
    }

    // --- Animación Inicial ---
    function initAppAnimation() {
        // Si NO usas splash screen, simplemente muestra los elementos directamente
        if ($splashScreen) {
            $splashScreen.style.opacity = '1';
            $splashScreen.style.pointerEvents = 'auto';

            setTimeout(() => {
                $splashScreen.style.opacity = '0';
                $splashScreen.style.pointerEvents = 'none';
                setTimeout(() => {
                    $splashScreen.style.display = 'none';
                    revealMainContent();
                }, CONFIG.SPLASH_FADE_DURATION);
            }, CONFIG.SPLASH_DISPLAY_DURATION);
        } else {
            // Si no hay splash, muestra directamente
            revealMainContent();
        }
    }

    function revealMainContent() {
         if($mainHeader) $mainHeader.style.display = 'flex'; // Asegura visibilidad header
         if($sidebar) $sidebar.style.display = 'flex'; // Asegura visibilidad sidebar
         if($formularioCompleto) $formularioCompleto.style.display = 'block'; // Muestra área de form

         if ($seccionesNavegables.length > 0) {
            showSection(0);
            actualizarProgreso();
         }
    }

    // --- Manejo de Tema ---
    function initTheme() {
        const savedTheme = localStorage.getItem(CONFIG.THEME_STORAGE_KEY) || 'dark'; // 'dark' por defecto
        applyTheme(savedTheme);
        if ($themeSwitch) $themeSwitch.checked = (savedTheme === 'light'); // Ajusta el switch
    }

    function applyTheme(theme) {
        const isLightTheme = theme === 'light';
        $html.classList.toggle('light-theme', isLightTheme);
        // No es necesario actualizar el switch aquí, se hace en initTheme y handleThemeSwitchChange

        // Actualiza logos (Sidebar y Splash)
        if ($logoVelerSidebar) {
            $logoVelerSidebar.src = isLightTheme ? CONFIG.LOGO_VELER_LIGHT : CONFIG.LOGO_VELER_DARK;
        }
        if ($logo1Splash) { // Veler en splash
             $logo1Splash.src = isLightTheme ? CONFIG.LOGO_VELER_LIGHT : CONFIG.LOGO_VELER_DARK;
        }
        if ($logo2Splash) { // GNP en splash
            $logo2Splash.src = isLightTheme ? CONFIG.LOGO_GNP_LIGHT : CONFIG.LOGO_GNP_DARK;
        }
    }

    function handleThemeSwitchChange() {
        const currentTheme = this.checked ? 'light' : 'dark';
        applyTheme(currentTheme);
        localStorage.setItem(CONFIG.THEME_STORAGE_KEY, currentTheme);
    }

    // --- Manejo del Sidebar ---
    function initializeSidebarState() {
        const isMobile = window.innerWidth <= CONFIG.MOBILE_BREAKPOINT;

        if (isMobile) {
            // En móvil, el sidebar podría empezar oculto y deslizarse
            // (requiere lógica/estilos de _responsive.css que no hemos revisado aquí)
            // Por ahora, aplicamos estado colapsado por defecto en móvil
            $body.classList.remove('body-sidebar-expanded', 'sidebar-visible');
            $body.classList.add('body-sidebar-collapsed'); // O una clase específica móvil
            state.isSidebarExpanded = false; // Representa estado lógico
            state.isSidebarVisibleMobile = false; // Para controlar visibilidad en móvil
        } else {
            // En desktop, mantener el estado guardado o iniciar expandido
             const startExpanded = state.isSidebarExpanded; // Podría leerse de localStorage si se guarda
             $body.classList.toggle('body-sidebar-expanded', startExpanded);
             $body.classList.toggle('body-sidebar-collapsed', !startExpanded);
             $body.classList.remove('sidebar-visible');
             state.isSidebarExpanded = startExpanded;
             state.isSidebarVisibleMobile = false;
        }
        updateSidebarToggleButton();
    }

    function toggleSidebar() {
        const isMobile = window.innerWidth <= CONFIG.MOBILE_BREAKPOINT;

        if (isMobile) {
            // Lógica para mostrar/ocultar en móvil (ej. toggle 'sidebar-visible')
             state.isSidebarVisibleMobile = !state.isSidebarVisibleMobile;
             $body.classList.toggle('sidebar-visible', state.isSidebarVisibleMobile);
             // Asegurar que clases desktop no interfieran
             $body.classList.remove('body-sidebar-expanded', 'body-sidebar-collapsed');
        } else {
            // Lógica para expandir/colapsar en desktop
            state.isSidebarExpanded = !state.isSidebarExpanded;
            $body.classList.toggle('body-sidebar-expanded', state.isSidebarExpanded);
            $body.classList.toggle('body-sidebar-collapsed', !state.isSidebarExpanded);
             // Asegurar que clase móvil se quite
             $body.classList.remove('sidebar-visible');
        }
        updateSidebarToggleButton();
    }

    function updateSidebarToggleButton() {
        if (!$sidebarToggle) return;
        const isMobile = window.innerWidth <= CONFIG.MOBILE_BREAKPOINT;

        // SOLO actualiza icono y título
        if (isMobile) {
            // Ajustar según cómo funcione la visibilidad en móvil
             $sidebarToggle.textContent = state.isSidebarVisibleMobile ? 'close' : 'menu';
             $sidebarToggle.title = state.isSidebarVisibleMobile ? 'Ocultar menú' : 'Mostrar menú';
        } else {
             // Icono para desktop: menu_open cuando expandido, menu cuando colapsado
            $sidebarToggle.textContent = state.isSidebarExpanded ? 'menu_open' : 'menu';
            $sidebarToggle.title = state.isSidebarExpanded ? 'Contraer menú' : 'Expandir menú';
        }
         // NO debe haber código aquí cambiando style.left/top del toggle
    }

    function handleResize() {
        // Reajustar estado si es necesario al cambiar entre móvil/desktop
        initializeSidebarState();
    }

    // --- Navegación del Formulario ---
    // (showSection, fadeOutSection, fadeInSection, updateActiveMenuItem, handleFormButtonClick, handleMenuItemClick - Sin cambios necesarios en su lógica principal)
    function initFormNavigation() { $sidebarMenuItems.forEach(item => item.addEventListener('click', handleMenuItemClick)); }
    function isValidSectionIndex(index) { /*...*/ return index >= 0 && index < $seccionesNavegables.length; }
    function showSection(indexToShow) { if (!isValidSectionIndex(indexToShow)) return; const $currentActive = $form.querySelector('.seccion-formulario.seccion-activa'); const $nextSection = $seccionesNavegables[indexToShow]; if ($currentActive !== $nextSection) { if ($currentActive) { fadeOutSection($currentActive, () => fadeInSection($nextSection, indexToShow)); } else { fadeInSection($nextSection, indexToShow); } } state.currentSeccionIndex = indexToShow; }
    function fadeOutSection($section, callback) { $section.style.opacity = '0'; setTimeout(() => { $section.classList.remove('seccion-activa'); $section.style.display = 'none'; if (callback) callback(); }, CONFIG.FADE_DURATION); }
    function fadeInSection($section, index) { $section.style.display = 'block'; setTimeout(() => { $section.style.opacity = '1'; $section.classList.add('seccion-activa'); updateActiveMenuItem(index); window.scrollTo(0, 0); }, 50); } // Pequeño delay para asegurar display block
    function updateActiveMenuItem(activeIndex) { const activeSectionId = $seccionesNavegables[activeIndex]?.id; $sidebarMenuItems.forEach(item => item.classList.toggle('active', item.getAttribute('data-section') === activeSectionId)); }
    function handleFormButtonClick(event) { const $button = event.target.closest('button'); if (!$button) return; if ($button.classList.contains('btn-siguiente')) { if ($button.classList.contains('btn-final')) { showReviewMode(); } else if (state.currentSeccionIndex < $seccionesNavegables.length - 1) { showSection(state.currentSeccionIndex + 1); } } else if ($button.classList.contains('btn-anterior')) { if ($button.classList.contains('btn-volver-a-editar')) { hideReviewMode(); } else if (state.currentSeccionIndex > 0) { showSection(state.currentSeccionIndex - 1); } } else if ($button.type === 'submit' && $button.closest('#seccion-revision')) { handleSubmitButtonClick($button, event); } }
    function handleMenuItemClick(event) { const sectionId = event.currentTarget.getAttribute('data-section'); const targetIndex = $seccionesNavegables.findIndex(sec => sec.id === sectionId); if (targetIndex !== -1) { showSection(targetIndex); const isMobile = window.innerWidth <= CONFIG.MOBILE_BREAKPOINT; if (isMobile && $body.classList.contains('sidebar-visible')) { toggleSidebar(); } } else { console.warn(`Warning Nav Sidebar: Sección ID ${sectionId} no encontrada.`); } }

    // --- Modo Revisión ---
    // (showReviewMode, hideReviewMode, generateFinalSummary, isValidInputValue, getLabelText - Sin cambios necesarios en su lógica principal)
    function showReviewMode() { console.log("Entrando a modo revisión..."); const $currentActive = $form.querySelector('.seccion-formulario.seccion-activa'); const enterReview = () => { $formularioCompleto.classList.add('modo-revision'); if ($seccionRevision) { $seccionRevision.style.display = 'block'; setTimeout(() => { $seccionRevision.style.opacity = '1'; $seccionRevision.classList.add('seccion-activa'); }, 50); generateFinalSummary(); } else { console.error("Error Revisión: #seccion-revision no encontrada."); } $seccionesNavegables.forEach(sec => { sec.style.display = 'block'; sec.style.opacity = '1'; }); updateActiveMenuItem(-1); window.scrollTo(0, 0); }; if ($currentActive && $currentActive !== $seccionRevision) { fadeOutSection($currentActive, enterReview); } else { enterReview(); } }
    function hideReviewMode() { console.log("Saliendo de modo revisión..."); $formularioCompleto.classList.remove('modo-revision'); $seccionesNavegables.forEach(sec => { sec.style.opacity = '0'; sec.style.display = 'none'; }); if ($seccionRevision) { fadeOutSection($seccionRevision, () => { showSection(state.currentSeccionIndex); }); } else { showSection(state.currentSeccionIndex); } }
    function generateFinalSummary() { /* ... (código sin cambios) ... */ }
    function isValidInputValue(value) { return value !== null && value !== undefined && String(value).trim() !== ''; }
    function getLabelText($form, key, getFullContent = false) { /* ... (código sin cambios) ... */ }


    // --- Seguimiento de Progreso ---
    // (actualizarProgreso - Sin cambios necesarios)
    function actualizarProgreso() { if (!$progressBarFill || !$progressText) return; let totalCamposValidos = 0; let camposCompletadosValidos = 0; $seccionesNavegables.forEach((section) => { let sectionIsComplete = true; let sectionHasFields = false; const inputsInSection = section.querySelectorAll('.form-group [name]'); inputsInSection.forEach(input => { if (input.offsetParent !== null && !input.disabled) { sectionHasFields = true; totalCamposValidos++; if (input.checkValidity()) { camposCompletadosValidos++; } else { sectionIsComplete = false; } } }); const menuItem = $sidebarMenuItems.find(item => item.getAttribute('data-section') === section.id); if (menuItem) { menuItem.classList.toggle('completed', sectionHasFields && sectionIsComplete); } }); const porcentaje = totalCamposValidos > 0 ? Math.round((camposCompletadosValidos / totalCamposValidos) * 100) : 0; $progressBarFill.style.width = `${porcentaje}%`; $progressText.textContent = `${porcentaje}% completado`; }

    // --- Manejo de Modales ---
    // (showModal, hideModal - Sin cambios necesarios)
    function showModal(type, message = '') { /* ... (código sin cambios) ... */ }
    function hideModal() { /* ... (código sin cambios) ... */ }

    // --- Envío de Formulario ---
    // (handleSubmitButtonClick, sendFormData - Sin cambios necesarios)
     function handleSubmitButtonClick($button, event) { /* ... (código sin cambios) ... */ }
     async function sendFormData(formData) { /* ... (código sin cambios) ... */ }

    // --- Asignación de Event Listeners ---
    function initEventListeners() {
        if ($themeSwitch) $themeSwitch.addEventListener('change', handleThemeSwitchChange);
        if ($sidebarToggle) $sidebarToggle.addEventListener('click', toggleSidebar);
        window.addEventListener('resize', handleResize);
        if ($form) $form.addEventListener('click', handleFormButtonClick);
        if ($modalOverlay) $modalOverlay.addEventListener('click', hideModal);
        if ($modalCloseBtn) $modalCloseBtn.addEventListener('click', hideModal);
        if ($modalOkBtn) $modalOkBtn.addEventListener('click', hideModal);

        $allFormFields.forEach(field => {
            field.addEventListener('input', actualizarProgreso);
            field.addEventListener('change', actualizarProgreso);
        });

        // --- Lógica de Visibilidad Condicional (Moverla aquí desde inline es más limpio) ---
        // Ejemplo Contratante:
        const radioContratanteIgual = $form?.querySelectorAll('input[name="con_igual_titular"]');
        const datosContratanteDiferente = document.getElementById('datos-contratante-diferente');
        if (radioContratanteIgual?.length > 0 && datosContratanteDiferente) {
             const toggleContratante = () => { const sel = $form.querySelector('input[name="con_igual_titular"]:checked'); datosContratanteDiferente.style.display = (sel?.value === 'no') ? 'block' : 'none'; actualizarProgreso(); };
             radioContratanteIgual.forEach(radio => radio.addEventListener('change', toggleContratante));
             toggleContratante(); // Estado inicial
        }
         // Ejemplo Tarjetahabiente:
        const $checkTitularIgual = document.getElementById('pago_titular_igual_contratante');
        const $datosTarjetaHabienteDiferente = document.getElementById('datos-tarjetahabiente-diferente');
         if ($checkTitularIgual && $datosTarjetaHabienteDiferente) {
             const toggleTarjeta = () => { $datosTarjetaHabienteDiferente.style.display = $checkTitularIgual.checked ? 'none' : 'block'; actualizarProgreso(); };
             $checkTitularIgual.addEventListener('change', toggleTarjeta);
             toggleTarjeta(); // Estado inicial
        }
         // Ejemplo Pregunta Embarazo:
         const $generoSelect = document.getElementById('sol_genero');
         const $preguntaEmbarazoDiv = document.getElementById('pregunta-embarazo');
         if ($generoSelect && $preguntaEmbarazoDiv) {
             const toggleEmbarazo = () => { const esMasculino = $generoSelect.value === 'M'; $preguntaEmbarazoDiv.style.display = esMasculino ? 'none' : 'block'; if (esMasculino) { const naRadio = $preguntaEmbarazoDiv.querySelector('input[name="hab_embarazada"][value="na"]'); if (naRadio) naRadio.checked = true; } actualizarProgreso(); };
             $generoSelect.addEventListener('change', toggleEmbarazo);
             toggleEmbarazo(); // Estado inicial
        }
    }

    // --- Iniciar la aplicación ---
    initializeApp();

}); // Fin DOMContentLoaded