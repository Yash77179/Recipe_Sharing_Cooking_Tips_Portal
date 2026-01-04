import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import RecipeCard from '../components/RecipeCard';
import ProfileSidebar from '../components/ProfileSidebar';
import { FiLock, FiCheckCircle } from 'react-icons/fi';
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
                        <p className="user-bio">Culinary Enthusiast & Food Explorer</p>
                        <div className="location-badge">📍 New York, USA</div>
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
    const [mealPlan, setMealPlan] = useState({}); // { "MON-LUNCH": { title: "Salad", _id: "..." } }
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
        <div className="content-section">
            <h2 className="section-title">Notifications</h2>
            <div className="notification-list">
                {/* Mock Notifications */}
                <div className="notification-item unread">
                    <div className="notif-icon">🎉</div>
                    <div className="notif-content">
                        <p><strong>Welcome!</strong> Your profile is all set up.</p>
                        <span className="notif-time">2 hours ago</span>
                    </div>
                </div>
                <div className="notification-item">
                    <div className="notif-icon">🍲</div>
                    <div className="notif-content">
                        <p><strong>New Recipe Trend:</strong> Sourdough is back!</p>
                        <span className="notif-time">1 day ago</span>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderHelp = () => (
        <div className="content-section">
            <h2 className="section-title">Help & Support</h2>
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
    );

    const renderSettings = (type) => (
        <div className="content-section settings-section">
            <h2 className="section-title">{type === 'security' ? 'Security Settings' : 'Edit Profile'}</h2>
            <div className="settings-card">
                {type === 'security' ? (
                    <div className="security-panel">
                        <div className="security-header">
                            <div className="icon-wrapper"><FiLock /></div>
                            <div>
                                <h3>Password Management</h3>
                                <p>Update your password to keep your account secure.</p>
                            </div>
                        </div>

                        <form onSubmit={handlePasswordSubmit} className="dashboard-password-form">
                            {passwordStatus.hasPassword && (
                                <div className="form-group">
                                    <label>Current Password</label>
                                    <input
                                        type="password"
                                        value={passwordForm.currentPassword}
                                        onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                                        placeholder="••••••••"
                                    />
                                </div>
                            )}
                            <div className="form-row">
                                <div className="form-group">
                                    <label>New Password</label>
                                    <input
                                        type="password"
                                        value={passwordForm.newPassword}
                                        onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                                        placeholder="At least 6 chars"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Confirm New Password</label>
                                    <input
                                        type="password"
                                        value={passwordForm.confirmPassword}
                                        onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                                        placeholder="Repeat password"
                                    />
                                </div>
                            </div>

                            {passwordError && <div className="error-message">{passwordError}</div>}
                            {passwordSuccess && <div className="success-message">{passwordSuccess}</div>}

                            <button type="submit" className="btn-primary" disabled={passwordLoading}>
                                {passwordLoading ? 'Updating...' : 'Update Password'}
                            </button>
                        </form>

                        <div className="security-divider"></div>

                        <div className="security-header">
                            <div className="icon-wrapper"><FiCheckCircle /></div>
                            <div>
                                <h3>Two-Factor Authentication</h3>
                                <p>Add an extra layer of security to your account.</p>
                            </div>
                            <button className="btn-secondary" disabled>Coming Soon</button>
                        </div>
                    </div>
                ) : (
                    <div className="security-panel">
                        <div className="security-header">
                            <div className="icon-wrapper"><FiUser /></div>
                            <div>
                                <h3>Profile General</h3>
                                <p>Update your public profile information.</p>
                            </div>
                        </div>

                        <div className="dashboard-password-form">
                            <div className="form-group">
                                <label>Profile Banner</label>
                                <div className="banner-upload-wrapper">
                                    <img
                                        src={bannerImagePreview || getImageUrl(profileData?.user.bannerImage) || "https://images.unsplash.com/photo-1495195134817-aeb325a55b65?w=1200&h=300&fit=crop"}
                                        alt="Banner Preview"
                                        className="settings-banner-preview"
                                    />
                                    <label htmlFor="settings-banner-upload" className="upload-btn-overlay">
                                        Change Banner
                                    </label>
                                    <input
                                        type="file"
                                        id="settings-banner-upload"
                                        onChange={handleBannerImageChange}
                                        style={{ display: 'none' }}
                                    />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Profile Picture</label>
                                    <div className="avatar-upload-row">
                                        <div className="settings-avatar-preview">
                                            <img
                                                src={profileImagePreview || getImageUrl(profileData?.user.photo)}
                                                alt="Avatar"
                                            />
                                        </div>
                                        <div className="avatar-actions">
                                            <label htmlFor="settings-avatar-upload" className="btn-secondary" style={{ cursor: 'pointer' }}>
                                                Upload New
                                            </label>
                                            <input
                                                type="file"
                                                id="settings-avatar-upload"
                                                onChange={handleProfileImageChange}
                                                style={{ display: 'none' }}
                                            />
                                            <p className="form-hint">Recommended: 400x400px</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="form-group" style={{ flex: 2 }}>
                                    <label>Display Name</label>
                                    <input type="text" defaultValue={profileData?.user.name} />
                                    <p className="form-hint">This is how other users will see you.</p>
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Bio</label>
                                <textarea
                                    defaultValue="Culinary Enthusiast & Food Explorer"
                                    rows="4"
                                    style={{ resize: 'vertical' }}
                                ></textarea>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Location</label>
                                    <input type="text" defaultValue="New York, USA" />
                                </div>
                                <div className="form-group">
                                    <label>Website</label>
                                    <input type="text" placeholder="https://yourwebsite.com" />
                                </div>
                            </div>

                            <div className="security-divider"></div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                <button className="btn-primary">Save Profile Changes</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );

    if (loading) return <div className="loading-screen">Loading Dashboard...</div>;
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
                {(activeTab === 'edit-profile' || activeTab === 'preferences') && renderSettings('general')}
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
