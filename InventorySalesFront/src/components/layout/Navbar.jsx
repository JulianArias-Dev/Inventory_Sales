import { NavLink } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import '../../styles/NavBar.css';

const Navbar = () => {
    const { user, logout } = useAuth();

    return (
        <div className="navbar-container">
            <div className="navbar-brand">
                <i className="bi bi-box-seam me-2"></i>
                <span>Inventario y Ventas</span>
            </div>

            <ul className="nav-menu">
                <li>
                    <NavLink
                        to="/"
                        className={({ isActive }) =>
                            isActive ? "nav-link active" : "nav-link"
                        }
                    >
                        <i className="bi bi-speedometer2 me-2"></i>
                        Dashboard
                    </NavLink>
                </li>

                <li>
                    <NavLink
                        to="/products"
                        className={({ isActive }) =>
                            isActive ? "nav-link active" : "nav-link"
                        }
                    >
                        <i className="bi bi-box-seam me-2"></i>
                        Productos
                    </NavLink>
                </li>

                <li>
                    <NavLink
                        to="/categories"
                        className={({ isActive }) =>
                            isActive ? "nav-link active" : "nav-link"
                        }
                    >
                        <i className="bi bi-tags me-2"></i>
                        Categorías
                    </NavLink>
                </li>

                <li>
                    <NavLink
                        to="/sales"
                        className={({ isActive }) =>
                            isActive ? "nav-link active" : "nav-link"
                        }
                    >
                        <i className="bi bi-cart-check me-2"></i>
                        Ventas
                    </NavLink>
                </li>
            </ul>

            <div className="navbar-footer">
                <div className="user-info">
                    <i className="bi bi-person-circle"></i>
                    <div className="user-details">
                        <span className="user-name">{user?.username || 'Admin'}</span>
                        <span className="user-role">{user?.role || 'Administrador'}</span>
                    </div>
                </div>
                <button
                    onClick={logout}
                    className="btn-logout"
                    title="Cerrar sesión"
                >
                    <i className="bi bi-box-arrow-right me-2"></i>
                    <span>Cerrar sesión</span>
                </button>
            </div>
        </div>
    )
}

export default Navbar