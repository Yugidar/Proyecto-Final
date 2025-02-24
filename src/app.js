require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const db = require('./config/db');

const app = express();
const PORT = process.env.PORT || 3000;

// Definir la clave JWT directamente en el código
process.env.JWT_SECRET = 'supersecretoseguro';  // 🔹 Aquí defines el JWT_SECRET

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const courseRoutes = require('./routes/courseRoutes');

app.use('/auth', authRoutes);
app.use('/products', productRoutes);
app.use('/courses', courseRoutes);

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

app.get('/adminCursos', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/adminCursos.html'));
});

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
});

module.exports = app;
