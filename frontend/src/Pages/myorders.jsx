// src/pages/MyOrders.jsx
import React, { useEffect, useState } from "react";
import "./myorders.css";
import { ensureAuthenticated } from "../utils/authUtils";
import { useNavigate } from "react-router-dom";

const MyOrders = () => {
    const [orders, setOrders] = useState([]);
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

    useEffect(() => {
        const storedOrders = JSON.parse(localStorage.getItem("orders")) || [];
        setOrders(storedOrders);
    }, []);

    const deleteOrder = (id) => {
        const filtered = orders.filter((order) => order.id !== id);
        localStorage.setItem("orders", JSON.stringify(filtered));
        setOrders(filtered);
    };

    const calculateTotal = (items) => {
        const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
        const gst = subtotal * 0.05;
        return (subtotal + gst).toFixed(2);
    };

    return (
        <div className="myorders-page-wrapper">
            <div className="my-orders-page">
                <h1 className="my-orders-title"> My Orders</h1>
                {orders.length === 0 ? (
                    <p className="no-orders">No orders placed yet.</p>
                ) : (
                    orders.map((order) => (
                        <div key={order.id} className="order-block">
                            <div className="order-header">
                                <h3 className="order-date">📅 Order Date: {order.date}</h3>
                                <button className="delete-btn" onClick={() => deleteOrder(order.id)}>
                                    🗑️ Delete Order
                                </button>
                            </div>
                            <div className="my-orders-container">
                                {order.items.map((item, index) => (
                                    <div key={index} className="order-item">
                                        <img src={item.image} alt={item.name} className="order-img" />
                                        <div className="order-details-box">
                                            <div className="order-title">{item.name}</div>
                                            <div className="order-details">
                                                Price: ₹{item.price} • Quantity: {item.quantity}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="order-total">
                                💰 <strong>Total Amount (incl. GST): ₹{calculateTotal(order.items)}</strong>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default MyOrders;
