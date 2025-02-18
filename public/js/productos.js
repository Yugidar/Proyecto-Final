document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');
    if (!token) {
        alert('Acceso denegado. Por favor, inicia sesión.');
        window.location.href = 'login.html';
        return;
    }

    const response = await fetch('/products', {
        method: 'GET',
        headers: {
            'authorization': `Bearer ${token}`
        }
    });

    if (response.ok) {
        const products = await response.json();
        const productList = document.getElementById('productList');
        products.forEach(product => {
            const productItem = document.createElement('div');
            productItem.classList.add('product-item');
            productItem.innerHTML = `
                <h3>${product.name}</h3>
                <p>${product.description}</p>
            `;
            productList.appendChild(productItem);
        });
    } else {
        alert('Error al cargar los productos.');
    }
});

function logout() {
    localStorage.removeItem('token');
    window.location.href = 'login.html';
}
