// GNP_Local/assets/js/base/_sidebar.js
import { CONFIG, state, DOMElements } from '../config.js';

// Funciones internas (no necesitan ser exportadas si solo las usa initializeSidebar)
function updateSidebarToggleButton() {
    if (!DOMElements.$sidebarToggle) return;
    const isMobile = window.innerWidth <= CONFIG.MOBILE_BREAKPOINT;
    if (isMobile) {
         DOMElements.$sidebarToggle.textContent = state.isSidebarVisibleMobile ? 'close' : 'menu';
         DOMElements.$sidebarToggle.title = state.isSidebarVisibleMobile ? 'Ocultar menú' : 'Mostrar menú';
    } else {
        DOMElements.$sidebarToggle.textContent = state.isSidebarExpanded ? 'menu_open' : 'menu';
        DOMElements.$sidebarToggle.title = state.isSidebarExpanded ? 'Contraer menú' : 'Expandir menú';
    }
}

function _applyInitialSidebarState() {
    const isMobile = window.innerWidth <= CONFIG.MOBILE_BREAKPOINT;
    const savedSidebarState = localStorage.getItem('sidebar_expanded');
    const startExpanded = isMobile ? false : (savedSidebarState !== null ? JSON.parse(savedSidebarState) : true);

    state.isSidebarExpanded = startExpanded;
    state.isSidebarVisibleMobile = false;

    if (isMobile) {
        DOMElements.$body.classList.remove('body-sidebar-expanded', 'sidebar-visible');
        DOMElements.$body.classList.add('body-sidebar-collapsed');
    } else {
        DOMElements.$body.classList.toggle('body-sidebar-expanded', startExpanded);
        DOMElements.$body.classList.toggle('body-sidebar-collapsed', !startExpanded);
        DOMElements.$body.classList.remove('sidebar-visible');
    }
    updateSidebarToggleButton();
}

function handleResize() {
    _applyInitialSidebarState();
}

// --- Funciones Exportadas ---

export function toggleSidebar() { // <--- AHORA SE EXPORTA
    const isMobile = window.innerWidth <= CONFIG.MOBILE_BREAKPOINT;
    if (isMobile) {
        state.isSidebarVisibleMobile = !state.isSidebarVisibleMobile;
        DOMElements.$body.classList.toggle('sidebar-visible', state.isSidebarVisibleMobile);
        DOMElements.$body.classList.remove('body-sidebar-expanded', 'body-sidebar-collapsed');
    } else {
        state.isSidebarExpanded = !state.isSidebarExpanded;
        DOMElements.$body.classList.toggle('body-sidebar-expanded', state.isSidebarExpanded);
        DOMElements.$body.classList.toggle('body-sidebar-collapsed', !state.isSidebarExpanded);
        DOMElements.$body.classList.remove('sidebar-visible');
        localStorage.setItem('sidebar_expanded', JSON.stringify(state.isSidebarExpanded));
    }
    updateSidebarToggleButton(); // Esta función es interna, así que está bien llamarla aquí
}

export function actualizarProgreso() {
    if (!DOMElements.$progressBarFill || !DOMElements.$progressText || !DOMElements.$form) return;

    let totalCamposVisiblesRequeridos = 0;
    let camposCompletadosVisiblesRequeridos = 0;
    // let todasSeccionesNavegablesCompletadas = true; // No se usa actualmente

    DOMElements.$seccionesNavegables.forEach((section) => {
        let sectionIsEffectivelyComplete = true;
        let sectionHasVisibleRequiredFields = false;
        const inputsInSection = section.querySelectorAll('.form-group [name]');

        inputsInSection.forEach(input => {
            const formGroup = input.closest('.form-group.question-group');
            const isVisible = formGroup && (formGroup.style.display !== 'none' && formGroup.classList.contains('field-visible'));

            if (isVisible && !input.disabled) {
                if (input.required) {
                    sectionHasVisibleRequiredFields = true;
                    totalCamposVisiblesRequeridos++;
                    if (input.checkValidity()) {
                        camposCompletadosVisiblesRequeridos++;
                    } else {
                        sectionIsEffectivelyComplete = false;
                        // todasSeccionesNavegablesCompletadas = false; // No se usa actualmente
                    }
                }
            }
        });

        const menuItem = DOMElements.$sidebarMenuItems.find(item => item.getAttribute('data-section') === section.id);
        if (menuItem) {
            const markAsCompleted = !sectionHasVisibleRequiredFields || sectionIsEffectivelyComplete;
            menuItem.classList.toggle('completed', markAsCompleted);
        }
    });

    const porcentaje = totalCamposVisiblesRequeridos > 0
        ? Math.round((camposCompletadosVisiblesRequeridos / totalCamposVisiblesRequeridos) * 100)
        : (DOMElements.$seccionesNavegables.length > 0 ? 0 : 100);

    if (DOMElements.$progressBarFill) DOMElements.$progressBarFill.style.width = `${porcentaje}%`;
    if (DOMElements.$progressText) DOMElements.$progressText.textContent = `${porcentaje}% completado`;
}


export function initializeSidebar() {
    if (DOMElements.$sidebarToggle) DOMElements.$sidebarToggle.addEventListener('click', toggleSidebar); // Llama a la función (ahora exportada)
    window.addEventListener('resize', handleResize);
    _applyInitialSidebarState();
    actualizarProgreso();
}

// En GNP_Local/assets/js/base/_sidebar.js

/**
 * Genera dinámicamente los ítems del menú en el sidebar.
 * @param {Array} sections - El array de secciones a renderizar en el menú.
 */
export function renderSidebarMenu(sections) {
    const menuContainer = document.getElementById('sidebar-menu');
    if (!menuContainer) {
        console.error("El contenedor del menú del sidebar con ID 'sidebar-menu' no fue encontrado.");
        return;
    }
    menuContainer.innerHTML = ''; // Limpiar menú existente

    sections.forEach(section => {
        const li = document.createElement('li');
        li.className = 'menu-item';
        li.setAttribute('data-section', section.id);

        const icon = document.createElement('span');
        icon.className = 'material-symbols-outlined';
        icon.textContent = section.icon || 'article';

        const text = document.createElement('span');
        text.className = 'menu-text';
        text.textContent = section.title;

        // --- INICIO DE LA CORRECCIÓN ---
        // Se reemplaza la lógica del ícono "check" por el span para el "punto verde".
        const status = document.createElement('span');
        status.className = 'menu-status';
        // Este span se deja vacío a propósito. Tu CSS se encargará de
        // añadirle el fondo de color verde cuando la sección esté completada.
        // --- FIN DE LA CORRECCIÓN ---

        li.appendChild(icon);
        li.appendChild(text);
        li.appendChild(status); // Se añade el span de estado corregido

        menuContainer.appendChild(li);
    });
}