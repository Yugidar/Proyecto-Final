document.addEventListener('DOMContentLoaded', async () => {
    async function obtenerPais() {
        try {
            const response = await fetch('https://api.ipgeolocation.io/ipgeo?apiKey=b38be2d1e68b4bb0b7c3d9f33fee6ca9');
            const data = await response.json();

            // Verificar que la API devolvió datos correctos
            if (data && data.country_name) {
                const loginCountryElement = document.getElementById('loginChangeCountry');
                if (loginCountryElement) {
                    loginCountryElement.innerText = data.country_name;
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
