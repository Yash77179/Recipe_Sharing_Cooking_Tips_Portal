# Recipe Sharing Portal - Backend

This is the backend API for the Recipe Sharing Portal, built with Node.js, Express, and MongoDB. It handles user authentication, recipe management, and serves as the data layer for the frontend application.

## 🚀 Features

- **Authentication**: Secure user signup/login using JWT (JSON Web Tokens).
- **Google OAuth**: "Continue with Google" functionality.
- **Recipe Management**: Create, read (with search & filters), and manage recipes.
- **Image Uploads**: Handles recipe image and user profile picture uploads.
- **Data Seeding**: Scripts to populate the database with initial data (including fetching from external APIs).

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (via Mongoose)
- **Authentication**: Passport.js (Google Strategy), JSON Web Tokens (JWT), bcryptjs
- **Validation**: express-validator

## 📋 Prerequisites

- Node.js (v14 or higher)
- MongoDB (running locally or via Atlas)

## ⚙️ Installation

1.  **Navigate to the backend directory:**
    ```bash
    cd backend
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Configure Environment Variables:**
    Create a `.env` file in the `backend` directory with the following variables:

    ```env
    # Server Configuration
    PORT=5001
    MONGO_URI=mongodb://localhost:27017/recipe_portal  # Or your MongoDB Atlas URI

    # Security (JWT)
    JWT_SECRET=your_super_secret_key_here

    # Google OAuth (Required for "Continue with Google")
    GOOGLE_CLIENT_ID=your_google_client_id
    GOOGLE_CLIENT_SECRET=your_google_client_secret
    ```

## 🏃‍♂️ Running the Server

-   **Development Mode** (with nodemon auto-restart):
    ```bash
    npm run dev
    ```

-   **Production Start**:
    ```bash
    npm start
    ```

Server will run on `http://localhost:5001` by default.

## 🌱 Database Seeding

To populate your database with initial recipe data:

1.  **Seed from TheMealDB API** (Fetches ~500+ recipes):
    ```bash
    node seedFromAPI.js
    ```

2.  **Basic Seed** (Simple test data):
    ```bash
    node seed.js
    ```

## 🔌 API Endpoints

### Authentication
-   `POST /api/auth/signup`: Register a new user.
-   `POST /api/auth/login`: Login with email/password.
-   `GET /api/auth/google`: Initiate Google OAuth login.
-   `GET /api/auth/profile`: Get current user profile (Protected).
-   `POST /api/auth/upload-profile-picture`: Upload profile image (Protected).

### Recipes
-   `GET /api/recipes`: Get all recipes (supports pagination `?page=1` and filtering `?type=Veg`).
-   `GET /api/recipes/search?q=query`: Search recipes by title, ingredients, or cuisine.
-   `GET /api/recipes/:id`: Get a single recipe by ID.
-   `POST /api/recipes`: Create a new recipe (Protected).
-   `GET /api/recipes/random`: Get random recipes (e.g., for marquee).
