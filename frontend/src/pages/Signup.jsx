import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Footer from '../components/Footer';
import { API_BASE_URL } from '../config';
import './Login.css';

const Signup = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [otp, setOtp] = useState('');
    const [showOtpInput, setShowOtpInput] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const [resendTimer, setResendTimer] = useState(0);
    const navigate = useNavigate();
    const { login } = useAuth();

    useEffect(() => {
        let interval;
        if (resendTimer > 0) {
            interval = setInterval(() => {
                setResendTimer((prev) => prev - 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [resendTimer]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        if (error) setError('');
    };

    const handleSendOtp = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match!');
            return;
        }

        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters long');
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(`${API_BASE_URL}/auth/send-otp`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    password: formData.password
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to send OTP');
            }

            setShowOtpInput(true);
            setSuccess('OTP sent to your email. Please check your inbox.');
            setResendTimer(60);
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: formData.email,
                    otp: otp
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Verification failed');
            }

            // Store token and user info using auth context
            login(data.user, data.token);

            // Navigate to home page
            navigate('/');
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleResendOtp = async () => {
        if (resendTimer > 0) return;

        setError('');
        setSuccess('');
        setLoading(true);

        try {
            const response = await fetch(`${API_BASE_URL}/auth/send-otp`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    password: formData.password
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to resend OTP');
            }

            setSuccess('A new OTP has been sent to your email.');
            setResendTimer(60);
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div className="auth-container">
                <div className="auth-card">
                    <h1 className="auth-title">
                        {showOtpInput ? 'Verify Email' : 'Create Account'}
                    </h1>
                    <p className="auth-subtitle">
                        {showOtpInput
                            ? `We've sent a 6-digit code to ${formData.email}`
                            : 'Join our community of food lovers'
                        }
                    </p>

                    {error && <div className="error-message">{error}</div>}
                    {success && <div className="success-message" style={{
                        backgroundColor: 'rgba(52, 168, 83, 0.1)',
                        color: '#34A853',
                        padding: '10px',
                        borderRadius: '5px',
                        marginBottom: '15px',
                        fontSize: '0.9rem',
                        textAlign: 'center'
                    }}>{success}</div>}

                    {!showOtpInput ? (
                        <form onSubmit={handleSendOtp} className="auth-form">
                            <div className="form-group">
                                <label htmlFor="name">Full Name</label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="John Doe"
                                    required
                                    disabled={loading}
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="email">Email Address</label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="your@email.com"
                                    required
                                    disabled={loading}
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="password">Password</label>
                                <input
                                    type="password"
                                    id="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="Create a strong password"
                                    required
                                    disabled={loading}
                                />
                                <small className="form-hint">At least 6 characters with 1 number</small>
                            </div>

                            <div className="form-group">
                                <label htmlFor="confirmPassword">Confirm Password</label>
                                <input
                                    type="password"
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    placeholder="Confirm your password"
                                    required
                                    disabled={loading}
                                />
                            </div>

                            <button type="submit" className="auth-button" disabled={loading}>
                                {loading ? 'Sending OTP...' : 'Sign Up'}
                            </button>

                            <div className="divider">
                                <span>OR</span>
                            </div>

                            <button
                                onClick={() => window.location.href = `${API_BASE_URL}/auth/google`}
                                className="google-button"
                                type="button"
                                disabled={loading}
                            >
                                <svg width="18" height="18" viewBox="0 0 18 18">
                                    <path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.18z" />
                                    <path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2.01a4.8 4.8 0 0 1-7.18-2.54H1.83v2.07A8 8 0 0 0 8.98 17z" />
                                    <path fill="#FBBC05" d="M4.5 10.52A4.8 4.8 0 0 1 4.5 7.48V5.41H1.83a8 8 0 0 0 0 7.18l2.67-2.07z" />
                                    <path fill="#EA4335" d="M8.98 4.18c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 0 0 1.83 5.4L4.5 7.49a4.77 4.77 0 0 1 4.48-3.3z" />
                                </svg>
                                Continue with Google
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleVerifyOtp} className="auth-form">
                            <div className="form-group">
                                <label htmlFor="otp">Enter 6-Digit OTP</label>
                                <input
                                    type="text"
                                    id="otp"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                    placeholder="000000"
                                    required
                                    maxLength="6"
                                    style={{ textAlign: 'center', fontSize: '1.5rem', letterSpacing: '5px' }}
                                    disabled={loading}
                                />
                            </div>

                            <button type="submit" className="auth-button" disabled={loading || otp.length !== 6}>
                                {loading ? 'Verifying...' : 'Verify & Create Account'}
                            </button>

                            <div className="auth-footer" style={{ marginTop: '1.5rem' }}>
                                <p>
                                    Didn't receive the code?{' '}
                                    {resendTimer > 0 ? (
                                        <span style={{ color: '#777' }}>Resend in {resendTimer}s</span>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={handleResendOtp}
                                            className="auth-link"
                                            style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', font: 'inherit' }}
                                            disabled={loading}
                                        >
                                            Resend OTP
                                        </button>
                                    )}
                                </p>
                                <button
                                    type="button"
                                    onClick={() => { setShowOtpInput(false); setOtp(''); setError(''); setSuccess(''); }}
                                    className="auth-link"
                                    style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', font: 'inherit', marginTop: '10px' }}
                                    disabled={loading}
                                >
                                    ← Back to Sign Up
                                </button>
                            </div>
                        </form>
                    )}

                    {!showOtpInput && (
                        <div className="auth-footer">
                            <p>Already have an account? <Link to="/login" className="auth-link">Sign In</Link></p>
                        </div>
                    )}
                </div>
            </div>

            <Footer />
        </>
    );
};

export default Signup;
