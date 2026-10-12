const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const categoryRoutes = require('./categoryRoutes');
const productRoutes = require('./productRoutes');
const salesRoutes = require('./salesRoutes');
const reportRoutes = require('./reportRoutes');
const authMiddleware = require('../middlewares/authMiddleware');

// Authentication routes (login is public, verify/logout handled internally)
router.use('/auth', authRoutes);
router.use('/Auth', authRoutes);

// Protected routes matching frontend endpoints (supporting both PascalCase, lowercase, and plural/singular)
router.use('/Categoria', authMiddleware, categoryRoutes);
router.use('/categoria', authMiddleware, categoryRoutes);
router.use('/categorias', authMiddleware, categoryRoutes);

router.use('/Producto', authMiddleware, productRoutes);
router.use('/producto', authMiddleware, productRoutes);
router.use('/productos', authMiddleware, productRoutes);

router.use('/Ventas', authMiddleware, salesRoutes);
router.use('/ventas', authMiddleware, salesRoutes);
router.use('/Venta', authMiddleware, salesRoutes);
router.use('/venta', authMiddleware, salesRoutes);

router.use('/Reporte', authMiddleware, reportRoutes);
router.use('/reporte', authMiddleware, reportRoutes);
router.use('/reportes', authMiddleware, reportRoutes);

module.exports = router;
