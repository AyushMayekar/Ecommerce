import { Routes, Route } from 'react-router-dom'
import Navbar from './Components/navbar'
import Footer from './Components/footer'
import Home from './Pages/home'
import Contact from './Pages/contact'
import Products from './Pages/products'
import Policy from './Pages/policy'
import PaymentTestPage from './Pages/payment_gateway'

function App() {
  return (
    <div className="app">
      <Navbar />
      <main style={{ minHeight: '80vh', padding: '1rem' }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/policy" element={<Policy />} />
          <Route path="/payment_gateway" element={<PaymentTestPage />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}

export default App
