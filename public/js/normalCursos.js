document.addEventListener("DOMContentLoaded", function () {
    const cursosContainer = document.getElementById("cursos-container");
    const paginationDots = document.getElementById("pagination-dots");
    let currentPage = 1;
    let totalPages = 1;

    async function fetchUserCourses(page = 1) {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                alert('Debes iniciar sesión primero.');
                window.location.href = 'login.html';
                return;
            }

            const response = await fetch(`/courses/user-courses?page=${page}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) {
                throw new Error('Error al obtener los cursos');
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
        cursosContainer.innerHTML = "";

        cursos.forEach(curso => {
            const cursoDiv = document.createElement("div");
            cursoDiv.classList.add("cursoNormal");
            cursoDiv.innerHTML = `
                <div class="cursoConten">
                    <div class="contenidoCurNor">
                        <img src="${curso.image_url}" alt="${curso.title}">
                        <div class="textNor">
                            <button class="botonDele" id="btnDele-${curso.id_course}" onclick="salirDelCurso(${curso.id_course})">
                                Salir del curso
                            </button>
                            <h3>${curso.title}</h3>
                            <p class="fw-bold">Categoría: ${curso.category}</p>
                            <p>${curso.description}</p>
                        </div>
                    </div>
                </div>
            `;
            cursosContainer.appendChild(cursoDiv);
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
                fetchUserCourses(currentPage);
            });
            paginationDots.appendChild(dot);
        }
    }

    async function salirDelCurso(id_course) {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                alert('Debes iniciar sesión primero.');
                window.location.href = 'login.html';
                return;
            }

            const response = await fetch(`/courses/user-courses/${id_course}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) {
                throw new Error('Error al salir del curso');
            }

            alert('Has salido del curso correctamente.');
            fetchUserCourses(currentPage);

        } catch (error) {
            console.error("Error al salir del curso:", error);
            alert('Hubo un error al intentar salir del curso.');
        }
    }

    fetchUserCourses(currentPage);
});
