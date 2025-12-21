
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import './RecipeDetails.css';

const RecipeDetails = () => {
    const { id } = useParams();
    const [recipe, setRecipe] = useState(null);
    const [loading, setLoading] = useState(true);

    // Portion Calculator State
    const [baseServings, setBaseServings] = useState(4); // Default, updated on fetch
    const [currentServings, setCurrentServings] = useState(4);

    useEffect(() => {
        fetch(`http://localhost:5001/api/recipes/${id}`)
            .then(res => {
                if (!res.ok) {
                    throw new Error('Network response was not ok');
                }
                return res.json();
            })
            .then(data => {
                setRecipe(data);
                if (data && data.servings) {
                    const parsedServings = parseInt(data.servings) || 4;
                    setBaseServings(parsedServings);
                    setCurrentServings(parsedServings);
                }
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setRecipe(null); // Ensure null on error so "Recipe not found" renders
                setLoading(false);
            });
    }, [id]);

    // Adjust Servings
    const updateServings = (change) => {
        const newServings = currentServings + change;
        if (newServings >= 1) {
            setCurrentServings(newServings);
        }
    };

    // Ingredient Scaler Utility
    const scaleIngredient = (ingredientLine) => {
        if (currentServings === baseServings) return ingredientLine;

        const ratio = currentServings / baseServings;

        // Regex to find numbers (integers, decimals, fractions like 1/2)
        // This is a simplified regex.
        return ingredientLine.replace(/(\d+[\/\.]\d+)|\d+/g, (match) => {
            let value;
            // Handle fraction
            if (match.includes('/')) {
                const [num, den] = match.split('/');
                value = parseFloat(num) / parseFloat(den);
            } else {
                value = parseFloat(match);
            }

            let scaled = value * ratio;

            // Format prettily
            // If close to integer, make integer
            if (Math.abs(scaled - Math.round(scaled)) < 0.1) {
                return Math.round(scaled);
            }
            // Limit decimals
            return parseFloat(scaled.toFixed(2));
        });
    };

    if (loading) return <div className="loading">Loading recipe...</div>;
    if (!recipe) return <div className="loading">Recipe not found.</div>;

    return (
        <div className="container recipe-details-page">
            <Link to="/recipes" className="back-link">← Back to Recipes</Link>

            <div className="details-header">
                <h1 className="details-title">{recipe.title}</h1>
                <div className="meta-grid">
                    <div className="meta-item">
                        <span className="meta-label">Total Time</span>
                        <span className="meta-value">{recipe.cookTime || '45 mins'}</span>
                    </div>
                    <div className="meta-item">
                        <span className="meta-label">Prep Time</span>
                        <span className="meta-value">{recipe.prepTime || '15 mins'}</span>
                    </div>
                    <div className="meta-item control-item">
                        <span className="meta-label">Servings</span>
                        <div className="servings-control">
                            <button onClick={() => updateServings(-1)}>−</button>
                            <span className="meta-value">{currentServings}</span>
                            <button onClick={() => updateServings(1)}>+</button>
                        </div>
                    </div>
                    <div className="meta-item">
                        <span className="meta-label">Difficulty</span>
                        <span className="meta-value">{recipe.difficulty || 'Medium'}</span>
                    </div>
                </div>
                <img src={recipe.image} alt={recipe.title} className="details-image" />
            </div>

            <div className="details-content">
                <p className="details-desc">{recipe.description}</p>

                <div className="recipe-grid">
                    <div className="ingredients-section sticky-section">
                        <div className="ingredients-header">
                            <h3>Ingredients</h3>
                            <div className="scaling-switch">
                                <button
                                    className={Math.abs(currentServings - baseServings * 0.5) < 0.001 ? 'active' : ''}
                                    onClick={() => setCurrentServings(baseServings * 0.5)}
                                >
                                    0.5x
                                </button>
                                <button
                                    className={Math.abs(currentServings - baseServings) < 0.001 ? 'active' : ''}
                                    onClick={() => setCurrentServings(baseServings)}
                                >
                                    1x
                                </button>
                                <button
                                    className={Math.abs(currentServings - baseServings * 2) < 0.001 ? 'active' : ''}
                                    onClick={() => setCurrentServings(baseServings * 2)}
                                >
                                    2x
                                </button>
                            </div>
                        </div>
                        <p className="scale-note">Adjusted for {currentServings} servings</p>
                        <ul>
                            {recipe.ingredients.map((ing, index) => (
                                <li key={index}>
                                    <input type="checkbox" id={`ing-${index}`} />
                                    <label htmlFor={`ing-${index}`}>{scaleIngredient(ing)}</label>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="instructions-section">
                        <h3>Instructions</h3>
                        <div className="instructions-list">
                            {recipe.instructions.map((inst, index) => (
                                <div key={index} className="step">
                                    <span className="step-num">{index + 1}</span>
                                    <div className="step-content">
                                        <p>{inst}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {recipe.tips && (
                    <div className="tips-section">
                        <h3>👨‍🍳 Chef's Tips</h3>
                        <p>{recipe.tips}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RecipeDetails;

