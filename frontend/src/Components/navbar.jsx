import React from "react";
import "./navbar.css";
import { CgProfile } from "react-icons/cg";
import { MdOutlineShoppingCart } from "react-icons/md";

const Navbar = () => {
    return (
        <div className="navbar">
            <div className="navbar-logo">
                <span>Eagle<span className="hub-highlight">Hub</span></span>
            </div>

            <div className="navbar-links">
                <a href="/home">  Home</a>
                <a href="/myorders">My Orders</a>
                <a href="/contact">Contact Us</a>
                <a href="/policy">Policy</a>
            </div>

            <div className="navbar-icons">
                <a href="/cart" title="Cart">
                    <MdOutlineShoppingCart />
    <span className="icon-label">Cart</span>
                </a>
                <a href="/profile" title="Profile">
                    <CgProfile /> <span className="icon-label">Profile</span>
                </a>
            </div>
        </div>
    );
};

export default Navbar;
