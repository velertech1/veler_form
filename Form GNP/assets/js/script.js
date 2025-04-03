document.addEventListener('DOMContentLoaded', () => {
    // --- Elementos del DOM ---
    const logoContainer = document.getElementById('logo-container-inicial');
    const formularioCompletoDiv = document.getElementById('formulario-completo');
    const form = document.getElementById('miFormularioDinamico');
    const questions = form.querySelectorAll('.question-group'); // Todos los grupos de preguntas
    const btnSiguiente = form.querySelectorAll('.btn-siguiente'); // Todos los botones 'Siguiente'
    const btnAnterior = form.querySelectorAll('.btn-anterior'); // Todos los botones 'Anterior'
    const seccionRevision = document.getElementById('seccion-revision');
    const btnSubmitFinal = form.querySelector('button[type="submit"]');
    const btnVolverEditar = form.querySelector('.btn-volver-a-editar'); // Botón en sección revisión

    let currentQuestionIndex = 0;
    const FADE_DURATION = 400; // Duración en ms (igual a la transición CSS: 0.4s)

    // --- Función para mostrar una pregunta específica con animación ---
    function mostrarPregunta(indexToShow) {
        const currentActive = form.querySelector('.question-group.active');

        if (currentActive) {
            currentActive.classList.remove('active'); // Inicia fade-out
            // Esperar a que termine el fade-out antes de ocultar con display:none
            setTimeout(() => {
                if (currentActive !== questions[indexToShow]) { // Evitar ocultarse a sí mismo si se llama a la misma pregunta
                   currentActive.style.display = 'none';
                }
                // Proceder a mostrar la nueva pregunta DESPUÉS de ocultar la anterior
                activarSiguientePregunta(indexToShow);
            }, FADE_DURATION);
        } else {
            // Si no había ninguna activa (inicio), mostrar la primera directamente
             activarSiguientePregunta(indexToShow);
        }
         currentQuestionIndex = indexToShow; // Actualizar índice global
    }

    function activarSiguientePregunta(indexToShow) {
        if (indexToShow >= 0 && indexToShow < questions.length) {
            const nextQuestion = questions[indexToShow];
            nextQuestion.style.display = 'block'; // Hacerla visible en el layout

            // Pequeño delay para asegurar que el display:block se aplique antes de la opacidad
            setTimeout(() => {
                nextQuestion.classList.add('active'); // Inicia fade-in
            }, 10); // Un delay muy corto es suficiente
        } else {
            console.error("Índice de pregunta fuera de rango:", indexToShow);
        }
    }


    // --- Función para entrar en el modo Revisión ---
    function mostrarModoRevision() {
        console.log("Entrando en modo revisión...");
        const currentActive = form.querySelector('.question-group.active');
        if (currentActive) {
            currentActive.classList.remove('active'); // Fade out última pregunta
             setTimeout(() => {
                 currentActive.style.display = 'none'; // Ocultar la última pregunta individual
                 formularioCompletoDiv.classList.add('modo-revision'); // Aplicar clase para mostrar todo
                 seccionRevision.style.display = 'block'; // Asegurar que el div final sea visible
             }, FADE_DURATION);
        } else {
             // Si no había nada activo (raro en este punto), ir directo a revisión
             formularioCompletoDiv.classList.add('modo-revision');
             seccionRevision.style.display = 'block';
        }
         // Opcional: Scroll al inicio del formulario
         // formularioCompletoDiv.scrollIntoView({ behavior: 'smooth' });
    }

    // --- Función para salir del modo Revisión y volver a editar ---
    function ocultarModoRevision(indexToGoBackTo) {
         console.log("Saliendo de modo revisión...");
         formularioCompletoDiv.classList.remove('modo-revision');
         seccionRevision.style.display = 'none'; // Ocultar bloque final

         // Volver a mostrar la pregunta específica
         mostrarPregunta(indexToGoBackTo);
    }


    // --- Animación Inicial de Logos y Mostrar Primera Pregunta ---
    function iniciarFormulario() {
        console.log("Iniciando formulario...");
        if (logoContainer) {
            logoContainer.classList.add('logos-arriba');
        }
        // Esperar a que termine la animación de los logos
        setTimeout(() => {
            if (formularioCompletoDiv) {
                formularioCompletoDiv.style.display = 'block'; // Mostrar el contenedor del formulario
                mostrarPregunta(0); // Mostrar la primera pregunta con animación
            }
        }, 1000); // Ajusta si la duración de la animación del logo cambió
    }

    // Iniciar después de un breve momento
    setTimeout(iniciarFormulario, 500); // Reducido el delay inicial si quieres


    // --- Lógica de Navegación (Botones Siguiente) ---
    btnSiguiente.forEach(button => {
        button.addEventListener('click', () => {
            // Opcional: Validación del campo actual antes de avanzar
            // let currentInput = questions[currentQuestionIndex].querySelector('.form-control');
            // if (currentInput && currentInput.required && !currentInput.value) {
            //    alert('Por favor, complete este campo.');
            //    return; // No avanzar si es requerido y está vacío
            // }

            const esBotonFinal = button.classList.contains('btn-final'); // ¿Es el último botón 'Siguiente'?

            if (esBotonFinal) {
                mostrarModoRevision();
            } else if (currentQuestionIndex < questions.length - 1) {
                mostrarPregunta(currentQuestionIndex + 1);
            }
        });
    });

    // --- Lógica de Navegación (Botones Anterior) ---
    btnAnterior.forEach(button => {
        button.addEventListener('click', () => {
            if (currentQuestionIndex > 0) {
                mostrarPregunta(currentQuestionIndex - 1);
            }
        });
    });

    // --- Lógica de Navegación (Botón Volver a Editar en Revisión) ---
    if (btnVolverEditar) {
        btnVolverEditar.addEventListener('click', () => {
            // Volver a la última pregunta antes de la revisión
            ocultarModoRevision(questions.length - 1);
        });
    }

    // --- Envío del Formulario ---
    if (form) {
        form.addEventListener('submit', (event) => {
            event.preventDefault(); // Prevenir el envío normal HTML
            console.log('Formulario para enviar...');

            // Asegurarse que estamos en modo revisión visible por si acaso
            if (!formularioCompletoDiv.classList.contains('modo-revision')) {
                 // Forzar visualización de revisión si se intenta enviar antes
                 formularioCompletoDiv.classList.add('modo-revision');
                 seccionRevision.style.display = 'block';
                 alert("Por favor, revisa los datos antes de confirmar el envío.");
                 return;
            }

            // Recolectar datos
            const formData = new FormData(form);
            console.log("Datos recolectados:");
            for (let [key, value] of formData.entries()) {
                // Si es un checkbox no marcado, FormData no lo incluye por defecto.
                // Si necesitas saber si un checkbox NO fue marcado, necesitarías lógica adicional.
                // Para archivos (firmas), el objeto 'value' será un objeto File.
                 if (value instanceof File) {
                    console.log(`${key}: ${value.name} (${value.size} bytes)`);
                } else {
                    console.log(`${key}: ${value}`);
                }
            }

            // Simulación de envío
            alert('Formulario enviado (revisa la consola para ver los datos).');

            // Aquí iría la lógica real de envío al servidor (usando fetch, AJAX, etc.)
            // fetch('/tu-endpoint', { method: 'POST', body: formData })
            //   .then(response => response.json())
            //   .then(data => { console.log('Éxito:', data); alert('¡Enviado con éxito!'); })
            //   .catch(error => { console.error('Error:', error); alert('Error al enviar.'); });
        });
    }

}); // Fin del DOMContentLoaded