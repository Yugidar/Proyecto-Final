document.addEventListener("DOMContentLoaded", function () {
    let currentPage = 1;

    async function fetchCourses(page) {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                alert('Debes iniciar sesión primero.');
                window.location.href = 'login.html';
                return;
            }

            const response = await fetch(`/courses/paginated?page=${page}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) {
                throw new Error('Error al obtener cursos');
            }

            const data = await response.json();
            renderCursos(data.courses);
            updatePagination(data.currentPage, data.totalPages);
        } catch (error) {
            console.error(error);
        }
    }

    function renderCursos(cursos) {
        const container = document.getElementById("cursos-container");
        container.innerHTML = "";

        cursos.forEach(curso => {
            const cursoDiv = document.createElement("div");
            cursoDiv.classList.add("curso");
            cursoDiv.innerHTML = `
                <div class="cursoConten">
                    <div class="contenido">
                        <img src="${curso.image_url}" alt="${curso.title}" style="width:150px; height:150px; border-radius: 5px;">
                        <div class="textos">
                            <h3>${curso.title}</h3>
                            <p id="textoCurso">${curso.category}</p>
                            <p id="textoCurso">${curso.description}</p>
                        </div>
                    </div>
                    <div class="botones">
                        <button id="btnEdit" class="btn btn-secondary botones__btn" onclick="editarCurso(${curso.id_course})">Editar</button>
                        <button id="btnElim" class="btn btn-danger botones__btn" data-id="${curso.id_course}">Eliminar</button>
                    </div>
                </div>
            `;
            container.appendChild(cursoDiv);
        });

        // Asignar eventos a los botones de eliminar
        document.querySelectorAll(".btn-danger").forEach(button => {
            button.addEventListener("click", function () {
                const id = this.getAttribute("data-id");
                eliminarCurso(id);
            });
        });
    }

    async function eliminarCurso(id) {
        const confirmacion = confirm("¿Estás seguro de que deseas eliminar este curso?");
        if (!confirmacion) return;

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                alert('Debes iniciar sesión primero.');
                window.location.href = 'login.html';
                return;
            }

            const response = await fetch(`/courses/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) {
                throw new Error('Error al eliminar el curso');
            }

            alert("Curso eliminado correctamente");
            fetchCourses(currentPage); // Recargar la lista después de eliminar
        } catch (error) {
            console.error(error);
            alert("Hubo un error al eliminar el curso");
        }
    }

    function updatePagination(currentPage, totalPages) {
        document.getElementById("prev").disabled = currentPage === 1;
        document.getElementById("next").disabled = currentPage === totalPages;
    }

    document.getElementById("next").addEventListener("click", () => {
        currentPage++;
        fetchCourses(currentPage);
    });

    document.getElementById("prev").addEventListener("click", () => {
        if (currentPage > 1) {
            currentPage--;
            fetchCourses(currentPage);
        }
    });

    fetchCourses(currentPage);
});

// MODAL CREAR CURSO
var modalCrear = document.getElementById("modalCrear");
var btnCrear = document.getElementById("btnCrear");
var btnCloseCrear = modalCrear.querySelector(".fa-xmark");

// Abrir modal de creación
btnCrear.onclick = function () {
    openModal(modalCrear);
};

// Cerrar modal de creación
btnCloseCrear.onclick = function () {
    closeModal(modalCrear);
};

// Función para agregar un curso nuevo
document.getElementById("guardarCurso").addEventListener("click", async function () {
    const title = document.getElementById("nombreCurso").value;
    const category = document.getElementById("categoriaCurso").value;
    const description = document.getElementById("descripcionCurso").value;
    const image_url = document.getElementById("imagenCurso").value;

    if (!title || !category || !description || !image_url) {
        alert("Todos los campos son obligatorios");
        return;
    }

    try {
        const token = localStorage.getItem("token");
        if (!token) {
            alert("Debes iniciar sesión primero.");
            window.location.href = "login.html";
            return;
        }

        const response = await fetch("/courses", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ title, category, description, image_url })
        });

        if (!response.ok) {
            throw new Error("Error al crear el curso");
        }

        alert("Curso creado exitosamente");
        closeModal(modalCrear);
        fetchCourses(1); // Recargar lista
    } catch (error) {
        console.error(error);
        alert("Hubo un error al crear el curso");
    }
});

// Funciones de modal
function openModal(modal) {
    modal.classList.add("open");
    document.body.classList.add("jw-modal-open");
}

function closeModal(modal) {
    modal.classList.remove("open");
    document.body.classList.remove("jw-modal-open");
}
