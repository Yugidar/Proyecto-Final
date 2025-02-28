const db = require('../config/db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

exports.register = async (req, res) => {
  const { username, password, role } = req.body;

  try {
    if (!username || !password || !role) {
      return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }

    if (!['admin', 'normal'].includes(role)) {
      return res.status(400).json({ error: 'Rol no válido' });
    }

    const [existingUser] = await db.promise().query('SELECT * FROM user WHERE username = ?', [username]);
    if (existingUser.length > 0) {
      return res.status(400).json({ error: 'El usuario ya existe' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await db.promise().query('INSERT INTO user (username, password, role) VALUES (?, ?, ?)', [
      username, hashedPassword, role
    ]);

    res.status(201).json({ message: 'Usuario registrado exitosamente' });

  } catch (err) {
    res.status(500).json({ error: 'Error en el servidor', details: err.message });
  }
};

exports.login = async (req, res) => {
  const { username, password } = req.body;

  try {
    const [user] = await db.promise().query('SELECT * FROM user WHERE username = ?', [username]);
    if (user.length === 0) {
      return res.status(400).json({ error: 'Usuario no encontrado' });
    }

    const isMatch = await bcrypt.compare(password, user[0].password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Contraseña incorrecta' });
    }

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ error: 'Clave JWT no configurada' });
    }

    const issuedAt = Math.floor(Date.now() / 1000); // Hora de emisión (en segundos)
    const expiresAt = issuedAt + 3600; // Expira en 1 hora

    const tokenPayload = {
      id_user: user[0].id_user,
      role: user[0].role,
      iat: issuedAt,
      exp: expiresAt,
      token_id: `${user[0].id_user}-${issuedAt}` // Identificador único del token
    };

    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET);

    res.status(200).json({ token, role: user[0].role });

  } catch (err) {
    res.status(500).json({ error: 'Error en el servidor', details: err.message });
  }
};


exports.getUserProfile = async (req, res) => {
  try {
      const userId = req.user.id_user; // Obtiene el ID del usuario autenticado

      const [user] = await db.promise().query(
          "SELECT username, role FROM user WHERE id_user = ?", 
          [userId]
      );

      if (user.length === 0) {
          return res.status(404).json({ error: "Usuario no encontrado" });
      }

      res.status(200).json(user[0]);
  } catch (error) {
      console.error("Error al obtener perfil:", error);
      res.status(500).json({ error: "Error interno del servidor" });
  }
};
