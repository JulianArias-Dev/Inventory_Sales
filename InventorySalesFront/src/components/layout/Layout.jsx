import Navbar from "./Navbar"

const Layout = ({ children }) => {
  return (
    <>
      <Navbar />
      <div
        style={{
          marginLeft: "250px",
          padding: "1.5rem",
          minHeight: "100vh"
        }}
      >
        {children}
      </div>
    </>
  )
}

export default Layout