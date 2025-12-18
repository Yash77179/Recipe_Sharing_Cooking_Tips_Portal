import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AddRecipe.css';

const AddRecipe = () => {
    const navigate = useNavigate();
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
        difficulty: 'Medium'
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Check if user is logged in
    React.useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
        }
    }, [navigate]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }

        // Parse ingredients and instructions
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
                if (res.status === 401) {
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    navigate('/login');
                } else {
                    setError(data.message || 'Failed to create recipe');
                }
            }
        } catch (err) {
            console.error(err);
            setError('Error connecting to server');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container add-recipe-page">
            <div className="form-wrapper">
                <h1 className="form-title">Share Your Culinary Masterpiece</h1>
                <p className="form-subtitle">Join our community of home cooks and chefs.</p>

                {error && <div className="error-message">{error}</div>}

                <form onSubmit={handleSubmit} className="recipe-form">
                    <div className="form-section">
                        <h3>Basic Info</h3>
                        <div className="form-group">
                            <label>Recipe Title</label>
                            <input type="text" name="title" required value={formData.title} onChange={handleChange} placeholder="e.g. Classic Tiramisu" />
                        </div>

                        <div className="form-group">
                            <label>Image URL</label>
                            <input type="url" name="image" required value={formData.image} onChange={handleChange} placeholder="https://example.com/image.jpg" />
                        </div>

                        <div className="form-group">
                            <label>Description</label>
                            <textarea name="description" required rows="3" value={formData.description} onChange={handleChange} placeholder="Describe the flavors and story behind this dish..." />
                        </div>
                    </div>

                    <div className="form-section">
                        <h3>Details</h3>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Prep Time</label>
                                <input type="text" name="prepTime" value={formData.prepTime} onChange={handleChange} placeholder="e.g. 15 mins" />
                            </div>
                            <div className="form-group">
                                <label>Cook Time</label>
                                <input type="text" name="cookTime" value={formData.cookTime} onChange={handleChange} placeholder="e.g. 45 mins" />
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Servings</label>
                                <input type="text" name="servings" value={formData.servings} onChange={handleChange} placeholder="e.g. 4 people" />
                            </div>
                            <div className="form-group">
                                <label>Difficulty</label>
                                <select name="difficulty" value={formData.difficulty} onChange={handleChange}>
                                    <option value="Easy">Easy</option>
                                    <option value="Medium">Medium</option>
                                    <option value="Hard">Hard</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="form-section">
                        <h3>Methods</h3>
                        <div className="form-group">
                            <label>Ingredients (one per line)</label>
                            <textarea name="ingredients" rows="6" value={formData.ingredients} onChange={handleChange} placeholder="- 2 cups flour&#10;- 1 tsp salt" />
                        </div>

                        <div className="form-group">
                            <label>Instructions (one per line)</label>
                            <textarea name="instructions" rows="6" value={formData.instructions} onChange={handleChange} placeholder="1. Preheat oven...&#10;2. Mix wet ingredients..." />
                        </div>

                        <div className="form-group">
                            <label>Chef's Tips</label>
                            <textarea name="tips" rows="2" value={formData.tips} onChange={handleChange} placeholder="Any secrets to success?" />
                        </div>
                    </div>

                    <button type="submit" className="submit-btn-large" disabled={loading}>
                        {loading ? 'Publishing...' : 'Publish Recipe'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AddRecipe;
