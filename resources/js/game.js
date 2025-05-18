/**
 * CIMPA GAME - GRUPO 7
 * Game.js - Controla todas las funcionalidades de la planta virtual
 * Versión: 3.1
 */

// ===== Variables globales =====
let healthValue = 80; // Comenzar con buena salud
let thirstValue = 70; // Comenzar con buen nivel de agua
let coinValue = 0;
let petPlantElement = document.querySelector('.pet img');
let originalPlantImage = petPlantElement ? petPlantElement.src : '';
let lastInteractionTime = Date.now();
let gameActive = true;
let debugMode = true; // Activar para desarrollo

// Referencias a elementos DOM
const healthBar = document.getElementById('health-bar');
const thirstBar = document.getElementById('thirst-bar');
const healthIcon = document.getElementById('health-icon');
const thirstIcon = document.getElementById('thirst-icon');
const drinkButton = document.getElementById('drink');
const closetButton = document.getElementById('closet');
const chatButton = document.getElementById('chat');
const closetModal = document.getElementById('closet-modal');
const closeModalButton = document.querySelector('.close-modal');
const closeButton = document.getElementById('close-button');
const equipButton = document.getElementById('equip-button');
const coinsDisplay = document.querySelector('.coins p');

// Constantes de configuración
const HEALTH_DECAY_INTERVAL = 3000; // 3 segundos - más rápido
const HEALTH_DECAY_RATE = 1.2; // Cuánto baja la salud cada intervalo - incrementado
const THIRST_DECAY_INTERVAL = 2000; // 2 segundos
const THIRST_DECAY_RATE = 1.5; // Cuánto baja la sed cada intervalo
const HEALTH_REGEN_INTERVAL = 4000; // Cada 4 segundos verifica si debe regenerar salud
const HEALTH_REGEN_RATE = 0.8; // Cuánto regenera de salud cuando hay suficiente agua
const HEALTH_REGEN_THRESHOLD = 80; // Umbral de agua para regenerar salud
const WATER_BOOST = 5; // Aumento inmediato de salud al regar (nuevo)
const MESSAGE_DURATION = 3000; // Duración de mensajes en pantalla
const LOW_STAT_THRESHOLD = 30; // Umbral para considerar una estadística baja
const CRITICAL_STAT_THRESHOLD = 15; // Umbral para estadística crítica
const WATER_REWARD = 25; // Recompensa por regar
const COIN_REWARD = 5; // Monedas ganadas por acción positiva

// Variables para mensajes
let messageQueue = [];
let isShowingMessage = false;
let messageTimeout = null;

// ===== Inicialización =====
document.addEventListener('DOMContentLoaded', function() {
    logDebug('Juego inicializado');
    
    // Asegurarse de que los elementos DOM existen
    if (!healthBar || !thirstBar) {
        logDebug('Error: No se encontraron elementos DOM críticos');
        return;
    }
    
    // Inicializar elementos de la planta
    initializePlantElements();
    
    // Cargar datos guardados
    loadSavedData();
    
    // Inicializar la interfaz de usuario
    updateBars();
    updateCoinsDisplay();
    
    // Configurar temporizadores
    setupTimers();
    
    // Inicializar eventos
    setupEventListeners();
    
    // Mensaje de bienvenida
    queueMessage('¡Hola! ¡Bienvenido a CIMPA!');
    
    // Activar el inventario y accesorios
    initializeInventory();
    
    // Forzar un guardado inmediato para confirmar persistencia
    saveData();
    
    // Log de depuración
    logDebug(`Estado inicial: Salud=${healthValue}, Agua=${thirstValue}, Monedas=${coinValue}`);
});

// Inicializar referencias a elementos de la planta
function initializePlantElements() {
    // Asegurarse de que tenemos referencia a la planta
    if (!petPlantElement) {
        petPlantElement = document.querySelector('.pet img');
        if (petPlantElement) {
            originalPlantImage = petPlantElement.src;
        }
    }
}

// ===== Funciones de persistencia mejoradas =====
function loadSavedData() {
    try {
        // Verificar que localStorage está disponible
        if (typeof localStorage === 'undefined') {
            throw new Error('localStorage no está disponible');
        }
        
        // Cargar salud con verificación adicional
        const savedHealth = localStorage.getItem('petHealth');
        if (savedHealth !== null) {
            const parsedHealth = parseFloat(savedHealth);
            if (!isNaN(parsedHealth) && parsedHealth >= 0 && parsedHealth <= 100) {
                healthValue = parsedHealth;
                logDebug(`Salud cargada: ${healthValue}`);
            } else {
                logDebug(`Valor de salud inválido: ${savedHealth}, usando predeterminado`);
            }
        }
        
        // Cargar sed con verificación adicional
        const savedThirst = localStorage.getItem('petThirst');
        if (savedThirst !== null) {
            const parsedThirst = parseFloat(savedThirst);
            if (!isNaN(parsedThirst) && parsedThirst >= 0 && parsedThirst <= 100) {
                thirstValue = parsedThirst;
                logDebug(`Sed cargada: ${thirstValue}`);
            } else {
                logDebug(`Valor de sed inválido: ${savedThirst}, usando predeterminado`);
            }
        }
        
        // Cargar monedas con verificación adicional
        const savedCoins = localStorage.getItem('coins');
        if (savedCoins !== null) {
            const parsedCoins = parseFloat(savedCoins);
            if (!isNaN(parsedCoins) && parsedCoins >= 0) {
                coinValue = parsedCoins;
                logDebug(`Monedas cargadas: ${coinValue}`);
            }
        }
        
        // Calcular tiempo sin jugar
        if (localStorage.getItem('lastInteraction')) {
            const lastSaved = parseInt(localStorage.getItem('lastInteraction'));
            const now = Date.now();
            const elapsedMinutes = (now - lastSaved) / (1000 * 60);
            
            // Reducir estadísticas por tiempo sin jugar (máximo 50%)
            if (elapsedMinutes > 0) {
                const reductionPercent = Math.min(50, elapsedMinutes);
                healthValue = Math.max(20, healthValue - reductionPercent);
                thirstValue = Math.max(15, thirstValue - reductionPercent);
                logDebug(`Tiempo sin jugar: ${elapsedMinutes.toFixed(2)} minutos. Estadísticas reducidas.`);
            }
        }
        
        logDebug('Datos cargados correctamente');
    } catch (error) {
        logDebug(`Error cargando datos: ${error.message}`);
        // Valores predeterminados en caso de error
        healthValue = 70;
        thirstValue = 65;
        coinValue = 0;
    }
}

function saveData() {
    try {
        // Verificar que localStorage está disponible
        if (typeof localStorage === 'undefined') {
            throw new Error('localStorage no está disponible');
        }
        
        // Asegurarnos de que los valores están en rango válido
        const sanitizedHealth = Math.min(100, Math.max(0, healthValue));
        const sanitizedThirst = Math.min(100, Math.max(0, thirstValue));
        
        // Guardar con verificación adicional
        localStorage.setItem('petHealth', sanitizedHealth.toString());
        localStorage.setItem('petThirst', sanitizedThirst.toString());
        localStorage.setItem('coins', coinValue.toString());
        localStorage.setItem('lastInteraction', Date.now().toString());
        
        // Verificar que los datos se guardaron correctamente
        const storedHealth = localStorage.getItem('petHealth');
        const storedThirst = localStorage.getItem('petThirst');
        
        if (storedHealth !== sanitizedHealth.toString() || 
            storedThirst !== sanitizedThirst.toString()) {
            throw new Error('Verificación de guardado falló');
        }
        
        logDebug(`Datos guardados correctamente - Salud: ${sanitizedHealth}, Agua: ${sanitizedThirst}`);
    } catch (error) {
        logDebug(`Error guardando datos: ${error.message}`);
        
        // Intentar método alternativo si falla (sessionStorage como respaldo)
        try {
            if (typeof sessionStorage !== 'undefined') {
                sessionStorage.setItem('petHealth', healthValue.toString());
                sessionStorage.setItem('petThirst', thirstValue.toString());
                logDebug('Datos guardados en sessionStorage como respaldo');
            }
        } catch (backupError) {
            logDebug('Respaldo de almacenamiento también falló');
        }
    }
}

// ===== Funciones de actualización de UI =====
function updateBars() {
    // Asegurarse de que los elementos existen
    if (!healthBar || !thirstBar) {
        logDebug('Error: Barras de estado no encontradas');
        return;
    }
    
    // Actualizar la barra de salud con animación suave
    healthBar.style.transition = 'width 0.5s ease-in-out';
    healthBar.style.width = healthValue + '%';
    
    // Actualizar icono de salud según el nivel
    if (healthIcon) {
        if (healthValue < CRITICAL_STAT_THRESHOLD) {
            healthBar.classList.add('warning');
            healthIcon.src = '../../resources/img/expression_health_sad.png';
        } else if (healthValue < LOW_STAT_THRESHOLD) {
            healthBar.classList.add('warning');
            healthIcon.src = '../../resources/img/expression_health_middle.png';
        } else {
            healthBar.classList.remove('warning');
            healthIcon.src = '../../resources/img/expression_health_love.png';
        }
    }
    
    // Actualizar la barra de sed con animación suave
    thirstBar.style.transition = 'width 0.5s ease-in-out';
    thirstBar.style.width = thirstValue + '%';
    
    // Actualizar icono de sed según el nivel
    if (thirstIcon) {
        if (thirstValue < CRITICAL_STAT_THRESHOLD) {
            thirstBar.classList.add('warning');
            thirstIcon.src = '../../resources/img/expression_thirst_sad.png';
        } else if (thirstValue < LOW_STAT_THRESHOLD) {
            thirstBar.classList.add('warning');
            thirstIcon.src = '../../resources/img/expression_thirst_mid.png';
        } else {
            thirstBar.classList.remove('warning');
            thirstIcon.src = '../../resources/img/expression_thirst_full.png';
        }
    }
    
    // Guardar los datos cada vez que se actualizan las barras
    saveData();
}

function updateCoinsDisplay() {
    if (coinsDisplay) {
        coinsDisplay.textContent = coinValue.toFixed(2);
    }
}

function addCoins(amount) {
    coinValue += amount;
    updateCoinsDisplay();
    saveData();
}

// ===== Sistema de mensajes mejorado =====
function queueMessage(message) {
    // Añadir mensaje a la cola
    messageQueue.push(message);
    
    // Si no hay mensaje mostrándose actualmente, procesar la cola
    if (!isShowingMessage) {
        processMessageQueue();
    }
}

function processMessageQueue() {
    // Si no hay mensajes en la cola o ya se está mostrando uno, salir
    if (messageQueue.length === 0 || isShowingMessage) {
        return;
    }
    
    // Mostrar el siguiente mensaje
    showPlantMessage(messageQueue.shift());
}

function showPlantMessage(message) {
    // Marcar que estamos mostrando un mensaje
    isShowingMessage = true;
    
    // Verificar que el contenedor de la planta existe
    const petContainer = document.querySelector('.pet');
    if (!petContainer) {
        logDebug('Error: Contenedor de planta no encontrado');
        isShowingMessage = false;
        return;
    }
    
    // Eliminar mensaje existente si lo hay
    const existingMessage = document.querySelector('.plant-message');
    if (existingMessage) {
        existingMessage.remove();
    }
    
    // Crear nuevo mensaje
    const messageElement = document.createElement('div');
    messageElement.className = 'plant-message';
    messageElement.textContent = message;
    
    // Añadir mensaje al DOM
    petContainer.appendChild(messageElement);
    
    // Limpiar timeout anterior si existe
    if (messageTimeout) {
        clearTimeout(messageTimeout);
    }
    
    // Eliminar mensaje después del tiempo configurado
    messageTimeout = setTimeout(() => {
        if (messageElement.parentNode) {
            messageElement.remove();
        }
        isShowingMessage = false;
        
        // Procesar el siguiente mensaje si hay alguno en la cola
        setTimeout(processMessageQueue, 500); // Pequeña pausa entre mensajes
    }, MESSAGE_DURATION);
}

// ===== Temporizadores =====
function setupTimers() {
    // Degradación de salud
    setInterval(() => {
        if (!gameActive) return;
        
        // Reducir salud de forma progresiva
        healthValue = Math.max(0, healthValue - HEALTH_DECAY_RATE);
        updateBars();
        
        // Mensajes según nivel de salud
        checkHealthStatus();
    }, HEALTH_DECAY_INTERVAL);
    
    // Degradación de sed
    setInterval(() => {
        if (!gameActive) return;
        
        // Reducir sed de forma progresiva
        thirstValue = Math.max(0, thirstValue - THIRST_DECAY_RATE);
        updateBars();
        
        // Mensajes según nivel de sed
        checkThirstStatus();
    }, THIRST_DECAY_INTERVAL);
    
    // Regeneración de salud cuando hay suficiente agua
    setInterval(() => {
        if (!gameActive) return;
        
        // Si el agua está por encima del umbral, regenera salud gradualmente
        if (thirstValue >= HEALTH_REGEN_THRESHOLD && healthValue < 100) {
            healthValue = Math.min(100, healthValue + HEALTH_REGEN_RATE);
            updateBars();
            
            // Mensaje ocasional sobre la regeneración
            if (Math.random() < 0.1) {
                queueMessage('¡El agua me está ayudando a recuperarme!');
            }
        }
    }, HEALTH_REGEN_INTERVAL);
    
    // Consejos ambientales y de CO2 si la planta está saludable
    setInterval(() => {
        if (!gameActive) return;
        
        if (healthValue > 70 && thirstValue > 70 && Math.random() < 0.3) {
            const healthyTip = getRandomTip();
            queueMessage(healthyTip);
        }
    }, 45000); // Cada 45 segundos
    
    // Guardar datos periódicamente (más frecuente)
    setInterval(() => {
        saveData();
    }, 10000); // Cada 10 segundos
}

function checkHealthStatus() {
    if (healthValue < CRITICAL_STAT_THRESHOLD && Math.random() < 0.3) {
        queueMessage('¡Me estoy marchitando! ¡Necesito cuidados urgentes!');
    } else if (healthValue < LOW_STAT_THRESHOLD && Math.random() < 0.2) {
        queueMessage('No me siento bien... Mi salud está bajando.');
    }
}

function checkThirstStatus() {
    if (thirstValue < CRITICAL_STAT_THRESHOLD && Math.random() < 0.3) {
        queueMessage('¡Me estoy secando! ¡Necesito agua ya!');
    } else if (thirstValue < LOW_STAT_THRESHOLD && Math.random() < 0.2) {
        queueMessage('Tengo sed... ¿Me darías un poco de agua?');
    }
}

// ===== Eventos de usuario =====
function setupEventListeners() {
    // Comprobar si los elementos existen
    if (!drinkButton || !closetButton || !chatButton) {
        logDebug('Error: Botones de acción no encontrados');
        return;
    }
    
    // Botón de agua (regar)
    drinkButton.addEventListener('click', (e) => {
        e.preventDefault();
        waterPlant();
    });
    
    // Botón de inventario
    closetButton.addEventListener('click', (e) => {
        e.preventDefault();
        openInventory();
    });
    
    // Botón de chat
    chatButton.addEventListener('click', (e) => {
        e.preventDefault();
        talkToPlant();
    });
    
    // Eventos del modal de inventario
    if (closeModalButton) {
        closeModalButton.addEventListener('click', () => {
            closetModal.style.display = 'none';
        });
    }
    
    if (closeButton) {
        closeButton.addEventListener('click', () => {
            closetModal.style.display = 'none';
        });
    }
    
    // Cerrar modal al hacer clic fuera
    window.addEventListener('click', (e) => {
        if (e.target === closetModal) {
            closetModal.style.display = 'none';
        }
    });
    
    // Interactividad con la planta
    const petElement = document.querySelector('.pet img');
    if (petElement) {
        petElement.addEventListener('click', () => {
            talkToPlant();
        });
    }
    
    // CLAVE: Guardar datos al cerrar/refrescar la ventana
    window.addEventListener('beforeunload', () => {
        saveData();
    });
    
    // También guardar datos periódicamente mientras se juega
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') {
            saveData(); // Guardar datos cuando el usuario cambia de pestaña o minimiza
        }
    });
}

// ===== Acciones del jugador =====
function waterPlant() {
    // Mostrar animación de regadera
    showWateringCan();
    
    // Aumentar nivel de sed
    const prevThirst = thirstValue;
    thirstValue = Math.min(100, thirstValue + WATER_REWARD);
    
    // NUEVO: El agua también da un pequeño boost inmediato a la salud
    healthValue = Math.min(100, healthValue + WATER_BOOST);
    
    // Actualizar UI
    updateBars();
    
    // Recompensa de monedas
    if (thirstValue > prevThirst) {
        addCoins(COIN_REWARD);
    }
    
    // Mensaje de agradecimiento
    if (prevThirst < LOW_STAT_THRESHOLD) {
        queueMessage('¡Gracias! ¡Realmente necesitaba esa agua!');
    } else {
        const messages = [
            '¡Gracias por el agua fresca!',
            '¡Qué refrescante!',
            '¡El agua es vida!',
            '¡Me encanta el agua!',
            'Agua reciclada es ideal para plantas como yo'
        ];
        queueMessage(messages[Math.floor(Math.random() * messages.length)]);
    }
    
    // Registrar acción para huella ecológica
    if (typeof registerEcoAction === 'function') {
        registerEcoAction('waterPlant', -0.2); // Reduce CO2
    }
    
    // Guardar datos inmediatamente después de regar
    saveData();
    
    // Log de depuración
    logDebug(`Planta regada: Salud=${healthValue}, Agua=${thirstValue}`);
}

function openInventory() {
    // Verificar que el modal existe
    if (!closetModal) {
        logDebug('Error: Modal de inventario no encontrado');
        return;
    }
    
    // Mostrar el modal de inventario
    closetModal.style.display = 'block';
    
    // Mensaje sobre el inventario
    const messages = [
        '¡Veamos qué accesorios tenemos!',
        '¿Me pondrás algo nuevo?',
        '¡Me encanta cambiar de estilo!',
        '¿Qué me pondrás hoy?'
    ];
    queueMessage(messages[Math.floor(Math.random() * messages.length)]);
}

function talkToPlant() {
    // Seleccionar mensaje según estado de la planta
    const totalHealth = (healthValue + thirstValue) / 2;
    
    let messages = [];
    
    if (totalHealth < 30) {
        messages = [
            'No me siento bien... ¿Puedes ayudarme?',
            'Necesito cuidados urgentes...',
            'Me estoy marchitando poco a poco...',
            'Cuídame por favor, me siento débil',
            '¡Ayúdame a recuperarme!'
        ];
    } else if (totalHealth < 60) {
        messages = [
            'Estoy mejorando, pero aún necesito cuidados',
            'Gracias por ocuparte de mí',
            '¡Cada día me siento un poco mejor!',
            'Sigo creciendo gracias a ti',
            'Con un poco más de atención, me recuperaré por completo'
        ];
    } else {
        messages = [
            '¡Hola! Me siento genial hoy',
            'Las plantas como yo ayudamos a reducir el CO2',
            '¿Sabías que reciclar reduce tu huella ecológica?',
            'Usar transporte público ayuda al medio ambiente',
            'Apagar los dispositivos cuando no los usas ahorra energía',
            'Plantar un árbol real puede absorber hasta 22kg de CO2 al año',
            'Caminar en lugar de usar el coche reduce emisiones',
            'Gracias por cuidar de mí... ¡y del planeta!',
            'Juntos podemos hacer un mundo más verde',
            'Reducir, reutilizar, reciclar: las 3R para el planeta'
        ];
    }
    
    // Mostrar mensaje aleatorio
    queueMessage(messages[Math.floor(Math.random() * messages.length)]);
}

// ===== Efectos visuales =====
function showWateringCan() {
    // Verificar que el contenedor de la planta existe
    const petContainer = document.querySelector('.pet');
    if (!petContainer) {
        logDebug('Error: Contenedor de planta no encontrado');
        return;
    }
    
    // Comprobar si la regadera ya existe
    let wateringCan = document.getElementById('watering-can');
    
    // Si no existe, crearla
    if (!wateringCan) {
        wateringCan = document.createElement('img');
        wateringCan.id = 'watering-can';
        wateringCan.src = '../../resources/img/watering_can.png';
        wateringCan.alt = 'Regadera';
        petContainer.appendChild(wateringCan);
    }
    
    // Mostrar animación
    setTimeout(() => {
        wateringCan.classList.add('show');
    }, 10);
    
    // Ocultar después de la animación
    setTimeout(() => {
        wateringCan.classList.remove('show');
        setTimeout(() => {
            if (wateringCan.parentNode) {
                wateringCan.parentNode.removeChild(wateringCan);
            }
        }, 600); // Tiempo para la transición de desvanecimiento
    }, 1500);
}

// ===== Funcionalidad de Inventario =====
function initializeInventory() {
    // Verificar que los elementos existen
    if (!equipButton) {
        logDebug('Error: Botón de equipar no encontrado');
        return;
    }
    
    // Selección de items en el inventario
    const inventoryItems = document.querySelectorAll('.inventory-item:not(.locked)');
    let selectedItem = null;
    
    inventoryItems.forEach(item => {
        item.addEventListener('click', () => {
            // Eliminar selección previa
            document.querySelectorAll('.inventory-item').forEach(i => {
                i.classList.remove('selected');
            });
            
            // Seleccionar nuevo item
            item.classList.add('selected');
            selectedItem = item;
        });
    });
    
    // Funcionalidad para "Equipar" item seleccionado
    equipButton.addEventListener('click', () => {
        if (selectedItem) {
            const itemName = selectedItem.querySelector('p').textContent.trim();
            
            // Verificar qué item se está equipando
            if (itemName === "Gorra Multicolor" || itemName.includes("Multicolor")) {
                // Cambiar imagen a funcional.png
                petPlantElement.src = '../../resources/img/Accesorios/funcional.png';
                queueMessage('¡Me encanta esta gorra de colores!');
                
                // Guardar el item equipado
                localStorage.setItem('equippedItem', 'gorra');
            } 
            else if (itemName === "Gafas Basicas" || itemName.includes("Gafas")) {
                // Cambiar imagen a funcional2.png
                petPlantElement.src = '../../resources/img/Accesorios/funcional2.png';
                queueMessage('¡Ahora veo mejor con estas gafas!');
                
                // Guardar el item equipado
                localStorage.setItem('equippedItem', 'gafas');
            } 
            else {
                // Para otros accesorios
                queueMessage(`¡Me has equipado: ${itemName}!`);
            }
            
            // Cerrar el modal después de equipar
            closetModal.style.display = 'none';
            
            // Registrar acción para huella ecológica (reutilizar accesorios)
            if (typeof registerEcoAction === 'function') {
                registerEcoAction('reuseAccessory', -0.3);
            }
            
            // Pequeña bonificación al equipar accesorios (para mantener un incentivo)
            addCoins(2);
            
            // Guardar datos después de equipar
            saveData();
        } else {
            queueMessage('¡Selecciona un accesorio primero!');
        }
    });
    
    // Botón para quitar accesorios
    if (!document.getElementById('remove-button') && document.querySelector('.modal-footer')) {
        const removeButton = document.createElement('button');
        removeButton.id = 'remove-button';
        removeButton.className = 'pixel-button';
        removeButton.textContent = 'Quitar';
        
        document.querySelector('.modal-footer').appendChild(removeButton);
        
        removeButton.addEventListener('click', () => {
            if (petPlantElement) {
                petPlantElement.src = originalPlantImage;
                queueMessage('¡Me siento libre de nuevo!');
                localStorage.removeItem('equippedItem');
                closetModal.style.display = 'none';
                saveData(); // Guardar después de quitar accesorio
            }
        });
    }
    
    // Cargar accesorio guardado
    const lastItemEquipped = localStorage.getItem('equippedItem');
    if (lastItemEquipped && petPlantElement) {
        if (lastItemEquipped === 'gorra') {
            petPlantElement.src = '../../resources/img/Accesorios/funcional.png';
        } else if (lastItemEquipped === 'gafas') {
            petPlantElement.src = '../../resources/img/Accesorios/funcional2.png';
        }
    }
}

// ===== Consejos ecológicos =====
function getRandomTip() {
    const tips = [
        'Reducir la huella de carbono ayuda a plantas como yo',
        'Reciclar plásticos reduce la contaminación del suelo',
        'Ahorrar agua es bueno para el planeta',
        'Desconecta aparatos que no uses para ahorrar energía',
        'Las bolsas de tela son mejores que las de plástico',
        'Plantar árboles ayuda a reducir el CO2',
        'Caminar o usar bicicleta reduce emisiones',
        'El transporte público contamina menos que el coche individual',
        'Separar la basura facilita el reciclaje',
        'Una ducha corta ahorra agua y energía',
        'Los productos locales generan menos CO2 en transporte',
        'Apagar las luces que no uses ahorra energía',
        'Reutilizar objetos reduce la necesidad de producir nuevos',
        'Compostar residuos orgánicos es excelente para las plantas',
        'El papel reciclado salva árboles y reduce residuos'
    ];
    
    return tips[Math.floor(Math.random() * tips.length)];
}

// ===== Utilidades =====
function logDebug(message) {
    if (debugMode) {
        console.log(`[CIMPA Game] ${message}`);
    }
}

// ===== Prevención de errores =====
window.addEventListener('error', function(e) {
    logDebug(`Error en el juego: ${e.message}`);
    // Evitar que el juego se detenga completamente por un error
    e.preventDefault();
});

// Función para comprobar el estado de localStorage (diagnóstico)
function checkStorageState() {
  try {
      // Intentar guardar y recuperar un valor de prueba
      localStorage.setItem('testItem', 'testing');
      const testValue = localStorage.getItem('testItem');
      localStorage.removeItem('testItem');
      
      // Mostrar valores actuales en localStorage
      logDebug("=== Estado de localStorage ===");
      logDebug(`petHealth: ${localStorage.getItem('petHealth')}`);
      logDebug(`petThirst: ${localStorage.getItem('petThirst')}`);
      logDebug(`coins: ${localStorage.getItem('coins')}`);
      logDebug(`lastInteraction: ${localStorage.getItem('lastInteraction')}`);
      logDebug(`equippedItem: ${localStorage.getItem('equippedItem')}`);
      logDebug("============================");
      
      return testValue === 'testing';
  } catch (error) {
      logDebug(`Error verificando localStorage: ${error.message}`);
      return false;
  }
}

// Ejecutar comprobación de localStorage durante la inicialización
document.addEventListener('DOMContentLoaded', function() {
  // Comprobar si localStorage funciona correctamente
  const storageWorks = checkStorageState();
  logDebug(`Estado de localStorage: ${storageWorks ? 'Funcional' : 'No funcional'}`);
  
  // Si localStorage no funciona, intentar usar alternativas
  if (!storageWorks) {
      logDebug('Advertencia: localStorage no funciona correctamente. Usando memoria temporal.');
  }
});