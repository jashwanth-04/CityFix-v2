import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

function Register() {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [role, setRole] = useState('citizen'); // Default role
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        try {
            await axios.post('http://localhost:5000/api/auth/register', {
                username: formData.username,
                email: formData.email,
                password: formData.password,
                role: role
            });
            navigate('/login');
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed');
        }
    };

    return (
        <div className="container" style={{ maxWidth: '500px', marginTop: '3rem' }}>
            <div className="card">
                <h2 className="text-center">Register</h2>
                <p className="text-center text-secondary mb-lg">Create your Smart City account</p>

                {/* Role Selection Toggle */}
                <div className="flex gap-md mb-lg" style={{ background: 'var(--bg-tertiary)', padding: '0.5rem', borderRadius: 'var(--radius-md)' }}>
                    <button
                        type="button"
                        className={`btn ${role === 'citizen' ? 'btn-primary' : 'btn-secondary'}`}
                        style={{ flex: 1 }}
                        onClick={() => setRole('citizen')}
                    >
                        👤 Citizen
                    </button>
                    <button
                        type="button"
                        className={`btn ${role === 'admin' ? 'btn-primary' : 'btn-secondary'}`}
                        style={{ flex: 1 }}
                        onClick={() => setRole('admin')}
                    >
                        🔧 Admin
                    </button>
                </div>

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

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Username</label>
                        <input
                            type="text"
                            name="username"
                            className="form-input"
                            value={formData.username}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Email</label>
                        <input
                            type="email"
                            name="email"
                            className="form-input"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <input
                            type="password"
                            name="password"
                            className="form-input"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Confirm Password</label>
                        <input
                            type="password"
                            name="confirmPassword"
                            className="form-input"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                        Register as {role === 'citizen' ? 'Citizen' : 'Admin'}
                    </button>
                </form>

                <p className="text-center mt-lg">
                    Already have an account? <Link to="/login" className="text-primary">Login</Link>
                </p>
            </div>
        </div>
    );
}

export default Register;
