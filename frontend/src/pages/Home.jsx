import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCoverflow, Pagination, Autoplay } from 'swiper/modules';
import Footer from '../components/Footer';
import SwipeCards from '../components/SwipeCards';
import VelocityScroll from '../components/VelocityScroll';
import VariableProximity from '../components/VariableProximity';
import CountryNavigation from '../components/CountryNavigation';

import SupremeNewsletter from '../components/SupremeNewsletter';
import OurStoryLink from '../components/OurStoryLink';
import { API_BASE_URL } from '../config';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/effect-coverflow';
import 'swiper/css/pagination';

import './Home.css';

const Home = () => {
    const [randomRecipes, setRandomRecipes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null); // New error state for debugging
    const [activeIndex, setActiveIndex] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const navigate = useNavigate();
    const heroContentRef = useRef(null);

    useEffect(() => {
        const fetchRandomRecipes = async () => {
            try {
                setLoading(true);
                setError(null);

                // Add 10s timeout
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 10000);

                const response = await fetch(`${API_BASE_URL}/recipes/random`, {
                    signal: controller.signal
                });

                clearTimeout(timeoutId);

                if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);

                const data = await response.json();

                if (Array.isArray(data)) {
                    setRandomRecipes(data);
                } else {
                    throw new Error('Data format error: Expected array');
                }
            } catch (error) {
                console.error('Error fetching random recipes:', error);
                setError(error.message); // Set visible error
            } finally {
                setLoading(false);
            }
        };

        fetchRandomRecipes();
    }, []);

    const handleCardClick = (recipeId, slideIndex) => {
        // Don't navigate if user was dragging
        if (isDragging) {
            return;
        }

        // Only navigate if clicking the centered/active slide
        if (slideIndex === activeIndex) {
            navigate(`/recipes/${recipeId}`);
        }
        // Otherwise, Swiper's slideToClickedSlide will center it
    };

    return (
        <div className="home-container">
            {/* Hero Section */}
            <header className="hero-organic">
                <div className="hero-content" ref={heroContentRef}>
                    <span className="hero-script">
                        <VariableProximity
                            label="Welcome to our kitchen"
                            fromFontVariationSettings="'wght' 400, 'opsz' 9"
                            toFontVariationSettings="'wght' 900, 'opsz' 40"
                            containerRef={heroContentRef}
                            radius={100}
                            falloff="linear"
                            style={{ fontFamily: "'Caveat', cursive" }}
                        />
                    </span>
                    <h1 className="hero-title">
                        <VariableProximity
                            label="Simple Recipes"
                            fromFontVariationSettings="'wght' 400, 'opsz' 9"
                            toFontVariationSettings="'wght' 900, 'opsz' 40"
                            containerRef={heroContentRef}
                            radius={100}
                            falloff="linear"
                        />
                        <br />
                        <em>
                            <VariableProximity
                                label="Made for Real Life"
                                fromFontVariationSettings="'wght' 400, 'opsz' 9"
                                toFontVariationSettings="'wght' 900, 'opsz' 40"
                                containerRef={heroContentRef}
                                radius={100}
                                falloff="linear"
                            />
                        </em>
                    </h1>
                    <p className="hero-description">
                        <VariableProximity
                            label="From quick weeknight dinners to slow Sunday simmers, discover food that brings people together."
                            fromFontVariationSettings="'wght' 400, 'opsz' 9"
                            toFontVariationSettings="'wght' 900, 'opsz' 40"
                            containerRef={heroContentRef}
                            radius={100}
                            falloff="linear"
                        />
                    </p>
                    <div className="hero-actions">
                        <Link to="/recipes" className="btn-organic-primary" id="tour-browse-recipes">Browse Recipes</Link>
                        <OurStoryLink />
                    </div>
                </div>
                <div className="hero-visual">
                    <div className="hero-blob-bg"></div>
                    <img
                        src="https://images.unsplash.com/photo-1495521821757-a1efb6729352?q=80&w=1926&auto=format&fit=crop"
                        alt="Fresh Vegetables"
                        className="hero-img"
                    />
                </div>
            </header>

            {/* FLOATING TOUR STICKER - Fixed Bottom Right */}
            <button
                onClick={() => {
                    if (window.confirm("Start the site tour?")) {
                        localStorage.removeItem('hasSeenWebsiteTour');
                        localStorage.removeItem('tour_phase');
                        window.location.href = '/';
                    }
                }}
                className="tour-floating-sticker"
                aria-label="Start Tour"
            >
                <span className="sticker-icon">🧭</span>
                <span className="sticker-text">Take Tour</span>
            </button>

            {/* NEW: Velocity Scroll Marquee - Skew & Speed */}
            <div className="stats-marquee-container-wrapper">
                <VelocityScroll />
            </div>

            {/* 3D Coverflow Carousel Section (PRESERVED) */}
            <section className="section-full-width">
                <div className="section-header-center">
                    <span className="script-sub">Constant Inspiration</span>
                    <h2 className="section-title-no-line">Discover New Flavors</h2>
                </div>

                <div className="carousel-container">
                    {loading ? (
                        <div className="loading-spinner">
                            Loading ideas... <br />
                            <small style={{ fontSize: '0.6rem', color: '#666' }}>({API_BASE_URL})</small>
                        </div>
                    ) : error ? (
                        <div className="loading-error" style={{ textAlign: 'center', padding: '2rem', color: 'red' }}>
                            <p>Failed to load recipes.</p>
                            <small>{error}</small>
                            <br />
                            <small>{API_BASE_URL}</small>
                        </div>
                    ) : (
                        <Swiper
                            effect={'coverflow'}
                            grabCursor={true}
                            centeredSlides={true}
                            loop={true}
                            slidesPerView={'auto'}
                            slideToClickedSlide={true}
                            allowTouchMove={true}
                            simulateTouch={true}
                            touchRatio={1}
                            breakpoints={{
                                768: {
                                    slidesPerView: 3,
                                }
                            }}
                            coverflowEffect={{
                                rotate: 50,
                                stretch: 0,
                                depth: 100,
                                modifier: 1,
                                slideShadows: true,
                            }}
                            pagination={true}
                            preventClicks={false}
                            preventClicksPropagation={false}
                            autoplay={{
                                delay: 2500,
                                disableOnInteraction: false,
                            }}
                            onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
                            onTouchStart={() => setIsDragging(false)}
                            onTouchMove={() => setIsDragging(true)}
                            onTouchEnd={() => setTimeout(() => setIsDragging(false), 50)}
                            modules={[EffectCoverflow, Pagination, Autoplay]}
                            className="mySwiper"
                        >
                            {randomRecipes.map((recipe, index) => (
                                <SwiperSlide key={`${recipe._id}-${index}`} className="swiper-slide-custom">
                                    <div
                                        onClick={() => handleCardClick(recipe._id, index)}
                                        className="marquee-card-premium cursor-pointer"
                                        role="button"
                                        tabIndex={0}
                                    >
                                        <div className="premium-img-wrapper">
                                            <img src={recipe.image} alt={recipe.title} />
                                            <div className="premium-overlay">
                                            </div>
                                        </div>
                                        <div className="premium-card-info">
                                            <div className="premium-card-header">
                                                <span className="premium-difficulty">{recipe.difficulty || 'Easy'}</span>
                                                <span className="premium-time">{recipe.prepTime || '30 min'}</span>
                                            </div>
                                            <h4>{recipe.title}</h4>
                                            <div className="premium-card-footer">
                                                <span className="cook-now-text">Cook Now <span className="arrow">→</span></span>
                                            </div>
                                        </div>
                                    </div>
                                </SwiperSlide>
                            ))}
                        </Swiper>
                    )}
                </div>
            </section>

            {/* NEW: Country Navigation Section */}
            <section className="home-categories">
                <div className="section-header-center">
                    <span className="script-sub">Explore Global Flavors</span>
                    <h2 className="section-title-no-line">Discover by Country</h2>
                </div>
                <CountryNavigation />
            </section>

            {/* Narrative / Values Section (Only Cards now) */}
            <section className="section-narrative">
                <div className="narrative-container-centered">
                    <div className="narrative-visual-centered">
                        <SwipeCards />
                    </div>
                </div>
            </section>

            {/* Newsletter / CTA */}
            <SupremeNewsletter />

            <Footer />
        </div>
    );
};

export default Home;
