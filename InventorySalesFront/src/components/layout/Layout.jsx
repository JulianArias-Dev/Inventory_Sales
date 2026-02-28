import Navbar from "./Navbar"
import '../../styles/Layout.css'; // Crearemos este archivo

const Layout = ({ children }) => {
  return (
    <div className="layout-container">
      <Navbar />
      <main className="main-content">
        {children}
      </main>
    </div>
  )
}

export default Layout