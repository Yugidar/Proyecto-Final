document.getElementById('loginForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    const response = await fetch('/auth/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
    });

    const data = await response.json();
    if (response.ok) {
        alert('Inicio de sesión exitoso');
        localStorage.setItem('token', data.token);
        window.location.href = 'productos.html';
    } else {
        alert(data.error);
    }
});

document.getElementById('registerLink').addEventListener('click', (event) => {
    event.preventDefault();
    window.location.href = 'register.html';
});
