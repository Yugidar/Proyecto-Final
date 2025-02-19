//se solicita el modelo de producto
const Product = require('../models/product');
//metodo para crear el producto
exports.createProduct = async (req, res) => {
  try {
    const product = new Product({
      name: req.body.name,
      description: req.body.description,
      userId: req.user._id 
    });
    const savedProduct = await product.save();
    res.status(201).json(savedProduct);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
//metodo para obtener el producto
exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.status(200).json(products);
  } catch (err) {
    res.status(400).send('Error al obtener productos');
  }
};

//metodo para actualizar el producto
exports.updateProduct = async (req, res) => {
    const { id } = req.params;
    const { name, description } = req.body;
    try {
      const product = await Product.findByIdAndUpdate(id, { name, description }, { new: true });
      if (!product) {
        return res.status(404).send('Producto no encontrado');
      }
      res.status(200).json(product);
    } catch (err) {
      res.status(400).send('Error al actualizar producto');
    }
  };
  
  //metodo para eliminar un producto
  exports.deleteProduct = async (req, res) => {
    const { id } = req.params;
    try {
      const product = await Product.findByIdAndDelete(id);
      if (!product) {
        return res.status(404).send('Producto no encontrado');
      }
      res.status(200).send('Producto eliminado');
    } catch (err) {
      res.status(400).send('Error al eliminar producto');
    }
  };