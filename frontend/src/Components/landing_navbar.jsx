// src/components/Header.jsx
import React from "react";
import { Link } from "react-router-dom";
import "./landing_navbar.css";

const Header = () => {
    return (
        <header className="header">
            <div className="logo">Eagle Hub</div>
            <nav className="nav-buttons">
                <Link to="/contact" className="nav-btn">Contact Us</Link>
                <Link to="/policy" className="nav-btn">Policy</Link>
            </nav>
        </header>
    );
};

export default Header;
