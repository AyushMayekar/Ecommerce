import React, { useState, useEffect } from "react";
import Header from "../Components/landing_navbar";
import "./landing.css";
import { useNavigate } from "react-router-dom";
import ReelVideo from "../assets/reel1.mp4";
import OfferBanner1 from "../assets/offerBanner1.jpg";
import OfferBanner2 from "../assets/offerBanner2.jpg";
import OfferBanner3 from "../assets/offerBanner3.jpg";

const LandingPage = () => {
    const navigate = useNavigate();

    const offers = [
        {
            image: OfferBanner1,
            title: "🎉 Enjoy 50% OFF on Your First Purchase!",
            text: "Sign up now and unlock massive savings on top-rated products.",
            link: "/exclusive-offers",
        },
        {
            image: OfferBanner2,
            title: "🛍️ Combo Deals on Monsoon Essentials!",
            text: "Hurry! Limited-time deals to keep you cozy and dry.",
            link: "/monsoon-deals",
        },
        {
            image: OfferBanner3,
            title: "⚡ Flash Sale: Electronics at 70% OFF!",
            text: "Get tech smart with unbeatable prices. Act fast!",
            link: "/flash-sale",
        },
    ];

    const [currentOfferIndex, setCurrentOfferIndex] = useState(0);
    const [fade, setFade] = useState(true);

    useEffect(() => {
        const interval = setInterval(() => {
            setFade(false);
            setTimeout(() => {
                setCurrentOfferIndex((i) => (i + 1) % offers.length);
                setFade(true);
            }, 1000);
        }, 6000);
        return () => clearInterval(interval);
    }, [offers.length]);


    const handleGetStarted = async () => {
        try {
            // Step 1: Check if access token is valid
            const res = await fetch("https://eaglehub.onrender.com/check_auth", {
                method: "GET",
                credentials: "include", // sends cookies
            });

            if (res.status === 200) {
                // Access token valid
                navigate("/home");
            } else if (res.status === 401) {
                // Step 2: Try refreshing the access token
                const refreshRes = await fetch("https://eaglehub.onrender.com/refresh", {
                    method: "POST",
                    credentials: "include",
                });

                if (refreshRes.status === 200) {
                    // Token refreshed, go to home
                    navigate("/home");
                } else {
                    // Step 3: Both tokens invalid
                    navigate("/user_auth");
                }
            } else {
                navigate("/user_auth");
            }
        } catch (err) {
            console.error("Authentication check failed:", err);
            navigate("/user_auth");
        }
    };

    return (
        <div className="page-wrapper">
            <Header />
            <div className="landing-container">
                <div className="landing-content">
                    <div className="hero-section">
                        <h1 className="hero-title">Welcome to Eagle Hub</h1>
                        <button className="get-started-btn" onClick={handleGetStarted}>
                            Get Started
                        </button>
                    </div>

                    <div className="reel-info-container">
                        <div className="reel-box">
                            {/* ✅ Using local video file */}
                            <video autoPlay loop muted controls>
                                <source src={ReelVideo} type="video/mp4" />
                                Your browser does not support the video tag.
                            </video>
                        </div>

                        <div className="info-box">
                            <h2>Shop Smart, Live Better</h2>
                            <p>
                                Discover the future of e-commerce with unbeatable deals and seamless shopping.
                            </p>
                        </div>
                    </div>

                    <div
                        className={`landing-offer-bar ${fade ? "landing-fade-in" : "landing-fade-out"}`}
                        style={{
                            backgroundImage: `url(${offers[currentOfferIndex].image})`,
                        }}
                    >
                        <h2>{offers[currentOfferIndex].title}</h2>
                        <p>{offers[currentOfferIndex].text}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LandingPage;
