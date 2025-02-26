document.addEventListener("DOMContentLoaded", async function () {
    let currentPage = 1;
    const itemsPerPage = 4;

    async function fetchCourses(page) {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                alert('Debes iniciar sesión primero.');
                window.location.href = 'login.html';
                return;
            }

            // 🔹 Obtener cursos con paginación
            const response = await fetch(`/courses/paginated?page=${page}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) {
                throw new Error('Error al obtener cursos');
            }

            const data = await response.json();

            // 🔹 Verificar si hay cursos en la respuesta
            if (!data.courses || data.courses.length === 0) {
                document.getElementById("cursos-container").innerHTML = "<p>No hay cursos disponibles.</p>";
                return;
            }

            // 🔹 Obtener los cursos en los que el usuario está inscrito
            const userCourses = await fetchUserCourses();

            renderCursos(data.courses, userCourses);
            renderPaginationDots(data.currentPage, data.totalPages);
        } catch (error) {
            console.error("Error al obtener los cursos:", error);
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
            return new Set(data.courses.map(course => course.id_course)); // Convertimos a Set para búsqueda rápida
        } catch (error) {
            console.error("Error al obtener cursos del usuario:", error);
            return new Set();
        }
    }

    function renderCursos(cursos, userCourses) {
        const container = document.getElementById("cursos-container");
        if (!container) {
            console.error("❌ ERROR: No se encontró el contenedor de cursos.");
            return;
        }

        container.innerHTML = "";

        cursos.forEach(curso => {
            const cursoDiv = document.createElement("div");
            cursoDiv.classList.add("curso");

            // 🔹 Determinar si el usuario ya está inscrito
            const isEnrolled = userCourses.has(curso.id_course);
            const actionText = isEnrolled ? "Obtenido" : "Agregar al curso";

            cursoDiv.innerHTML = `
                <div class="cursoConten">
                    <div class="contenido">
                        <img src="${curso.image_url}" alt="${curso.title}" style="width:150px; height:150px; border-radius: 5px;">
                        <div class="textos">
                            <h3>${curso.title}</h3>
                            <p><strong>Categoría:</strong> ${curso.category}</p>
                            <p>${curso.description}</p>
                        </div>
                    </div>
                    <div class="botones">
                        <button class="btn btn-primary btn-course-action" data-id="${curso.id_course}" data-enrolled="${isEnrolled}">
                            ${actionText}
                        </button>
                    </div>
                </div>
            `;

            container.appendChild(cursoDiv);
        });

        // 🔹 Agregar eventos a los botones
        document.querySelectorAll(".btn-course-action").forEach(button => {
            button.addEventListener("click", function () {
                const courseId = this.getAttribute("data-id");
                const enrolled = this.getAttribute("data-enrolled") === "true";

                if (enrolled) {
                    ingresarCurso(courseId);
                } else {
                    inscribirseCurso(courseId);
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
            fetchCourses(currentPage); // Recargar la lista de cursos
        } catch (error) {
            console.error("Error al inscribirse en el curso:", error);
            alert("Hubo un error al inscribirse en el curso.");
        }
    }

    function ingresarCurso(courseId) {
        alert(`Ingresando al curso con ID: ${courseId}`);
        // Aquí podrías redirigir a una página específica del curso
        // window.location.href = `/curso/${courseId}`;
    }

    function renderPaginationDots(currentPage, totalPages) {
        const paginationContainer = document.getElementById("pagination-container");

        // Si no existe, créalo y agrégalo al final de la página
        if (!paginationContainer) {
            const newPaginationContainer = document.createElement("div");
            newPaginationContainer.id = "pagination-container";
            newPaginationContainer.classList.add("pagination-dots");
            document.getElementById("cursos-container").after(newPaginationContainer);
        }

        const paginationDots = document.getElementById("pagination-container");
        paginationDots.innerHTML = ""; // Limpiar los puntos anteriores

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

    // 🔹 Verificar que el contenedor de cursos existe antes de llamar a fetchCourses
    if (document.getElementById("cursos-container")) {
        fetchCourses(currentPage);
    } else {
        console.error("❌ ERROR: El contenedor de cursos no existe en el DOM.");
    }
});
