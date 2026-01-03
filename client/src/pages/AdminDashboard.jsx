import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

function AdminDashboard() {
    const [user, setUser] = useState(null);
    const [complaints, setComplaints] = useState([]);
    const [filteredComplaints, setFilteredComplaints] = useState([]);
    const [filters, setFilters] = useState({
        status: '',
        department: ''
    });
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (!userData) {
            navigate('/login');
        } else {
            const parsedUser = JSON.parse(userData);
            if (parsedUser.role !== 'admin') {
                navigate('/');
            } else {
                setUser(parsedUser);
                fetchComplaints();
            }
        }
    }, [navigate]);

    useEffect(() => {
        applyFilters();
    }, [filters, complaints]);

    const fetchComplaints = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/complaints');
            setComplaints(response.data);
            setFilteredComplaints(response.data);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching complaints:', err);
            setLoading(false);
        }
    };

    const applyFilters = () => {
        let filtered = [...complaints];

        if (filters.status) {
            filtered = filtered.filter(c => c.status === filters.status);
        }

        if (filters.department) {
            filtered = filtered.filter(c => c.department === filters.department);
        }

        setFilteredComplaints(filtered);
    };

    const handleFilterChange = (e) => {
        setFilters({
            ...filters,
            [e.target.name]: e.target.value
        });
    };

    const updateComplaintStatus = async (id, newStatus) => {
        try {
            await axios.put(`http://localhost:5000/api/complaints/${id}`, {
                status: newStatus
            });
            fetchComplaints();
        } catch (err) {
            console.error('Error updating complaint:', err);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/');
    };

    if (!user) return null;

    const stats = {
        total: complaints.length,
        pending: complaints.filter(c => c.status === 'Pending').length,
        inProgress: complaints.filter(c => c.status === 'In Progress').length,
        resolved: complaints.filter(c => c.status === 'Resolved').length
    };

    return (
        <div>
            {/* Navbar */}
            <nav className="navbar">
                <div className="container navbar-content">
                    <Link to="/" className="navbar-brand">🏙️ Smart City</Link>
                    <ul className="navbar-nav">
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
                                Logged in as <strong>Admin</strong>
                            </span>
                        </li>

                        <li><Link to="/admin" className="navbar-link">Dashboard</Link></li>
                        <li><button onClick={handleLogout} className="btn btn-secondary">Logout</button></li>
                    </ul>
                </div>
            </nav>

            {/* Main Content */}
            <div className="container" style={{ marginTop: '3rem', marginBottom: '3rem' }}>
                <h2>Admin Dashboard</h2>
                <p className="text-secondary mb-xl">Manage and track all city complaints</p>

                {/* Stats */}
                <div className="grid grid-4 mb-xl">
                    <div className="card text-center">
                        <h3 className="text-primary">{stats.total}</h3>
                        <p>Total Complaints</p>
                    </div>
                    <div className="card text-center">
                        <h3 className="text-warning">{stats.pending}</h3>
                        <p>Pending</p>
                    </div>
                    <div className="card text-center">
                        <h3 className="text-primary">{stats.inProgress}</h3>
                        <p>In Progress</p>
                    </div>
                    <div className="card text-center">
                        <h3 className="text-success">{stats.resolved}</h3>
                        <p>Resolved</p>
                    </div>
                </div>

                {/* Filters */}
                <div className="card mb-lg">
                    <h4 className="mb-md">Filters</h4>
                    <div className="grid grid-2">
                        <div className="form-group">
                            <label className="form-label">Status</label>
                            <select
                                name="status"
                                className="form-select"
                                value={filters.status}
                                onChange={handleFilterChange}
                            >
                                <option value="">All Statuses</option>
                                <option value="Pending">Pending</option>
                                <option value="In Progress">In Progress</option>
                                <option value="Resolved">Resolved</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Department</label>
                            <select
                                name="department"
                                className="form-select"
                                value={filters.department}
                                onChange={handleFilterChange}
                            >
                                <option value="">All Departments</option>
                                <option value="Sanitation">Sanitation</option>
                                <option value="Roads">Roads</option>
                                <option value="Water">Water</option>
                                <option value="Electricity">Electricity</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Complaints List */}
                {loading ? (
                    <div className="flex-center" style={{ padding: '3rem' }}>
                        <div className="spinner"></div>
                    </div>
                ) : filteredComplaints.length === 0 ? (
                    <div className="card text-center">
                        <p>No complaints found matching the filters.</p>
                    </div>
                ) : (
                    <div className="grid">
                        {filteredComplaints.map((complaint) => (
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

                                <div className="mt-md text-secondary" style={{ fontSize: '0.875rem' }}>
                                    👤 Reported by: {complaint.user?.username || 'Unknown'}
                                </div>

                                {/* Status Update Buttons */}
                                <div className="flex gap-sm mt-lg">
                                    {complaint.status !== 'Pending' && (
                                        <button
                                            className="btn btn-secondary"
                                            style={{ flex: 1 }}
                                            onClick={() => updateComplaintStatus(complaint._id, 'Pending')}
                                        >
                                            Mark Pending
                                        </button>
                                    )}
                                    {complaint.status !== 'In Progress' && (
                                        <button
                                            className="btn btn-primary"
                                            style={{ flex: 1 }}
                                            onClick={() => updateComplaintStatus(complaint._id, 'In Progress')}
                                        >
                                            Mark In Progress
                                        </button>
                                    )}
                                    {complaint.status !== 'Resolved' && (
                                        <button
                                            className="btn btn-success"
                                            style={{ flex: 1 }}
                                            onClick={() => updateComplaintStatus(complaint._id, 'Resolved')}
                                        >
                                            Mark Resolved
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default AdminDashboard;
