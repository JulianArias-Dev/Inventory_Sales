const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/login', authController.login);
router.get('/verify', authMiddleware, authController.verify);
router.get('/me', authMiddleware, authController.verify);
router.post('/logout', authController.logout);

module.exports = router;
