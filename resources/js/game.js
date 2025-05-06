/**
 * CIMPA GAME - Funcionalidad simplificada del juego
 * Script para controlar las interacciones con la planta virtual
 */

document.addEventListener('DOMContentLoaded', function() {
    // Elementos de la UI
    const healthBar = document.getElementById('health-bar');
    const thirstBar = document.getElementById('thirst-bar');
    const healthIcon = document.getElementById('health-icon');
    const thirstIcon = document.getElementById('thirst-icon');
    const plant = document.querySelector('.pet img');
    const drinkButton = document.getElementById('drink');
    const chatButton = document.getElementById('chat');
    
    // Estados de la planta
    let healthStatus = 100; // Valor inicial 100%
    let thirstStatus = 75; // Valor inicial 75%
    
    // Rutas de imágenes para los iconos
    const iconExpressions = {
        fullHealth: '../resources/img/expression_health_love.png',
        midHealth: '../resources/img/expression_health_middle.png',
        emptyHealth: '../resources/img/expression_health_sad.png',
        fullThirst: '../resources/img/expression_thirst_full.png',
        midThirst: '../resources/img/expression_thirst_mid.png',
        emptyThirst: '../resources/img/expression_thirst_sad.png'
    };
    
    // Mensajes de la planta
    const plantMessages = [
        '¡Tengo sed!',
        '¡Me siento muy bien!',
        '¡Gracias por cuidarme!',
        '¡Necesito agua!'
    ];
    
    // Función para actualizar la barra de salud
    function updateHealthBar() {
        healthBar.style.width = healthStatus + '%';
        
        if (healthStatus < 30) {
            healthBar.classList.add('warning');
            healthIcon.src = iconExpressions.emptyHealth;
        } else if (healthStatus < 75) {
            healthBar.classList.remove('warning');
            healthIcon.src = iconExpressions.midHealth;
        } else {
            healthBar.classList.remove('warning');
            healthIcon.src = iconExpressions.fullHealth;
        }
    }

    // Función para actualizar la barra de sed
    function updateThirstBar() {
        thirstBar.style.width = thirstStatus + '%';
    
        if (thirstStatus < 30) {
            thirstBar.classList.add('warning');
            thirstIcon.src = iconExpressions.emptyThirst;
        } else if (thirstStatus < 75) {
            thirstBar.classList.remove('warning');
            thirstIcon.src = iconExpressions.midThirst;
        } else {
            thirstBar.classList.remove('warning');
            thirstIcon.src = iconExpressions.fullThirst;
        }
    }
    
    // Función para mostrar mensaje de la planta
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
        plantContainer.appendChild(messageElement);
        
        // Eliminar mensaje después de 3 segundos
        setTimeout(() => {
            messageElement.remove();
        }, 3000);
    }
    
    // Función para regar la planta (un solo click)
    function waterPlant() {
        // Si el agua ya está al máximo, mostrar mensaje de advertencia
        if (thirstStatus >= 100) {
            showPlantMessage('¡Cuidado! ¡No me ahogues con tanta agua!');
            return;
        }
        
        // Aumentar nivel de hidratación
        thirstStatus += 20; // Más agua por click para pruebas
        if (thirstStatus > 100) thirstStatus = 100;
        
        // Si el agua está por encima del 75%, recuperar vida
        if (thirstStatus > 75 && healthStatus < 100) {
            healthStatus += 10; // Recupera vida rápidamente para pruebas
            if (healthStatus > 100) healthStatus = 100;
            updateHealthBar();
        }
        
        // Actualizar UI
        updateThirstBar();
        
        // Mostrar mensaje
        showPlantMessage('¡Ahh! ¡Qué rico el agua!');
        
        // Animar planta
        plant.classList.add('animate');
        setTimeout(() => {
            plant.classList.remove('animate');
        }, 500);
    }
    
    // Animación de la regadera
    function showWateringCan() {
        // Busca si ya existe una regadera
        let wateringCan = document.getElementById('watering-can');
        
        // Si no existe, la crea
        if (!wateringCan) {
            wateringCan = document.createElement('img');
            wateringCan.id = 'watering-can';
            wateringCan.src = '../resources/img/watering_can.png'; // Nombre correcto de la imagen
            wateringCan.style.left = '40%'; // Mover la regadera más a la izquierda
            document.querySelector('.pet').appendChild(wateringCan);
        }
        
        // Muestra la regadera con animación
        wateringCan.classList.add('show');
        
        // Oculta la regadera después de 1 segundo
        setTimeout(() => {
            wateringCan.classList.remove('show');
        }, 1000);
    }
    
    // Botón de regar (click simple)
    drinkButton.addEventListener('click', function(e) {
        e.preventDefault();
        showWateringCan();
        waterPlant();
    });
    
    // Para dispositivos táctiles asegurar que funciona con tap
    drinkButton.addEventListener('touchstart', function(e) {
        e.preventDefault();
    });
    
    drinkButton.addEventListener('touchend', function(e) {
        e.preventDefault();
        if (!e.target.moved) {
            showWateringCan();
            waterPlant();
        }
    });
    
    // Botón de chat
    chatButton.addEventListener('click', function(e) {
        e.preventDefault();
        
        // Mostrar mensaje aleatorio
        const randomIndex = Math.floor(Math.random() * plantMessages.length);
        showPlantMessage(plantMessages[randomIndex]);
    });
    
    // Deterioro gradual de la planta - Más rápido para desarrollo
    function deterioratePlant() {
        // Reducir nivel de sed mucho más rápido para pruebas
        thirstStatus -= 10; // Reducción más rápida (era 2)
        if (thirstStatus < 0) thirstStatus = 0;
        
        // Solo reducir salud si la sed está en 0
        if (thirstStatus === 0) {
            healthStatus -= 5; // Reducción más rápida (era 1)
            if (healthStatus < 0) healthStatus = 0;
        }
        
        // Recuperar vida si tiene mucha agua
        if (thirstStatus > 75 && healthStatus < 100) {
            healthStatus += 2; // Recupera vida gradualmente
            if (healthStatus > 100) healthStatus = 100;
        }
        
        updateHealthBar();
        updateThirstBar();
        
        // Avisar al usuario si los niveles son bajos
        if (thirstStatus < 20) {
            showPlantMessage('¡Tengo sed! ¡Riégame por favor!');
        } else if (healthStatus < 30) {
            showPlantMessage('¡Me estoy marchitando!');
        }
    }
    
    // Inicializar valores y UI
    updateHealthBar();
    updateThirstBar();

    // Empezar deterioro cada 5 segundos (más rápido para desarrollo)
    setInterval(deterioratePlant, 5000); // Intervalo más corto (era 15000)
    
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
            
            // Reducir valores según el tiempo transcurrido (más rápido para desarrollo)
            thirstStatus = Math.max(0, thirstStatus - timeElapsed * 2.0); // Más rápido (era 0.5)
            
            // Reducir salud solo si la sed ha estado en 0
            if (thirstStatus === 0) {
                healthStatus = Math.max(0, healthStatus - timeElapsed * 1.0); // Más rápido (era 0.2)
            }
            
            // Actualizar UI
            updateHealthBar();
            updateThirstBar();
            
            // Mensaje basado en el estado
            if (thirstStatus < 20) {
                setTimeout(() => {
                    showPlantMessage('¡He estado sin agua mucho tiempo!');
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