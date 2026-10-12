import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/login.css';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirigir si ya está autenticado
  useEffect(() => {
    if (isAuthenticated) {
      const fromPath = location.state?.from?.pathname;
      const origin = fromPath && fromPath !== '/login' ? fromPath : '/';
      navigate(origin, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password) {
      setError('Por favor ingresa usuario y contraseña');
      return;
    }

    setLoading(true);

    try {
      await login(username.trim(), password);
      const fromPath = location.state?.from?.pathname;
      const origin = fromPath && fromPath !== '/login' ? fromPath : '/';
      navigate(origin, { replace: true });
    } catch (err) {
      setError(err.message || 'Credenciales inválidas. Verifica tu usuario y contraseña.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page-wrapper">
      <div className="login-card">
        <div className="login-brand">
          <div className="login-brand-icon">
            <i className="bi bi-box-seam"></i>
          </div>
          <h1>Inventario y Ventas</h1>
          <p>Ingresa tus credenciales para acceder</p>
        </div>

        {error && (
          <div className="login-alert-danger" role="alert">
            <i className="bi bi-exclamation-triangle-fill"></i>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="login-form-group">
            <label className="login-form-label" htmlFor="username">
              Usuario
            </label>
            <div className="login-input-wrapper">
              <i className="bi bi-person login-input-icon"></i>
              <input
                id="username"
                type="text"
                className="login-input"
                placeholder="Ingresa tu usuario"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                required
                disabled={loading}
              />
            </div>
          </div>

          <div className="login-form-group">
            <label className="login-form-label" htmlFor="password">
              Contraseña
            </label>
            <div className="login-input-wrapper">
              <i className="bi bi-shield-lock login-input-icon"></i>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                className="login-input"
                placeholder="Ingresa tu contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
                disabled={loading}
              />
              <button
                type="button"
                className="login-password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                aria-label={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
              >
                <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="login-btn-submit"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="login-spinner"></span>
                <span>Iniciando sesión...</span>
              </>
            ) : (
              <>
                <i className="bi bi-box-arrow-in-right"></i>
                <span>Iniciar Sesión</span>
              </>
            )}
          </button>
        </form>

        <div className="login-footer-info">
          <i className="bi bi-shield-check text-primary"></i>
          <span>Autenticación segura con cifrado y JWT</span>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
