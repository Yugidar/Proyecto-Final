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
