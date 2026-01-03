import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

function Home() {
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (userData) {
            setUser(JSON.parse(userData));
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        navigate('/');
    };

    return (
        <div>
            {/* Navbar */}
            <nav className="navbar">
                <div className="container navbar-content">
                    <Link to="/" className="navbar-brand">🏙️ Smart City</Link>
                    <ul className="navbar-nav">
                        {user ? (
                            <>
                                {/* Show Role Badge */}
                                <li style={{ display: 'flex', alignItems: 'center', marginRight: '1rem' }}>
                                    <span style={{
                                        background: 'var(--bg-tertiary)',
                                        padding: '0.25rem 0.75rem',
                                        borderRadius: '20px',
                                        fontSize: '0.875rem',
                                        color: 'var(--text-secondary)',
                                        border: '1px solid var(--border-color)'
                                    }}>
                                        Logged in as <strong>{user.role === 'admin' ? 'Admin' : 'Citizen'}</strong>
                                    </span>
                                </li>

                                {/* Citizen Links - Only show if NOT admin */}
                                {user.role !== 'admin' && (
                                    <>
                                        <li><Link to="/report" className="navbar-link">Report Issue</Link></li>
                                        <li><Link to="/my-complaints" className="navbar-link">My Complaints</Link></li>
                                    </>
                                )}

                                {/* Admin Links */}
                                {user.role === 'admin' && (
                                    <li><Link to="/admin" className="navbar-link">Dashboard</Link></li>
                                )}

                                <li><button onClick={handleLogout} className="btn btn-secondary">Logout</button></li>
                            </>
                        ) : (
                            <>
                                <li><Link to="/login" className="navbar-link">Login</Link></li>
                                <li><Link to="/register" className="btn btn-primary">Register</Link></li>
                            </>
                        )}
                    </ul>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="hero">
                <div className="container">
                    <h1>Make Your City Better</h1>
                    <p>Report city issues and track their resolution in real-time. Together, we can build a smarter, cleaner, and safer city.</p>
                    {user ? (
                        <Link to="/report" className="btn btn-primary" style={{
                            background: 'white',
                            color: 'var(--primary)',
                            fontSize: '1.125rem',
                            padding: '1rem 2rem'
                        }}>
                            Report an Issue
                        </Link>
                    ) : (
                        <Link to="/register" className="btn btn-primary" style={{
                            background: 'white',
                            color: 'var(--primary)',
                            fontSize: '1.125rem',
                            padding: '1rem 2rem'
                        }}>
                            Get Started
                        </Link>
                    )}
                </div>
            </section>

            {/* Features Section */}
            <section className="container" style={{ padding: '4rem 1.5rem' }}>
                <h2 className="text-center mb-xl">How It Works</h2>
                <div className="grid grid-3">
                    <div className="card text-center">
                        <div style={{ fontSize: '3rem', marginBottom: 'var(--spacing-md)' }}>📍</div>
                        <h3>Report Issues</h3>
                        <p>Easily report potholes, garbage, broken streetlights, and more with photos and location.</p>
                    </div>
                    <div className="card text-center">
                        <div style={{ fontSize: '3rem', marginBottom: 'var(--spacing-md)' }}>🔄</div>
                        <h3>Track Progress</h3>
                        <p>Monitor your complaint status in real-time from Pending to In Progress to Resolved.</p>
                    </div>
                    <div className="card text-center">
                        <div style={{ fontSize: '3rem', marginBottom: 'var(--spacing-md)' }}>✅</div>
                        <h3>Get Results</h3>
                        <p>City officials receive and act on your complaints, making your city better every day.</p>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section style={{ background: 'var(--bg-tertiary)', padding: '3rem 0' }}>
                <div className="container">
                    <div className="grid grid-3 text-center">
                        <div>
                            <h2 className="text-primary">1,234</h2>
                            <p>Issues Reported</p>
                        </div>
                        <div>
                            <h2 className="text-primary">892</h2>
                            <p>Issues Resolved</p>
                        </div>
                        <div>
                            <h2 className="text-primary">72%</h2>
                            <p>Resolution Rate</p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}

export default Home;
