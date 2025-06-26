// assets/js/base/_formNavigation.js

let state = {
    currentIndex: 0,
    sections: [],
    menuItems: []
};

function showSection(index) {
    state.sections.forEach((section, i) => {
        section.style.display = (i === index) ? 'block' : 'none';
    });
    state.menuItems.forEach((item, i) => {
        item.classList.toggle('active', i === index);
    });
    updateButtons();
}

function updateButtons() {
    const { prevBtn, nextBtn, submitBtn } = state;
    prevBtn.style.display = state.currentIndex > 0 ? 'inline-block' : 'none';

    if (state.currentIndex === state.sections.length - 1) { // Última sección (Revisión)
        nextBtn.style.display = 'none';
        submitBtn.style.display = 'inline-block';
    } else {
        nextBtn.style.display = 'inline-block';
        submitBtn.style.display = 'none';
    }
}

export function initializeFormNavigation(config) {
    state = { ...state, ...config }; // Fusionar configuración inicial

    state.nextBtn.addEventListener('click', () => {
        if (state.currentIndex < state.sections.length - 1) {
            state.currentIndex++;
            showSection(state.currentIndex);
        }
    });

    state.prevBtn.addEventListener('click', () => {
        if (state.currentIndex > 0) {
            state.currentIndex--;
            showSection(state.currentIndex);
        }
    });

    state.menuItems.forEach(item => {
        item.addEventListener('click', () => {
            const index = parseInt(item.dataset.sectionIndex, 10);
            // Solo permitir navegar a secciones ya vistas (o a la actual)
            if (index <= state.currentIndex) {
                state.currentIndex = index;
                showSection(state.currentIndex);
            }
        });
    });

    showSection(0); // Mostrar la primera sección al iniciar
}