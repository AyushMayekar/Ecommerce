import React, { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useNavigate, Link } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import * as Components from "../Components/reusables";
import Swal from 'sweetalert2'

function AuthScreen({ signIn, toggle }) {

    const navigate = useNavigate();

    // Controlled state for Sign Up form inputs
    const [signupData, setSignupData] = useState({
        email: "",
        username: "",
        password: "",
        confirmPassword: "",
    });

    // Controlled state for Sign In form inputs
    const [signinData, setSigninData] = useState({
        username_or_email: "", // username or email
        password: "",
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showSignupPassword, setShowSignupPassword] = useState(false);
    const [showSignupConfirmPassword, setShowSignupConfirmPassword] = useState(false);

    const handleSignupChange = (e) => {
        const { name, value } = e.target;
        setSignupData({ ...signupData, [name]: value });
    };

    const handleSigninChange = (e) => {
        const { name, value } = e.target;
        setSigninData({ ...signinData, [name]: value });
    };

    const handleSignUp = async (e) => {
        e.preventDefault();

        // Basic frontend validation
        if (signupData.password !== signupData.confirmPassword) {
            Swal.fire({
                icon: "error",
                title: "Oops...",
                text: "Passwords do not match!",
                confirmButtonText: "Try Again",
                confirmButtonColor: "#3085d6"
            });
            return;
        }


        try {
            const res = await fetch("http://127.0.0.1:8000/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    username: signupData.username,
                    email: signupData.email,
                    password: signupData.password,
                    confirm_password: signupData.confirmPassword,
                }),
                credentials: "include",
            });

            const data = await res.json();
            Swal.fire({
                icon: "success",
                title: "Success!",
                text: data.message || "Account created successfully!",
                confirmButtonText: "Continue",
                confirmButtonColor: "#3085d6"
            });

            if (res.ok) {
                // Optionally, auto-switch to sign in panel or clear form
                toggle(true);
            }
        } catch (error) {
            Swal.fire({
                icon: "error",
                title: "Oops...",
                text: "Signup failed. Please try again later.",
                confirmButtonText: "OK"
            });
            console.error(error);
        }
    };

    // Sign In submit handler
    const handleSignIn = async (e) => {
        e.preventDefault();

        try {
            const res = await fetch("http://127.0.0.1:8000/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    username_or_email: signinData.username_or_email,
                    password: signinData.password,
                }),
                credentials: "include",
            });

            const data = await res.json();

            if (res.ok) {
                Swal.fire({
                    icon: "success",
                    title: "Success!",
                    text: data.message || "Logged in successfully!"
                });

                // Delay navigation slightly to let Swal finish
                setTimeout(() => navigate("/home"), 1000);
            } else {
                Swal.fire({
                    icon: "error",
                    title: "Login Failed",
                    text: data.message || "Invalid username or password.",
                    confirmButtonText: "Try Again"
                });
            }
        } catch (error) {
            console.error("Login error:", error);
            Swal.fire({
                icon: "error",
                title: "Server Error",
                text: "Something went wrong. Please try again later.",
            });
        }
    };

    return (
        <>
            <Components.Background />

            <Components.Container>
                {/* Sign Up Form */}
                <Components.SignUpContainer $signinIn={signIn}>
                    <Components.Form onSubmit={handleSignUp}>
                        <Components.Title $small>Create Account</Components.Title>
                        <Components.Input
                            name="email"
                            type="text"
                            placeholder="Email"
                            value={signupData.email}
                            onChange={handleSignupChange}
                            required
                        />
                        <Components.Input
                            name="username"
                            type="text"
                            placeholder="Username"
                            value={signupData.username}
                            onChange={handleSignupChange}
                            required
                        />

                        <div style={{ position: "relative", width: "100%" }}>
                            <Components.Input
                                name="password"
                                type={showSignupPassword ? "text" : "password"}
                                placeholder="Password"
                                style={{ paddingRight: "40px" }}
                                value={signupData.password}
                                onChange={handleSignupChange}
                                required
                            />
                            <div onClick={() => setShowSignupPassword((p) => !p)} style={eyeIconStyle}>
                                {showSignupPassword ? <FaEye /> : <FaEyeSlash />}
                            </div>
                        </div>

                        <div style={{ position: "relative", width: "100%" }}>
                            <Components.Input
                                name="confirmPassword"
                                type={showSignupConfirmPassword ? "text" : "password"}
                                placeholder="Confirm Password"
                                style={{ paddingRight: "40px" }}
                                value={signupData.confirmPassword}
                                onChange={handleSignupChange}
                                required
                            />
                            <div onClick={() => setShowSignupConfirmPassword((p) => !p)} style={eyeIconStyle}>
                                {showSignupConfirmPassword ? <FaEye /> : <FaEyeSlash />}
                            </div>
                        </div>

                        <Components.Button type="submit">Sign Up</Components.Button>
                        <Components.GoogleButton type="button">
                            <FcGoogle size={22} /> Google
                        </Components.GoogleButton>
                    </Components.Form>
                </Components.SignUpContainer>

                {/* Sign In Form */}
                <Components.SignInContainer $signinIn={signIn}>
                    <Components.Form onSubmit={handleSignIn}>
                        <Components.Title $small>Sign In</Components.Title>
                        <Components.Input
                            name="username_or_email"
                            type="text"
                            placeholder="Username / Email"
                            value={signinData.username_or_email}
                            onChange={handleSigninChange}
                            required
                        />

                        <div style={{ position: "relative", width: "100%" }}>
                            <Components.Input
                                name="password"
                                type={showPassword ? "text" : "password"}
                                placeholder="Password"
                                style={{ paddingRight: "40px" }}
                                value={signinData.password}
                                onChange={handleSigninChange}
                                required
                            />
                            <div onClick={() => setShowPassword((p) => !p)} style={eyeIconStyle}>
                                {showPassword ? <FaEye /> : <FaEyeSlash />}
                            </div>
                        </div>

                        <Components.Anchor as={Link} to="/forgot_password">
                            Forgot your password?
                        </Components.Anchor>
                        <Components.Button type="submit">
                            Sign In
                        </Components.Button>
                        <Components.GoogleButton type="button">
                            <FcGoogle size={22} /> Google
                        </Components.GoogleButton>
                    </Components.Form>
                </Components.SignInContainer>

                {/* Sliding Overlay Panels */}
                <Components.OverlayContainer $signinIn={signIn}>
                    <Components.Overlay $signinIn={signIn}>
                        <Components.LeftOverlayPanel $signinIn={signIn}>
                            <Components.Title>Welcome Back</Components.Title>
                            <Components.Paragraph>
                                To keep connected with us, please log in
                                with your personal information!!
                            </Components.Paragraph>
                            <Components.GhostButton onClick={() => toggle(true)}>
                                Sign In
                            </Components.GhostButton>
                        </Components.LeftOverlayPanel>

                        <Components.RightOverlayPanel $signinIn={signIn}>
                            <Components.Title>Hello, Friend!</Components.Title>
                            <Components.Paragraph>
                                Enter your personal details and start your journey with us!!
                            </Components.Paragraph>
                            <Components.GhostButton onClick={() => toggle(false)}>
                                Sign Up
                            </Components.GhostButton>
                        </Components.RightOverlayPanel>
                    </Components.Overlay>
                </Components.OverlayContainer>
            </Components.Container>
        </>
    );
}

// Eye icon styling for password visibility
const eyeIconStyle = {
    position: "absolute",
    right: "10px",
    top: "55%",
    transform: "translateY(-50%)",
    cursor: "pointer",
    fontSize: "18px",
    color: "#333",
    opacity: 0.7,
};


export default AuthScreen;
