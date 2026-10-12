const crypto = require('crypto');
const db = require('../config/db');

// Attempt to load bcryptjs or bcrypt
let bcryptLib = null;
try {
  bcryptLib = require('bcryptjs');
} catch (e1) {
  try {
    bcryptLib = require('bcrypt');
  } catch (e2) {
    bcryptLib = null;
  }
}

// Attempt to load jsonwebtoken
let jwtLib = null;
try {
  jwtLib = require('jsonwebtoken');
} catch (e) {
  jwtLib = null;
}

const JWT_SECRET = process.env.JWT_SECRET || 'inventory-sales-jwt-secret-key-2026';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

// Helper for pure-Node base64url encoding
function base64UrlEncode(data) {
  const buf = Buffer.isBuffer(data) ? data : Buffer.from(typeof data === 'string' ? data : JSON.stringify(data));
  return buf.toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

function base64UrlDecode(str) {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  return Buffer.from(base64, 'base64').toString('utf8');
}

class AuthService {
  constructor(customPool = null) {
    this._pool = customPool;
  }

  get pool() {
    return this._pool || db.pool;
  }

  get jwtSecret() {
    return process.env.JWT_SECRET || 'inventory-sales-jwt-secret-key-2026';
  }

  get jwtExpiresIn() {
    return process.env.JWT_EXPIRES_IN || '24h';
  }

  /**
   * Hashes a plain password using bcryptjs / bcrypt, or PBKDF2 fallback.
   */
  async hashPassword(password) {
    if (typeof password !== 'string' || !password) {
      throw new Error('Password must be a non-empty string');
    }

    if (bcryptLib) {
      return await bcryptLib.hash(password, 10);
    }

    // Pure Node fallback
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
    return `$pbkdf2$${salt}$${hash}`;
  }

  /**
   * Compares plain password with hashed password.
   */
  async comparePassword(password, hashedPassword) {
    if (!password || !hashedPassword || typeof password !== 'string' || typeof hashedPassword !== 'string') {
      return false;
    }

    if (hashedPassword.startsWith('$2a$') || hashedPassword.startsWith('$2b$') || hashedPassword.startsWith('$2y$')) {
      if (bcryptLib) {
        return await bcryptLib.compare(password, hashedPassword);
      }
      return false;
    }

    if (hashedPassword.startsWith('$pbkdf2$')) {
      const parts = hashedPassword.split('$');
      if (parts.length !== 4) return false;
      const salt = parts[2];
      const originalHash = parts[3];
      const computedHash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
      const bufComputed = Buffer.from(computedHash);
      const bufOriginal = Buffer.from(originalHash);
      if (bufComputed.length !== bufOriginal.length) return false;
      return crypto.timingSafeEqual(bufComputed, bufOriginal);
    }

    return false;
  }

  /**
   * Generates a signed JWT token.
   */
  generateToken(user) {
    if (!user || typeof user !== 'object') {
      throw new Error('User object is required to generate token');
    }

    const payload = {
      id: user.id,
      username: user.username,
      role: user.role || 'Admin'
    };

    if (jwtLib) {
      return jwtLib.sign(payload, this.jwtSecret, { expiresIn: this.jwtExpiresIn });
    }

    // RFC 7519 compliant HMAC-SHA256 JWT fallback
    const header = { alg: 'HS256', typ: 'JWT' };
    const issuedAt = Math.floor(Date.now() / 1000);
    const expiresInSec = 24 * 60 * 60; // 24h
    const tokenPayload = {
      ...payload,
      iat: issuedAt,
      exp: issuedAt + expiresInSec
    };

    const encodedHeader = base64UrlEncode(header);
    const encodedPayload = base64UrlEncode(tokenPayload);
    const signature = crypto
      .createHmac('sha256', this.jwtSecret)
      .update(`${encodedHeader}.${encodedPayload}`)
      .digest();
    const encodedSignature = base64UrlEncode(signature);

    return `${encodedHeader}.${encodedPayload}.${encodedSignature}`;
  }

  /**
   * Verifies and decodes a JWT token.
   */
  verifyToken(token) {
    if (!token || typeof token !== 'string') {
      const err = new Error('Token no proporcionado o inválido');
      err.status = 401;
      throw err;
    }

    if (jwtLib) {
      try {
        return jwtLib.verify(token, this.jwtSecret);
      } catch (e) {
        const err = new Error('Token inválido o expirado');
        err.status = 401;
        throw err;
      }
    }

    // RFC 7519 verification fallback
    const parts = token.split('.');
    if (parts.length !== 3) {
      const err = new Error('Formato de token inválido');
      err.status = 401;
      throw err;
    }

    const [encodedHeader, encodedPayload, encodedSignature] = parts;
    const expectedSig = crypto
      .createHmac('sha256', this.jwtSecret)
      .update(`${encodedHeader}.${encodedPayload}`)
      .digest();
    const expectedEncodedSig = base64UrlEncode(expectedSig);

    const sigBuf = Buffer.from(encodedSignature);
    const expectedSigBuf = Buffer.from(expectedEncodedSig);
    if (sigBuf.length !== expectedSigBuf.length || !crypto.timingSafeEqual(sigBuf, expectedSigBuf)) {
      const err = new Error('Firma de token inválida');
      err.status = 401;
      throw err;
    }

    try {
      const payload = JSON.parse(base64UrlDecode(encodedPayload));
      const now = Math.floor(Date.now() / 1000);
      if (payload.exp && payload.exp < now) {
        const err = new Error('Token expirado');
        err.status = 401;
        throw err;
      }
      return payload;
    } catch (e) {
      if (e.status) throw e;
      const err = new Error('Error al decodificar token');
      err.status = 401;
      throw err;
    }
  }

  /**
   * Finds a user by username (case-insensitive).
   */
  async findByUsername(username) {
    if (!username || typeof username !== 'string') return null;

    const [rows] = await this.pool.query(
      'SELECT Id as id, Username as username, Password as password, Role as role FROM Usuarios WHERE LOWER(TRIM(Username)) = LOWER(TRIM(?))',
      [username.trim()]
    );

    if (!rows || rows.length === 0) return null;

    return {
      id: Number(rows[0].id),
      username: rows[0].username,
      password: rows[0].password,
      role: rows[0].role || 'Admin'
    };
  }

  /**
   * Retrieves user info by ID (excluding password).
   */
  async getUserById(id) {
    const numericId = parseInt(id, 10);
    if (isNaN(numericId) || numericId <= 0) return null;

    const [rows] = await this.pool.query(
      'SELECT Id as id, Username as username, Role as role FROM Usuarios WHERE Id = ?',
      [numericId]
    );

    if (!rows || rows.length === 0) return null;

    return {
      id: Number(rows[0].id),
      username: rows[0].username,
      role: rows[0].role || 'Admin'
    };
  }

  /**
   * Authenticates user credentials and returns JWT token and user info.
   */
  async login(username, password) {
    const cleanUsername = typeof username === 'string' ? username.trim() : '';
    const cleanPassword = typeof password === 'string' ? password : '';

    if (!cleanUsername || !cleanPassword) {
      const err = new Error('Usuario y contraseña son requeridos.');
      err.status = 400;
      throw err;
    }

    const user = await this.findByUsername(cleanUsername);
    if (!user) {
      const err = new Error('Usuario o contraseña incorrectos.');
      err.status = 401;
      throw err;
    }

    const isMatch = await this.comparePassword(cleanPassword, user.password);
    if (!isMatch) {
      const err = new Error('Usuario o contraseña incorrectos.');
      err.status = 401;
      throw err;
    }

    const token = this.generateToken(user);

    return {
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role
      }
    };
  }

  /**
   * Ensures the single Admin user exists with password Admin123!
   */
  async ensureAdminUser(executor = null) {
    const dbClient = executor || this.pool;
    const [rows] = await dbClient.query(
      'SELECT Id as id, Username as username FROM Usuarios WHERE LOWER(TRIM(Username)) = LOWER(TRIM(?))',
      ['Admin']
    );
    if (rows && rows.length > 0) {
      return { created: false, username: rows[0].username };
    }

    const hashedPassword = await this.hashPassword('Admin123!');
    const [result] = await dbClient.query(
      'INSERT INTO Usuarios (Username, Password, Role) VALUES (?, ?, ?)',
      ['Admin', hashedPassword, 'Admin']
    );

    return {
      created: true,
      id: result?.insertId,
      username: 'Admin'
    };
  }
}

module.exports = new AuthService();
module.exports.AuthService = AuthService;
