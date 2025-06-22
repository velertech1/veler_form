// GNP_Local/assets/js/main.js
// AÑADE ESTAS LÍNEAS AL PRINCIPIO DE main.js
import { formDefinitions } from './formDefinition.js';
import { renderSidebarMenu } from './base/_sidebar.js';

import { CONFIG, state, DOMElements } from './config.js';
import { formSections } from './formDefinition.js'; // Cambiado de '../formDefinition.js'
import { renderDynamicForm } from './base/_formRenderer.js'; // <--- IMPORTAR RENDERIZADOR

import { initializeTheme } from './base/_switch.js';
import { initializeSidebar } from './base/_sidebar.js'; // Todavía se necesita actualizarProgreso
import { initializeFormNavigation, showSection } from './base/_formNavigation.js';
import { initializeFormLogic } from './base/_formLogic.js';
import { initializeSplash } from './base/_splash.js';
import { initializeModals } from './base/_modal.js';
import { initializeTooltips } from './base/_tooltips.js';
import { validateEssentialElements } from './base/_utils.js';

// En tu archivo GNP_Local/assets/js/main.js
function initializeApp() {
    // 1. DETERMINAR QUÉ FORMULARIO USAR (basado en URL)
    const urlParams = new URLSearchParams(window.location.search);
    const tipoDeSolicitante = urlParams.get('solicitante') || 'persona';

    let seccionesActivas;
    // 2. SELECCIONAR LAS SECCIONES CORRECTAS USANDO SWITCH
    switch (tipoDeSolicitante) {
        case 'empresa':
            seccionesActivas = formDefinitions.empresa;
            break;
        case 'grupo':
            seccionesActivas = formDefinitions.grupo;
            break;
        case 'persona':
        default:
            seccionesActivas = formDefinitions.persona;
            break;
    }

    // 3. TU CÓDIGO DE VALIDACIÓN (se mantiene intacto)
    const essentialSkeletonElements = {
        $html: DOMElements.$html,
        $body: DOMElements.$body,
        $splashScreen: DOMElements.$splashScreen,
        $mainHeader: DOMElements.$mainHeader,
        $sidebar: DOMElements.$sidebar,
        $formularioCompleto: DOMElements.$formularioCompleto,
        $modalOverlay: DOMElements.$modalOverlay,
        $themeSwitch: DOMElements.$themeSwitch,
        $themeSelector: DOMElements.$themeSelector,
    };
    let allPresent = true;
    for (const key in essentialSkeletonElements) {
        if (!essentialSkeletonElements[key]) {
            console.error(`Error Init: Elemento esqueleto ${key.replace('$', '')} no encontrado.`);
            allPresent = false;
        }
    }
    if (!allPresent) {
        console.error("Error Crítico: Faltan elementos esenciales del esqueleto HTML. La aplicación no puede iniciar correctamente.");
        return;
    }

    // 4. RENDERIZADO DINÁMICO (corregido)
    if (DOMElements.$form) {
        // Dibuja el menú y el formulario correctos usando 'seccionesActivas'
        renderSidebarMenu(seccionesActivas);
        renderDynamicForm(seccionesActivas);
    } else {
        console.error("Elemento <form id='miFormularioDinamico'> no encontrado en el DOM.");
        return;
    }

    // 5. TUS INICIALIZACIONES FINALES (se mantienen intactas)
    initializeTheme();
    initializeSidebar();
    initializeTooltips();
    initializeModals();
    initializeFormLogic(seccionesActivas); // Le pasamos las secciones activas para una lógica más precisa
    initializeFormNavigation();
    initializeSplash();

    console.log(`Aplicación GNP con Formulario Dinámico Inicializada para: ${tipoDeSolicitante.toUpperCase()}`);
}

document.addEventListener('DOMContentLoaded', initializeApp);