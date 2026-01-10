import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { API_BASE_URL } from '../config';
import './AddRecipe.css';
import './Profile.css'; // Find shared styles here

/**
 * AddRecipe Page - Brutalist Kitchen Station Edition
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
            if (!formData.image.trim()) {
                setError('Recipe image URL is required');
                return;
            }
            if (!formData.description.trim()) {
                setError('Recipe description is required');
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
                setError(data.message || 'Failed to create recipe');
            }
        } catch (err) {
            setError('Error connecting to server');
        } finally {
            setLoading(false);
        }
    };

    const pageVariants = {
        initial: { opacity: 0, x: 20 },
        in: { opacity: 1, x: 0 },
        out: { opacity: 0, x: -20 }
    };

    return (
        <div className="add-recipe-page-container">
            {/* Marquee Header */}
            <div className="kitchen-marquee-strip">
                <div className="marquee-content">
                    <span>KITCHEN STATION • NEW RECIPE ENTRY • BRUTALIST UI • KITCHEN STATION • NEW RECIPE ENTRY • BRUTALIST UI</span>
                    <span>KITCHEN STATION • NEW RECIPE ENTRY • BRUTALIST UI • KITCHEN STATION • NEW RECIPE ENTRY • BRUTALIST UI</span>
                    <span>KITCHEN STATION • NEW RECIPE ENTRY • BRUTALIST UI • KITCHEN STATION • NEW RECIPE ENTRY • BRUTALIST UI</span>
                </div>
            </div>

            <div className="kitchen-log-container">
                <div className="kitchen-section-header">
                    <div className="header-left">
                        <span className="log-id">LOG_NEW</span>
                        <h2>CREATE NEW RECIPE</h2>
                    </div>
                    <button className="btn-brutalist-exit" onClick={() => navigate('/profile')}>
                        EXIT_STATION ✕
                    </button>
                    <div className="header-line"></div>
                </div>

                <div className="brutalist-form-wrapper">
                    {/* Progress Header */}
                    <div className="brutalist-progress-bar">
                        <div className={`progress-step ${currentStep >= 1 ? 'active' : ''}`}>01. DETAILS</div>
                        <div className="progress-line"></div>
                        <div className={`progress-step ${currentStep >= 2 ? 'active' : ''}`}>02. SPECS</div>
                        <div className="progress-line"></div>
                        <div className={`progress-step ${currentStep >= 3 ? 'active' : ''}`}>03. EXECUTION</div>
                    </div>

                    {error && <div className="brutalist-error-banner">⚠ {error}</div>}

                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentStep}
                            variants={pageVariants}
                            initial="initial"
                            animate="in"
                            exit="out"
                            transition={{ duration: 0.2 }}
                            className="brutalist-step-content"
                        >
                            {/* STEP 1: Basics */}
                            {currentStep === 1 && (
                                <div className="brutalist-step">
                                    <h3>RECIPE_MANIFEST_01</h3>

                                    <div className="brutalist-field-group">
                                        <label>TITLE / NAME</label>
                                        <input
                                            type="text"
                                            name="title"
                                            value={formData.title}
                                            onChange={handleChange}
                                            placeholder="ENTER RECIPE TITLE..."
                                            className="brutalist-input"
                                        />
                                    </div>

                                    <div className="brutalist-field-group">
                                        <label>COVER IMAGE SOURCE</label>
                                        <input
                                            type="url"
                                            name="image"
                                            value={formData.image}
                                            onChange={handleChange}
                                            placeholder="HTTP://..."
                                            className="brutalist-input"
                                        />
                                        {formData.image && (
                                            <div className="brutalist-img-preview">
                                                <img src={formData.image} alt="Ref" />
                                            </div>
                                        )}
                                    </div>

                                    <div className="brutalist-field-group">
                                        <label>DESCRIPTION / ABSTRACT</label>
                                        <textarea
                                            name="description"
                                            value={formData.description}
                                            onChange={handleChange}
                                            placeholder="DESCRIBE THE DISH..."
                                            className="brutalist-textarea"
                                            rows="5"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* STEP 2: Details */}
                            {currentStep === 2 && (
                                <div className="brutalist-step">
                                    <h3>TECH_SPECS_02</h3>

                                    <div className="brutalist-grid-2">
                                        <div className="brutalist-field-group">
                                            <label>PREP_TIME</label>
                                            <input type="text" name="prepTime" value={formData.prepTime} onChange={handleChange} placeholder="20 MINS" className="brutalist-input" />
                                        </div>
                                        <div className="brutalist-field-group">
                                            <label>COOK_TIME</label>
                                            <input type="text" name="cookTime" value={formData.cookTime} onChange={handleChange} placeholder="45 MINS" className="brutalist-input" />
                                        </div>
                                        <div className="brutalist-field-group">
                                            <label>YIELD / SERVINGS</label>
                                            <input type="text" name="servings" value={formData.servings} onChange={handleChange} placeholder="04" className="brutalist-input" />
                                        </div>
                                        <div className="brutalist-field-group">
                                            <label>COMPLEXITY</label>
                                            <select name="difficulty" value={formData.difficulty} onChange={handleChange} className="brutalist-select">
                                                <option value="Easy">EASY</option>
                                                <option value="Medium">MEDIUM</option>
                                                <option value="Hard">HARD</option>
                                            </select>
                                        </div>
                                        <div className="brutalist-field-group">
                                            <label>ORIGIN / CUISINE</label>
                                            <input type="text" name="cuisine" value={formData.cuisine} onChange={handleChange} placeholder="GLOBAL" className="brutalist-input" />
                                        </div>
                                        <div className="brutalist-field-group">
                                            <label>DIETARY_CLASS</label>
                                            <select name="dietaryType" value={formData.dietaryType} onChange={handleChange} className="brutalist-select">
                                                <option value="Veg">VEGETARIAN</option>
                                                <option value="Non-Veg">NON-VEG</option>
                                                <option value="Vegan">VEGAN</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* STEP 3: Execution */}
                            {currentStep === 3 && (
                                <div className="brutalist-step">
                                    <h3>EXECUTION_LOG_03</h3>

                                    {/* INGREDIENTS */}
                                    <div className="brutalist-field-group">
                                        <label>COMPONENT_LIST (INGREDIENTS)</label>
                                        <div className="brutalist-add-row">
                                            <input
                                                type="text"
                                                value={newIngredient}
                                                onChange={(e) => setNewIngredient(e.target.value)}
                                                onKeyPress={(e) => e.key === 'Enter' && addIngredient()}
                                                placeholder="ADD COMPONENT..."
                                                className="brutalist-input"
                                            />
                                            <button onClick={addIngredient} className="btn-brutalist-action">+</button>
                                        </div>
                                        <div className="brutalist-list">
                                            {ingredients.map((item, idx) => (
                                                <div key={idx} className="brutalist-list-item">
                                                    <span className="idx">[{idx + 1}]</span>
                                                    <span className="txt">{item}</span>
                                                    <button onClick={() => removeIngredient(idx)} className="btn-del">×</button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* INSTRUCTIONS */}
                                    <div className="brutalist-field-group">
                                        <label>SEQUENCE (INSTRUCTIONS)</label>
                                        <div className="brutalist-add-row">
                                            <input
                                                type="text"
                                                value={newInstruction}
                                                onChange={(e) => setNewInstruction(e.target.value)}
                                                onKeyPress={(e) => e.key === 'Enter' && addInstruction()}
                                                placeholder="ADD STEP..."
                                                className="brutalist-input"
                                            />
                                            <button onClick={addInstruction} className="btn-brutalist-action">+</button>
                                        </div>
                                        <div className="brutalist-list">
                                            {instructions.map((item, idx) => (
                                                <div key={idx} className="brutalist-list-item">
                                                    <span className="idx">STEP_{idx + 1}</span>
                                                    <span className="txt">{item}</span>
                                                    <button onClick={() => removeInstruction(idx)} className="btn-del">×</button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="brutalist-field-group">
                                        <label>PRO_TIPS_NOTES</label>
                                        <textarea
                                            name="tips"
                                            value={formData.tips}
                                            onChange={handleChange}
                                            placeholder="OPTIONAL NOTES..."
                                            className="brutalist-textarea"
                                            rows="3"
                                        />
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>

                    {/* Controls */}
                    <div className="brutalist-controls">
                        {currentStep > 1 && (
                            <button className="btn-brutalist-secondary" onClick={prevStep}>
                                ← BACK
                            </button>
                        )}
                        <div className="spacer"></div>
                        {currentStep < 3 ? (
                            <button className="btn-brutalist-primary" onClick={nextStep}>
                                NEXT_PHASE →
                            </button>
                        ) : (
                            <button
                                className="btn-brutalist-primary"
                                onClick={handleSubmit}
                                disabled={loading}
                            >
                                {loading ? 'PROCESSING...' : 'INITIALIZE_RECIPE'}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddRecipe;
