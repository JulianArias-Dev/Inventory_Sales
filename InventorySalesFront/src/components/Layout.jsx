import Navbar from "./Navbar"

const Layout = ({ children }) => {
  return (
    <div className="d-flex">
      <Navbar />
      <div className="flex-grow-1 p-4">
        {children}
      </div>
    </div>
  )
}

export default Layout