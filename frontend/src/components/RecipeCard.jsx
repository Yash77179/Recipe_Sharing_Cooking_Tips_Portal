import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    motion,
    useMotionTemplate,
    useMotionValue,
    useSpring,
} from 'framer-motion';
import { API_BASE_URL } from '../config';
import './RecipeCard.css';

const RecipeCard = ({ recipe, onToggle }) => {
    const { user, loading, updateUser } = useAuth();
    const [liked, setLiked] = useState(false);

    // Tilt Motion Values
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const xSpring = useSpring(x);
    const ySpring = useSpring(y);

    const transform = useMotionTemplate`rotateX(${xSpring}deg) rotateY(${ySpring}deg)`;

    // Shine Motion Values
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    const mouseXSpring = useSpring(mouseX);
    const mouseYSpring = useSpring(mouseY);

    const background = useMotionTemplate`radial-gradient(
        250px circle at ${mouseXSpring}px ${mouseYSpring}px,
        rgba(255,255,255,0.4),
        transparent 80%
    )`;

    const cardRef = useRef(null);

    // Check if recipe is in user's favorites
    React.useEffect(() => {
        if (user && user.favorites && recipe) {
            const isFav = user.favorites.some(fav =>
                (typeof fav === 'string' ? fav : fav._id) === recipe._id
            );
            setLiked(isFav);
        } else {
            setLiked(false);
        }
    }, [user, recipe]);

    const toggleLike = async (e) => {
        e.preventDefault();
        e.stopPropagation(); // Prevent navigation when clicking like
        if (loading) return;

        if (!user) {
            alert('Please login to save favorites');
            return;
        }

        const previousState = liked;
        const newState = !liked;
        setLiked(newState);

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/auth/favorites/${recipe._id}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) throw new Error('Failed to update favorite');

            const data = await response.json();
            if (data.favorites) {
                updateUser({ ...user, favorites: data.favorites });
            }
            if (onToggle) onToggle(recipe, newState);
        } catch (error) {
            console.error('Error toggling favorite:', error);
            setLiked(previousState);
        }
    };

    const handleMouseMove = (e) => {
        if (!cardRef.current) return;

        const rect = cardRef.current.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;

        const mouseXPos = e.clientX - rect.left;
        const mouseYPos = e.clientY - rect.top;

        // Tilt Calculation (Range of ~20 degrees)
        const rX = (mouseYPos / height - 0.5) * -20;
        const rY = (mouseXPos / width - 0.5) * 20;

        x.set(rX);
        y.set(rY);

        // Shine position
        mouseX.set(mouseXPos);
        mouseY.set(mouseYPos);
    };

    const handleMouseLeave = () => {
        x.set(0);
        y.set(0);
        mouseX.set(0);
        mouseY.set(0);
    };

    return (
        <div className="recipe-card-wrapper">
            <motion.div
                ref={cardRef}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                style={{
                    transformStyle: "preserve-3d",
                    transform,
                }}
                className="recipe-card-container"
            >
                <Link
                    to={`/recipes/${recipe._id}`}
                    className="recipe-card"
                >
                    {/* Shine Overlay */}
                    <motion.div
                        className="shine-overlay"
                        style={{ background }}
                    />

                    <div className="card-image-outer-wrapper">
                        <div className="card-image-wrapper">
                            <img
                                src={recipe.image}
                                alt={recipe.title}
                                className="card-image"
                                loading="lazy"
                            />
                        </div>
                        {/* Prep Time Tag */}
                        <div className="time-tag">
                            {recipe.prepTime || '20 mins'}
                        </div>
                    </div>

                    <div className="card-content">
                        {/* Force truncate title to keep cards symmetrical */}
                        <h3 className="recipe-title">
                            {recipe.title.length > 22
                                ? recipe.title.substring(0, 22) + "..."
                                : recipe.title}
                        </h3>

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
            </motion.div>
        </div>
    );
};

export default RecipeCard;
