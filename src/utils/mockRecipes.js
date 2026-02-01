/**
 * Sample recipes for Mock Mode (local testing without backend or AI).
 * Same shape as normalized recipes from the API.
 */

export const MOCK_RECIPES = [
  {
    name: 'Garlic Herb Pasta',
    difficulty: 'Easy',
    prepTime: 5,
    cookTime: 15,
    cuisine: 'Italian',
    ingredients: [
      '8 oz spaghetti',
      '3 tbsp olive oil',
      '4 cloves garlic, minced',
      '1 tsp dried basil',
      '1 tsp dried oregano',
      'Salt and pepper to taste',
      'Grated Parmesan (optional)',
    ],
    instructions: [
      'Cook pasta according to package directions. Reserve ¼ cup pasta water, then drain.',
      'Heat olive oil in a large pan over medium heat. Add garlic and cook until fragrant, about 1 minute.',
      'Add basil, oregano, salt, and pepper. Stir to combine.',
      'Toss in the cooked pasta and a splash of pasta water. Mix until coated.',
      'Serve with Parmesan if desired.',
    ],
  },
  {
    name: 'Tomato Basil Rice Bowl',
    difficulty: 'Easy',
    prepTime: 10,
    cookTime: 25,
    cuisine: 'Mediterranean',
    ingredients: [
      '1 cup long-grain rice',
      '2 cups water or broth',
      '2 medium tomatoes, diced',
      '¼ cup fresh basil, torn',
      '2 tbsp olive oil',
      '1 small onion, diced',
      'Salt and pepper to taste',
    ],
    instructions: [
      'Rinse rice and combine with water in a pot. Bring to a boil, then reduce heat, cover, and simmer 18–20 minutes.',
      'Meanwhile, heat olive oil in a skillet. Sauté onion until soft, about 5 minutes.',
      'Add tomatoes and cook 3–4 minutes. Season with salt and pepper.',
      'Fluff rice and fold in tomato mixture and basil. Serve warm.',
    ],
  },
  {
    name: 'Lemon Chicken Stir-Fry',
    difficulty: 'Medium',
    prepTime: 15,
    cookTime: 20,
    cuisine: 'Asian',
    ingredients: [
      '1 lb chicken breast, sliced',
      '2 tbsp soy sauce',
      '2 tbsp lemon juice',
      '1 tbsp honey',
      '2 cloves garlic, minced',
      '2 cups mixed vegetables (e.g. bell pepper, broccoli)',
      '2 tbsp vegetable oil',
      'Cooked rice, to serve',
    ],
    instructions: [
      'Whisk together soy sauce, lemon juice, honey, and garlic. Toss chicken in half of the mixture; set aside.',
      'Heat 1 tbsp oil in a wok or large skillet over high heat. Stir-fry chicken until cooked through, 5–6 minutes. Remove.',
      'Add remaining oil and vegetables. Stir-fry 3–4 minutes until crisp-tender.',
      'Return chicken to pan, add remaining sauce, and toss to coat. Serve over rice.',
    ],
  },
];

/** Short delay to simulate async API call in mock mode (ms). */
export const MOCK_DELAY_MS = 800;
