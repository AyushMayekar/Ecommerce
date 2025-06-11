import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import React, { useState, useEffect } from "react";
import Navbar from './Components/navbar'
import Footer from './Components/footer'
import HomePage from './Pages/home'
import Contact from './Pages/contact'
import Products from './Pages/products'
import Policy from './Pages/policy'
import PaymentTestPage from './Pages/payment_gateway'
import LandingPage from './Pages/landing'
import ForgotPassword from './Pages/forgot_password'
import ResetPassword from './Pages/reset_password'
import AuthScreen from './Pages/user_auth';
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
          <Route path="/home" element={<HomePage />} />
          <Route path="/products" element={<Products />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/policy" element={<Policy />} />
          <Route path="/payment_gateway" element={<PaymentTestPage />} />
          <Route path="/forgot_password" element={<ForgotPassword />} />
          <Route path="/reset_password" element={<ResetPassword />} />
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
      <AppWrapper />
    </Router>
  );
}

export default App;