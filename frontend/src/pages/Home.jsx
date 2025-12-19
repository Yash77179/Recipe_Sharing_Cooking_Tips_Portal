import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

const Home = () => {
    // Featured Data
    const featuredRecipes = [
        {
            id: 1,
            title: "Rustic Roasted Tomato Basil Soup",
            category: "Comfort",
            image: "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=800&q=80",
            time: "55 mins"
        },
        {
            id: 2,
            title: "Creamy Butter Chicken",
            category: "Dinner",
            image: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=800&q=80",
            time: "40 mins"
        },
        {
            id: 3,
            title: "Classic Chocolate Chip",
            category: "Dessert",
            image: "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?auto=format&fit=crop&w=800&q=80",
            time: "25 mins"
        }
    ];

    return (
        <div className="home-container">
            {/* Hero Section */}
            <header className="hero-organic">
                <div className="hero-content">
                    <span className="hero-script">Welcome to our kitchen</span>
                    <h1 className="hero-title">
                        Simple Recipes <br />
                        <em>Made for Real Life</em>
                    </h1>
                    <p className="hero-description">
                        From quick weeknight dinners to slow Sunday simmers, discover food that brings people together.
                    </p>
                    <div className="hero-actions">
                        <Link to="/recipes" className="btn-organic-primary">Browse Recipes</Link>
                        <Link to="/about" className="btn-organic-text">Our Story</Link>
                    </div>
                </div>
                <div className="hero-visual">
                    <div className="hero-blob-bg"></div>
                    <img
                        src="https://images.unsplash.com/photo-1495521821757-a1efb6729352?q=80&w=1926&auto=format&fit=crop"
                        alt="Fresh Vegetables"
                        className="hero-img"
                    />
                    <div className="floating-badge">
                        <span>New <br /> Season</span>
                    </div>
                </div>
            </header>

            {/* Featured Collection */}
            <section className="section-organic">
                <div className="section-header-center">
                    <span className="script-sub">Fresh from the Oven</span>
                    <h2 className="section-title">Weekly Favorites</h2>
                </div>

                <div className="cards-scroll-container">
                    {featuredRecipes.map((recipe) => (
                        <div key={recipe.id} className="recipe-card-organic">
                            <div className="card-img-wrapper">
                                <img src={recipe.image} alt={recipe.title} />
                                <span className="card-tag">{recipe.category}</span>
                            </div>
                            <div className="card-info">
                                <h3>{recipe.title}</h3>
                                <div className="card-meta">
                                    <span>⏱️ {recipe.time}</span>
                                    <Link to={`/recipes/${recipe.id}`} className="card-link">View Recipe</Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Narrative / Values Section (Overlapping) */}
            <section className="section-narrative">
                <div className="narrative-container">
                    <div className="narrative-visual">
                        <img
                            src="https://images.unsplash.com/photo-1556910103-1c02745a30bf?q=80&w=2000&auto=format&fit=crop"
                            alt="Cooking Together"
                            className="narrative-img"
                        />
                    </div>
                    <div className="narrative-content">
                        <span className="script-sub">Why We Cook</span>
                        <h2>More Than Just <br /> <em>Ingredients</em></h2>
                        <p>
                            Food is about connection. It's the pause in a busy day, the laughter shared over a simmering pot, and the comfort of a warm meal. We believe in sustainable sourcing, mindful preparation, and the joy of sharing.
                        </p>
                        <ul className="narrative-list">
                            <li>🌿 Seasonal & Fresh</li>
                            <li>🤝 Community Driven</li>
                            <li>✨ Simple & Honest</li>
                        </ul>
                    </div>
                </div>
            </section>

            {/* Newsletter / CTA */}
            <section className="section-cta-blobs">
                <div className="cta-content">
                    <h2>Join Our Table</h2>
                    <p>Get weekly inspiration sent straight to your inbox.</p>
                    <div className="cta-form">
                        <input type="email" placeholder="Your email address" />
                        <button className="btn-organic-dark">Subscribe</button>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;
