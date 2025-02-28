document.addEventListener("DOMContentLoaded", async function () {
    let lastCourseId = 0;
    const itemsPerPage = 4;
    let allCourses = [];
    let isFiltering = false;
    let isLoading = false;
    let allCoursesFetched = false;

    const cursosContainer = document.getElementById("cursos-container");
    const searchInput = document.getElementById("searchInput");

    async function fetchCourses(lastId) {
        if (isLoading || isFiltering) return; // 🚨 No cargar más si está filtrando
        isLoading = true;

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                alert('Debes iniciar sesión primero.');
                window.location.href = 'login.html';
                return;
            }

            const response = await fetch(`/courses/load-more?lastCourseId=${lastId}&limit=${itemsPerPage}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) {
                throw new Error('Error al obtener cursos');
            }

            const data = await response.json();

            // 🔹 Evitar agregar cursos duplicados
            const newCourses = data.courses.filter(curso => 
                !allCourses.some(existing => existing.id_course === curso.id_course)
            );

            if (newCourses.length > 0) {
                allCourses = [...allCourses, ...newCourses];
                const userCourses = await fetchUserCourses();
                appendCursos(newCourses, userCourses);
                lastCourseId = parseInt(newCourses[newCourses.length - 1].id_course);
            }
        } catch (error) {
            console.error("Error al obtener los cursos:", error);
        } finally {
            isLoading = false;
        }
    }

    async function fetchAllCourses() {
        if (allCoursesFetched) return allCourses;

        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/courses/all', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) {
                throw new Error("Error al obtener todos los cursos");
            }

            const data = await response.json();
            allCoursesFetched = true;
            return data.courses;
        } catch (error) {
            console.error("Error al obtener todos los cursos:", error);
            return [];
        }
    }

    async function fetchUserCourses() {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/courses/user-courses', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) {
                throw new Error("Error al obtener los cursos del usuario");
            }

            const data = await response.json();
            return new Set(data.courses.map(course => parseInt(course.id_course)));
        } catch (error) {
            console.error("Error al obtener cursos del usuario:", error);
            return new Set();
        }
    }

    function renderCursos(cursos, userCourses) {
        cursosContainer.innerHTML = ""; // 🔄 Limpiar contenedor solo en búsqueda
        appendCursos(cursos, userCourses);
    }

    function appendCursos(cursos, userCourses) {
        cursos.forEach(curso => {
            const cursoDiv = document.createElement("div");
            cursoDiv.classList.add("cursoNormal");

            const isEnrolled = userCourses.has(parseInt(curso.id_course));
            const actionText = isEnrolled ? "Curso Obtenido" : "Agregar Curso";
            const disabledAttr = isEnrolled ? "disabled" : "";

            cursoDiv.innerHTML = `
                <div class="cursoConten">
                    <div class="contenidoCurNor">
                        <img src="${curso.image_url}" alt="${curso.title}">
                        <div class="textNor">
                            <button class="botonAgre btn-course-action" id="btnAgre" data-id="${curso.id_course}" data-enrolled="${isEnrolled}" ${disabledAttr}>
                                ${actionText}
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

        document.querySelectorAll(".btn-course-action").forEach(button => {
            button.addEventListener("click", async function () {
                const courseId = parseInt(this.getAttribute("data-id"));
                const enrolled = this.getAttribute("data-enrolled") === "true";

                if (!enrolled) {
                    await inscribirseCurso(courseId);
                    this.textContent = "Curso Obtenido";
                    this.setAttribute("data-enrolled", "true");
                    this.disabled = true;
                } else {
                    ingresarCurso(courseId);
                }
            });
        });
    }

    async function inscribirseCurso(courseId) {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`/courses/enroll/${courseId}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error("Error al inscribirse en el curso");
            }

            alert("Te has inscrito correctamente en el curso.");
            const userCourses = await fetchUserCourses();
            renderCursos(allCourses, userCourses);
        } catch (error) {
            console.error("Error al inscribirse en el curso:", error);
            alert("Hubo un error al inscribirse en el curso.");
        }
    }

    function ingresarCurso(courseId) {
        alert(`Ingresando al curso con ID: ${courseId}`);
    }

    searchInput.addEventListener("input", async function () {
        const searchTerm = this.value.toLowerCase().trim();

        if (searchTerm) {
            if (!allCoursesFetched) {
                allCourses = await fetchAllCourses();
            }

            isFiltering = true;
            cursosContainer.innerHTML = ""; // 🔄 Solo limpiar si estamos filtrando

            const filteredCourses = allCourses.filter((curso) =>
                curso.title.toLowerCase().includes(searchTerm) ||
                curso.category.toLowerCase().includes(searchTerm)
            );

            const userCourses = await fetchUserCourses();
            renderCursos(filteredCourses, userCourses);
        } else {
            isFiltering = false;
            cursosContainer.innerHTML = "";
            lastCourseId = allCourses.length > 0 ? allCourses[allCourses.length - 1].id_course : 0;
            renderCursos(allCourses, await fetchUserCourses()); // 🔄 Restaurar sin duplicados
        }
    });

    window.addEventListener("scroll", function () {
        if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 100) {
            if (!isFiltering && !isLoading) {
                fetchCourses(lastCourseId);
            }
        }
    });

    fetchCourses(lastCourseId);
});

document.getElementById("toggleSearch").addEventListener("click", function () {
    let searchBox = document.getElementById("searchBox");

    if (searchBox.style.display === "none") {
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
