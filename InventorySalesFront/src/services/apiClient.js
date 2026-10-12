import { authService } from './authService';

/**
 * Wrapper sobre fetch que inyecta automáticamente los headers de autenticación (JWT)
 * y gestiona el cierre de sesión si el backend responde 401 Unauthorized.
 */
export async function apiRequest(url, options = {}) {
  const customHeaders = options.headers || {};
  const headers = authService.getAuthHeaders(customHeaders);

  const response = await fetch(url, {
    ...options,
    headers
  });

  if (response.status === 401) {
    authService.logout();
  }

  return response;
}

export default apiRequest;
