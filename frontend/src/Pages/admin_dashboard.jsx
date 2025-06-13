// src/admin/AdminDashboard.jsx
import React, { useState } from "react";
import { IoFilter } from "react-icons/io5";
import "./admin_dashboard.css";

const AdminDashboard = () => {
    const [products, setProducts] = useState([]);
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        category: "",
        quantity: "",
        threshold: "",
        color: "",
        mrp: "",
        wholesalePrice: "",
        gst: "",
        media: null,
        mediaURL: "",
    });
    const [editingId, setEditingId] = useState(null);
    const [showProductList, setShowProductList] = useState(false);

    const [coupons, setCoupons] = useState([]);
    const [couponCode, setCouponCode] = useState("");
    const [couponDiscount, setCouponDiscount] = useState("");

    const [showFilters, setShowFilters] = useState(false);
    const [category, setCategory] = useState("");
    const [priceMin, setPriceMin] = useState("");
    const [priceMax, setPriceMax] = useState("");
    const [searchQuery, setSearchQuery] = useState("");

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        if (name === "media") {
            const file = files[0];
            const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "video/mp4"];
            if (file && allowedTypes.includes(file.type)) {
                setFormData({
                    ...formData,
                    media: file,
                    mediaURL: URL.createObjectURL(file),
                });
            } else {
                alert("Only JPG, JPEG, PNG, and MP4 files are allowed.");
            }
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleAddOrUpdateProduct = (e) => {
        e.preventDefault();
        if (!formData.name || (!formData.media && !formData.mediaURL) || !formData.description || !formData.category || !formData.quantity || !formData.color || !formData.mrp) {
            alert("Please fill all required (*) fields.");
            return;
        }

        const newProduct = {
            ...formData,
            id: editingId ? editingId : Date.now(),
            mediaURL:
                formData.media instanceof File
                    ? URL.createObjectURL(formData.media)
                    : formData.mediaURL,
        };

        if (editingId) {
            const updated = products.map((prod) =>
                prod.id === editingId ? newProduct : prod
            );
            setProducts(updated);
            setEditingId(null);
        } else {
            setProducts([...products, newProduct]);
        }

        setFormData({
            name: "",
            description: "",
            category: "",
            quantity: "",
            threshold: "",
            color: "",
            mrp: "",
            wholesalePrice: "",
            gst: "",
            media: null,
            mediaURL: "",
        });
    };

    const handleEdit = (product) => {
        setEditingId(product.id);
        setFormData({
            ...product,
            media: null,
        });
    };

    const handleDelete = (id) => {
        const filtered = products.filter((p) => p.id !== id);
        setProducts(filtered);
        if (editingId === id) {
            handleCancelEdit();
        }
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setFormData({
            name: "",
            description: "",
            category: "",
            quantity: "",
            threshold: "",
            color: "",
            mrp: "",
            wholesalePrice: "",
            gst: "",
            media: null,
            mediaURL: "",
        });
    };

    const handleAddCoupon = (e) => {
        e.preventDefault();
        if (!couponCode || !couponDiscount) {
            alert("Please enter both coupon code and discount percentage.");
            return;
        }

        const newCoupon = {
            id: Date.now(),
            code: couponCode.toUpperCase(),
            discount: parseFloat(couponDiscount),
        };

        setCoupons([...coupons, newCoupon]);
        setCouponCode("");
        setCouponDiscount("");
    };

    const handleDeleteCoupon = (id) => {
        setCoupons(coupons.filter((c) => c.id !== id));
    };

    const filteredProducts = products.filter((product) => {
        const matchesCategory =
            category.trim() === "" || product.category.toLowerCase().includes(category.toLowerCase());
        const matchesMinPrice = priceMin === "" || parseFloat(product.mrp) >= parseFloat(priceMin);
        const matchesMaxPrice = priceMax === "" || parseFloat(product.mrp) <= parseFloat(priceMax);
        const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesMinPrice && matchesMaxPrice && matchesSearch;
    });

    return (
    <div className="admin-page-wrapper">
        <div className="admin-dashboard">
            <h1>Admin Dashboard</h1>

            {/* Product Form */}
            <form className="product-form" onSubmit={handleAddOrUpdateProduct}>
                <div className="form-grid">
                    <input type="text" name="name" placeholder="Product Name *" value={formData.name} onChange={handleChange} required />
                    <textarea name="description" placeholder="Description *" value={formData.description} onChange={handleChange} required />
                    <input type="text" name="category" placeholder="Category *" value={formData.category} onChange={handleChange} required />
                    <input type="number" name="quantity" placeholder="Quantity *" value={formData.quantity} onChange={handleChange} required />
                    <input type="number" name="threshold" placeholder="Quantity Threshold (Optional)" value={formData.threshold} onChange={handleChange} />
                    <input type="text" name="color" placeholder="Color *" value={formData.color} onChange={handleChange} required />
                    <input type="number" name="mrp" placeholder="MRP *" value={formData.mrp} onChange={handleChange} required />
                    <input type="number" name="wholesalePrice" placeholder="Wholesale Price (Optional)" value={formData.wholesalePrice} onChange={handleChange} />
                    <input type="number" name="gst" placeholder="GST % (Optional)" value={formData.gst} onChange={handleChange} />
                    <input type="file" name="media" accept="image/jpeg,image/png,image/jpg,video/mp4" onChange={handleChange} />
                </div>
                <div className="btn-group">
                    <button type="submit" className="btn-submit">
                        {editingId ? "Update Product" : "Add Product"}
                    </button>
                    {editingId && (
                        <button type="button" className="btn-cancel" onClick={handleCancelEdit}>
                            Cancel Edit
                        </button>
                    )}
                </div>
            </form>

            {/* Coupon Section */}
            <div className="coupon-section">
                <h2>Manage Coupon Codes</h2>
                <form className="coupon-form" onSubmit={handleAddCoupon}>
                    <input type="text" placeholder="Coupon Code" value={couponCode} onChange={(e) => setCouponCode(e.target.value)} required />
                    <input type="number" placeholder="Discount %" value={couponDiscount} onChange={(e) => setCouponDiscount(e.target.value)} required />
                    <button type="submit" className="btn-submit">Add Coupon</button>
                </form>

                <ul className="coupon-list">
                    {coupons.map((coupon) => (
                        <li key={coupon.id}>
                            <span className="code">{coupon.code}</span>
                            <span className="discount">- {coupon.discount}%</span>
                            <button className="btn-delete" onClick={() => handleDeleteCoupon(coupon.id)}>Remove</button>
                        </li>
                    ))}
                    {coupons.length === 0 && <p className="no-products">No coupons added yet.</p>}
                </ul>
            </div>

            {/* View All Products Toggle */}
            <div className="view-all-btn-container">
                <button className="btn-view-all" onClick={() => setShowProductList(!showProductList)}>
                    {showProductList ? "Hide Products" : "View All Added Products"}
                </button>
            </div>

            {/* Product List */}
            {showProductList && (
                <>
                    <h2>Product Inventory</h2>

                    {/* Classy Search + Filter Section (ONLY INSIDE VIEW ALL) */}
                    <div className="filter-container fancy-filters">
                        <input
                            type="text"
                            placeholder="Search product name..."
                            className="search-bar fancy-input"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <button
                            className="filter-toggle-btn"
                            onClick={() => setShowFilters((prev) => !prev)}
                        >
                            <IoFilter className="filter-icon" />
                        </button>
                        {showFilters && (
                            <div className="filter-dropdown fancy-dropdown">
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

                    <div className="product-list">
                        {filteredProducts.map((product) => (
                            <div
                                key={product.id}
                                className={`product-card ${parseInt(product.quantity) < parseInt(product.threshold || 0)
                                        ? "low-stock"
                                        : ""
                                    }`}
                            >
                                {product.mediaURL && product.mediaURL.includes("video") ? (
                                    <video src={product.mediaURL} controls width="100%" />
                                ) : (
                                    <img src={product.mediaURL} alt={product.name} />
                                )}
                                <div className="product-info">
                                    <h3>{product.name}</h3>
                                    <p>{product.description}</p>
                                    <p><strong>Category:</strong> {product.category}</p>
                                    <p><strong>Quantity:</strong> {product.quantity}</p>
                                    {product.threshold && <p><strong>Threshold:</strong> {product.threshold}</p>}
                                    <p><strong>Color:</strong> {product.color}</p>
                                    <p><strong>MRP:</strong> ₹{product.mrp}</p>
                                    {product.wholesalePrice && <p><strong>Wholesale:</strong> ₹{product.wholesalePrice}</p>}
                                    {product.gst && <p><strong>GST:</strong> {product.gst}%</p>}
                                    <div className="card-btn-group">
                                        <button className="btn-edit" onClick={() => handleEdit(product)}>Edit</button>
                                        <button className="btn-delete" onClick={() => handleDelete(product.id)}>Delete</button>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {filteredProducts.length === 0 && (
                            <p className="no-products">No matching products found.</p>
                        )}
                    </div>
                </>
            )}
        </div>
    </div>
    );
};

export default AdminDashboard;
