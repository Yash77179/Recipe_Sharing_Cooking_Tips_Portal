import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import './AddRecipe.css';

/**
 * AddRecipe Page Component
 * Implements a multi-step dashboard wizard for creating recipes.
 * Features a split-screen layout with sidebar navigation, validation,
 * and animated transitions between steps (Basics -> Details -> Method -> Preview).
 */
const AddRecipe = () => {
    const navigate = useNavigate();
    const [[step, direction], setPage] = useState([1, 0]);
    const currentStep = step;
    const [formData, setFormData] = useState({
        title: '',
        image: '',
        description: '',
        ingredients: '',
        instructions: '',
        tips: '',
        prepTime: '',
        cookTime: '',
        servings: '',
        difficulty: 'Medium',
        cuisine: 'Global',
        dietaryType: 'Veg'
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) navigate('/login');
    }, [navigate]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const nextStep = () => setPage([step + 1, 1]);
    const prevStep = () => setPage([step - 1, -1]);

    const handleSubmit = async () => {
        setLoading(true);
        setError('');
        const token = localStorage.getItem('token');

        const payload = {
            ...formData,
            ingredients: formData.ingredients.split('\n').filter(i => i.trim()),
            instructions: formData.instructions.split('\n').filter(i => i.trim())
        };

        try {
            const res = await fetch('http://localhost:5001/api/recipes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            const data = await res.json();
            if (res.ok) {
                navigate('/profile');
            } else {
                setError(data.message || 'Failed to create recipe');
            }
        } catch (err) {
            setError('Error connecting to server');
        } finally {
            setLoading(false);
        }
    };

    const steps = [
        { id: 1, label: 'The Basics' },
        { id: 2, label: 'Key Details' },
        { id: 3, label: 'Method' },
        { id: 4, label: 'Preview' }
    ];

    // Animation Variants
    const pageVariants = {
        initial: (direction) => ({
            x: direction > 0 ? 1000 : -1000,
            opacity: 0
        }),
        in: {
            x: 0,
            opacity: 1
        },
        out: (direction) => ({
            x: direction < 0 ? 1000 : -1000,
            opacity: 0
        })
    };

    const pageTransition = {
        type: 'tween',
        ease: 'easeInOut',
        duration: 0.5
    };

    return (
        <div className="add-recipe-container">
            {/* Sidebar */}
            <div className="recipe-sidebar">
                <div className="sidebar-logo">FlavorFlow</div>
                <div className="steps-nav">
                    {steps.map(step => (
                        <div
                            key={step.id}
                            className={`step-item ${currentStep === step.id ? 'active' : ''} ${currentStep > step.id ? 'completed' : ''}`}
                            onClick={() => currentStep > step.id && setPage([step.id, -1])}
                        >
                            <div className="step-number">{currentStep > step.id ? '✓' : step.id}</div>
                            <span className="step-label">{step.label}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Main Content */}
            <div className="recipe-main-content">
                {/* Floating Background Icons */}
                <div className="floating-background">
                    <span className="floating-icon" style={{ top: '10%', left: '10%', animationDelay: '0s' }}>🍳</span>
                    <span className="floating-icon" style={{ top: '20%', right: '20%', animationDelay: '2s' }}>🥬</span>
                    <span className="floating-icon" style={{ bottom: '15%', left: '30%', animationDelay: '4s' }}>🥕</span>
                    <span className="floating-icon" style={{ top: '40%', right: '10%', animationDelay: '6s' }}>🥩</span>
                    <span className="floating-icon" style={{ bottom: '30%', right: '30%', animationDelay: '8s' }}>🧂</span>
                    <span className="floating-icon" style={{ top: '60%', left: '5%', animationDelay: '10s' }}>🍅</span>
                    <span className="floating-icon" style={{ top: '15%', left: '40%', animationDelay: '1.5s' }}>🥣</span>
                    <span className="floating-icon" style={{ top: '75%', right: '15%', animationDelay: '3.5s' }}>🥡</span>
                    <span className="floating-icon" style={{ bottom: '5%', left: '70%', animationDelay: '5.5s' }}>🥖</span>
                    <span className="floating-icon" style={{ top: '85%', left: '20%', animationDelay: '7.5s' }}>🧀</span>
                    <span className="floating-icon" style={{ top: '5%', right: '50%', animationDelay: '9.5s' }}>🍤</span>
                    <span className="floating-icon" style={{ bottom: '45%', left: '10%', animationDelay: '11.5s' }}>🧁</span>
                    <span className="floating-icon" style={{ top: '50%', right: '5%', animationDelay: '13.5s' }}>🍷</span>
                </div>

                <AnimatePresence mode="wait" custom={direction}>
                    <motion.div
                        key={currentStep}
                        custom={direction}
                        className="form-step-container"
                        initial="initial"
                        animate="in"
                        exit="out"
                        variants={pageVariants}
                        transition={pageTransition}
                    >
                        {error && <div className="error-message" style={{ marginBottom: '1rem' }}>{error}</div>}

                        {currentStep === 1 && (
                            <>
                                <div className="step-header">
                                    <h2 className="step-title">Let's start with the basics</h2>
                                    <p className="step-subtitle">Every great dish starts with a name and a story.</p>
                                </div>
                                <div className="form-group-modern">
                                    <label>Recipe Title</label>
                                    <input
                                        className="form-input-modern"
                                        type="text"
                                        name="title"
                                        value={formData.title}
                                        onChange={handleChange}
                                        placeholder="e.g. Grandma's Apple Pie"
                                    />
                                </div>
                                <div className="form-group-modern">
                                    <label>Description</label>
                                    <textarea
                                        className="form-textarea-modern"
                                        name="description"
                                        rows="4"
                                        value={formData.description}
                                        onChange={handleChange}
                                        placeholder="Tell us about this dish..."
                                    />
                                </div>
                                <div className="form-group-modern">
                                    <label>Cover Image URL</label>
                                    <input
                                        className="form-input-modern"
                                        type="url"
                                        name="image"
                                        value={formData.image}
                                        onChange={handleChange}
                                        placeholder="https://..."
                                    />
                                </div>
                            </>
                        )}

                        {currentStep === 2 && (
                            <>
                                <div className="step-header">
                                    <h2 className="step-title">The Nitty Gritty</h2>
                                    <p className="step-subtitle">Time and difficulty help others plan.</p>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                    <div className="form-group-modern">
                                        <label>Prep Time</label>
                                        <input className="form-input-modern" name="prepTime" value={formData.prepTime} onChange={handleChange} placeholder="e.g. 20 mins" />
                                    </div>
                                    <div className="form-group-modern">
                                        <label>Cook Time</label>
                                        <input className="form-input-modern" name="cookTime" value={formData.cookTime} onChange={handleChange} placeholder="e.g. 45 mins" />
                                    </div>
                                    <div className="form-group-modern">
                                        <label>Servings</label>
                                        <input className="form-input-modern" name="servings" value={formData.servings} onChange={handleChange} placeholder="e.g. 4" />
                                    </div>
                                    <div className="form-group-modern">
                                        <label>Difficulty</label>
                                        <select className="form-select-modern" name="difficulty" value={formData.difficulty} onChange={handleChange}>
                                            <option value="Easy">Easy</option>
                                            <option value="Medium">Medium</option>
                                            <option value="Hard">Hard</option>
                                        </select>
                                    </div>
                                    <div className="form-group-modern">
                                        <label>Cuisine</label>
                                        <input className="form-input-modern" name="cuisine" value={formData.cuisine} onChange={handleChange} placeholder="e.g. Italian" />
                                    </div>
                                    <div className="form-group-modern">
                                        <label>Dietary Type</label>
                                        <select className="form-select-modern" name="dietaryType" value={formData.dietaryType} onChange={handleChange}>
                                            <option value="Veg">Vegetarian</option>
                                            <option value="Non-Veg">Non-Vegetarian</option>
                                            <option value="Vegan">Vegan</option>
                                        </select>
                                    </div>
                                </div>
                            </>
                        )}

                        {currentStep === 3 && (
                            <>
                                <div className="step-header">
                                    <h2 className="step-title">The Method</h2>
                                    <p className="step-subtitle">Detail the ingredients and steps clearly.</p>
                                </div>
                                <div className="form-group-modern">
                                    <label>Ingredients (One per line)</label>
                                    <textarea className="form-textarea-modern" name="ingredients" rows="6" value={formData.ingredients} onChange={handleChange} placeholder="- 2 cups Flour..." />
                                </div>
                                <div className="form-group-modern">
                                    <label>Instructions (One step per line)</label>
                                    <textarea className="form-textarea-modern" name="instructions" rows="6" value={formData.instructions} onChange={handleChange} placeholder="1. Preheat the oven..." />
                                </div>
                                <div className="form-group-modern">
                                    <label>Pro Tips (Optional)</label>
                                    <textarea className="form-textarea-modern" name="tips" rows="2" value={formData.tips} onChange={handleChange} placeholder="Any secrets?" />
                                </div>
                            </>
                        )}

                        {currentStep === 4 && (
                            <>
                                <div className="step-header">
                                    <h2 className="step-title">Ready to Publish?</h2>
                                    <p className="step-subtitle">Review your recipe before sharing it with the world.</p>
                                </div>
                                <div className="preview-grid">
                                    {formData.image && <img src={formData.image} alt="Preview" style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '12px', marginBottom: '1rem' }} />}
                                    <h3 style={{ fontFamily: 'Playfair Display', fontSize: '2rem', marginBottom: '0.5rem' }}>{formData.title || 'Untitled Recipe'}</h3>
                                    <p style={{ color: '#666', marginBottom: '1.5rem' }}>{formData.description}</p>

                                    <div className="preview-row">
                                        <span className="preview-label">Details</span>
                                        <p>{formData.prepTime} Prep • {formData.cookTime} Cook • {formData.servings} Servings</p>
                                    </div>
                                    <div className="preview-row">
                                        <span className="preview-label">Category</span>
                                        <p>{formData.cuisine} • {formData.dietaryType} • {formData.difficulty}</p>
                                    </div>
                                </div>
                            </>
                        )}

                        {/* Navigation Buttons */}
                        <div className="nav-buttons">
                            {currentStep > 1 ? (
                                <button className="nav-btn btn-secondary" onClick={prevStep}>Back</button>
                            ) : <div></div>}

                            {currentStep < 4 ? (
                                <button className="nav-btn btn-primary" onClick={nextStep}>Next step</button>
                            ) : (
                                <button className="nav-btn btn-primary" onClick={handleSubmit} disabled={loading}>
                                    {loading ? 'Publishing...' : 'Publish Recipe'}
                                </button>
                            )}
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
};

export default AddRecipe;
