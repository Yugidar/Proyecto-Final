document.addEventListener("DOMContentLoaded", function () {
    const btnUser = document.getElementById("btnUser");
    const perfilTooltip = document.getElementById("perfilTooltip");

    if (btnUser) {
        btnUser.addEventListener("click", async function (event) {
            event.stopPropagation(); // Evita que el clic cierre el tooltip inmediatamente
            await mostrarPerfil(); // Obtiene los datos del usuario y los muestra
            perfilTooltip.style.display = (perfilTooltip.style.display === "none") ? "block" : "none";
        });
    }

    // Ocultar el tooltip si se hace clic fuera de él
    document.addEventListener("click", function (event) {
        if (!perfilTooltip.contains(event.target) && event.target !== btnUser) {
            perfilTooltip.style.display = "none";
        }
    });
});

// Función para obtener y mostrar los datos del usuario
async function mostrarPerfil() {
    try {
        const token = localStorage.getItem("token");
        if (!token) {
            alert("Debes iniciar sesión primero.");
            window.location.href = "login.html";
            return;
        }

        const response = await fetch("/auth/user", {
            headers: { Authorization: `Bearer ${token}` }
        });

        if (!response.ok) {
            throw new Error("Error al obtener la información del usuario");
        }

        const userData = await response.json();

        document.getElementById("perfilNombre").innerText = userData.username;
        document.getElementById("perfilTipoUser").innerText =
            userData.role === "admin" ? "Administrador" : "Estudiante";
    } catch (error) {
        console.error("Error al obtener el perfil del usuario:", error);
    }
}
