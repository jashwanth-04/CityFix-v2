import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

function MyComplaints() {
    const [user, setUser] = useState(null);
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (!userData) {
            navigate('/login');
        } else {
            setUser(JSON.parse(userData));
            fetchComplaints(JSON.parse(userData).id);
        }
    }, [navigate]);

    const fetchComplaints = async (userId) => {
        try {
            const response = await axios.get(`http://localhost:5000/api/complaints?userId=${userId}`);
            setComplaints(response.data);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching complaints:', err);
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/');
    };

    if (!user) return null;

    return (
        <div>
            {/* Navbar */}
            <nav className="navbar">
                <div className="container navbar-content">
                    <Link to="/" className="navbar-brand">🏙️ Smart City</Link>
                    <ul className="navbar-nav">
                        <li><Link to="/report" className="navbar-link">Report Issue</Link></li>
                        <li><Link to="/my-complaints" className="navbar-link">My Complaints</Link></li>
                        {user.role === 'admin' && (
                            <li><Link to="/admin" className="navbar-link">Dashboard</Link></li>
                        )}
                        <li><button onClick={handleLogout} className="btn btn-secondary">Logout</button></li>
                    </ul>
                </div>
            </nav>

            {/* Main Content */}
            <div className="container" style={{ marginTop: '3rem', marginBottom: '3rem' }}>
                <h2>My Complaints</h2>
                <p className="text-secondary mb-xl">Track the status of your reported issues</p>

                {loading ? (
                    <div className="flex-center" style={{ padding: '3rem' }}>
                        <div className="spinner"></div>
                    </div>
                ) : complaints.length === 0 ? (
                    <div className="card text-center">
                        <p>You haven't reported any issues yet.</p>
                        <Link to="/report" className="btn btn-primary mt-md">Report Your First Issue</Link>
                    </div>
                ) : (
                    <div className="grid">
                        {complaints.map((complaint) => (
                            <div key={complaint._id} className="card">
                                <div className="flex-between mb-md">
                                    <span className={`badge badge-${complaint.status === 'Pending' ? 'pending' :
                                            complaint.status === 'In Progress' ? 'progress' :
                                                'resolved'
                                        }`}>
                                        {complaint.status}
                                    </span>
                                    <span className="text-secondary" style={{ fontSize: '0.875rem' }}>
                                        {new Date(complaint.createdAt).toLocaleDateString()}
                                    </span>
                                </div>

                                <h4>{complaint.department}</h4>
                                <p>{complaint.description}</p>

                                {complaint.photo && (
                                    <img
                                        src={`http://localhost:5000/${complaint.photo}`}
                                        alt="Issue"
                                        style={{
                                            width: '100%',
                                            borderRadius: 'var(--radius-md)',
                                            marginTop: 'var(--spacing-md)'
                                        }}
                                    />
                                )}

                                <div className="mt-md text-secondary" style={{ fontSize: '0.875rem' }}>
                                    📍 {complaint.location.address || `${complaint.location.lat.toFixed(4)}, ${complaint.location.lng.toFixed(4)}`}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default MyComplaints;
