<?php
// components/chatbot_seguros.php
?>

<button id="chatbot-vHealth-toggle-button" class="chatbot-vHealth-toggle-button">
    <span class="material-symbols-outlined icon-open">support_agent</span>
    <span class="material-symbols-outlined icon-close" style="display:none;">close</span>
</button>

<div id="chatbotvHealthContainer" class="chatbot-vHealth-container" style="display: none;">
    <div class="chatbot-vHealth-header">
        <img src="assets/img/Mascota/asistente_vHealth_icon.png" alt="Asistente vHealth" class="chatbot-vHealth-avatar">
        <div class="chatbot-vHealth-header-info">
            <span class="chatbot-vHealth-name">Asistente de Seguros vHealth</span>
            <span class="chatbot-vHealth-status">En línea para ayudarte</span>
        </div>
        <button id="chatbot-vHealth-close-button" class="chatbot-vHealth-close-button">&times;</button>
    </div>
    <div class="chatbot-vHealth-chat-area" id="chatbotvHealthChatArea">
        <div class="chatbot-vHealth-message Bот-message" id="initialBotMessageSection"> <div class="chatbot-vHealth-bubble">
                <p>¡Hola! 👋 Soy tu Asistente Virtual vHealth. Estoy aquí para ayudarte con tus dudas sobre nuestros planes de seguro.</p>
                <p>¿Sobre qué te gustaría saber?</p>
                <div class="chatbot-vHealth-quick-replies">
                    <button onclick="showvHealthFAQ('faqCoberturaEsencial')">Plan Esencial</button>
                    <button onclick="showvHealthFAQ('faqDeducibleCoaseguro')">Deducible y Coaseguro</button>
                    <button onclick="showvHealthFAQ('faqComoContratar')">¿Cómo contratar?</button>
                    <button onclick="showvHealthFAQ('faqContactoAgente')">Contactar un Agente</button>
                </div>
                <div class="chatbot-vHealth-timestamp">Ahora mismo</div>
            </div>
        </div>

        <div class="chatbot-vHealth-message bot-message" id="faqCoberturaEsencial" style="display: none;">
            <div class="chatbot-vHealth-bubble">
                <p><strong>🛡️ Sobre el Plan Esencial vHealth...</strong></p>
                <p>El Plan Esencial te ofrece una cobertura nacional con una suma asegurada de $2,000,000 MXN, un deducible de $15,000 MXN y un coaseguro del 10%. Es ideal si buscas protección completa a un costo accesible.</p>
                <p>¿Tienes alguna pregunta específica sobre este plan?</p>
                <div class="chatbot-vHealth-quick-replies">
                    <button onclick="showvHealthInitialOptions()">Ver otras preguntas</button>
                </div>
                <div class="chatbot-vHealth-timestamp">Información</div>
            </div>
        </div>

        <div class="chatbot-vHealth-message bot-message" id="faqDeducibleCoaseguro" style="display: none;">
            <div class="chatbot-vHealth-bubble">
                <p><strong>💰 ¿Qué es Deducible y Coaseguro?</strong></p>
                <p>El <strong>deducible</strong> es la cantidad fija que pagas primero en caso de un siniestro antes de que el seguro comience a cubrir.</p>
                <p>El <strong>coaseguro</strong> es un porcentaje del total de los gastos cubiertos (después del deducible) que también corre por tu cuenta. Por ejemplo, un coaseguro del 10% significa que tú pagas ese porcentaje y vHealth el 90% restante.</p>
                <div class="chatbot-vHealth-quick-replies">
                    <button onclick="showvHealthInitialOptions()">Ver otras preguntas</button>
                </div>
                <div class="chatbot-vHealth-timestamp">Información</div>
            </div>
        </div>
        
        <div class="chatbot-vHealth-message bot-message" id="faqComoContratar" style="display: none;">
            <div class="chatbot-vHealth-bubble">
                <p><strong>✍️ ¿Cómo puedo contratar un seguro?</strong></p>
                <p>¡Es muy sencillo! Una vez que eliges un plan en esta página, haz clic en "Seleccionar Plan". Esto te llevará a un formulario donde podrás ingresar tus datos para completar la solicitud. Si tienes dudas durante el proceso, ¡no dudes en preguntar!</p>
                <div class="chatbot-vHealth-quick-replies">
                    <button onclick="showvHealthInitialOptions()">Ver otras preguntas</button>
                </div>
                <div class="chatbot-vHealth-timestamp">Información</div>
            </div>
        </div>

        <div class="chatbot-vHealth-message bot-message" id="faqContactoAgente" style="display: none;">
            <div class="chatbot-vHealth-bubble">
                <p><strong>🧑‍💼 ¿Cómo contacto a un agente?</strong></p>
                <p>Si prefieres atención personalizada, un agente vHealth puede asesorarte. Puedes indicarlo al final del proceso de solicitud o buscar un agente en nuestro <a href='#' onclick='alert(\"Redirigiendo a directorio de agentes...\")'>directorio oficial</a>.</p>
                <div class="chatbot-vHealth-quick-replies">
                    <button onclick="showvHealthInitialOptions()">Ver otras preguntas</button>
                </div>
                <div class="chatbot-vHealth-timestamp">Información</div>
            </div>
        </div>
        </div>
</div>