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
            cursoDiv.id = `curso-${curso.id_user_course}`; // Se usa id_user_course para el DOM

            cursoDiv.innerHTML = `
                <div class="cursoConten">
                    <div class="contenidoCurNor">
                        <img src="${curso.image_url}" alt="${curso.title}">
                        <div class="textNor">
                            <button class="botonDele" data-id="${curso.id_user_course}"> <!-- Usa id_user_course -->
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

        // Añadir eventos a los botones después de renderizar
        document.querySelectorAll(".botonDele").forEach(button => {
            button.addEventListener("click", function () {
                const id_user_course = this.getAttribute("data-id"); // Usa id_user_course
                salirDelCurso(id_user_course);
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
                fetchUserCourses(currentPage);
            });
            paginationDots.appendChild(dot);
        }
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
    
            // Eliminar el curso del DOM sin recargar la página
            document.getElementById(`curso-${id_user_course}`).remove();
    
        } catch (error) {
            console.error("Error al salir del curso:", error);
            alert('Hubo un error al intentar salir del curso.');
        }
    }    

    fetchUserCourses(currentPage);
});
