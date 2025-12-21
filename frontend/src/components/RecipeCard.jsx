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
    );
};

export default RecipeCard;
