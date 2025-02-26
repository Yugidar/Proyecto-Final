const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const authenticate = require('../middleware/authenticate');

router.post('/', authenticate('admin'), productController.createProduct);
router.get('/', authenticate(), productController.getProducts);
router.put('/:id', authenticate('admin'), productController.updateProduct);
router.delete('/:id', authenticate('admin'), productController.deleteProduct);

module.exports = router;
