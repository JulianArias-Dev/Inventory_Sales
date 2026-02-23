import { NavLink } from "react-router-dom"

const Navbar = () => {
    return (
        <div
            className="bg-dark text-white p-3 position-fixed"
            style={{
                width: "250px",
                height: "100vh",
                top: 0,
                left: 0
            }}
        >
            <span className="fs-4 mb-3 d-block">Inventario y Ventas</span>

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