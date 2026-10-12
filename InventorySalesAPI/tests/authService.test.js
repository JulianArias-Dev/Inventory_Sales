const { AuthService } = require('../src/services/authService');
const { createMockPool } = require('./helpers/mockDb');

describe('AuthService Unit Tests', () => {
  let mockPool;
  let service;

  beforeEach(() => {
    mockPool = createMockPool();
    service = new AuthService(mockPool);
  });

  describe('Password Hashing & Comparison', () => {
    it('debe generar un hash seguro diferente al texto plano', async () => {
      const plain = 'Admin123!';
      const hash = await service.hashPassword(plain);

      expect(typeof hash).toBe('string');
      expect(hash).not.toBe(plain);
      expect(hash.length).toBeGreaterThan(10);
    });

    it('debe lanzar error al intentar hashear contraseña vacía', async () => {
      await expect(service.hashPassword('')).rejects.toMatchObject({
        message: 'Password must be a non-empty string'
      });
    });

    it('debe comparar y validar correctamente la contraseña correcta', async () => {
      const plain = 'Admin123!';
      const hash = await service.hashPassword(plain);

      const isValid = await service.comparePassword(plain, hash);
      expect(isValid).toBe(true);
    });

    it('debe rechazar contraseña incorrecta', async () => {
      const plain = 'Admin123!';
      const hash = await service.hashPassword(plain);

      const isValid = await service.comparePassword('WrongPassword', hash);
      expect(isValid).toBe(false);
    });

    it('debe retornar false si algún parámetro es falsy', async () => {
      expect(await service.comparePassword('', 'somehash')).toBe(false);
      expect(await service.comparePassword('pass', '')).toBe(false);
    });

    it('debe retornar false de forma segura si los tipos no son cadenas o si el hash está corrupto', async () => {
      expect(await service.comparePassword(123, 'somehash')).toBe(false);
      expect(await service.comparePassword('pass', 123)).toBe(false);
      expect(await service.comparePassword('pass', null)).toBe(false);
      // PBKDF2 hash con tamaño de hash alterado/truncado
      expect(await service.comparePassword('pass', '$pbkdf2$salt$short')).toBe(false);
      // Hash malformado
      expect(await service.comparePassword('pass', '$pbkdf2$onlyone')).toBe(false);
    });

    it('debe rechazar coincidencia directa en texto plano para exigir cifrado', async () => {
      expect(await service.comparePassword('Admin123!', 'Admin123!')).toBe(false);
    });
  });

  describe('JWT Token Generation & Verification', () => {
    it('debe generar un token JWT válido con payload correcto', () => {
      const user = { id: 1, username: 'Admin', role: 'Admin' };
      const token = service.generateToken(user);

      expect(typeof token).toBe('string');
      const parts = token.split('.');
      expect(parts).toHaveLength(3);
    });

    it('debe lanzar error al intentar generar token sin usuario válido', () => {
      expect(() => service.generateToken(null)).toThrow ? expect(() => service.generateToken(null)).toThrow() : null;
      try {
        service.generateToken(null);
        throw new Error('Debería haber fallado');
      } catch (err) {
        expect(err.message).toBe('User object is required to generate token');
      }
    });

    it('debe verificar y decodificar un token JWT válido', () => {
      const user = { id: 1, username: 'Admin', role: 'Admin' };
      const token = service.generateToken(user);
      const decoded = service.verifyToken(token);

      expect(decoded.id).toBe(1);
      expect(decoded.username).toBe('Admin');
      expect(decoded.role).toBe('Admin');
    });

    it('debe rechazar un token malformado o nulo lanzando status 401', () => {
      try {
        service.verifyToken('invalido.token');
        throw new Error('Debería haber fallado');
      } catch (err) {
        expect(err.status).toBe(401);
      }

      try {
        service.verifyToken('');
        throw new Error('Debería haber fallado');
      } catch (err) {
        expect(err.status).toBe(401);
      }
    });

    it('debe rechazar un token con firma alterada lanzando status 401', () => {
      const user = { id: 1, username: 'Admin', role: 'Admin' };
      const token = service.generateToken(user);
      const parts = token.split('.');
      const tamperedToken = `${parts[0]}.${parts[1]}.badsignature`;

      try {
        service.verifyToken(tamperedToken);
        throw new Error('Debería haber fallado');
      } catch (err) {
        expect(err.status).toBe(401);
      }
    });

    it('debe rechazar un token expirado con status 401 y mensaje apropiado', () => {
      const header = { alg: 'HS256', typ: 'JWT' };
      const payload = {
        id: 1,
        username: 'Admin',
        role: 'Admin',
        iat: 1000,
        exp: 2000 // Expired in the past
      };

      const b64 = (obj) => Buffer.from(JSON.stringify(obj)).toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
      const hStr = b64(header);
      const pStr = b64(payload);
      const crypto = require('crypto');
      const sig = crypto.createHmac('sha256', service.jwtSecret).update(`${hStr}.${pStr}`).digest();
      const sStr = Buffer.from(sig).toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
      const expiredToken = `${hStr}.${pStr}.${sStr}`;

      try {
        service.verifyToken(expiredToken);
        throw new Error('Debería haber fallado');
      } catch (err) {
        expect(err.status).toBe(401);
        expect(err.message).toBe('Token expirado');
      }
    });
  });

  describe('findByUsername', () => {
    it('debe retornar el usuario cuando existe', async () => {
      mockPool.onQuery('SELECT Id as id, Username as username', [
        { id: 1, username: 'Admin', password: 'hashedpassword', role: 'Admin' }
      ]);

      const user = await service.findByUsername('admin');
      expect(user).toEqual({
        id: 1,
        username: 'Admin',
        password: 'hashedpassword',
        role: 'Admin'
      });
    });

    it('debe retornar null cuando el usuario no existe', async () => {
      mockPool.onQuery('SELECT Id as id, Username as username', []);

      const user = await service.findByUsername('nonexistent');
      expect(user).toBeNull();
    });

    it('debe retornar null cuando el username es inválido o vacío', async () => {
      expect(await service.findByUsername('')).toBeNull();
      expect(await service.findByUsername(null)).toBeNull();
    });
  });

  describe('getUserById', () => {
    it('debe retornar información del usuario sin contraseña', async () => {
      mockPool.onQuery('SELECT Id as id, Username as username, Role as role FROM Usuarios WHERE Id = ?', [
        { id: 1, username: 'Admin', role: 'Admin' }
      ]);

      const user = await service.getUserById(1);
      expect(user).toEqual({
        id: 1,
        username: 'Admin',
        role: 'Admin'
      });
      expect(user.password).toBeUndefined();
    });

    it('debe retornar null para ID inexistente o inválido', async () => {
      mockPool.onQuery('SELECT Id as id, Username as username', []);
      expect(await service.getUserById(999)).toBeNull();
      expect(await service.getUserById('abc')).toBeNull();
    });
  });

  describe('login', () => {
    it('debe autenticar exitosamente y retornar token y datos del usuario', async () => {
      const hashedPassword = await service.hashPassword('Admin123!');
      mockPool.onQuery('SELECT Id as id, Username as username', [
        { id: 1, username: 'Admin', password: hashedPassword, role: 'Admin' }
      ]);

      const result = await service.login('Admin', 'Admin123!');
      expect(result.token).toBeDefined();
      expect(result.user).toEqual({
        id: 1,
        username: 'Admin',
        role: 'Admin'
      });
    });

    it('debe lanzar error 400 si falta usuario o contraseña', async () => {
      await expect(service.login('', 'Admin123!')).rejects.toMatchObject({
        status: 400,
        message: 'Usuario y contraseña son requeridos.'
      });

      await expect(service.login('Admin', '')).rejects.toMatchObject({
        status: 400,
        message: 'Usuario y contraseña son requeridos.'
      });
    });

    it('debe lanzar error 401 si el usuario no existe', async () => {
      mockPool.onQuery('SELECT Id as id, Username as username', []);

      await expect(service.login('NoExiste', 'Admin123!')).rejects.toMatchObject({
        status: 401,
        message: 'Usuario o contraseña incorrectos.'
      });
    });

    it('debe lanzar error 401 si la contraseña es incorrecta', async () => {
      const hashedPassword = await service.hashPassword('Admin123!');
      mockPool.onQuery('SELECT Id as id, Username as username', [
        { id: 1, username: 'Admin', password: hashedPassword, role: 'Admin' }
      ]);

      await expect(service.login('Admin', 'PasswordIncorrecta')).rejects.toMatchObject({
        status: 401,
        message: 'Usuario o contraseña incorrectos.'
      });
    });
  });

  describe('ensureAdminUser', () => {
    it('debe crear usuario Admin si no existe', async () => {
      mockPool.onQuery('SELECT Id as id, Username as username', []);
      mockPool.onQuery('INSERT INTO Usuarios', { insertId: 1 });

      const res = await service.ensureAdminUser();
      expect(res.created).toBe(true);
      expect(res.username).toBe('Admin');
    });

    it('no debe duplicar usuario Admin si ya existe', async () => {
      mockPool.onQuery('SELECT Id as id, Username as username', [
        { id: 1, username: 'Admin', password: 'hash', role: 'Admin' }
      ]);

      const res = await service.ensureAdminUser();
      expect(res.created).toBe(false);
      expect(res.username).toBe('Admin');
    });
  });
});
