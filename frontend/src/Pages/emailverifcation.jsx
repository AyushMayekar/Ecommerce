// src/pages/EmailVerificationPage.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { IoMdCheckmarkCircleOutline } from "react-icons/io";
import { IoMdCloseCircleOutline } from "react-icons/io";
import "./emailVerification.css";

const EmailVerificationPage = () => {
    const [status, setStatus] = useState("Verifying...");
    const [isSuccess, setIsSuccess] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const token = params.get("token");

        if (!token) {
            setStatus("Invalid verification link.");
            setIsSuccess(false);
            return;
        }

        const verifyEmail = async () => {
            try {
                const res = await fetch("https://eaglehub.onrender.com/confirm_email_verification", {
                    method: "POST",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ token }),
                });

                const data = await res.json();

                if (res.ok) {
                    setStatus("🎉 Email successfully verified!");
                    setIsSuccess(true);
                    setTimeout(() => navigate("/profile"), 3000);
                } else {
                    setStatus(data.error || "Verification failed.");
                    setIsSuccess(false);
                    setTimeout(() => navigate("/profile"), 3000);
                }
            } catch (err) {
                console.error(err);
                setStatus("Something went wrong. Please try again.");
                setIsSuccess(false);
                setTimeout(() => navigate("/profile"), 3000);
            }
        };

        verifyEmail();
    }, [location, navigate]);

    return (
        <div className="email-page-wrapper">
            <div className={`verify-container 
                ${isSuccess === true ? "success" : ""} 
                ${isSuccess === false ? "error" : ""}`}>
                <div className="verify-card">
                    <h2>Email Verification</h2>

                    {isSuccess !== null && (
                        isSuccess ? (
                            <IoMdCheckmarkCircleOutline className="verify-icon success-icon" />
                        ) : (
                            <IoMdCloseCircleOutline className="verify-icon error-icon" />
                        )
                    )}

                    <p>{status}</p>
                    {isSuccess && <p className="redirect-msg">Redirecting to profile...</p>}
                </div>
            </div>
        </div>
    );

};

export default EmailVerificationPage;
