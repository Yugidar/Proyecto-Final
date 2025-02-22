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

    const token = jwt.sign(
      { id_user: user[0].id_user, role: user[0].role },
      process.env.JWT_SECRET || 'default_secret',
      { expiresIn: '1h' }
    );

    res.status(200).json({ token, role: user[0].role });

  } catch (err) {
    res.status(500).json({ error: 'Error en el servidor', details: err.message });
  }
};
