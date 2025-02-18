document.getElementById('registerForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    const response = await fetch('/auth/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
    });

    const data = await response.text();
    if (response.ok) {
        alert('Registro exitoso');
        // Redirigir al usuario al inicio de sesión o a otra página
        window.location.href = 'login.html';
    } else {
        alert(data);
    }
});
