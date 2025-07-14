// src/pages/Profile.jsx
import React, { useState, useEffect } from "react";
import "./profile.css";
import { BiLogOut } from "react-icons/bi";
import { MdOutlineEdit } from "react-icons/md";
import { IoSave } from "react-icons/io5";
import { FaFileUpload } from "react-icons/fa";
import { ensureAuthenticated } from "../utils/authUtils";
import { useNavigate } from "react-router-dom";
import { auth, RecaptchaVerifier, signInWithPhoneNumber } from "../utils/mobileauth";
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';

const Profile = () => {
    const [user, setUser] = useState({
        fullName: "",
        email: "",
        phone: "",
        address: "",
        profileImage: "",
        countryCode: "+91"
    });

    const [editing, setEditing] = useState(false);
    const navigate = useNavigate();
    const [emailVerified, setEmailVerified] = useState(false);
    const [phoneVerified, setPhoneVerified] = useState(false);

    useEffect(() => {
        const checkAuthAndLoadProfile = async () => {
            const isAuth = await ensureAuthenticated();
            if (!isAuth) {
                navigate("/user_auth");
                return;
            }

            try {
                const res = await fetch("https://eaglehub.onrender.com/profile_setup", {
                    credentials: "include"
                });
                const data = await res.json();

                setUser(prev => ({
                    ...prev,
                    fullName: data.full_name || data.username || "",
                    email: data.email || "",
                    phone: data.phone || "",
                    address: data.address || "",
                    profileImage: data.profile_image || ""
                }));

                setEmailVerified(data.email_verified === true);
                setPhoneVerified(data.phone_verified === true);

                localStorage.setItem("userProfile", JSON.stringify(data));
            } catch (err) {
                console.error("Error loading user data:", err);
            }
        };

        checkAuthAndLoadProfile();
    }, []);

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        if (name === "profileImage" && files[0]) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setUser({ ...user, profileImage: reader.result });
            };
            reader.readAsDataURL(files[0]);
        } else {
            setUser({ ...user, [name]: value });
        }
    };

    const saveChanges = async () => {
        try {
            const res = await fetch("https://eaglehub.onrender.com/save_profile", {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    full_name: user.fullName,
                    address: user.address,
                    profileImage: user.profileImage,
                    email: user.email,
                    phone: user.phone
                })
            });

            const data = await res.json();
            if (res.ok) {
                alert(data.message);
                setEditing(false);
            } else {
                alert(data.error);
            }
        } catch (err) {
            console.error("Error saving profile:", err);
            alert("Failed to save changes.");
        }
    };


    const verifyEmail = async () => {
        try {
            const res = await fetch("https://eaglehub.onrender.com/verify_email", {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ email: user.email })
            });
            const data = await res.json();
            alert(data.message || data.error);
        } catch (err) {
            alert("Email verification failed.");
        }
    };

    useEffect(() => {
        // Initialize reCAPTCHA once when component loads
        if (!window.recaptchaVerifier) {
            window.recaptchaVerifier = new RecaptchaVerifier(
                auth,
                "recaptcha-container",
                {
                    size: "invisible",
                    callback: (response) => {
                        console.log("reCAPTCHA solved:", response);
                        // You can trigger your OTP send logic here if needed
                    },
                    'expired-callback': () => {
                        console.warn("reCAPTCHA expired. Resetting...");
                        window.recaptchaVerifier.clear();
                        delete window.recaptchaVerifier;
                    }
                },
            );

            // Render explicitly in case invisible mode fails silently
            window.recaptchaVerifier.render().then(widgetId => {
                window.recaptchaWidgetId = widgetId;
            });
        }
    }, []);

    const requestOTP = async (fullPhone) => {
        const appVerifier = window.recaptchaVerifier;
        return signInWithPhoneNumber(auth, fullPhone, appVerifier);
    };

    const verifyPhone = async () => {
        const fullPhone = user.phone?.trim();
        if (!fullPhone.startsWith("+")) {
            alert("Invalid phone number format.");
            return;
        }
        try {
            console.log("Requesting OTP for phone:", fullPhone);
            const confirmationResult = await requestOTP(fullPhone);
            console.log("OTP sent successfully. Waiting for user input...", confirmationResult);
            const code = prompt("Enter OTP:");
            if (!code || code.length < 4) {
                alert("OTP is required");
                return;
            }
            const result = await confirmationResult.confirm(code);
            const firebaseToken = await result.user.getIdToken();
            // Send to backend
            const res = await fetch("https://eaglehub.onrender.com/verify_phone", {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ firebase_token: firebaseToken }),
            });
            if (res.status === 200) {
                setPhoneVerified(true);
                alert("Phone number verified successfully!");
            } else {
                const error = await res.json();
                alert("Verification failed: " + (error.error || "Unknown error"));
            }
        } catch (err) {
            console.error(err);
            alert("Failed: " + (err.message || err));
        }
    };

    const handleLogout = async () => {
        try {
            const res = await fetch("https://eaglehub.onrender.com/logout", {
                method: "POST",
                credentials: "include", 
                headers: {
                    "Content-Type": "application/json"
                }
            });

            if (!res.ok) {
                const data = await res.json();
                console.error("Logout failed:", data);
                alert(data?.error || "Logout failed. Please try again.");
                return;
            }

            // Redirect to home page
            localStorage.clear();
            navigate("/");
        } catch (err) {
            console.error("Logout request error:", err);
            alert("Something went wrong during logout.");
        }
    };

    return (
        <div className="profile-page-wrapper">
            <div className="profile-page">
                <h1 className="profile-title">👤 My Profile</h1>

                {!editing && (
                    <div className="top-edit-btn">
                        <button className="edit-btn" onClick={() => setEditing(true)}>
                            <MdOutlineEdit className="edit-icon" />
                            Edit
                        </button>
                        <button className="logout-btn" onClick={handleLogout}>
                            <BiLogOut className="logout-icon" />
                            Logout
                        </button>
                    </div>
                )}

                <div className="profile-container">
                    <div className="profile-pic-section">
                        <img
                            src={
                                user.profileImage ||
                                "https://cdn-icons-png.flaticon.com/512/149/149071.png"
                            }
                            alt="Profile"
                            className="profile-pic"
                        />
                        {editing && (
                            <>
                                <input
                                    type="file"
                                    id="profileImage"
                                    name="profileImage"
                                    accept="image/*"
                                    onChange={handleChange}
                                    style={{ display: "none" }}
                                />
                                <label htmlFor="profileImage" className="custom-file-upload">
                                    <FaFileUpload className="upload-file-icon" />
                                    Upload Profile Image
                                </label>
                            </>
                        )}
                    </div>

                    <div className="profile-info">
                        <div className="info-field">
                            <label>Full Name</label>
                            <input
                                type="text"
                                name="fullName"
                                placeholder="Enter your full name"
                                value={user.fullName}
                                onChange={handleChange}
                                disabled={!editing}
                            />
                        </div>

                        <div className="info-field">
                            <label>Email</label>
                            <div className="input-verification">
                                <input
                                    type="email"
                                    name="email"
                                    value={user.email}
                                    placeholder="Enter your email"
                                    onChange={handleChange}
                                    disabled={!editing}
                                />
                                <button className="verify-btn" onClick={verifyEmail}>
                                    Verify
                                </button>
                            </div>
                            <span
                                className={`verify-message ${emailVerified ? "success" : "error"
                                    }`}
                            >
                                {emailVerified ? "Email is verified ✅" : "Email not verified ❌"}
                            </span>
                        </div>

                        <div className="info-field">
                            <label>Phone</label>
                            <div className="input-verification">

                                <PhoneInput
                                    country={'in'}
                                    value={user.phone}
                                    onChange={(value) => setUser({ ...user, phone: value })}
                                    inputProps={{
                                        name: 'phone',
                                        required: true,
                                        autoFocus: false,
                                    }}
                                    enableSearch={true}
                                    disabled={!editing}
                                />
                                <button className="verify-btn" onClick={verifyPhone}>
                                    Verify
                                </button>
                            </div>
                            <span
                                className={`verify-message ${phoneVerified ? "success" : "error"
                                    }`}
                            >
                                {phoneVerified ? "Phone number is verified ✅" : "Phone not verified ❌"}
                            </span>
                        </div>

                        <div className="info-field">
                            <label>Address</label>
                            <textarea
                                name="address"
                                value={user.address}
                                placeholder="Enter your address"
                                onChange={handleChange}
                                disabled={!editing}
                            />
                        </div>

                        {editing && (
                            <div className="profile-actions">
                                <button className="save-btn" onClick={saveChanges}>
                                    <IoSave className="save-icon" />
                                    Save
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <div id="recaptcha-container"></div>
        </div>
    );
};

export default Profile;
