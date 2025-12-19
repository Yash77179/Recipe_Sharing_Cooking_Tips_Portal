import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './SearchModal.css';

const SearchModal = ({ isOpen, onClose }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);
    const inputRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (isOpen && inputRef.current) {
            // Focus input when modal opens
            setTimeout(() => {
                inputRef.current?.focus();
            }, 300);
        }
    }, [isOpen]);

    useEffect(() => {
        // Prevent body scroll when modal is open
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    const handleSearch = async (query) => {
        setSearchQuery(query);
        
        if (query.trim() === '') {
            setSearchResults([]);
            setHasSearched(false);
            return;
        }

        setLoading(true);
        setHasSearched(true);

        try {
            const response = await fetch(`http://localhost:5001/api/recipes/search?q=${encodeURIComponent(query)}`);
            const data = await response.json();
            setSearchResults(data.recipes || []);
        } catch (error) {
            console.error('Search error:', error);
            setSearchResults([]);
        } finally {
            setLoading(false);
        }
    };

    const handleRecipeClick = (recipeId) => {
        navigate(`/recipe/${recipeId}`);
        onClose();
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className={`search-modal-overlay ${isOpen ? 'active' : ''}`} onClick={onClose}>
            <div className={`search-modal ${isOpen ? 'active' : ''}`} onClick={(e) => e.stopPropagation()}>
                <button className="search-modal-close" onClick={onClose} aria-label="Close search">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>

                <div className="search-modal-header">
                    <h2>Search Recipes</h2>
                    <p>Search across all recipes by name, ingredient, or cuisine</p>
                </div>

                <div className="search-modal-input-wrapper">
                    <svg className="search-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="11" cy="11" r="8"></circle>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                    <input
                        ref={inputRef}
                        type="text"
                        placeholder="Type to search..."
                        value={searchQuery}
                        onChange={(e) => handleSearch(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="search-modal-input"
                    />
                    {searchQuery && (
                        <button 
                            className="clear-search-btn" 
                            onClick={() => handleSearch('')}
                            aria-label="Clear search"
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                        </button>
                    )}
                </div>

                <div className="search-modal-results">
                    {loading && (
                        <div className="search-loading">
                            <div className="spinner"></div>
                            <p>Searching...</p>
                        </div>
                    )}

                    {!loading && hasSearched && searchResults.length === 0 && (
                        <div className="search-empty">
                            <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                <circle cx="11" cy="11" r="8"></circle>
                                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                            </svg>
                            <h3>No recipes found</h3>
                            <p>Try searching with different keywords</p>
                        </div>
                    )}

                    {!loading && !hasSearched && (
                        <div className="search-placeholder">
                            <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                <circle cx="11" cy="11" r="8"></circle>
                                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                            </svg>
                            <h3>Start searching</h3>
                            <p>Enter a recipe name, ingredient, or cuisine to begin</p>
                        </div>
                    )}

                    {!loading && searchResults.length > 0 && (
                        <div className="search-results-list">
                            <div className="results-header">
                                <p>{searchResults.length} {searchResults.length === 1 ? 'recipe' : 'recipes'} found</p>
                            </div>
                            {searchResults.map((recipe) => (
                                <div 
                                    key={recipe._id} 
                                    className="search-result-item"
                                    onClick={() => handleRecipeClick(recipe._id)}
                                >
                                    <div className="result-image">
                                        <img src={recipe.image} alt={recipe.title} />
                                    </div>
                                    <div className="result-info">
                                        <h4>{recipe.title}</h4>
                                        <p className="result-description">
                                            {recipe.description.substring(0, 100)}...
                                        </p>
                                        <div className="result-meta">
                                            {recipe.dietaryType && (
                                                <span className="result-badge">{recipe.dietaryType}</span>
                                            )}
                                            {recipe.cuisine && (
                                                <span className="result-cuisine">{recipe.cuisine}</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="result-arrow">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <polyline points="9 18 15 12 9 6"></polyline>
                                        </svg>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SearchModal;
