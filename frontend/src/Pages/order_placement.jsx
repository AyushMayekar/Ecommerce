// src/pages/BuyNow.jsx
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import "./order_placement.css";
import { ensureAuthenticated } from "../utils/authUtils";

const BuyNow = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const orderItems = location.state?.items || [];
    const [products, setProducts] = useState([]);
    const [subtotal, setSubtotal] = useState(0);
    const [totalQty, setTotalQty] = useState(0);
    const [shipping, setShipping] = useState({
        fullName: "",
        phone: "",
        email: "",
        address: "",
        city: "",
        state: "",
        zip: "",
        country: "",
    });
    const [paymentMethod, setPaymentMethod] = useState("Online Payment Options");

    useEffect(() => {
        const checkAuthAndLoadData = async () => {
            const isAuth = await ensureAuthenticated();
            if (!isAuth) {
                navigate("/user_auth");
                return;
            }

            // Auth is valid, now load data
            const data = orderItems.length > 0 ? orderItems : [location.state];
            setProducts(data);
        };

        checkAuthAndLoadData();
    }, [location.state, orderItems]);

    useEffect(() => {
        if (products.length > 0) {
            const sub = products.reduce((acc, item) => acc + item.price * item.quantity, 0);
            const qty = products.reduce((acc, item) => acc + item.quantity, 0);
            setSubtotal(sub);
            setTotalQty(qty);
        }
    }, [products]);

    const handleShippingChange = (e) => {
        const { name, value } = e.target;
        setShipping((prev) => ({ ...prev, [name]: value }));
    };

    const isShippingComplete = Object.values(shipping).every((v) => v.trim() !== "");

    const handlePlaceOrder = async () => {
        if (!isShippingComplete) {
            return Swal.fire("Incomplete Details", "Please fill all shipping fields.", "warning");
        }
        const orderPayload = {
            order_items: products.map(item => ({
                sku: item.sku,
                name: item.name,
                price: item.price,
                quantity: item.quantity,
                size: item.size || null,
                colors: item.colors || null,
                total: item.price * item.quantity,
            })),
            shipping_info: shipping,
            payment_method: paymentMethod,
            subtotal: subtotal,
            total_quantity: totalQty
        };

        // if (paymentMethod === "Cash On Delivery") {
        //     try {
        //         const res = await axios.post("https://eaglehub.onrender.com/create_order", orderPayload, { withCredentials: true });
        //         if (res.status === 200) {
        //             Swal.fire("Order Placed", "Cash on Delivery confirmed!", "success");
        //             navigate("/payment_success");
        //         }
        //     } catch (err) {
        //         Swal.fire("Error", "Failed to place COD order.", "error");
        //     }
        // } else {
            try {
                const res = await axios.post("https://eaglehub.onrender.com/create_order", orderPayload, { withCredentials: true });
                const { order_id, amount, key } = res.data;
                const options = {
                    key,
                    amount,
                    currency: "INR",
                    name: "Eagle Hub",
                    description: "Product Purchase",
                    order_id,
                    handler: async function (response) {
                        try {
                            await axios.post("https://eaglehub.onrender.com/verify_payment", {
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature,
                            }, { withCredentials: true });
                            Swal.fire("Payment Success", "Your payment was verified.", "success");
                            navigate("/payment_success");
                        } catch (err) {
                            Swal.fire("Verification Failed", "Payment verification failed.", "error");
                        }
                    },
                    prefill: {
                        name: shipping.fullName,
                        email: shipping.email,
                        contact: shipping.phone,
                    },
                    theme: {
                        color: "#0040ff"
                    }
                };
                const rzp = new window.Razorpay(options);
                rzp.open();
            } catch (err) {
                Swal.fire("Error", "Failed to initiate payment.", "error");
            // }
        }
    };


    return (
        <div className="buy_now-page-wrapper">
            <div className="buy-now-page">
                <h2>Secure Checkout</h2>
                <div className="checkout-container">
                    <div className="left-section">
                        <div className="product-summary">
                            <h3>🛍 Product Summary</h3>
                            {products.map((item, index) => (
                                <div className="product-item" key={index}>
                                    <img src={item.image_urls[0]} alt={item.name} />
                                    <p><strong>{item.name}</strong></p>
                                    <p>Price: ₹{item.price}</p>
                                    <p>Quantity: {item.quantity}</p>
                                    {item.colors && <p>Color: {item.colors}</p>}
                                    {item.size && <p>Size: {item.size}</p>}
                                    <p>Total: ₹{item.price * item.quantity}</p>
                                    <hr />
                                </div>
                            ))}
                        </div>

                        <div className="shipping-details">
                            <h3>🚚 Shipping Details</h3>
                            {Object.keys(shipping).map((field, idx) => (
                                <input
                                    key={idx}
                                    type="text"
                                    name={field}
                                    placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                                    value={shipping[field]}
                                    onChange={handleShippingChange}
                                    required
                                />
                            ))}
                        </div>

                        <div className="payment-method">
                            <h3>💳 Payment Method</h3>
                            {["Online Payment Options"].map((method) => (
                                <label key={method}>
                                    <input
                                        type="radio"
                                        name="payment"
                                        value={method}
                                        checked={paymentMethod === method}
                                        onChange={() => setPaymentMethod(method)}
                                    />
                                    {method}
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="right-section">
                        <div className="order-summary">
                            <h3>🧾 Order Summary</h3>
                            <p>Total Quantity: {totalQty}</p>
                            <p>Shipping: <span className="free-text">Free</span></p>
                            {/* <p>Discount: ₹{discount}</p> */}
                            <hr />
                            <h4>Sub-Total: ₹{subtotal}</h4>
                            {/* <input
                                type="text"
                                placeholder="Enter Promo Code"
                                value={promoCode}
                                onChange={(e) => setPromoCode(e.target.value)}
                            />
                            <button onClick={() => setDiscount(200)} className="apply-code-btn">
                                Apply Code
                            </button> */}
                            <button className="place-order-btn" onClick={handlePlaceOrder}>
                                Place Order 🔒
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BuyNow;
