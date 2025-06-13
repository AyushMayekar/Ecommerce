import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import React, { useState, useEffect } from "react";
import Navbar from './Components/navbar';
import Footer from './Components/footer';
import HomePage from './Pages/home';
import Contact from './Pages/contact';
import ProductPage from './Pages/single_products';
import Policy from './Pages/policy';
import OrderSuccess from './Pages/payment_success';
import LandingPage from './Pages/landing';
import ForgotPassword from './Pages/forgot_password';
import ResetPassword from './Pages/reset_password';
import BuyNow from './Pages/order_placement';
import AuthScreen from './Pages/user_auth';
import Profile from './Pages/profile';
import MyOrders from './Pages/myorders';
import CartPage from './Pages/cart';
import AdminDashboard from './Pages/admin_dashboard';
import { ToastContainer } from 'react-toastify';
import './style.css';

function AppWrapper() {
  const [signIn, toggle] = useState(true);
  const location = useLocation();

  useEffect(() => {
    // Add login background class ONLY on auth routes
    const authRoutes = ['/user_auth', '/', '/forgot_password', '/reset_password'];
    const isAuthRoute = authRoutes.includes(location.pathname);
    document.body.classList.toggle('login-background', isAuthRoute);
  }, [location]);

  const isAuthRoute = ['/user_auth', '/', '/forgot_password', '/reset_password'].includes(location.pathname);

  return (
    <div className="app">
      {/* Only show Navbar/Footer on non-auth routes */}
      {!isAuthRoute && <Navbar />}

      <main style={{ minHeight: '80vh', padding: '1rem' }}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/product/:sku" element={<ProductPage />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/policy" element={<Policy />} />
          <Route path="/forgot_password" element={<ForgotPassword />} />
          <Route path="/reset_password" element={<ResetPassword />} />
          <Route path="/buy_now" element={<BuyNow />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/payment_success" element={<OrderSuccess />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/myorders" element={<MyOrders />} />
          <Route path="/user_auth" element={<AuthScreen signIn={signIn} toggle={toggle} />} />

          {/* Catch-all: Redirect to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {!isAuthRoute && <Footer />}
    </div>
  );
}

/* 🔁 Top-level router */
function App() {
  return (
    <Router>
      <ToastContainer position="top-center" autoClose={3000} />
      <AppWrapper />
    </Router>
  );
}

export default App;