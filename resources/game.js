/**
 * CIMPA GAME - Funcionalidad principal del juego
 * Script para controlar las interacciones con la planta virtual
 */

document.addEventListener('DOMContentLoaded', function() {
    // Elementos de la UI - Barras de estado mejoradas
    const healthBar = document.getElementById('health-bar');
    const thirstBar = document.getElementById('thirst-bar');
    const healthIcon = document.getElementById('health-icon');
    const thirstIcon = document.getElementById('thirst-icon');
    const plant = document.querySelector('.pet img');
    const drinkButton = document.getElementById('drink');
    const foodButton = document.getElementById('closet');
    const chatButton = document.getElementById('chat');
    
    // Estados de la planta
    let healthStatus = 50; // Valor inicial 50%
    let thirstStatus = 75; // Valor inicial 75%
    
    // Rutas de imágenes para los iconos
    const iconExpressions = {
        happy: '../resources/img/expression_love.png',
        normal: '../resources/img/expression_working.png',
        sad: '../resources/img/expression_sad.png'
    };
    
    // Mensajes de la planta
    const plantMessages = [
        '¡Tengo hambre!',
        '¡Tengo sed!',
        '¡Me siento muy bien!',
        '¡Gracias por cuidarme!',
        '¡Necesito atención!'
    ];
    
    // Función para actualizar la barra de salud según el valor
    function updateHealthBar() {
        // Actualizar el ancho de la barra de progreso
        healthBar.style.width = healthStatus + '%';
        
        // Cambiar color y añadir clase de advertencia si es bajo
        if (healthStatus < 25) {
            healthBar.classList.add('warning');
            healthIcon.src = iconExpressions.sad;
        } else if (healthStatus < 50) {
            healthBar.classList.remove('warning');
            healthIcon.src = iconExpressions.normal;
        } else {
            healthBar.classList.remove('warning');
            healthIcon.src = iconExpressions.happy;
        }
    }
    
    // Función para actualizar la barra de sed según el valor
    function updateThirstBar() {
        // Actualizar el ancho de la barra de progreso
        thirstBar.style.width = thirstStatus + '%';
        
        // Cambiar color y añadir clase de advertencia si es bajo
        if (thirstStatus < 25) {
            thirstBar.classList.add('warning');
            thirstIcon.src = iconExpressions.sad;
        } else if (thirstStatus < 50) {
            thirstBar.classList.remove('warning');
            thirstIcon.src = iconExpressions.normal;
        } else {
            thirstBar.classList.remove('warning');
            thirstIcon.src = iconExpressions.happy;
        }
    }
    
    // Crear un globo de mensaje para la planta
    function showPlantMessage(message) {
        // Eliminar mensaje anterior si existe
        const oldMessage = document.querySelector('.plant-message');
        if (oldMessage) {
            oldMessage.remove();
        }
        
        // Crear nuevo mensaje
        const messageElement = document.createElement('div');
        messageElement.className = 'plant-message';
        messageElement.textContent = message;
        
        // Añadir mensaje a la planta
        const plantContainer = document.querySelector('.pet');
        plantContainer.style.position = 'relative';
        plantContainer.appendChild(messageElement);
        
        // Eliminar mensaje después de 3 segundos
        setTimeout(() => {
            messageElement.remove();
        }, 3000);
    }
    
    // Función de animación para la planta
    function animatePlant() {
        plant.style.transform = 'scale(1.05)';
        setTimeout(() => {
            plant.style.transform = 'scale(1)';
        }, 300);
    }
    
    // Botón de regar
    drinkButton.addEventListener('click', function(e) {
        e.preventDefault();
        
        // Incrementar nivel de hidratación
        thirstStatus += 20;
        if (thirstStatus > 100) thirstStatus = 100;
        
        // Actualizar UI
        updateThirstBar();
        animatePlant();
        showPlantMessage('¡Ahh! ¡Gracias por el agua!');
    });
    
    // Botón de alimentar
    foodButton.addEventListener('click', function(e) {
        e.preventDefault();
        
        // Incrementar nivel de salud
        healthStatus += 20;
        if (healthStatus > 100) healthStatus = 100;
        
        // Actualizar UI
        updateHealthBar();
        animatePlant();
        showPlantMessage('¡Mmm! ¡Delicioso!');
    });
    
    // Botón de chat
    chatButton.addEventListener('click', function(e) {
        e.preventDefault();
        
        // Mostrar mensaje aleatorio
        const randomIndex = Math.floor(Math.random() * plantMessages.length);
        showPlantMessage(plantMessages[randomIndex]);
    });
    
    // Deterioro gradual de la planta con el tiempo
    function deterioratePlant() {
        healthStatus -= 1;
        thirstStatus -= 2;
        
        if (healthStatus < 0) healthStatus = 0;
        if (thirstStatus < 0) thirstStatus = 0;
        
        updateHealthBar();
        updateThirstBar();
        
        // Avisar al usuario si los niveles son bajos
        if (healthStatus < 20 || thirstStatus < 20) {
            const message = healthStatus < 20 ? '¡Tengo hambre!' : '¡Tengo sed!';
            showPlantMessage(message);
        }
    }
    
    // Inicializar valores y UI
    updateHealthBar();
    updateThirstBar();
    
    // Empezar deterioro cada 30 segundos
    setInterval(deterioratePlant, 1000);
    
    // Mostrar mensaje inicial después de un breve retraso
    setTimeout(() => {
        showPlantMessage('¡Hola! ¡Cuida de mí!');
    }, 1000);
    
    // Guardar estado en localStorage cuando el usuario cierra la página
    window.addEventListener('beforeunload', function() {
        localStorage.setItem('healthStatus', healthStatus);
        localStorage.setItem('thirstStatus', thirstStatus);
        localStorage.setItem('lastVisit', Date.now());
    });
    
    // Cargar estado desde localStorage si existe
    function loadState() {
        const savedHealthStatus = localStorage.getItem('healthStatus');
        const savedThirstStatus = localStorage.getItem('thirstStatus');
        const lastVisit = localStorage.getItem('lastVisit');
        
        if (savedHealthStatus !== null && savedThirstStatus !== null && lastVisit !== null) {
            // Calcular tiempo transcurrido desde la última visita (en minutos)
            const timeElapsed = (Date.now() - lastVisit) / 60000;
            
            // Cargar valores guardados
            healthStatus = parseFloat(savedHealthStatus);
            thirstStatus = parseFloat(savedThirstStatus);
            
            // Reducir valores según el tiempo transcurrido (aproximadamente)
            healthStatus = Math.max(0, healthStatus - timeElapsed * 0.2);
            thirstStatus = Math.max(0, thirstStatus - timeElapsed * 0.4);
            
            // Actualizar UI
            updateHealthBar();
            updateThirstBar();
            
            // Mensaje basado en el estado
            if (healthStatus < 20 || thirstStatus < 20) {
                setTimeout(() => {
                    showPlantMessage('¡Me has tenido abandonado! ¡Necesito cuidados!');
                }, 1000);
            }
        }
    }
    
    // Cargar estado al iniciar
    loadState();
});

// Añadir clase activa al ítem de navegación actual
document.addEventListener('DOMContentLoaded', function() {
    // Obtener la ruta actual
    const currentPath = window.location.pathname;
    
    // Seleccionar todos los elementos de navegación
    const navItems = document.querySelectorAll('.footer-item');
    
    // Comprobar cada elemento de navegación
    navItems.forEach(item => {
        const href = item.getAttribute('href');
        
        // Si la URL actual termina con el href, añadir clase activa
        if (currentPath.endsWith(href)) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
});