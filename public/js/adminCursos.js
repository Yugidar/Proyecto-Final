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
                    <div class="contenidoCurAdm">
                        <img src="${curso.image_url}" alt="${curso.title}">
                        <div class="textAdm">
                            <h3 id="textoP">${curso.title}</h3>
                            <p id="textoP">Categoría: ${curso.category}</p>
                            <p id="textoH">${curso.description}</p>
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
document.addEventListener("DOMContentLoaded", function () {
    const userRole = localStorage.getItem("role");

    if (userRole !== "admin") {
        // Crear un div que bloquee toda la pantalla
        const overlay = document.createElement("div");
        overlay.style.position = "fixed";
        overlay.style.top = "0";
        overlay.style.left = "0";
        overlay.style.width = "100vw";
        overlay.style.height = "100vh";
        overlay.style.backgroundColor = "black";
        overlay.style.color = "white";
        overlay.style.display = "flex";
        overlay.style.flexDirection = "column";
        overlay.style.justifyContent = "center";
        overlay.style.alignItems = "center";
        overlay.style.fontSize = "2rem";
        overlay.style.fontWeight = "bold";
        overlay.style.zIndex = "9999";
        overlay.innerHTML = `
            ❌ NO ERES ADMIN ❌
            <br>
            <button id="btnRegresar" style="
                margin-top: 20px;
                padding: 15px 30px;
                font-size: 1.5rem;
                font-weight: bold;
                color: white;
                background-color: red;
                border: none;
                border-radius: 10px;
                cursor: pointer;
            ">🔙 Regresar a Cursos</button>
        `;

        // Agregar el overlay al body
        document.body.appendChild(overlay);

        // Bloquear interacciones (opcional)
        document.body.style.overflow = "hidden";

        // Agregar evento al botón para regresar a cursos
        document.getElementById("btnRegresar").addEventListener("click", function () {
            window.location.href = "cursos.html";
        });

        // Redirigir automáticamente después de 3 segundos
        setTimeout(() => {
            window.location.href = "cursos.html";
        }, 3000);
    }
});
document.addEventListener("DOMContentLoaded", function () {
    const token = localStorage.getItem("token");

    if (token) {
        const decoded = JSON.parse(atob(token.split(".")[1])); // Decodifica el token
        const currentTime = Math.floor(Date.now() / 1000); // Tiempo actual en segundos

        if (decoded.exp < currentTime) {
            // Token vencido, eliminar y redirigir al index
            localStorage.removeItem("token");
            localStorage.removeItem("role");
            alert("Tu sesión ha expirado. Inicia sesión nuevamente.");
            window.location.href = "index.html";
        } else {
            // Configurar verificación en intervalos de tiempo (cada 30 segundos)
            setInterval(() => {
                const now = Math.floor(Date.now() / 1000);
                if (decoded.exp < now) {
                    localStorage.removeItem("token");
                    localStorage.removeItem("role");
                    alert("Tu sesión ha expirado. Inicia sesión nuevamente.");
                    window.location.href = "index.html";
                }
            }, 30000); // Se ejecuta cada 30 segundos
        }
    }
});
