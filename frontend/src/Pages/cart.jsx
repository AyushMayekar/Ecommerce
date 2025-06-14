// src/pages/CartPage.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./cart.css";
import { ensureAuthenticated } from "../utils/authUtils";
import axios from "axios";

const CartPage = () => {
    const [cartItems, setCartItems] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const checkAuth = async () => {
            const isAuth = await ensureAuthenticated();
            if (!isAuth) {
                navigate("/user_auth");
            }
        };
        checkAuth();
    }, []);

    const fetchCart = async () => {
        try {
            const res = await axios.get("https://eaglehub.onrender.com/view_cart", {
                withCredentials: true,
            });
            setCartItems(res.data.cart || []);
            // console.log("Fetched Cart Items:", res.data.cart)
        } catch (err) {
            console.error("Failed to fetch cart:", err);
        }
    };

    useEffect(() => {
        fetchCart();
    }, []);

    const updateQuantity = async (sku, newQty) => {
        const item = cartItems.find(i => i.sku === sku);
        if (!item) return;

        const totalPrice = item.totalPrice * newQty;
        try {
            await axios.patch(
                "https://eaglehub.onrender.com/update_cart",
                { sku, quantity: newQty, totalPrice: totalPrice, },
                { withCredentials: true }
            );
            setCartItems(prev =>
                prev.map(item =>
                    item.sku === sku ? { ...item, quantity: newQty } : item
                )
            );
        } catch (err) {
            console.error("Failed to update quantity:", err);
        }
    };

    const removeItem = async (sku) => {
        try {
            await axios.delete("https://eaglehub.onrender.com/delete_cart", {
                withCredentials: true,
                data: { sku },
            });
            setCartItems(prev => prev.filter(item => item.sku !== sku));
        } catch (err) {
            console.error("Failed to remove item:", err);
        }
    };


    const getTotals = () => {
        const subtotal = cartItems.reduce(
            (sum, item) => sum + item.totalPrice * item.quantity,
            0
        );
        const gst = subtotal * 0.05;
        const totalQty = cartItems.reduce((sum, item) => sum + item.quantity, 0);
        return { subtotal, gst, total: subtotal, totalQty };
    };

    const handlePlaceOrder = () => {
        const updatedItems = cartItems.map(item => ({
            ...item,
            price: item.unitPrice,
        }));
        navigate("/buy_now", { state: { items: updatedItems } });
    };

    const { subtotal, gst, total, totalQty } = getTotals();

    return (
        <div className="cart-page-wrapper">
            <div className="cart-page-container">
                <h1 className="cart-heading">🛒 Shopping Cart</h1>
                {cartItems.length === 0 ? (
                    <p className="empty-cart">No items in the cart yet.</p>
                ) : (
                    <div className="cart-grid">
                        <div className="cart-items-section">
                            {cartItems.map((item, idx) => (
                                <div key={idx} className="cart-card">
                                    <img
                                        src={item.image_urls?.[0] || ""}
                                        alt={item.name}
                                        className="cart-img"
                                    />
                                    <div className="cart-card-details">
                                        <h3>{item.name}</h3>
                                        {item.size && (
                                            <p>Size: {item.size}</p>
                                        )}

                                        {item.colors && (
                                            <p>Color: {item.colors}</p>
                                        )}
                                        <p>Price: ₹{item.unitPrice}</p>
                                        <p>Total: ₹{item.unitPrice * item.quantity}</p>
                                        <div className="quantity-controls">
                                            <button
                                                onClick={() =>
                                                    item.quantity > 1 &&
                                                    updateQuantity(item.sku, item.quantity - 1)
                                                }
                                            >
                                                -
                                            </button>
                                            <span>{item.quantity}</span>
                                            <button
                                                onClick={() =>
                                                    updateQuantity(item.sku, item.quantity + 1)
                                                }
                                            >
                                                +
                                            </button>
                                        </div>
                                    </div>
                                    <button className="remove-btn" onClick={() => removeItem(item.sku)}>
                                        Remove Item
                                    </button>
                                </div>
                            ))}
                        </div>
                        <div className="cart-summary-section">
                            <div className="summary-box">
                                <h2>Total Summary</h2>
                                <p className="summary-line">Total Quantity: {totalQty}</p>
                                <p className="summary-line">GST (5%)</p>
                                <p className="total-amount">Total: ₹{total.toFixed(2)}</p>
                                <button className="order-btn" onClick={handlePlaceOrder}>
                                    Place Order
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CartPage;
