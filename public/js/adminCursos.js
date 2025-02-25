var modalCrear = document.getElementById("modalCrear");
var modalEdit = document.getElementById("modalEdit");
var modalUser = document.getElementById("modalUser");

var btnCrear = document.getElementById("btnCrear");
var btnEdit = document.getElementById("btnEdit");
var btnUser = document.getElementById("btnUser");

var btnCloseCrear = modalCrear.querySelector(".fa-xmark");
var btnCloseEditar = modalEdit.querySelector(".fa-xmark");
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
    console.log("click en boton")
    openModal(modalEdit); 
};

btnUser.onclick = function () {
    console.log("click en boton")
    openModal(modalUser);
};


//Clic para cerrar los modales
btnCloseCrear.onclick = function () {
    closeModal(modalCrear);
};

btnCloseEditar.onclick = function () {
    closeModal(modalEdit);
};

btnCloseUser.onclick = function () {
    closeModal(modalUser);
};
