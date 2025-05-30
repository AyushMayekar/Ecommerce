import { Link } from 'react-router-dom'

const Navbar = () => {
    return (
        <nav style={{ padding: '1rem', borderBottom: '1px solid #ccc' }}>
            <h2 style={{ display: 'inline' }}>MyStore</h2>
            <div style={{ float: 'right' }}>
                <Link to="/" style={{ margin: '0 1rem' }}>Home</Link>
                <Link to="/products" style={{ margin: '0 1rem' }}>Products</Link>
                <Link to="/contact" style={{ margin: '0 1rem' }}>Contact</Link>
                <Link to="/policy" style={{ margin: '0 1rem' }}>Policy</Link>
            </div>
        </nav>
    )
}

export default Navbar
