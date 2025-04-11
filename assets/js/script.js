document.addEventListener('DOMContentLoaded', () => {
    // --- Elementos del DOM ---
    const $splashScreen = document.getElementById('splash-screen'); // Splash
    const $mainHeader = document.getElementById('main-header');     // Cabecera final
    const $formularioCompletoDiv = document.getElementById('formulario-completo');
    const $form = document.getElementById('miFormularioDinamico');
    const $secciones = Array.from($form.querySelectorAll('.seccion-formulario'));
    const $seccionRevision = document.getElementById('seccion-revision');
    const $seccionesNavegables = $secciones.filter(sec => sec.id !== 'seccion-revision');
    const $modalOverlay = document.getElementById('modal-overlay');
    const $modalContainer = document.getElementById('modal-container');
    const $modalErrorIcon = document.getElementById('modal-error-icon');
    const $modalSuccessLogo = document.getElementById('modal-success-logo'); // Considera si este también debe cambiar
    const $modalTitle = document.getElementById('modal-title');
    const $modalMessage = document.getElementById('modal-message');
    const $modalCloseBtn = document.getElementById('modal-close-btn');
    const $modalOkBtn = document.getElementById('modal-ok-btn');
    const $themeSwitch = document.getElementById('theme-checkbox');
    let lastSubmitButton = null;
  
    // --- Referencias a los logos ---
    const $logo1Splash = document.getElementById('logo1-splash');
    const $logo2Splash = document.getElementById('logo2-splash');
    const $logo1Header = document.getElementById('logo1-header');
    const $logo2Header = document.getElementById('logo2-header');
    // Podrías añadir $modalSuccessLogo aquí si también cambia con el tema
  
    // --- Rutas de los logos (ACTUALIZADAS) ---
    const LOGO1_DARK_SRC = 'assets/img/VELER_DARK.png';
    const LOGO2_DARK_SRC = 'assets/img/GNP_DARK.png';
    const LOGO1_LIGHT_SRC = 'assets/img/VELER_LIGHT.png';
    const LOGO2_LIGHT_SRC = 'assets/img/GNP_LIGHT.png';
    // const MODAL_LOGO_DARK_SRC = 'assets/img/V_icon.png'; // Mantén o actualiza si es necesario
    // const MODAL_LOGO_LIGHT_SRC = 'assets/img/V_icon_light.png'; // Ejemplo si el logo del modal cambiara
  
    // --- Variables de Estado ---
    let currentSeccionIndex = 0;
    const FADE_DURATION = 400; // Duración fade secciones formulario
    const SPLASH_DISPLAY_DURATION = 1500; // Tiempo que el logo es visible (ms)
    const SPLASH_FADE_DURATION = 500;   // Tiempo del fade out del splash (ms) - Debe coincidir con CSS transition
  
    // --- Inicialización ---
    initAppAnimation(); // Inicia la nueva secuencia de animación
    initTheme(); // Inicializa el tema (y ahora también los logos)
  
    // --- Listeners ---
    if ($form) $form.addEventListener('click', handleFormClick);
    if ($modalOverlay) $modalOverlay.addEventListener('click', hideModal);
    if ($modalCloseBtn) $modalCloseBtn.addEventListener('click', hideModal);
    if ($modalOkBtn) $modalOkBtn.addEventListener('click', hideModal);
  
    // --- Función de Animación Inicial (sin cambios aquí) ---
    function initAppAnimation() {
        if (!$splashScreen || !$mainHeader || !$formularioCompletoDiv) {
            console.error("Error: Faltan elementos esenciales (splash, header o form)");
            // Mostrar contenido directamente si falta el splash
            if ($mainHeader) $mainHeader.style.display = 'flex'; // Usa 'flex' porque así está en el CSS
            if ($formularioCompletoDiv) $formularioCompletoDiv.style.display = 'block';
             showSection(0);
            return;
        }
  
        // 1. Fade In Splash Screen
        setTimeout(() => { // Pequeño delay para asegurar que la transición se aplique
             $splashScreen.style.opacity = '1';
             $splashScreen.style.pointerEvents = 'auto'; // Permite interacción si la hubiera
        }, 100); // 100ms delay
  
        // 2. Esperar mientras el splash es visible
        setTimeout(() => {
            // 3. Fade Out Splash Screen
            $splashScreen.style.opacity = '0';
            $splashScreen.style.pointerEvents = 'none'; // Deshabilita interacción
  
            // 4. Esperar que termine el fade out
            setTimeout(() => {
                // 5. Ocultar Splash y Mostrar Contenido Principal
                $splashScreen.style.display = 'none'; // Oculta splash completamente
                $mainHeader.style.display = 'flex'; // Muestra cabecera (usa flex)
                $formularioCompletoDiv.style.display = 'block'; // Muestra form
                showSection(0); // Muestra la primera sección del formulario
  
            }, SPLASH_FADE_DURATION); // Espera la duración del fade out
  
        }, SPLASH_DISPLAY_DURATION); // Espera la duración de visualización
    }
  
  
    // --- Funciones de Tema (MODIFICADA) ---
    function initTheme() {
        const savedTheme = localStorage.getItem('theme') || 'dark';
        applyTheme(savedTheme); // Llama a applyTheme que ahora actualiza logos
        if ($themeSwitch) {
            $themeSwitch.addEventListener('change', handleThemeSwitchChange);
        } else {
            console.warn("Elemento #theme-checkbox no encontrado.");
        }
    }
  
    // ¡¡FUNCIÓN MODIFICADA!!
    function applyTheme(theme) {
        const isLightTheme = theme === 'light';
  
        // Aplica la clase al HTML para los estilos CSS
        document.documentElement.classList.toggle('light-theme', isLightTheme);
        if ($themeSwitch) $themeSwitch.checked = isLightTheme;
  
        // Actualiza los logos
        if ($logo1Splash && $logo2Splash && $logo1Header && $logo2Header) {
            $logo1Splash.src = isLightTheme ? LOGO1_LIGHT_SRC : LOGO1_DARK_SRC;
            $logo2Splash.src = isLightTheme ? LOGO2_LIGHT_SRC : LOGO2_DARK_SRC;
            $logo1Header.src = isLightTheme ? LOGO1_LIGHT_SRC : LOGO1_DARK_SRC;
            $logo2Header.src = isLightTheme ? LOGO2_LIGHT_SRC : LOGO2_DARK_SRC;
  
            // Opcional: Actualizar logo del modal si es necesario
            // if ($modalSuccessLogo) {
            //   $modalSuccessLogo.src = isLightTheme ? MODAL_LOGO_LIGHT_SRC : MODAL_LOGO_DARK_SRC;
            // }
  
        } else {
            console.error("Uno o más elementos de logo no fueron encontrados.");
        }
    }
  
    function handleThemeSwitchChange() {
        const currentTheme = this.checked ? 'light' : 'dark';
        applyTheme(currentTheme);
        localStorage.setItem('theme', currentTheme);
    }
  
    // --- Funciones de Navegación del Formulario (sin cambios) ---
    function showSection(indexToShow) {
        if (!isValidSectionIndex(indexToShow)) return;
        const $currentActive = $form.querySelector('.seccion-formulario.seccion-activa');
        const $nextSection = $seccionesNavegables[indexToShow];
        if ($currentActive) {
            fadeOutSection($currentActive, $nextSection, () => fadeInSection($nextSection));
        } else {
            fadeInSection($nextSection);
        }
        currentSeccionIndex = indexToShow;
    }
    function isValidSectionIndex(index) {
        if (index < 0 || index >= $seccionesNavegables.length) {
            console.error("Índice de sección fuera de rango:", index);
            return false;
        }
        return true;
    }
    function fadeOutSection($section, $nextSection, callback) {
        $section.classList.remove('seccion-activa');
        setTimeout(() => {
            if ($section !== $nextSection) {
                 $section.style.display = 'none';
            }
            if (callback) callback();
        }, FADE_DURATION);
    }
    function fadeInSection($section) {
        if ($section) {
            $section.style.display = 'block';
            setTimeout(() => $section.classList.add('seccion-activa'), 10);
        }
    }
    function showReviewMode() {
        console.log("Entrando en modo revisión...");
        const $currentActive = $form.querySelector('.seccion-formulario.seccion-activa');
        const enterReview = () => {
            $formularioCompletoDiv.classList.add('modo-revision');
            if ($seccionRevision) $seccionRevision.style.display = 'block';
            generateFinalSummary();
            window.scrollTo(0, 0);
        };
        if ($currentActive) {
            fadeOutSection($currentActive, $seccionRevision, enterReview);
        } else {
            enterReview();
        }
    }
    function hideReviewMode() {
        console.log("Saliendo de modo revisión...");
        $formularioCompletoDiv.classList.remove('modo-revision');
        if ($seccionRevision) $seccionRevision.style.display = 'none';
        showSection(currentSeccionIndex);
    }
  
    // --- Funciones de Resumen ---
     function generateFinalSummary() {
        const $resumenDiv = document.getElementById('resumen-final');
        if (!$resumenDiv) {
             console.error("Elemento #resumen-final no encontrado");
             return;
        }
        $resumenDiv.innerHTML = '';
        const formData = new FormData($form);
        let resumenHTML = '<ul>';
        $seccionesNavegables.forEach(section => {
            section.querySelectorAll('.form-group [name]').forEach(inputElement => {
                const key = inputElement.name;
                const value = formData.get(key);
                const allValues = formData.getAll(key);
                let displayValue = null;
                let labelText = getLabelText($form, key) || key;
                if (inputElement.type === 'checkbox') {
                    if (inputElement.checked) { displayValue = 'Sí'; } else { displayValue = null; }
                } else if (inputElement.type === 'radio') {
                     if (inputElement.checked) { displayValue = value; } else { displayValue = null; }
                } else if (inputElement.tagName === 'SELECT' && value) {
                    const selectedOption = inputElement.querySelector(`option[value="${value}"]`);
                    displayValue = selectedOption ? selectedOption.textContent : value;
                } else if (inputElement.type === 'file' && value instanceof File && value.size > 0) {
                    displayValue = `${value.name} (${(value.size / 1024).toFixed(1)} KB)`;
                } else if (isValidInputValue(value)) {
                    displayValue = value;
                }
                const alreadyAdded = resumenHTML.includes(`<strong>${labelText}:</strong>`);
                if (displayValue !== null && !(inputElement.type === 'radio' && alreadyAdded)) {
                    resumenHTML += `<li><strong>${labelText}:</strong> ${displayValue}</li>`;
                }
            });
        });
        resumenHTML += '</ul>';
        $resumenDiv.innerHTML = resumenHTML;
    }
    function isValidInputValue(value) {
        return value && typeof value === 'string' && value.trim() !== '';
    }
     function getLabelText($form, key) {
        const $inputElement = $form.querySelector(`[name="${key}"]`);
        if (!$inputElement) return null;
        let $labelElement = document.querySelector(`label[for="${$inputElement.id}"]`);
        if (!$labelElement) {
             $labelElement = $inputElement.closest('.form-group')?.querySelector('label');
        }
        if (!$labelElement) return null;
        const cleanLabel = $labelElement.cloneNode(true);
        cleanLabel.querySelectorAll('input, select, textarea, button').forEach($el => $el.remove());
        return cleanLabel.textContent.trim().replace(':', '');
    }
  
  
    // --- Funciones de Manejo de Modales ---
    function showModal(type, message = '') {
        if (!$modalContainer || !$modalOverlay) {
            console.error("Elementos del modal no encontrados!");
            return;
        }
        if (type === 'success') {
            $modalTitle.textContent = '¡Éxito!';
            $modalMessage.textContent = message || 'Tus datos han sido enviados correctamente. ¡Gracias por tu participación!';
            if ($modalErrorIcon) $modalErrorIcon.style.display = 'none';
            if ($modalSuccessLogo) $modalSuccessLogo.style.display = 'inline-block'; // Asegúrate que la ruta sea correcta o actualízala aquí también si es necesario
            if ($modalCloseBtn) $modalCloseBtn.style.display = 'none';
            if ($modalOkBtn) $modalOkBtn.style.display = 'inline-block';
        } else {
            $modalTitle.textContent = 'Error';
            if ($modalErrorIcon) {
                 $modalErrorIcon.textContent = 'error';
                 $modalErrorIcon.style.display = 'inline-block';
            }
            if ($modalSuccessLogo) $modalSuccessLogo.style.display = 'none';
            $modalMessage.textContent = message || 'Hubo un problema. Por favor, revisa la información o inténtalo más tarde.';
            if ($modalCloseBtn) $modalCloseBtn.style.display = 'inline-block';
            if ($modalOkBtn) $modalOkBtn.style.display = 'none';
        }
        document.body.classList.add('modal-visible');
    }
    function hideModal() {
        if (!document.body.classList.contains('modal-visible')) return;
        document.body.classList.remove('modal-visible');
        if (lastSubmitButton) {
            lastSubmitButton.disabled = false;
            lastSubmitButton.textContent = 'Enviar Formulario';
            lastSubmitButton = null;
        }
    }
  
    // --- Funciones de Manejo de Eventos ---
    function handleFormClick(event) {
        const $target = event.target.closest('button');
        if (!$target) return;
        if ($target.classList.contains('btn-siguiente')) {
            handleNextButtonClick($target);
        } else if ($target.classList.contains('btn-anterior')) {
            handlePrevButtonClick($target);
        } else if ($target.type === 'submit' && $target.closest('#seccion-revision')) {
            handleSubmitButtonClick($target, event);
        }
    }
    function handleNextButtonClick($target) {
        const esBotonFinalParaRevision = $target.classList.contains('btn-final');
        if (esBotonFinalParaRevision) {
            showReviewMode();
        } else if (currentSeccionIndex < $seccionesNavegables.length - 1) {
            showSection(currentSeccionIndex + 1);
        }
    }
    function handlePrevButtonClick($target) {
        if ($target.classList.contains('btn-volver-a-editar')) {
            hideReviewMode();
        } else if (currentSeccionIndex > 0) {
            showSection(currentSeccionIndex - 1);
        }
    }
    function handleSubmitButtonClick($target, event) {
        event.preventDefault();
        if (!$formularioCompletoDiv.classList.contains('modo-revision')) {
            console.warn("Intento de envío fuera del modo revisión.");
            showModal('error', 'El formulario no está en modo revisión. Por favor, completa los pasos.');
            return;
        }
        const formData = new FormData($form);
        console.log("Datos recolectados para enviar:", Object.fromEntries(formData));
        $target.disabled = true;
        $target.textContent = 'Enviando...';
        lastSubmitButton = $target;
        sendFormData(formData);
    }
    function sendFormData(formData) {
        const endpointURL = '/tu-endpoint-real-en-el-servidor'; // <<< CAMBIA ESTO
        fetch(endpointURL, {
            method: 'POST',
            body: formData
        })
        .then(async response => {
            if (!response.ok) {
                let errorText = `Error ${response.status}: ${response.statusText}`;
                try { const errorData = await response.json(); errorText = errorData.message || JSON.stringify(errorData); }
                catch (e) { try { errorText = await response.text(); } catch (e2) {} }
                throw new Error(errorText);
            }
            const contentType = response.headers.get("content-type");
            if (contentType && contentType.includes("application/json")) { return response.json(); }
            else { return response.text(); }
        })
        .then(data => {
            console.log('Éxito:', data);
            const successMessage = (typeof data === 'object' && data?.message) ? data.message : '';
            showModal('success', successMessage);
        })
        .catch(error => {
            console.error('Error en fetch:', error);
            showModal('error', error.message);
        });
    }
  
  }); // Fin del DOMContentLoaded