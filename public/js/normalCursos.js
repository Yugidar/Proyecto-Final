document.addEventListener("DOMContentLoaded", function () {
    var modalUser = document.getElementById("modalUser");
    var btnUser = document.getElementById("btnUser");
    var btnCloseUser = modalUser ? modalUser.querySelector(".fa-xmark") : null;

    if (!modalUser || !btnUser || !btnCloseUser) {
        console.error("Uno o más elementos del modal no fueron encontrados.");
        return;
    }

    // Función para abrir
    function openModal(modal) {
        modal.classList.add("open");
        document.body.classList.add("jw-modal-open");
    }

    // Función para cerrar
    function closeModal(modal) {
        modal.classList.remove("open");
        document.body.classList.remove("jw-modal-open");
    }

    // Click para abrir el modal
    btnUser.onclick = function () {
        console.log("Click en botón Mi cuenta");
        openModal(modalUser);
    };

    // Click para cerrar el modal
    btnCloseUser.onclick = function () {
        closeModal(modalUser);
    };
});
