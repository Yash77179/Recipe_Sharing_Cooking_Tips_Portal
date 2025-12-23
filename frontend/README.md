# Recipe Sharing Portal - Frontend

The frontend interface for the Recipe Sharing Portal, built with React and Vite. It features a modern, animated user interface for browsing recipes, managing user profiles, and interactive cooking tips.

## ✨ Features

- **Modern UI/UX**: Built with React 19 and Vite for blazing fast performance.
- **Rich Animations**:
    - **GSAP**: Complex timeline animations and scroll effects.
    - **Framer Motion**: Smooth component transitions and gestures.
    - **Lenis**: Smooth scrolling experience.
- **Authentication**: Seamless Google Login integration and standard email/password auth.
- **Recipe Discovery**: Search, filter by category/dietary type, and "Random Recipe" marquee.
- **Responsive Design**: optimized for mobile and desktop screens.
- **Dark/Light Mode**: Integrated theme toggling.

## 🛠️ Tech Stack

- **Framework**: React 19 (via Vite)
- **Routing**: React Router Dom v7
- **Styling**: Custom CSS / CSS Modules
- **Animations**: GSAP, Framer Motion, Lenis
- **State Management**: React Context / Hooks
- **Icons**: React Icons
- **Carousel**: Swiper.js

## ⚙️ Installation

1.  **Navigate to the frontend directory:**
    ```bash
    cd frontend
    ```

2.  **Install dependencies:**
    *(Note: Using `--legacy-peer-deps` is currently required due to React 19 peer dependency conflicts with some animation libraries)*
    ```bash
    npm install --legacy-peer-deps
    ```

## 🚀 Running the App

-   **Development Mode**:
    ```bash
    npm run dev
    ```
    The app will typically run at `http://localhost:5173`.

## 📂 Project Structure

-   `src/components`: Reusable UI components (Navbar, Footer, RecipeCard, etc.)
-   `src/pages`: Main page views (Home, RecipeDetails, Login, Profile)
-   `src/context`: React Context providers (AuthContext, etc.)
-   `src/assets`: Static images and resources.

## 🔌 Backend Integration

This frontend is designed to consume the API provided by the `backend` directory. Ensure the backend server is running on `http://localhost:5001` (or your configured port) for full functionality (authentication, data fetching).
