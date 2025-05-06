/**
 * CIMPA GAME - Perfil
 * Script para controlar las interacciones en la página de perfil
 */

document.addEventListener('DOMContentLoaded', function() {
    // Elementos DOM para el modal de cambio de nombre
    const renameButton = document.querySelector('.rename-button');
    const renameModal = document.getElementById('rename-modal');
    const closeModal = document.querySelector('.close-modal');
    const saveNameButton = document.getElementById('save-name');
    const cancelNameButton = document.getElementById('cancel-name');
    const newNameInput = document.getElementById('new-name');
    const profileName = document.querySelector('.profile-info h1');
    
    // Abrir modal de cambio de nombre
    renameButton.addEventListener('click', function() {
        renameModal.style.display = 'block';
        newNameInput.value = profileName.textContent;
        newNameInput.focus();
    });
    
    // Cerrar modal (X)
    closeModal.addEventListener('click', function() {
        renameModal.style.display = 'none';
    });
    
    // Cerrar modal (Cancelar)
    cancelNameButton.addEventListener('click', function() {
        renameModal.style.display = 'none';
    });
    
    // Guardar nuevo nombre
    saveNameButton.addEventListener('click', function() {
        const newName = newNameInput.value.trim();
        if (newName !== '') {
            profileName.textContent = newName;
            
            // Guardar en localStorage para persistencia
            localStorage.setItem('plantName', newName);
            
            // Mostrar animación de éxito
            profileName.style.animation = 'pulse 0.5s';
            setTimeout(() => {
                profileName.style.animation = '';
            }, 500);
            
            // Cerrar modal
            renameModal.style.display = 'none';
        }
    });
    
    // Cerrar modal al hacer clic fuera
    window.addEventListener('click', function(e) {
        if (e.target === renameModal) {
            renameModal.style.display = 'none';
        }
    });
    
    // Cargar nombre guardado (si existe)
    const savedName = localStorage.getItem('plantName');
    if (savedName) {
        profileName.textContent = savedName;
    }

    // Detectar la página actual para resaltar el elemento de navegación
    const currentPath = window.location.pathname;
    const navItems = document.querySelectorAll('.footer-item');
    
    navItems.forEach(item => {
        const href = item.getAttribute('href');
        
        // Si la URL actual termina con el href o es "perfil.html"
        if (currentPath.endsWith(href) || 
            (currentPath.endsWith('perfil.html') && href === 'game.html')) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
});