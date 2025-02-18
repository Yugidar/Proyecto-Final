require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// string de conexion a cluster de MongoDB
mongoose.connect('mongodb+srv://admin:1234@test.bnnzmy9.mongodb.net/?retryWrites=true&w=majority&appName=Test')
  .then(() => console.log('MongoDB conectado'))
  .catch(err => console.log('Error conectando a MongoDB:', err));

// Importar rutas
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');

app.use('/auth', authRoutes);
app.use('/products', productRoutes);


// Servir archivos estáticos desde la carpeta public
app.use(express.static(path.join(__dirname, '../public')));

app.listen(PORT, () => {
  console.log(`Servidor corriendo en: ${PORT}`);
});

module.exports = app;