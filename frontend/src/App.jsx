import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import FloatingNavbar from './components/FloatingNavbar';
import Home from './pages/Home';
import Recipes from './pages/Recipes';
import AddRecipe from './pages/AddRecipe';
import RecipeDetails from './pages/RecipeDetails';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Profile from './pages/Profile';
import About from './pages/About';
import ComingSoon from './pages/ComingSoon';
import AuthCallback from './pages/AuthCallback';
import SetPassword from './pages/SetPassword';
import Lifestyle from './pages/Lifestyle';

import ScrollToTop from './components/ScrollToTop';

import { useAuth } from './context/AuthContext';
import NavigationGuard from './components/NavigationGuard';
import WebsiteTour from './components/WebsiteTour';

// Helper component to access AuthContext for conditional rendering
const MainLayout = () => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Don't show navbar if user is logged in but hasn't set password
  // Also wait for loading to finish to prevent flickering
  // Hide navbar on Profile page
  const showNavbar = !loading && (!user || user.passwordSet !== false) && location.pathname !== '/profile' && location.pathname !== '/add';

  return (
    <NavigationGuard>
      <div className="app">
        {showNavbar && <FloatingNavbar />}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/recipes" element={<Recipes />} />
          <Route path="/add" element={<AddRecipe />} />
          <Route path="/recipes/:id" element={<RecipeDetails />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/about" element={<About />} />
          <Route path="/lifestyle" element={<Lifestyle />} />
          <Route path="/coming-soon" element={<ComingSoon />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/set-password" element={<SetPassword />} />
        </Routes>
        <WebsiteTour />
      </div>
    </NavigationGuard>
  );
};

function App() {
  return (
    <Router>
      <ScrollToTop />
      <ThemeProvider>
        <AuthProvider>
          <MainLayout />
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
