/*document.addEventListener("DOMContentLoaded", () => {
    const drinkButton = document.getElementById("drink");
    const drinkStatus = document.getElementById("drink-status");
    const petDiv = document.querySelector(".pet");
 
    drinkButton.addEventListener("click", (e) => {
       e.preventDefault();
 
       drinkStatus.src = "../resources/img/bar/bluebar_04.png";
 
       const wateringCan = document.createElement("img");
       wateringCan.src = "../resources/img/watering_can.png";
       wateringCan.alt = "Watering the pet";
       wateringCan.style.position = "absolute";
       wateringCan.style.top = "40%";
       wateringCan.style.left = "35%";
       wateringCan.style.zIndex = "10";
       wateringCan.style.pointerEvents = "none";
       wateringCan.style.width = "80px";
 
       // Añadimos animación de entrada
       wateringCan.className = "animate__animated animate__fadeInDown";
       petDiv.appendChild(wateringCan);
 
       // Al terminar fadeInDown, fijamos la posición final
       const handleFadeInEnd = (event) => {
          if (event.animationName === "fadeInDown") {
             // Importante: remover animaciones para poder poner estilo fijo
             wateringCan.classList.remove("animate__animated", "animate__fadeInDown");
             wateringCan.style.transform = "translate(-40%, 0)"; // <- Esta es la posición visual final del fadeInDown
 
             // Esperar un poco antes de hacer el fadeOut
             setTimeout(() => {
                wateringCan.classList.add("animate__animated", "animate__fadeOut");
             }, 1000);
          } else if (event.animationName === "fadeOut") {
             // Eliminar después del fadeOut
             wateringCan.removeEventListener("animationend", handleFadeInEnd);
             if (wateringCan.parentElement) {
                petDiv.removeChild(wateringCan);
             }
          }
       };
 
       wateringCan.addEventListener("animationend", handleFadeInEnd);
    });
 });
 */
 document.addEventListener("DOMContentLoaded", () => {
   const drinkButton = document.getElementById("drink");
   const drinkStatus = document.getElementById("drink-status");
   const wateringCan = document.getElementById("watering-can");

   const barImages = [
      "../resources/img/bar/bluebar_02.png",
      "../resources/img/bar/bluebar_03.png",
      "../resources/img/bar/bluebar_04.png",
      "../resources/img/bar/bluebar_05.png"
   ];

   let currentBarIndex = 0;

   if (drinkButton) {
      drinkButton.addEventListener("click", function(event) {
         event.preventDefault();

         // Mostrar regadera con clase animada
         if (wateringCan) {
            wateringCan.classList.add("show");

            setTimeout(() => {
               wateringCan.classList.remove("show");
            }, 1500);
         }

         /*// Cambiar barra de sed
         if (drinkStatus && currentBarIndex < barImages.length - 1) {
            currentBarIndex++;
            drinkStatus.src = barImages[currentBarIndex];
         }*/
      });
   }
});

 