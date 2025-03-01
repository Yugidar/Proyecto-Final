const express = require('express');
const path = require('path');
const cors = require('cors');
const db = require('./config/db');
const errorHandler = require('./middleware/errorHandler'); // Middleware de errores agregado

const app = express();
process.env.JWT_SECRET = process.env.JWT_SECRET || 'secreto_super_seguro';
const PORT = process.env.PORT || 3000;


app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas
const authRoutes = require('./routes/authRoutes');
const courseRoutes = require('./routes/courseRoutes');

app.use('/auth', authRoutes);
app.use('/courses', courseRoutes); // Ruta de cursos

app.use(express.static(path.join(__dirname, '../public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/login.html'));
});

app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/register.html'));
});

// Verificar conexión a MySQL
db.getConnection((err, connection) => {
    if (err) {
        console.error("Error al conectar con la base de datos:", err.message);
    } else {
        console.log("Conexión a la base de datos establecida correctamente");
        connection.release(); // Liberar conexión
    }
});

// Middleware para manejar rutas inexistentes (404)
app.use((req, res, next) => {
    const error = new Error("Ruta no encontrada");
    error.statusCode = 404;
    next(error); // Pasar error al middleware global
});

// Middleware para manejo de errores global
app.use(errorHandler); // 👈 Aquí se usa el middleware de errores

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

module.exports = app;
