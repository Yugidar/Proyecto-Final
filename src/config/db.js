const mysql = require('mysql2');

const db = mysql.createPool({
    host: process.env.DB_HOST || 'bbz7w1sdy5yaf7ocvlva-mysql.services.clever-cloud.com',
    user: process.env.DB_USER || 'ufvomre2iqltqutc',
    password: process.env.DB_PASSWORD || 'JfEy8nMBIVlNIQcuASay',
    database: process.env.DB_NAME || 'bbz7w1sdy5yaf7ocvlva',
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

db.getConnection((err, connection) => {
    if (err) {
        console.error('Error en la conexión a MySQL:', err);
    } else {
        console.log('Conectado a MySQL');
        connection.release();
    }
});

module.exports = db;
