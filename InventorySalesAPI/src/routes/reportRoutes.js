const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');

router.get('/summary', reportController.getSummary);
router.get('/ventas-por-dia', reportController.getSalesByDay);
router.get('/productos-top/:top', reportController.getTopProducts);
router.get('/productos-top', reportController.getTopProducts);
router.get('/ventas-por-categoria', reportController.getSalesByCategory);

module.exports = router;
