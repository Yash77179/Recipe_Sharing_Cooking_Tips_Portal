# React Native Frontend Migration — Recipe Sharing & Cooking Tips Portal

## Overview

The existing project is a full-stack MERN app:
- **Backend**: Express.js + MongoDB (Mongoose) + JWT Auth + Google OAuth + Nodemailer → **stays 100% as-is**
- **Frontend**: Vite + React (JSX, CSS) → **replaced** with **React Native (Expo)** — a cross-platform iOS + Android mobile app

The new `mobile/` directory will be created alongside the existing `frontend/` and `backend/` directories.

---

## User Review Required

> [!IMPORTANT]
> The existing `frontend/` (Vite/React web app) will **NOT** be deleted — it will remain intact. A brand new `mobile/` folder will be created as the React Native Expo app. You can run both.

> [!WARNING]
> Google OAuth cannot use the browser redirect flow on mobile. The mobile app will use **email/password auth only** for now. Google OAuth can be added later using `expo-auth-session`.

> [!IMPORTANT]
> You need **Node.js ≥ 18** and **Expo Go** app installed on your phone (or use iOS Simulator / Android Emulator) to run the mobile app.

---

## Open Questions

> [!IMPORTANT]
> **Do you want to use Expo (managed workflow) or bare React Native CLI?**
> This plan uses **Expo** (recommended for faster setup, OTA updates, no Xcode/Android Studio required for basic testing via Expo Go).

---

## Proposed Changes

### Backend — No Changes
The backend (`/backend`) is kept completely as-is.
All API endpoints (`/api/recipes`, `/api/auth`, etc.) will be consumed by the mobile app exactly as the web frontend does.

---

### New: React Native App (`/mobile`)

**Stack:**
- `expo` (SDK 51+)
- `expo-router` (file-based routing, replaces React Router)
- `@react-navigation/native` + `@react-navigation/native-stack` + `@react-navigation/bottom-tabs` (navigation)
- `expo-secure-store` (replaces `localStorage` for JWT token storage)
- `expo-image-picker` (for profile photo upload)
- `react-native-async-storage` (general storage)
- `axios` (HTTP client)
- `react-native-reanimated` (animations)
- `react-native-safe-area-context`
- `expo-linear-gradient` (gradients for premium UI)
- `@expo/vector-icons` (icons)

---

#### [NEW] `mobile/` — Root

##### [NEW] `mobile/package.json`
Expo project with all dependencies listed above.

##### [NEW] `mobile/app.json`
Expo configuration: app name "RecipePortal", slug, version, splash screen, icon.

##### [NEW] `mobile/.env`
```
API_BASE_URL=http://localhost:5001/api
```
(For production, point to Render backend URL)

---

#### [NEW] `mobile/src/` — Source Code

##### [NEW] `mobile/src/config.js`
API base URL config (reads from env, mirrors `frontend/src/config.js`).

##### [NEW] `mobile/src/context/AuthContext.jsx`
Mirrors web `AuthContext` but uses `expo-secure-store` instead of `localStorage` for token persistence. Same shape: `user`, `token`, `login`, `logout`, `updateUser`, `loading`.

##### [NEW] `mobile/src/context/ThemeContext.jsx`
Dark/light theme support using React Context + system color scheme detection.

---

#### [NEW] Navigation — `mobile/src/navigation/`

##### [NEW] `AppNavigator.jsx`
- **Auth Stack**: Login, Signup screens (shown when not logged in)
- **Main Tab Navigator**: Home, Recipes, Add Recipe, Profile (shown when logged in)
- Each tab with an icon from `@expo/vector-icons`

---

#### [NEW] Screens — `mobile/src/screens/`

Maps 1:1 to the existing web pages:

| Web Page | Mobile Screen | Notes |
|---|---|---|
| `Home.jsx` | `HomeScreen.jsx` | Horizontal recipe carousels, search bar, featured section |
| `Recipes.jsx` | `RecipesScreen.jsx` | Paginated list with Veg/Non-Veg filter chips |
| `RecipeDetails.jsx` | `RecipeDetailScreen.jsx` | Full recipe detail with ingredients, instructions, YouTube link |
| `AddRecipe.jsx` | `AddRecipeScreen.jsx` | Multi-step form: title, image URL, ingredients, instructions |
| `Login.jsx` | `LoginScreen.jsx` | Email + password login with validation |
| `Signup.jsx` | `SignupScreen.jsx` | Name, email, password signup with OTP verification |
| `Profile.jsx` | `ProfileScreen.jsx` | User profile with avatar, bio, favorites, user recipes |
| `About.jsx` | `AboutScreen.jsx` | About page with team info |
| `Lifestyle.jsx` | `LifestyleScreen.jsx` | Lifestyle tips & articles section |
| `SetPassword.jsx` | `SetPasswordScreen.jsx` | OTP + set password screen |

---

#### [NEW] Components — `mobile/src/components/`

| Web Component | Mobile Component | Notes |
|---|---|---|
| `RecipeCard.jsx` | `RecipeCard.jsx` | `TouchableOpacity` card with image, title, badge |
| `FloatingNavbar.jsx` | (replaced by Tab Navigator) | Native bottom tabs |
| `SearchModal.jsx` | `SearchBar.jsx` | Inline search with results dropdown |
| `DeleteConfirmationModal.jsx` | `ConfirmModal.jsx` | Native `Alert.alert` or custom modal |
| `ProfileSidebar.jsx` | (merged into ProfileScreen) | Drawer or inline |
| `PopModal.jsx` | `PopModal.jsx` | React Native Modal component |
| `Footer.jsx` | (not needed on mobile) | — |

---

#### [NEW] `mobile/src/api/` — API Layer

##### [NEW] `mobile/src/api/client.js`
Axios instance with base URL + JWT interceptor (reads token from SecureStore and attaches as `Authorization: Bearer <token>`).

##### [NEW] `mobile/src/api/recipes.js`
- `getRecipes(page, type)` → `GET /api/recipes`
- `getRecipeById(id)` → `GET /api/recipes/:id`
- `searchRecipes(q)` → `GET /api/recipes/search`
- `getGroupedRecipes(type, page)` → `GET /api/recipes/grouped`
- `getRandomRecipes()` → `GET /api/recipes/random`
- `addRecipe(data)` → `POST /api/recipes`
- `deleteRecipe(id)` → `DELETE /api/recipes/:id`

##### [NEW] `mobile/src/api/auth.js`
- `login(email, password)` → `POST /api/auth/login`
- `signup(name, email, password)` → `POST /api/auth/register`
- `verifyOtp(email, otp)` → `POST /api/auth/verify-otp`
- `verifyToken()` → `GET /api/auth/verify`
- `updateProfile(data)` → `PUT /api/auth/profile`
- `uploadPhoto(formData)` → `POST /api/auth/upload-photo`
- `getFavorites()` → `GET /api/auth/favorites`
- `toggleFavorite(recipeId)` → `POST /api/auth/favorites/:recipeId`

---

## File Structure Summary

```
Recipe_Sharing_Cooking_Tips_Portal/
├── backend/          ← unchanged
├── frontend/         ← unchanged (original web app)
└── mobile/           ← NEW React Native Expo app
    ├── app.json
    ├── package.json
    ├── .env
    └── src/
        ├── config.js
        ├── api/
        │   ├── client.js
        │   ├── recipes.js
        │   └── auth.js
        ├── context/
        │   ├── AuthContext.jsx
        │   └── ThemeContext.jsx
        ├── navigation/
        │   └── AppNavigator.jsx
        ├── screens/
        │   ├── HomeScreen.jsx
        │   ├── RecipesScreen.jsx
        │   ├── RecipeDetailScreen.jsx
        │   ├── AddRecipeScreen.jsx
        │   ├── LoginScreen.jsx
        │   ├── SignupScreen.jsx
        │   ├── ProfileScreen.jsx
        │   ├── AboutScreen.jsx
        │   ├── LifestyleScreen.jsx
        │   └── SetPasswordScreen.jsx
        └── components/
            ├── RecipeCard.jsx
            ├── SearchBar.jsx
            ├── ConfirmModal.jsx
            ├── PopModal.jsx
            └── LoadingSpinner.jsx
```

---

## Verification Plan

### Automated Tests
None (Expo apps typically use detox or jest-expo for e2e, out of scope here)

### Manual Verification
1. Run `npx expo start` inside `mobile/` folder
2. Scan QR code with **Expo Go** app on your phone (iOS or Android)
3. Test: Login, Signup, Browse Recipes, View Recipe Detail, Add Recipe, View Profile, Toggle Favorite
4. Ensure backend (`npm run dev` in `backend/`) is running on port 5001

> [!TIP]
> For testing on a physical device, your phone and laptop must be on the **same WiFi network**, OR use `npx expo start --tunnel` which works anywhere via Expo's cloud tunnel.
