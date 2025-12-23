import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config';
import './SetPassword.css';

const SetPassword = () => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const navigate = useNavigate();
    const { user, token, updateUser } = useAuth();

    // Redirect if password is already set
    useEffect(() => {
        if (!user) {
            // No user logged in, redirect to login
            navigate('/login', { replace: true });
            return;
        }

        if (user.passwordSet === true) {
            // Password already set, redirect to home
            navigate('/', { replace: true });
        }
    }, [user, navigate]);

    const validatePassword = (pwd) => {
        if (pwd.length < 6) {
            return 'Password must be at least 6 characters long';
        }
        if (!/(?=.*[a-z])/.test(pwd)) {
            return 'Password must contain at least one lowercase letter';
        }
        if (!/(?=.*[A-Z])/.test(pwd)) {
            return 'Password must contain at least one uppercase letter';
        }
        if (!/(?=.*\d)/.test(pwd)) {
            return 'Password must contain at least one number';
        }
        return null;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Validation
        const passwordError = validatePassword(password);
        if (passwordError) {
            setError(passwordError);
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(`${API_BASE_URL}/auth/set-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ password })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to set password');
            }

            // Update user in context with passwordSet: true
            const updatedUser = data.user ? data.user : { ...user, passwordSet: true };
            updateUser(updatedUser);

            // Success - redirect to home
            navigate('/', { replace: true });
        } catch (err) {
            setError(err.message || 'Error setting password. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const getPasswordStrength = () => {
        if (!password) return null;

        let strength = 0;
        if (password.length >= 6) strength++;
        if (password.length >= 10) strength++;
        if (/[a-z]/.test(password)) strength++;
        if (/[A-Z]/.test(password)) strength++;
        if (/\d/.test(password)) strength++;
        if (/[^a-zA-Z0-9]/.test(password)) strength++;

        if (strength <= 2) return { text: 'Weak', className: 'weak' };
        if (strength <= 4) return { text: 'Medium', className: 'medium' };
        return { text: 'Strong', className: 'strong' };
    };

    const passwordStrength = getPasswordStrength();

    return (
        <div className="set-password-container">
            <div className="set-password-card">
                <div className="set-password-header">
                    <h1>🔐 Secure Your Account</h1>
                    <p>Welcome, <strong>{user?.name}</strong>! Please set a password to secure your account.</p>
                </div>

                <form onSubmit={handleSubmit} className="set-password-form">
                    {error && <div className="error-message">{error}</div>}

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <div className="password-input-wrapper">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter your password"
                                required
                            />
                            <button
                                type="button"
                                className="toggle-password"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? '👁️' : '👁️‍🗨️'}
                            </button>
                        </div>
                        {passwordStrength && (
                            <div className={`password-strength ${passwordStrength.className}`}>
                                <div className="strength-bar"></div>
                                <span className="strength-text">{passwordStrength.text}</span>
                            </div>
                        )}
                    </div>

                    <div className="form-group">
                        <label htmlFor="confirmPassword">Confirm Password</label>
                        <div className="password-input-wrapper">
                            <input
                                type={showConfirmPassword ? 'text' : 'password'}
                                id="confirmPassword"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Confirm your password"
                                required
                            />
                            <button
                                type="button"
                                className="toggle-password"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            >
                                {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                            </button>
                        </div>
                    </div>

                    <div className="password-requirements">
                        <h4>Password Requirements:</h4>
                        <ul>
                            <li className={password.length >= 6 ? 'valid' : ''}>
                                {password.length >= 6 ? '✓' : '○'} At least 6 characters
                            </li>
                            <li className={/[a-z]/.test(password) ? 'valid' : ''}>
                                {/[a-z]/.test(password) ? '✓' : '○'} One lowercase letter
                            </li>
                            <li className={/[A-Z]/.test(password) ? 'valid' : ''}>
                                {/[A-Z]/.test(password) ? '✓' : '○'} One uppercase letter
                            </li>
                            <li className={/\d/.test(password) ? 'valid' : ''}>
                                {/\d/.test(password) ? '✓' : '○'} One number
                            </li>
                        </ul>
                    </div>

                    <button
                        type="submit"
                        className="submit-button"
                        disabled={loading}
                    >
                        {loading ? 'Setting Password...' : 'Set Password & Continue'}
                    </button>
                </form>

                <div className="set-password-footer">
                    <p>This is a one-time setup to secure your account for future logins.</p>
                </div>
            </div>
        </div>
    );
};

export default SetPassword;
