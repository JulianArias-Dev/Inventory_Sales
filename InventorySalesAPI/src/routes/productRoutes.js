const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

router.get('/', productController.getAll);
router.post('/', productController.create);
router.get('/:productId', productController.getById);
router.put('/:productId', productController.update);
router.delete('/:productId', productController.delete);

module.exports = router;
