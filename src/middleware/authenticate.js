const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  try {
    const authHeader = req.header('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Acceso denegado, token no proporcionado' });
    }

    const token = authHeader.split(' ')[1]; // Extrae el token correctamente
    const verified = jwt.verify(token, process.env.JWT_SECRET);

    req.user = verified; // Agregar datos del usuario al request
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expirado' });
    }
    return res.status(400).json({ error: 'Token no válido' });
  }
};
