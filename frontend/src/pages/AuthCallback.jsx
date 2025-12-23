import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AuthCallback = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { login } = useAuth();
    const [error, setError] = useState(null);

    useEffect(() => {
        const handleAuthentication = async () => {
            const token = searchParams.get('token');
            const userParam = searchParams.get('user');
            const redirectTo = searchParams.get('redirectTo') || '/'; // Default to home

            if (token && userParam) {
                try {
                    const user = JSON.parse(decodeURIComponent(userParam));
                    
                    login(user, token);
                    
                    // Use replace to avoid back button issues
                    setTimeout(() => {
                        navigate(redirectTo, { replace: true });
                    }, 100);
                } catch (error) {
                    setError('Authentication failed. Please try again.');
                    setTimeout(() => {
                        navigate('/login', { replace: true });
                    }, 1500);
                }
            } else {
                setError('Invalid authentication response.');
                setTimeout(() => {
                    navigate('/login', { replace: true });
                }, 1500);
            }
        };

        handleAuthentication();
    }, []); // Empty dependency array - only run once

    return (
        <div style={{ 
            display: 'flex', 
            flexDirection: 'column',
            justifyContent: 'center', 
            alignItems: 'center', 
            height: '100vh',
            fontSize: '1.2rem'
        }}>
            {error ? (
                <div style={{ color: '#e74c3c' }}>{error}</div>
            ) : (
                <div>Authenticating...</div>
            )}
        </div>
    );
};

export default AuthCallback;
