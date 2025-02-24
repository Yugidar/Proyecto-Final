var modalCrear = document.getElementById("modalCrear");
var modalEdit = document.getElementById("modalEdit");
var modalUser = document.getElementById("modalUser");

var btnCrear = document.getElementById("btnCrear");
var btnEdit = document.getElementById("btnEdit");
var btnUser = document.getElementById("btnUser");

var btnCloseCrear = modalCrear.querySelector(".fa-xmark");
var btnCloseEdit = modalEdit.querySelector(".fa-xmark");
var btnCloseUser = modalUser.querySelector(".fa-xmark");

//Función para abrir
function openModal(modal) {
    modal.classList.add("open");
    document.body.classList.add("jw-modal-open");
}

//Función para cerrar
function closeModal(modal) {
    modal.classList.remove("open");
    document.body.classList.remove("jw-modal-open");
}

//Click para abrir los modales
btnCrear.onclick = function () {
    openModal(modalCrear);
};

btnEdit.onclick = function () {
    openModal(modalEdit);
};

btnUser.onclick = function () {
    openModal(modalUser);
};


//Clic para cerrar los modales
btnCloseCrear.onclick = function () {
    closeModal(modalCrear);
};

btnCloseEdit.onclick = function () {
    closeModal(modalEdit);
};

btnCloseUser.onclick = function () {
    closeModal(modalUser);
};

//Cerrar el modal cuando se hace clic en la "X"
document.getElementById("closeModalEdit").onclick = function () {
    document.getElementById("modalEdit").classList.remove("open");
    document.body.classList.remove("jw-modal-open");
};
