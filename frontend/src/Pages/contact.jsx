const Contact = () => {
    return (
        <div style={{
            maxWidth: '800px',
            margin: '0 auto',
            padding: '2rem',
            background: '#f8f9fa',
            borderRadius: '12px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
            color: '#333'
        }}>
            <h1 style={{
                textAlign: 'center',
                fontSize: '2rem',
                fontWeight: '700',
                marginBottom: '1.5rem',
                color: '#2c3e50'
            }}>
                Contact Us
            </h1>

            <div style={{
                background: 'white',
                padding: '1.5rem',
                borderRadius: '8px',
                marginBottom: '2rem',
                boxShadow: '0 1px 4px rgba(0,0,0,0.05)'
            }}>
                <h2 style={{
                    fontSize: '1.5rem',
                    marginBottom: '1rem',
                    color: '#3498db'
                }}>
                    Customer Support
                </h2>
                <p style={{ marginBottom: '0.8rem' }}>
                    <strong>Email:</strong> eaglehub879@eaglehub.in<br />
                    <strong>Phone:</strong> +91-7208652975<br />
                    <strong>WhatsApp:</strong> +91-7208652975<br />
                    <strong>Hours:</strong> 9:00 AM – 8:00 PM, Monday to Saturday
                </p>
            </div>

            <div style={{
                background: '#e8f4fd',
                padding: '1.5rem',
                borderRadius: '8px',
                marginBottom: '2rem',
                boxShadow: '0 1px 4px rgba(0,0,0,0.05)'
            }}>
                <h2 style={{
                    fontSize: '1.5rem',
                    marginBottom: '1rem',
                    color: '#e67e22'
                }}>
                    Office Address
                </h2>
                <p style={{ marginBottom: '0.8rem' }}>
                    <strong>Headquarters:</strong><br />
                    Eagle Hub E-Commerce Pvt. Ltd.<br />
                    Parnaka, Vasai(W) - 401201<br />
                    India
                </p>
            </div>

            <div style={{
                background: '#f5f5f5',
                padding: '1.5rem',
                borderRadius: '8px',
                boxShadow: '0 1px 4px rgba(0,0,0,0.05)'
            }}>
                <h2 style={{
                    fontSize: '1.5rem',
                    marginBottom: '1rem',
                    color: '#9b59b6'
                }}>
                    Social Media
                </h2>
                <p style={{ marginBottom: '0.8rem' }}>
                    <strong>Instagram:</strong> @EagleHub<br />
                    <strong>Facebook:</strong> facebook.com/EagleHubofficial<br />
                    <strong>Twitter:</strong> @EagleHubofficial
                </p>
            </div>
        </div>
    );
};

export default Contact;
