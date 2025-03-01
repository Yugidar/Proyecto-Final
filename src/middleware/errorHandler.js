module.exports = (err, req, res, next) => {
    console.error("Error en el servidor:", err);

    let statusCode = err.statusCode || 500;
    let message = err.message || "Error interno del servidor";

    res.status(statusCode).json({ error: message });
};
