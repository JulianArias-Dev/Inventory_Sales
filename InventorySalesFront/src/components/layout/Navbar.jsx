import { NavLink } from "react-router-dom"

const Navbar = () => {
    return (
        <div
            className="d-flex flex-column flex-shrink-0 p-3 bg-dark text-white"
            style={{ width: "250px", minHeight: "100vh" }}
        >
            <span className="fs-4 mb-3">Inventario y Ventas</span>

            <ul className="nav nav-pills flex-column mb-auto">

                <li className="nav-item">
                    <NavLink
                        to="/"
                        className={({ isActive }) =>
                            isActive ? "nav-link active" : "nav-link text-white"
                        }
                    >
                        Dashboard
                    </NavLink>
                </li>

                <li>
                    <NavLink
                        to="/products"
                        className={({ isActive }) =>
                            isActive ? "nav-link active" : "nav-link text-white"
                        }
                    >
                        Productos
                    </NavLink>
                </li>

                <li>
                    <NavLink
                        to="/categories"
                        className={({ isActive }) =>
                            isActive ? "nav-link active" : "nav-link text-white"
                        }
                    >
                        Categorías
                    </NavLink>
                </li>

                <li>
                    <NavLink
                        to="/sales"
                        className={({ isActive }) =>
                            isActive ? "nav-link active" : "nav-link text-white"
                        }
                    >
                        Ventas
                    </NavLink>
                </li>

            </ul>
        </div>
    )
}

export default Navbar