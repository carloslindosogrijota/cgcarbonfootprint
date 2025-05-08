// Constantes para la calculadora de huella ecológica
const carbonImpact = {
  waterPlant: -0.5,         // Ahorrar agua al regar eficientemente
  feedOrganically: -2.0,    // Usar compost en lugar de fertilizantes químicos
  walkInstead: -3.6,        // Caminar 5km en lugar de conducir (0.72kg/km)
  recyclePlastic: -1.5,     // Reciclar 1kg de plástico
  usePublicTransport: -4.2, // Usar transporte público en lugar de coche (10km)
  useCar: 2.3,              // Usar coche para un trayecto de 10km
  buyAccessory: 5.0,        // Producción de un pequeño accesorio
  leaveDevicesOn: 1.2       // Dispositivos en standby por día
};

// Al cargar la página
document.addEventListener('DOMContentLoaded', function() {
  // Estado de la aplicación
  let totalCO2 = 0;
  let actions = [];
  let plantLevel = 2;
  
  // Elementos del DOM
  const calculatorButton = document.getElementById('calculator-button');
  const tipsButton = document.getElementById('tips-button');
  const calculatorView = document.getElementById('calculator-view');
  const tipsView = document.getElementById('tips-view');
  const co2Value = document.getElementById('co2-value');
  const actionsHistory = document.getElementById('actions-history');
  const plantLevelElement = document.getElementById('plant-level');
  const plantAvatar = document.getElementById('plant-avatar');
  
  // Cambiar entre vistas
  calculatorButton.addEventListener('click', function() {
    setActiveView('calculator');
  });
  
  tipsButton.addEventListener('click', function() {
    setActiveView('tips');
  });
  
  function setActiveView(view) {
    // Actualizar botones
    calculatorButton.classList.toggle('active', view === 'calculator');
    tipsButton.classList.toggle('active', view === 'tips');
    
    // Actualizar vistas
    calculatorView.classList.toggle('active', view === 'calculator');
    tipsView.classList.toggle('active', view === 'tips');
  }
  
  // Registrar acciones
  const actionButtons = document.querySelectorAll('.action-button');
  actionButtons.forEach(button => {
    button.addEventListener('click', function() {
      const actionType = this.getAttribute('data-action');
      recordAction(actionType);
    });
  });
  
  function recordAction(actionType) {
    // Calcular impacto
    const impact = carbonImpact[actionType];
    
    // Crear nueva acción
    const now = new Date();
    const timeStr = now.getHours().toString().padStart(2, '0') + ':' + 
                   now.getMinutes().toString().padStart(2, '0');
    
    const newAction = {
      id: Date.now(),
      type: actionType,
      impact: impact,
      time: timeStr
    };
    
    // Actualizar array de acciones (límite a las 10 más recientes)
    actions.unshift(newAction);
    if (actions.length > 10) {
      actions.pop();
    }
    
    // Actualizar CO2 total
    totalCO2 = parseFloat((totalCO2 + impact).toFixed(1));
    
    // Actualizar UI
    updateUI();
  }
  
  function updateUI() {
    // Actualizar valor de CO2
    if (totalCO2 <= 0) {
      co2Value.textContent = `${Math.abs(totalCO2).toFixed(1)} kg ahorrado`;
      co2Value.className = 'co2-negative';
    } else {
      co2Value.textContent = `${totalCO2.toFixed(1)} kg emitido`;
      co2Value.className = 'co2-positive';
    }
    
    // Actualizar nivel de planta
    updatePlantLevel();
    
    // Actualizar historial
    renderActionHistory();
  }
  
  function updatePlantLevel() {
    let newLevel;
    
    if (totalCO2 <= -15) {
      newLevel = 5;
    } else if (totalCO2 <= -10) {
      newLevel = 4;
    } else if (totalCO2 <= -5) {
      newLevel = 3;
    } else if (totalCO2 <= 5) {
      newLevel = 2;
    } else {
      newLevel = 1;
    }
    
    // Solo actualizar si cambió
    if (newLevel !== plantLevel) {
      plantLevel = newLevel;
      plantLevelElement.textContent = plantLevel;
      
      // Actualizar avatar de la planta según el nivel
      // Aquí puedes cambiar la imagen de la planta si tienes diferentes versiones
      // Por ahora solo añadiremos una clase
      plantAvatar.className = `plant-level-${plantLevel}`;
    }
  }
  
  function renderActionHistory() {
    // Limpiar el contenedor de historial
    actionsHistory.innerHTML = '';
    
    // Si no hay acciones, mostrar mensaje vacío
    if (actions.length === 0) {
      actionsHistory.innerHTML = '<div class="empty-history">Registra tus primeras acciones para ver su impacto</div>';
      return;
    }
    
    // Renderizar cada acción
    actions.forEach(action => {
      const actionItem = document.createElement('div');
      actionItem.className = 'action-item';
      
      const isPositive = action.impact < 0;
      const actionName = getActionName(action.type);
      
      actionItem.innerHTML = `
        <div class="action-info">
          <span class="action-status">${isPositive ? '✅' : '⚠️'}</span>
          <div class="action-details">
            <p class="action-name">${actionName}</p>
            <p class="action-time">${action.time}</p>
          </div>
        </div>
        <div class="action-impact ${isPositive ? 'positive' : 'negative'}">
          ${isPositive ? '-' : '+'}${Math.abs(action.impact).toFixed(1)} kg
        </div>
      `;
      
      actionsHistory.appendChild(actionItem);
    });
  }
  
  // Obtener nombre legible de la acción
  function getActionName(actionType) {
    switch(actionType) {
      case 'waterPlant': return 'Regar planta';
      case 'feedOrganically': return 'Abono natural';
      case 'walkInstead': return 'Caminar';
      case 'recyclePlastic': return 'Reciclar';
      case 'usePublicTransport': return 'Trans. público';
      case 'useCar': return 'Usar coche';
      case 'buyAccessory': return 'Nuevo accesorio';
      case 'leaveDevicesOn': return 'Dispositivos ON';
      default: return actionType;
    }
  }
  
  // Inicializar la UI
  updateUI();
  
  // Agregar algunas acciones iniciales de ejemplo
  setTimeout(() => {
    recordAction('waterPlant');
    recordAction('recyclePlastic');
  }, 1000);
});
