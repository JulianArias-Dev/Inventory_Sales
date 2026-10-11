const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');

router.get('/', categoryController.getAll);
router.post('/', categoryController.create);
router.get('/:categoryId/tiene-productos', categoryController.tieneProductos);
router.get('/:categoryId', categoryController.getById);
router.put('/:categoryId', categoryController.update);
router.delete('/:categoryId', categoryController.delete);

module.exports = router;
