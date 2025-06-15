// src/admin/AdminDashboard.jsx
import React, { useState, useEffect } from "react";
import { IoFilter } from "react-icons/io5";
import { toast } from "react-toastify";
import "./admin_dashboard.css";
import { BiSearchAlt } from "react-icons/bi";
import { ensureAuthenticated } from "../utils/authUtils";
import { useNavigate } from "react-router-dom";

const AdminDashboard = () => {
    const [products, setProducts] = useState([]);
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        category: "",
        quantity: "",
        quantity_threshold: "",
        colors: [],
        size: [],
        mrp: "",
        wholesale_price: "",
        gst: "",
        media: [],
        mediaURL: "",
        add_quantity: "",
    });
    const [editingId, setEditingId] = useState(null);
    const [mediaPreview, setMediaPreview] = useState([]);
    const [showProductList, setShowProductList] = useState(false);

    const [coupons, setCoupons] = useState([]);
    const [couponCode, setCouponCode] = useState("");
    const navigate = useNavigate();
    const [couponDiscount, setCouponDiscount] = useState("");

    const [showFilters, setShowFilters] = useState(false);
    const [category, setCategory] = useState("");
    const [priceMin, setPriceMin] = useState("");
    const [priceMax, setPriceMax] = useState("");
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        const checkAuth = async () => {
            const isAuth = await ensureAuthenticated();
            if (!isAuth) {
                navigate("/user_auth");
            }
        };
        checkAuth();
    }, []);

    const handleChange = (e) => {
        const { name, value, files } = e.target;

        if (name === "media") {
            const fileArray = Array.from(files);
            const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "video/mp4"];

            const filtered = fileArray.filter(file => allowedTypes.includes(file.type));
            if (filtered.length !== fileArray.length) {
                alert("Only JPG, JPEG, PNG, and MP4 files are allowed.");
                return;
            }

            const imageFiles = filtered.filter(file => file.type.startsWith("image/"));
            const videoFiles = filtered.filter(file => file.type.startsWith("video/"));

            setFormData(prev => ({
                ...prev,
                images: imageFiles,
                videos: videoFiles,
            }));

            setMediaPreview(filtered.map(file => URL.createObjectURL(file)));
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    useEffect(() => {
        if (showProductList) fetchProducts();
    }, [showProductList]);

    const handleSearch = async () => {
        const isAuth = await ensureAuthenticated();
        if (!isAuth) return navigate("/user_auth");
        const query = new URLSearchParams();
        if (searchQuery) query.append("search", searchQuery.trim());
        if (category) query.append("category", category.trim());
        if (priceMin) query.append("price_min", priceMin);
        if (priceMax) query.append("price_max", priceMax);

        try {
            const res = await fetch(`https://eaglehub.onrender.com/search?${query.toString()}`, {
                method: "GET",
                credentials: "include",
            });
            const data = await res.json();
            if (!data.length) toast.info("No matching products found.");
            setProducts(data);
        } catch {
            toast.error("Search failed");
        }
    };

    const handleAddOrUpdateProduct = async (e) => {
        e.preventDefault();
        const requiredFields = ["name", "description", "category", "quantity", "colors", "mrp"];
        for (const field of requiredFields) {
            if (!formData[field]) return alert("Please fill all required fields");
        }

        const data = new FormData();
        Object.keys(formData).forEach(key => {
            if (key === "images") {
                formData.images.forEach(file => data.append("images", file));
            } else if (key === "videos") {
                formData.videos.forEach(file => data.append("videos", file));
            } else {
                data.append(key, formData[key]);
            }
        });

        try {
            const res = await fetch(`https://eaglehub.onrender.com/add`, {
                method: "POST",
                body: data,
                credentials:"include",
            });
            if (!res.ok) throw new Error("Failed to submit product");
            toast.success("Product added");
            handleCancelEdit();
            if (showProductList) fetchProducts();
        } catch (err) {
            toast.error(err.message);
        }
    };

    const handleUpdateProduct = async (e) => {
        e.preventDefault();

        const data = new FormData();
        for (const key in formData) {
            if (key === "media") {
                formData.media.forEach(file => {
                    if (file.type.startsWith("image/")) {
                        data.append("images", file);
                    } else if (file.type.startsWith("video/")) {
                        data.append("videos", file);
                    }
                });
            } else if (
                formData[key] !== undefined &&
                formData[key] !== null &&
                formData[key] !== "" &&
                key !== "mediaURL" &&
                key !== "image_urls" &&
                key !== "video_urls"
            ) {
                const valueToSend = Array.isArray(formData[key]) ? formData[key].join(",") : formData[key];
                data.append(key, valueToSend);
            }
        }
        if (formData.add_quantity) {
            data.append("add_quantity", formData.add_quantity);
        }
        // console.log(formData)
        try {
            const res = await fetch(`https://eaglehub.onrender.com/update/${editingId}`, {
                method: "PUT",
                body: data,
                credentials:"include",
            });

            if (!res.ok) throw new Error("Update failed");

            toast.success("Product updated");
            handleCancelEdit();
            if (showProductList) fetchProducts();
        } catch (err) {
            toast.error(err.message);
        }
    };


    const fetchProducts = async () => {
        try {
            const res = await fetch("https://eaglehub.onrender.com/read",{
                credentials:"include",
            });
            const data = await res.json();
            setProducts(data);
        } catch (err) {
            toast.error("Unable to load products");
        }
    };

    // const handleEdit = (product) => {
    //     setEditingId(product.sku);
    //     setFormData({ ...product, media: [], mediaURL: "", add_quantity: "" });
    // };
    const handleEdit = (product) => {
        setEditingId(product.sku);
        setFormData({
            ...product,
            colors: Array.isArray(product.colors) ? product.colors : (product.colors || "").split(",").map(c => c.trim()),
            size: Array.isArray(product.size) ? product.size : (product.size || "").split(",").map(s => s.trim()),
            media: [],
            mediaURL: "",
            add_quantity: "",
        });
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this product?")) return;
        try {
            const res = await fetch(`https://eaglehub.onrender.com/delete/${id}`, { method: "DELETE", credentials:"include", });
            if (!res.ok) throw new Error();
            toast.success("Deleted successfully");
            fetchProducts();
        } catch {
            toast.error("Failed to delete");
        }
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setFormData({
            name: "",
            description: "",
            category: "",
            quantity: "",
            quantity_threshold: "",
            colors: [],
            size: [],
            mrp: "",
            wholesale_price: "",
            gst: "",
            media: [],
            mediaURL: "",
            add_quantity: "",
        });
        setMediaPreview([]);
    };

    const handleAddCoupon = async (e) => {
        e.preventDefault();
        if (!couponCode || !couponDiscount) return alert("Fill in coupon details");
        try {
            const res = await fetch("https://eaglehub.onrender.com/add_coupon", {
                method: "POST",
                credentials:"include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ code: couponCode.toUpperCase(), discount: couponDiscount }),
            });
            if (!res.ok) throw new Error("Failed to add coupon");
            toast.success("Coupon added");
            setCouponCode("");
            setCouponDiscount("");
        } catch (err) {
            toast.error(err.message);
        }
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
                        <input type="number" name="quantity_threshold" placeholder="Quantity Threshold (Optional)" value={formData.quantity_threshold} onChange={handleChange} />
                        {editingId && (
                            <input
                                type="number"
                                name="add_quantity"
                                placeholder="Add Quantity"
                                value={formData.add_quantity || ""}
                                onChange={handleChange}
                            />
                        )}
                        {/* <input type="text" name="colors" placeholder="Colors *" value={formData.colors || ""} onChange={handleChange} required /> */}
                        <input
                            type="text"
                            name="colors"
                            placeholder="Colors * (e.g. red,blue,green)"
                            value={formData.colors.join(", ")}
                            onChange={(e) =>
                                setFormData({ ...formData, colors: e.target.value.split(",").map(c => c.trim()) })
                            }
                            required
                        />
                        {/* <input type="text" name="size" placeholder="size ( XXS, XS, S, M, L, XL, XXL ) " value={formData.size || ""} onChange={handleChange} /> */}
                        <input
                            type="text"
                            name="size"
                            placeholder="Size (e.g. XS,S,M,L)"
                            value={formData.size.join(", ")}
                            onChange={(e) =>
                                setFormData({ ...formData, size: e.target.value.split(",").map(s => s.trim()) })
                            }
                        />
                        <input type="number" name="mrp" placeholder="MRP *" value={formData.mrp || ""} onChange={handleChange} required />
                        <input type="number" name="wholesale_price" placeholder="Wholesale Price (Optional)" value={formData.wholesale_price || ""} onChange={handleChange} />
                        <input type="number" name="gst" placeholder="GST % (Optional)" value={formData.gst || ''} onChange={handleChange} />
                        <input
                            type="file"
                            name="media"
                            accept="image/*,video/mp4"
                            multiple
                            onChange={handleChange} />
                    </div>
                    <div className="btn-group">
                        {!editingId ? (
                            <button type="submit" className="btn-submit">
                                Add Product
                            </button>
                        ) : (
                            <>
                                <button type="button" className="btn-submit" onClick={handleUpdateProduct}>
                                    Save Changes
                                </button>
                                <button type="button" className="btn-cancel" onClick={handleCancelEdit}>
                                    Cancel Edit
                                </button>
                            </>
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
                        <div className="admin-filter-container fancy-filters">
                            <input
                                type="text"
                                placeholder="Search product name..."
                                className="search-bar fancy-input"
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
                            <button
                                className="admin-filter-toggle-btn"
                                onClick={() => setShowFilters((prev) => !prev)}
                            >
                                <IoFilter className="admin-filter-icon" />
                            </button>
                            {showFilters && (
                                <div className="admin-filter-dropdown fancy-dropdown">
                                    <input
                                        type="text"
                                        placeholder="Category"
                                        value={category}
                                        onChange={(e) => setCategory(e.target.value)}
                                    />
                                    {/* <input
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
                                /> */}
                                </div>
                            )}
                        </div>

                        <div className="product-list">
                            {filteredProducts.map((product) => (
                                <div
                                    key={product.sku}
                                    className={`product-card ${parseInt(product.quantity) < parseInt(product.quantity_threshold || 0)
                                        ? "low-stock"
                                        : ""
                                        }`}
                                >
                                    <div className="product-media-preview">
                                        {product.video_urls.length > 0 ? (
                                            product.video_urls.map((video, idx) => (
                                                <video key={`video-${product.sku}-${idx}`} src={video} controls width="100%" />
                                            ))
                                        ) : product.image_urls.length > 0 ? (
                                            product.image_urls.map((image, idx) => (
                                                <img key={`image-${product.sku}-${idx}`} src={image} alt={product.name} />
                                            ))
                                        ) : (
                                            <p>No media available</p>
                                        )}
                                    </div>

                                    <div className="product-info">
                                        <h3>{product.name}</h3>
                                        <p>{product.description}</p>
                                        <p><strong>Category:</strong> {product.category}</p>
                                        <p><strong>Quantity:</strong> {product.quantity}</p>
                                        {product.quantity_threshold && <p><strong>Threshold:</strong> {product.quantity_threshold}</p>}
                                        <p><strong>Color:</strong> {Array.isArray(product.colors) ? product.colors.join(", ") : product.colors}</p>
                                        <p><strong>Size:</strong> {Array.isArray(product.size) ? product.size.join(", ") : product.size}</p>
                                        <p><strong>MRP:</strong> ₹{product.mrp}</p>
                                        {product.wholesale_price && <p><strong>Wholesale:</strong> ₹{product.wholesale_price}</p>}
                                        {product.gst && <p><strong>GST:</strong> {product.gst}%</p>}
                                        <div className="card-btn-group">
                                            <button className="btn-edit" onClick={() => handleEdit(product)}>Edit</button>
                                            <button className="btn-delete" onClick={() => handleDelete(product.sku)}>Delete</button>
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
