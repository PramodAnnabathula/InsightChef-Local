# InsightChef

Smart recipes from your ingredients - A React application that generates personalized recipe suggestions based on available ingredients, cooking time, and dietary preferences.

## Features

- 🍳 Generate recipe suggestions from available ingredients
- ⏱️ Set cooking time constraints (10-120 minutes)
- 🥗 Filter by dietary preferences (Vegetarian, Vegan, Gluten-Free, Dairy-Free, Keto, Low-Carb)
- 📱 Fully responsive design with beautiful UI
- ✨ Modern gradient styling with Tailwind CSS

## Project Structure

```
insightchef/
├── server/
│   └── index.js                # API proxy (Anthropic); keeps API key server-side
├── src/
│   ├── components/
│   │   ├── Header.jsx          # App header with logo and title
│   │   ├── InputForm.jsx       # Form for ingredients, time, and dietary preferences
│   │   ├── RecipeList.jsx      # Container for recipe cards
│   │   ├── RecipeCard.jsx      # Individual recipe card component
│   │   ├── EmptyState.jsx      # Empty state when no recipes are shown
│   │   ├── MockModeNotice.jsx  # Banner when Mock Mode is enabled
│   │   ├── Disclaimer.jsx      # Recipe/data disclaimer and privacy note
│   │   └── RecipeSourceNotice.jsx # Mock vs AI-generated transparency
│   ├── utils/
│   │   ├── inputValidation.js  # Input sanitization and validation
│   │   ├── recipeHelpers.js    # Recipe normalization and safe defaults
│   │   └── mockRecipes.js      # Sample recipes for Mock Mode
│   ├── App.jsx                 # Main app component
│   ├── main.jsx                # React entry point
│   └── index.css               # Tailwind CSS imports
├── index.html                  # HTML template
├── package.json                # Dependencies and scripts
├── vite.config.js              # Vite configuration (dev proxy to API)
├── tailwind.config.js          # Tailwind CSS configuration
├── postcss.config.js           # PostCSS configuration
├── .env.example                # Example env vars (copy to .env)
└── SECURITY.md                 # Security practices and production checklist
```

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn

## Installation

1. Install dependencies:
```bash
npm install
```

## Running the App

### Development Mode

The app uses a **backend API** for recipe generation. The API keeps your Anthropic key server-side and is never exposed to the browser.

1. **Configure the API key**
   - Copy `.env.example` to `.env`
   - Add your [Anthropic API key](https://console.anthropic.com/) as `ANTHROPIC_API_KEY`

2. **Run the API server** (in one terminal):
   ```bash
   npm run dev:api
   ```
   The API listens on `http://localhost:3001`.

3. **Run the frontend** (in another terminal):
   ```bash
   npm run dev
   ```
   The app will be at `http://localhost:5173`. Vite proxies `/api` to the backend.

#### Mock Mode (local testing without backend)

To try the app **without** the API server or an API key, use **Mock Mode**:

1. Create a `.env` (or `.env.local`) in the project root.
2. Set `VITE_MOCK_MODE=true`.
3. Run only the frontend: `npm run dev`.

You’ll see sample recipes and a notice that AI recipe generation requires the backend for production. No external APIs are called.

### Build for Production

Create an optimized production build:
```bash
npm run build
```

The built files will be in the `dist/` directory. Ensure `VITE_MOCK_MODE` is unset or `false` so the app uses the backend for AI recipes.

### Preview Production Build

Preview the production build locally:
```bash
npm run preview
```

## API Configuration

Recipe generation uses the **Anthropic Claude API** via a backend proxy:

- The **frontend** calls `POST /api/recipes` with `{ ingredients, cookingTime, dietary }`. It never talks to Anthropic directly.
- The **backend** (`server/index.js`) uses `ANTHROPIC_API_KEY` from `.env` to call Anthropic. The key is never sent to the client.

See `SECURITY.md` for secrets handling, rate limiting, input validation, and production deployment.

## Responsible AI

- **Disclaimer:** Recipes are presented as suggestions only and may not suit allergies, dietary restrictions, or medical needs. Users are prompted to verify ingredients, allergen information, and nutrition before use.
- **Privacy:** We do not collect or store personal data. Ingredients and preferences are used only to generate recipe suggestions and are not saved.
- **Transparency:** Results are clearly labeled as **sample** (mock mode) or **AI-generated** when recipes are displayed.

## Technologies Used

- **React 19** - UI library
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Icon library
- **PostCSS** - CSS processing
- **Express** - API server (recipe proxy, rate limiting)

## Component Breakdown

- **Header**: Displays the app logo and title
- **InputForm**: Handles user input (ingredients, time, dietary preferences) and form validation
- **RecipeList**: Manages the display of multiple recipe cards and the regenerate button
- **RecipeCard**: Displays individual recipe details (name, difficulty, cuisine, ingredients, instructions)
- **EmptyState**: Shows a friendly message when no recipes are available

## Development

The app uses:
- React Hooks for state management
- Component composition for modularity
- Tailwind CSS for styling
- Responsive design patterns

All components are functional components using React Hooks. The main state is managed in `App.jsx`, and form-specific state is managed in `InputForm.jsx`.
