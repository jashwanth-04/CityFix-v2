import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

function ReportIssue() {
    const [user, setUser] = useState(null);
    const [formData, setFormData] = useState({
        description: '',
        department: 'Other',
        location: { lat: 40.7128, lng: -74.0060, address: '' }
    });
    const [photo, setPhoto] = useState(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (!userData) {
            navigate('/login');
        } else {
            setUser(JSON.parse(userData));
        }
    }, [navigate]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handlePhotoChange = (e) => {
        setPhoto(e.target.files[0]);
    };

    const handleLocationClick = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setFormData({
                        ...formData,
                        location: {
                            lat: position.coords.latitude,
                            lng: position.coords.longitude,
                            address: 'Current Location'
                        }
                    });
                },
                (error) => {
                    console.error('Error getting location:', error);
                }
            );
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess(false);

        const data = new FormData();
        data.append('user', user.id);
        data.append('description', formData.description);
        data.append('department', formData.department);
        data.append('location', JSON.stringify(formData.location));
        if (photo) {
            data.append('photo', photo);
        }

        try {
            await axios.post('http://localhost:5000/api/complaints', data, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            setSuccess(true);
            setTimeout(() => navigate('/my-complaints'), 2000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to submit complaint');
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
            <div className="container" style={{ maxWidth: '700px', marginTop: '3rem', marginBottom: '3rem' }}>
                <div className="card">
                    <h2>Report an Issue</h2>
                    <p className="text-secondary">Help us improve the city by reporting issues you encounter.</p>

                    {error && (
                        <div style={{
                            padding: '1rem',
                            background: 'hsl(0, 84%, 95%)',
                            color: 'hsl(0, 84%, 40%)',
                            borderRadius: 'var(--radius-md)',
                            marginBottom: 'var(--spacing-lg)'
                        }}>
                            {error}
                        </div>
                    )}

                    {success && (
                        <div style={{
                            padding: '1rem',
                            background: 'hsl(142, 71%, 95%)',
                            color: 'hsl(142, 71%, 30%)',
                            borderRadius: 'var(--radius-md)',
                            marginBottom: 'var(--spacing-lg)'
                        }}>
                            Complaint submitted successfully! Redirecting...
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label className="form-label">Department</label>
                            <select
                                name="department"
                                className="form-select"
                                value={formData.department}
                                onChange={handleChange}
                            >
                                <option value="Sanitation">Sanitation</option>
                                <option value="Roads">Roads</option>
                                <option value="Water">Water</option>
                                <option value="Electricity">Electricity</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Description</label>
                            <textarea
                                name="description"
                                className="form-textarea"
                                value={formData.description}
                                onChange={handleChange}
                                placeholder="Describe the issue in detail..."
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Photo (Optional)</label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handlePhotoChange}
                                className="form-input"
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Location</label>
                            <div className="flex gap-md" style={{ alignItems: 'center' }}>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={`${formData.location.lat.toFixed(4)}, ${formData.location.lng.toFixed(4)}`}
                                    readOnly
                                    style={{ flex: 1 }}
                                />
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={handleLocationClick}
                                >
                                    📍 Use Current Location
                                </button>
                            </div>
                            <small className="text-secondary">Click to use your current location or enter coordinates manually</small>
                        </div>

                        <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                            Submit Complaint
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default ReportIssue;
