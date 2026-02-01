# InsightChef Feature Inventory

## Complete List of Features, Buttons, Inputs, and UI States

---

## 📝 Inputs

### 1. Ingredients Textarea
- **ID**: `ingredients-input`
- **Type**: `<textarea>`
- **Placeholder**: "e.g., chicken, rice, tomatoes, garlic..."
- **Max Length**: 2000 characters
- **Rows**: 3
- **Validation**: 
  - Must not be empty
  - Must not be only whitespace
  - Control characters stripped
  - Truncated if over max length
- **Features**:
  - Character counter (live: "X / 2000 characters")
  - Real-time validation feedback
  - Auto-clears API errors on input

### 2. Cooking Time Slider
- **Type**: `<input type="range">`
- **Min**: 10 minutes
- **Max**: 120 minutes
- **Step**: 5 minutes
- **Default**: 30 minutes
- **Features**:
  - Visual slider control
  - Large number display with "minutes" label
  - Keyboard accessible (arrow keys, Home, End)
  - Clamps to valid range
  - Rounds to 5-minute steps

### 3. Cooking Time Decrease Button (-)
- **Type**: `<button>`
- **Action**: Decreases time by 5 minutes
- **Min**: 10 minutes (disabled at minimum)
- **Icon**: Minus (Lucide)
- **Features**:
  - Disabled during loading
  - Disabled at minimum value
  - Keyboard accessible

### 4. Cooking Time Increase Button (+)
- **Type**: `<button>`
- **Action**: Increases time by 5 minutes
- **Max**: 120 minutes (disabled at maximum)
- **Icon**: Plus (Lucide)
- **Features**:
  - Disabled during loading
  - Disabled at maximum value
  - Keyboard accessible

### 5. Dietary Preference Buttons (6 options)
- **Type**: Toggle buttons
- **Options**:
  1. Vegetarian
  2. Vegan
  3. Gluten-Free
  4. Dairy-Free
  5. Keto
  6. Low-Carb
- **Features**:
  - Multiple selection allowed
  - Toggle on/off on click
  - Visual checkmark (✓) when selected
  - Selected: Orange gradient background
  - Unselected: Gray background
  - Disabled during loading
  - Keyboard accessible

---

## 🔘 Buttons

### 1. Generate Recipes Button
- **Type**: Primary action button
- **Text**: "Generate Recipes" (normal) / "Creating magic..." (loading)
- **Icon**: Sparkles (normal) / Loader2 spinner (loading)
- **Action**: Validates form and triggers recipe generation
- **Features**:
  - Gradient background (orange-amber)
  - Full width
  - Shows loading state with spinner
  - Disabled during loading
  - Keyboard accessible
  - Triggers form validation

### 2. New Ideas Button (Regenerate)
- **Type**: Secondary action button
- **Text**: "New Ideas"
- **Icon**: RefreshCw (Lucide)
- **Action**: Regenerates recipes with same form data
- **Features**:
  - Only visible when recipes are displayed
  - Requires previous form submission
  - Shows error if no form data exists
  - Disabled during loading
  - Keyboard accessible

---

## 🎨 UI Components

### 1. Header
- **Title**: "InsightChef"
- **Icon**: ChefHat (Lucide)
- **Subtitle**: "Smart recipes from your ingredients"
- **Features**:
  - Centered layout
  - Gradient text effect
  - Responsive sizing

### 2. Mock Mode Notice
- **Condition**: Only when `VITE_MOCK_MODE === 'true'`
- **Style**: Amber/yellow background
- **Icon**: Info (Lucide)
- **Content**: Explains mock mode vs production
- **Features**:
  - Auto-announced to screen readers
  - Responsive layout

### 3. Disclaimer Section
- **Style**: Slate/gray background
- **Icon**: AlertCircle (Lucide)
- **Content**: 
  - Recipe limitations warning
  - Privacy notice (no data collection)
- **Features**:
  - Always visible
  - Accessible structure

### 4. Recipe Source Notice
- **Mock Mode**: 
  - Text: "Sample recipes"
  - Style: Amber background
- **Production Mode**:
  - Text: "AI-generated"
  - Style: Emerald/green background
  - Icon: Sparkles (Lucide)
- **Features**:
  - Only visible when recipes displayed
  - Auto-announced to screen readers

### 5. Recipe List
- **Heading**: "Your Recipes ✨"
- **Layout**: Responsive grid
  - Mobile: 1 column
  - Tablet: 2 columns
  - Desktop: 3 columns
- **Features**:
  - Contains "New Ideas" button
  - Contains Recipe Source Notice
  - Contains recipe cards

### 6. Recipe Card
- **Structure**:
  - Header: Recipe name (gradient background)
  - Badges: Difficulty, Cuisine (optional), Time
  - Ingredients list
  - Instructions list (numbered)
- **Difficulty Colors**:
  - Easy: Emerald/green
  - Medium: Amber/yellow
  - Hard: Rose/red
- **Features**:
  - Hover effects (scale, shadow)
  - Responsive padding
  - Accessible structure

### 7. Empty State
- **Condition**: `!loading && recipes.length === 0`
- **Icon**: ChefHat (Lucide)
- **Heading**: "Ready to cook something delicious?"
- **Description**: "Enter your ingredients above to get started"
- **Features**:
  - Centered layout
  - Accessible structure

---

## 🎭 UI States

### 1. Loading State
- **Triggers**: 
  - When "Generate Recipes" is clicked
  - When "New Ideas" is clicked
- **Visual Indicators**:
  - Generate button shows "Creating magic..." with spinner
  - All form inputs disabled
  - All buttons disabled
- **Behavior**:
  - Prevents duplicate submissions
  - Clears previous recipes
  - Clears previous errors
  - Shows immediately

### 2. Error State
- **Types**:
  - Form validation errors (5 second auto-dismiss)
  - API errors (8 second auto-dismiss)
- **Visual Indicators**:
  - Red error box
  - Warning icon (⚠️)
  - Error message text
- **Behavior**:
  - Form errors clear on input
  - API errors clear on new submission
  - Only one error shown at a time
  - User-friendly messages (not technical)

### 3. Empty State
- **Condition**: No recipes and not loading
- **Visual**: Empty state component
- **Behavior**: Shown when app first loads or after errors

### 4. Results State
- **Condition**: Recipes array has items
- **Visual**: Recipe list with cards
- **Behavior**: 
  - Shows recipe grid
  - Shows "New Ideas" button
  - Shows Recipe Source Notice
  - Hides empty state

### 5. Form State
- **Initial**:
  - Ingredients: ""
  - Cooking time: "30"
  - Dietary: []
- **Persistent**: Form data saved for regeneration
- **Validation**: Real-time and on submit

---

## 🌐 API/Network Features

### 1. API Endpoint
- **URL**: `/api/recipes`
- **Method**: POST
- **Content-Type**: application/json
- **Payload**:
  ```json
  {
    "ingredients": "string",
    "cookingTime": "string",
    "dietary": ["array"]
  }
  ```

### 2. Response Handling
- **Success**: 200 status, `{ recipes: [...] }`
- **Errors**:
  - 400: Invalid request
  - 429: Rate limited
  - 502/503: Service unavailable
  - 504: Timeout
  - Network errors: Connection failure

### 3. Mock Mode
- **Condition**: `VITE_MOCK_MODE === 'true'`
- **Behavior**: 
  - No API call
  - 800ms delay
  - Returns 3 mock recipes
  - Shows mock mode notice

---

## 📱 Responsive Breakpoints

### Mobile (< 640px)
- Single column recipe grid
- Smaller text and padding
- Full-width buttons
- Compact layout

### Tablet (640px - 1024px)
- Two column recipe grid
- Medium text and padding
- Balanced layout

### Desktop (> 1024px)
- Three column recipe grid
- Large text and padding
- Spacious layout
- Max width container (max-w-7xl)

---

## ♿ Accessibility Features

### Keyboard Navigation
- Tab order: Textarea → Time buttons → Slider → Dietary buttons → Generate → New Ideas
- All interactive elements keyboard accessible
- Focus indicators (orange ring)
- Keyboard shortcuts (Enter, Space, Arrow keys)

### Screen Reader Support
- ARIA labels on all buttons
- ARIA live regions for errors and counters
- Semantic HTML structure
- Proper heading hierarchy
- Form labels associated with inputs

### Visual Accessibility
- High contrast text
- Visible focus indicators
- Clear error messages
- Disabled state indicators

---

## 🔒 Security Features

### Input Sanitization
- Control characters stripped
- HTML tags sanitized
- XSS prevention
- Length limits enforced

### Validation
- Frontend validation before API call
- Backend validation on server
- User-friendly error messages
- No technical details leaked

---

## 📊 Data Flow

1. **User Input** → Form state
2. **Form Submit** → Validation
3. **Validation Pass** → API call (or mock)
4. **API Response** → Recipe normalization
5. **Normalized Recipes** → Display
6. **Error** → Error state → Auto-dismiss

---

## 🎯 Key Features Summary

- **3 Input Fields**: Ingredients, Cooking Time, Dietary Preferences
- **2 Action Buttons**: Generate Recipes, New Ideas
- **6 Toggle Buttons**: Dietary preferences
- **2 Control Buttons**: Time increase/decrease
- **4 UI States**: Loading, Error, Empty, Results
- **2 Modes**: Mock mode, Production mode
- **3 Layouts**: Mobile, Tablet, Desktop
- **Full Accessibility**: Keyboard navigation, screen readers, ARIA
