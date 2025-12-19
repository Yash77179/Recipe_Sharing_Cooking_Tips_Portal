require('dotenv').config();
const mongoose = require('mongoose');
const Recipe = require('./models/Recipe');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/recipe_portal';

// Helper function to calculate difficulty based on instruction length and ingredient count
function calculateDifficulty(instructionLength, ingredientCount) {
    if (ingredientCount <= 5 || instructionLength < 300) {
        return 'Easy';
    } else if (ingredientCount <= 10 || instructionLength < 800) {
        return 'Medium';
    } else {
        return 'Hard';
    }
}

// Helper function to estimate prep and cook time based on instruction length
function estimateTimes(instructionLength, ingredientCount) {
    // Base times
    let prepMins = 10 + (ingredientCount * 2); // 2 mins per ingredient
    let cookMins = Math.ceil(instructionLength / 20); // rough estimate
    
    // Cap times
    prepMins = Math.min(prepMins, 60);
    cookMins = Math.min(cookMins, 120);
    
    return {
        prepTime: `${prepMins} mins`,
        cookTime: `${cookMins} mins`
    };
}

// Helper function to determine dietary type based on ingredients
function determineDietaryType(ingredients) {
    const nonVegKeywords = ['chicken', 'beef', 'pork', 'lamb', 'fish', 'turkey', 'bacon', 'meat', 'prawn', 'shrimp', 'salmon', 'tuna', 'chorizo', 'sausage', 'ham', 'duck'];
    const ingredientsLower = ingredients.join(' ').toLowerCase();
    
    for (const keyword of nonVegKeywords) {
        if (ingredientsLower.includes(keyword)) {
            return 'Non-Veg';
        }
    }
    
    // Check for dairy products to distinguish Veg from Vegan
    const dairyKeywords = ['milk', 'butter', 'cheese', 'cream', 'yogurt', 'egg'];
    for (const keyword of dairyKeywords) {
        if (ingredientsLower.includes(keyword)) {
            return 'Veg';
        }
    }
    
    return 'Veg'; // Default to Veg
}

// Parse ingredients and measures from TheMealDB response
function parseIngredientsWithMeasures(meal) {
    const ingredientsWithMeasures = [];
    const ingredients = [];
    
    for (let i = 1; i <= 20; i++) {
        const ingredient = meal[`strIngredient${i}`];
        const measure = meal[`strMeasure${i}`];
        
        if (ingredient && ingredient.trim() !== '') {
            ingredientsWithMeasures.push({
                ingredient: ingredient.trim(),
                measure: measure ? measure.trim() : ''
            });
            
            // For the simple ingredients array
            const ingredientText = measure && measure.trim() !== '' 
                ? `${measure.trim()} ${ingredient.trim()}`
                : ingredient.trim();
            ingredients.push(ingredientText);
        }
    }
    
    return { ingredientsWithMeasures, ingredients };
}

// Convert meal data from API to our schema
function convertMealToRecipe(meal) {
    const { ingredientsWithMeasures, ingredients } = parseIngredientsWithMeasures(meal);
    
    // Split instructions into array (split by periods or new lines)
    const instructions = meal.strInstructions
        ? meal.strInstructions
            .split(/\r\n|\n/)
            .filter(line => line.trim().length > 0)
            .map(line => line.trim())
        : [];
    
    const instructionLength = meal.strInstructions ? meal.strInstructions.length : 0;
    const ingredientCount = ingredients.length;
    
    const difficulty = calculateDifficulty(instructionLength, ingredientCount);
    const { prepTime, cookTime } = estimateTimes(instructionLength, ingredientCount);
    const dietaryType = determineDietaryType(ingredients);
    
    return {
        // Original fields
        title: meal.strMeal,
        image: meal.strMealThumb || '',
        description: meal.strInstructions 
            ? meal.strInstructions.substring(0, 200) + '...' 
            : 'Delicious recipe from TheMealDB',
        ingredients: ingredients,
        instructions: instructions.length > 0 ? instructions : [meal.strInstructions || 'See source for instructions'],
        tips: meal.strTags ? `Tags: ${meal.strTags}` : 'Enjoy this delicious meal!',
        prepTime: prepTime,
        cookTime: cookTime,
        servings: '4',
        difficulty: difficulty,
        cuisine: meal.strArea || 'Global',
        dietaryType: dietaryType,
        userName: 'TheMealDB',
        
        // TheMealDB specific fields
        idMeal: meal.idMeal,
        strMeal: meal.strMeal,
        strCategory: meal.strCategory,
        strArea: meal.strArea,
        strInstructions: meal.strInstructions,
        strMealThumb: meal.strMealThumb,
        strTags: meal.strTags,
        strYoutube: meal.strYoutube,
        ingredients_with_measures: ingredientsWithMeasures,
        strSource: meal.strSource,
        strImageSource: meal.strImageSource,
        source: 'themealdb'
    };
}

// Fetch meals by first letter
async function fetchMealsByLetter(letter) {
    try {
        const response = await fetch(`https://www.themealdb.com/api/json/v1/1/search.php?f=${letter}`);
        const data = await response.json();
        return data.meals || [];
    } catch (error) {
        console.error(`Error fetching meals for letter ${letter}:`, error.message);
        return [];
    }
}

// Main seeding function
async function seedFromAPI() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB');
        
        console.log('\n🌟 Starting to fetch recipes from TheMealDB API...\n');
        
        const alphabet = 'abcdefghijklmnopqrstuvwxyz'.split('');
        let allMeals = [];
        let totalFetched = 0;
        
        // Fetch meals for each letter
        for (const letter of alphabet) {
            console.log(`Fetching meals starting with '${letter.toUpperCase()}'...`);
            const meals = await fetchMealsByLetter(letter);
            
            if (meals.length > 0) {
                allMeals = allMeals.concat(meals);
                totalFetched += meals.length;
                console.log(`  ✓ Found ${meals.length} meals for letter '${letter.toUpperCase()}'`);
            } else {
                console.log(`  - No meals found for letter '${letter.toUpperCase()}'`);
            }
            
            // Add a small delay to avoid overwhelming the API
            await new Promise(resolve => setTimeout(resolve, 200));
        }
        
        console.log(`\n📊 Total meals fetched: ${totalFetched}`);
        
        if (allMeals.length === 0) {
            console.log('❌ No meals fetched. Exiting...');
            process.exit(0);
        }
        
        // Convert meals to our recipe format
        console.log('\n🔄 Converting meals to recipe format...');
        const recipes = allMeals.map(meal => convertMealToRecipe(meal));
        
        // Clear existing TheMealDB recipes
        console.log('\n🗑️  Clearing existing TheMealDB recipes...');
        const deleteResult = await Recipe.deleteMany({ source: 'themealdb' });
        console.log(`  ✓ Deleted ${deleteResult.deletedCount} existing TheMealDB recipes`);
        
        // Insert new recipes
        console.log('\n💾 Inserting new recipes into database...');
        const insertResult = await Recipe.insertMany(recipes);
        console.log(`  ✓ Successfully inserted ${insertResult.length} recipes`);
        
        // Show some statistics
        console.log('\n📈 Statistics:');
        const cuisines = {};
        const difficulties = {};
        
        recipes.forEach(recipe => {
            cuisines[recipe.cuisine] = (cuisines[recipe.cuisine] || 0) + 1;
            difficulties[recipe.difficulty] = (difficulties[recipe.difficulty] || 0) + 1;
        });
        
        console.log('\nBy Cuisine:');
        Object.entries(cuisines)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .forEach(([cuisine, count]) => {
                console.log(`  ${cuisine}: ${count} recipes`);
            });
        
        console.log('\nBy Difficulty:');
        Object.entries(difficulties).forEach(([difficulty, count]) => {
            console.log(`  ${difficulty}: ${count} recipes`);
        });
        
        console.log('\n✅ Seeding completed successfully!');
        process.exit(0);
        
    } catch (error) {
        console.error('❌ Error during seeding:', error);
        process.exit(1);
    }
}

// Run the seeding
seedFromAPI();
