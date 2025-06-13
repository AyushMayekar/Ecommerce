// src/pages/OrderSuccess.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import "./payment_success.css";
import { IoMdCheckmarkCircleOutline } from "react-icons/io";


const OrderSuccess = () => {
    const navigate = useNavigate();

    return (
        <>
            <div className="success-page-wrapper">
                <div className="success-box">
                    <div className="success-icon">
                        <IoMdCheckmarkCircleOutline className="checkmark-icon" />
                    </div>
                    {/* ✅ Success message */}
                    <h1 className="success-title">🎉 Order Placed Successfully!</h1>
                    <p className="success-message">
                        Thank you for shopping with us! Your order is now confirmed and is being prepared.
                        Expect delivery within <strong>5 - 10 business days</strong>.
                    </p>

                    {/* ✅ Buttons */}
                    <div className="success-buttons">
                        <button onClick={() => navigate("/home")} className="success-btn">
                            🏠 Go to Home
                        </button>
                        <button
                            onClick={() => navigate("/my_orders")}
                            className="success-btn-outline"
                        >
                            📦 View My Orders
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default OrderSuccess;