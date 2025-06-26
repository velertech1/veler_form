// assets/js/base/admin-main.js
import { initializeTheme } from './_switch.js';
import { initializeSidebar } from './_sidebar.js';
import { initializeDashboardCharts } from '../admin.js'; // Ruta corregida para subir un nivel

/**
 * Dibuja el menú específico para el dashboard de administrador.
 */
function renderAdminSidebar() {
    const menuContainer = document.getElementById('sidebar-menu');
    if (!menuContainer) return;

    const menuItems = [
        { id: 'dashboard', title: 'Dashboard', icon: 'dashboard', active: true },
        { id: 'reports', title: 'Reportes', icon: 'assessment' },
        { id: 'users', title: 'Usuarios', icon: 'group' },
        { id: 'settings', title: 'Configuración', icon: 'settings' }
    ];

    menuContainer.innerHTML = '';
    menuItems.forEach(item => {
        const li = document.createElement('li');
        li.className = 'menu-item';
        if (item.active) {
            li.classList.add('active');
        }
        li.innerHTML = `
            <span class="menu-icon material-symbols-outlined">${item.icon}</span>
            <span class="menu-text">${item.title}</span>
            <span class="menu-status"></span>`;
        menuContainer.appendChild(li);
    });
}

/**
 * Función principal que se ejecuta al cargar la página del admin.
 */
function initializeAdminApp() {
    renderAdminSidebar();
    initializeTheme();
    initializeSidebar();
    initializeDashboardCharts();
    console.log("Dashboard de Administrador inicializado correctamente.");
}

// Punto de entrada
document.addEventListener('DOMContentLoaded', initializeAdminApp);