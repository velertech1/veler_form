// assets/js/base/_sidebar.js

/**
 * Inicializa y renderiza una barra lateral completa.
 * @param {HTMLElement} sidebarContainer - El elemento <aside> que contendrá el sidebar.
 * @param {Array} menuItems - Un array de objetos que definen los elementos del menú.
 * @param {string} initialLogoSrc - La ruta a la imagen del logo que se debe cargar inicialmente.
 */
export function initializeSidebar(sidebarContainer, menuItems, initialLogoSrc) {
    if (!sidebarContainer) {
        console.error("Contenedor del sidebar no fue proporcionado.");
        return;
    }

    // CORRECCIÓN: Se usa el parámetro 'initialLogoSrc' para establecer la imagen correcta desde el principio.
    sidebarContainer.innerHTML = `
        <div class="sidebar-top-area">
            <img id="logo-veler-sidebar" src="${initialLogoSrc}" alt="Logo Veler Technologies">
            <button class="sidebar-toggle material-symbols-outlined" title="Contraer/Expandir menú">menu_open</button>
        </div>
        <div class="sidebar-bottom-area">
            <nav class="sidebar-menu"><ul id="sidebar-menu-dinamico" class="menu-navegacion"></ul></nav>
        </div>
    `;

    const menuElement = document.getElementById('sidebar-menu-dinamico');
    if (menuElement) {
        renderMenuItems(menuElement, menuItems);
    }

    const toggleButton = sidebarContainer.querySelector('.sidebar-toggle');
    if (toggleButton) {
        toggleButton.addEventListener('click', () => {
            document.body.classList.toggle('body-sidebar-collapsed');
            document.body.classList.toggle('body-sidebar-expanded');
            localStorage.setItem('sidebar_collapsed', document.body.classList.contains('body-sidebar-collapsed'));
        });
    }

    // Aplicar estado guardado de la barra (colapsada o expandida)
    if (localStorage.getItem('sidebar_collapsed') === 'true') {
        document.body.classList.add('body-sidebar-collapsed');
    } else {
        document.body.classList.add('body-sidebar-expanded');
    }
}

/**
 * Renderiza los elementos de la lista del menú.
 * @param {HTMLElement} menuElement - El elemento <ul> donde se insertarán los items.
 * @param {Array} menuItems - El array de configuración de los items.
 */
function renderMenuItems(menuElement, menuItems) {
    menuElement.innerHTML = ''; // Limpiar menú existente
    menuItems.forEach((item, index) => {
        const li = document.createElement('li');
        li.className = 'menu-item';
        li.dataset.sectionId = `seccion-${item.id}`;
        li.dataset.sectionIndex = index;
        li.innerHTML = `<span class="menu-icon material-symbols-outlined">${item.icon}</span><span class="menu-text">${item.text}</span>`;
        menuElement.appendChild(li);
    });
}