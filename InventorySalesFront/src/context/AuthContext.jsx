import { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => authService.getUser());
  const [token, setToken] = useState(() => authService.getToken());
  const [loading, setLoading] = useState(true);

  const isAuthenticated = !!token && !!user;

  useEffect(() => {
    // Al montar, sincronizar y verificar validez de sesión
    const verifyAndSync = async () => {
      const currentToken = authService.getToken();
      const currentUser = authService.getUser();

      if (currentToken && currentUser) {
        const isValid = await authService.verifySession();
        if (isValid) {
          setToken(currentToken);
          setUser(currentUser);
        } else {
          setToken(null);
          setUser(null);
        }
      } else {
        setToken(null);
        setUser(null);
      }
      setLoading(false);
    };

    const syncAuth = () => {
      const currentToken = authService.getToken();
      const currentUser = authService.getUser();
      setToken(currentToken);
      setUser(currentUser);
    };

    verifyAndSync();

    // Escuchar cambios de sesión (ej. logout en otra pestaña o desde servicio)
    window.addEventListener('auth-changed', syncAuth);
    window.addEventListener('storage', syncAuth);

    return () => {
      window.removeEventListener('auth-changed', syncAuth);
      window.removeEventListener('storage', syncAuth);
    };
  }, []);

  const login = async (username, password, rememberMe = true) => {
    const result = await authService.login(username, password, rememberMe);
    setToken(result.token);
    setUser(result.user);
    return result;
  };

  const logout = () => {
    authService.logout();
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        loading,
        login,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser utilizado dentro de un AuthProvider');
  }
  return context;
};

export default AuthContext;
