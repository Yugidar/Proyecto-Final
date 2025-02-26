document.addEventListener("DOMContentLoaded", function () {
    let currentPage = 1;
    let editingCourseId = null; // Almacenar el ID del curso que se edita

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
            console.error("Error al obtener los cursos:", error);
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
                            <p>${curso.category}</p>
                            <p id="textoP">${curso.description}</p>
                        </div>
                    </div>
                    <div class="botones">
                        <button class="btn btn-secondary btn-edit" id="btnEdit" 
                            data-id="${curso.id_course}" 
                            data-title="${curso.title}" 
                            data-category="${curso.category}" 
                            data-description="${curso.description}" 
                            data-image="${curso.image_url}">Editar</button>

                        <button id="btnElim" class="btn btn-danger btn-delete" data-id="${curso.id_course}">Eliminar</button>
                    </div>
                </div>
            `;
            container.appendChild(cursoDiv);
        });

        // Eventos dinámicos
        document.querySelectorAll(".btn-delete").forEach(button => {
            button.addEventListener("click", function () {
                const id = this.getAttribute("data-id");
                eliminarCurso(id);
            });
        });

        document.querySelectorAll(".btn-edit").forEach(button => {
            button.addEventListener("click", function () {
                const id = this.getAttribute("data-id");
                const title = this.getAttribute("data-title");
                const category = this.getAttribute("data-category");
                const description = this.getAttribute("data-description");
                const image = this.getAttribute("data-image");

                editarCurso(id, title, category, description, image);
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
            fetchCourses(currentPage);
        } catch (error) {
            console.error("Error al eliminar curso:", error);
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

    // MODAL CREAR CURSO
    const modalCrear = document.getElementById("modalCrear");
    const btnCrear = document.getElementById("btnCrear");

    if (btnCrear) {
        btnCrear.onclick = function () {
            openModal(modalCrear);
        };
    }

    document.getElementById("formCrearCurso").addEventListener("submit", async function (event) {
        event.preventDefault();

        const title = document.getElementById("nombreCurso").value;
        const category = document.getElementById("categoriaCurso").value;
        const description = document.getElementById("descripcionCurso").value;
        const image_url = document.getElementById("imagenCurso").value || 'https://upload.wikimedia.org/wikipedia/commons/1/14/No_Image_Available.jpg';

        if (!title || !category || !description) {
            alert("Todos los campos son obligatorios, excepto la imagen.");
            return;
        }

        try {
            const token = localStorage.getItem("token");

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
            fetchCourses(1);
        } catch (error) {
            console.error("Error al crear curso:", error);
            alert("Hubo un error al crear el curso");
        }
    });

    // FUNCIÓN PARA EDITAR CURSO
    function editarCurso(id, title, category, description, image) {
        editingCourseId = id;
        document.getElementById("nombreCursoEdit").value = title;
        document.getElementById("categoriaCursoEdit").value = category;
        document.getElementById("descripcionCursoEdit").value = description;
        document.getElementById("imagenCursoEdit").value = image;
        openModal(document.getElementById("modalEdit"));
    }

    document.getElementById("formEditCurso").addEventListener("submit", async function (event) {
        event.preventDefault();

        const title = document.getElementById("nombreCursoEdit").value;
        const category = document.getElementById("categoriaCursoEdit").value;
        const description = document.getElementById("descripcionCursoEdit").value;
        const image_url = document.getElementById("imagenCursoEdit").value;

        try {
            const token = localStorage.getItem("token");

            const response = await fetch(`/courses/${editingCourseId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ title, category, description, image_url })
            });

            if (!response.ok) {
                throw new Error("Error al actualizar el curso");
            }

            alert("Curso actualizado correctamente");
            closeModal(document.getElementById("modalEdit"));
            fetchCourses(1);
        } catch (error) {
            console.error("Error al actualizar curso:", error);
            alert("Hubo un error al actualizar el curso");
        }
    });

    function openModal(modal) {
        modal.classList.add("open");
        document.body.classList.add("jw-modal-open");
    }

    function closeModal(modal) {
        modal.classList.remove("open");
        document.body.classList.remove("jw-modal-open");
    }
});

document.getElementById("toggleSearch").addEventListener("click", function () {
    let searchBox = document.getElementById("searchBox");
    searchBox.style.display = searchBox.style.display === "block" ? "none" : "block";
});

document.addEventListener("click", function (event) {
    let searchBox = document.getElementById("searchBox");
    let toggleImage = document.getElementById("toggleSearch");

    if (!searchBox.contains(event.target) && event.target !== toggleImage) {
        searchBox.style.display = "none";
    }
});