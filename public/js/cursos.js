document.addEventListener("DOMContentLoaded", function () {
    const cursosContainer = document.getElementById("cursos-container");
    const paginationDots = document.getElementById("pagination-dots");
    let currentPage = 1;
    let totalPages = 1;

    async function fetchCourses(page = 1) {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                alert('Debes iniciar sesión primero.');
                window.location.href = 'login.html';
                return;
            }

            // 🔹 Corregida la ruta de la API (antes estaba incorrecta)
            const response = await fetch(`/courses/paginated?page=${page}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) {
                throw new Error(`Error en la API: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            console.log("📢 Datos de la API:", data);

            // 🔹 Verifica que `data.courses` es un array antes de usar `.map()`
            if (!data.courses || !Array.isArray(data.courses)) {
                throw new Error("La API no devolvió cursos válidos");
            }

            renderCursos(data.courses, data.userCourses || []);
            totalPages = data.totalPages || 1;
            renderPaginationDots();
        } catch (error) {
            console.error("❌ Error al obtener los cursos:", error);
            cursosContainer.innerHTML = "<p>Error al cargar los cursos. Inténtalo más tarde.</p>";
        }
    }

    function renderCursos(cursos, userCourses) {
        cursosContainer.innerHTML = "";
        const userCoursesMap = new Set(userCourses.map(curso => curso.id_course));

        cursos.forEach(curso => {
            const cursoDiv = document.createElement("div");
            cursoDiv.classList.add("cursoNormal");

            const actionButton = userCoursesMap.has(curso.id_course)
                ? `<button class="botonObtenido" disabled>Obtenido</button>`
                : `<button class="botonIngresar" data-id="${curso.id_course}">Ingresar curso</button>`;

            cursoDiv.innerHTML = `
                <div class="cursoConten">
                    <div class="contenidoCurNor">
                        <img src="${curso.image_url || 'default-image.jpg'}" alt="${curso.title}">
                        <div class="textNor">
                            ${actionButton}
                            <h3>${curso.title}</h3>
                            <p class="fw-bold">Categoría: ${curso.category || 'Sin categoría'}</p>
                            <p>${curso.description || 'Sin descripción'}</p>
                        </div>
                    </div>
                </div>
            `;
            cursosContainer.appendChild(cursoDiv);
        });

        // Asignar eventos a los botones de inscripción
        document.querySelectorAll(".botonIngresar").forEach(button => {
            button.addEventListener("click", function () {
                const id_course = this.getAttribute("data-id");
                ingresarCurso(id_course);
            });
        });
    }

    function renderPaginationDots() {
        paginationDots.innerHTML = "";
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

    async function ingresarCurso(id_course) {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                alert('Debes iniciar sesión primero.');
                window.location.href = 'login.html';
                return;
            }

            const response = await fetch(`/courses/enroll/${id_course}`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) {
                throw new Error('Error al inscribirse en el curso');
            }

            alert('Te has inscrito en el curso correctamente.');
            fetchCourses(currentPage);

        } catch (error) {
            console.error("❌ Error al inscribirse en el curso:", error);
            alert('Hubo un error al intentar inscribirse en el curso.');
        }
    }

    fetchCourses(currentPage);
});
