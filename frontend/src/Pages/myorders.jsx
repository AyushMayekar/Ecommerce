// src/pages/MyOrders.jsx
import React, { useEffect, useState } from "react";
import "./myorders.css";
import axios from "axios";
import { ensureAuthenticated } from "../utils/authUtils";
import { useNavigate } from "react-router-dom";

const MyOrders = () => {
    const [orders, setOrders] = useState([]);
    const [expandedOrderId, setExpandedOrderId] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const checkAuth = async () => {
            const isAuth = await ensureAuthenticated();
            if (isAuth) {
                await fetchOrders();
            } else {
                navigate("/user_auth");
            }
        };
        checkAuth();
    }, []);

    const fetchOrders = async () => {
        try {
            const res = await axios.get("https://eaglehub.onrender.com/user_orders", { withCredentials: true });
            if (res.status === 200) {
                const sortedOrders = res.data.orders.sort(
                    (a, b) => new Date(b.created_at) - new Date(a.created_at)
                );
                setOrders(sortedOrders);
            } else {
                console.error("Unexpected response:", res);
            }
        } catch (err) {
            console.error("Error fetching orders:", err);
        }
    };

    const cancelOrder = async (razorpay_order_id) => {
        try {
            const res = await axios.post("https://eaglehub.onrender.com/cancel_order", { razorpay_order_id }, { withCredentials: true });
            alert(res.data.message);
            fetchOrders();
        } catch (err) {
            alert(err.response?.data?.error || "Cancellation failed");
        }
    };

    const toggleExpand = (id) => {
        setExpandedOrderId(prev => (prev === id ? null : id));
    };

    return (
        <div className="myorders-page-wrapper">
            <div className="my-orders-page">
                <h1 className="my-orders-title"> My Orders</h1>
                {orders.length === 0 ? (
                    <p className="no-orders">No orders placed yet.</p>
                ) : (
                    orders.map((order, idx) => (
                        <div key={idx} className="order-block" onClick={() => toggleExpand(order?.razorpay_order_id)}>
                            <div className="order-header">
                                <h3 className="order-date">
                                    📅 Order Date:  {order?.created_at ? new Date(order.created_at).toLocaleDateString() : "Unknown"}
                                </h3>
                                {order?.delivery_status !== "Cancelled" && (
                                    <button className="delete-btn" onClick={(e) => {
                                        e.stopPropagation();
                                        cancelOrder(order?.razorpay_order_id);
                                    }}>
                                        ❌ Cancel Order
                                    </button>
                                )}
                            </div>
                            <div className="order-total">
                                🛒 Items: {order?.total_quantity ?? 0} | 💰 ₹{order?.subtotal ?? 0} | 💳 {order?.payment_status ?? 'Unknown'} | 🚚 {order?.delivery_status ?? 'Unknown'}
                            </div>
                            {expandedOrderId === order?.razorpay_order_id && (
                                <div className="my-orders-container">
                                    {(order?.order_items ?? []).map((item, i) => (
                                        <div key={i} className="order-item">
                                            <img src={item?.image || "https://www.shutterstock.com/image-vector/comic-style-blast-free-space-600nw-155226410.jpg"} alt={item?.name ?? "No Name"} className="order-img" />
                                            <div className="order-details-box">
                                                <div className="order-title">{item?.name ?? "Unnamed item"}</div>
                                                <div className="order-details">
                                                    Price: ₹{item?.price ?? 0} • Qty: {item?.quantity ?? 0} • Size: {item?.size ?? 'N/A'} • Color: {item?.colors ?? 'N/A'}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    <div className="order-details">
                                        <strong>Shipping Info:</strong><br />
                                {order?.shipping_info?.full_name ?? "N/A"}, 
                                {order?.shipping_info?.address ?? "N/A"}, 
                                {order?.shipping_info?.city ?? "N/A"}, 
                                {order?.shipping_info?.state ?? "N/A"} - 
                                {order?.shipping_info?.pincode ?? "N/A"}<br />
                                {order?.shipping_info?.country ?? "N/A"} |
                                📞 {order?.shipping_info?.phone ?? "N/A"}
                                    </div>
                                    {order?.delivery_status === "Cancelled" && (
                                        <div className="order-details">
                                            ❌ Cancelled on {order?.cancelled_at ? new Date(order.cancelled_at).toLocaleString() : "N/A"} | Refund: {order?.refund_status ?? "N/A"}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default MyOrders;
