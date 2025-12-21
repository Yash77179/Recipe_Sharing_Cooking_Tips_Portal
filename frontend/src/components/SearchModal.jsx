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
            }, 100);
        }
        
        // Reset state when modal opens
        if (isOpen) {
            setSearchQuery('');
            setSearchResults([]);
            setHasSearched(false);
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

    const performSearch = async () => {
        const query = searchQuery.trim();
        
        if (query === '') {
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
        navigate(`/recipes/${recipeId}`);
        onClose();
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
            onClose();
        } else if (e.key === 'Enter') {
            performSearch();
        }
    };

    if (!isOpen) return null;

    return (
        <div className={`search-modal-overlay ${isOpen ? 'active' : ''}`} onClick={onClose}>
            <div className={`search-modal spotlight-style ${isOpen ? 'active' : ''}`} onClick={(e) => e.stopPropagation()}>
                <div className="spotlight-search-container">
                    <svg className="spotlight-search-icon" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="11" cy="11" r="8"></circle>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                    <input
                        ref={inputRef}
                        type="text"
                        placeholder="Search for recipes, ingredients, or cuisines..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="spotlight-search-input"
                    />
                    {searchQuery && !loading && (
                        <button 
                            className="spotlight-search-btn" 
                            onClick={performSearch}
                            aria-label="Search"
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <polyline points="9 18 15 12 9 6"></polyline>
                            </svg>
                        </button>
                    )}
                    {loading && (
                        <div className="spotlight-loading-indicator">
                            <div className="spotlight-spinner"></div>
                        </div>
                    )}
                </div>

                <div className="spotlight-results">
                    {!loading && hasSearched && searchResults.length === 0 && (
                        <div className="spotlight-empty">
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                <circle cx="11" cy="11" r="8"></circle>
                                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                            </svg>
                            <p>No recipes found for "{searchQuery}"</p>
                        </div>
                    )}

                    {!loading && searchResults.length > 0 && (
                        <div className="spotlight-results-list">
                            {searchResults.map((recipe, index) => (
                                <div 
                                    key={recipe._id} 
                                    className="spotlight-result-item"
                                    onClick={() => handleRecipeClick(recipe._id)}
                                >
                                    <div className="spotlight-result-icon">
                                        <img src={recipe.image} alt={recipe.title} />
                                    </div>
                                    <div className="spotlight-result-content">
                                        <div className="spotlight-result-title">{recipe.title}</div>
                                        <div className="spotlight-result-subtitle">
                                            {recipe.cuisine && <span>{recipe.cuisine}</span>}
                                            {recipe.dietaryType && <span className="dietary-badge">{recipe.dietaryType}</span>}
                                        </div>
                                    </div>
                                    <div className="spotlight-result-action">
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
