# Recipe Seeding Scripts

This project now includes two seeding options:

## 1. Manual Sample Recipes (seed.js)

Seeds the database with manually curated sample recipes.

```bash
cd backend
node seed.js
```

This will:
- Clear all existing recipes
- Insert 14 carefully crafted sample recipes covering various cuisines
- Source: marked as "manual"

## 2. TheMealDB API Recipes (seedFromAPI.js)

Fetches recipes from TheMealDB API for all letters A-Z.

```bash
cd backend
node seedFromAPI.js
```

This will:
- Fetch recipes from TheMealDB API for all letters (A-Z)
- Automatically calculate prepTime, cookTime, and difficulty based on recipe complexity
- Determine dietary type (Veg/Non-Veg) based on ingredients
- Clear existing TheMealDB recipes (keeps user-created and manual recipes)
- Insert all fetched recipes
- Source: marked as "themealdb"
- Display statistics about cuisines and difficulties

### Features of seedFromAPI.js:

- **Smart Time Estimation**: Calculates prep and cook times based on number of ingredients and instruction length
- **Difficulty Calculation**: Automatically assigns Easy/Medium/Hard based on complexity
- **Dietary Detection**: Intelligently determines if a recipe is Vegetarian or Non-Vegetarian
- **Comprehensive Data**: Preserves all TheMealDB fields including YouTube links, tags, and source URLs
- **Ingredients with Measures**: Stores both individual ingredients and a combined array with measurements
- **API Rate Limiting**: Includes delays to avoid overwhelming the API

### Schema Updates

The Recipe model now includes:

#### Original Fields:
- title, image, description
- ingredients, instructions, tips
- prepTime, cookTime, servings, difficulty
- cuisine, dietaryType
- userId, userName

#### TheMealDB Fields:
- idMeal, strMeal, strCategory, strArea
- strInstructions, strMealThumb, strTags, strYoutube
- ingredients_with_measures (array of {ingredient, measure})
- strSource, strImageSource

#### Source Tracking:
- `source`: Identifies the origin of the recipe
  - "user": Created by a logged-in user
  - "themealdb": Fetched from TheMealDB API
  - "manual": Sample recipes from seed.js

## Usage Recommendations

1. **Development**: Use `seedFromAPI.js` to populate your database with real recipes for testing
2. **Demo**: Use `seed.js` for a small, curated set of high-quality recipes
3. **Production**: Allow users to create recipes (source: "user")

## Example Statistics (from seedFromAPI.js)

After running, you'll see:
```
📊 Total meals fetched: 300+

By Cuisine:
  British: 25 recipes
  American: 22 recipes
  Italian: 20 recipes
  ...

By Difficulty:
  Easy: 120 recipes
  Medium: 150 recipes
  Hard: 30 recipes
```

## Notes

- The API fetcher includes a 200ms delay between requests to be respectful to TheMealDB
- Existing recipes from other sources are preserved when running seedFromAPI.js
- Both scripts require a MongoDB connection (configured via MONGO_URI in .env)
