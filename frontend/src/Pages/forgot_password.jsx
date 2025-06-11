import React, { useState } from 'react';
import axios from 'axios';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');
        try {
            const response = await axios.post('http://127.0.0.1:8000/forgot_password', { email });
            setMessage(response.data.message);
        } catch (err) {
            setError(err.response?.data?.error || 'Something went wrong');
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.overlay}></div>
            <form onSubmit={handleSubmit} style={styles.card}>
                <h2 style={styles.heading}>Forgot Your Password?</h2>
                <input
                    type="email"
                    placeholder="Enter registered email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={styles.input}
                    required
                />
                <button type="submit" style={styles.button}>Send Reset Link</button>
                {message && <p style={styles.success}>{message}</p>}
                {error && <p style={styles.error}>{error}</p>}
            </form>
        </div>
    );
}

const styles = {
    container: {
        backgroundImage: "url('https://images.unsplash.com/photo-1507525428034-b723cf961d3e')",
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        height: '100vh',
        width: '100vw',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden'
    },
    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        height: '100%',
        width: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.2)',
        zIndex: 0
    },
    card: {
        zIndex: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        backdropFilter: 'blur(10px)',
        padding: '3rem',
        borderRadius: '20px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
        border: '1px solid rgba(255, 255, 255, 0.3)',
        textAlign: 'center',
        width: '400px'
    },
    heading: {
        fontSize: '2rem',
        color: '#003366',
        marginBottom: '1.5rem'
    },
    input: {
        width: '100%',
        padding: '0.8rem',
        borderRadius: '12px',
        border: '1px solid #003366',
        marginBottom: '1.5rem',
        backgroundColor: 'rgba(255,255,255,0.2)',
        color: '#003366',
        fontSize: '1rem',
        outline: 'none'
    },
    button: {
        padding: '0.8rem 2rem',
        borderRadius: '50px',
        backgroundColor: '#4285f4',
        color: 'white',
        fontSize: '1rem',
        fontWeight: 'bold',
        border: '1px solid #003366',
        cursor: 'pointer',
        boxShadow: '0 4px 10px rgba(66, 133, 244, 0.3)',
        transition: 'transform 0.2s ease-in-out'
    },
    success: {
        marginTop: '1rem',
        color: 'green'
    },
    error: {
        marginTop: '1rem',
        color: 'red'
    }
};

// Add hover effect via CSS or a styled-components alternative
// or inline via event listeners if needed
