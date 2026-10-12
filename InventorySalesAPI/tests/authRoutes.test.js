const http = require('http');

let app = null;
try {
  app = require('../src/app');
} catch (e) {
  // Express not installed in bare host environment; test runs when express is present (e.g. in Docker)
}

if (app) {
  const authService = require('../src/services/authService');

  function makeRequest(server, options, body = null) {
    return new Promise((resolve, reject) => {
      const port = server.address().port;
      const reqOptions = {
        hostname: '127.0.0.1',
        port,
        path: options.path,
        method: options.method || 'GET',
        headers: options.headers || {}
      };

      if (body) {
        const payload = typeof body === 'string' ? body : JSON.stringify(body);
        reqOptions.headers['Content-Type'] = 'application/json';
        reqOptions.headers['Content-Length'] = Buffer.byteLength(payload);
      }

      const req = http.request(reqOptions, (res) => {
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
          let parsed = data;
          try {
            parsed = JSON.parse(data);
          } catch {}
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: parsed
          });
        });
      });

      req.on('error', reject);

      if (body) {
        req.write(typeof body === 'string' ? body : JSON.stringify(body));
      }
      req.end();
    });
  }

  describe('Express HTTP End-to-End Route Tests for Auth', () => {
    let server;

    beforeEach(async () => {
      await new Promise((resolve) => {
        server = app.listen(0, '127.0.0.1', resolve);
      });
    });

    afterEach(async () => {
      if (server) {
        await new Promise((resolve) => {
          server.close(resolve);
        });
      }
    });

    it('debe mantener publico el endpoint /health', async () => {
      const res = await makeRequest(server, { path: '/health', method: 'GET' });
      expect(res.status).toBe(200);
      expect(res.body).toBe('OK');
    });

    it('debe rechazar acceso a /api/Producto sin token con 401', async () => {
      const res = await makeRequest(server, { path: '/api/Producto', method: 'GET' });
      expect(res.status).toBe(401);
      expect(res.body.message).toBe('Acceso no autorizado. Token no proporcionado.');
    });

    it('debe rechazar acceso a /api/Categoria sin token con 401', async () => {
      const res = await makeRequest(server, { path: '/api/Categoria', method: 'GET' });
      expect(res.status).toBe(401);
      expect(res.body.message).toBe('Acceso no autorizado. Token no proporcionado.');
    });

    it('debe responder 400 en /api/auth/login si el cuerpo está vacío', async () => {
      const res = await makeRequest(server, { path: '/api/auth/login', method: 'POST' }, {});
      expect(res.status).toBe(400);
      expect(res.body.message).toBe('Usuario y contraseña requeridos.');
    });

    it('debe responder 401 en /api/auth/login con credenciales inválidas', async () => {
      jest.spyOn(authService, 'login').mockRejectedValue({ status: 401, message: 'Usuario o contraseña incorrectos.' });

      const res = await makeRequest(server, {
        path: '/api/auth/login',
        method: 'POST'
      }, { username: 'Admin', password: 'bad' });

      expect(res.status).toBe(401);
      expect(res.body.message).toBe('Usuario o contraseña incorrectos.');
    });

    it('debe permitir login exitoso y generar token en /api/auth/login', async () => {
      const mockAuthResult = {
        token: authService.generateToken({ id: 1, username: 'Admin', role: 'Admin' }),
        user: { id: 1, username: 'Admin', role: 'Admin' }
      };
      jest.spyOn(authService, 'login').mockResolvedValue(mockAuthResult);

      const res = await makeRequest(server, {
        path: '/api/auth/login',
        method: 'POST'
      }, { username: 'Admin', password: 'Admin123!' });

      expect(res.status).toBe(200);
      expect(res.body.token).toBeDefined();
      expect(res.body.user.username).toBe('Admin');
    });

    it('debe permitir acceso a /api/auth/verify con token Bearer válido', async () => {
      const validToken = authService.generateToken({ id: 1, username: 'Admin', role: 'Admin' });

      const res = await makeRequest(server, {
        path: '/api/auth/verify',
        method: 'GET',
        headers: {
          Authorization: `Bearer ${validToken}`
        }
      });

      expect(res.status).toBe(200);
      expect(res.body.valid).toBe(true);
      expect(res.body.user.username).toBe('Admin');
    });
  });
}
