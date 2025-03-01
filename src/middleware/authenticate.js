const jwt = require('jsonwebtoken');

module.exports = (roleRequired = null) => {
    return (req, res, next) => {
        try {
            const authHeader = req.header('Authorization');
            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                return res.status(401).json({ error: 'Acceso denegado, token no proporcionado' });
            }

            const token = authHeader.split(' ')[1];
            if (!process.env.JWT_SECRET) {
                return res.status(500).json({ error: 'Error interno del servidor, clave JWT no configurada' });
            }

            const verified = jwt.verify(token, process.env.JWT_SECRET);
            req.user = verified;

            // Verificar si el usuario tiene el rol adecuado
            if (roleRequired && req.user.role !== roleRequired) {
                return res.status(403).json({ error: 'Acceso prohibido, rol no autorizado' });
            }

            next();
        } catch (err) {
            if (err instanceof jwt.TokenExpiredError) {
                return res.status(440).json({ error: 'Sesión expirada, inicia sesión nuevamente' }); // 440 Login Time-out (usado en algunos servidores)
            }
            if (err instanceof jwt.JsonWebTokenError) {
                return res.status(498).json({ error: 'Token inválido o corrupto' }); // 498 Invalid Token (no estándar, pero usado por algunos servicios)
            }
            if (err instanceof jwt.NotBeforeError) {
                return res.status(425).json({ error: 'Token aún no es válido, espera hasta su activación' }); // 425 Too Early (cuando algo se usa antes de tiempo)
            }
            
            return res.status(520).json({ error: 'Error de autenticación desconocido' }); // 520 Unknown Error (utilizado por Cloudflare y otros servicios)
        }
    };
};
