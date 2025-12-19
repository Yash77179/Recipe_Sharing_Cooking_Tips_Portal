require('dotenv').config();
const mongoose = require('mongoose');

// Schema definition (must match server.js)
const recipeSchema = new mongoose.Schema({
    title: { type: String, required: true },
    image: { type: String, required: true },
    description: { type: String, required: true },
    ingredients: [String],
    instructions: [String],
    tips: String,
    prepTime: { type: String, default: '15 mins' },
    cookTime: { type: String, default: '30 mins' },
    servings: { type: String, default: '4' },
    difficulty: { type: String, default: 'Medium' },
    cuisine: { type: String, default: 'Global' },
    dietaryType: { type: String, enum: ['Veg', 'Non-Veg', 'Vegan'], default: 'Veg' },
    source: { type: String, enum: ['user', 'themealdb', 'manual'], default: 'manual' },
    createdAt: { type: Date, default: Date.now }
});

const RecipeModel = mongoose.models.Recipe || mongoose.model('Recipe', recipeSchema);

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/recipe_portal';

const sampleRecipes = [
    // --- ITALIAN ---
    {
        title: "Rustic Roasted Tomato Basil Soup",
        image: "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=800&q=80",
        description: "A comforting, velvety soup made with vine-ripened roasted tomatoes, fresh basil, and a touch of cream.",
        ingredients: [
            "3 lbs Roma tomatoes, halved", "1 head garlic", "1 large onion, wedges", "1/2 cup fresh basil",
            "1 quart vegetable broth", "1/2 cup heavy cream", "2 tbsp olive oil", "1 tsp dried oregano"
        ],
        instructions: [
            "Roast tomatoes, onion, and garlic at 400°F (200°C) for 45 mins.",
            "Squeeze roasted garlic out of skins.",
            "Simmer roasted veggies with broth for 10 mins.",
            "Blend until smooth with fresh basil.",
            "Stir in cream and serve."
        ],
        tips: "Add a parmesan rind while simmering for extra flavor.",
        prepTime: "15 mins",
        cookTime: "55 mins",
        servings: "4 bowls",
        difficulty: "Easy",
        cuisine: "Italian",
        dietaryType: "Veg",
        source: "manual"
    },
    {
        title: "Classic Spaghetti Carbonara",
        image: "https://images.unsplash.com/photo-1612874742237-6526221588e3?auto=format&fit=crop&w=800&q=80",
        description: "Authentic Roman pasta dish made with eggs, hard cheese, cured pork, and black pepper. No cream allowed!",
        ingredients: [
            "400g Spaghetti", "150g Guanciale or Pancetta", "3 large eggs", "1 cup Pecorino Romano, grated", "Black pepper"
        ],
        instructions: [
            "Boil pasta in salted water.",
            "Crisp the guanciale in a pan.",
            "Whisk eggs and cheese together.",
            "Toss hot pasta with pork fat, then remove from heat and mix in egg mixture quickly to create a creamy sauce.",
            "Top with extra pepper."
        ],
        tips: "Use pasta water to emulsify the sauce.",
        prepTime: "10 mins",
        cookTime: "20 mins",
        servings: "4 people",
        difficulty: "Medium",
        cuisine: "Italian",
        dietaryType: "Non-Veg",
        source: "manual"
    },

    // --- INDIAN ---
    {
        title: "Creamy Butter Chicken (Murgh Makhani)",
        image: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=800&q=80",
        description: "Tender chicken pieces in a rich, creamy tomato gravy with aromatic spices.",
        ingredients: [
            "500g Chicken thighs", "1 cup yogurt", "2 tbsp ginger-garlic paste", "1 cup tomato puree", "1/2 cup heavy cream", "2 tbsp butter", "Kasoori methi"
        ],
        instructions: [
            "Marinate chicken in yogurt and spices for 1 hour.",
            "Cook chicken in a pan or oven.",
            "Make gravy: sauté spices, add tomato puree, and cook until oil separates.",
            "Add cream and chicken to gravy. Simmer.",
            "Finish with butter and crushed kasoori methi."
        ],
        tips: "Use cashew paste for an even richer texture.",
        prepTime: "30 mins",
        cookTime: "40 mins",
        servings: "4 people",
        difficulty: "Medium",
        cuisine: "Indian",
        dietaryType: "Non-Veg",
        source: "manual"
    },
    {
        title: "Palak Paneer",
        image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=80",
        description: "Soft cottage cheese cubes in a smooth, spiced spinach gravy.",
        ingredients: [
            "500g Spinach", "250g Paneer", "1 onion, chopped", "2 tomatoes", "1 tsp cumin", "2 tbsp cream"
        ],
        instructions: [
            "Blanch spinach and blend into a green paste.",
            "Sauté onions, tomatoes, and spices.",
            "Add spinach puree and cook for 5 mins.",
            "Gently stir in paneer cubes and cream.",
            "Serve with naan or rice."
        ],
        tips: "Don't overcook the spinach to keep the bright green color.",
        prepTime: "20 mins",
        cookTime: "20 mins",
        servings: "3 people",
        difficulty: "Easy",
        cuisine: "Indian",
        dietaryType: "Veg",
        source: "manual"
    },
    {
        title: "Vegetable Biryani",
        image: "https://www.madhuseverydayindian.com/wp-content/uploads/2022/11/veg-biryani.jpg",
        description: "A fragrant rice dish cooked with mixed vegetables, saffron, and whole spices.",
        ingredients: ["1 cup Basmati rice", "1 cup mixed veggies (carrots, peas, beans)", "1/2 cup yogurt", "Biryani masala", "Fried onions"],
        instructions: ["Par-boil rice with whole spices.", "Marinate veggies in yogurt and masala.", "Layer veggies and rice in a pot.", "Dum cook on low heat for 20 mins."],
        tips: "Seal the pot with dough to trap steam.",
        prepTime: "30 mins",
        cookTime: "45 mins",
        servings: "4 people",
        difficulty: "Hard",
        cuisine: "Indian",
        dietaryType: "Veg",
        source: "manual"
    },

    // --- MEXICAN ---
    {
        title: "Street-Style Tacos Al Pastor",
        image: "https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?auto=format&fit=crop&w=800&q=80",
        description: "Pork marinated in dried chilies and pineapple, served on corn tortillas.",
        ingredients: [
            "1kg Pork shoulder", "3 Guajillo chilies", "1/2 cup pineapple juice", "Corn tortillas", "Onion & Cilantro"
        ],
        instructions: [
            "Blend chilies, spices, and pineapple juice.",
            "Marinate pork overnight.",
            "Grill or sear pork until charred.",
            "Serve on warm tortillas with pineapple chunks, onion, and cilantro."
        ],
        tips: "The pineapple enzyme tenderizes the meat.",
        prepTime: "20 mins",
        cookTime: "30 mins",
        servings: "6 people",
        difficulty: "Medium",
        cuisine: "Mexican",
        dietaryType: "Non-Veg",
        source: "manual"
    },
    {
        title: "Guacamole & Homemade Chips",
        image: "https://thepaleodiet.com/wp-content/uploads/2024/12/Finished-guacamole-in-a-bowl_2-480x480.jpg",
        description: "Creamy, zesty guacamole made fresh, served with warm tortilla chips.",
        ingredients: ["3 Avocados", "1 Lime", "1/2 Onion", "Cilantro", "Jalapeno", "Corn Tortillas"],
        instructions: ["Mash avocados with lime juice.", "Stir in chopped onion, cilantro, and jalapeno.", "Cut tortillas into triangles and fry until golden."],
        tips: "Keep the avocado pit in the bowl to prevent browning.",
        prepTime: "15 mins",
        cookTime: "10 mins",
        servings: "4 people",
        difficulty: "Easy",
        cuisine: "Mexican",
        dietaryType: "Veg",
        source: "manual"
    },

    // --- ASIAN ---
    {
        title: "Thai Green Curry",
        image: "https://munchingwithmariyah.com/wp-content/uploads/2025/03/IMG_4915-1200x1200.jpg",
        description: "A fragrant coconut curry with green chilies, lemongrass, and thai basil.",
        ingredients: [
            "1 can Coconut milk", "2 tbsp Green curry paste", "1 Chicken breast or Tofu", "Bamboo shoots", "Thai basil"
        ],
        instructions: [
            "Fry curry paste in a little coconut cream.",
            "Add protein and cook slightly.",
            "Pour in rest of coconut milk and veggies.",
            "Simmer until cooked.",
            "Garnish with basil and chili."
        ],
        tips: "Use full-fat coconut milk for the best texture.",
        prepTime: "15 mins",
        cookTime: "20 mins",
        servings: "3 people",
        difficulty: "Medium",
        cuisine: "Asian",
        dietaryType: "Non-Veg",
        source: "manual"
    },
    {
        title: "Japanese Ramen",
        image: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=800&q=80",
        description: "Rich pork broth with chewy noodles, soft egg, and chashu pork.",
        ingredients: ["Ramen noodles", "4 cups Pork broth", "Soft boiled egg", "Scallions", "Nori", "Chashu pork"],
        instructions: ["Heat broth.", "Boil noodles.", "Assemble bowl: noodles, broth, toppings."],
        tips: "Marinate the soft boiled egg in soy sauce for authenticity.",
        prepTime: "10 mins",
        cookTime: "10 mins",
        servings: "2 people",
        difficulty: "Medium",
        cuisine: "Asian",
        dietaryType: "Non-Veg",
        source: "manual"
    },
    {
        title: "Veggie Stir-Fry",
        image: "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=800&q=80",
        description: "Quick and healthy mix of crisp vegetables in a savory soy-ginger sauce.",
        ingredients: ["Broccoli", "Bell peppers", "Snow peas", "Soy sauce", "Ginger", "Garlic", "Sesame oil"],
        instructions: ["Stir-fry aromatics.", "Add hard veggies then soft veggies.", "Toss with sauce.", "Serve over rice."],
        tips: "Cook on high heat to keep veggies crunchy.",
        prepTime: "15 mins",
        cookTime: "10 mins",
        servings: "2 people",
        difficulty: "Easy",
        cuisine: "Asian",
        dietaryType: "Veg",
        source: "manual"
    },

    // --- BAKING / DESSERTS ---
    {
        title: "Artisan Sourdough Bread",
        image: "https://wildthistlekitchen.com/wp-content/uploads/2025/02/Artisan-Sourdough-Bread-Recipe-5.jpg",
        description: "Crusty on the outside, soft and airy on the inside.",
        ingredients: ["500g bread flour", "350g water", "100g starter", "10g salt"],
        instructions: ["Mix ingredients.", "Fold every 30m.", "Ferment 6h.", "Bake 450F."],
        tips: "Use steam in oven for crust.",
        prepTime: "30 mins",
        cookTime: "45 mins",
        servings: "1 loaf",
        difficulty: "Hard",
        cuisine: "Global",
        dietaryType: "Veg",
        source: "manual"
    },
    {
        title: "Berry & Fig Glazed Tart",
        image: "https://images.unsplash.com/photo-1519915028121-7d3463d20b13?auto=format&fit=crop&w=800&q=80",
        description: "An elegant, show-stopping dessert with fresh seasonal berries.",
        ingredients: ["Tart shell", "Custard filling", "Mixed Berries", "Fig jam"],
        instructions: ["Bake tart shell.", "Fill with custard.", "Top with fruit.", "Glaze."],
        tips: "Assemble just before serving.",
        prepTime: "40 mins",
        cookTime: "25 mins",
        servings: "8 slices",
        difficulty: "Medium",
        cuisine: "French",
        dietaryType: "Veg",
        source: "manual"
    },
    {
        title: "Classic Chocolate Chip Cookies",
        image: "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?auto=format&fit=crop&w=800&q=80",
        description: "Chewy centers, crispy edges, and loaded with chocolate chunks.",
        ingredients: ["2 cups flour", "1 cup butter", "1 cup brown sugar", "2 eggs", "Chocolate chips"],
        instructions: ["Cream butter and sugar.", "Beat in eggs.", "Mix in dry ingredients and chocolate.", "Bake at 350F for 10 mins."],
        tips: "Chill the dough for 24h for deeper flavor.",
        prepTime: "15 mins",
        cookTime: "10 mins",
        servings: "24 cookies",
        difficulty: "Easy",
        cuisine: "American",
        dietaryType: "Veg",
        source: "manual"
    },
    {
        title: "Lemon Herb Roasted Chicken",
        image: "https://images.unsplash.com/photo-1598103442097-8b74394b95c6?auto=format&fit=crop&w=800&q=80",
        description: "Juicy, tender chicken with crispy golden skin.",
        ingredients: ["1 whole chicken", "2 lemons", "Rosemary", "Butter"],
        instructions: ["Roast at 425F for 1h 15m."],
        tips: "Rest before carving.",
        prepTime: "20 mins",
        cookTime: "1h 15m",
        servings: "5 people",
        difficulty: "Medium",
        cuisine: "Global",
        dietaryType: "Non-Veg",
        source: "manual"
    },
    {
        title: "Greek Salad",
        image: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=800&q=80",
        description: "Crisp cucumbers, tomatoes, kalmata olives, and feta cheese.",
        ingredients: ["Cucumber", "Tomato", "Red onion", "Feta cheese", "Olives", "Oregano", "Olive oil"],
        instructions: ["Chop veggies roughly.", "Top with slab of feta.", "Drizzle with oil and oregano."],
        tips: "Authentic Greek salad has no lettuce.",
        prepTime: "10 mins",
        cookTime: "0 mins",
        servings: "2 people",
        difficulty: "Easy",
        cuisine: "Mediterranean",
        dietaryType: "Veg",
        source: "manual"
    }
];

mongoose.connect(MONGO_URI)
    .then(async () => {
        console.log('Connected to MongoDB');
        console.log('Clearing old recipes...');
        await RecipeModel.deleteMany({});
        console.log('Seeding new recipes...');
        await RecipeModel.insertMany(sampleRecipes);
        console.log('Done!');
        process.exit();
    })
    .catch(err => {
        console.log(err);
        process.exit(1);
    });
