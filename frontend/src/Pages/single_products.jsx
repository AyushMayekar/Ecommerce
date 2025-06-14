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
    const parsedGst = parseFloat(product.gst) || 0;
    const baseUnitPrice = hasWholesale && quantity >= product.quantity_threshold
        ? product.wholesale_price
        : product.mrp;
    const unitPrice = baseUnitPrice * (1 + parsedGst / 100);
    const totalPrice = unitPrice * quantity;
    const inStock = product.quantity > 0; const [selectedColor, setSelectedColor] = useState(
        Array.isArray(product?.colors) && product.colors.length > 0 ? "" : null
    );


    useEffect(() => {
        const fetchRecommended = async () => {
            try {
                const res = await fetch(`https://eaglehub.onrender.com/search?category=${product.category}`, {credentials: "include",});
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
            const response = await fetch("https://eaglehub.onrender.com/add_to_cart", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({
                    sku: product.sku,
                    quantity,
                    totalPrice,
                    unitPrice,
                    size: selectedSize,
                    colors: selectedColor
                }), 
                credentials: "include",});

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
        // const isAuth = await ensureAuthenticated();
        // if (!isAuth) return navigate("/user_auth");
        navigate("/buy_now", {
            state: {
                items: [
                    {
                        ...product,
                        quantity: quantity,
                        price: unitPrice,
                        size: selectedSize,
                        colors: selectedColor
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
                        <p><strong>Colors:</strong> {Array.isArray(product.colors) ? product.colors.join(", ") : "No colors available"}</p>
                        <p><strong>Sizes:</strong> {Array.isArray(product.size) ? product.size.join(", ") : "No colors available"}</p>
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
                        {Array.isArray(product?.size) && product.size.length > 0 && (
                            <div className="size-section">
                                <label>Select Size: </label>
                                <select
                                    value={selectedSize || ""}
                                    onChange={(e) => setSelectedSize(e.target.value)}
                                >
                                    <option value="">Select size</option>
                                    {product.size.map((size, index) => (
                                        <option key={index} value={size}>
                                            {size}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {Array.isArray(product?.colors) && product.colors.length > 0 && (
                            <div className="color-section">
                                <label>Select Color: </label>
                                <select
                                    value={selectedColor || ""}
                                    onChange={(e) => setSelectedColor(e.target.value)}
                                >
                                    <option value="">Select color</option>
                                    {product.colors.map((color, index) => (
                                        <option key={index} value={color}>
                                            {color}
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
