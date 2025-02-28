document.addEventListener("DOMContentLoaded", async function () {
    let lastCourseIndex = 0;
    const itemsPerPage = 4;
    let allUserCourses = [];
    let isFiltering = false;
    let isLoading = false;

    const cursosContainer = document.getElementById("cursos-container");
    const searchInput = document.getElementById("searchInput");

    async function fetchUserCourses() {
        if (isLoading || isFiltering) return;
        isLoading = true;

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                alert('Debes iniciar sesión primero.');
                window.location.href = 'login.html';
                return;
            }

            const response = await fetch(`/courses/user-courses`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) {
                throw new Error('Error al obtener los cursos');
            }

            const data = await response.json();
            console.log("✅ Cursos obtenidos:", data.courses);

            allUserCourses = data.courses;
            renderNextCourses(); // Cargar los primeros 4 cursos
        } catch (error) {
            console.error("Error al obtener los cursos:", error);
        } finally {
            isLoading = false;
        }
    }

    function renderNextCourses() {
        if (lastCourseIndex >= allUserCourses.length) return;

        const nextCourses = allUserCourses.slice(lastCourseIndex, lastCourseIndex + itemsPerPage);
        lastCourseIndex += itemsPerPage;
        appendCursos(nextCourses);
    }

    function appendCursos(cursos) {
        cursos.forEach(curso => {
            const cursoDiv = document.createElement("div");
            cursoDiv.classList.add("cursoNormal");
            cursoDiv.id = `curso-${curso.id_user_course}`;

            cursoDiv.innerHTML = `
                <div class="cursoConten">
                    <div class="contenidoCurNor">
                        <img src="${curso.image_url}" alt="${curso.title}">
                        <div class="textNor">
                            <button class="botonDele btn-course-action" id="btnDele" data-id="${curso.id_user_course}">
                                Salir del curso
                            </button>
                            <h3>${curso.title}</h3>
                            <p class="fw-bold">Categoría: ${curso.category}</p>
                            <p id="textoP">${curso.description}</p>
                        </div>
                    </div>
                </div>
            `;
            cursosContainer.appendChild(cursoDiv);
        });

        document.querySelectorAll(".botonDele").forEach(button => {
            button.addEventListener("click", function () {
                const id_user_course = this.getAttribute("data-id");
                salirDelCurso(id_user_course);
            });
        });
    }

    async function salirDelCurso(id_user_course) {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                alert('Debes iniciar sesión primero.');
                window.location.href = 'login.html';
                return;
            }

            const confirmar = confirm("¿Estás seguro de que quieres salir del curso?");
            if (!confirmar) return;

            const response = await fetch(`/courses/user-courses/${id_user_course}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) {
                throw new Error('Error al salir del curso');
            }

            alert('Has salido del curso correctamente.');
            document.getElementById(`curso-${id_user_course}`).remove();
        } catch (error) {
            console.error("Error al salir del curso:", error);
            alert('Hubo un error al intentar salir del curso.');
        }
    }

    searchInput.addEventListener("input", function () {
        const searchTerm = this.value.toLowerCase().trim();

        if (searchTerm) {
            isFiltering = true;
            cursosContainer.innerHTML = "";

            const filteredCourses = allUserCourses.filter(curso =>
                curso.title.toLowerCase().includes(searchTerm) ||
                curso.category.toLowerCase().includes(searchTerm)
            );

            appendCursos(filteredCourses);
        } else {
            isFiltering = false;
            cursosContainer.innerHTML = "";
            lastCourseIndex = 0;
            renderNextCourses();
        }
    });

    window.addEventListener("scroll", function () {
        if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 100) {
            if (!isFiltering && !isLoading) {
                renderNextCourses();
            }
        }
    });

    document.getElementById("toggleSearch").addEventListener("click", function () {
        let searchBox = document.getElementById("searchBox");

        if (searchBox.style.display === "none" || searchBox.style.display === "") {
            searchBox.style.display = "block";
            document.getElementById("searchInput").focus();
        } else {
            searchBox.style.display = "none";
        }
    });

    document.addEventListener("click", function (event) {
        let searchBox = document.getElementById("searchBox");
        let toggleImage = document.getElementById("toggleSearch");

        if (!searchBox.contains(event.target) && event.target !== toggleImage) {
            searchBox.style.display = "none";
        }
    });

    fetchUserCourses();
});
document.addEventListener("DOMContentLoaded", function () {
    const userRole = localStorage.getItem("role");

    if (userRole === "admin") {
        // Crear pantalla de bloqueo
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
            ❌ SOLO USUARIOS REGULARES PUEDEN VER ESTO ❌
            <br>
            <button id="btnRegresarAdmin" style="
                margin-top: 20px;
                padding: 15px 30px;
                font-size: 1.5rem;
                font-weight: bold;
                color: white;
                background-color: red;
                border: none;
                border-radius: 10px;
                cursor: pointer;
            ">🔙 Ir a Administración</button>
        `;

        // Agregar el overlay al body
        document.body.appendChild(overlay);

        // Bloquear interacciones (opcional)
        document.body.style.overflow = "hidden";

        // Agregar evento al botón para regresar a adminCursos.html
        document.getElementById("btnRegresarAdmin").addEventListener("click", function () {
            window.location.href = "adminCursos.html";
        });

        // Redirigir automáticamente después de 3 segundos
        setTimeout(() => {
            window.location.href = "adminCursos.html";
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
