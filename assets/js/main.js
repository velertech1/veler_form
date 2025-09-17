// vHealth_Local/assets/js/main.js
import { renderSidebarMenu } from './base/_sidebar.js';
import { CONFIG, state, DOMElements } from './config.js';
import { initializeTheme } from './base/_switch.js';
import { initializeSidebar } from './base/_sidebar.js'; // Todavía se necesita actualizarProgreso
import { initializeSplash } from './base/_splash.js';
import { initializeModals } from './base/_modal.js';
import { initializeTooltips } from './base/_tooltips.js';
import { validateEssentialElements } from './base/_utils.js';

// En tu archivo vHealth_Local/assets/js/main.js
function initializeApp() {


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


    // 5. TUS INICIALIZACIONES FINALES (se mantienen intactas)
    initializeTheme();
    initializeSidebar();
    initializeTooltips();
    initializeModals();
    initializeSplash();

    console.log(`Aplicación vHealth con Formulario Dinámico Inicializada para: ${tipoDeSolicitante.toUpperCase()}`);
}

document.addEventListener('DOMContentLoaded', initializeApp);