import React, { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import {
    BrowserRouter as Router,
    Routes,
    Route,
    Navigate,
    useLocation,
    useNavigate,
} from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import * as Components from "../Components/reusables";

function AuthScreen({ signIn, toggle }) {
    const [showPassword, setShowPassword] = useState(false);
    const [showSignupPassword, setShowSignupPassword] = useState(false);
    const [showSignupConfirmPassword, setShowSignupConfirmPassword] = useState(false);

    const navigate = useNavigate();

    const togglePasswordVisibility = () => setShowPassword(prev => !prev);
    const toggleSignupPasswordVisibility = () => setShowSignupPassword(prev => !prev);
    const toggleSignupConfirmPasswordVisibility = () => setShowSignupConfirmPassword(prev => !prev);

    return (
        <>
            <Components.Background />

            <Components.Container>
                {/* Sign Up Form */}
                <Components.SignUpContainer $signinIn={signIn}>
                    <Components.Form>
                        <Components.Title $small>Create Account</Components.Title>
                        <Components.Input type="text" placeholder="Email" />
                        <Components.Input type="username" placeholder="Username" />

                        <div style={{ position: "relative", width: "100%" }}>
                            <Components.Input
                                type={showSignupPassword ? "text" : "password"}
                                placeholder="Password"
                                style={{ paddingRight: "40px" }}
                            />
                            <div onClick={toggleSignupPasswordVisibility} style={eyeIconStyle}>
                                {showSignupPassword ? <FaEye /> : < FaEyeSlash/>}
                            </div>
                        </div>

                        <div style={{ position: "relative", width: "100%" }}>
                            <Components.Input
                                type={showSignupConfirmPassword ? "text" : "password"}
                                placeholder="Confirm Password"
                                style={{ paddingRight: "40px" }}
                            />
                            <div onClick={toggleSignupConfirmPasswordVisibility} style={eyeIconStyle}>
                                {showSignupConfirmPassword ? <FaEye /> : < FaEyeSlash/>}
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
                    <Components.Form>
                        <Components.Title $small>Sign In</Components.Title>
                        <Components.Input type="username" placeholder="Username" />

                        <div style={{ position: "relative", width: "100%" }}>
                            <Components.Input
                                type={showPassword ? "text" : "password"}
                                placeholder="Password"
                                style={{ paddingRight: "40px" }}
                            />
                            <div onClick={togglePasswordVisibility} style={eyeIconStyle}>
                                {showPassword ? <FaEye /> : < FaEyeSlash/>}
                            </div>
                        </div>

                        <Components.Anchor href="#">Forgot your password?</Components.Anchor>
                        <Components.Button type="button" onClick={() => navigate("/home")}>
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
