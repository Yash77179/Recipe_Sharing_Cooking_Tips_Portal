import React, { useEffect, useState } from 'react';
import RecipeCard from '../components/RecipeCard';
import SearchModal from '../components/SearchModal';
import './Recipes.css';

const Recipes = () => {
    const [recipes, setRecipes] = useState([]);
    const [filteredRecipes, setFilteredRecipes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('All'); // All, Veg, Non-Veg
    const [currentPage, setCurrentPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [totalRecipes, setTotalRecipes] = useState(0);
    const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);

    const fetchRecipes = async (page = 1, append = false) => {
        try {
            if (append) {
                setLoadingMore(true);
            } else {
                setLoading(true);
            }

            const response = await fetch(`http://localhost:5001/api/recipes?page=${page}&limit=12`);
            const data = await response.json();

            if (append) {
                setRecipes(prev => [...prev, ...data.recipes]);
            } else {
                setRecipes(data.recipes);
            }

            setHasMore(data.hasMore);
            setTotalRecipes(data.totalRecipes);
            setCurrentPage(page);
        } catch (err) {
            console.error("Failed to fetch recipes", err);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    useEffect(() => {
        fetchRecipes(1, false);
    }, []);

    // Handle search & filter
    useEffect(() => {
        let results = recipes;

        // Filter by Type
        if (filterType !== 'All') {
            results = results.filter(r => r.dietaryType === filterType);
        }

        // Filter by Search
        if (searchTerm) {
            results = results.filter(recipe =>
                recipe.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                recipe.ingredients.some(ing => ing.toLowerCase().includes(searchTerm.toLowerCase()))
            );
        }

        setFilteredRecipes(results);
    }, [searchTerm, filterType, recipes]);

    return (
        <div className="recipes-page">
            <SearchModal 
                isOpen={isSearchModalOpen} 
                onClose={() => setIsSearchModalOpen(false)} 
            />
            
            <header className="recipes-hero">
                <div className="container">
                    <p className="hero-sub">EXPLORE OUR COLLECTION</p>
                    <h1 className="hero-title">All Recipes</h1>

                    <div className="hero-search" onClick={() => setIsSearchModalOpen(true)}>
                        <input
                            type="text"
                            placeholder="Click to search recipes..."
                            value=""
                            readOnly
                        />
                        <button className="search-btn">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="11" cy="11" r="8"></circle>
                                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                            </svg>
                        </button>
                    </div>

                    {/* Filter Panel */}
                    <div className="filter-panel">
                        <button
                            className={`filter-btn ${filterType === 'All' ? 'active' : ''}`}
                            onClick={() => setFilterType('All')}
                        >
                            All Recipes
                        </button>
                        <button
                            className={`filter-btn ${filterType === 'Veg' ? 'active' : ''}`}
                            onClick={() => setFilterType('Veg')}
                        >
                            Vegetarian
                        </button>
                        <button
                            className={`filter-btn ${filterType === 'Non-Veg' ? 'active' : ''}`}
                            onClick={() => setFilterType('Non-Veg')}
                        >
                            Non-Veg
                        </button>
                    </div>
                </div>
            </header>

            <section className="recipes-section container">
                <div className="section-header">
                    <h2 className="section-title">
                        {searchTerm ? `Results for "${searchTerm}"` : 'Latest From The Kitchen'}
                    </h2>
                    <div className="section-divider"></div>
                    {!loading && (
                        <p className="results-count">
                            {filteredRecipes.length} {filteredRecipes.length === 1 ? 'recipe' : 'recipes'} found
                        </p>
                    )}
                </div>

                {loading ? (
                    <div className="loading">Loading...</div>
                ) : (
                    <>
                        <div className="grid-recipes">
                            {filteredRecipes.map(recipe => (
                                <RecipeCard key={recipe._id} recipe={recipe} />
                            ))}
                        </div>

                        {!searchTerm && !loading && hasMore && (
                            <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                                <button 
                                    className="load-more-btn"
                                    onClick={() => fetchRecipes(currentPage + 1, true)}
                                    disabled={loadingMore}
                                >
                                    {loadingMore ? 'Loading...' : 'Load More Recipes'}
                                </button>
                            </div>
                        )}
                    </>
                )}

                {!loading && filteredRecipes.length === 0 && (
                    <div className="empty-state">
                        <p>No recipes found matching "{searchTerm}".</p>
                        <button className="btn-text" onClick={() => setSearchTerm('')} style={{ marginTop: '1rem', background: '#ccc' }}>Clear Search</button>
                    </div>
                )}
            </section>
        </div>
    );
};

export default Recipes;
