import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
    const { user } = useAuth();

    return (
        <nav className="navbar">
            <div className="container navbar-content">
                <div className="navbar-top">
                    <div className="social-placeholder"></div>
                    <Link to="/" className="logo">
                        The Every Kitchen
                    </Link>
                    <div className="nav-actions">
                        {user ? (
                            <Link to="/profile" className="btn-outline">
                                {user.name.toUpperCase()}
                            </Link>
                        ) : (
                            <>
                                <Link to="/login" className="btn-outline">LOGIN</Link>
                                <Link to="/signup" className="btn-text">SIGN UP</Link>
                            </>
                        )}
                    </div>
                </div>
                <div className="navbar-bottom">
                    <Link to="/" className="nav-link">HOME</Link>
                    <Link to="/" className="nav-link">RECIPES</Link>
                    <Link to="/coming-soon" className="nav-link">LIFESTYLE</Link>
                    <Link to="/coming-soon" className="nav-link">SHOP</Link>
                    <Link to="/about" className="nav-link">ABOUT</Link>
                    <Link to="/add" className="nav-link">SUBMIT RECIPE</Link>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
