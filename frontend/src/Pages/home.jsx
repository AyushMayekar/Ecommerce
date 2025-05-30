const Home = () => {
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
                fontSize: '2.5rem',
                fontWeight: '700',
                marginBottom: '1rem',
                color: '#2c3e50'
            }}>
                Welcome to MyStore
            </h1>
            <p style={{
                textAlign: 'center',
                fontSize: '1.2rem',
                marginBottom: '2rem',
                color: '#555'
            }}>
                Your one-stop shop for quality products at competitive rates.
            </p>

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
                    Why Choose Us?
                </h2>
                <ul style={{
                    paddingLeft: '1.5rem',
                    listStyleType: 'disc'
                }}>
                    <li>Premium quality products from trusted brands</li>
                    <li>Fast, reliable shipping across the country</li>
                    <li>24/7 customer support for all your needs</li>
                    <li>Easy returns and hassle-free refunds</li>
                </ul>
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
                    Hot Deals
                </h2>
                <ul style={{
                    paddingLeft: '1.5rem',
                    listStyleType: 'disc'
                }}>
                    <li>35% off on all electronics this weekend only!</li>
                    <li>Buy one, get one free on select home essentials</li>
                    <li>Free shipping on orders over ₹1000</li>
                    <li>Limited time: Extra 10% off for new customers</li>
                </ul>
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
                    Advertisement
                </h2>
                <p>
                    Don’t miss our exclusive loyalty program—earn points with every purchase and unlock special rewards!
                </p>
            </div>
        </div>
    );
};

export default Home;
