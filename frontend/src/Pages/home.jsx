// src/pages/HomePage.jsx
import React, { useState, useEffect, useRef } from "react";
import { ensureAuthenticated } from "../utils/authUtils";
import { useNavigate } from "react-router-dom";
import "./home.css";
import { BiSearchAlt } from "react-icons/bi";
import { FaAnglesDown } from "react-icons/fa6";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { IoFilter } from "react-icons/io5";
import OfferBanner1 from "../assets/offerBanner1.jpg";
import OfferBanner2 from "../assets/offerBanner2.jpg";
import OfferBanner3 from "../assets/offerBanner3.jpg";
import ReelVideo from "../assets/reel1.mp4";

const HomePage = () => {
    const navigate = useNavigate();
    const productSectionRef = useRef(null);

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

    const [products, setProducts] = useState([]);
    const [showFilters, setShowFilters] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [category, setCategory] = useState("");
    const [priceMin, setPriceMin] = useState("");
    const [priceMax, setPriceMax] = useState("");
    const [currentOfferIndex, setCurrentOfferIndex] = useState(0);
    const [fade, setFade] = useState(true);

    useEffect(() => {
        const verificationStatus = localStorage.getItem("verification_status");
        const startTime = localStorage.getItem("verification_start_time");
        if (verificationStatus !== "unverified" || !startTime) return;

        const now = Date.now();
        const elapsed = now - parseInt(startTime, 10);
        const twentyFourHours = 24 * 60 * 60 * 1000;

        // If already expired, block the user
        if (elapsed >= twentyFourHours) {
            blockUser();
            return;
        }

        // ⏱ Reminder loop
        const notifyInterval = setInterval(() => {
            toast.warn("⚠️ Reminder: Please verify your email and phone number within 24 hours.");
        }, 20 * 60 * 1000); 

        // ⏲ Timeout to block after remaining time
        const blockTimeout = setTimeout(() => {
            blockUser();
        }, twentyFourHours - elapsed);

        return () => {
            clearInterval(notifyInterval);
            clearTimeout(blockTimeout);
        };
    }, []);

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

    useEffect(() => {
        fetchInitialProducts();
    }, []);

    const fetchInitialProducts = async () => {
        try {
            const res = await fetch("https://eaglehub.onrender.com/random?limit=8", {
                credentials: "include",
            });
            const data = await res.json();
            setProducts(data);
        } catch (err) {
            console.error("Error loading initial products", err);
        }
    };

    const blockUser = async () => {
    try {
        const res = await fetch("https://eaglehub.onrender.com/block_user", {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (res.ok) {
            // Cleanup
            localStorage.clear();
            document.cookie = "access_token=; Max-Age=0";
            document.cookie = "refresh_token=; Max-Age=0";

            toast.error("⛔ You’ve been blocked due to failure to verify.");
            setTimeout(() => {
                window.location.href = "/user_auth"; // redirect to login
            }, 2000);
        } else {
            toast.error("Failed to block user.");
        }
    } catch (err) {
        console.error("Block user error:", err);
    }
};

    const scrollToProducts = () => {
        const container = document.querySelector(".home-container");
        if (productSectionRef.current && container) {
            const yOffset = -70; // Adjust for navbar if needed
            const scrollY =
                productSectionRef.current.getBoundingClientRect().top -
                container.getBoundingClientRect().top +
                container.scrollTop +
                yOffset;

            container.scrollTo({ top: scrollY, behavior: "smooth" });
        }
    };

    const handleSearch = async () => {
        const isAuth = await ensureAuthenticated();
        if (!isAuth) return navigate("/user_auth");
        let query = [];
        const trimmedSearch = searchQuery.trim();
        const isSearchPresent = !!trimmedSearch;
        const isCategoryPresent = !!category.trim();
        const isPriceRangePresent = !!priceMin.trim() && !!priceMax.trim();

        if (!isSearchPresent && !isCategoryPresent && !isPriceRangePresent) {
            toast.warn("Please enter a search term or select filters.");
            return;
        }

        if (isSearchPresent) query.push(`search=${encodeURIComponent(trimmedSearch)}`);
        if (isCategoryPresent) query.push(`category=${encodeURIComponent(category.trim())}`);
        if (isPriceRangePresent) {
            query.push(`price_min=${priceMin.trim()}`);
            query.push(`price_max=${priceMax.trim()}`);
        }
        const queryString = query.join("&");
        try {
            const res = await fetch(`https://eaglehub.onrender.com/search?${queryString}`, {
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
            });
            if (!res.ok) throw new Error("No products found");

            const data = await res.json();
            if (!data || data.length === 0) {
                toast.info("No matching products found.");
            }
            setProducts(data);
            scrollToProducts();
        } catch (err) {
            console.error(err);
            toast.error("Failed to fetch products.");
            setProducts([]);
        }
    };

    const handleOfferClick = async () => {
        const isAuth = await ensureAuthenticated();
        if (!isAuth) return navigate("/user_auth");
        try {
            const res = await fetch(`https://eaglehub.onrender.com/search?category=combo`, {
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (!res.ok) throw new Error("No combo products found");

            const data = await res.json();
            if (!data || data.length === 0) {
                toast.info("No combo products found.");
            }

            setProducts(data);
            scrollToProducts();
        } catch (err) {
            console.error(err);
            toast.error("Failed to fetch combo products.");
            setProducts([]);
        }
    };

    return (
        <div className="page-wrapper">
            <div className="home-container">
                <div className="home-content">
                    <div className="search-bar-wrapper">
                        <div className="filter-container">
                            <button
                                className="filter-toggle-btn"
                                onClick={() => setShowFilters((prev) => !prev)}
                            >
                                <IoFilter className="filter-icon" />
                            </button>

                            {showFilters && (
                                <div className="filter-dropdown">
                                    <input
                                        type="text"
                                        placeholder="Category"
                                        value={category}
                                        onChange={(e) => setCategory(e.target.value)}
                                    />
                                    <input
                                        type="number"
                                        placeholder="Min Price"
                                        value={priceMin}
                                        onChange={(e) => setPriceMin(e.target.value)}
                                    />
                                    <input
                                        type="number"
                                        placeholder="Max Price"
                                        value={priceMax}
                                        onChange={(e) => setPriceMax(e.target.value)}
                                    />
                                </div>
                            )}
                        </div>
                        <div className="search-container">
                            <input
                                type="text"
                                placeholder="Search products..."
                                className="search-input"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") handleSearch();
                                }}
                            />
                            <button
                                className="search-btn"
                                onClick={() => {
                                    if (searchQuery.trim()) handleSearch(searchQuery.trim());
                                }}
                            ><BiSearchAlt />
                            </button>
                        </div>
                    </div>

                    <div className="hero-section">
                        <h1 className="hero-title">Shop Fearlessly Shop EagleHub</h1>
                        <h3 className="scroll-hint">
                            <span className="scroll-icon"><FaAnglesDown /></span>
                            Scroll to Explore Products !!
                        </h3>
                    </div>

                    <div className="reel-info-container">
                        <div className="reel-box">
                            <video autoPlay loop muted controls>
                                <source
                                    src={ReelVideo}
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

                    <div ref={productSectionRef} className="product-container">
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
                                key={prod.sku}
                                className="product-card"
                                onClick={() => navigate(`/product/${prod.sku}`, { state: { ...prod }, })}
                                style={{ cursor: "pointer" }}
                            >
                                <img src={prod.image_urls[0]} alt={prod.name} />
                                <h3>{prod.name}</h3>
                                <p>
                                    {prod.description.length > 100
                                        ? prod.description.substring(0, 100) + "..."
                                        : prod.description}
                                </p>

                                <p>₹{prod.mrp}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
        </div>
    );
};

export default HomePage;
