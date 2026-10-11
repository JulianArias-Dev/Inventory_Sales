const express = require('express');
const router = express.Router();
const salesController = require('../controllers/salesController');

router.get('/', salesController.getAll);
router.post('/', salesController.create);
router.get('/:saleId', salesController.getById);

module.exports = router;
