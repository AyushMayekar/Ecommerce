// src/pages/ProductPage.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import "./single_products.css";
import { IoChevronBackOutline, IoChevronForwardOutline } from "react-icons/io5";
import { toast, ToastContainer } from "react-toastify";
import { ensureAuthenticated } from "../utils/authUtils";
import "react-toastify/dist/ReactToastify.css";

const ProductPage = () => {
    const { state } = useLocation();
    const navigate = useNavigate();
    const product = state
    const [currentSlide, setCurrentSlide] = useState(0);
    const hasWholesale = product.quantity_threshold && product.wholesale_price;
    const [quantity, setQuantity] = useState(1);
    const [recommended, setRecommended] = useState([]);
    const [selectedSize, setSelectedSize] = useState(Array.isArray(product?.sizes) && product.sizes.length > 0 ? "" : null);
    const media = [...(product.image_urls || []), ...(product.video_urls || [])];
    const unitPrice = hasWholesale && quantity >= product.quantity_threshold
        ? product.wholesale_price
        : product.mrp;
    const totalPrice = unitPrice * quantity;
    const inStock = product.quantity > 0;

    useEffect(() => {
        const fetchRecommended = async () => {
            try {
                const res = await fetch(`http://127.0.0.1:8000/search?category=${product.category}`);
                const data = await res.json();
                setRecommended(data.filter(p => p.sku !== product.sku));
            } catch (err) {
                console.error("Failed to fetch recommended products", err);
            }
        };
        fetchRecommended();
    }, [product.category, product.sku]);

    const handlePrev = () => {
        setCurrentSlide((prev) => (prev - 1 + media.length) % media.length);
    };

    const handleNext = () => {
        setCurrentSlide((prev) => (prev + 1) % media.length);
    };

    const handleAddToCart = async () => {
        // const isAuth = await ensureAuthenticated();
        // if (!isAuth) return navigate("/user_auth");
        try {
            const response = await fetch("http://localhost:8000/add_to_cart", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({
                    sku: product.sku,
                    quantity,
                    totalPrice,
                    size: selectedSize
                })
            });

            const data = await response.json();

            if (response.ok) {
                toast.success(data.message || "Product added to cart");
            } else {
                toast.error(data.error || "Failed to add to cart");
            }
        } catch (err) {
            console.error("Add to cart error:", err);
            toast.error("An unexpected error occurred.");

        }
    };

    const handleBuyNow = async () => {
    const isAuth = await ensureAuthenticated();
    if (!isAuth) return navigate("/user_auth");
    navigate("/buy_now", {
        state: {
            items: [
                {
                    ...product,
                    quantity: quantity,
                    price: unitPrice,
                    size: selectedSize
                }
            ]
        }
    });
};


    return (
        <div className="sp-page-wrapper">
            <div className="product-page">
                <div className="product-content">
                    <div className="product-left">
                        <div className="media-slider">
                            <button
                                onClick={handlePrev}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    padding: 0,
                                    margin: 10,
                                    cursor: 'pointer',
                                }}
                            >
                                <IoChevronBackOutline size={32} />
                            </button>
                            <div className="media-content">
                                {media[currentSlide].endsWith(".mp4") ? (
                                    <video
                                        controls
                                        className="product-video"
                                        src={media[currentSlide]}
                                    />
                                ) : (
                                    <img
                                        src={media[currentSlide]}
                                        alt="Product Media"
                                        className="product-image"
                                    />
                                )}
                            </div>
                            <button
                                onClick={handleNext}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    padding: 0,
                                    margin: 10,
                                    cursor: 'pointer'
                                }}
                            >
                                <IoChevronForwardOutline size={32} />
                            </button>
                        </div>

                        <p>
                            <strong>Total:</strong> ₹{totalPrice}
                            {" "}
                            <span style={{ color: inStock ? "green" : "red" }}>
                                ({inStock ? "In Stock" : "Out of Stock"})
                            </span>
                        </p>

                        <div className="action-buttons">
                            <button className="buy-button" onClick={handleBuyNow}>Buy Now</button>
                            <button className="add-to-cart-button" onClick={handleAddToCart}>Add to Cart</button>
                            <ToastContainer />
                        </div>
                    </div>

                    <div className="product-right">
                        <h1>{product.name}</h1>
                        <p><strong>SKU:</strong> {product.sku}</p>
                        <p><strong>Colors:</strong> {product.colors}</p>
                        <p className="highlight-text">{product.description}</p>
                        <p><strong>Price per unit:</strong> ₹{unitPrice}</p>

                        <div className="quantity-section">
                            <label>Quantity: </label>
                            <input
                                type="number"
                                min="1"
                                max={product.quantity}
                                value={quantity}
                                onChange={(e) => setQuantity(Number(e.target.value))}
                            />
                        </div>
                        {Array.isArray(product?.sizes) && product.sizes.length > 0 && (
                            <div className="size-section">
                                <label>Select Size: </label>
                                <select
                                    value={selectedSize}
                                    onChange={(e) => setSelectedSize(e.target.value)}
                                >
                                    <option value="">Select size</option>
                                    {product.sizes.map((size, index) => (
                                        <option key={index} value={size}>
                                            {size}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                    </div>
                </div>

                <div className="recommended-section">
                    <h2>Recommended Products</h2>
                    <div className="recommended-list">
                        {recommended.map(item => (
                            <div
                                key={item.sku}
                                className="recommended-card"
                                onClick={() => navigate(`/product/${item.sku}`, { state: item })}
                            >
                                <img src={item.image_urls[0]} alt={item.name} />
                                <h4>{item.name}</h4>
                                <p>₹{item.price}</p>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="review-slider">
                    <h2>What Customers Say</h2>
                    <div className="review-track">
                        <div className="review-box">
                            "Loved the quality! Will buy again." – Aditi
                        </div>
                        <div className="review-box">
                            "Fast delivery and great support." – Raj
                        </div>
                        <div className="review-box">
                            "Product matches the description perfectly." – Neha
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductPage;
