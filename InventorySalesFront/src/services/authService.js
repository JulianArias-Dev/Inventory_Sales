const API_URL = '/api';

export const authService = {
  // Obtener token almacenado
  getToken() {
    return localStorage.getItem('token') || sessionStorage.getItem('token') || null;
  },

  // Obtener usuario almacenado
  getUser() {
    const userStr = localStorage.getItem('user') || sessionStorage.getItem('user');
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  },

  // Verificar si hay sesión activa
  isAuthenticated() {
    return !!this.getToken();
  },

  // Headers de autorización para las peticiones a la API
  getAuthHeaders(customHeaders = {}) {
    const token = this.getToken();
    return {
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      ...customHeaders
    };
  },

  // Iniciar sesión
  async login(username, password, rememberMe = true) {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username.trim(),
          password: password
        })
      });

      const responseText = await response.text();
      let data;
      try {
        data = JSON.parse(responseText);
      } catch {
        data = { message: responseText };
      }

      if (!response.ok) {
        throw new Error(data.message || 'Error al iniciar sesión');
      }

      const { token, user } = data;

      if (rememberMe) {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
      } else {
        sessionStorage.setItem('token', token);
        sessionStorage.setItem('user', JSON.stringify(user));
      }

      return { token, user };
    } catch (error) {
      console.error('Error en authService.login:', error);
      throw error;
    }
  },

  // Cerrar sesión
  logout() {
    const token = this.getToken();

    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');

    // Notificar al backend de manera opcional/silenciosa
    if (token) {
      try {
        fetch(`${API_URL}/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }).catch(() => {});
      } catch {
        // Ignorar fallo de red en logout
      }
    }

    // Disparar evento para que componentes reaccionen al logout
    window.dispatchEvent(new Event('auth-changed'));
  },

  // Verificar validez del token en backend
  async verifySession() {
    const token = this.getToken();
    if (!token) return false;

    try {
      const response = await fetch(`${API_URL}/auth/verify`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        this.logout();
        return false;
      }

      const data = await response.json();
      return data.valid === true;
    } catch {
      // Si el backend no está disponible temporalmente pero tenemos token, no desloguear forzosamente
      return true;
    }
  }
};

export default authService;
