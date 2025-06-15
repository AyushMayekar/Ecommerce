// src/pages/ContactUs.jsx
import React from "react";
import "./contact.css";
import { Link } from "react-router-dom";

const ContactUs = () => {
    return (
        <div className="contact-page">
            <div className="contact-banner">
                <div className="banner-overlay">
                    <h1 className="contact-title">Contact Us</h1>

                    <div className="query-box">
                        About Your Queries – <span>Connect With Us Directly!!</span>
                    </div>

                    <p className="intro-text">
                        We’re here to help! Reach out to us anytime. Whether it's a query,
                        feedback, or just a hello — we'd love to connect.
                    </p>

                    <div className="contact-info-box">
                        <div className="contact-item">
                            <h3>📧 Email</h3>
                            <p>eaglehub879@gmail.com</p>
                        </div>

                        <div className="contact-item">
                            <h3>📞 Phone</h3>
                            <p>7775878789</p>
                        </div>

                        <div className="contact-item">
                            <h3>📍 Address</h3>
                            <p>Vasai-West, Palghar, Maharashtra.</p>
                        </div>

                        <div className="contact-item">
                            <h3>🌐 Social Media</h3>
                            <div className="social-links-text">
                                <p>
                                    Instagram:{" "}
                                    <Link to ="https://www.instagram.com/eaglehub879?igsh=MTVyY3Nwc2NsdDRnYQ=="
                                        target="_blank"
                                        rel="noreferrer"
                                    >
                                        eaglehub879
                                    </Link>
                                </p>
                                <p>
                                    Facebook:{" "}
                                    <Link to="https://facebook.com" target="_blank" rel="noreferrer">
                                        Visit Facebook
                                    </Link>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContactUs;
