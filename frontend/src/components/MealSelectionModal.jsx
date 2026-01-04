import React, { useState } from 'react';
import './MealSelectionModal.css';

const MealSelectionModal = ({ isOpen, onClose, onSelect, myRecipes, favorites }) => {
    const [activeTab, setActiveTab] = useState('saved'); // 'saved' (my recs) or 'favorites'

    if (!isOpen) return null;

    const currentList = activeTab === 'saved' ? (myRecipes || []) : (favorites || []);

    return (
        <div className={`meal-modal-overlay ${isOpen ? 'active' : ''}`} onClick={onClose}>
            <div className="meal-modal" onClick={e => e.stopPropagation()}>
                <div className="meal-modal-header">
                    <h3>Select Meal</h3>
                    <button className="close-modal-btn" onClick={onClose}>×</button>
                </div>

                <div className="meal-modal-tabs">
                    <button
                        className={`meal-tab ${activeTab === 'saved' ? 'active' : ''}`}
                        onClick={() => setActiveTab('saved')}
                    >
                        My Recipes
                    </button>
                    <button
                        className={`meal-tab ${activeTab === 'favorites' ? 'active' : ''}`}
                        onClick={() => setActiveTab('favorites')}
                    >
                        Favorites
                    </button>
                </div>

                <div className="meal-list-container">
                    {currentList.length > 0 ? (
                        currentList.map(recipe => (
                            <div key={recipe._id} className="meal-item" onClick={() => onSelect(recipe)}>
                                <img
                                    src={recipe.image || 'https://via.placeholder.com/50'}
                                    alt={recipe.title}
                                    className="meal-thumb"
                                />
                                <div className="meal-info">
                                    <div className="meal-title">{recipe.title}</div>
                                    <div className="meal-author">{activeTab === 'saved' ? "You" : (recipe.author?.name || "Unknown Chef")}</div>
                                </div>
                                <div className="meal-action-arrow">→</div>
                            </div>
                        ))
                    ) : (
                        <div className="empty-state">
                            <p>No recipes found in this list.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MealSelectionModal;
