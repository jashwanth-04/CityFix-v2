import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

function Login() {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
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
        console.log(`Attempting login as ${role}...`);

        try {
            const response = await axios.post('http://localhost:5000/api/auth/login', formData);
            const user = response.data.user;

            // Verify role matches
            if (user.role !== role) {
                setError(`Access denied. This account is not registered as a ${role}.`);
                return;
            }

            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(user));

            // Redirect based on role
            if (user.role === 'admin') {
                navigate('/admin');
            } else {
                navigate('/');
            }
        } catch (err) {
            console.error('Login error:', err);
            setError(err.response?.data?.message || 'Login failed');
        }
    };

    return (
        <div className="container" style={{ maxWidth: '500px', marginTop: '3rem' }}>
            <div className="card">
                <h2 className="text-center">Login</h2>
                <p className="text-center text-secondary mb-lg">Select your role to continue</p>

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

                    <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                        Login as {role === 'citizen' ? 'Citizen' : 'Admin'}
                    </button>
                </form>

                <p className="text-center mt-lg">
                    Don't have an account? <Link to="/register" className="text-primary">Register</Link>
                </p>
            </div>
        </div>
    );
}

export default Login;
