import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import RecipeCard from '../components/RecipeCard';
import ProfileSidebar from '../components/ProfileSidebar';
import { FiLock, FiCheckCircle, FiUser, FiSettings } from 'react-icons/fi';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';
import MealSelectionModal from '../components/MealSelectionModal';

import { motion, AnimatePresence } from 'framer-motion';
import { BACKEND_URL, API_BASE_URL } from '../config';
import './Profile.css';

// Helper function to get full image URL
const getImageUrl = (path) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    return `${BACKEND_URL}${path}`;
};

/**
 * Profile Page Component - Bento Dashboard Revamp
 */
const Profile = () => {
    const { isDarkMode, toggleTheme } = useTheme();
    const [profileData, setProfileData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('overview'); // Default to overview
    const [profileImage, setProfileImage] = useState(null);
    const [bannerImage, setBannerImage] = useState(null);
    const [profileImagePreview, setProfileImagePreview] = useState(null);
    const [bannerImagePreview, setBannerImagePreview] = useState(null);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [recipeToDelete, setRecipeToDelete] = useState(null);

    // Password Management State
    const [passwordStatus, setPasswordStatus] = useState({ hasPassword: true });
    const [passwordForm, setPasswordForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [passwordError, setPasswordError] = useState('');
    const [passwordSuccess, setPasswordSuccess] = useState('');
    const [passwordLoading, setPasswordLoading] = useState(false);

    // Preferences State
    const [preferences, setPreferences] = useState({
        emailNotifications: true,
        pushNotifications: false,
        weeklyDigest: true,
        darkMode: isDarkMode,
        language: 'en',
        measurementSystem: 'metric'
    });

    // Profile Form State
    const [profileForm, setProfileForm] = useState({
        name: '',
        bio: '',
        location: '',
        website: ''
    });
    const [profileUpdateLoading, setProfileUpdateLoading] = useState(false);
    const [profileUpdateError, setProfileUpdateError] = useState('');
    const [profileUpdateSuccess, setProfileUpdateSuccess] = useState('');

    // Mock Data for "Extended" Profile feel
    const [mockStats] = useState({
        views: 12450,
        followers: 856,
        following: 124,
        avgRating: 4.8
    });

    const navigate = useNavigate();
    const { logout } = useAuth();

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchData = async (endpoint) => {
        const token = localStorage.getItem('token');
        if (!token) return null;
        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            return response.ok ? await response.json() : null;
        } catch (e) {
            console.error(e);
            return null;
        }
    };

    const fetchProfile = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }
        try {
            const response = await fetch(`${API_BASE_URL}/auth/profile`, {
                headers: { 'Authorization': `Bearer ${token}` },
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message);
            setProfileData(data);

            // Initialize profile form with current data
            setProfileForm({
                name: data.user.name || '',
                bio: data.user.bio || 'Culinary Enthusiast & Food Explorer',
                location: data.user.location || 'New York, USA',
                website: data.user.website || ''
            });
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    // Profile Update Handler
    const handleSaveProfile = async () => {
        setProfileUpdateLoading(true);
        setProfileUpdateError('');
        setProfileUpdateSuccess('');

        const token = localStorage.getItem('token');

        try {
            const response = await fetch(`${API_BASE_URL}/auth/update-profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(profileForm)
            });

            const data = await response.json();

            if (response.ok) {
                setProfileUpdateSuccess('Profile updated successfully!');
                // Update local profile data
                setProfileData(prev => ({
                    ...prev,
                    user: {
                        ...prev.user,
                        ...profileForm
                    }
                }));

                // Clear success message after 3 seconds
                setTimeout(() => setProfileUpdateSuccess(''), 3000);
            } else {
                setProfileUpdateError(data.message || 'Failed to update profile');
            }
        } catch (error) {
            setProfileUpdateError('Error updating profile. Please try again.');
        } finally {
            setProfileUpdateLoading(false);
        }
    };

    const handleCancelProfile = () => {
        // Reset form to current profile data
        setProfileForm({
            name: profileData?.user.name || '',
            bio: profileData?.user.bio || 'Culinary Enthusiast & Food Explorer',
            location: profileData?.user.location || 'New York, USA',
            website: profileData?.user.website || ''
        });
        setProfileUpdateError('');
        setProfileUpdateSuccess('');
    };

    // Password Management Handler
    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        setPasswordError('');
        setPasswordSuccess('');

        // Validation
        if (passwordStatus.hasPassword && !passwordForm.currentPassword) {
            setPasswordError('Current password is required');
            return;
        }
        if (!passwordForm.newPassword || passwordForm.newPassword.length < 6) {
            setPasswordError('New password must be at least 6 characters');
            return;
        }
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            setPasswordError('Passwords do not match');
            return;
        }

        setPasswordLoading(true);
        const token = localStorage.getItem('token');

        try {
            const response = await fetch(`${API_BASE_URL}/auth/update-password`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    currentPassword: passwordForm.currentPassword,
                    newPassword: passwordForm.newPassword
                })
            });

            const data = await response.json();

            if (response.ok) {
                setPasswordSuccess('Password updated successfully!');
                setPasswordForm({
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: ''
                });
            } else {
                setPasswordError(data.message || 'Failed to update password');
            }
        } catch (error) {
            setPasswordError('Error updating password. Please try again.');
        } finally {
            setPasswordLoading(false);
        }
    };

    // Profile Image Handler
    const handleProfileImageChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            // Show preview immediately
            setProfileImagePreview(URL.createObjectURL(file));

            // Upload immediately
            const formData = new FormData();
            formData.append('profileImage', file);

            const token = localStorage.getItem('token');

            try {
                const response = await fetch(`${API_BASE_URL}/auth/upload-profile-picture`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    },
                    body: formData
                });

                const data = await response.json();

                if (response.ok) {
                    setProfileData(prev => ({
                        ...prev,
                        user: {
                            ...prev.user,
                            photo: data.photoUrl
                        }
                    }));
                } else {
                    console.error('Failed to upload profile image:', data.message);
                }
            } catch (error) {
                console.error('Error uploading profile image:', error);
            }
        }
    };

    // Banner Image Handler
    const handleBannerImageChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            // Show preview immediately
            setBannerImagePreview(URL.createObjectURL(file));

            // Upload immediately
            const formData = new FormData();
            formData.append('bannerImage', file);

            const token = localStorage.getItem('token');

            try {
                const response = await fetch(`${API_BASE_URL}/auth/upload-banner`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    },
                    body: formData
                });

                const data = await response.json();

                if (response.ok) {
                    setProfileData(prev => ({
                        ...prev,
                        user: {
                            ...prev.user,
                            bannerImage: data.bannerUrl
                        }
                    }));
                } else {
                    console.error('Failed to upload banner image:', data.message);
                }
            } catch (error) {
                console.error('Error uploading banner image:', error);
            }
        }
    };

    // Preferences Handler
    const handlePreferenceChange = (key, value) => {
        setPreferences(prev => ({
            ...prev,
            [key]: value
        }));
        
        // If dark mode is toggled, update the theme context immediately
        if (key === 'darkMode') {
            if (value !== isDarkMode) {
                toggleTheme();
            }
        }
    };

    const handleSavePreferences = async () => {
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`${API_BASE_URL}/auth/preferences`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(preferences)
            });

            if (response.ok) {
                alert('Preferences saved successfully!');
            } else {
                alert('Failed to save preferences');
            }
        } catch (error) {
            console.error('Error saving preferences:', error);
            alert('Error saving preferences');
        }
    };

    // --- Render Helpers ---

    const renderOverview = () => (
        <div className="bento-grid">
            {/* Hero Cell: Main Profile Info */}
            <div className="bento-item profile-card-main">
                <div className="bento-banner">
                    <img
                        src={bannerImagePreview || getImageUrl(profileData?.user.bannerImage) || "https://images.unsplash.com/photo-1495195134817-aeb325a55b65?w=1200&h=300&fit=crop"}
                        alt="Banner"
                        className="cell-banner-img"
                    />
                </div>
                <div className="hero-content">
                    <div className="hero-avatar">
                        <img
                            src={profileImagePreview || getImageUrl(profileData?.user.photo)}
                            alt={profileData?.user.name}
                            className="cell-avatar-img"
                        />
                    </div>
                    <div className="hero-text">
                        <h1>{profileData?.user.name}</h1>
                        <p className="user-bio">{profileData?.user.bio || "Culinary Enthusiast & Food Explorer"}</p>
                        {profileData?.user.location && (
                            <div className="location-badge">📍 {profileData.user.location}</div>
                        )}
                        {profileData?.user.website && (
                            <a href={profileData.user.website} target="_blank" rel="noopener noreferrer" className="website-link" style={{ display: 'block', marginTop: '0.5rem', color: '#666', fontSize: '0.9rem' }}>
                                🔗 {profileData.user.website.replace(/^https?:\/\//, '')}
                            </a>
                        )}
                    </div>
                    <button className="edit-profile-mini-btn" onClick={() => setActiveTab('edit-profile')}>
                        Edit Profile
                    </button>
                </div>
            </div>

            {/* Stat Cells - Kitchen Tickets */}
            <div className="bento-item stat-card stat-recipes">
                <h3>Total Recipes</h3>
                <div className="stat-value">{profileData?.recipeCount || 0}</div>
                <div className="stat-trend">↗ 12% this month</div>
            </div>

            <div className="bento-item stat-card stat-views">
                <h3>Total Views</h3>
                <div className="stat-value">{mockStats.views.toLocaleString()}</div>
            </div>

            <div className="bento-item stat-card stat-followers">
                <h3>Followers</h3>
                <div className="stat-value">{mockStats.followers}</div>
            </div>

            <div className="bento-item stat-card stat-rating">
                <h3>Avg. Rating</h3>
                <div className="stat-value">⭐ {mockStats.avgRating}</div>
            </div>

            {/* Action Cells with brutalist colors */}
            <Link to="/add" className="bento-item action-card create">
                <div className="action-icon">+</div>
                <span>Create Recipe</span>
            </Link>

            <div className="bento-item action-card share">
                <div className="action-icon">↗</div>
                <span>Share Profile</span>
            </div>
        </div>
    );

    // Triggered when trash button is clicked on RecipeCard
    const confirmDeleteRecipe = (recipeId) => {
        const recipe = profileData.recipes.find(r => r._id === recipeId);
        setRecipeToDelete(recipe);
        setDeleteModalOpen(true);
    };

    // Triggered when "YES, TRASH IT" is clicked in Modal
    const handleActualDelete = async () => {
        if (!recipeToDelete) return;

        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`${API_BASE_URL}/recipes/${recipeToDelete._id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                // Update state locally
                setProfileData(prev => ({
                    ...prev,
                    recipes: prev.recipes.filter(r => r._id !== recipeToDelete._id),
                    recipeCount: prev.recipeCount - 1
                }));
                setDeleteModalOpen(false);
                setRecipeToDelete(null);
            } else {
                const data = await response.json();
                alert(data.message || 'Failed to delete recipe');
            }
        } catch (error) {
            console.error('Error deleting recipe:', error);
            alert('Error deleting recipe');
        }
    };

    const renderRecipes = () => (
        <div className="kitchen-log-container">
            <div className="kitchen-section-header">
                <span className="log-id">LOG_01</span>
                <h2>USER'S RECIPE INDEX</h2>
                <div className="header-line"></div>
            </div>

            <div className="recipes-grid-layout">
                {profileData?.recipes && profileData.recipes.length > 0 ? (
                    profileData.recipes.map(recipe => (
                        <RecipeCard
                            key={recipe._id}
                            recipe={recipe}
                            onDelete={() => confirmDeleteRecipe(recipe._id)} // Pass ID to open modal
                        />
                    ))
                ) : (
                    <div className="void-ticket">
                        <div className="void-content">
                            <span className="void-stamp">EMPTY</span>
                            <h3>NO RECIPES YET</h3>
                            <p>Your cookbook is empty. Start adding your culinary masterpieces.</p>
                            <Link to="/add" className="btn-minimal">
                                + ADD NEW RECIPE
                            </Link>
                        </div>
                        <div className="ticket-rip"></div>
                    </div>
                )}
            </div>
        </div>
    );

    // Meal Planner State
    const [weekOffset, setWeekOffset] = useState(0);
    const [mealPlan, setMealPlan] = useState(() => {
        // Load from local storage if available
        const savedPlan = localStorage.getItem('kitchen_meal_plan');
        return savedPlan ? JSON.parse(savedPlan) : {};
    });

    // Save to local storage whenever mealPlan changes
    useEffect(() => {
        localStorage.setItem('kitchen_meal_plan', JSON.stringify(mealPlan));
    }, [mealPlan]);
    const [isMealSelectorOpen, setIsMealSelectorOpen] = useState(false);
    const [activePlanningSlot, setActivePlanningSlot] = useState(null); // { day, type }

    const handlePrevWeek = () => setWeekOffset(prev => prev - 1);
    const handleNextWeek = () => setWeekOffset(prev => prev + 1);

    const toggleMealSlot = (day, type) => {
        const key = `${day}-${type}`;
        if (mealPlan[key]) {
            // Remove existing
            const newPlan = { ...mealPlan };
            delete newPlan[key];
            setMealPlan(newPlan);
        } else {
            // Open Selector
            setActivePlanningSlot({ day, type });
            setIsMealSelectorOpen(true);
        }
    };

    const handleMealSelect = (recipe) => {
        if (!activePlanningSlot) return;
        const { day, type } = activePlanningSlot;
        const key = `${day}-${type}`;

        setMealPlan(prev => ({
            ...prev,
            [key]: {
                title: recipe.title,
                image: recipe.image,
                id: recipe._id
            }
        }));
        setIsMealSelectorOpen(false);
        setActivePlanningSlot(null);
    };

    const renderFavorites = () => (
        <div className="kitchen-log-container">
            <div className="kitchen-section-header">
                <span className="log-id">LOG_02</span>
                <h2>COLLECTED FAVORITES</h2>
                <div className="header-line"></div>
            </div>

            <div className="recipes-grid-layout">
                {profileData?.user?.favorites && profileData.user.favorites.length > 0 ? (
                    profileData.user.favorites.map(recipe => (
                        <RecipeCard
                            key={recipe._id}
                            recipe={recipe}
                        // No delete capability for favorites here, just viewing
                        />
                    ))
                ) : (
                    <div className="void-ticket">
                        <div className="void-content">
                            <span className="void-stamp">EMPTY</span>
                            <h3>NO FAVORITES YET</h3>
                            <p>You haven't saved any recipes yet. Go explore and find some inspiration!</p>
                            <Link to="/" className="btn-minimal">
                                EXPLORE RECIPES
                            </Link>
                        </div>
                        <div className="ticket-rip"></div>
                    </div>
                )}
            </div>
        </div>
    );

    const renderPlanner = () => (
        <div className="kitchen-log-container">
            <div className="kitchen-section-header">
                <span className="log-id">LOG_03</span>
                <h2>MEAL STATION SCHEDULE</h2>
                <div className="header-line"></div>

                <div className="planner-controls">
                    <button className="btn-minimal">
                        <span>← PREV</span>
                    </button>
                    <span className="current-week-display">WEEK 42 • OCT 24 - 30</span>
                    <button className="btn-minimal">
                        <span>NEXT →</span>
                    </button>
                </div>
            </div>

            <div className="planner-grid-wrapper">
                {/* Decorative Station Marks */}
                <div className="station-mark top-left">+</div>
                <div className="station-mark top-right">+</div>
                <div className="station-mark bottom-left">+</div>
                <div className="station-mark bottom-right">+</div>

                <div className="planner-grid">
                    {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map((day, index) => {
                        const lunchKey = `${day}-LUNCH`;
                        const dinnerKey = `${day}-DINNER`;
                        const lunch = mealPlan[lunchKey];
                        const dinner = mealPlan[dinnerKey];

                        return (
                            <div key={day} className="day-column">
                                <div className="day-header">
                                    <span className="day-name">{day}</span>
                                    <span className="day-number">{24 + index}</span>
                                </div>
                                <div className="meal-slots">
                                    <div className={`meal-slot-item ${lunch ? 'filled' : 'empty'}`}>
                                        <span className="slot-type">LUNCH</span>
                                        {lunch && <span className="meal-name-display" style={{ fontSize: '0.7rem', display: 'block', marginTop: '4px' }}>{lunch.title}</span>}
                                        <button className="add-plan-btn" onClick={() => toggleMealSlot(day, 'LUNCH')}>
                                            {lunch ? '×' : '+'}
                                        </button>
                                    </div>
                                    <div className={`meal-slot-item ${dinner ? 'filled' : 'empty'}`}>
                                        <span className="slot-type">DINNER</span>
                                        {dinner && <span className="meal-name-display" style={{ fontSize: '0.7rem', display: 'block', marginTop: '4px' }}>{dinner.title}</span>}
                                        <button className="add-plan-btn" onClick={() => toggleMealSlot(day, 'DINNER')}>
                                            {dinner ? '×' : '+'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="planner-footer">
                <p>STATUS: <span className="status-live">PLANNING IN PROGRESS</span></p>
                <div className="planner-legend">
                    <span className="legend-item"><span className="dot empty"></span> EMPTY</span>
                    <span className="legend-item"><span className="dot planned"></span> PLANNED</span>
                </div>
            </div>
        </div>
    );

    const renderNotifications = () => (
        <div className="edit-profile-kitchen-layout">
            <div className="kitchen-log-container">
                <div className="kitchen-section-header">
                    <span className="log-id">NOTIF_LOG_01</span>
                    <h2>RECENT ACTIVITY</h2>
                    <div className="header-line"></div>
                </div>

                <div className="notification-list-modern">
                    {/* Mock Notifications */}
                    <div className="notification-card unread">
                        <div className="notif-badge unread-badge">NEW</div>
                        <div className="notif-icon-modern">🎉</div>
                        <div className="notif-body">
                            <h4 className="notif-title">Profile Setup Complete</h4>
                            <p className="notif-message">Your profile is all set up and ready to go. Start sharing your recipes!</p>
                            <span className="notif-timestamp">2 hours ago</span>
                        </div>
                    </div>
                    <div className="notification-card">
                        <div className="notif-icon-modern">🍲</div>
                        <div className="notif-body">
                            <h4 className="notif-title">Trending Recipe Alert</h4>
                            <p className="notif-message">Sourdough is making a comeback! Check out the latest recipes in this category.</p>
                            <span className="notif-timestamp">1 day ago</span>
                        </div>
                    </div>
                    <div className="notification-card">
                        <div className="notif-icon-modern">👥</div>
                        <div className="notif-body">
                            <h4 className="notif-title">Community Update</h4>
                            <p className="notif-message">You've received 5 new followers this week. Keep up the great work!</p>
                            <span className="notif-timestamp">3 days ago</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderHelp = () => (
        <div className="edit-profile-kitchen-layout">
            <div className="kitchen-log-container">
                <div className="kitchen-section-header">
                    <span className="log-id">SUPP_LOG_01</span>
                    <h2>HELP & SUPPORT</h2>
                    <div className="header-line"></div>
                </div>

                <div className="help-grid">
                    <div className="help-card">
                        <h3>FAQs</h3>
                        <p>Find answers to common questions.</p>
                    </div>
                    <div className="help-card">
                        <h3>Contact Us</h3>
                        <p>Get in touch with our support team.</p>
                    </div>
                    <div className="help-card">
                        <h3>Community Guidelines</h3>
                        <p>Read our rules for a safe community.</p>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderPreferences = () => (
        <div className="edit-profile-kitchen-layout">
            <div className="kitchen-log-container">
                <div className="kitchen-section-header">
                    <span className="log-id">PREF_01</span>
                    <h2>SYSTEM PREFERENCES</h2>
                    <div className="header-line"></div>
                </div>

                <div className="brutalist-form-grid" style={{ marginTop: 0 }}>
                    {/* --- SECTION 1: NOTIFICATIONS (4 ITEMS) --- */}
                    <div className="form-field-brutalist full-width">
                        <label className="field-label-brutalist">
                            <span className="label-text">NOTIFICATION MATRIX</span>
                        </label>
                        <p className="section-comment">
                            // COMMUNICATIONS_UPLINK [4_CHANNELS_ACTIVE]
                        </p>
                    </div>

                    {/* Item 1 */}
                    <div className="brutalist-toggle-row">
                        <div className="preference-info">
                            <label className="preference-label">EMAIL_ALERTS</label>
                            <p className="field-hint">// INBOX_PRIMARY</p>
                        </div>
                        <label className="brutalist-switch">
                            <input
                                type="checkbox"
                                checked={preferences.emailNotifications}
                                onChange={(e) => handlePreferenceChange('emailNotifications', e.target.checked)}
                            />
                            <span className="brutalist-slider"></span>
                        </label>
                    </div>

                    {/* Item 2 */}
                    <div className="brutalist-toggle-row">
                        <div className="preference-info">
                            <label className="preference-label">DEVICE_PUSH</label>
                            <p className="field-hint">// LATENCY_LOW</p>
                        </div>
                        <label className="brutalist-switch">
                            <input
                                type="checkbox"
                                checked={preferences.pushNotifications}
                                onChange={(e) => handlePreferenceChange('pushNotifications', e.target.checked)}
                            />
                            <span className="brutalist-slider"></span>
                        </label>
                    </div>

                    {/* Item 3 */}
                    <div className="brutalist-toggle-row">
                        <div className="preference-info">
                            <label className="preference-label">WEEKLY_DIGEST</label>
                            <p className="field-hint">// FREQ_7_DAYS</p>
                        </div>
                        <label className="brutalist-switch">
                            <input
                                type="checkbox"
                                checked={preferences.weeklyDigest}
                                onChange={(e) => handlePreferenceChange('weeklyDigest', e.target.checked)}
                            />
                            <span className="brutalist-slider"></span>
                        </label>
                    </div>

                    {/* Item 4 (New) */}
                    <div className="brutalist-toggle-row">
                        <div className="preference-info">
                            <label className="preference-label">SECURITY_ALERTS</label>
                            <p className="field-hint">// PRIORITY_CRITICAL</p>
                        </div>
                        <label className="brutalist-switch">
                            <input
                                type="checkbox"
                                checked={preferences.securityAlerts !== false} // Default true
                                onChange={(e) => handlePreferenceChange('securityAlerts', e.target.checked)}
                            />
                            <span className="brutalist-slider"></span>
                        </label>
                    </div>


                    {/* --- SECTION 2: UI CONFIGURATION (1 ITEM - FULL WIDTH) --- */}
                    <div className="form-field-brutalist full-width" style={{ marginTop: '2rem' }}>
                        <label className="field-label-brutalist">
                            <span className="label-text">INTERFACE CONFIGURATION</span>
                        </label>
                        <p className="section-comment">
                            // VISUAL_OUTPUT_PARAMS
                        </p>
                    </div>

                    {/* UI Item 1: Dark Mode (Full Width) */}
                    <div className="brutalist-toggle-row full-width">
                        <div className="preference-info">
                            <label className="preference-label">DARK_MODE</label>
                            <p className="field-hint">// HIGH_CONTRAST</p>
                        </div>
                        <label className="brutalist-switch">
                            <input
                                type="checkbox"
                                checked={preferences.darkMode}
                                onChange={(e) => handlePreferenceChange('darkMode', e.target.checked)}
                            />
                            <span className="brutalist-slider"></span>
                        </label>
                    </div>


                    {/* --- SECTION 3: STANDARDS (2 ITEMS) --- */}
                    <div className="form-field-brutalist full-width" style={{ marginTop: '2rem' }}>
                        <label className="field-label-brutalist">
                            <span className="label-text">GLOBAL STANDARDS</span>
                        </label>
                        <p className="section-comment">
                            // LOCALE_&_UNIT_CALIBRATION
                        </p>
                    </div>

                    {/* Standards Item 1: Units */}
                    <div className="brutalist-toggle-row">
                        <div className="preference-info">
                            <label className="preference-label">MEASUREMENT_SYSTEM</label>
                            <p className="field-hint">// UNIT_STANDARDS</p>
                        </div>
                        <select
                            value={preferences.measurementSystem}
                            onChange={(e) => handlePreferenceChange('measurementSystem', e.target.value)}
                            className="brutalist-select-inline"
                        >
                            <option value="metric">METRIC (ISO)</option>
                            <option value="imperial">IMPERIAL (US)</option>
                        </select>
                    </div>

                    {/* Standards Item 2: Language (Moved Here) */}
                    <div className="brutalist-toggle-row">
                        <div className="preference-info">
                            <label className="preference-label">LANGUAGE</label>
                            <p className="field-hint">// LOCALE_SETTINGS</p>
                        </div>
                        <select
                            value={preferences.language}
                            onChange={(e) => handlePreferenceChange('language', e.target.value)}
                            className="brutalist-select-inline"
                        >
                            <option value="en">ENGLISH (US)</option>
                            <option value="es">ESPAÑOL</option>
                            <option value="fr">FRANÇAIS</option>
                            <option value="de">DEUTSCH</option>
                            <option value="it">ITALIANO</option>
                        </select>
                    </div>

                    <div className="form-actions-brutalist" style={{ paddingTop: '2rem', gridColumn: '1 / -1' }}>
                        <button
                            className="btn-brutalist-primary"
                            onClick={handleSavePreferences}
                            style={{ width: '100%' }}
                        >
                            💾 SAVE CONFIGURATION
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderSettings = (type) => (
        <>
            {type === 'security' ? (
                <div className="kitchen-log-container">
                    <div className="kitchen-section-header">
                        <span className="log-id">SEC_01</span>
                        <h2>SECURITY SETTINGS</h2>
                        <div className="header-line"></div>
                    </div>

                    <div className="edit-profile-kitchen-layout">
                        <div className="security-form-container">
                            <div className="security-section-header">
                                <h3 className="security-section-title">Password Management</h3>
                                <p className="security-section-desc">Update your password to keep your account secure</p>
                            </div>

                            <form onSubmit={handlePasswordSubmit} className="security-form">
                                {passwordStatus.hasPassword && (
                                    <div className="security-field-group">
                                        <label className="security-label">Current Password</label>
                                        <input
                                            type="password"
                                            value={passwordForm.currentPassword}
                                            onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                                            className="security-input"
                                            placeholder="Enter current password"
                                        />
                                    </div>
                                )}

                                <div className="security-field-group">
                                    <label className="security-label">New Password</label>
                                    <input
                                        type="password"
                                        value={passwordForm.newPassword}
                                        onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                                        className="security-input"
                                        placeholder="Enter new password"
                                    />
                                </div>

                                <div className="security-field-group">
                                    <label className="security-label">Confirm New Password</label>
                                    <input
                                        type="password"
                                        value={passwordForm.confirmPassword}
                                        onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                                        className="security-input"
                                        placeholder="Confirm new password"
                                    />
                                </div>

                                {/* Success/Error Messages */}
                                {passwordError && <div className="error-message">{passwordError}</div>}
                                {passwordSuccess && <div className="success-message">{passwordSuccess}</div>}

                                <div className="security-actions">
                                    <button
                                        type="button"
                                        className="security-btn-secondary"
                                        onClick={() => alert("Redirect to forgot password flow")}
                                    >
                                        Forgot Password?
                                    </button>
                                    <button
                                        type="submit"
                                        className="security-btn-primary"
                                        disabled={passwordLoading}
                                    >
                                        {passwordLoading ? 'Updating Password...' : 'Update Password'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>

                    <div className="security-form-container mfa-container">
                        <div className="security-section-header">
                            <h3 className="security-section-title">Two-Factor Authentication</h3>
                            <span className="coming-soon-badge">Coming Soon</span>
                        </div>
                        <div className="mfa-locked-state">
                            <div className="mfa-icon">🔒</div>
                            <p className="mfa-text">Advanced security features including two-factor authentication will be available soon.</p>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="edit-profile-kitchen-layout">
                    {/* Profile Images Section - Bento Style */}
                    <div className="kitchen-log-container">
                        <div className="kitchen-section-header">
                            <span className="log-id">EDIT_01</span>
                            <h2>PROFILE VISUALS</h2>
                            <div className="header-line"></div>
                        </div>

                        <div className="profile-images-grid">
                            {/* Banner Upload Card */}
                            <div className="image-upload-card banner-card">
                                <div className="upload-card-header">
                                    <h3>COVER BANNER</h3>
                                    <span className="dimension-tag">1200×300</span>
                                </div>
                                <div className="banner-upload-zone">
                                    <img
                                        src={bannerImagePreview || getImageUrl(profileData?.user.bannerImage) || "https://images.unsplash.com/photo-1495195134817-aeb325a55b65?w=1200&h=300&fit=crop"}
                                        alt="Banner Preview"
                                        className="banner-preview-img"
                                    />
                                    <label htmlFor="settings-banner-upload" className="upload-overlay-btn">
                                        <span>CHANGE BANNER</span>
                                    </label>
                                    <input
                                        type="file"
                                        id="settings-banner-upload"
                                        onChange={handleBannerImageChange}
                                        accept="image/*"
                                        style={{ display: 'none' }}
                                    />
                                </div>
                            </div>

                            {/* Avatar Upload Card */}
                            <div className="image-upload-card avatar-card">
                                <div className="upload-card-header">
                                    <h3>PROFILE PHOTO</h3>
                                    <span className="dimension-tag">400×400</span>
                                </div>
                                <div className="avatar-upload-zone">
                                    <div className="avatar-preview-circle">
                                        <img
                                            src={profileImagePreview || getImageUrl(profileData?.user.photo)}
                                            alt="Avatar"
                                        />
                                    </div>
                                    <label htmlFor="settings-avatar-upload" className="upload-btn-brutalist">
                                        UPLOAD NEW
                                    </label>
                                    <input
                                        type="file"
                                        id="settings-avatar-upload"
                                        onChange={handleProfileImageChange}
                                        accept="image/*"
                                        style={{ display: 'none' }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Profile Information Section */}
                    <div className="kitchen-log-container">
                        <div className="kitchen-section-header">
                            <span className="log-id">EDIT_02</span>
                            <h2>PROFILE INFORMATION</h2>
                            <div className="header-line"></div>
                        </div>

                        <div className="brutalist-form-grid">
                            {/* Display Name */}
                            <div className="form-field-brutalist full-width">
                                <label className="field-label-brutalist">
                                    <span className="label-text">DISPLAY NAME</span>
                                    <span className="label-required">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={profileForm.name}
                                    onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                                    className="input-brutalist"
                                    placeholder="Your name here..."
                                />
                                <p className="field-hint">// VISIBLE TO COMMUNITY</p>
                            </div>

                            {/* Bio */}
                            <div className="form-field-brutalist full-width">
                                <label className="field-label-brutalist">
                                    <span className="label-text">BIO</span>
                                </label>
                                <textarea
                                    value={profileForm.bio}
                                    onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                                    rows="4"
                                    className="textarea-brutalist"
                                    placeholder="Tell us about your cooking journey..."
                                ></textarea>
                                <p className="field-hint">// YOUR CULINARY MANIFESTO</p>
                            </div>

                            {/* Location */}
                            <div className="form-field-brutalist">
                                <label className="field-label-brutalist">
                                    <span className="label-text">📍 LOCATION</span>
                                </label>
                                <input
                                    type="text"
                                    value={profileForm.location}
                                    onChange={(e) => setProfileForm({ ...profileForm, location: e.target.value })}
                                    className="input-brutalist"
                                    placeholder="City, Country"
                                />
                            </div>

                            {/* Website */}
                            <div className="form-field-brutalist">
                                <label className="field-label-brutalist">
                                    <span className="label-text">🔗 WEBSITE</span>
                                </label>
                                <input
                                    type="text"
                                    value={profileForm.website}
                                    onChange={(e) => setProfileForm({ ...profileForm, website: e.target.value })}
                                    placeholder="https://yourwebsite.com"
                                    className="input-brutalist"
                                />
                            </div>
                        </div>

                        {/* Success/Error Messages */}
                        {profileUpdateError && <div className="error-message" style={{ marginTop: '1rem' }}>{profileUpdateError}</div>}
                        {profileUpdateSuccess && <div className="success-message" style={{ marginTop: '1rem' }}>{profileUpdateSuccess}</div>}

                        {/* Action Footer */}
                        <div className="form-actions-brutalist">
                            <button
                                className="btn-brutalist-secondary"
                                onClick={handleCancelProfile}
                                disabled={profileUpdateLoading}
                            >
                                CANCEL
                            </button>
                            <button
                                className="btn-brutalist-primary"
                                onClick={handleSaveProfile}
                                disabled={profileUpdateLoading}
                            >
                                {profileUpdateLoading ? 'SAVING...' : '💾 SAVE CHANGES'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );

    if (loading) {
        return (
            <div className="dashboard-container">
                <ProfileSidebar
                    activeTab="overview"
                    onTabChange={() => { }}
                    onLogout={() => { }}
                />
                <main className="dashboard-main">
                    <div className="kitchen-header skeleton-shimmer">
                        <div className="kitchen-title-row">
                            <div className="kitchen-branding">
                                <span className="station-label">STATION 01</span>
                                <div className="skeleton-text" style={{ width: '300px', height: '56px', marginTop: '8px' }}></div>
                            </div>
                            <div className="kitchen-date-stamp">
                                <div className="skeleton-text" style={{ width: '120px', height: '20px' }}></div>
                            </div>
                        </div>
                        <div className="kitchen-marquee-strip"></div>
                    </div>
                    <div className="bento-grid">
                        <div className="bento-item profile-card-main skeleton-shimmer"></div>
                        <div className="bento-item stat-card skeleton-shimmer"></div>
                        <div className="bento-item stat-card skeleton-shimmer"></div>
                        <div className="bento-item stat-card skeleton-shimmer"></div>
                        <div className="bento-item stat-card skeleton-shimmer"></div>
                        <div className="bento-item action-card skeleton-shimmer"></div>
                        <div className="bento-item action-card skeleton-shimmer"></div>
                    </div>
                </main>
            </div>
        );
    }
    if (error) return <div className="error-screen">Error: {error}</div>;

    return (
        <div className="dashboard-container">
            <ProfileSidebar
                activeTab={activeTab}
                onTabChange={setActiveTab}
                onLogout={handleLogout}
            />

            <main className="dashboard-main">
                {/* Dashboard Welcome Header */}
                {/* New Premium "Kitchen Station" Header */}
                <div className="kitchen-header">
                    <div className="kitchen-title-row">
                        <div className="kitchen-branding">
                            <span className="station-label">STATION 01</span>
                            <h1>{profileData?.user.name?.split(' ')[0]}'s Kitchen</h1>
                        </div>
                        <div className="kitchen-date-stamp">
                            <span>{new Date().toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase()}</span>
                            <div className="live-indicator">
                                <span className="pimp"></span>
                                LIVE
                            </div>
                        </div>
                    </div>

                    <div className="kitchen-marquee-strip">
                        <div className="marquee-content">
                            <span>FRESH INGREDIENTS • NEW RECIPES LOADING • KEEP COOKING • TASTE THE LOVE • </span>
                            <span>FRESH INGREDIENTS • NEW RECIPES LOADING • KEEP COOKING • TASTE THE LOVE • </span>
                            <span>FRESH INGREDIENTS • NEW RECIPES LOADING • KEEP COOKING • TASTE THE LOVE • </span>
                        </div>
                    </div>
                </div>

                {activeTab === 'overview' && renderOverview()}
                {activeTab === 'recipes' && renderRecipes()}
                {activeTab === 'favorites' && renderFavorites()}
                {activeTab === 'planner' && renderPlanner()}
                {activeTab === 'notifications' && renderNotifications()}
                {activeTab === 'help' && renderHelp()}
                {activeTab === 'edit-profile' && renderSettings('general')}
                {activeTab === 'preferences' && renderPreferences()}
                {activeTab === 'security' && renderSettings('security')}

                {/* MODAL */}
                <DeleteConfirmationModal
                    isOpen={deleteModalOpen}
                    onClose={() => setDeleteModalOpen(false)}
                    onConfirm={handleActualDelete}
                    recipeTitle={recipeToDelete?.title || 'Unknown Recipe'}
                />

                <MealSelectionModal
                    isOpen={isMealSelectorOpen}
                    onClose={() => setIsMealSelectorOpen(false)}
                    onSelect={handleMealSelect}
                    myRecipes={profileData?.recipes}
                    favorites={profileData?.user?.favorites}
                />
            </main>
        </div>
    );
};

export default Profile;
