document.addEventListener('DOMContentLoaded', () => {
    // --- Elementos del DOM ---
    const $splashScreen = document.getElementById('splash-screen');
    const $mainHeader = document.getElementById('main-header');
    const $formularioCompletoDiv = document.getElementById('formulario-completo');
    const $form = document.getElementById('miFormularioDinamico');
    const $secciones = Array.from($form.querySelectorAll('.seccion-formulario'));
    const $seccionRevision = document.getElementById('seccion-revision');
    // Asegúrate que $seccionesNavegables esté definido correctamente aquí
    const $seccionesNavegables = $secciones.filter(sec => sec.id !== 'seccion-revision');
    const $modalOverlay = document.getElementById('modal-overlay');
    const $modalContainer = document.getElementById('modal-container');
    const $modalErrorIcon = document.getElementById('modal-error-icon');
    const $modalSuccessLogo = document.getElementById('modal-success-logo');
    const $modalTitle = document.getElementById('modal-title');
    const $modalMessage = document.getElementById('modal-message');
    const $modalCloseBtn = document.getElementById('modal-close-btn');
    const $modalOkBtn = document.getElementById('modal-ok-btn');
    const $themeSwitch = document.getElementById('theme-checkbox');
    const $sidebar = document.getElementById('sidebar-navegacion'); // <<< NUEVO: Sidebar element

    // --- Referencias a los logos ---
    const $logo1Splash = document.getElementById('logo1-splash');
    const $logo2Splash = document.getElementById('logo2-splash');
    const $logo1Header = document.getElementById('logo1-header');
    const $logo2Header = document.getElementById('logo2-header');

    // --- Rutas de los logos ---
    const LOGO1_DARK_SRC = 'assets/img/VELER_DARK.png';
    const LOGO2_DARK_SRC = 'assets/img/GNP_DARK.png';
    const LOGO1_LIGHT_SRC = 'assets/img/VELER_LIGHT.png';
    const LOGO2_LIGHT_SRC = 'assets/img/GNP_LIGHT.png';

    // --- Variables de Estado ---
    let currentSeccionIndex = 0;
    const FADE_DURATION = 400; // Duración fade secciones formulario
    const SPLASH_DISPLAY_DURATION = 1500; // Tiempo splash visible
    const SPLASH_FADE_DURATION = 500; // Tiempo fade out splash
    let lastSubmitButton = null;

    // --- Botón Toggle Sidebar (Encuentra o Crea) ---
    let $sidebarToggle = document.querySelector('.sidebar-toggle');
    if (!$sidebarToggle) {
        console.log("Creando botón de toggle del sidebar dinámicamente.");
        $sidebarToggle = document.createElement('button');
        $sidebarToggle.className = 'sidebar-toggle material-symbols-outlined';
        // Icono y título inicial se establecen en initializeSidebarState
        document.body.appendChild($sidebarToggle);
    }

    // --- Inicialización ---
    initAppAnimation(); // Animación inicial (splash, header)
    initTheme();        // Tema claro/oscuro
    initializeSidebarState(); // <<< NUEVO: Establecer estado inicial del sidebar
    // Llamada inicial segura a actualizarProgreso
    if (typeof actualizarProgreso === 'function') {
         actualizarProgreso();
    } else {
         console.error("La función actualizarProgreso no está definida al inicializar.");
    }

    // --- Listeners ---
    if ($sidebarToggle) {
        $sidebarToggle.addEventListener('click', toggleSidebar); // Asignar listener
    } else {
        console.error("El botón .sidebar-toggle no se encontró ni se pudo crear.");
    }
    window.addEventListener('resize', handleResize); // <<< NUEVO: Listener para redimensionar

    // Listeners existentes
    if ($form) $form.addEventListener('click', handleFormClick);
    if ($modalOverlay) $modalOverlay.addEventListener('click', hideModal);
    if ($modalCloseBtn) $modalCloseBtn.addEventListener('click', hideModal);
    if ($modalOkBtn) $modalOkBtn.addEventListener('click', hideModal);
    if ($themeSwitch) {
        $themeSwitch.addEventListener('change', handleThemeSwitchChange);
    } else {
        console.warn("Elemento #theme-checkbox no encontrado.");
    }

    // --- NUEVA Función: Establecer Estado Inicial Sidebar ---
    function initializeSidebarState() {
        if (!$sidebarToggle) return; // Salir si no hay botón

        if (window.innerWidth <= 767) {
            // MÓVIL: Oculto por defecto, remover clases de desktop
            document.body.classList.remove('body-sidebar-expanded', 'body-sidebar-collapsed', 'sidebar-visible');
            $sidebarToggle.textContent = 'menu'; // Icono para mostrar
            $sidebarToggle.title = 'Mostrar menú de navegación';
        } else {
            // DESKTOP: Expandido por defecto (o según preferencia guardada si la hubiera)
            // Por ahora, empieza expandido
            document.body.classList.add('body-sidebar-expanded');
            document.body.classList.remove('body-sidebar-collapsed', 'sidebar-visible');
            $sidebarToggle.textContent = 'menu'; // Icono para contraer
            $sidebarToggle.title = 'Contraer menú';
        }
    }

    // --- NUEVA Función: Manejar Redimensionamiento ---
    function handleResize() {
        // Re-inicializa el estado para aplicar clases correctas según tamaño
        initializeSidebarState();
    }

    // --- NUEVA/MODIFICADA Función: Alternar Sidebar ---
    function toggleSidebar() {
        if (!$sidebarToggle) return; // Salir si no hay botón

        if (window.innerWidth <= 767) {
            // Lógica MÓVIL (Mostrar/Ocultar completo)
            document.body.classList.toggle('sidebar-visible');
            const isVisible = document.body.classList.contains('sidebar-visible');
            $sidebarToggle.textContent = isVisible ? 'close' : 'menu';
            $sidebarToggle.title = isVisible ? 'Ocultar menú' : 'Mostrar menú de navegación';
            // Remover clases de desktop por seguridad
            document.body.classList.remove('body-sidebar-expanded', 'body-sidebar-collapsed');
        } else {
            // Lógica DESKTOP (Expandir/Colapsar)
            const isExpanded = document.body.classList.contains('body-sidebar-expanded');
            if (isExpanded) {
                document.body.classList.remove('body-sidebar-expanded');
                document.body.classList.add('body-sidebar-collapsed');
                $sidebarToggle.textContent = 'menu_open'; // Icono para expandir
                $sidebarToggle.title = 'Expandir menú';
            } else {
                document.body.classList.remove('body-sidebar-collapsed');
                document.body.classList.add('body-sidebar-expanded');
                $sidebarToggle.textContent = 'menu'; // Icono para contraer
                $sidebarToggle.title = 'Contraer menú';
            }
            // Remover clase de visibilidad móvil por seguridad
            document.body.classList.remove('sidebar-visible');
        }
    }


    // --- Función de Animación Inicial (Sin cambios) ---
    function initAppAnimation() {
        if (!$splashScreen || !$mainHeader || !$formularioCompletoDiv) {
            console.error("Error: Faltan elementos esenciales (splash, header o form)");
            if ($mainHeader) $mainHeader.style.display = 'flex';
            if ($formularioCompletoDiv) $formularioCompletoDiv.style.display = 'block';
            // Intenta mostrar la primera sección si el formulario existe
             if ($form && $seccionesNavegables.length > 0) {
                showSection(0);
             }
            return;
        }
        setTimeout(() => {
             $splashScreen.style.opacity = '1';
             $splashScreen.style.pointerEvents = 'auto';
        }, 100);
        setTimeout(() => {
            $splashScreen.style.opacity = '0';
            $splashScreen.style.pointerEvents = 'none';
            setTimeout(() => {
                $splashScreen.style.display = 'none';
                $mainHeader.style.display = 'flex';
                $formularioCompletoDiv.style.display = 'block';
                // Muestra la primera sección del formulario
                 if ($seccionesNavegables.length > 0) {
                    showSection(0);
                 }
            }, SPLASH_FADE_DURATION);
        }, SPLASH_DISPLAY_DURATION);
    }

    // --- Funciones de Tema (Sin cambios) ---
    function initTheme() {
        const savedTheme = localStorage.getItem('theme') || 'dark';
        applyTheme(savedTheme);
        // Listener ya asignado arriba
    }
    function applyTheme(theme) {
        const isLightTheme = theme === 'light';
        document.documentElement.classList.toggle('light-theme', isLightTheme);
        if ($themeSwitch) $themeSwitch.checked = isLightTheme;
        if ($logo1Splash && $logo2Splash && $logo1Header && $logo2Header) {
            $logo1Splash.src = isLightTheme ? LOGO1_LIGHT_SRC : LOGO1_DARK_SRC;
            $logo2Splash.src = isLightTheme ? LOGO2_LIGHT_SRC : LOGO2_DARK_SRC;
            $logo1Header.src = isLightTheme ? LOGO1_LIGHT_SRC : LOGO1_DARK_SRC;
            $logo2Header.src = isLightTheme ? LOGO2_LIGHT_SRC : LOGO2_DARK_SRC;
        } else {
            console.error("Uno o más elementos de logo no fueron encontrados.");
        }
    }
    function handleThemeSwitchChange() {
        const currentTheme = this.checked ? 'light' : 'dark';
        applyTheme(currentTheme);
        localStorage.setItem('theme', currentTheme);
    }

    // --- Funciones de Navegación del Formulario ---
    // MODIFICADO: showSection ahora también actualiza el item activo del menú
    function showSection(indexToShow) {
        if (!isValidSectionIndex(indexToShow)) return;

        const $currentActive = $form.querySelector('.seccion-formulario.seccion-activa');
        // Asegúrate que $seccionesNavegables está disponible
        if (!$seccionesNavegables || !$seccionesNavegables[indexToShow]) {
            console.error("Índice o array de secciones navegables inválido en showSection:", indexToShow);
            return;
        }
        const $nextSection = $seccionesNavegables[indexToShow];

        // Lógica de fadeOut/fadeIn
        if ($currentActive && $currentActive !== $nextSection) {
            fadeOutSection($currentActive, () => fadeInSection($nextSection));
        } else if (!$currentActive) {
            fadeInSection($nextSection); // Primera carga
        } else {
            // Ya está activa, no hacer nada o refrescar si es necesario
        }

        currentSeccionIndex = indexToShow; // Actualizar índice global

        // <<< NUEVO: Actualizar item activo en el sidebar >>>
        const menuItems = document.querySelectorAll('#sidebar-navegacion .menu-item');
        menuItems.forEach(item => item.classList.remove('active'));
        // Encuentra el item correspondiente a la sección que se acaba de mostrar
        const activeMenuItem = document.querySelector(`#sidebar-navegacion .menu-item[data-section="${$nextSection.id}"]`);
        if (activeMenuItem) {
            activeMenuItem.classList.add('active');
        }
        // <<< Fin de actualización de item activo >>>
    }

    function isValidSectionIndex(index) {
        // Asegúrate que $seccionesNavegables existe
        if (!$seccionesNavegables) return false;
        const isValid = index >= 0 && index < $seccionesNavegables.length;
        if (!isValid) {
             console.error("Índice de sección fuera de rango:", index);
        }
        return isValid;
    }

    function fadeOutSection($section, callback) {
        $section.classList.remove('seccion-activa');
        // Espera a que termine la animación de fade antes de ocultar con display:none
        setTimeout(() => {
            $section.style.display = 'none';
            if (callback) callback();
        }, FADE_DURATION); // Usar la constante de duración
    }

    function fadeInSection($section) {
        if ($section) {
            $section.style.display = 'block'; // Hacer visible primero
            // Pequeño delay para asegurar que display:block se aplique antes de añadir la clase
            setTimeout(() => {
                $section.classList.add('seccion-activa'); // Iniciar animación de fade in
            }, 10);
        }
    }

    // Funciones showReviewMode, hideReviewMode, generateFinalSummary, isValidInputValue, getLabelText (Sin cambios)
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
            // Desvanecer la sección activa actual antes de mostrar el modo revisión
            fadeOutSection($currentActive, enterReview);
        } else {
            // Si no hay sección activa (raro), entrar directamente
            enterReview();
        }
    }
    function hideReviewMode() {
        console.log("Saliendo de modo revisión...");
        $formularioCompletoDiv.classList.remove('modo-revision');
        if ($seccionRevision) $seccionRevision.style.display = 'none';
        // Volver a mostrar la última sección activa (o la que corresponda)
        showSection(currentSeccionIndex);
    }
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
                // const allValues = formData.getAll(key); // Útil para checkboxes con mismo name
                let displayValue = null;
                let labelText = getLabelText($form, key) || key;
                if (inputElement.type === 'checkbox') {
                    // Mostrar solo si está marcado
                    if (inputElement.checked) {
                        // Si tiene un valor específico, usarlo, sino 'Sí'
                        displayValue = inputElement.value !== 'on' && inputElement.value !== 'true' ? inputElement.value : 'Sí';
                    } else {
                        displayValue = null; // No mostrar si no está marcado
                    }
                } else if (inputElement.type === 'radio') {
                     // Mostrar solo el radio seleccionado
                     if (inputElement.checked) { displayValue = value; } else { displayValue = null; }
                } else if (inputElement.tagName === 'SELECT' && value) {
                    const selectedOption = inputElement.querySelector(`option[value="${value}"]`);
                    displayValue = selectedOption ? selectedOption.textContent : value;
                } else if (inputElement.type === 'file' && value instanceof File && value.size > 0) {
                    displayValue = `${value.name} (${(value.size / 1024).toFixed(1)} KB)`;
                } else if (isValidInputValue(value)) {
                    displayValue = value;
                }

                // Evitar duplicados de radio buttons (solo muestra el seleccionado)
                 const isRadioAndAlreadyAdded = inputElement.type === 'radio' && resumenHTML.includes(`<strong>${labelText}:`);

                if (displayValue !== null && !isRadioAndAlreadyAdded) {
                    resumenHTML += `<li><strong>${labelText}:</strong> ${displayValue}</li>`;
                }
            });
        });
        resumenHTML += '</ul>';
        $resumenDiv.innerHTML = resumenHTML;
    }
    function isValidInputValue(value) {
        // Considera 0 como válido si es numérico, ajusta si es necesario
        return value !== null && value !== undefined && String(value).trim() !== '';
    }
    function getLabelText($form, key) {
        // Intenta encontrar por 'for' o buscando dentro del .form-group
        const $inputElement = $form.querySelector(`[name="${key}"]`);
        if (!$inputElement) return key; // Devuelve la key si no encuentra el input

        let $labelElement = null;
        if ($inputElement.id) {
            $labelElement = document.querySelector(`label[for="${$inputElement.id}"]`);
        }
        if (!$labelElement) {
             $labelElement = $inputElement.closest('.form-group')?.querySelector('label');
        }
        // Caso especial para checkbox/radio donde el input está dentro del label
        if (!$labelElement && ($inputElement.type === 'checkbox' || $inputElement.type === 'radio')) {
            $labelElement = $inputElement.closest('label');
        }

        if (!$labelElement) return key; // Devuelve la key si no encuentra label

        // Limpia el texto del label (quita el input si está dentro)
        const cleanLabel = $labelElement.cloneNode(true);
        cleanLabel.querySelectorAll('input, select, textarea, button, span.required-indicator').forEach($el => $el.remove()); // Remover elementos internos
        return cleanLabel.textContent.trim().replace(':', '');
    }


    // --- Funciones de Manejo de Modales (Sin cambios) ---
    function showModal(type, message = '') {
        if (!$modalContainer || !$modalOverlay) {
            console.error("Elementos del modal no encontrados!");
            return;
        }
        if (type === 'success') {
            $modalTitle.textContent = '¡Éxito!';
            $modalMessage.textContent = message || 'Tus datos han sido enviados correctamente. ¡Gracias por tu participación!';
            if ($modalErrorIcon) $modalErrorIcon.style.display = 'none';
            if ($modalSuccessLogo) $modalSuccessLogo.style.display = 'inline-block';
            if ($modalCloseBtn) $modalCloseBtn.style.display = 'none';
            if ($modalOkBtn) $modalOkBtn.style.display = 'inline-block';
        } else { // 'error' or other types
            $modalTitle.textContent = 'Error';
            if ($modalErrorIcon) {
                 $modalErrorIcon.textContent = 'error'; // Ensure icon name is correct
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
        // Reactivar botón de submit si fue desactivado
        if (lastSubmitButton) {
            lastSubmitButton.disabled = false;
            // Restaurar texto original si es necesario (requiere guardarlo)
            lastSubmitButton.textContent = 'Enviar Formulario'; // O el texto original
            lastSubmitButton = null;
        }
    }

    // --- Funciones de Manejo de Eventos del Formulario (Sin cambios) ---
    function handleFormClick(event) {
        const $target = event.target.closest('button');
        if (!$target) return; // No es un botón o no está dentro de uno

        if ($target.classList.contains('btn-siguiente')) {
            handleNextButtonClick($target);
        } else if ($target.classList.contains('btn-anterior')) {
            handlePrevButtonClick($target);
        } else if ($target.type === 'submit' && $target.closest('#seccion-revision')) {
            // Es el botón final de envío en la sección de revisión
            handleSubmitButtonClick($target, event);
        }
        // Otros tipos de botones dentro del form podrían manejarse aquí
    }
    function handleNextButtonClick($target) {
        // Podrías añadir validación de la sección actual aquí antes de avanzar
        const esBotonFinalParaRevision = $target.classList.contains('btn-final');
        if (esBotonFinalParaRevision) {
            showReviewMode();
        } else if (currentSeccionIndex < $seccionesNavegables.length - 1) {
            showSection(currentSeccionIndex + 1);
        }
    }
    function handlePrevButtonClick($target) {
        if ($target.classList.contains('btn-volver-a-editar')) {
            // Botón específico para salir del modo revisión
            hideReviewMode();
        } else if (currentSeccionIndex > 0) {
            showSection(currentSeccionIndex - 1);
        }
    }
    function handleSubmitButtonClick($target, event) {
        event.preventDefault(); // Evitar envío HTML normal

        // Doble check que estemos en modo revisión
        if (!$formularioCompletoDiv.classList.contains('modo-revision')) {
            console.warn("Intento de envío fuera del modo revisión.");
            showModal('error', 'El formulario no está en modo revisión. Por favor, completa los pasos.');
            return;
        }

        const formData = new FormData($form);
        console.log("Datos recolectados para enviar:", Object.fromEntries(formData.entries())); // Mostrar datos

        // Desactivar botón y mostrar feedback
        $target.disabled = true;
        $target.textContent = 'Enviando...';
        lastSubmitButton = $target; // Guardar referencia para reactivar en hideModal

        // Llamar a la función que envía los datos
        sendFormData(formData);
    }

    // --- Función de Envío de Datos (Sin cambios, ajustar endpoint) ---
    function sendFormData(formData) {
        // <<< ¡¡¡ IMPORTANTE: Cambia esto a tu endpoint real !!! >>>
        const endpointURL = '/tu-endpoint-real-en-el-servidor'; // Ejemplo
        // const endpointURL = 'https://jsonplaceholder.typicode.com/posts'; // Endpoint de prueba

        console.log(`Enviando datos a: ${endpointURL}`);

        fetch(endpointURL, {
            method: 'POST',
            body: formData
            // Podrías necesitar añadir headers aquí si tu API los requiere
            // headers: {
            //   'Content-Type': 'application/json', // ¡Ojo! FormData no suele usar este header
            //   'Authorization': 'Bearer TU_TOKEN_AQUI'
            // },
            // Si necesitas enviar JSON en lugar de FormData:
            // body: JSON.stringify(Object.fromEntries(formData.entries())),
            // headers: { 'Content-Type': 'application/json' }
        })
        .then(async response => {
            // Procesar la respuesta
            const contentType = response.headers.get("content-type");
            let responseData;
            if (contentType && contentType.includes("application/json")) {
                responseData = await response.json();
            } else {
                responseData = await response.text(); // O .blob(), .arrayBuffer() según necesites
            }

            if (!response.ok) {
                // Intentar obtener mensaje de error del cuerpo de la respuesta
                let errorMessage = `Error ${response.status}: ${response.statusText}`;
                if (responseData) {
                     errorMessage = (typeof responseData === 'object' && responseData.message) ? responseData.message : JSON.stringify(responseData);
                }
                // Crear un error para pasar al .catch()
                const error = new Error(errorMessage);
                error.status = response.status;
                error.data = responseData; // Adjuntar datos de respuesta al error
                throw error;
            }

            return responseData; // Pasar datos exitosos al siguiente .then()
        })
        .then(data => {
            console.log('Éxito:', data);
            // Extraer mensaje de éxito si existe
            const successMessage = (typeof data === 'object' && data?.message) ? data.message : 'Formulario enviado con éxito.';
            showModal('success', successMessage);
            // Podrías resetear el formulario aquí si quieres: $form.reset(); initializeSidebarState(); actualizarProgreso(); showSection(0);
        })
        .catch(error => {
            console.error('Error en fetch:', error);
            // Mostrar mensaje de error del objeto Error creado antes
            showModal('error', error.message || 'Ocurrió un error al enviar el formulario.');
             // No reactivar el botón aquí, se hace en hideModal()
        });
    }

    // --- MODIFICADO: Listener para Items del Menú (Lógica Principal) ---
    const menuItems = document.querySelectorAll('#sidebar-navegacion .menu-item');
    menuItems.forEach(item => {
        item.addEventListener('click', () => {
            const sectionId = item.getAttribute('data-section');
            let sectionIndex = -1;

            // Encontrar el índice de la sección basado en su ID
            // Asegúrate que $seccionesNavegables está definido y accesible aquí
            if (!$seccionesNavegables) {
                console.error("$seccionesNavegables no está disponible en el listener del menú.");
                return;
            }
            $seccionesNavegables.forEach((sec, idx) => {
                if (sec.id === sectionId) {
                    sectionIndex = idx;
                }
            });

            if (sectionIndex !== -1) {
                showSection(sectionIndex); // Llama a la función para mostrar la sección por índice
            } else {
                console.warn(`Sección con ID ${sectionId} no encontrada en $seccionesNavegables.`);
            }

            // (La actualización de la clase .active ahora se hace dentro de showSection)

            // Cerrar sidebar en MÓVIL después de seleccionar
            if (window.innerWidth <= 767 && document.body.classList.contains('sidebar-visible')) {
                document.body.classList.remove('sidebar-visible');
                 if ($sidebarToggle) { // Actualizar botón si existe
                     $sidebarToggle.textContent = 'menu';
                     $sidebarToggle.title = 'Mostrar menú de navegación';
                 }
            }
        });
    });

    // --- REEMPLAZADO: Función Actualizar Progreso ---
    function actualizarProgreso() {
        const progressBarFill = document.querySelector('#sidebar-navegacion .progress-fill');
        const progressText = document.querySelector('#sidebar-navegacion .progress-text');
        const allMenuItems = document.querySelectorAll('#sidebar-navegacion .menu-item');

        // Salir temprano si los elementos no existen (puede pasar al inicio)
        if (!progressBarFill || !progressText || !allMenuItems.length) {
             return;
        }

        const formSections = document.querySelectorAll('#miFormularioDinamico .seccion-formulario:not(#seccion-revision)');
        let totalCampos = 0;
        let camposCompletados = 0;

        // Contar campos y completados usando checkValidity()
        formSections.forEach(section => {
            const inputsInSection = section.querySelectorAll('.form-group [name]');
            inputsInSection.forEach(input => {
                 // Considerar solo inputs visibles y habilitados? Podría ser más complejo
                 // if (input.offsetParent !== null && !input.disabled) {
                 totalCampos++;
                 if (input.checkValidity()) { // Usa validación HTML5 nativa
                     camposCompletados++;
                 }
                 // }
            });
        });

        const porcentaje = totalCampos > 0 ? Math.round((camposCompletados / totalCampos) * 100) : 0;

        progressBarFill.style.width = `${porcentaje}%`;
        progressText.textContent = `${porcentaje}% completado`;

        // Marcar secciones completadas (si todos sus campos son válidos)
        allMenuItems.forEach(item => {
            const sectionId = item.getAttribute('data-section');
            const seccion = document.getElementById(sectionId);
            if (!seccion) return;

            const camposSeccion = seccion.querySelectorAll('.form-group [name]');
            let completadosSeccion = 0;
            let totalSeccion = 0;
            let seccionCompleta = true; // Asumir completa hasta encontrar uno inválido

            camposSeccion.forEach(input => {
                totalSeccion++;
                if (!input.checkValidity()) {
                    seccionCompleta = false;
                }
            });

            const menuItemTarget = document.querySelector(`#sidebar-navegacion .menu-item[data-section="${sectionId}"]`);
            if (!menuItemTarget) return;

            // Marcar como completado SOLO si hay campos y TODOS son válidos
            if (totalSeccion > 0 && seccionCompleta) {
                menuItemTarget.classList.add('completed');
            } else {
                menuItemTarget.classList.remove('completed');
            }
        });
    }

    // --- REEMPLAZADO: Listeners para actualizar progreso ---
    document.querySelectorAll('#miFormularioDinamico input, #miFormularioDinamico select, #miFormularioDinamico textarea').forEach(campo => {
        // 'input' da feedback más inmediato para campos de texto/textarea
        campo.addEventListener('input', actualizarProgreso);
        // 'change' es bueno para selects, checkboxes, radios, date, file
        campo.addEventListener('change', actualizarProgreso);
    });


}); // Fin del DOMContentLoaded

// --- ELIMINADO ---
// Ya no se necesita el código que estaba aquí fuera del DOMContentLoaded para crear el botón toggle.
// --- FIN ELIMINADO ---