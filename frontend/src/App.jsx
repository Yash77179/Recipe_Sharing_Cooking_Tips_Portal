import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import AddRecipe from './pages/AddRecipe';
import RecipeDetails from './pages/RecipeDetails';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Profile from './pages/Profile';
import About from './pages/About';
import ComingSoon from './pages/ComingSoon';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="app">
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/add" element={<AddRecipe />} />
            <Route path="/recipe/:id" element={<RecipeDetails />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/about" element={<About />} />
            <Route path="/coming-soon" element={<ComingSoon />} />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
