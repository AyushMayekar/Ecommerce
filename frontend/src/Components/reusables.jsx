import styled, { keyframes } from 'styled-components';
import { FcGoogle } from 'react-icons/fc'; // Import for Google icon used in button

/* 🔄 Keyframe for subtle zoom animation */
const zoom = keyframes`
  0% {
    transform: scale(1);
  }
  100% {
    transform: scale(1.05);
  }
`;

/* 📸 Full-screen background image container */
export const Background = styled.div`
  background-image: url('https://images.unsplash.com/photo-1507525428034-b723cf961d3e');
  background-size: cover;
  background-position: center;
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  width: 100vw;
  z-index: -1;
  animation: ${zoom} 30s ease-in-out infinite alternate;
`;

/* 💬 Login container box (semi-transparent glass effect) */
export const Container = styled.div`
  background: rgba(255, 255, 255, 0.25); /* ❄️ Glass white */
  border-radius: 10px;
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
  backdrop-filter: blur(10px); /* 🌫️ Blur effect */
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.18);
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  overflow: hidden;
  width: 800px;
  max-width: 100%;
  min-height: 500px;
`;

export const SignUpContainer = styled.div`
  position: absolute;
  top: 0;
  height: 100%;
  transition: all 0.6s ease-in-out;
  left: 0;
  width: 50%;
  opacity: 0;
  z-index: 1;
  transform: translateX(0);

  ${props =>
        props.$signinIn !== true &&
        `
    opacity: 1;
    z-index: 2;
    transform: translateX(100%);
  `}
`;

export const SignInContainer = styled.div`
  position: absolute;
  top: 0;
  height: 100%;
  transition: all 0.6s ease-in-out;
  left: 0;
  width: 50%;
  z-index: 2;
  opacity: 1;
  transform: translateX(0);

  ${props =>
        props.$signinIn !== true &&
        `
    opacity: 0;
    z-index: 1;
    transform: translateX(100%);
  `}
`;

export const Form = styled.form`
  background-color: transparent; /* make form transparent to blend with glass */
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  padding: 0 50px;
  height: 100%;
  text-align: center;
`;

export const Title = styled.h1`
  font-weight: bold;
  margin: 0;
  margin-bottom: 10px;
  font-size: ${props => props.$small ? '36px' : '42px'};
`;

export const Input = styled.input`
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(6px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 10px;
  padding: 12px 20px;
  margin: 8px 0;
  width: 100%;
  font-size: 14px;
  color:rgb(9, 9, 9);
  transition: all 0.3s ease-in-out;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);

  &::placeholder {
    color: rgba(9, 9, 9, 0.41);
  }

  &:focus {
    outline: none;
    border: 2px solid rgba(0, 64, 255, 0.4);
    background-color: rgba(255, 255, 255, 0.1);
    box-shadow: 0 0 12px rgba(0, 64, 255, 0.3);
  }
`;

export const Button = styled.button`
  margin-top: 15px;
  border-radius: 30px;
  border: 1.5px solid rgba(255, 255, 255, 0.5);
  background: linear-gradient(135deg, rgba(0, 64, 255, 0.4), rgba(0, 100, 255, 0.4));
  color: #ffffff;
  font-size: 13px;
  font-weight: bold;
  padding: 12px 45px;
  letter-spacing: 1px;
  text-transform: uppercase;
  cursor: pointer;
  transition: all 0.3s ease-in-out;
  box-shadow: 0 8px 20px rgba(0, 64, 255, 0.4);

  &:hover {
    transform: translateY(-6px);
    box-shadow: 0 12px 25px rgba(0, 64, 255, 0.4);
    border-color: rgba(0, 64, 255, 0.4);
  }

  &:active {
    transform: scale(0.97);
    box-shadow: 0 4px 12px rgba(0, 64, 255, 0.3);
  }

  &:focus {
    outline: none;
  }
`;

/* NEW: Google login button */
export const GoogleButton = styled.button`
  margin-top: 12px;
  border-radius: 30px;
  border: 1.5px solid #4285f4; /* Google Blue */
  background-color: white;
  color: #4285f4;
  font-size: 14px;
  font-weight: 600;
  padding: 10px 40px;
  letter-spacing: 1px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  box-shadow: 0 2px 6px rgba(66, 133, 244, 0.4);
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #f5f5f5;
  }

  &:focus {
    outline: none;
  }
`;

export const GhostButton = styled(Button)`
  background: transparent;
  border: 2px solid #ffffff;
  color: #ffffff;
  box-shadow: none;

  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
    transform: translateY(-2px);
    box-shadow: 0 8px 18px rgba(255, 255, 255, 0.2);
  }

  &:active {
    transform: scale(0.97);
    box-shadow: 0 4px 10px rgba(255, 255, 255, 0.15);
  }
`;

export const Anchor = styled.a`
  color: #333;
  font-size: 14px;
  text-decoration: none;
  margin: 15px 0;
`;

export const OverlayContainer = styled.div`
  position: absolute;
  top: 0;
  left: 50%;
  width: 50%;
  height: 100%;
  overflow: hidden;
  transition: transform 0.6s ease-in-out;
  z-index: 100;

  ${props => props.$signinIn !== true && `transform: translateX(-100%);`}
`;

/* 🔵 Glossy blue overlay glass */
export const Overlay = styled.div`
  background: rgba(0, 64, 255, 0.4); /* Transparent blue */
  backdrop-filter: blur(12px); /* Glossy blur */
  -webkit-backdrop-filter: blur(12px);
  border-left: 1px solid rgba(255, 255, 255, 0.15);
  color: white;
  position: relative;
  left: -100%;
  height: 100%;
  width: 200%;
  transform: translateX(0);
  transition: transform 0.6s ease-in-out;

  ${props => props.$signinIn !== true && `transform: translateX(50%);`}
`;

export const OverlayPanel = styled.div`
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  padding: 0 00px;
  text-align: center;
  top: 0;
  height: 100%;
  width: 50%;
  transform: translateX(0);
  transition: transform 0.6s ease-in-out;
`;

export const LeftOverlayPanel = styled(OverlayPanel)`
  transform: translateX(-20%);
  ${props => props.$signinIn !== true && `transform: translateX(0);`}
`;

export const RightOverlayPanel = styled(OverlayPanel)`
  right: 0;
  transform: translateX(0);
  ${props => props.$signinIn !== true && `transform: translateX(20%);`}
`;

export const Paragraph = styled.p`
  font-size: 14px;
  font-weight: 100;
  line-height: 20px;
  letter-spacing: 0.5px;
  margin: 20px 0 30px;
  padding: 0 20px;
`;
