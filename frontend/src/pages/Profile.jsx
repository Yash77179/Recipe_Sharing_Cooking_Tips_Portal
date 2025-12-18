import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import RecipeCard from '../components/RecipeCard';
import './Profile.css';

const Profile = () => {
    const [profileData, setProfileData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [passwordStatus, setPasswordStatus] = useState({ hasPassword: false, hasGoogleAuth: false });
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [passwordForm, setPasswordForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [passwordError, setPasswordError] = useState('');
    const [passwordSuccess, setPasswordSuccess] = useState('');
    const [passwordLoading, setPasswordLoading] = useState(false);
    const navigate = useNavigate();
    const { logout } = useAuth();

    useEffect(() => {
        fetchProfile();
        fetchPasswordStatus();
    }, []);

    const fetchProfile = async () => {
        const token = localStorage.getItem('token');

        if (!token) {
            navigate('/login');
            return;
        }

        try {
            const response = await fetch('http://localhost:5001/api/auth/profile', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            // Check if response is JSON
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                throw new Error('Server error: Invalid response format. Please try again.');
            }

            const data = await response.json();

            if (!response.ok) {
                if (response.status === 401) {
                    logout();
                    navigate('/login');
                    return;
                }
                throw new Error(data.message || 'Failed to fetch profile');
            }

            setProfileData(data);
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchPasswordStatus = async () => {
        const token = localStorage.getItem('token');
        if (!token) return;

        try {
            const response = await fetch('http://localhost:5001/api/auth/password-status', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            // Check if response is JSON
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                console.error('Invalid response format from password-status endpoint');
                return;
            }

            const data = await response.json();
            if (response.ok) {
                setPasswordStatus(data);
            }
        } catch (error) {
            console.error('Error fetching password status:', error);
        }
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        setPasswordError('');
        setPasswordSuccess('');
        setPasswordLoading(true);

        const token = localStorage.getItem('token');

        // Validation
        if (!passwordStatus.hasPassword) {
            // Setting password for the first time
            if (!passwordForm.newPassword || !passwordForm.confirmPassword) {
                setPasswordError('Please fill in all fields');
                setPasswordLoading(false);
                return;
            }
            if (passwordForm.newPassword !== passwordForm.confirmPassword) {
                setPasswordError('Passwords do not match');
                setPasswordLoading(false);
                return;
            }
            if (passwordForm.newPassword.length < 6) {
                setPasswordError('Password must be at least 6 characters long');
                setPasswordLoading(false);
                return;
            }
            if (!/\d/.test(passwordForm.newPassword)) {
                setPasswordError('Password must contain at least one number');
                setPasswordLoading(false);
                return;
            }

            try {
                const response = await fetch('http://localhost:5001/api/auth/set-password', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                    body: JSON.stringify({ password: passwordForm.newPassword }),
                });

                // Check if response is JSON
                const contentType = response.headers.get('content-type');
                if (!contentType || !contentType.includes('application/json')) {
                    throw new Error('Server error: Invalid response format. Please try again.');
                }

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || 'Failed to set password');
                }

                setPasswordSuccess('Password set successfully! You can now login with email and password.');
                setPasswordStatus({ ...passwordStatus, hasPassword: true });
                setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
                setTimeout(() => {
                    setShowPasswordModal(false);
                    setPasswordSuccess('');
                }, 2000);
            } catch (error) {
                setPasswordError(error.message);
            } finally {
                setPasswordLoading(false);
            }
        } else {
            // Changing existing password
            if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
                setPasswordError('Please fill in all fields');
                setPasswordLoading(false);
                return;
            }
            if (passwordForm.newPassword !== passwordForm.confirmPassword) {
                setPasswordError('New passwords do not match');
                setPasswordLoading(false);
                return;
            }
            if (passwordForm.newPassword.length < 6) {
                setPasswordError('Password must be at least 6 characters long');
                setPasswordLoading(false);
                return;
            }
            if (!/\d/.test(passwordForm.newPassword)) {
                setPasswordError('Password must contain at least one number');
                setPasswordLoading(false);
                return;
            }

            try {
                const response = await fetch('http://localhost:5001/api/auth/change-password', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        currentPassword: passwordForm.currentPassword,
                        newPassword: passwordForm.newPassword
                    }),
                });

                // Check if response is JSON
                const contentType = response.headers.get('content-type');
                if (!contentType || !contentType.includes('application/json')) {
                    throw new Error('Server error: Invalid response format. Please try again.');
                }

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || 'Failed to change password');
                }

                setPasswordSuccess('Password changed successfully!');
                setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
                setTimeout(() => {
                    setShowPasswordModal(false);
                    setPasswordSuccess('');
                }, 2000);
            } catch (error) {
                setPasswordError(error.message);
            } finally {
                setPasswordLoading(false);
            }
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    if (loading) {
        return (
            <div className="profile-container">
                <div className="loading">Loading profile...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="profile-container">
                <div className="error-message">{error}</div>
            </div>
        );
    }

    return (
        <div className="profile-container">
            <div className="profile-header">
                <div className="profile-info-card">
                    <div className="profile-avatar">
                        {profileData?.user.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="profile-details">
                        <h1 className="profile-name">{profileData?.user.name}</h1>
                        <p className="profile-email">{profileData?.user.email}</p>
                        <div className="profile-stats">
                            <div className="stat-item">
                                <span className="stat-number">{profileData?.recipeCount || 0}</span>
                                <span className="stat-label">Recipes Shared</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-number">
                                    {profileData?.user.createdAt ?
                                        new Date(profileData.user.createdAt).toLocaleDateString('en-US', {
                                            month: 'short',
                                            year: 'numeric'
                                        })
                                        : 'N/A'}
                                </span>
                                <span className="stat-label">Member Since</span>
                            </div>
                        </div>
                    </div>
                    <div className="profile-actions">
                        <button
                            onClick={() => setShowPasswordModal(true)}
                            className="password-button"
                        >
                            {passwordStatus.hasPassword ? '🔒 Change Password' : '🔐 Set Password'}
                        </button>
                        <button onClick={handleLogout} className="logout-button">
                            Logout
                        </button>
                    </div>
                </div>
            </div>

            {/* Password Modal */}
            {showPasswordModal && (
                <div className="modal-overlay" onClick={() => setShowPasswordModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{passwordStatus.hasPassword ? 'Change Password' : 'Set Password'}</h2>
                            <button
                                className="modal-close"
                                onClick={() => {
                                    setShowPasswordModal(false);
                                    setPasswordError('');
                                    setPasswordSuccess('');
                                    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
                                }}
                            >
                                ×
                            </button>
                        </div>
                        <form onSubmit={handlePasswordSubmit} className="password-form">
                            {passwordStatus.hasPassword && (
                                <div className="form-group">
                                    <label htmlFor="currentPassword">Current Password</label>
                                    <input
                                        type="password"
                                        id="currentPassword"
                                        value={passwordForm.currentPassword}
                                        onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                                        placeholder="Enter current password"
                                        disabled={passwordLoading}
                                    />
                                </div>
                            )}
                            <div className="form-group">
                                <label htmlFor="newPassword">New Password</label>
                                <input
                                    type="password"
                                    id="newPassword"
                                    value={passwordForm.newPassword}
                                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                                    placeholder="Enter new password"
                                    disabled={passwordLoading}
                                />
                                <small className="form-hint">At least 6 characters with 1 number</small>
                            </div>
                            <div className="form-group">
                                <label htmlFor="confirmPassword">Confirm Password</label>
                                <input
                                    type="password"
                                    id="confirmPassword"
                                    value={passwordForm.confirmPassword}
                                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                                    placeholder="Confirm new password"
                                    disabled={passwordLoading}
                                />
                            </div>
                            {passwordError && <div className="error-message">{passwordError}</div>}
                            {passwordSuccess && <div className="success-message">{passwordSuccess}</div>}
                            <button
                                type="submit"
                                className="submit-button"
                                disabled={passwordLoading}
                            >
                                {passwordLoading ? 'Processing...' : (passwordStatus.hasPassword ? 'Change Password' : 'Set Password')}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            <div className="profile-content">
                <div className="section-header">
                    <h2>My Recipes</h2>
                    <Link to="/add" className="add-recipe-link">
                        + Add New Recipe
                    </Link>
                </div>

                {profileData?.recipes && profileData.recipes.length > 0 ? (
                    <div className="recipes-grid">
                        {profileData.recipes.map((recipe) => (
                            <RecipeCard key={recipe._id} recipe={recipe} />
                        ))}
                    </div>
                ) : (
                    <div className="no-recipes">
                        <p>You haven't shared any recipes yet!</p>
                        <Link to="/add" className="start-sharing-button">
                            Share Your First Recipe
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Profile;
