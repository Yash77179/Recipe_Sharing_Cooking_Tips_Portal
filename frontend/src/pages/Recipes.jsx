import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import RecipeCard from '../components/RecipeCard';
import RecipeCarousel from '../components/RecipeCarousel';
import LazyCarousel from '../components/LazyCarousel';
import SearchModal from '../components/SearchModal';
import Footer from '../components/Footer';
import { API_BASE_URL } from '../config';
import './Recipes.css';

const Recipes = () => {
    const [groupedRecipes, setGroupedRecipes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterType, setFilterType] = useState('All'); // All, Veg, Non-Veg
    const [totalRecipes, setTotalRecipes] = useState(0);
    const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
    const location = useLocation();

    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);
    const [isLoadingMore, setIsLoadingMore] = useState(false);

    const fetchRecipes = async (pageNum, reset = false) => {
        try {
            if (reset) {
                setLoading(true);
            } else {
                setIsLoadingMore(true);
            }

            // Check if we're navigating to a specific cuisine
            const params = new URLSearchParams(location.search);
            const targetCuisine = params.get('cuisine');

            // If targeting a specific cuisine, load ALL categories to ensure it's visible
            const limit = targetCuisine ? 100 : 4;

            const response = await fetch(`${API_BASE_URL}/recipes/grouped?type=${filterType}&page=${pageNum}&limit=${limit}`);
            const result = await response.json();

            // Backend now returns { data: [], hasMore: bool }
            // Fallback for safety if old backend cached
            const newData = result.data || result;
            const moreAvailable = result.hasMore || false;

            if (reset) {
                setGroupedRecipes(newData);
            } else {
                setGroupedRecipes(prev => [...prev, ...newData]);
            }

            setHasMore(moreAvailable);

            // Update total recipes count (True DB Count)
            if (result.totalRecipesCount !== undefined) {
                setTotalRecipes(result.totalRecipesCount);
            }

        } catch (err) {
            console.error("Failed to fetch recipes", err);
        } finally {
            setLoading(false);
            setIsLoadingMore(false);
        }
    };

    // Initial Fetch & Filter Change
    useEffect(() => {
        setPage(1);
        fetchRecipes(1, true);
    }, [filterType, location.search]); // Added location.search to re-fetch when URL changes

    const handleLoadMore = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchRecipes(nextPage, false);
    };

    // Scroll to specific cuisine carousel when navigating from Home page
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const cuisine = params.get('cuisine');

        if (cuisine && location.hash === '#scroll' && !loading) {
            // Retry scrolling multiple times to handle layout shifts
            let attempts = 0;
            const maxAttempts = 5;

            const attemptScroll = () => {
                const cuisineId = `cuisine-${cuisine.toLowerCase().replace(/\s+/g, '-')}`;
                const element = document.getElementById(cuisineId);

                if (element) {
                    const headerOffset = 150; // Standard offset
                    const elementPosition = element.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                    window.scrollTo({
                        top: offsetPosition,
                        behavior: "smooth"
                    });
                }

                attempts++;
                if (attempts < maxAttempts) {
                    setTimeout(attemptScroll, 500); // Retry every 500ms
                }
            };

            // Start attempting to scroll
            setTimeout(attemptScroll, 500);
        }
    }, [location, loading]);


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
                    <h2 className="section-title-no-line">Latest From The Kitchen</h2>
                    <div className="section-divider"></div>
                    {!loading && (
                        <p className="results-count">
                            {`${totalRecipes} ${totalRecipes === 1 ? 'RECIPE' : 'RECIPES'} FOUND`}
                        </p>
                    )}
                </div>

                {loading ? (
                    <div className="loading">Loading...</div>
                ) : (
                    <div className="carousels-container">
                        {groupedRecipes.length > 0 ? (
                            groupedRecipes.map((group, index) => {
                                const cuisineId = `cuisine-${group.category.toLowerCase().replace(/\s+/g, '-')}`;
                                return (
                                    <LazyCarousel
                                        key={group.category}
                                        id={cuisineId}
                                        title={group.category}
                                        recipes={group.recipes}
                                        eager={index < 2}
                                    />
                                );
                            })
                        ) : (
                            <div className="empty-state">
                                <p>No recipes found.</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Load More Button */}
                {!loading && hasMore && (
                    <div className="load-more-container">
                        <button
                            className="load-more-btn"
                            onClick={handleLoadMore}
                            disabled={isLoadingMore}
                        >
                            {isLoadingMore ? (
                                <span className="loader"></span>
                            ) : (
                                <span>Load More Cuisines</span>
                            )}
                        </button>
                    </div>
                )}

            </section>

            <Footer />
        </div>
    );
};

export default Recipes;
