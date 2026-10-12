const authService = require('../services/authService');

function authMiddleware(req, res, next) {
  let authHeader = req.headers?.authorization || req.headers?.Authorization;

  if (Array.isArray(authHeader)) {
    authHeader = authHeader[0];
  }

  if (!authHeader || typeof authHeader !== 'string') {
    return res.status(401).json({ message: 'Acceso no autorizado. Token no proporcionado.' });
  }

  const parts = authHeader.trim().split(/\s+/);
  if (parts.length !== 2 || parts[0].toLowerCase() !== 'bearer') {
    return res.status(401).json({ message: 'Formato de autorización inválido. Debe ser: Bearer <token>' });
  }

  const token = parts[1];

  try {
    const decoded = authService.verifyToken(token);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: err.message || 'Token inválido o expirado.' });
  }
}

module.exports = authMiddleware;
