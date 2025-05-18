// Selección de items en el inventario
document.addEventListener('DOMContentLoaded', function() {
    // Referencias a elementos DOM
    const petPlantElement = document.querySelector('.pet img');
    const originalPlantImage = petPlantElement.src; // Guardar la imagen original
    const equipButton = document.getElementById('equip-button');
    const inventoryItems = document.querySelectorAll('.inventory-item:not(.locked)');
    const closetModal = document.getElementById('closet-modal');
    
    // Variable para la selección de inventario
    let selectedItem = null;

    // Función para mostrar mensaje de la planta
    function showPlantMessage(message) {
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
        document.querySelector('.pet').appendChild(messageElement);
        
        // Eliminar mensaje después de 3 segundos
        setTimeout(() => {
            messageElement.remove();
        }, 3000);
    }

    // Depuración: Mostrar todos los items disponibles en la consola
    console.log("Items disponibles:");
    inventoryItems.forEach(item => {
        const itemName = item.querySelector('p').textContent.trim();
        console.log(itemName);
    });

    // Selección de items en el inventario
    inventoryItems.forEach(item => {
        item.addEventListener('click', () => {
            // Eliminar selección previa
            document.querySelectorAll('.inventory-item').forEach(i => {
                i.classList.remove('selected');
            });
            
            // Seleccionar nuevo item
            item.classList.add('selected');
            selectedItem = item;
            
            // Depuración: Mostrar el item seleccionado
            console.log("Item seleccionado:", selectedItem.querySelector('p').textContent.trim());
        });
    });

    // Funcionalidad para "Equipar" item seleccionado
    if (equipButton) {
        equipButton.addEventListener('click', () => {
            if (selectedItem) {
                const itemName = selectedItem.querySelector('p').textContent.trim();
                console.log("Equipando:", itemName);
                
                // Verificar si es la gorra multicolor o las gafas basicas (usando nombres exactos)
                if (itemName === "Gorra Multicolor" || itemName.includes("Multicolor")) {
                    console.log("Equipando Gorra Multicolor");
                    // Cambiar imagen a funcional.jpeg
                    petPlantElement.src = '../resources/img/Accesorios/funcional.png';
                    showPlantMessage('¡Me encanta esta gorra de colores!');
                    
                    // Guardar el item equipado en localStorage
                    localStorage.setItem('equippedItem', 'gorra');
                } 
                else if (itemName === "Gafas Basicas" || itemName === "Gafas" || itemName.includes("Gafas")) {
                    console.log("Equipando Gafas Basicas");
                    // Cambiar imagen a funcional2.jpeg
                    petPlantElement.src = '../resources/img/Accesorios/funcional2.png';
                    showPlantMessage('¡Ahora veo mejor!');
                    
                    // Guardar el item equipado en localStorage
                    localStorage.setItem('equippedItem', 'gafas');
                } 
                else {
                    // Para otros accesorios, mostrar un mensaje genérico
                    console.log("Equipando otro accesorio:", itemName);
                    showPlantMessage(`¡Me has equipado: ${itemName}!`);
                }
                
                // Cerrar el modal después de equipar
                closetModal.style.display = 'none';
            } else {
                showPlantMessage('¡Selecciona un accesorio primero!');
            }
        });
    }

    // También podrías añadir un botón para quitar accesorios
    const removeButton = document.createElement('button');
    removeButton.id = 'remove-button';
    removeButton.className = 'pixel-button';
    removeButton.textContent = 'Quitar';
    
    // Añadir el botón al modal si no existe ya
    const modalFooter = document.querySelector('.modal-footer');
    if (modalFooter && !document.getElementById('remove-button')) {
        modalFooter.appendChild(removeButton);
        
        // Evento para quitar accesorios
        removeButton.addEventListener('click', () => {
            petPlantElement.src = originalPlantImage;
            showPlantMessage('¡Me siento libre de nuevo!');
            localStorage.removeItem('equippedItem');
            closetModal.style.display = 'none';
        });
    }

    // Cargar el último accesorio equipado al cargar la página
    const lastItemEquipped = localStorage.getItem('equippedItem');
    if (lastItemEquipped) {
        if (lastItemEquipped === 'gorra') {
            petPlantElement.src = '../resources/img/Acessorios/funcional.png';
        } else if (lastItemEquipped === 'gafas') {
            petPlantElement.src = '../resources/img/Accesorios/funcional2.png';
        }
    }
});