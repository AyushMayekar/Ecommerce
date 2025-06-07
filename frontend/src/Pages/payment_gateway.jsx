import React from 'react';
import axios from '../axiosinstance'; 

const PaymentTestPage = () => {
    const handlePayment = async () => {
        try {
            // Step 1: Create Razorpay order from backend
            const res = await axios.post('/create_order', {
                amount: 9,  // Hardcoded ₹9
            }, {
                headers: {
                    Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFkbWluX2F5dXNoXzAxIiwiZXhwIjoxNzQ5MjY3NTQyLCJ0eXBlIjoiYWNjZXNzIn0.lsde3pu16Yk99-hV-o2e0kBgvo2qW4vq_ftgTThl8dI`
                }
            });

            const { order_id, amount, currency, key } = res.data;

            // Step 2: Load Razorpay Checkout
            const options = {
                key,
                amount,
                currency,
                name: "EagleHub",
                description: "Test Transaction",
                order_id: order_id,
                handler: async function (response) {
                    try {
                        // Step 3: Send verification data to backend
                        const verifyRes = await axios.post('http://127.0.0.1:8000/verify_payment', {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature
                        }, {
                            headers: {
                                Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFkbWluX2F5dXNoXzAxIiwiZXhwIjoxNzQ5MjY3NTQyLCJ0eXBlIjoiYWNjZXNzIn0.lsde3pu16Yk99-hV-o2e0kBgvo2qW4vq_ftgTThl8dI`
                            }
                        });

                        alert("✅ Payment Verified and Order Marked as PAID");
                    } catch (verifyErr) {
                        alert("❌ Payment Verification Failed. Order marked as FAILED.");
                    }
                },
                prefill: {
                    name: "John Doe",
                    email: "john@example.com",
                    contact: "9999999999"
                },
                theme: {
                    color: "#3399cc"
                }
            };

            const rzp = new window.Razorpay(options);
            rzp.open();
        } catch (err) {
            console.error("Payment initiation failed:", err);
            alert("Something went wrong. Try again.");
        }
    };

    return (
        <div className="p-5">
            <h1>Razorpay Payment Test</h1>
            <button
                onClick={handlePayment}
                className="bg-blue-600 text-white px-4 py-2 rounded"
            >
                Pay ₹9
            </button>
        </div>
    );
};

export default PaymentTestPage;
