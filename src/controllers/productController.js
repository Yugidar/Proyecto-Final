const db = require('../config/db');

// Crear producto
exports.createProduct = async (req, res) => {
  const { name, description } = req.body;

  if (!name || !description) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios' });
  }

  try {
    const [result] = await db.promise().query(
      'INSERT INTO products (name, description, user_id) VALUES (?, ?, ?)',
      [name, description, req.user.id_user]
    );

    res.status(201).json({ message: 'Producto creado', productId: result.insertId });

  } catch (err) {
    res.status(500).json({ error: 'Error al crear el producto' });
  }
};

// Obtener todos los productos
exports.getProducts = async (req, res) => {
  try {
    const [products] = await db.promise().query('SELECT * FROM products');
    res.status(200).json(products);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener productos' });
  }
};

// Actualizar producto
exports.updateProduct = async (req, res) => {
  const { id } = req.params;
  const { name, description } = req.body;

  try {
    const [result] = await db.promise().query(
      'UPDATE products SET name = ?, description = ? WHERE id_product = ?',
      [name, description, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    res.status(200).json({ message: 'Producto actualizado' });

  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar el producto' });
  }
};

// Eliminar producto
exports.deleteProduct = async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await db.promise().query('DELETE FROM products WHERE id_product = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    res.status(200).json({ message: 'Producto eliminado' });

  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar el producto' });
  }
};
