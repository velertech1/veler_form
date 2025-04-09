document.addEventListener('DOMContentLoaded', () => {
    // --- Elementos del DOM ---
    const $logoContainer = document.getElementById('logo-container-inicial');
    const $formularioCompletoDiv = document.getElementById('formulario-completo');
    const $form = document.getElementById('miFormularioDinamico');
    const $secciones = Array.from($form.querySelectorAll('.seccion-formulario'));
    const $seccionRevision = document.getElementById('seccion-revision');
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
    let lastSubmitButton = null;
  
    // --- Variables de Estado ---
    let currentSeccionIndex = 0;
    const FADE_DURATION = 400;
  
    // --- Inicialización ---
    setTimeout(initForm, 500);
    initTheme();
  
    // --- Listeners ---
    if ($form) $form.addEventListener('click', handleFormClick);
    if ($modalOverlay) $modalOverlay.addEventListener('click', hideModal);
    if ($modalCloseBtn) $modalCloseBtn.addEventListener('click', hideModal);
    if ($modalOkBtn) $modalOkBtn.addEventListener('click', hideModal);
  
    // --- Funciones de Tema ---
    function initTheme() {
     const savedTheme = localStorage.getItem('theme') || 'dark';
     applyTheme(savedTheme);
  
     if ($themeSwitch) {
      $themeSwitch.addEventListener('change', handleThemeSwitchChange);
     } else {
      console.warn("Elemento #theme-checkbox no encontrado.");
     }
    }
  
    function applyTheme(theme) {
     if (theme === 'light') {
      document.documentElement.classList.add('light-theme');
      if ($themeSwitch) $themeSwitch.checked = true;
     } else {
      document.documentElement.classList.remove('light-theme');
      if ($themeSwitch) $themeSwitch.checked = false;
     }
    }
  
    function handleThemeSwitchChange() {
     const currentTheme = this.checked ? 'light' : 'dark';
     applyTheme(currentTheme);
     localStorage.setItem('theme', currentTheme);
    }
  
    // --- Funciones de Navegación del Formulario ---
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
      if ($section !== $nextSection) $section.style.display = 'none';
      callback();
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
  
     if ($currentActive) {
      fadeOutSection($currentActive, $seccionRevision, () => {
       $formularioCompletoDiv.classList.add('modo-revision');
       if ($seccionRevision) $seccionRevision.style.display = 'block';
       generateFinalSummary();
      });
     } else {
      $formularioCompletoDiv.classList.add('modo-revision');
      if ($seccionRevision) $seccionRevision.style.display = 'block';
      generateFinalSummary();
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
     if (!$resumenDiv) return;
  
     $resumenDiv.innerHTML = '';
     const formData = new FormData($form);
     let resumenHTML = '<ul>';
  
     for (let [key, value] of formData.entries()) {
      if (isValidInputValue(value)) {
       const labelText = getLabelText($form, key) || key;
       const displayValue = getDisplayValue(value);
       resumenHTML += `<li><strong>${labelText}:</strong> ${displayValue}</li>`;
      } else if (isCheckboxChecked($form, key, value)) {
       const labelText = getLabelText($form, key) || key;
       resumenHTML += `<li><strong>${labelText}:</strong> Sí</li>`;
      }
     }
  
     resumenHTML += '</ul>';
     $resumenDiv.innerHTML = resumenHTML;
    }
  
    function isValidInputValue(value) {
     return (value && typeof value === 'string' && value.trim() !== '') || (value instanceof File && value.size > 0);
    }
  
    function getDisplayValue(value) {
     return (value instanceof File) ? `${value.name} (${(value.size / 1024).toFixed(1)} KB)` : value;
    }
  
    function getLabelText($form, key) {
     const $inputElement = $form.querySelector(`[name="${key}"]`);
     if (!$inputElement) return null;
  
     const $labelElement = $inputElement.closest('.form-group')?.querySelector('label');
     if (!$labelElement) return null;
  
     const cleanLabel = $labelElement.cloneNode(true);
     cleanLabel.querySelectorAll('input, select, textarea, button').forEach($el => $el.remove());
     return cleanLabel.textContent.trim().replace(':', '');
    }
  
    function isCheckboxChecked($form, key, value) {
     const $inputElement = $form.querySelector(`[name="${key}"]`);
     return value === true || ($inputElement?.type === 'checkbox' && $inputElement?.checked);
    }
  
    // --- Funciones de Animación Inicial ---
    function initForm() {
     if ($logoContainer) {
      $logoContainer.classList.add('logos-arriba');
     }
  
     setTimeout(() => {
      if ($formularioCompletoDiv) {
       $formularioCompletoDiv.style.display = 'block';
       showSection(0);
      } else {
       console.error("Div #formulario-completo no encontrado");
      }
     }, 1000);
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
         if ($modalSuccessLogo) $modalSuccessLogo.style.display = 'inline-block';
         if ($modalCloseBtn) $modalCloseBtn.style.display = 'none';
         if ($modalOkBtn) $modalOkBtn.style.display = 'inline-block';
        } else {
         $modalTitle.textContent = 'Error';
         if ($modalErrorIcon) {
          $modalErrorIcon.textContent = 'error';
          $modalErrorIcon.style.display = 'inline-block';
         }
         if ($modalSuccessLogo) $modalSuccessLogo.style.display = 'none';
         // *** CAMBIO CLAVE: Mensaje de error genérico ***
         $modalMessage.textContent = 'Hubo un problema al enviar el formulario. Por favor, inténtalo de nuevo más tarde.';
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
     } else if ($target.type === 'submit' && $target.classList.contains('btn-primary')) {
      handleSubmitButtonClick($target, event);
     }
    }
  
    function handleNextButtonClick($target) {
     const esBotonFinal = $target.classList.contains('btn-final');
  
     if (esBotonFinal) {
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
      alert("Error: El formulario no está listo para ser enviado.");
      return;
     }
  
     const formData = new FormData($form);
     console.log("Datos recolectados para enviar:", [...formData.entries()]);
  
     $target.disabled = true;
     $target.textContent = 'Enviando...';
     lastSubmitButton = $target;
  
     sendFormData(formData);
    }
  
    function sendFormData(formData) {
     fetch('/tu-endpoint-real-en-el-servidor', { // <-- CAMBIA ESTA URL
      method: 'POST',
      body: formData
     })
      .then(async response => {
       if (!response.ok) {
        let errorText = response.statusText;
        try {
         errorText = await response.text();
        } catch (e) {
         console.warn("No se pudo leer el cuerpo del error:", e);
        }
        throw new Error(`${response.status}: ${errorText}`);
       }
       const contentType = response.headers.get("content-type");
       if (contentType && contentType.indexOf("application/json") !== -1) {
        return response.json();
       } else {
        return response.text();
       }
      })
      .then(data => {
       console.log('Éxito:', data);
       showModal('success', (typeof data === 'object' && data?.message) ? data.message : '');
      })
      .catch(error => {
       console.error('Error en fetch:', error);
       showModal('error', error.message);
      });
    }
   });