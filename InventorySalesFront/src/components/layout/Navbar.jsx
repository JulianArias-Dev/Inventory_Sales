import { NavLink } from "react-router-dom"
import '../../styles/NavBar.css'; // Crearemos este archivo

const Navbar = () => {
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
        </div>
    )
}

export default Navbar