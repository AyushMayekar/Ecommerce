import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';

// Add beach background class only on login page
useEffect(() => {
    document.body.classList.add('login-background');
    return () => {
        document.body.classList.remove('login-background');
    };
}, []);

const Login = () => {
    const [isSignUpActive, setIsSignUpActive] = useState(false);

    const handleSignInClick = () => {
        setIsSignUpActive(false);
    };

    const handleSignUpClick = () => {
        setIsSignUpActive(true);
    };

    return (
        <Container className={isSignUpActive ? 'right-panel-active' : ''}>
            <FormContainer className="sign-up-container">
                <Form>
                    <Title>Create Account</Title>
                    <Input type="text" placeholder="Name" />
                    <Input type="email" placeholder="Email" />
                    <Input type="password" placeholder="Password" />
                    <Button>Sign Up</Button>
                </Form>
            </FormContainer>

            <FormContainer className="sign-in-container">
                <Form>
                    <Title>Sign in</Title>
                    <Input type="email" placeholder="Email" />
                    <Input type="password" placeholder="Password" />
                    <Button>Sign In</Button>
                </Form>
            </FormContainer>

            <OverlayContainer>
                <Overlay>
                    <OverlayPanelLeft>
                        <Title>Welcome Back!</Title>
                        <Paragraph>To stay connected with us please login</Paragraph>
                        <GhostButton onClick={handleSignInClick}>Sign In</GhostButton>
                    </OverlayPanelLeft>
                    <OverlayPanelRight>
                        <Title>Hello, Friend!</Title>
                        <Paragraph>Enter your details and start your journey</Paragraph>
                        <GhostButton onClick={handleSignUpClick}>Sign Up</GhostButton>
                    </OverlayPanelRight>
                </Overlay>
            </OverlayContainer>
        </Container>
    );
};

export default Login;

// Styled Components
const Container = styled.div`
  background-color: #fff;
  border-radius: 10px;
  box-shadow: 0 14px 28px rgba(0, 0, 0, 0.25),
              0 10px 10px rgba(0, 0, 0, 0.22);
  position: relative;
  overflow: hidden;
  width: 768px;
  max-width: 100%;
  min-height: 480px;
  display: flex;
`;

const FormContainer = styled.div`
  position: absolute;
  top: 0;
  height: 100%;
  transition: all 0.6s ease-in-out;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 50%;
  z-index: 1;

  &.sign-in-container {
    left: 0;
  }

  &.sign-up-container {
    left: 0;
    opacity: 0;
    z-index: 0;
  }

  ${Container}.right-panel-active &.sign-up-container {
    transform: translateX(100%);
    opacity: 1;
    z-index: 5;
  }

  ${Container}.right-panel-active &.sign-in-container {
    transform: translateX(100%);
  }
`;

const Form = styled.form`
  background-color: #ffffffcc;
  display: flex;
  flex-direction: column;
  padding: 0 50px;
  height: 100%;
  justify-content: center;
  align-items: center;
  text-align: center;
`;

const Title = styled.h1`
  font-weight: bold;
  margin: 0;
`;

const Input = styled.input`
  background-color: #eee;
  border: none;
  padding: 12px 15px;
  margin: 8px 0;
  width: 100%;
`;

const Button = styled.button`
  border: none;
  padding: 12px 45px;
  margin-top: 10px;
  background-color: #008080;
  color: white;
  cursor: pointer;
  font-size: 14px;
`;

const GhostButton = styled(Button)`
  background-color: transparent;
  border: 1px solid white;
`;

const OverlayContainer = styled.div`
  position: absolute;
  top: 0;
  left: 50%;
  width: 50%;
  height: 100%;
  overflow: hidden;
  transition: transform 0.6s ease-in-out;
  z-index: 100;

  ${Container}.right-panel-active & {
    transform: translateX(-100%);
  }
`;

const Overlay = styled.div`
  background: linear-gradient(to right, #00c6ff, #0072ff);
  color: white;
  position: relative;
  left: -100%;
  height: 100%;
  width: 200%;
  transform: translateX(0);
  transition: transform 0.6s ease-in-out;

  ${Container}.right-panel-active & {
    transform: translateX(50%);
  }

  display: flex;
  align-items: center;
  justify-content: space-around;
  flex-direction: row;
`;

const OverlayPanelLeft = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  width: 50%;
`;

const OverlayPanelRight = styled(OverlayPanelLeft)``;

const Paragraph = styled.p`
  font-size: 14px;
  margin: 10px 0 20px;
`;
