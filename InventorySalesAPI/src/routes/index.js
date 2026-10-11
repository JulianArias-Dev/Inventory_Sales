const express = require('express');
const router = express.Router();

const categoryRoutes = require('./categoryRoutes');
const productRoutes = require('./productRoutes');
const salesRoutes = require('./salesRoutes');
const reportRoutes = require('./reportRoutes');

// Mount routes matching frontend endpoints (supporting both PascalCase, lowercase, and plural/singular)
router.use('/Categoria', categoryRoutes);
router.use('/categoria', categoryRoutes);
router.use('/categorias', categoryRoutes);

router.use('/Producto', productRoutes);
router.use('/producto', productRoutes);
router.use('/productos', productRoutes);

router.use('/Ventas', salesRoutes);
router.use('/ventas', salesRoutes);
router.use('/Venta', salesRoutes);
router.use('/venta', salesRoutes);

router.use('/Reporte', reportRoutes);
router.use('/reporte', reportRoutes);
router.use('/reportes', reportRoutes);

module.exports = router;
