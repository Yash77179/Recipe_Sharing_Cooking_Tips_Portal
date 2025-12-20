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
    const [totalPages, setTotalPages] = useState(1);
    const [totalRecipes, setTotalRecipes] = useState(0);
    const [totalVeg, setTotalVeg] = useState(0);
    const [totalNonVeg, setTotalNonVeg] = useState(0);
    const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);



    const fetchRecipes = async () => {
        try {
            setLoading(true);
            window.scrollTo({ top: 400, behavior: 'smooth' });

            const response = await fetch(`http://localhost:5001/api/recipes?page=${currentPage}&limit=12&type=${filterType}`);
            const data = await response.json();

            setRecipes(data.recipes);
            setTotalPages(data.totalPages);
            setTotalRecipes(data.totalRecipes);
            setTotalVeg(data.totalVeg);
            setTotalNonVeg(data.totalNonVeg);
        } catch (err) {
            console.error("Failed to fetch recipes", err);
        } finally {
            setLoading(false);
        }
    };




    useEffect(() => {
        fetchRecipes();
    }, [filterType, currentPage]);



    // Handle search local filter
    useEffect(() => {
        let results = recipes;

        // Filter by Search (still local for performance on current page results, 
        // but backend search exists in SearchModal)
        if (searchTerm) {
            results = results.filter(recipe =>
                recipe.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                recipe.ingredients.some(ing => ing.toLowerCase().includes(searchTerm.toLowerCase()))
            );
        }

        setFilteredRecipes(results);
    }, [searchTerm, recipes]);


    return (
        <div className="recipes-page">
            <SearchModal
                isOpen={isSearchModalOpen}
                onClose={() => setIsSearchModalOpen(false)}
            />

            <header className="recipes-hero">
                <div className="container">
                    <p className="hero-sub">EXPLORE OUR COLLECTION</p>
                    <h1 className="hero-title">
                        {filterType === 'All' ? 'All Recipes' : filterType === 'Veg' ? 'Vegetarian' : 'Non-Veg'}
                    </h1>


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
                            onClick={() => { setFilterType('All'); setCurrentPage(1); }}
                        >
                            All Recipes
                        </button>
                        <button
                            className={`filter-btn ${filterType === 'Veg' ? 'active' : ''}`}
                            onClick={() => { setFilterType('Veg'); setCurrentPage(1); }}
                        >
                            Vegetarian
                        </button>
                        <button
                            className={`filter-btn ${filterType === 'Non-Veg' ? 'active' : ''}`}
                            onClick={() => { setFilterType('Non-Veg'); setCurrentPage(1); }}
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
                            {searchTerm
                                ? `${filteredRecipes.length} ${filteredRecipes.length === 1 ? 'recipe' : 'recipes'} found`
                                : `${filterType === 'All' ? totalRecipes : filterType === 'Veg' ? totalVeg : totalNonVeg} ${(filterType === 'All' ? totalRecipes : filterType === 'Veg' ? totalVeg : totalNonVeg) === 1 ? 'recipe exists' : 'recipes exist'
                                } in database`}
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

                        {/* Pagination UI */}
                        {!searchTerm && totalPages > 1 && (
                            <div className="pagination-container">
                                <button
                                    className="page-nav-btn"
                                    onClick={() => setCurrentPage(1)}
                                    disabled={currentPage === 1}
                                >
                                    First
                                </button>
                                <button
                                    className="page-nav-btn"
                                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                    disabled={currentPage === 1}
                                >
                                    Prev
                                </button>


                                <div className="page-numbers">
                                    {[...Array(totalPages)].map((_, index) => {
                                        const pageNum = index + 1;
                                        // Show only a few pages around current page if total pages is large
                                        if (
                                            totalPages <= 5 ||
                                            pageNum === 1 ||
                                            pageNum === totalPages ||
                                            (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                                        ) {
                                            return (
                                                <button
                                                    key={pageNum}
                                                    className={`page-num-btn ${currentPage === pageNum ? 'active' : ''}`}
                                                    onClick={() => setCurrentPage(pageNum)}
                                                >
                                                    {pageNum}
                                                </button>

                                            );
                                        } else if (
                                            (pageNum === currentPage - 2 && pageNum > 1) ||
                                            (pageNum === currentPage + 2 && pageNum < totalPages)
                                        ) {
                                            return <span key={pageNum} className="page-dots">...</span>;
                                        }
                                        return null;
                                    })}
                                </div>

                                <button
                                    className="page-nav-btn"
                                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                    disabled={currentPage === totalPages}
                                >
                                    Next
                                </button>
                                <button
                                    className="page-nav-btn"
                                    onClick={() => setCurrentPage(totalPages)}
                                    disabled={currentPage === totalPages}
                                >
                                    Last
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
