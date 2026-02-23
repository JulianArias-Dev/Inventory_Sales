import { BrowserRouter, Routes, Route } from "react-router-dom"
import Layout from "./components/Layout"
import Dashboard from "./pages/dashboard"
import Products from "./pages/products"
import Categories from "./pages/categories"
import Sales from "./pages/sales"

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/products" element={<Products />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/sales" element={<Sales />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}

export default App