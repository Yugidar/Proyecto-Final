require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Conexión a MySQL
const db = mysql.createConnection({
    host: process.env.DB_HOST || 'bbz7w1sdy5yaf7ocvlva-mysql.services.clever-cloud.com',
    user: process.env.DB_USER || 'ufvomre2iqltqutc',
    password: process.env.DB_PASSWORD || 'JfEy8nMBIVlNIQcuASay',
    database: process.env.DB_NAME || 'bbz7w1sdy5yaf7ocvlva',
    port: process.env.DB_PORT || 3306
});

db.connect(err => {
    if (err) {
        console.error('Error conectando a MySQL:', err);
        return;
    }
    console.log('Conectado a MySQL');
});

// Importar rutas
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');

app.use('/auth', authRoutes);
app.use('/products', productRoutes);

// Servir archivos estáticos desde la carpeta public
app.use(express.static(path.join(__dirname, 'public')));

app.listen(PORT, () => {
    console.log(`Servidor corriendo en: ${PORT}`);
});

module.exports = app;
