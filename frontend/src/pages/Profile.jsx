import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import RecipeCard from '../components/RecipeCard';
import SuggestionsWidget from '../components/SuggestionsWidget';
import { motion, AnimatePresence } from 'framer-motion';
import './Profile.css';

/**
 * Profile Page Component
 * Redesigned to feature a full-width gradient banner, single-column layout,
 * and floating recommendations widget. Displays user stats, favorites, and shared recipes.
 */
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
    const [activeTab, setActiveTab] = useState('recipes');

    const handleFavoriteToggle = (recipe, isLiked) => {
        setProfileData(prevData => {
            const currentFavorites = prevData.user.favorites || [];
            let newFavorites;

            if (isLiked) {
                // Add to favorites (check for duplicates just in case)
                if (!currentFavorites.some(f => (f._id || f) === recipe._id)) {
                    newFavorites = [recipe, ...currentFavorites];
                } else {
                    newFavorites = currentFavorites;
                }
            } else {
                // Remove from favorites
                newFavorites = currentFavorites.filter(fav =>
                    (typeof fav === 'string' ? fav : fav._id) !== recipe._id
                );
            }

            return {
                ...prevData,
                user: {
                    ...prevData.user,
                    favorites: newFavorites
                }
            };
        });
    };
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
            console.log('Profile Data:', data); // Debug log

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
            {/* Banner Header */}
            <div className="profile-info-card">
                <div className="profile-header-content">
                    <div className="profile-avatar">
                        {profileData?.user.photo ? (
                            <img
                                src={profileData.user.photo}
                                alt={profileData.user.name}
                                style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
                            />
                        ) : (
                            profileData?.user.name.charAt(0).toUpperCase()
                        )}
                    </div>
                    <div className="profile-details">
                        <div className="profile-name-row">
                            <h1 className="profile-name">{profileData?.user.name}</h1>
                            <span className="pro-badge">MEMBER</span>
                        </div>
                        <p className="profile-email">{profileData?.user.email}</p>
                        <div className="profile-stats">
                            <div className="stat-item">
                                <span className="stat-number">
                                    {profileData?.recipeCount || 0} <span className="stat-icon">🍳</span>
                                </span>
                                <span className="stat-label">Recipes Shared</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-number">
                                    {profileData?.user.favorites?.length || 0} <span className="stat-icon">♡</span>
                                </span>
                                <span className="stat-label">Favorites</span>
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

            {/* Password Modal (kept same logic, just insuring it renders) */}
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

            {/* Main Content Area */}
            <div className="profile-content">
                <div className="tabs-header">
                    <button
                        className={`tab-btn ${activeTab === 'recipes' ? 'active' : ''}`}
                        onClick={() => setActiveTab('recipes')}
                    >
                        My Recipes
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'favorites' ? 'active' : ''}`}
                        onClick={() => setActiveTab('favorites')}
                    >
                        My Favorites
                    </button>
                </div>

                {activeTab === 'recipes' ? (
                    <div className="recipes-grid">
                        <Link to="/add" className="add-new-card">
                            <span style={{ fontSize: '3rem', marginBottom: '1rem' }}>+</span>
                            <span>Add New Recipe</span>
                        </Link>
                        {profileData?.recipes && profileData.recipes.map((recipe) => (
                            <RecipeCard
                                key={recipe._id}
                                recipe={recipe}
                                onToggle={handleFavoriteToggle}
                            />
                        ))}
                    </div>
                ) : (
                    <motion.div className="recipes-grid" layout>
                        <AnimatePresence mode="popLayout">
                            {profileData?.user?.favorites && profileData.user.favorites.length > 0 ? (
                                profileData.user.favorites.map((recipe) => (
                                    typeof recipe === 'object' ? (
                                        <motion.div
                                            key={recipe._id}
                                            layout
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.3 } }}
                                        >
                                            <RecipeCard
                                                recipe={recipe}
                                                onToggle={handleFavoriteToggle}
                                            />
                                        </motion.div>
                                    ) : null
                                ))
                            ) : (
                                <div className="no-recipes">
                                    <p>You haven't added any favorites yet!</p>
                                    <Link to="/recipes" className="start-sharing-button">
                                        Explore Recipes
                                    </Link>
                                </div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                )}
            </div>

            {/* Draggable Floating Recommendations */}
            <motion.div
                className="floating-recommendations"
                drag
                dragMomentum={false}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
            >
                <div className="floating-header">
                    <span>Recommended For You</span>
                    <span className="drag-handle">✥</span>
                </div>
                <SuggestionsWidget />
            </motion.div>
        </div>
    );
};

export default Profile;
