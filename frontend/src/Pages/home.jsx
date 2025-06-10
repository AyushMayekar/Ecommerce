// src/pages/HomePage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./home.css";
import { BiSearchAlt } from "react-icons/bi";


import OfferBanner1 from "../assets/offerBanner1.jpg";
import OfferBanner2 from "../assets/offerBanner2.jpg";
import OfferBanner3 from "../assets/offerBanner3.jpg";

import SmartwatchImage from "../assets/smartwatch.jpg";
import EarbudsImage from "../assets/earbuds.jpg";
import BackpackImage from "../assets/backpack.jpg";
import LEDLampImage from "../assets/ledlamp.jpg";

const HomePage = () => {
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

    const products = [
        {
            id: "smart-watch",
            name: "Smart Watch",
            image: SmartwatchImage,
            description: "Stylish, sleek and affordable. Grab the latest smart wearable!",
        },
        {
            id: "wireless-earbuds",
            name: "Wireless Earbuds",
            image: EarbudsImage,
            description: "Enjoy crystal-clear sound and long battery life on the go.",
        },
        {
            id: "laptop-backpack",
            name: "Laptop Backpack",
            image: BackpackImage,
            description: "Spacious, durable, and water-resistant backpack for professionals.",
        },
        {
            id: "led-lamp",
            name: "LED Lamp",
            image: LEDLampImage,
            description: "Elegant desk lamp with touch control and adjustable brightness.",
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

    const handleOfferClick = () => {
        navigate(offers[currentOfferIndex].link);
    };

    const handleProductClick = (id) => {
        navigate(`/product/${id}`);
    };

    return (
        <div className="page-wrapper">
            <div className="home-container">
                <div className="home-content">
                    <div className="search-bar-wrapper">
                        <div className="search-container">
                            <input
                                type="text"
                                placeholder="Search products..."
                                className="search-input"
                            />
                            <button className="search-btn"><BiSearchAlt />
</button>
                        </div>
                    </div>

                    <div className="hero-section">
                        <h1 className="hero-title">Shop Fearlessly Shop EagleHub</h1>
                    </div>

                    <div className="reel-info-container">
                        <div className="reel-box">
                            <video autoPlay loop muted controls>
                                <source
                                    src="https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4"
                                    type="video/mp4"
                                />
                                Your browser does not support the video tag.
                            </video>
                        </div>

                        <div className="info-box">
                            <h2>Monsoon Magic: Irresistible Combo Deals Await!</h2>
                            <p>
                                Splash into savings this monsoon with our exclusive Combo Offer!
                                Grab your favorite products bundled together at unbeatable prices —
                                perfect for rainy day essentials and cozy comfort. Don't miss out,
                                soak up the deals before they wash away!
                            </p>
                        </div>
                    </div>

                    <div
                        className={`home-offer-bar ${fade ? "home-fade-in" : "home-fade-out"}`}
                        onClick={handleOfferClick}
                        style={{
                            backgroundImage: `url(${offers[currentOfferIndex].image})`,
                        }}
                    >
                        <h2>{offers[currentOfferIndex].title}</h2>
                        <p>{offers[currentOfferIndex].text}</p>
                    </div>

                    <div className="product-container">
                        <div className="product-heading">
                            <h2>🔥 Trending Now</h2>
                            <p>
                                Explore our most popular products hand-picked by our experts just
                                for you! These bestsellers are flying off the shelves—grab yours
                                today!
                            </p>
                        </div>
                        {products.map((prod) => (
                            <div
                                key={prod.id}
                                className="product-card"
                                onClick={() => handleProductClick(prod.id)}
                                style={{ cursor: "pointer" }}
                            >
                                <img src={prod.image} alt={prod.name} />
                                <h3>{prod.name}</h3>
                                <p>{prod.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HomePage;
