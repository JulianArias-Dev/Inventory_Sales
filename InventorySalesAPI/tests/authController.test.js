const authController = require('../src/controllers/authController');
const authService = require('../src/services/authService');
const authMiddleware = require('../src/middlewares/authMiddleware');

describe('AuthController & AuthMiddleware Unit Tests', () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    req = { params: {}, body: {}, headers: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis()
    };
    next = jest.fn();
  });

  describe('authController.login', () => {
    it('debe responder 200 con token y usuario cuando credenciales son válidas', async () => {
      req.body = { username: 'Admin', password: 'Admin123!' };
      const authResult = {
        token: 'mock-jwt-token',
        user: { id: 1, username: 'Admin', role: 'Admin' }
      };

      jest.spyOn(authService, 'login').mockResolvedValue(authResult);

      await authController.login(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(authResult);
    });

    it('debe responder 400 si falta el nombre de usuario o la contraseña', async () => {
      req.body = { username: '', password: 'Admin123!' };
      await authController.login(req, res, next);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Usuario y contraseña requeridos.' });

      res.status.mockClear();
      res.json.mockClear();

      req.body = { username: 'Admin', password: '' };
      await authController.login(req, res, next);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Usuario y contraseña requeridos.' });
    });

    it('debe responder 401 si las credenciales son incorrectas', async () => {
      req.body = { username: 'Admin', password: 'WrongPassword' };
      const err = new Error('Usuario o contraseña incorrectos.');
      err.status = 401;

      jest.spyOn(authService, 'login').mockRejectedValue(err);

      await authController.login(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'Usuario o contraseña incorrectos.' });
    });
  });

  describe('authController.verify', () => {
    it('debe responder 200 con valid=true y datos del usuario', async () => {
      req.user = { id: 1, username: 'Admin', role: 'Admin' };

      await authController.verify(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        valid: true,
        user: { id: 1, username: 'Admin', role: 'Admin' }
      });
    });
  });

  describe('authController.logout', () => {
    it('debe responder 200 con mensaje de éxito', async () => {
      await authController.logout(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Sesión cerrada exitosamente.'
      });
    });
  });

  describe('authMiddleware', () => {
    it('debe permitir acceso y fijar req.user cuando el token Bearer es válido', () => {
      req.headers = { authorization: 'Bearer valid-token-123' };
      const decodedUser = { id: 1, username: 'Admin', role: 'Admin' };

      jest.spyOn(authService, 'verifyToken').mockReturnValue(decodedUser);

      authMiddleware(req, res, next);

      expect(req.user).toEqual(decodedUser);
      expect(next).toHaveBeenCalled();
    });

    it('debe retornar 401 si falta el header Authorization', () => {
      req.headers = {};

      authMiddleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Acceso no autorizado. Token no proporcionado.'
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('debe retornar 401 si el formato del header no es Bearer <token>', () => {
      req.headers = { authorization: 'Basic token123' };

      authMiddleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Formato de autorización inválido. Debe ser: Bearer <token>'
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('debe retornar 401 si verifyToken lanza error por token expirado o inválido', () => {
      req.headers = { authorization: 'Bearer expired-token' };
      const err = new Error('Token inválido o expirado');
      err.status = 401;

      jest.spyOn(authService, 'verifyToken').mockImplementation(() => {
        throw err;
      });

      authMiddleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Token inválido o expirado'
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('debe tolerar múltiples espacios y soportar header como array', () => {
      req.headers = { authorization: ['Bearer    valid-spaced-token'] };
      const decodedUser = { id: 1, username: 'Admin', role: 'Admin' };

      jest.spyOn(authService, 'verifyToken').mockReturnValue(decodedUser);

      authMiddleware(req, res, next);

      expect(req.user).toEqual(decodedUser);
      expect(next).toHaveBeenCalled();
    });

    it('debe retornar 401 si req.headers no está definido o el header no es string', () => {
      req.headers = null;
      authMiddleware(req, res, next);
      expect(res.status).toHaveBeenCalledWith(401);
    });
  });
});
