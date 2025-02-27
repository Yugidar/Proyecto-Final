document.addEventListener("DOMContentLoaded", async function () {
    let currentPage = 1;
    let totalPages = 1;
    let editingCourseId = null;
    let allCourses = [];
    let filteredCourses = [];
    let isFiltering = false;
    let displayedCourses = 10;
    
    const paginationDots = document.getElementById("pagination-dots");
    const searchBox = document.getElementById("searchBox");
    const toggleSearch = document.getElementById("toggleSearch");

    /** 🔍 **Abrir y cerrar buscador** */
    if (toggleSearch && searchBox) {
        toggleSearch.addEventListener("click", function () {
            searchBox.style.display = searchBox.style.display === "block" ? "none" : "block";
        });

        document.addEventListener("click", function (event) {
            if (!searchBox.contains(event.target) && event.target !== toggleSearch) {
                searchBox.style.display = "none";
            }
        });
    }

    /** 🔍 **Buscar cursos en tiempo real** */
    document.getElementById("searchInput").addEventListener("input", async function () {
        const searchTerm = this.value.toLowerCase();
        if (searchTerm) {
            if (allCourses.length === 0) await fetchAllCourses();
            isFiltering = true;
            paginationDots.innerHTML = "";

            filteredCourses = allCourses.filter((curso) =>
                curso.title.toLowerCase().includes(searchTerm) ||
                curso.category.toLowerCase().includes(searchTerm)
            );

            displayedCourses = 10;
            renderCursos(filteredCourses.slice(0, displayedCourses));

            window.onscroll = function () {
                if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 100) {
                    displayedCourses += 5;
                    renderCursos(filteredCourses.slice(0, displayedCourses));
                }
            };
        } else {
            isFiltering = false;
            filteredCourses = [];
            currentPage = 1;
            fetchCourses(currentPage);
            window.onscroll = null;
        }
    });

    async function fetchAllCourses() {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                alert("Debes iniciar sesión primero.");
                window.location.href = "login.html";
                return;
            }

            const response = await fetch("/courses/all", {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!response.ok) {
                throw new Error("Error al obtener todos los cursos");
            }

            const data = await response.json();
            allCourses = data.courses;
        } catch (error) {
            console.error("Error al obtener todos los cursos:", error);
        }
    }

    async function fetchCourses(page) {
        if (isFiltering) return;

        try {
            const token = localStorage.getItem("token");
            if (!token) {
                alert("Debes iniciar sesión primero.");
                window.location.href = "login.html";
                return;
            }

            const response = await fetch(`/courses/paginated?page=${page}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!response.ok) {
                throw new Error("Error al obtener cursos");
            }

            const data = await response.json();
            renderCursos(data.courses);
            totalPages = data.totalPages;
            renderPaginationDots();
        } catch (error) {
            console.error("Error al obtener los cursos:", error);
        }
    }

    function renderCursos(cursos) {
        const container = document.getElementById("cursos-container");
        if (!container) return;

        container.innerHTML = "";

        cursos.forEach((curso) => {
            const cursoDiv = document.createElement("div");
            cursoDiv.classList.add("curso");

            cursoDiv.innerHTML = `
                <div class="cursoConten">
                    <div class="contenidoCurNor">
                        <img src="${curso.image_url}" alt="${curso.title}">
                        <div class="textNor">
                            <h3>${curso.title}</h3>
                            <p class="fw-bold">Categoría: ${curso.category}</p>
                            <p id="textoP">${curso.description}</p>
                        </div>
                    </div>
                    <div class="botones">
                        <button class="btn btn-secondary btn-edit"
                            data-id="${curso.id_course}" 
                            data-title="${curso.title}" 
                            data-category="${curso.category}" 
                            data-description="${curso.description}" 
                            data-image="${curso.image_url}">Editar</button>

                        <button class="btn btn-danger btn-delete" data-id="${curso.id_course}">Eliminar</button>
                    </div>
                </div>
            `;
            container.appendChild(cursoDiv);
        });

        asignarEventos();
    }

    function asignarEventos() {
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

    function editarCurso(id, title, category, description, image) {
        editingCourseId = id;
        document.getElementById("nombreCursoEdit").value = title;
        document.getElementById("categoriaCursoEdit").value = category;
        document.getElementById("descripcionCursoEdit").value = description;
        document.getElementById("imagenCursoEdit").value = image;

        openModal(document.getElementById("modalEdit"));
    }

    function renderPaginationDots() {
        paginationDots.innerHTML = "";
        if (isFiltering) return;

        for (let i = 1; i <= totalPages; i++) {
            let dot = document.createElement("span");
            dot.classList.add("dot");
            if (i === currentPage) {
                dot.classList.add("active");
            }
            dot.addEventListener("click", () => {
                currentPage = i;
                fetchCourses(currentPage);
            });
            paginationDots.appendChild(dot);
        }
    }

    fetchCourses(currentPage);

    function openModal(modal) {
        modal.classList.add("open");
        document.body.classList.add("jw-modal-open");
    }

    function closeModal(modal) {
        modal.classList.remove("open");
        document.body.classList.remove("jw-modal-open");
    }
});
