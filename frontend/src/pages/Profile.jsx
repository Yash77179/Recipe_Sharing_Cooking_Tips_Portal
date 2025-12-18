import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import RecipeCard from '../components/RecipeCard';
import './Profile.css';

const Profile = () => {
    const [profileData, setProfileData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { logout } = useAuth();

    useEffect(() => {
        fetchProfile();
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
                        {profileData?.user.age && (
                            <p className="profile-age">Age: {profileData.user.age} years</p>
                        )}
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
                    <button onClick={handleLogout} className="logout-button">
                        Logout
                    </button>
                </div>
            </div>

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
