/**
 * CIMPA GAME - Funcionalidad mejorada del juego
 * Script para controlar las interacciones con la planta virtual
 * Versión: 2.0
 */

// Función principal encapsulada para evitar variables globales
(function () {
  // Variables y funciones que se utilizarán en todo el código
  let healthStatus = 100; // Valor inicial 100%
  let thirstStatus = 75; // Valor inicial 75%
  let deteriorateInterval; // Variable para almacenar el intervalo de deterioro

  const MAX_STATUS = 100; // Valor máximo de salud/sed
  const MIN_STATUS = 0; // Valor mínimo de salud/sed
  const WARNING_THRESHOLD = 30; // Nivel para mostrar advertencia
  const GOOD_THRESHOLD = 75; // Nivel considerado bueno
  const WATER_INCREASE = 15; // Aumento de sed al regar
  const HEALTH_INCREASE = 8; // Aumento de salud al alimentar
  const THIRST_DECREASE = 0.01; // Reducción de sed por minuto (más lento)
  const HEALTH_DECREASE = 0.1; // Reducción de salud cuando hay sed baja
  const GRADUAL_HEALTH_INCREASE = 0.2; // Aumento gradual de salud cuando la sed es buena
  const MESSAGE_DURATION = 3000; // 4 segundos para los mensajes
  const DETERIORATE_INTERVAL = 3000; // Comprobar deterioro cada 60 segundos (1 minuto)
  const INITIAL_MESSAGE_DELAY = 2000;

  // Objeto para agrupar todos los selectores de DOM
  const DOM = {
    healthBar: document.getElementById("health-bar"),
    thirstBar: document.getElementById("thirst-bar"),
    healthIcon: document.getElementById("health-icon"),
    thirstIcon: document.getElementById("thirst-icon"),
    plant: document.querySelector(".pet img"),
    plantContainer: document.querySelector(".pet"),
    drinkButton: document.getElementById("drink"),
    chatButton: document.getElementById("chat"),
    closetButton: document.getElementById("closet"),
    closetModal: document.getElementById("closet-modal"),
    closeModalBtn: document.querySelector(".close-modal"),
    closeButton: document.getElementById("close-button"),
    equipButton: document.getElementById("equip-button"),
    inventoryItems: document.querySelectorAll(".inventory-item:not(.locked)"),
    navItems: document.querySelectorAll(".footer-item"),
  };

  // Rutas de imágenes para los iconos
  const iconExpressions = {
    fullHealth: "../resources/img/expression_health_love.png",
    midHealth: "../resources/img/expression_health_middle.png",
    emptyHealth: "../resources/img/expression_health_sad.png",
    fullThirst: "../resources/img/expression_thirst_full.png",
    midThirst: "../resources/img/expression_thirst_mid.png",
    emptyThirst: "../resources/img/expression_thirst_sad.png",
  };

  // Mensajes de la planta
  const plantMessages = [
    "¡Tengo sed!",
    "¡Me siento muy bien!",
    "¡Gracias por cuidarme!",
    "¡Necesito agua!",
  ];

  /**
   * Función para actualizar la barra de salud
   */
  function updateHealthBar() {
    DOM.healthBar.style.width = healthStatus + "%";

    if (healthStatus < WARNING_THRESHOLD) {
      DOM.healthBar.classList.add("warning");
      DOM.healthIcon.src = iconExpressions.emptyHealth;
    } else if (healthStatus < GOOD_THRESHOLD) {
      DOM.healthBar.classList.remove("warning");
      DOM.healthIcon.src = iconExpressions.midHealth;
    } else {
      DOM.healthBar.classList.remove("warning");
      DOM.healthIcon.src = iconExpressions.fullHealth;
    }
  }

  /**
   * Función para actualizar la barra de sed
   */
  function updateThirstBar() {
    DOM.thirstBar.style.width = thirstStatus + "%";

    if (thirstStatus < WARNING_THRESHOLD) {
      DOM.thirstBar.classList.add("warning");
      DOM.thirstIcon.src = iconExpressions.emptyThirst;
    } else if (thirstStatus < GOOD_THRESHOLD) {
      DOM.thirstBar.classList.remove("warning");
      DOM.thirstIcon.src = iconExpressions.midThirst;
    } else {
      DOM.thirstBar.classList.remove("warning");
      DOM.thirstIcon.src = iconExpressions.fullThirst;
    }
  }

  /**
   * Función para mostrar mensaje de la planta
   * @param {string} message - El mensaje a mostrar
   */
  function showPlantMessage(message) {
    // Eliminar mensaje anterior si existe
    const oldMessage = document.querySelector(".plant-message");
    if (oldMessage) {
      oldMessage.remove();
    }

    // Crear nuevo mensaje
    const messageElement = document.createElement("div");
    messageElement.className = "plant-message";
    messageElement.textContent = message;

    // Añadir mensaje a la planta
    DOM.plantContainer.appendChild(messageElement);

    // Eliminar mensaje después del tiempo especificado
    setTimeout(() => {
      if (messageElement.parentNode) {
        messageElement.remove();
      }
    }, MESSAGE_DURATION);
  }

  /**
   * Función para regar la planta
   */
  function waterPlant() {
    // Si el agua ya está al máximo, mostrar mensaje de advertencia
    if (thirstStatus >= MAX_STATUS) {
      showPlantMessage("¡Cuidado! ¡No me ahogues con tanta agua!");
      return;
    }

    // Aumentar nivel de hidratación
    thirstStatus += WATER_INCREASE;
    if (thirstStatus > MAX_STATUS) thirstStatus = MAX_STATUS;

    // Si el agua está por encima del umbral, recuperar vida
    if (thirstStatus > GOOD_THRESHOLD && healthStatus < MAX_STATUS) {
      healthStatus += HEALTH_INCREASE;
      if (healthStatus > MAX_STATUS) healthStatus = MAX_STATUS;
      updateHealthBar();
    }

    // Actualizar UI
    updateThirstBar();

    // Mostrar mensaje
    showPlantMessage("¡Ahh! ¡Qué rico el agua!");

    // Animar planta
    DOM.plant.classList.add("animate");
    setTimeout(() => {
      DOM.plant.classList.remove("animate");
    }, 500);

    // Guardar estado después de la acción
    saveState();
  }

  /**
   * Animación de la regadera
   */
  function showWateringCan() {
    // Busca si ya existe una regadera
    let wateringCan = document.getElementById("watering-can");

    // Si no existe, la crea
    if (!wateringCan) {
      wateringCan = document.createElement("img");
      wateringCan.id = "watering-can";
      wateringCan.src = "../resources/img/watering_can.png";
      wateringCan.style.left = "40%"; // Mover la regadera más a la izquierda
      DOM.plantContainer.appendChild(wateringCan);
    }

    // Muestra la regadera con animación
    wateringCan.classList.add("show");

    // Oculta la regadera después de 1 segundo
    setTimeout(() => {
      wateringCan.classList.remove("show");
    }, 1000);
  }

  /**
   * Deterioro gradual de la planta
   */
  function deterioratePlant() {
    // Reducir nivel de sed
    thirstStatus -= THIRST_DECREASE;
    if (thirstStatus < MIN_STATUS) thirstStatus = MIN_STATUS;

    // Solo reducir salud si la sed está en 0
    if (thirstStatus === MIN_STATUS) {
      healthStatus -= HEALTH_DECREASE;
      if (healthStatus < MIN_STATUS) healthStatus = MIN_STATUS;
    }

    // Recuperar vida si tiene mucha agua
    if (thirstStatus > GOOD_THRESHOLD && healthStatus < MAX_STATUS) {
      healthStatus += GRADUAL_HEALTH_INCREASE;
      if (healthStatus > MAX_STATUS) healthStatus = MAX_STATUS;
    }

    updateHealthBar();
    updateThirstBar();

    // Avisar al usuario si los niveles son bajos
    if (thirstStatus < 20 && Math.random() < 0.3) {
      // Solo muestra el mensaje el 30% de las veces
      showPlantMessage("¡Tengo sed! ¡Riégame por favor!");
    } else if (healthStatus < WARNING_THRESHOLD && Math.random() < 0.3) {
      showPlantMessage("¡Me estoy marchitando!");
    }

    // Guardar estado periódicamente
    saveState();
  }

  /**
   * Guardar estado en localStorage
   */
  function saveState() {
    localStorage.setItem("healthStatus", healthStatus);
    localStorage.setItem("thirstStatus", thirstStatus);
    localStorage.setItem("lastVisit", Date.now());
  }

  /**
   * Cargar estado desde localStorage si existe
   */
  function loadState() {
    const savedHealthStatus = localStorage.getItem("healthStatus");
    const savedThirstStatus = localStorage.getItem("thirstStatus");
    const lastVisit = localStorage.getItem("lastVisit");

    if (
      savedHealthStatus !== null &&
      savedThirstStatus !== null &&
      lastVisit !== null
    ) {
      // Calcular tiempo transcurrido desde la última visita (en minutos)
      const timeElapsed = (Date.now() - lastVisit) / 60000;

      // Cargar valores guardados
      healthStatus = parseFloat(savedHealthStatus);
      thirstStatus = parseFloat(savedThirstStatus);

      // Reducir valores según el tiempo transcurrido
      thirstStatus = Math.max(MIN_STATUS, thirstStatus - timeElapsed * 2.0);

      // Reducir salud solo si la sed ha estado en 0
      if (thirstStatus === MIN_STATUS) {
        healthStatus = Math.max(MIN_STATUS, healthStatus - timeElapsed * 1.0);
      }

      // Actualizar UI
      updateHealthBar();
      updateThirstBar();

      // Mensaje basado en el estado
      if (thirstStatus < 20) {
        setTimeout(() => {
          showPlantMessage("¡He estado sin agua mucho tiempo!");
        }, INITIAL_MESSAGE_DELAY);
      }
    }
  }

  /**
   * Inicializar el estado activo del elemento de navegación
   */
  function setActiveNavItem() {
    const currentPath = window.location.pathname;

    DOM.navItems.forEach((item) => {
      const href = item.getAttribute("href");

      // Si la URL actual termina con el href, añadir clase activa
      if (currentPath.endsWith(href)) {
        item.classList.add("active");
      } else {
        item.classList.remove("active");
      }
    });
  }

  /**
   * Inicializar la funcionalidad de la modal de inventario
   */
  function initInventoryModal() {
    // Abrir modal al hacer clic en el botón del armario
    DOM.closetButton.addEventListener("click", function (e) {
      e.preventDefault();
      DOM.closetModal.style.display = "block";
      document.body.style.overflow = "hidden"; // Evitar scroll en la página
    });

    // Cerrar modal con el botón X
    DOM.closeModalBtn.addEventListener("click", function () {
      DOM.closetModal.style.display = "none";
      document.body.style.overflow = "auto"; // Restaurar scroll
    });

    // Cerrar modal con el botón Cerrar
    DOM.closeButton.addEventListener("click", function () {
      DOM.closetModal.style.display = "none";
      document.body.style.overflow = "auto"; // Restaurar scroll
    });

    // Cerrar modal al hacer clic fuera de ella
    window.addEventListener("click", function (e) {
      if (e.target === DOM.closetModal) {
        DOM.closetModal.style.display = "none";
        document.body.style.overflow = "auto"; // Restaurar scroll
      }
    });

    // Seleccionar una prenda
    DOM.inventoryItems.forEach((item) => {
      item.addEventListener("click", function () {
        // Remover selección previa
        document
          .querySelectorAll(".inventory-item.selected")
          .forEach((selected) => {
            selected.classList.remove("selected");
          });

        // Añadir selección actual
        this.classList.add("selected");
      });
    });

    // Equipar prenda seleccionada
    DOM.equipButton.addEventListener("click", function () {
      const selectedItem = document.querySelector(".inventory-item.selected");

      if (selectedItem) {
        // Aquí iría la lógica para equipar la prenda a la planta
        const itemName = selectedItem.querySelector("p").textContent;

        // Mostrar mensaje
        showPlantMessage(`¡Me encanta mi nuevo ${itemName}!`);

        // Cerrar modal
        DOM.closetModal.style.display = "none";
        document.body.style.overflow = "auto"; // Restaurar scroll
      }
    });
  }

  /**
   * Inicializar todos los event listeners
   */
  function setupEventListeners() {
    // Botón de regar (click)
    DOM.drinkButton.addEventListener("click", function (e) {
      e.preventDefault();
      showWateringCan();
      waterPlant();
    });

    // Para dispositivos táctiles
    DOM.drinkButton.addEventListener("touchstart", function (e) {
      e.preventDefault();
    });

    DOM.drinkButton.addEventListener("touchend", function (e) {
      e.preventDefault();
      if (!e.target.moved) {
        showWateringCan();
        waterPlant();
      }
    });

    // Botón de chat
    DOM.chatButton.addEventListener("click", function (e) {
      e.preventDefault();

      // Mostrar mensaje aleatorio
      const randomIndex = Math.floor(Math.random() * plantMessages.length);
      showPlantMessage(plantMessages[randomIndex]);
    });

    // Guardar estado al cerrar la página
    window.addEventListener("beforeunload", saveState);
  }

  /**
   * Inicializar el juego
   */
  function init() {
    // Cargar estado del almacenamiento local
    loadState();

    // Configurar event listeners
    setupEventListeners();

    // Inicializar navegación activa
    setActiveNavItem();

    // Inicializar modal de inventario
    initInventoryModal();

    // Actualizar UI inicial
    updateHealthBar();
    updateThirstBar();

    // Mostrar mensaje inicial después de un breve retraso
    setTimeout(() => {
      showPlantMessage("¡Hola! ¡Cuida de mí!");
    }, INITIAL_MESSAGE_DELAY);

    // Iniciar deterioro gradual
    deteriorateInterval = setInterval(deterioratePlant, DETERIORATE_INTERVAL);
  }

  // Iniciar el juego cuando el DOM esté cargado
  document.addEventListener("DOMContentLoaded", init);
})();
