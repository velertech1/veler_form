document.addEventListener('DOMContentLoaded', () => {
    // --- Elementos del DOM ---
    // Seleccionamos los elementos HTML con los que vamos a interactuar
    const logoContainer = document.getElementById('logo-container-inicial'); // El div que contiene los logos Veler y GNP
    const formularioCompletoDiv = document.getElementById('formulario-completo'); // El div principal que envuelve todo el formulario
    const form = document.getElementById('miFormularioDinamico'); // La etiqueta <form> en sí
    const secciones = Array.from(form.querySelectorAll('.seccion-formulario')); // Todas las divs que son una sección del form (Solicitantes, Domicilios, etc.)
    const seccionRevision = document.getElementById('seccion-revision'); // La sección específica para la revisión final
    // Creamos una lista solo con las secciones por las que se navega con "Siguiente/Anterior"
    const seccionesNavegables = secciones.filter(sec => sec.id !== 'seccion-revision');

    // --- Variables de Estado ---
    let currentSeccionIndex = 0; // Para saber en qué sección estamos (empezamos en la 0)
    const FADE_DURATION = 400; // Duración de la animación de opacidad en milisegundos (0.4s = 400ms)

    // --- Función para mostrar una SECCIÓN específica con animación ---
    // Recibe el índice (número) de la sección a mostrar
    function mostrarSeccion(indexToShow) {
        console.log(`Intentando mostrar sección ${indexToShow}`); // Mensaje para depuración
        // Comprobamos que el índice sea válido
        if (indexToShow < 0 || indexToShow >= seccionesNavegables.length) {
            console.error("Índice de sección fuera de rango:", indexToShow);
            return; // Salimos si el índice no es válido
        }

        // Buscamos la sección que está actualmente visible (si hay alguna)
        const currentActive = form.querySelector('.seccion-formulario.seccion-activa');
        // Obtenemos el elemento HTML de la sección que queremos mostrar
        const nextSection = seccionesNavegables[indexToShow];

        if (currentActive) {
            // Si había una sección activa, primero la ocultamos con una animación
            currentActive.classList.remove('seccion-activa'); // Quita la clase, el CSS hace que baje la opacidad (fade-out)

            // Esperamos a que termine la animación de ocultar (FADE_DURATION)
            setTimeout(() => {
                // Después de la animación, la ocultamos completamente del layout
                if (currentActive !== nextSection) { // Evitar ocultarse a sí misma si es la misma sección
                    currentActive.style.display = 'none';
                }
                // Ahora que la anterior está oculta, mostramos la nueva sección
                activarSiguienteSeccion(nextSection);
            }, FADE_DURATION);
        } else {
            // Si no había ninguna sección activa (es la primera vez), mostramos la nueva directamente
            activarSiguienteSeccion(nextSection);
        }
        currentSeccionIndex = indexToShow; // Actualizamos el índice global para saber dónde estamos
    }

    // --- Función auxiliar para activar la animación de entrada de una sección ---
    // Recibe el elemento HTML de la sección a activar
    function activarSiguienteSeccion(sectionElement) {
        if (sectionElement) {
             // 1. La hacemos ocupar espacio en el layout
            sectionElement.style.display = 'block';
            // 2. Esperamos un instante MUY corto (10ms) para asegurar que el navegador procesó el display:block
            //    antes de añadir la clase que inicia la transición de opacidad.
            setTimeout(() => {
                // 3. Añadimos la clase que hace la opacidad 1 (fade-in según el CSS)
                sectionElement.classList.add('seccion-activa');
                console.log(`Sección ${sectionElement.id} activada`); // Mensaje para depuración
            }, 10);
        }
    }

    // --- Función para entrar en el modo Revisión ---
    // Se llama al pulsar el botón "Ir a Revisión"
    function mostrarModoRevision() {
        console.log("Entrando en modo revisión...");
        // Buscamos la última sección de preguntas que estaba activa
        const currentActive = form.querySelector('.seccion-formulario.seccion-activa');

        if (currentActive) {
            // Quitamos la clase activa para que se oculte con animación (fade-out)
            currentActive.classList.remove('seccion-activa');

            // Esperamos que termine la animación de ocultar
            setTimeout(() => {
                // Añadimos la clase 'modo-revision' al contenedor principal.
                // El CSS asociado a esta clase debería hacer visibles TODAS las secciones .seccion-formulario
                formularioCompletoDiv.classList.add('modo-revision');
                // Mostramos explícitamente el div final (#seccion-revision) que contiene el resumen y los botones finales
                if (seccionRevision) seccionRevision.style.display = 'block';
                console.log("Modo revisión activado.");
                // Podrías descomentar la siguiente línea si quieres que la página suba automáticamente al inicio del formulario
                // formularioCompletoDiv.scrollIntoView({ behavior: 'smooth' });
            }, FADE_DURATION);
        } else {
            // Caso raro: si no había sección activa, entramos directo a revisión
            formularioCompletoDiv.classList.add('modo-revision');
            if (seccionRevision) seccionRevision.style.display = 'block';
            console.log("Modo revisión activado directamente.");
        }
        // Falta la lógica para rellenar el div #resumen-final con los datos
        // Deberías añadir aquí una función que recoja los datos y los ponga en #resumen-final
        generarResumenFinal(); // <-- ¡AÑADIR ESTA FUNCIÓN!
    }

     // --- ¡NUEVA FUNCIÓN! (Ejemplo Básico) Para generar el resumen ---
     function generarResumenFinal() {
        const resumenDiv = document.getElementById('resumen-final');
        if (!resumenDiv) return;

        resumenDiv.innerHTML = ''; // Limpiar resumen anterior
        const formData = new FormData(form);
        let resumenHTML = '<ul>';

        console.log("Generando resumen:"); // Log para depuración
        for (let [key, value] of formData.entries()) {
            // Omitir campos vacíos o botones, etc. (puedes refinar esto)
            if (value && typeof value === 'string' && value.trim() !== '' || value instanceof File && value.size > 0) {
                // Intentar obtener la etiqueta asociada al campo para un nombre más amigable
                const inputElement = form.querySelector(`[name="${key}"]`);
                let labelText = key; // Usar el nombre del campo como fallback
                if (inputElement) {
                    // Buscar la etiqueta <label> más cercana
                    const labelElement = inputElement.closest('.form-group')?.querySelector('label');
                    if (labelElement) {
                        // Limpiar el texto de la etiqueta (quitar posibles elementos anidados como el propio input)
                        const cleanLabel = labelElement.cloneNode(true);
                        cleanLabel.querySelectorAll('input, select, textarea, button').forEach(el => el.remove());
                        labelText = cleanLabel.textContent.trim().replace(':', ''); // Quitar dos puntos si los hay
                    }
                }

                const displayValue = (value instanceof File) ? `${value.name} (${(value.size / 1024).toFixed(1)} KB)` : value;

                console.log(`  ${labelText}: ${displayValue}`); // Log del par label/valor
                resumenHTML += `<li><strong>${labelText}:</strong> ${displayValue}</li>`;
            } else if (value === true || (inputElement?.type === 'checkbox' && inputElement?.checked)) {
                 // Manejo específico para checkboxes marcados (FormData a veces no los incluye si no tienen 'value')
                 const inputElement = form.querySelector(`[name="${key}"]`);
                 let labelText = key;
                 if (inputElement) {
                    const labelElement = inputElement.closest('.form-group')?.querySelector('label');
                     if (labelElement) {
                        const cleanLabel = labelElement.cloneNode(true);
                        cleanLabel.querySelectorAll('input').forEach(el => el.remove());
                        labelText = cleanLabel.textContent.trim().replace(':', '');
                     }
                 }
                 console.log(`  ${labelText}: Sí`); // Log para checkbox
                 resumenHTML += `<li><strong>${labelText}:</strong> Sí</li>`;
             }
        }
        resumenHTML += '</ul>';
        resumenDiv.innerHTML = resumenHTML;
    }


    // --- Función para salir del modo Revisión y volver a editar ---
    // Se llama al pulsar "Volver a Editar"
    function ocultarModoRevision() {
        console.log("Saliendo de modo revisión...");
        // Quitamos la clase que mostraba todas las secciones
        formularioCompletoDiv.classList.remove('modo-revision');
        // Ocultamos el div final de revisión y botones
        if (seccionRevision) seccionRevision.style.display = 'none';

        // Volvemos a mostrar la última sección de preguntas donde estaba el usuario
        // Usamos el índice que teníamos guardado (currentSeccionIndex)
        mostrarSeccion(currentSeccionIndex);
    }


    // --- Animación Inicial de Logos y Mostrar Primera Sección ---
    // Función que se ejecutará cuando la página esté lista
    function iniciarFormulario() {
        console.log("Iniciando formulario...");
        // Si existe el contenedor de logos...
        if (logoContainer) {
            // ...le añadimos la clase 'logos-arriba'. El CSS se encarga de la animación.
            logoContainer.classList.add('logos-arriba');
        }
        // Esperamos 1 segundo (1000ms), asumiendo que la animación del logo dura eso.
        // Ajusta este tiempo si tu animación CSS dura diferente.
        setTimeout(() => {
            // Si existe el div principal del formulario...
            if (formularioCompletoDiv) {
                // ... lo hacemos visible (quitamos el display:none inicial)
                formularioCompletoDiv.style.display = 'block';
                // Y mostramos la primera sección (índice 0) con su animación de entrada
                mostrarSeccion(0);
            } else {
                console.error("Div #formulario-completo no encontrado");
            }
        }, 1000); // 1 segundo de espera
    }

    // Esperamos medio segundo (500ms) después de que cargue el HTML antes de iniciar la animación/formulario
    setTimeout(iniciarFormulario, 500);


    // --- Lógica de Navegación (Manejador de Clics en el Formulario) ---
    // En lugar de poner un 'escuchador' en cada botón, ponemos uno solo en el formulario
    // y detectamos en qué botón se hizo clic (delegación de eventos). Es más eficiente.
    if (form) {
        form.addEventListener('click', (event) => {
            // 'event.target' es el elemento exacto donde se hizo clic (podría ser el texto del botón, etc.)
            const target = event.target.closest('button'); // Buscamos el botón más cercano al clic

            // Si no se hizo clic en un botón, no hacemos nada
            if (!target) return;

            // --- Botones Siguiente ---
            if (target.classList.contains('btn-siguiente')) {
                const esBotonFinal = target.classList.contains('btn-final'); // Es el botón "Ir a Revisión"?

                // Aquí podrías añadir validación de campos de la sección actual ANTES de pasar a la siguiente
                // if (!validarSeccion(seccionesNavegables[currentSeccionIndex])) { return; }

                if (esBotonFinal) {
                    // Si es el último botón ("Ir a Revisión"), llamamos a la función correspondiente
                    mostrarModoRevision();
                } else if (currentSeccionIndex < seccionesNavegables.length - 1) {
                    // Si no es el último y hay secciones siguientes, mostramos la siguiente
                    mostrarSeccion(currentSeccionIndex + 1);
                }
            }

            // --- Botones Anterior ---
            else if (target.classList.contains('btn-anterior')) {
                // Si estamos en modo revisión y pulsamos "Volver a Editar"
                if (target.classList.contains('btn-volver-a-editar')) {
                    ocultarModoRevision();
                }
                // Si es un botón "Anterior" normal y no estamos en la primera sección
                else if (currentSeccionIndex > 0) {
                    // Mostramos la sección anterior
                    mostrarSeccion(currentSeccionIndex - 1);
                }
            }

            // --- Botón Submit Final ---
            // Si se hizo clic en el botón que es de tipo 'submit' y tiene la clase 'btn-primary'
            else if (target.type === 'submit' && target.classList.contains('btn-primary')) {
                event.preventDefault(); // ¡MUY IMPORTANTE! Evita que la página se recargue
                console.log('Formulario listo para enviar (se previene recarga)...');

                // Verificación: Asegurarse de que estamos en modo revisión antes de enviar
                if (!formularioCompletoDiv.classList.contains('modo-revision')) {
                    console.warn("Intento de envío fuera del modo revisión.");
                    alert("Error: El formulario no está listo para ser enviado.");
                    return;
                }

                // Recolectar TODOS los datos del formulario
                const formData = new FormData(form);
                console.log("Datos recolectados para enviar:");
                // Mostramos los datos en consola para verificar (puedes quitar esto en producción)
                for (let [key, value] of formData.entries()) {
                    if (value instanceof File) {
                        console.log(`  ${key}: ${value.name} (${value.size} bytes)`);
                    } else {
                        console.log(`  ${key}: ${value}`);
                    }
                }

                // --- INICIO: Bloque de Corrección Post-Envío ---

                // 1. Deshabilitar el botón para evitar clics múltiples mientras se "envía"
                target.disabled = true;
                target.textContent = 'Enviando...'; // Cambiar texto para feedback

                // 2. SIMULACIÓN de envío al servidor (reemplazar con 'fetch' real)
                // Usamos setTimeout para simular que tarda un poco (1.5 segundos)
                setTimeout(() => {
                    console.log("Envío simulado completado.");

                    // --- ACCIÓN VISUAL TRAS ENVÍO EXITOSO ---
                    if (formularioCompletoDiv) {
                        // Limpiamos la clase de modo revisión
                        formularioCompletoDiv.classList.remove('modo-revision');

                        // Reemplazamos todo el contenido del formulario por un mensaje de agradecimiento
                        // Usamos estilos inline simples para asegurar visibilidad
                        formularioCompletoDiv.innerHTML = `
                            <div style="color: #F7D7A5; text-align: center; padding: 40px; margin-top: 100px;">
                                <h2>¡Formulario Enviado!</h2>
                                <p>Gracias por completar tu solicitud. Hemos recibido tus datos correctamente.</p>
                                <p><em>(Esta es una simulación, los datos no se enviaron realmente)</em></p>
                            </div>`;

                        // Nos aseguramos que el div principal del formulario sigue visible
                        formularioCompletoDiv.style.display = 'block';

                        // Hacemos scroll hacia arriba para que el usuario vea el mensaje
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                    }
                    // --- FIN ACCIÓN VISUAL ---

                    // NOTA IMPORTANTE: En una aplicación real, este bloque de "ACCIÓN VISUAL"
                    // debería ir DENTRO del `.then()` de una llamada `Workspace` exitosa.
                    // Y deberías tener un `.catch()` para manejar errores de red o del servidor,
                    // mostrando un mensaje de error al usuario y posiblemente habilitando el botón de nuevo.

                }, 1500); // Simulación de espera de 1.5 segundos


                /* // EJEMPLO DE CÓMO SERÍA CON FETCH REAL (DEBES DESCOMENTAR Y ADAPTAR):

                fetch('/tu-endpoint-real-en-el-servidor', { // <-- CAMBIA ESTA URL
                    method: 'POST',
                    body: formData
                })
                .then(response => {
                    // Verificar si la respuesta del servidor fue exitosa (ej. status 200-299)
                    if (!response.ok) {
                        // Si no fue exitosa, lanzar un error para que lo capture el .catch()
                        // Intentar leer el mensaje de error del servidor si lo hay
                        return response.text().then(text => {
                           throw new Error(`Error del servidor: ${response.status} ${response.statusText} - ${text}`);
                        });
                    }
                    // Si fue exitosa, intentar procesar la respuesta (ej. si devuelve JSON)
                    return response.json(); // o response.text() si no esperas JSON
                })
                .then(data => {
                    // --- ESTE BLOQUE SE EJECUTA SI EL FETCH FUE EXITOSO ---
                    console.log('Respuesta del servidor (éxito):', data);

                    // --- Pegar aquí la ACCIÓN VISUAL TRAS ENVÍO EXITOSO ---
                    if (formularioCompletoDiv) {
                        formularioCompletoDiv.classList.remove('modo-revision');
                        formularioCompletoDiv.innerHTML = `<div style="color: #F7D7A5; ..."><h2>¡Formulario Enviado!</h2>...</div>`;
                        formularioCompletoDiv.style.display = 'block';
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                    }
                     // --- Fin Acción Visual ---
                })
                .catch(error => {
                    // --- ESTE BLOQUE SE EJECUTA SI HUBO UN ERROR DE RED O EN EL SERVIDOR ---
                    console.error('Error al enviar formulario:', error);
                    // Mostrar un mensaje de error al usuario
                    alert('Hubo un problema al enviar tu formulario: ' + error.message + '\nPor favor, inténtalo de nuevo.');
                    // Habilitar el botón de nuevo para que pueda reintentar
                    target.disabled = false;
                    target.textContent = 'Enviar Formulario';
                });
                */ // FIN EJEMPLO FETCH REAL

                 // --- FIN: Bloque de Corrección Post-Envío ---

            } // Fin del else if (target.type === 'submit')

        }); // Fin del form.addEventListener('click')
    } else {
        console.error("Elemento <form id='miFormularioDinamico'> no encontrado en el HTML.");
    }

}); // Fin del DOMContentLoaded