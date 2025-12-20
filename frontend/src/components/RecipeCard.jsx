import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './RecipeCard.css';

gsap.registerPlugin(ScrollTrigger, useGSAP);

const RecipeCard = ({ recipe }) => {
    const [liked, setLiked] = useState(false);
    const cardRef = useRef(null);
    const imageRef = useRef(null);
    const titleRef = useRef(null);

    const toggleLike = (e) => {
        e.preventDefault(); // Prevent navigation
        setLiked(!liked);
    };

    // No scroll entrance animation as requested


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
        <Link
            to={`/recipe/${recipe._id}`}
            className="recipe-card"
            ref={cardRef}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <div className="card-image-wrapper">
                <img
                    src={recipe.image}
                    alt={recipe.title}
                    className="card-image"
                    loading="lazy"
                    ref={imageRef}
                />

                {/* Minimalist Like Button Overlay */}
                <button className={`like-btn ${liked ? 'liked' : ''}`} onClick={toggleLike}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill={liked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                    </svg>
                </button>

                {/* Prep Time Tag */}
                <div className="time-tag">
                    {recipe.prepTime || '20 min'}
                </div>
            </div>

            <div className="card-content">
                <div className="card-top-meta">
                    <span className={`diet-dot ${recipe.dietaryType === 'Non-Veg' ? 'non-veg' : 'veg'}`}></span>
                    <span className="card-category">{recipe.cuisine || 'RECIPES'}</span>
                    <span className="card-dot">•</span>
                    <span className="card-difficulty">{recipe.difficulty || 'Medium'}</span>
                </div>

                <h3 className="card-title" ref={titleRef}>{recipe.title}</h3>

                <div className="card-bottom-meta">
                    <span>View Recipe</span>
                    <svg className="arrow-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                </div>
            </div>
        </Link>
    );
};

export default RecipeCard;
