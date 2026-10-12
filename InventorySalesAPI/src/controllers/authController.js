const authService = require('../services/authService');

const authController = {
  async login(req, res, next) {
    try {
      const username = req.body?.username || req.body?.user;
      const password = req.body?.password;

      if (!username || !password) {
        return res.status(400).json({ message: 'Usuario y contraseña requeridos.' });
      }

      const result = await authService.login(username, password);
      return res.status(200).json(result);
    } catch (err) {
      const status = err.status || 500;
      return res.status(status).json({ message: err.message || 'Error al iniciar sesión' });
    }
  },

  async verify(req, res, next) {
    try {
      return res.status(200).json({
        valid: true,
        user: req.user
      });
    } catch (err) {
      return next(err);
    }
  },

  async logout(req, res, next) {
    try {
      return res.status(200).json({ message: 'Sesión cerrada exitosamente.' });
    } catch (err) {
      return next(err);
    }
  }
};

module.exports = authController;
