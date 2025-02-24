document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');
    if (!token) {
        alert('Acceso denegado. Debes iniciar sesión.');
        window.location.href = 'login.html';
        return;
    }

    const response = await fetch('/courses', {
        method: 'GET',
        headers: {
            'authorization': `Bearer ${token}`
        }
    });

    if (response.ok) {
        const courses = await response.json();
        renderCursos(courses);
    } else {
        alert('Error al cargar los cursos.');
    }
});

function renderCursos(courses) {
    const container = document.getElementById("cursos-container");
    container.innerHTML = "";

    courses.forEach(curso => {
        const cursoDiv = document.createElement("div");
        cursoDiv.classList.add("curso");
        cursoDiv.innerHTML = `
            <div class="contenido">
                <h3>${curso.title}</h3>
                <p><strong>Categoría:</strong> ${curso.category}</p>
                <p><strong>Descripción:</strong> ${curso.description}</p>
                <p><strong>Autor:</strong> ${curso.username}</p>
                <button class="btn btn-danger" onclick="eliminarCurso(${curso.id_course})">Eliminar</button>
            </div>
        `;
        container.appendChild(cursoDiv);
    });
}

async function eliminarCurso(id) {
    const token = localStorage.getItem('token');
    const confirmDelete = confirm('¿Estás seguro de eliminar este curso?');
    if (!confirmDelete) return;

    const response = await fetch(`/courses/${id}`, {
        method: 'DELETE',
        headers: {
            'authorization': `Bearer ${token}`
        }
    });

    if (response.ok) {
        alert('Curso eliminado');
        location.reload();
    } else {
        alert('Error al eliminar el curso.');
    }
}

function logout() {
    localStorage.removeItem('token');
    window.location.href = 'login.html';
}
