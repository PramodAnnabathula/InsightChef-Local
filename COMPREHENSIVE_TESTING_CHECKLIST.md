# InsightChef Comprehensive Testing Checklist

## Overview
This checklist covers all features, inputs, buttons, UI states, API behavior, responsive design, and accessibility for the InsightChef recipe generation app.

---

## 1. Inputs & Form Validation

### 1.1 Ingredients Textarea (`ingredients-input`)

#### Normal Inputs
- [ ] Single ingredient: "chicken"
- [ ] Multiple ingredients: "chicken, rice, tomatoes, garlic"
- [ ] Ingredients with quantities: "2 cups flour, 1 tsp salt, 3 eggs"
- [ ] Ingredients with special characters: "olive oil, salt & pepper, 1/2 cup milk"
- [ ] Ingredients with commas: "chicken, beef, pork"
- [ ] Ingredients with parentheses: "flour (all-purpose), sugar (brown)"
- [ ] Mixed case: "ChIcKeN, RiCe, ToMaToEs"
- [ ] Ingredients with numbers: "2 eggs, 3 cups flour, 1.5 tsp salt"
- [ ] Ingredients with units: "500g chicken, 2 tbsp oil, 1 liter water"
- [ ] Long but valid list: 100-500 characters of ingredients

#### Edge Cases & Weird Inputs
- [ ] Empty string: ""
- [ ] Only whitespace: "   " (should show error)
- [ ] Only commas: ",,," (should show error)
- [ ] Only numbers: "123456" (should accept but may not generate good recipes)
- [ ] Only special characters: "!@#$%^&*()" (should accept but sanitized)
- [ ] Maximum length (2000 chars): Generate 2000 character string
- [ ] Over maximum length (2001+ chars): Should truncate silently
- [ ] Control characters: Input with `\x00-\x08\x0b\x0c\x0e-\x1f\x7f` (should be stripped)
- [ ] Newlines: "chicken\nrice\ntomatoes" (should accept)
- [ ] Tabs: "chicken\trice\ttomatoes" (should accept)
- [ ] Unicode characters: "chicken, 米饭, tomate, 🍅"
- [ ] Emoji only: "🍗🍚🍅🧄" (should accept)
- [ ] SQL injection attempt: "chicken'; DROP TABLE recipes; --"
- [ ] XSS attempt: "<script>alert('xss')</script>chicken"
- [ ] HTML tags: "<b>chicken</b>, rice"
- [ ] Very long single word: 2000+ character string without spaces
- [ ] Mixed valid/invalid: "chicken, , rice, , tomatoes"
- [ ] Leading/trailing spaces: "  chicken, rice  " (should trim)
- [ ] Multiple spaces: "chicken    rice    tomatoes" (should accept)
- [ ] Copy-paste from rich text: Paste formatted text (should strip formatting)

#### Character Counter
- [ ] Counter updates in real-time as user types
- [ ] Counter shows "0 / 2000" when empty
- [ ] Counter shows correct count at max length
- [ ] Counter doesn't exceed max length display
- [ ] Counter is accessible (has `aria-live="polite"`)

#### Validation Behavior
- [ ] Error message appears when submitting empty field
- [ ] Error message appears when submitting only whitespace
- [ ] Error message disappears after 5 seconds
- [ ] Error message clears when user starts typing
- [ ] Error message clears when API error is cleared
- [ ] `aria-invalid` is set correctly based on error state
- [ ] `aria-describedby` includes error ID when error exists

---

### 1.2 Cooking Time Slider

#### Normal Inputs
- [ ] Minimum value: 10 minutes
- [ ] Maximum value: 120 minutes
- [ ] Default value: 30 minutes
- [ ] Step increments: 10, 15, 20, 25, 30, 35, 40... (5-minute steps)
- [ ] Middle values: 45, 60, 75, 90 minutes
- [ ] Drag slider to different positions
- [ ] Click on slider track to jump to position

#### Edge Cases & Weird Inputs
- [ ] Value below minimum (9): Should clamp to 10
- [ ] Value above maximum (121): Should clamp to 120
- [ ] Non-step value (e.g., 13): Should round to nearest step (15)
- [ ] Decimal values: 30.7 (should round to 30)
- [ ] Negative values: -5 (should clamp to 10)
- [ ] Very large numbers: 999999 (should clamp to 120)
- [ ] String values: "abc" (should default to 30)
- [ ] Null/undefined: Should default to 30
- [ ] Empty string: "" (should default to 30)
- [ ] Rapid slider movement: Drag quickly back and forth
- [ ] Slider at exact boundaries: 10 and 120

#### Display
- [ ] Large number display shows correct value
- [ ] "minutes" label appears below number
- [ ] Value updates immediately when slider moves
- [ ] Value is clamped/rounded correctly in display
- [ ] `aria-valuenow`, `aria-valuemin`, `aria-valuemax` are correct
- [ ] `aria-valuetext` includes "minutes"

---

### 1.3 Cooking Time +/- Buttons

#### Normal Behavior
- [ ] Decrease button (-) reduces time by 5 minutes
- [ ] Increase button (+) increases time by 5 minutes
- [ ] Buttons work when clicked
- [ ] Buttons disabled during loading
- [ ] Buttons respect min/max boundaries (10-120)
- [ ] Value updates immediately on click
- [ ] Slider updates when buttons are clicked
- [ ] Display number updates when buttons are clicked

#### Edge Cases & Weird Inputs
- [ ] Click decrease at minimum (10): Should stay at 10
- [ ] Click increase at maximum (120): Should stay at 120
- [ ] Rapid clicking: Click multiple times quickly
- [ ] Click while loading: Should be disabled
- [ ] Keyboard navigation: Tab to button, press Enter/Space
- [ ] Mouse + keyboard: Click while focused
- [ ] Multiple rapid clicks: Spam click button
- [ ] Click at boundary: Click decrease at 15 (should go to 10)

#### Accessibility
- [ ] Decrease button has `aria-label="Decrease cooking time by 5 minutes"`
- [ ] Increase button has `aria-label="Increase cooking time by 5 minutes"`
- [ ] Buttons have focus-visible ring
- [ ] Buttons are keyboard accessible (Tab, Enter, Space)
- [ ] Disabled state is announced to screen readers

---

### 1.4 Dietary Preference Buttons

#### Available Options
- [ ] Vegetarian
- [ ] Vegan
- [ ] Gluten-Free
- [ ] Dairy-Free
- [ ] Keto
- [ ] Low-Carb

#### Normal Behavior
- [ ] Click toggles selection on/off
- [ ] Selected state shows checkmark (✓)
- [ ] Selected state has orange gradient background
- [ ] Unselected state has gray background
- [ ] Multiple selections allowed
- [ ] All 6 options can be selected simultaneously
- [ ] Buttons disabled during loading
- [ ] Selection persists when regenerating recipes

#### Edge Cases & Weird Inputs
- [ ] Click same button twice: Should toggle off
- [ ] Select all 6 options
- [ ] Rapid clicking: Click multiple buttons quickly
- [ ] Click while loading: Should be disabled
- [ ] Keyboard navigation: Tab through all buttons
- [ ] Keyboard selection: Space/Enter to toggle
- [ ] Invalid option injection: Try to select non-allowlist option (should be ignored)
- [ ] Array manipulation: Try to pass non-array to dietary (should default to [])
- [ ] Duplicate selections: Try to add same option twice (should be prevented by toggle)

#### Validation
- [ ] Only allowlist options are accepted
- [ ] Non-string values are filtered out
- [ ] Maximum 20 dietary options (though only 6 exist)
- [ ] Invalid options are silently ignored

#### Accessibility
- [ ] Each button has `aria-pressed` attribute
- [ ] `aria-pressed="true"` when selected
- [ ] `aria-pressed="false"` when not selected
- [ ] Each button has descriptive `aria-label`
- [ ] Buttons have focus-visible ring
- [ ] Keyboard navigation works (Tab, Enter, Space)

---

### 1.5 Generate Recipes Button

#### Normal Behavior
- [ ] Button triggers recipe generation
- [ ] Button shows loading state ("Creating magic..." with spinner)
- [ ] Button disabled during loading
- [ ] Button enabled when not loading
- [ ] Button has gradient background (orange-amber)
- [ ] Button has hover effect
- [ ] Button has active/press effect

#### Edge Cases & Weird Inputs
- [ ] Click with empty ingredients: Should show validation error
- [ ] Click with only whitespace: Should show validation error
- [ ] Rapid clicking: Click multiple times quickly (should only trigger once)
- [ ] Click while loading: Should be disabled
- [ ] Keyboard activation: Tab + Enter/Space
- [ ] Click after error: Should work after error is cleared
- [ ] Click with invalid cooking time: Should use default (30)
- [ ] Click with no dietary selections: Should work (empty array)

#### Validation Integration
- [ ] Button triggers form validation
- [ ] Validation errors appear before API call
- [ ] API call only happens if validation passes
- [ ] Error messages clear when new submission starts

#### Accessibility
- [ ] Button has `aria-busy` attribute
- [ ] `aria-busy="true"` when loading
- [ ] `aria-busy="false"` when not loading
- [ ] Button has descriptive `aria-label`
- [ ] Button has focus-visible ring
- [ ] Loading state is announced to screen readers

---

## 2. Buttons & Controls

### 2.1 New Ideas Button (Regenerate)

#### Normal Behavior
- [ ] Button appears when recipes are displayed
- [ ] Button triggers regeneration with same inputs
- [ ] Button shows loading state (disabled)
- [ ] Button has refresh icon (RefreshCw)
- [ ] Button text: "New Ideas"
- [ ] Button uses same form data (ingredients, time, dietary)

#### Edge Cases & Weird Inputs
- [ ] Click when no previous search: Should show error message
- [ ] Click after clearing form: Should show error message
- [ ] Click while loading: Should be disabled
- [ ] Rapid clicking: Click multiple times quickly
- [ ] Click after error: Should work if form data exists
- [ ] Keyboard activation: Tab + Enter/Space
- [ ] Click with form data cleared: Should show appropriate error

#### Error Handling
- [ ] Error message: "Enter ingredients and generate recipes first. Then you can use New Ideas."
- [ ] Error message appears when no form data
- [ ] Error message clears after timeout (8 seconds)

#### Accessibility
- [ ] Button has `aria-label="Generate new recipe ideas"`
- [ ] Button has `aria-busy` attribute
- [ ] Button has focus-visible ring
- [ ] Keyboard navigation works

---

### 2.2 Header Logo/Title

#### Display
- [ ] Header displays "InsightChef" title
- [ ] Header has chef hat icon
- [ ] Header has subtitle: "Smart recipes from your ingredients"
- [ ] Header is centered
- [ ] Header has gradient text effect

#### Accessibility
- [ ] Header has `role="banner"`
- [ ] Header is properly structured (h1)

---

### 2.3 Mock Mode Notice

#### Display Conditions
- [ ] Notice appears when `VITE_MOCK_MODE === 'true'`
- [ ] Notice does not appear in production mode
- [ ] Notice has amber/yellow styling
- [ ] Notice has info icon
- [ ] Notice explains mock mode clearly

#### Content
- [ ] Notice text: "Mock mode — sample recipes"
- [ ] Notice explains sample vs AI-generated
- [ ] Notice mentions backend/API key requirement

#### Accessibility
- [ ] Notice has `role="status"`
- [ ] Notice has `aria-live="polite"`

---

### 2.4 Disclaimer Section

#### Display
- [ ] Disclaimer always visible
- [ ] Disclaimer has alert icon
- [ ] Disclaimer has slate/gray styling
- [ ] Disclaimer explains recipe limitations
- [ ] Disclaimer explains privacy (no data collection)

#### Content
- [ ] Text: "Recipes are suggestions only..."
- [ ] Text: "We do not collect or store your personal data..."

#### Accessibility
- [ ] Disclaimer has `role="complementary"`
- [ ] Disclaimer has `aria-labelledby` for heading
- [ ] Heading is screen-reader only (`sr-only`)

---

### 2.5 Recipe Source Notice

#### Mock Mode
- [ ] Notice shows "Sample recipes" in mock mode
- [ ] Notice has amber styling in mock mode
- [ ] Notice explains testing only

#### Production Mode
- [ ] Notice shows "AI-generated" in production
- [ ] Notice has emerald/green styling in production
- [ ] Notice has sparkles icon in production
- [ ] Notice explains verification needed

#### Display Conditions
- [ ] Notice only appears when recipes are displayed
- [ ] Notice appears above recipe list

#### Accessibility
- [ ] Notice has `role="status"`

---

## 3. API/Network Behavior

### 3.1 Successful API Calls

#### Normal Requests
- [ ] POST `/api/recipes` with valid data
- [ ] Request includes ingredients (string)
- [ ] Request includes cookingTime (string)
- [ ] Request includes dietary (array)
- [ ] Request has `Content-Type: application/json`
- [ ] Response returns 200 status
- [ ] Response includes `recipes` array
- [ ] Recipes are normalized and displayed

#### Request Payload
- [ ] Ingredients sent as string
- [ ] Cooking time sent as string
- [ ] Dietary sent as array (can be empty)
- [ ] All fields properly JSON stringified
- [ ] Request body size within limits (1MB)

#### Response Handling
- [ ] Recipes array is normalized
- [ ] Invalid recipes are filtered out
- [ ] Missing fields use safe defaults
- [ ] Recipes displayed in grid layout
- [ ] Empty recipes array shows error message

---

### 3.2 Error Handling

#### Client-Side Errors (400)
- [ ] 400 status: "Invalid request. Please check your input and try again."
- [ ] Error message displays to user
- [ ] Error message auto-dismisses after 8 seconds
- [ ] Error clears when new request starts
- [ ] Error doesn't crash the app

#### Rate Limiting (429)
- [ ] 429 status: "Too many requests. Please wait a moment and try again."
- [ ] Error message displays
- [ ] Error message auto-dismisses
- [ ] User can retry after waiting

#### Server Errors (502, 503)
- [ ] 502 status: "The recipe service is temporarily unavailable. Please try again later."
- [ ] 503 status: Same message as 502
- [ ] Error message displays
- [ ] Error message auto-dismisses

#### Timeout (504)
- [ ] 504 status: "Request took too long. Please try again."
- [ ] Error message displays
- [ ] Error message auto-dismisses

#### Network Errors
- [ ] Network failure: "Unable to reach the service. Check your connection and try again."
- [ ] Error message displays
- [ ] Error message auto-dismisses
- [ ] App doesn't crash

#### Invalid JSON Response
- [ ] Malformed JSON: Treated as 502 error
- [ ] Error message: "The recipe service is temporarily unavailable..."
- [ ] Error message auto-dismisses

#### Empty Recipes Array
- [ ] Empty array response: "No recipes could be generated. Please try again."
- [ ] Error message displays
- [ ] Error message auto-dismisses

#### Generic Errors
- [ ] Unknown status code: "Something went wrong. Please try again."
- [ ] Error message displays
- [ ] Error message auto-dismisses

---

### 3.3 Mock Mode Behavior

#### Mock Mode Activation
- [ ] Mock mode when `VITE_MOCK_MODE === 'true'`
- [ ] No API call made in mock mode
- [ ] Mock delay: 800ms
- [ ] Mock recipes returned: 3 sample recipes
- [ ] Mock recipes have correct structure

#### Mock Recipes Content
- [ ] Recipe 1: "Garlic Herb Pasta" (Easy, Italian)
- [ ] Recipe 2: "Tomato Basil Rice Bowl" (Easy, Mediterranean)
- [ ] Recipe 3: "Lemon Chicken Stir-Fry" (Medium, Asian)
- [ ] All recipes have ingredients array
- [ ] All recipes have instructions array
- [ ] All recipes have difficulty, prepTime, cookTime, cuisine

---

### 3.4 Backend Validation

#### Ingredients Validation
- [ ] Empty ingredients: Returns 400
- [ ] Only whitespace: Returns 400
- [ ] Valid ingredients: Accepted
- [ ] Ingredients length: No explicit limit on backend (frontend limits to 2000)

#### Cooking Time Validation
- [ ] Time < 10: Returns 400
- [ ] Time > 120: Returns 400
- [ ] Non-numeric time: Returns 400
- [ ] Valid time (10-120): Accepted

#### Dietary Validation
- [ ] Empty array: Accepted
- [ ] Valid dietary options: Accepted
- [ ] Invalid dietary options: Should be filtered (frontend)

---

### 3.5 Request/Response Timing

#### Loading States
- [ ] Loading starts when request begins
- [ ] Loading ends when request completes
- [ ] Loading ends on error
- [ ] Loading state disables form inputs
- [ ] Loading state shows spinner

#### Timeout Handling
- [ ] Long-running requests: Should timeout (504)
- [ ] Network timeout: Handled gracefully
- [ ] User can retry after timeout

---

## 4. UI States

### 4.1 Loading State

#### Visual Indicators
- [ ] Generate button shows "Creating magic..." text
- [ ] Generate button shows spinner icon (Loader2, animated)
- [ ] Generate button is disabled
- [ ] All form inputs are disabled
- [ ] Cooking time +/- buttons are disabled
- [ ] Dietary buttons are disabled
- [ ] Slider is disabled
- [ ] Textarea is disabled

#### Behavior
- [ ] Loading state prevents duplicate submissions
- [ ] Loading state clears previous recipes
- [ ] Loading state clears previous errors
- [ ] Loading state shows immediately on button click
- [ ] Loading state persists until request completes

#### Accessibility
- [ ] `aria-busy="true"` on generate button
- [ ] Loading state announced to screen readers

---

### 4.2 Error State

#### Form Validation Errors
- [ ] Error message appears in red box
- [ ] Error message has warning icon (⚠️)
- [ ] Error message has `role="alert"`
- [ ] Error message has `id="form-error"`
- [ ] Error message auto-dismisses after 5 seconds
- [ ] Error message clears when user types
- [ ] Error message clears when API error is cleared

#### API Errors
- [ ] Error message appears in red box
- [ ] Error message has warning icon (⚠️)
- [ ] Error message has `role="alert"`
- [ ] Error message auto-dismisses after 8 seconds
- [ ] Error message clears when new request starts
- [ ] Error message doesn't prevent new submissions

#### Error Display Priority
- [ ] Form error takes precedence over API error
- [ ] Only one error shown at a time
- [ ] Error messages are user-friendly (not technical)

---

### 4.3 Empty State

#### Display Conditions
- [ ] Empty state shows when `!loading && recipes.length === 0`
- [ ] Empty state shows when no recipes generated yet
- [ ] Empty state shows after error (if no recipes)

#### Visual Elements
- [ ] Empty state has chef hat icon
- [ ] Empty state has heading: "Ready to cook something delicious?"
- [ ] Empty state has description: "Enter your ingredients above to get started"
- [ ] Empty state has white/translucent background
- [ ] Empty state is centered

#### Accessibility
- [ ] Empty state has `aria-labelledby` for heading
- [ ] Empty state has `aria-describedby` for description
- [ ] Empty state is a `<section>` element

---

### 4.4 Results State

#### Display Conditions
- [ ] Results show when `recipes.length > 0`
- [ ] Results show after successful API call
- [ ] Results show after mock mode call
- [ ] Results replace previous results

#### Visual Layout
- [ ] Recipe list heading: "Your Recipes ✨"
- [ ] Recipe source notice appears
- [ ] "New Ideas" button appears
- [ ] Recipes displayed in grid (1 col mobile, 2 col tablet, 3 col desktop)
- [ ] Recipe cards have hover effects
- [ ] Recipe cards have scale animation on hover

#### Recipe Card Content
- [ ] Recipe name displayed prominently
- [ ] Difficulty badge (Easy/Medium/Hard) with color coding
- [ ] Cuisine badge (if present)
- [ ] Total time displayed (prepTime + cookTime)
- [ ] Ingredients list displayed
- [ ] Instructions list displayed (numbered)
- [ ] Empty ingredients: Shows "No ingredients listed."
- [ ] Empty instructions: Shows "No steps listed."

#### Recipe Card Styling
- [ ] Easy difficulty: Emerald/green badge
- [ ] Medium difficulty: Amber/yellow badge
- [ ] Hard difficulty: Rose/red badge
- [ ] Recipe name has gradient background (orange-amber)
- [ ] Card has shadow and hover effects
- [ ] Card has border and rounded corners

---

### 4.5 Form State Management

#### Initial State
- [ ] Ingredients: Empty string
- [ ] Cooking time: 30 minutes (default)
- [ ] Dietary: Empty array
- [ ] Error: Empty string
- [ ] Recipes: Empty array

#### State Persistence
- [ ] Form data persists during regeneration
- [ ] Form data used for "New Ideas" button
- [ ] Form data cleared on page refresh
- [ ] Form data not saved to localStorage

#### State Updates
- [ ] Ingredients update on textarea change
- [ ] Cooking time updates on slider/button change
- [ ] Dietary updates on button click
- [ ] Error updates on validation/API error
- [ ] Recipes update on successful API call

---

## 5. Responsive/Mobile Behavior

### 5.1 Breakpoints

#### Mobile (< 640px / sm)
- [ ] Header: Smaller text (text-3xl)
- [ ] Header icon: Smaller (w-10 h-10)
- [ ] Form padding: Reduced (p-5)
- [ ] Form spacing: Reduced (space-y-5)
- [ ] Textarea: Smaller padding (px-4 py-3)
- [ ] Cooking time buttons: Smaller (w-10 h-10)
- [ ] Cooking time display: Smaller (text-3xl)
- [ ] Dietary buttons: Smaller text (text-xs)
- [ ] Generate button: Smaller padding (py-4)
- [ ] Recipe grid: 1 column
- [ ] Recipe cards: Smaller padding (p-5)
- [ ] Recipe text: Smaller (text-xs, text-sm)
- [ ] New Ideas button: Full width, smaller text

#### Tablet (640px - 1024px / sm - lg)
- [ ] Header: Medium text (text-5xl)
- [ ] Header icon: Medium (w-12 h-12)
- [ ] Form padding: Medium (p-8)
- [ ] Form spacing: Medium (space-y-6)
- [ ] Textarea: Medium padding (px-5 py-4)
- [ ] Cooking time buttons: Medium (w-12 h-12)
- [ ] Cooking time display: Medium (text-4xl)
- [ ] Dietary buttons: Medium text (text-sm)
- [ ] Generate button: Medium padding (py-5)
- [ ] Recipe grid: 2 columns
- [ ] Recipe cards: Medium padding (p-6)
- [ ] Recipe text: Medium (text-sm)
- [ ] New Ideas button: Auto width, medium text

#### Desktop (> 1024px / lg+)
- [ ] Header: Large text (text-5xl)
- [ ] Header icon: Large (w-12 h-12)
- [ ] Form padding: Large (p-8)
- [ ] Form spacing: Large (space-y-6)
- [ ] Textarea: Large padding (px-5 py-4)
- [ ] Cooking time buttons: Large (w-12 h-12)
- [ ] Cooking time display: Large (text-4xl)
- [ ] Dietary buttons: Large text (text-sm)
- [ ] Generate button: Large padding (py-5)
- [ ] Recipe grid: 3 columns
- [ ] Recipe cards: Large padding (p-6)
- [ ] Recipe text: Large (text-sm)
- [ ] New Ideas button: Auto width, large text

---

### 5.2 Touch Interactions

#### Mobile Touch
- [ ] Buttons respond to touch
- [ ] Slider works with touch drag
- [ ] Textarea is easy to tap and focus
- [ ] Dietary buttons are large enough to tap
- [ ] Generate button is large enough to tap
- [ ] New Ideas button is large enough to tap
- [ ] Recipe cards are tappable (hover effects may not apply)

#### Touch Targets
- [ ] All buttons meet minimum 44x44px touch target
- [ ] Buttons have adequate spacing
- [ ] No overlapping touch targets
- [ ] Form inputs are easy to tap

---

### 5.3 Viewport Sizes

#### Small Mobile (320px - 375px)
- [ ] Layout doesn't break
- [ ] Text is readable
- [ ] Buttons are usable
- [ ] No horizontal scrolling
- [ ] Content fits on screen

#### Large Mobile (375px - 640px)
- [ ] Layout optimized
- [ ] Text is readable
- [ ] Buttons are usable
- [ ] No horizontal scrolling

#### Tablet Portrait (640px - 768px)
- [ ] 2-column recipe grid works
- [ ] Form is well-spaced
- [ ] Text is readable

#### Tablet Landscape (768px - 1024px)
- [ ] 2-column recipe grid works
- [ ] Form is well-spaced
- [ ] Text is readable

#### Desktop (1024px+)
- [ ] 3-column recipe grid works
- [ ] Form is well-spaced
- [ ] Text is readable
- [ ] Max width container (max-w-7xl) works

---

### 5.4 Orientation Changes

#### Portrait to Landscape
- [ ] Layout adapts correctly
- [ ] Grid columns adjust
- [ ] Text remains readable
- [ ] Buttons remain usable
- [ ] No layout breaks

#### Landscape to Portrait
- [ ] Layout adapts correctly
- [ ] Grid columns adjust
- [ ] Text remains readable
- [ ] Buttons remain usable
- [ ] No layout breaks

---

### 5.5 Scrolling Behavior

#### Vertical Scrolling
- [ ] Page scrolls smoothly
- [ ] All content is accessible
- [ ] Header stays at top
- [ ] Form is accessible
- [ ] Recipes are accessible

#### Horizontal Scrolling
- [ ] No horizontal scrolling on mobile
- [ ] Content fits within viewport
- [ ] No overflow issues

---

## 6. Accessibility (Keyboard Navigation)

### 6.1 Keyboard Navigation Flow

#### Tab Order
- [ ] Tab starts at ingredients textarea
- [ ] Tab moves to cooking time decrease button
- [ ] Tab moves to cooking time slider
- [ ] Tab moves to cooking time increase button
- [ ] Tab moves through dietary buttons (6 buttons)
- [ ] Tab moves to Generate Recipes button
- [ ] Tab moves to New Ideas button (when visible)
- [ ] Tab order is logical and intuitive

#### Reverse Navigation (Shift+Tab)
- [ ] Shift+Tab works in reverse order
- [ ] Reverse order is logical
- [ ] No elements skipped

---

### 6.2 Focus Management

#### Focus Indicators
- [ ] All focusable elements have visible focus ring
- [ ] Focus ring is orange (`focus-visible:ring-orange-500`)
- [ ] Focus ring has adequate offset
- [ ] Focus ring is visible on all backgrounds
- [ ] Focus ring appears on keyboard navigation only

#### Focus States
- [ ] Textarea shows focus ring
- [ ] Buttons show focus ring
- [ ] Slider shows focus ring
- [ ] Dietary buttons show focus ring
- [ ] Focus is not lost unexpectedly

#### Focus Trapping
- [ ] No focus trapping (allows normal tab flow)
- [ ] Focus moves naturally through page
- [ ] Focus doesn't get stuck

---

### 6.3 Keyboard Interactions

#### Textarea (ingredients-input)
- [ ] Tab focuses textarea
- [ ] Typing works normally
- [ ] Enter creates new line
- [ ] Arrow keys move cursor
- [ ] Home/End move to start/end
- [ ] Ctrl/Cmd+A selects all
- [ ] Copy/paste works
- [ ] Escape doesn't close anything (no modal)

#### Cooking Time Buttons
- [ ] Tab focuses button
- [ ] Enter activates button
- [ ] Space activates button
- [ ] Button increases/decreases time
- [ ] Focus remains on button after activation

#### Cooking Time Slider
- [ ] Tab focuses slider
- [ ] Arrow keys move slider (left/right)
- [ ] Home moves to minimum (10)
- [ ] End moves to maximum (120)
- [ ] Page Up/Page Down move in larger increments
- [ ] Slider value updates on keyboard input

#### Dietary Buttons
- [ ] Tab focuses each button
- [ ] Enter toggles selection
- [ ] Space toggles selection
- [ ] Arrow keys move between buttons (if supported)
- [ ] Selection state updates correctly

#### Generate Recipes Button
- [ ] Tab focuses button
- [ ] Enter activates button
- [ ] Space activates button
- [ ] Button triggers form submission
- [ ] Button shows loading state

#### New Ideas Button
- [ ] Tab focuses button
- [ ] Enter activates button
- [ ] Space activates button
- [ ] Button triggers regeneration

---

### 6.4 Screen Reader Support

#### ARIA Labels
- [ ] All buttons have descriptive `aria-label`
- [ ] Form inputs have associated labels
- [ ] Error messages have `role="alert"`
- [ ] Loading states have `aria-busy`
- [ ] Dietary buttons have `aria-pressed`
- [ ] Form groups have `role="group"` and `aria-labelledby`

#### ARIA Live Regions
- [ ] Character counter has `aria-live="polite"`
- [ ] Error messages have `role="alert"` (implicit live region)
- [ ] Mock mode notice has `aria-live="polite"`
- [ ] Recipe source notice has `role="status"`

#### Semantic HTML
- [ ] Header uses `<header role="banner">`
- [ ] Main content uses semantic structure
- [ ] Recipe list uses `<div role="list">`
- [ ] Recipe cards use `<article role="listitem">`
- [ ] Empty state uses `<section>`
- [ ] Disclaimer uses `<aside role="complementary">`

#### Heading Structure
- [ ] H1: "InsightChef" (in header)
- [ ] H2: "Your Recipes ✨" (recipe list heading)
- [ ] H3: Recipe names (in cards)
- [ ] H4: "Ingredients", "Steps" (in cards)
- [ ] Heading hierarchy is logical

#### Form Labels
- [ ] Ingredients textarea has `<label>` with `htmlFor`
- [ ] Labels are associated with inputs
- [ ] Labels are visible and descriptive
- [ ] Form groups have `aria-labelledby`

#### Error Announcements
- [ ] Form errors are announced immediately
- [ ] API errors are announced immediately
- [ ] Error messages are descriptive
- [ ] Error messages clear appropriately

---

### 6.5 Color Contrast

#### Text Contrast
- [ ] All text meets WCAG AA contrast (4.5:1 for normal text)
- [ ] All text meets WCAG AAA contrast (7:1 for normal text) where possible
- [ ] Large text (18pt+) meets WCAG AA (3:1)
- [ ] Button text has adequate contrast
- [ ] Error text has adequate contrast
- [ ] Recipe card text has adequate contrast

#### Interactive Elements
- [ ] Buttons have adequate contrast
- [ ] Focus rings are visible
- [ ] Selected states are distinguishable
- [ ] Disabled states are distinguishable

---

### 6.6 Alternative Text

#### Icons
- [ ] Icons have `aria-hidden="true"` when decorative
- [ ] Icons used as buttons have `aria-label`
- [ ] Icons don't interfere with screen readers

#### Images
- [ ] No images currently (if added, need alt text)

---

### 6.7 Reduced Motion

#### Animation Preferences
- [ ] Animations respect `prefers-reduced-motion`
- [ ] Spinner animation can be disabled
- [ ] Hover effects can be reduced
- [ ] Transitions can be reduced

---

## 7. Integration & Edge Cases

### 7.1 Form Submission Edge Cases

#### Multiple Submissions
- [ ] Rapid clicking: Only one request sent
- [ ] Button disabled during loading prevents duplicates
- [ ] Form state locked during loading

#### Form State During Loading
- [ ] Form inputs disabled
- [ ] Form values preserved
- [ ] Form can't be modified during loading
- [ ] Form unlocks after loading completes

#### Form Reset
- [ ] Form doesn't reset after submission
- [ ] Form data persists for regeneration
- [ ] Form clears on page refresh

---

### 7.2 Recipe Display Edge Cases

#### Missing Recipe Data
- [ ] Missing name: Shows "Untitled Recipe"
- [ ] Missing difficulty: Shows "Medium"
- [ ] Missing prepTime: Shows 10
- [ ] Missing cookTime: Shows 20
- [ ] Missing cuisine: Shows nothing (no badge)
- [ ] Missing ingredients: Shows "No ingredients listed."
- [ ] Missing instructions: Shows "No steps listed."
- [ ] Invalid difficulty: Shows "Medium"
- [ ] Invalid times: Uses defaults

#### Malformed Recipe Data
- [ ] Null recipe: Filtered out
- [ ] Undefined recipe: Filtered out
- [ ] Non-object recipe: Filtered out
- [ ] Recipe with wrong types: Normalized to defaults
- [ ] Recipe with control characters: Sanitized
- [ ] Recipe with very long strings: Truncated

#### Empty Recipe Arrays
- [ ] Empty array: Shows error message
- [ ] Null array: Shows error message
- [ ] Undefined array: Shows error message
- [ ] Non-array: Shows error message

---

### 7.3 Browser Compatibility

#### Modern Browsers
- [ ] Chrome/Edge: All features work
- [ ] Firefox: All features work
- [ ] Safari: All features work
- [ ] Opera: All features work

#### Mobile Browsers
- [ ] iOS Safari: All features work
- [ ] Chrome Mobile: All features work
- [ ] Firefox Mobile: All features work
- [ ] Samsung Internet: All features work

---

### 7.4 Performance

#### Loading Performance
- [ ] Initial page load is fast
- [ ] Form interactions are responsive
- [ ] API calls complete in reasonable time
- [ ] Mock mode delay is acceptable (800ms)

#### Rendering Performance
- [ ] Recipe cards render quickly
- [ ] Large recipe lists don't lag
- [ ] Animations are smooth
- [ ] No layout shifts

---

## 8. Security Testing

### 8.1 Input Sanitization

#### XSS Prevention
- [ ] HTML tags in ingredients: Sanitized
- [ ] Script tags: Stripped
- [ ] Event handlers: Stripped
- [ ] Control characters: Stripped

#### Injection Prevention
- [ ] SQL injection attempts: Sanitized
- [ ] Command injection: Sanitized
- [ ] NoSQL injection: Sanitized

#### Control Characters
- [ ] Control chars (0x00-0x1F, 0x7F): Stripped
- [ ] Unicode control chars: Handled
- [ ] Zero-width chars: Handled

---

### 8.2 API Security

#### Request Validation
- [ ] Ingredients validated on frontend
- [ ] Cooking time validated on frontend
- [ ] Dietary options validated on frontend
- [ ] Backend validates all inputs

#### Response Handling
- [ ] Malformed responses handled
- [ ] Large responses handled
- [ ] Error responses don't leak info
- [ ] User-friendly error messages

---

## 9. Test Data Scenarios

### 9.1 Normal User Flows

#### Happy Path
1. [ ] Enter ingredients: "chicken, rice, tomatoes"
2. [ ] Set cooking time: 30 minutes
3. [ ] Select dietary: "Gluten-Free"
4. [ ] Click "Generate Recipes"
5. [ ] Wait for loading
6. [ ] See 3 recipes displayed
7. [ ] Click "New Ideas"
8. [ ] See new recipes

#### Minimal Input
1. [ ] Enter ingredients: "chicken"
2. [ ] Keep default time: 30 minutes
3. [ ] No dietary selections
4. [ ] Click "Generate Recipes"
5. [ ] See recipes

#### Maximum Input
1. [ ] Enter 2000 characters of ingredients
2. [ ] Set cooking time: 120 minutes
3. [ ] Select all 6 dietary options
4. [ ] Click "Generate Recipes"
5. [ ] See recipes

---

### 9.2 Error Scenarios

#### Validation Error Flow
1. [ ] Leave ingredients empty
2. [ ] Click "Generate Recipes"
3. [ ] See validation error
4. [ ] Error auto-dismisses after 5 seconds
5. [ ] Enter ingredients
6. [ ] Error clears
7. [ ] Submit successfully

#### API Error Flow
1. [ ] Enter valid ingredients
2. [ ] Click "Generate Recipes"
3. [ ] Simulate API error (502)
4. [ ] See error message
5. [ ] Error auto-dismisses after 8 seconds
6. [ ] Retry submission
7. [ ] Success

#### Network Error Flow
1. [ ] Disconnect network
2. [ ] Enter ingredients
3. [ ] Click "Generate Recipes"
4. [ ] See network error
5. [ ] Reconnect network
6. [ ] Retry submission
7. [ ] Success

---

## 10. Regression Testing

### 10.1 Previous Bugs

#### Check for Regressions
- [ ] No duplicate API calls on rapid clicking
- [ ] Error messages don't stack
- [ ] Form state persists correctly
- [ ] Loading state works correctly
- [ ] Mock mode works correctly
- [ ] Recipe normalization works correctly

---

## Summary

### Total Test Items
- **Inputs & Form Validation**: ~80 items
- **Buttons & Controls**: ~40 items
- **API/Network Behavior**: ~50 items
- **UI States**: ~60 items
- **Responsive/Mobile**: ~50 items
- **Accessibility**: ~80 items
- **Integration & Edge Cases**: ~40 items
- **Security**: ~20 items
- **Test Scenarios**: ~20 items
- **Regression**: ~10 items

**Total: ~450 test items**

---

## Notes

- This checklist should be used as a comprehensive guide for manual and automated testing
- Some items may require specific test environments (mock mode, network conditions, etc.)
- Accessibility testing should be done with actual screen readers (NVDA, JAWS, VoiceOver)
- Responsive testing should be done on actual devices when possible
- Security testing may require additional tools and expertise
