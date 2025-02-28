const jwt = require('jsonwebtoken');

module.exports = (roleRequired = null) => {
    return (req, res, next) => {
        try {
            const authHeader = req.header('authorization');
            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                return res.status(401).json({ error: 'Acceso denegado, token no proporcionado' });
            }

            const token = authHeader.split(' ')[1];
            if (!process.env.JWT_SECRET) {
                return res.status(500).json({ error: 'Clave JWT no configurada' });
            }

            const verified = jwt.verify(token, process.env.JWT_SECRET || 'default_secret');
            req.user = verified;

            // Verificar si el usuario tiene el rol adecuado
            if (roleRequired && req.user.role !== roleRequired) {
                return res.status(403).json({ error: 'Acceso denegado, rol no autorizado' });
            }

            next();
        } catch (err) {
            if (err.name === 'TokenExpiredError') {
                return res.status(401).json({ error: 'Token expirado' });
            }
            return res.status(400).json({ error: 'Token no válido' });
        }
    };
};
