// src/pages/Profile.jsx
import React, { useState, useEffect } from "react";
import "./profile.css";
import { BiLogOut } from "react-icons/bi";
import { MdOutlineEdit } from "react-icons/md";
import { IoSave } from "react-icons/io5";
import { FaFileUpload } from "react-icons/fa";
import { ensureAuthenticated } from "../utils/authUtils";

const Profile = () => {
    const [user, setUser] = useState({
        fullName: "",
        email: "",
        phone: "",
        address: "",
        profileImage: "",
    });

    const [editing, setEditing] = useState(false);
    const [emailVerified, setEmailVerified] = useState(false);
    const [phoneVerified, setPhoneVerified] = useState(false);


    useEffect(() => {
        const checkAuth = async () => {
            const isAuth = await ensureAuthenticated();
            if (!isAuth) {
                navigate("/user_auth");
            }
        };
        checkAuth();
    }, []);

    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem("userProfile"));
        if (storedUser) {
            setUser(prev => ({
                ...prev,
                ...storedUser
            }));
        }
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

    const saveChanges = () => {
        localStorage.setItem("userProfile", JSON.stringify(user));
        setEditing(false);
    };

    const verifyEmail = () => {
        setEmailVerified(true);
    };

    const verifyPhone = () => {
        setPhoneVerified(true);
    };

    const handleLogout = () => {
        localStorage.removeItem("userProfile");
        navigate("/");
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
                                <input
                                    type="text"
                                    name="phone"
                                    value={user.phone}
                                    onChange={handleChange}
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
        </div>
    );
};

export default Profile;
