// src/admin/AdminDashboard.jsx
import React, { useState, useEffect } from "react";
import { IoFilter } from "react-icons/io5";
import { toast } from "react-toastify";
import "./admin_dashboard.css";
import { BiSearchAlt } from "react-icons/bi";
import { ensureAuthenticated } from "../utils/authUtils";
import { useNavigate } from "react-router-dom";
import { FaRegLightbulb } from "react-icons/fa";

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
    const [showOrderTip, setShowOrderTip] = useState(false);
    const [mediaPreview, setMediaPreview] = useState([]);
    const [showFilterPanel, setShowFilterPanel] = useState(false);
    const [showProductList, setShowProductList] = useState(false);
    const [filtersManuallyApplied, setFiltersManuallyApplied] = useState(false);
    const [coupons, setCoupons] = useState([]);
    const [couponCode, setCouponCode] = useState("");
    const navigate = useNavigate();
    const [couponDiscount, setCouponDiscount] = useState("");
    const [showFilters, setShowFilters] = useState(false);
    const [category, setCategory] = useState("");
    const [priceMin, setPriceMin] = useState("");
    const [priceMax, setPriceMax] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [showOrders, setShowOrders] = useState(false);
    const [orders, setOrders] = useState([]);
    const [filters, setFilters] = useState({
        name: "",
        orderId: "",
        deliveryStatus: "",
        paymentStatus: "",
        refundStatus: "",
        paymentMethod: "",
        fromDate: "",
        toDate: ""
    });
    const [expandedOrderId, setExpandedOrderId] = useState(null);

    const handleDispatch = async (orderId) => {
        try {
            const res = await fetch("https://eaglehub.onrender.com/dispatchorder", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({ razorpay_order_id: orderId }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Failed to dispatch order");
            }

            // Update UI only if backend confirms dispatch
            const updatedOrders = orders.map((order) =>
                order._id === orderId ? { ...order, delivery_status: "Dispatched" } : order
            );
            setOrders(updatedOrders);

            toast.success(data.message);
        } catch (err) {
            console.error("Dispatch error:", err);
            toast.error(err.message || "Failed to mark order as dispatched.");
        }
    };

    const fetchFilteredOrders = async () => {
        const query = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
            if (value) query.append(key, value);
        });

        try {
            const res = await fetch(`https://eaglehub.onrender.com/searchorders?${query.toString()}`, { credentials: "include" });
            const data = await res.json();
            const parsedOrders = data.map((order) => ({
                ...order,
                _id: order.razorpay_order_id || order._id,
                shipping_info: {
                    fullName: order.shipping_info?.full_name || "N/A",
                    phone: order.shipping_info?.phone || "N/A",
                    email: order.shipping_info?.email || "N/A",
                    address: order.shipping_info?.address || "N/A",
                    city: order.shipping_info?.city || "N/A",
                    state: order.shipping_info?.state || "N/A",
                    zip: order.shipping_info?.pincode || "N/A",
                    country: order.shipping_info?.country || "N/A",
                },
                delivery_status: order.delivery_status || "N/A",
                refund_status: order.refund_status || "N/A",
                payment_status: order.payment_status || "N/A",
                order_items: order.order_items || [],
            }));
            setOrders(parsedOrders);
        } catch (error) {
            console.error("Error fetching filtered orders", error);
            toast.error("Failed to load filtered orders");
        }
    };

    useEffect(() => {
        if (showOrders && filtersManuallyApplied) fetchFilteredOrders();
    }, [filters, showOrders]);


    const handleRefund = async (orderId) => {
        const confirmRefund = window.confirm(
            "Are you sure you want to refund this order? This action cannot be undone."
        );

        if (!confirmRefund) return;

        try {
            const res = await fetch("https://eaglehub.onrender.com/confirm_refund", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({ razorpay_order_id: orderId }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Refund failed");
            }

            // Remove order from UI (since backend deletes it)
            const updatedOrders = orders.filter((order) => order._id !== orderId);
            setOrders(updatedOrders);

            toast.success(`Refund successful. Refund ID: ${data.refund_id}`);
        } catch (err) {
            console.error("Refund error:", err);
            toast.error(err.message || "Failed to process refund");
        }
    };

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
                credentials: "include",
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
                credentials: "include",
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
            const res = await fetch("https://eaglehub.onrender.com/read", {
                credentials: "include",
            });
            const data = await res.json();
            if (Array.isArray(data)) {
                if (data.length === 0) {
                    toast.info("No products added yet.");
                }
                setProducts(data);
            } else if (data && typeof data === "object") {
                // Handles case where a single product is returned as an object
                setProducts([data]);
            } else {
                console.warn("Unexpected product response format", data);
                toast.error("Unexpected response from server");
                setProducts([]); // Avoid breaking `.filter`
            }
        } catch (err) {
            console.error("Fetch failed:", err);
            toast.error(err.message || "Failed to fetch products");
            setProducts([]); // fallback
        }
    };

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
            const res = await fetch(`https://eaglehub.onrender.com/delete/${id}`, { method: "DELETE", credentials: "include", });
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
                credentials: "include",
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

    const filteredProducts = Array.isArray(products)
        ? products.filter((product) => {
            const matchesCategory =
                category.trim() === "" || (product.category?.toLowerCase() || "").includes(category.toLowerCase());
            const matchesMinPrice = priceMin === "" || parseFloat(product.mrp) >= parseFloat(priceMin);
            const matchesMaxPrice = priceMax === "" || parseFloat(product.mrp) <= parseFloat(priceMax);
            const matchesSearch = (product.name?.toLowerCase() || "").includes(searchQuery.toLowerCase());
            return matchesCategory && matchesMinPrice && matchesMaxPrice && matchesSearch;
        }) : [];

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

                <>
                    {/* View Orders Button */}
                    <div className="view-orders-btn-container">
                        <button
                            className="btn-view-orders"
                            onClick={() => {
                                setShowOrders((prev) => {
                                    const toggled = !prev;

                                    if (toggled) {
                                        // Only show tip when we're showing orders
                                        setShowOrderTip(true);
                                        setTimeout(() => setShowOrderTip(false), 4000);
                                    }

                                    return toggled;
                                });
                                setOrders([]);
                            }}
                        >
                            {showOrders ? "Hide Orders" : "View Orders"}
                        </button>
                        {showOrders && (
                            <div style={{ display: "flex", alignItems: "center" }}>
                                <input
                                    type="text"
                                    className="minimal-input"
                                    placeholder="Customer Name"
                                    value={filters.name}
                                    onChange={(e) => setFilters({ ...filters, name: e.target.value })}
                                />
                                <input
                                    type="text"
                                    className="minimal-input"
                                    placeholder="Order ID"
                                    value={filters.orderId}
                                    onChange={(e) => setFilters({ ...filters, orderId: e.target.value })}
                                />
                                <button onClick={() => setShowFilterPanel(!showFilterPanel)} className="icon-button">
                                    <IoFilter size={35} />
                                </button>
                                <button onClick={() => {
                                    setFiltersManuallyApplied(true);
                                    fetchFilteredOrders();
                                }} className="icon-button">
                                    <BiSearchAlt size={30} />
                                </button>
                            </div>
                        )}
                    </div>
                    {showOrderTip && (
                        <p style={{
                            marginTop: "10px",
                            marginLeft: "50px",
                            color: "#003366",
                            fontSize: "15px",
                            backgroundColor: "#eaf1ff",
                            padding: "10px 15px",
                            borderRadius: "8px",
                            border: "1px solid #0040ff",
                            width: "fit-content"
                        }}>
                            Tip <FaRegLightbulb /> : Use search or filters to view specific orders.
                        </p>
                    )}

                    {/* Search & Filter */}
                    {showOrders && showFilterPanel && (
                        <div className="filter-panel">
                            <select
                                className="styled-select"
                                value={filters.deliveryStatus}
                                onChange={(e) => setFilters({ ...filters, deliveryStatus: e.target.value })}
                            >
                                <option value="">Delivery Status</option>
                                <option value="Dispatched">Dispatched</option>
                                <option value="Not Dispatched">Not Dispatched</option>
                                <option value="Delivered">Delivered</option>
                                <option value="Cancelled">Cancelled</option>
                            </select>

                            <select
                                className="styled-select"
                                value={filters.paymentStatus}
                                onChange={(e) => setFilters({ ...filters, paymentStatus: e.target.value })}
                            >
                                <option value="">Payment Status</option>
                                <option value="PAID">Paid</option>
                                <option value="PENDING">Pending</option>
                            </select>

                            <select
                                className="styled-select"
                                value={filters.refundStatus}
                                onChange={(e) => setFilters({ ...filters, refundStatus: e.target.value })}
                            >
                                <option value="">Refund Status</option>
                                <option value="N/A">N/A</option>
                                <option value="PENDING">Pending</option>
                                <option value="PAID">Paid</option>
                            </select>

                            <select
                                className="styled-select"
                                value={filters.paymentMethod}
                                onChange={(e) => setFilters({ ...filters, paymentMethod: e.target.value })}
                            >
                                <option value="">Payment Method</option>
                                <option value="ONLINE">Online</option>
                                <option value="COD">Cash on Delivery</option>
                            </select>

                            <div className="date-wrapper">
                                <label className="date-label">From:</label>
                                <input
                                    type="date"
                                    className="styled-date"
                                    value={filters.fromDate}
                                    onChange={(e) => setFilters({ ...filters, fromDate: e.target.value })}
                                />
                            </div>

                            <div className="date-wrapper">
                                <label className="date-label">To:</label>
                                <input
                                    type="date"
                                    className="styled-date"
                                    value={filters.toDate}
                                    onChange={(e) => setFilters({ ...filters, toDate: e.target.value })}
                                />
                            </div>
                        </div>

                    )}

                    {/* Orders Section */}
                    {showOrders && (
                        <div
                            className="orders-section glossy-container"
                            style={{ marginTop: "30px" }}
                        >
                            <h2 className="orders-heading">Placed Orders</h2>

                            {orders.length === 0 ? (
                                <p className="no-orders">No orders found.</p>
                            ) : (
                                <ul className="orders-list">
                                    {orders.map((order) => (
                                        <li
                                            key={order._id}
                                            className="order-card glossy-card"
                                            onClick={() =>
                                                setExpandedOrderId(
                                                    expandedOrderId === order._id ? null : order._id
                                                )
                                            }
                                            style={{ cursor: "pointer" }}
                                        >
                                            <div className="order-details-container">
                                                {/* Always visible: Basic Summary */}
                                                <div className="order-section">
                                                    <h3>Order Summary</h3>
                                                    <p><strong>Order ID:</strong> {order._id}</p>
                                                    <p><strong>Delivery Status:</strong> {order.delivery_status}</p>
                                                    <p><strong>Total:</strong> ₹{order.subtotal}</p>
                                                    <p><strong>Quantity:</strong> {order.total_quantity}</p>
                                                    <p><strong>Payment:</strong> {order.payment_status}</p>
                                                </div>
                                                {/* Expandable Details */}
                                                {expandedOrderId === order._id && (
                                                    <>
                                                        <div className="order-section">
                                                            <h3>Shipping Information</h3>
                                                            <p><strong>Name:</strong> {order.shipping_info.fullName}</p>
                                                            <p><strong>Phone:</strong> {order.shipping_info.phone}</p>
                                                            <p><strong>Email:</strong> {order.shipping_info.email}</p>
                                                            <p>
                                                                <strong>Address:</strong>{" "}
                                                                {order.shipping_info.address}, {order.shipping_info.city},{" "}
                                                                {order.shipping_info.state} - {order.shipping_info.zip},{" "}
                                                                {order.shipping_info.country}
                                                            </p>
                                                        </div>

                                                        <div className="order-section">
                                                            <h3>Payment Details</h3>
                                                            <p><strong>Method:</strong> {order.payment_method}</p>
                                                            <p><strong>Status:</strong> {order.payment_status}</p>
                                                        </div>

                                                        <div className="order-section">
                                                            <h3>Ordered Items</h3>
                                                            {order.order_items.map((item, index) => (
                                                                <div key={index} className="order-item">
                                                                    <p><strong>Product:</strong> {item.name}</p>
                                                                    <p><strong>Price:</strong> ₹{item.price}</p>
                                                                    <p><strong>Quantity:</strong> {item.quantity}</p>
                                                                    <p><strong>Total:</strong> ₹{item.total}</p>
                                                                    {item.size && <p><strong>Size:</strong> {item.size}</p>}
                                                                    {item.colors && <p><strong>Color:</strong> {item.colors}</p>}
                                                                </div>
                                                            ))}
                                                        </div>
                                                        {(order.payment_status === "PAID" && order.delivery_status === "Cancelled") ? (
                                                            <div className="refund-button-container">
                                                                <button
                                                                    className="btn-refund glossy-button"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleRefund(order._id);
                                                                    }}
                                                                >
                                                                    Refund
                                                                </button>
                                                            </div>
                                                        ) : order.delivery_status !== "Dispatched" && (
                                                            <div className="dispatch-button-container">
                                                                <button
                                                                    className="btn-dispatch glossy-button"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation(); // prevent collapsing
                                                                        handleDispatch(order._id);
                                                                    }}
                                                                >
                                                                    Dispatch
                                                                </button>
                                                            </div>
                                                        )}
                                                    </>
                                                )}
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    )}
                </>

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
                            {(filteredProducts || []).length === 0 && (
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