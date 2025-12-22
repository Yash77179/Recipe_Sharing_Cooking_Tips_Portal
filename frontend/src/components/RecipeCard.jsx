import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './RecipeCard.css';

gsap.registerPlugin(ScrollTrigger, useGSAP);

const RecipeCard = ({ recipe, onToggle }) => {
    const { user, loading, updateUser } = useAuth(); // Get user from context
    const [liked, setLiked] = useState(false);
    const cardRef = useRef(null);
    const imageRef = useRef(null);
    const titleRef = useRef(null);

    // Check if recipe is in user's favorites
    React.useEffect(() => {
        if (user && user.favorites && recipe) {
            // Need to handle if favorites are objects (populated) or IDs
            const isFav = user.favorites.some(fav =>
                (typeof fav === 'string' ? fav : fav._id) === recipe._id
            );
            setLiked(isFav);
        } else {
            setLiked(false);
        }
    }, [user, recipe]);

    const toggleLike = async (e) => {
        e.preventDefault(); // Prevent navigation
        if (loading) return;

        if (!user) {
            // Optional: Redirect to login or show toast
            alert('Please login to save favorites');
            return;
        }

        // Optimistic UI update
        const previousState = liked;
        const newState = !liked;
        // setLiked(newState); // user effect will handle this if we update context fast enough? 
        // No, better to set local too for potential lag.
        setLiked(newState);

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5001/api/auth/favorites/${recipe._id}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to update favorite');
            }

            const data = await response.json();

            // Update Context
            if (data.favorites) {
                updateUser({ ...user, favorites: data.favorites });
            }

            // Success - Notify parent
            if (onToggle) {
                onToggle(recipe, newState);
            }
        } catch (error) {
            console.error('Error toggling favorite:', error);
            // Revert on error
            setLiked(previousState);
        }
    };

    const handleMouseEnter = () => {
        gsap.to(imageRef.current, {
            scale: 1.1,
            duration: 0.6,
            ease: 'power2.out'
        });
        gsap.to(titleRef.current, {
            y: -5,
            duration: 0.4,
            ease: 'power2.out'
        });
    };

    const handleMouseLeave = () => {
        gsap.to(imageRef.current, {
            scale: 1,
            duration: 0.6,
            ease: 'power2.inOut'
        });
        gsap.to(titleRef.current, {
            y: 0,
            duration: 0.4,
            ease: 'power2.inOut'
        });
    };

    return (
        <div className="recipe-card-wrapper">
            <Link
                to={`/recipes/${recipe._id}`}
                className="recipe-card"
                ref={cardRef}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
            >
                <div className="card-image-outer-wrapper">
                    <div className="card-image-wrapper">
                        <img
                            src={recipe.image}
                            alt={recipe.title}
                            className="card-image"
                            loading="lazy"
                            ref={imageRef}
                        />
                    </div>
                    {/* Prep Time Tag */}
                    <div className="time-tag">
                        {recipe.prepTime || '20 mins'}
                    </div>
                </div>

                <div className="card-content">
                    <h3 className="card-title" ref={titleRef}>{recipe.title}</h3>

                    <div className="card-meta">
                        <span className="card-cuisine">{recipe.cuisine || 'CUISINE'}</span>
                        <span className="card-dot">•</span>
                        <span className={`diet-text ${recipe.dietaryType === 'Non-Veg' ? 'non-veg' : 'veg'}`}>
                            {recipe.dietaryType?.toUpperCase() || 'VEG'}
                        </span>
                    </div>
                </div>
            </Link>
            <button
                className={`favorite-btn ${liked ? 'active' : ''}`}
                onClick={toggleLike}
                aria-label="Toggle Favorite"
            >
                <svg viewBox="0 0 24 24" width="24" height="24" fill={liked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                </svg>
            </button>
        </div>
    );
};

export default RecipeCard;
