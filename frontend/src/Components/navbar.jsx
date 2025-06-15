import React, { useEffect, useState } from "react";
import "./navbar.css";
import { CgProfile } from "react-icons/cg";
import { MdOutlineShoppingCart } from "react-icons/md";
import { Link } from "react-router-dom";

const Navbar = () => {
    const [role, setRole] = useState(null);

    useEffect(() => {
        const storedRole = localStorage.getItem("user_role");
        if (storedRole === "admin") {
            setRole("admin");
        } else {
            setRole("user"); // or null
        }
    }, []);


    return (
        <div className="navbar">
            <div className="navbar-logo">
                <span>Eagle<span className="hub-highlight">Hub</span></span>
            </div>

            <div className="navbar-links">
                <Link to="/home">Home</Link>
                <Link to="/myorders">My Orders</Link>
                <Link to="/contact">Contact Us</Link>
                <Link to="/policy">Policy</Link>
                {role === "admin" && (
                    <Link to="/admin" className="admin-button">
                        Admin
                    </Link>
                )}
            </div>

            <div className="navbar-icons">
                <Link to="/cart" title="Cart">
                    <MdOutlineShoppingCart />
                    <span className="icon-label">Cart</span>
                </Link>
                <Link to="/profile" title="Profile">
                    <CgProfile />
                    <span className="icon-label">Profile</span>
                </Link>
            </div>
        </div>
    );
};

export default Navbar;
