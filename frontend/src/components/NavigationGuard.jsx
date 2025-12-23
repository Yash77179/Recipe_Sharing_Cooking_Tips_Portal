import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NavigationGuard = ({ children }) => {
    const { user, loading } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        if (loading) return;

        // Paths allowed without password set
        const allowedPaths = ['/set-password', '/auth/callback', '/login', '/signup'];
        const isAllowedPath = allowedPaths.some(path => location.pathname.startsWith(path));

        if (user) {
            // If user is logged in
            if (user.passwordSet === false) {
                // Password NOT set
                if (!isAllowedPath) {
                    navigate('/set-password', { replace: true });
                }
            } else {
                // Password IS set
                if (location.pathname === '/set-password') {
                    navigate('/', { replace: true });
                }
            }
        }
    }, [user, loading, location, navigate]);

    if (loading) {
        return <div className="loading-screen">Loading...</div>; // Or return null/spinner
    }

    return children;
};

export default NavigationGuard;
