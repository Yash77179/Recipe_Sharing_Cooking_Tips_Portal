import React from 'react';
import { FiGrid, FiUser, FiLock, FiSettings, FiLogOut, FiBookmark, FiList, FiCalendar, FiBell, FiHelpCircle, FiArrowLeft } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import './ProfileSidebar.css';

const ProfileSidebar = ({ activeTab, onTabChange, onLogout }) => {
    const navigate = useNavigate();

    const mainLinks = [
        { id: 'overview', icon: <FiGrid />, label: 'Overview' },
        { id: 'recipes', icon: <FiList />, label: 'My Recipes' },
        { id: 'favorites', icon: <FiBookmark />, label: 'Favorites' },
        { id: 'planner', icon: <FiCalendar />, label: 'Meal Planner' }, // New
    ];

    const settingsLinks = [
        { id: 'edit-profile', icon: <FiUser />, label: 'Edit Profile' },
        { id: 'security', icon: <FiLock />, label: 'Data & Security' }, // Renamed
        { id: 'preferences', icon: <FiSettings />, label: 'Preferences' },
        { id: 'notifications', icon: <FiBell />, label: 'Notifications' }, // New
        { id: 'help', icon: <FiHelpCircle />, label: 'Help & Support' }, // New
    ];

    return (
        <aside className="profile-sidebar-component">
            <div className="sidebar-header">
                <h3>My Account</h3>
            </div>

            <nav className="sidebar-nav">
                <div className="nav-section">
                    <span className="section-label">Dashboard</span>
                    {mainLinks.map((link) => (
                        <button
                            key={link.id}
                            className={`sidebar-link ${activeTab === link.id ? 'active' : ''}`}
                            onClick={() => onTabChange(link.id)}
                        >
                            {link.icon}
                            <span>{link.label}</span>
                        </button>
                    ))}
                </div>

                <div className="nav-section">
                    <span className="section-label">Settings</span>
                    {settingsLinks.map((link) => (
                        <button
                            key={link.id}
                            className={`sidebar-link ${activeTab === link.id ? 'active' : ''}`}
                            onClick={() => onTabChange(link.id)}
                        >
                            {link.icon}
                            <span>{link.label}</span>
                        </button>
                    ))}
                </div>
            </nav>

            <div className="sidebar-footer">
                <button
                    className="exit-profile-btn"
                    onClick={() => navigate('/')}
                >
                    <FiArrowLeft />
                    <span>Exit Profile</span>
                </button>
                <button className="logout-link" onClick={onLogout}>
                    <FiLogOut />
                    <span>Log Out</span>
                </button>
            </div>
        </aside>
    );
};

export default ProfileSidebar;
