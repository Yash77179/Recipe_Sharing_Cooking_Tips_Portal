import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { API_BASE_URL } from '../config';
import './AddRecipe.css';

/**
 * AddRecipe Page - FUNKY 3-STEP with INTERACTIVE LISTS
 */
const AddRecipe = () => {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState({
        title: '',
        image: '',
        description: '',
        prepTime: '',
        cookTime: '',
        servings: '',
        difficulty: 'Medium',
        cuisine: 'Global',
        dietaryType: 'Veg',
        tips: ''
    });
    const [ingredients, setIngredients] = useState([]);
    const [instructions, setInstructions] = useState([]);
    const [newIngredient, setNewIngredient] = useState('');
    const [newInstruction, setNewInstruction] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) navigate('/login');
    }, [navigate]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Ingredient functions
    const addIngredient = () => {
        if (newIngredient.trim()) {
            setIngredients([...ingredients, newIngredient.trim()]);
            setNewIngredient('');
        }
    };

    const removeIngredient = (index) => {
        setIngredients(ingredients.filter((_, i) => i !== index));
    };

    const moveIngredient = (index, direction) => {
        const newIngredients = [...ingredients];
        const newIndex = direction === 'up' ? index - 1 : index + 1;
        if (newIndex >= 0 && newIndex < ingredients.length) {
            [newIngredients[index], newIngredients[newIndex]] = [newIngredients[newIndex], newIngredients[index]];
            setIngredients(newIngredients);
        }
    };

    // Instruction functions
    const addInstruction = () => {
        if (newInstruction.trim()) {
            setInstructions([...instructions, newInstruction.trim()]);
            setNewInstruction('');
        }
    };

    const removeInstruction = (index) => {
        setInstructions(instructions.filter((_, i) => i !== index));
    };

    const moveInstruction = (index, direction) => {
        const newInstructions = [...instructions];
        const newIndex = direction === 'up' ? index - 1 : index + 1;
        if (newIndex >= 0 && newIndex < instructions.length) {
            [newInstructions[index], newInstructions[newIndex]] = [newInstructions[newIndex], newInstructions[index]];
            setInstructions(newInstructions);
        }
    };

    const nextStep = () => {
        setError('');
        // Validate step 1 before moving forward
        if (currentStep === 1) {
            if (!formData.title.trim()) {
                setError('Recipe title is required');
                return;
            }
            if (formData.title.trim().length < 3) {
                setError('Recipe title must be at least 3 characters');
                return;
            }
            if (!formData.image.trim()) {
                setError('Recipe image URL is required');
                return;
            }
            // Basic URL validation
            try {
                new URL(formData.image);
            } catch {
                setError('Please provide a valid image URL');
                return;
            }
            if (!formData.description.trim()) {
                setError('Recipe description is required');
                return;
            }
            if (formData.description.trim().length < 10) {
                setError('Recipe description must be at least 10 characters');
                return;
            }
        }
        
        setCurrentStep(prev => Math.min(prev + 1, 3));
    };
    
    const prevStep = () => {
        setError('');
        setCurrentStep(prev => Math.max(prev - 1, 1));
    };

    const handleSubmit = async () => {
        setLoading(true);
        setError('');
        
        // Validate required fields before submission
        if (!formData.title.trim() || formData.title.trim().length < 3) {
            setError('Recipe title is required and must be at least 3 characters');
            setLoading(false);
            return;
        }
        if (!formData.image.trim()) {
            setError('Recipe image URL is required');
            setLoading(false);
            return;
        }
        if (!formData.description.trim() || formData.description.trim().length < 10) {
            setError('Recipe description is required and must be at least 10 characters');
            setLoading(false);
            return;
        }
        
        const token = localStorage.getItem('token');

        const payload = {
            ...formData,
            ingredients,
            instructions
        };

        try {
            const res = await fetch(`${API_BASE_URL}/recipes`, {
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
                // Show detailed validation errors if available
                if (data.errors && data.errors.length > 0) {
                    const errorMessages = data.errors.map(err => `${err.field}: ${err.message}`).join('\n');
                    setError(`Validation failed:\n${errorMessages}`);
                } else {
                    setError(data.message || 'Failed to create recipe');
                }
            }
        } catch (err) {
            setError('Error connecting to server');
        } finally {
            setLoading(false);
        }
    };

    const pageVariants = {
        initial: { opacity: 0, x: 100 },
        in: { opacity: 1, x: 0 },
        out: { opacity: 0, x: -100 }
    };

    return (
        <div className="add-recipe-funky-container">
            {/* Progress Dots */}
            <div className="funky-progress-dots">
                {[1, 2, 3].map(step => (
                    <div
                        key={step}
                        className={`progress-dot ${currentStep >= step ? 'active' : ''}`}
                        onClick={() => step < currentStep && setCurrentStep(step)}
                    >
                        {currentStep > step ? '✓' : step}
                    </div>
                ))}
            </div>

            {/* Main Content Card */}
            <div className="funky-form-card">
                {error && <div className="funky-error">{error}</div>}

                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentStep}
                        variants={pageVariants}
                        initial="initial"
                        animate="in"
                        exit="out"
                        transition={{ duration: 0.3 }}
                        className="step-content"
                    >
                        {/* STEP 1: Basics */}
                        {currentStep === 1 && (
                            <div className="funky-step">
                                <div className="step-header-funky">
                                    <span className="step-emoji">🍳</span>
                                    <h2>What's Cooking?</h2>
                                    <p>Let's start with the essentials</p>
                                </div>

                                <div className="funky-form-group">
                                    <label>Recipe Name *</label>
                                    <input
                                        type="text"
                                        name="title"
                                        value={formData.title}
                                        onChange={handleChange}
                                        placeholder="e.g., Grandma's Secret Pasta"
                                        className="funky-input-field"
                                    />
                                </div>

                                <div className="funky-form-group">
                                    <label>Cover Image URL *</label>
                                    <input
                                        type="url"
                                        name="image"
                                        value={formData.image}
                                        onChange={handleChange}
                                        placeholder="https://..."
                                        className="funky-input-field"
                                    />
                                    {formData.image && (
                                        <div className="funky-image-preview">
                                            <img src={formData.image} alt="Preview" />
                                        </div>
                                    )}
                                </div>

                                <div className="funky-form-group">
                                    <label>Tell the Story</label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleChange}
                                        placeholder="What makes this recipe special?"
                                        className="funky-textarea-field"
                                        rows="4"
                                    />
                                </div>
                            </div>
                        )}

                        {/* STEP 2: Details */}
                        {currentStep === 2 && (
                            <div className="funky-step">
                                <div className="step-header-funky">
                                    <span className="step-emoji">⏱️</span>
                                    <h2>The Details</h2>
                                    <p>Time, difficulty, and more</p>
                                </div>

                                <div className="funky-grid-2">
                                    <div className="funky-form-group">
                                        <label>Prep Time</label>
                                        <input
                                            type="text"
                                            name="prepTime"
                                            value={formData.prepTime}
                                            onChange={handleChange}
                                            placeholder="20 mins"
                                            className="funky-input-field"
                                        />
                                    </div>
                                    <div className="funky-form-group">
                                        <label>Cook Time</label>
                                        <input
                                            type="text"
                                            name="cookTime"
                                            value={formData.cookTime}
                                            onChange={handleChange}
                                            placeholder="45 mins"
                                            className="funky-input-field"
                                        />
                                    </div>
                                    <div className="funky-form-group">
                                        <label>Servings</label>
                                        <input
                                            type="text"
                                            name="servings"
                                            value={formData.servings}
                                            onChange={handleChange}
                                            placeholder="4"
                                            className="funky-input-field"
                                        />
                                    </div>
                                    <div className="funky-form-group">
                                        <label>Difficulty</label>
                                        <select
                                            name="difficulty"
                                            value={formData.difficulty}
                                            onChange={handleChange}
                                            className="funky-select-field"
                                        >
                                            <option value="Easy">Easy</option>
                                            <option value="Medium">Medium</option>
                                            <option value="Hard">Hard</option>
                                        </select>
                                    </div>
                                    <div className="funky-form-group">
                                        <label>Cuisine</label>
                                        <input
                                            type="text"
                                            name="cuisine"
                                            value={formData.cuisine}
                                            onChange={handleChange}
                                            placeholder="Italian"
                                            className="funky-input-field"
                                        />
                                    </div>
                                    <div className="funky-form-group">
                                        <label>Dietary Type</label>
                                        <select
                                            name="dietaryType"
                                            value={formData.dietaryType}
                                            onChange={handleChange}
                                            className="funky-select-field"
                                        >
                                            <option value="Veg">Vegetarian</option>
                                            <option value="Non-Veg">Non-Vegetarian</option>
                                            <option value="Vegan">Vegan</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* STEP 3: Recipe with Interactive Lists */}
                        {currentStep === 3 && (
                            <div className="funky-step">
                                <div className="step-header-funky">
                                    <span className="step-emoji">👨‍🍳</span>
                                    <h2>The Magic</h2>
                                    <p>Ingredients and instructions</p>
                                </div>

                                {/* INGREDIENTS LIST */}
                                <div className="funky-form-group">
                                    <label>Ingredients</label>
                                    <div className="add-item-container">
                                        <input
                                            type="text"
                                            value={newIngredient}
                                            onChange={(e) => setNewIngredient(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && addIngredient()}
                                            placeholder="e.g., 2 cups flour"
                                            className="funky-input-field"
                                        />
                                        <button onClick={addIngredient} className="add-item-btn">
                                            + Add
                                        </button>
                                    </div>
                                    <div className="items-list">
                                        {ingredients.map((ingredient, index) => (
                                            <div key={index} className="list-item">
                                                <span className="item-number">{index + 1}.</span>
                                                <span className="item-text">{ingredient}</span>
                                                <div className="item-actions">
                                                    <button
                                                        onClick={() => moveIngredient(index, 'up')}
                                                        disabled={index === 0}
                                                        className="move-btn"
                                                    >
                                                        ↑
                                                    </button>
                                                    <button
                                                        onClick={() => moveIngredient(index, 'down')}
                                                        disabled={index === ingredients.length - 1}
                                                        className="move-btn"
                                                    >
                                                        ↓
                                                    </button>
                                                    <button
                                                        onClick={() => removeIngredient(index)}
                                                        className="remove-btn"
                                                    >
                                                        ×
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* INSTRUCTIONS LIST */}
                                <div className="funky-form-group">
                                    <label>Instructions</label>
                                    <div className="add-item-container">
                                        <input
                                            type="text"
                                            value={newInstruction}
                                            onChange={(e) => setNewInstruction(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && addInstruction()}
                                            placeholder="e.g., Preheat oven to 350°F"
                                            className="funky-input-field"
                                        />
                                        <button onClick={addInstruction} className="add-item-btn">
                                            + Add
                                        </button>
                                    </div>
                                    <div className="items-list">
                                        {instructions.map((instruction, index) => (
                                            <div key={index} className="list-item">
                                                <span className="item-number">{index + 1}.</span>
                                                <span className="item-text">{instruction}</span>
                                                <div className="item-actions">
                                                    <button
                                                        onClick={() => moveInstruction(index, 'up')}
                                                        disabled={index === 0}
                                                        className="move-btn"
                                                    >
                                                        ↑
                                                    </button>
                                                    <button
                                                        onClick={() => moveInstruction(index, 'down')}
                                                        disabled={index === instructions.length - 1}
                                                        className="move-btn"
                                                    >
                                                        ↓
                                                    </button>
                                                    <button
                                                        onClick={() => removeInstruction(index)}
                                                        className="remove-btn"
                                                    >
                                                        ×
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* PRO TIPS */}
                                <div className="funky-form-group">
                                    <label>Pro Tips (Optional)</label>
                                    <textarea
                                        name="tips"
                                        value={formData.tips}
                                        onChange={handleChange}
                                        placeholder="Any secret tricks?"
                                        className="funky-textarea-field"
                                        rows="3"
                                    />
                                </div>
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>

                {/* Navigation Buttons */}
                <div className="funky-nav-buttons">
                    {currentStep > 1 && (
                        <button className="funky-btn funky-btn-back" onClick={prevStep}>
                            ← Back
                        </button>
                    )}
                    {currentStep < 3 ? (
                        <button className="funky-btn funky-btn-next" onClick={nextStep}>
                            Next →
                        </button>
                    ) : (
                        <button
                            className="funky-btn funky-btn-publish"
                            onClick={handleSubmit}
                            disabled={loading || !formData.title}
                        >
                            {loading ? '🔄 Publishing...' : '🚀 Publish Recipe'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AddRecipe;
