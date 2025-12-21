import React, { useRef, useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { FiMenu, FiX } from "react-icons/fi";
import "./FloatingNavbar.css";

export const FloatingNavbar = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <>
            <div className="floating-nav-container">
                <Link to="/" className="nav-logo">
                    <span className="logo-text">The</span>
                    <span className="logo-accent">Every</span>
                    <span className="logo-text">Kitchen</span>
                </Link>

                {/* Desktop Tabs */}
                <div className="desktop-menu">
                    <SlideTabs />
                </div>
            </div>

            {/* Mobile Toggle (Hamburger morphs to X) */}
            <button
                className={`mobile-toggle-btn ${isMobileMenuOpen ? 'active' : ''}`}
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label="Toggle menu"
            >
                <div className="hamburger-box">
                    <span className="hamburger-line"></span>
                    <span className="hamburger-line"></span>
                    <span className="hamburger-line"></span>
                </div>
            </button>

            {/* Mobile Fullscreen Menu */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <MobileMenu onClose={() => setIsMobileMenuOpen(false)} />
                )}
            </AnimatePresence>
        </>
    );
};

const SlideTabs = () => {
    const [position, setPosition] = useState({
        left: 0,
        width: 0,
        opacity: 0,
    });
    const { user } = useAuth();
    const location = useLocation();

    // Store refs to tab elements
    const tabsRef = useRef({});

    // Function to update position to a specific tab
    const updatePositionToTab = (path) => {
        const el = tabsRef.current[path];
        if (el) {
            const { width } = el.getBoundingClientRect();
            const offsetLeft = el.offsetLeft;
            setPosition({
                left: offsetLeft,
                width,
                opacity: 1,
            });
        }
    };

    // Update position when location changes
    useEffect(() => {
        // Map current path to tab key
        let currentPath = location.pathname;
        if (currentPath === '/login' && user) currentPath = '/profile';

        updatePositionToTab(currentPath);
    }, [location.pathname, user]);

    return (
        <ul
            onMouseLeave={() => {
                // Revert to active tab on mouse leave
                let currentPath = location.pathname;
                if (currentPath === '/login' && user) currentPath = '/profile';

                const el = tabsRef.current[currentPath];
                if (el) {
                    updatePositionToTab(currentPath);
                } else {
                    setPosition((pv) => ({ ...pv, opacity: 0 }));
                }
            }}
            className="slide-tabs"
        >
            <Tab setPosition={setPosition} to="/" tabsRef={tabsRef}>Home</Tab>
            <Tab setPosition={setPosition} to="/recipes" tabsRef={tabsRef}>Recipes</Tab>
            <Tab setPosition={setPosition} to="/lifestyle" tabsRef={tabsRef}>Lifestyle</Tab>
            <Tab setPosition={setPosition} to="/about" tabsRef={tabsRef}>About</Tab>
            {user ? (
                <Tab setPosition={setPosition} to="/profile" tabsRef={tabsRef}>
                    {user.name ? user.name.split(' ')[0] : 'Profile'}
                </Tab>
            ) : (
                <Tab setPosition={setPosition} to="/login" tabsRef={tabsRef}>Login</Tab>
            )}

            <Cursor position={position} />
        </ul>
    );
};

const Tab = ({ children, setPosition, to, tabsRef }) => {
    const ref = useRef(null);

    // Register ref
    useEffect(() => {
        if (tabsRef && ref.current) {
            tabsRef.current[to] = ref.current;
        }
    }, [to, tabsRef]);

    return (
        <li
            ref={ref}
            onMouseEnter={() => {
                if (!ref?.current) return;

                const { width } = ref.current.getBoundingClientRect();
                const offsetLeft = ref.current.offsetLeft;

                setPosition({
                    left: offsetLeft,
                    width,
                    opacity: 1,
                });
            }}
            style={{ listStyle: 'none' }}
        >
            <Link to={to} className="tab-item">
                {children}
            </Link>
        </li>
    );
};

const Cursor = ({ position }) => {
    return (
        <motion.li
            animate={{
                left: position.left,
                width: position.width,
                opacity: position.opacity,
            }}
            className="tab-cursor"
            initial={false}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            style={{ listStyle: 'none' }}
        />
    );
};

const MobileMenu = ({ onClose }) => {
    const { user } = useAuth();

    // Staggered animation for container
    const menuVariants = {
        closed: {
            opacity: 0,
            transition: { duration: 0.3, ease: "easeInOut" }
        },
        open: {
            opacity: 1,
            transition: { duration: 0.4, ease: "easeInOut" }
        }
    };

    const links = [
        { path: "/", label: "Home" },
        { path: "/recipes", label: "Recipes" },
        { path: "/lifestyle", label: "Lifestyle" },
        { path: "/about", label: "About" },
        { path: user ? "/profile" : "/login", label: user ? "Profile" : "Login" }
    ];

    return (
        <motion.div
            initial="closed"
            animate="open"
            exit="closed"
            variants={menuVariants}
            className="mobile-menu-overlay"
        >
            {/* --- Ambient Background Effects --- */}
            <div className="mm-ambient-layer">
                {/* Grain (CSS) */}
                <div className="mm-grain"></div>
                {/* Central Axis Line */}
                <div className="mm-axis-line"></div>
                {/* Central Glow */}
                <div className="mm-glow"></div>
            </div>

            {/* Close Button Removed - Handled by Main Toggle */}

            {/* --- Main Navigation --- */}
            <nav className="mm-nav-container">
                {links.map((link, index) => (
                    <div key={link.path} className="mm-link-wrapper">
                        <Link
                            to={link.path}
                            onClick={onClose}
                            className="mm-link-group"
                        >
                            {/* Numbering */}
                            <span className="mm-number">0{index + 1}</span>

                            {/* Text */}
                            <span className="mm-label">{link.label}</span>

                            {/* Dot Reveal */}
                            <span className="mm-dot"></span>
                        </Link>
                    </div>
                ))}
            </nav>

            {/* --- Footer --- */}
            <div className="mm-footer">
                <div className="mm-footer-actions">
                    <Link to="/contact" onClick={onClose} className="mm-btn-outline">Contact</Link>
                    <Link to="/submit" onClick={onClose} className="mm-btn-solid">Submit Recipe</Link>
                </div>
                <div className="mm-socials">
                    <a href="#" className="mm-social-link">Instagram</a>
                    <a href="#" className="mm-social-link">Twitter</a>
                    <a href="#" className="mm-social-link">Pinterest</a>
                </div>
            </div>
        </motion.div>
    );
};

export default FloatingNavbar;