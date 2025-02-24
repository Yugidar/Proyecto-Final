document.addEventListener('DOMContentLoaded', () => {
    let currentPage = 1;
    const itemsPerPage = 4;
    const container = document.getElementById("cursos-container");
    const prevBtn = document.getElementById("prev");
    const nextBtn = document.getElementById("next");

    async function fetchCursos(page) {
        const token = localStorage.getItem('token');
        if (!token) {
            alert("Acceso denegado. Inicia sesión.");
            window.location.href = 'login.html';
            return;
        }

        try {
            const response = await fetch(`/courses?page=${page}&limit=${itemsPerPage}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (!response.ok) {
                throw new Error('Error al cargar los cursos.');
            }

            const data = await response.json();
            renderCursos(data.courses, data.currentPage, data.totalPages);
        } catch (error) {
            console.error(error);
        }
    }

    function renderCursos(cursos, page, totalPages) {
        container.innerHTML = "";
        cursos.forEach(curso => {
            const cursoDiv = document.createElement("div");
            cursoDiv.classList.add("curso");
            cursoDiv.innerHTML = `
                <div class="cursoConten">
                    <div class="contenido">
                        <img src="./assets/logo 1.png" alt="${curso.title}">
                        <div class="textos">
                            <h3>${curso.title}</h3>
                            <p>${curso.category}</p>
                            <p>${curso.description}</p>
                        </div>
                    </div>
                    <div class="botones">
                        <button id="btnEdit" onclick="editarCurso(${curso.id_course})">Editar</button>
                        <button id="btnElim" onclick="eliminarCurso(${curso.id_course})">Eliminar</button>
                    </div>
                </div>
            `;
            container.appendChild(cursoDiv);
        });

        prevBtn.disabled = page === 1;
        nextBtn.disabled = page >= totalPages;
    }

    prevBtn.addEventListener("click", () => {
        if (currentPage > 1) {
            currentPage--;
            fetchCursos(currentPage);
        }
    });

    nextBtn.addEventListener("click", () => {
        currentPage++;
        fetchCursos(currentPage);
    });

    fetchCursos(currentPage);
});
