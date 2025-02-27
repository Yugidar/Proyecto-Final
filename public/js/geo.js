document.addEventListener('DOMContentLoaded', async () => {
    // Obtener el país del usuario y actualizar loginChangeCountry
    async function obtenerPais() {
        try {
            const response = await fetch('http://ip-api.com/json/');
            const data = await response.json();
            if (data.status === 'success') {
                const loginCountryElement = document.getElementById('loginChangeCountry');
                if (loginCountryElement) {
                    loginCountryElement.innerText = data.country;
                }
            } else {
                console.error('No se pudo detectar el país');
            }
        } catch (error) {
            console.error('Error obteniendo la ubicación:', error);
        }
    }

    obtenerPais();
});
