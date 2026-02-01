# InsightChef — Feature Inventory & Testing Checklist

## 1. Feature, Button, Form & UI State Inventory

### **Features**
| Feature | Description | Location |
|--------|-------------|----------|
| **Recipe generation** | Calls Anthropic API to generate 3 recipes from ingredients, cooking time, and dietary preferences | `App.jsx` |
| **Regenerate recipes** | Re-runs generation with last-used form values (ingredients, time, dietary) | `App.jsx` → `RecipeList` |
| **Empty state** | Shown when no recipes and not loading; prompts user to enter ingredients | `EmptyState.jsx` |

### **Forms & Inputs**
| Element | Type | Purpose | Validation / Constraints |
|--------|------|---------|--------------------------|
| **Ingredients** | `<textarea>` | User lists available ingredients | Required (non-empty trim); placeholder: "e.g., chicken, rice, tomatoes, garlic..." |
| **Cooking time** | Numeric display + `<input type="range">` | Max cooking time (minutes) | Min 10, max 120, step 5; default 30 |
| **Time adjust** | Minus (–) / Plus (+) buttons | Increment/decrement cooking time by 5 | Clamped to 10–120 |
| **Dietary preferences** | 6 toggle buttons | Multi-select: Vegetarian, Vegan, Gluten-Free, Dairy-Free, Keto, Low-Carb | Optional; multiple selections allowed |

### **Buttons & Controls**
| Button | Action | Disabled when | Visual states |
|--------|--------|----------------|---------------|
| **Generate Recipes** | Submits form, triggers API call | `loading === true` | Default, hover, disabled (gray), loading (spinner + "Creating magic...") |
| **New Ideas** (Regenerate) | Regenerates with last form data | `loading === true` | Default, hover, disabled (opacity 50%), active (scale) |
| **Minus (–)** | Decrease cooking time by 5 | Never | Hover, active (scale) |
| **Plus (+)** | Increase cooking time by 5 | Never | Hover, active (scale) |
| **Dietary toggles** (×6) | Toggle option on/off | Never | Unselected (gray), selected (orange gradient + ✓), hover, active |

### **UI States**
| State | Condition | What user sees |
|-------|-----------|----------------|
| **Initial / empty** | `!loading && recipes.length === 0` | Header, `InputForm`, `EmptyState` |
| **Loading** | `loading === true` | Header, `InputForm` (Generate disabled, spinner), `RecipeList` hidden; EmptyState hidden |
| **Error (form)** | Empty ingredients submit | Red banner: "Please enter at least one ingredient to get started! 🥘"; auto-clears in 5s |
| **Error (API)** | API failure | Red banner: "Failed to generate recipes. Please try again."; auto-clears in 5s |
| **Results** | `!loading && recipes.length > 0` | Header, `InputForm`, `RecipeList` with "Your Recipes ✨", "New Ideas" button, grid of `RecipeCard`s |
| **Recipe card** | Per recipe | Name, difficulty badge, cuisine badge, total time, ingredients list, numbered steps |

### **RecipeCard Content (per recipe)**
- **Header:** Recipe name (gradient background).
- **Badges:** Difficulty (Easy / Medium / Hard — color-coded), Cuisine (if present), Total time (prep + cook).
- **Sections:** Ingredients (bulleted), Steps (numbered 1–N).

---

## 2. Testing Checklist

### **Inputs & Forms**

- [ ] **Ingredients textarea**
  - [ ] Accepts plain text input.
  - [ ] Placeholder shows when empty.
  - [ ] Resize behavior (currently `resize-none`) is correct.
  - [ ] Submitting with only whitespace shows validation error and does not call API.
  - [ ] Submitting with at least one non-whitespace character triggers generation.
  - [ ] Long ingredient lists don’t break layout.
- [ ] **Cooking time**
  - [ ] Default is 30 minutes.
  - [ ] Slider: min 10, max 120, step 5; value matches displayed number.
  - [ ] Minus button decreases by 5; never goes below 10.
  - [ ] Plus button increases by 5; never goes above 120.
  - [ ] Slider and +/- stay in sync when either is used.
- [ ] **Dietary preferences**
  - [ ] Each option toggles on/off (multi-select).
  - [ ] Selected state shows checkmark and orange styling.
  - [ ] Multiple options can be selected; selections persist until form submit.
  - [ ] Dietary choices are sent correctly with generate/regenerate (verify via API or UI).
- [ ] **Form submission**
  - [ ] Generate only submits when ingredients are valid.
  - [ ] All form values (ingredients, time, dietary) are passed to the API flow.

---

### **Buttons & Controls**

- [ ] **Generate Recipes**
  - [ ] Click submits form when ingredients valid.
  - [ ] Disabled and shows loading state (spinner, "Creating magic...") while request in progress.
  - [ ] Hover/active styles work; disabled state is clearly different.
- [ ] **New Ideas**
  - [ ] Visible only when there are recipes.
  - [ ] Disabled during loading.
  - [ ] Click regenerates with last-used ingredients, time, and dietary options.
  - [ ] Hover/active styles work.
- [ ] **Time +/-**
  - [ ] Each click changes value by 5 within 10–120.
  - [ ] Buttons don’t double-fire on double-click (or behavior is acceptable).
- [ ] **Dietary toggles**
  - [ ] Each toggle updates selection state correctly.
  - [ ] No unexpected form submit on toggle (e.g. Enter in wrong context).

---

### **API / Network Behavior**

- [ ] **Request**
  - [ ] POST to `https://api.anthropic.com/v1/messages` with correct `Content-Type`.
  - [ ] Body includes model, `max_tokens`, and `messages` with the constructed prompt.
  - [ ] Prompt includes ingredients, max cooking time, and dietary preferences when provided.
- [ ] **Success**
  - [ ] Response JSON is parsed; array of recipes extracted (e.g. via `match(/\[[\s\S]*\]/)`).
  - [ ] Parsed recipes have expected fields: `name`, `difficulty`, `prepTime`, `cookTime`, `cuisine`, `ingredients`, `instructions`.
  - [ ] Recipes replace previous results; loading ends.
- [ ] **Failure**
  - [ ] Non-2xx response: user sees "Failed to generate recipes. Please try again."
  - [ ] Invalid/missing JSON or unexpected shape: same error message.
  - [ ] Network error (e.g. offline): same error handling.
  - [ ] Error auto-clears after 5 seconds.
  - [ ] Loading state always cleared in `finally`.
- [ ] **CORS / auth**
  - [ ] App works with your API setup (e.g. proxy or backend forwarding); browser credentials/headers if used.
  - [ ] Note: Current code does not send `x-api-key`; ensure key is injected via proxy or backend.

---

### **UI States (Loading / Error / Empty / Results)**

- [ ] **Empty (initial)**
  - [ ] EmptyState shows when no recipes and not loading.
  - [ ] Message matches "Ready to cook..." / "Enter your ingredients above...".
- [ ] **Loading**
  - [ ] Generate disabled; spinner and "Creating magic..." shown.
  - [ ] New Ideas disabled if already visible.
  - [ ] Recipe list cleared at start of request; EmptyState hidden.
- [ ] **Error**
  - [ ] Form validation error: red banner with ingredient message.
  - [ ] API error: red banner with "Failed to generate recipes...".
  - [ ] Only one error shown at a time when both could apply (e.g. form vs API).
  - [ ] Errors clear after 5 seconds.
- [ ] **Results**
  - [ ] RecipeList visible with "Your Recipes ✨" and "New Ideas".
  - [ ] Grid shows 3 recipe cards (or fewer if API returns fewer).
  - [ ] Each card shows name, difficulty, cuisine, time, ingredients, steps.
  - [ ] Difficulty colors: Easy (green), Medium (amber), Hard (rose).
  - [ ] EmptyState hidden when results exist.

---

### **Mobile & Responsive Behavior**

- [ ] **Viewport**
  - [ ] `width=device-width, initial-scale=1.0` in `index.html`.
- [ ] **Breakpoints (Tailwind)**
  - [ ] `sm` (e.g. 640px): padding, spacing, font sizes adjust.
  - [ ] `lg` (e.g. 1024px): recipe grid switches to 3 columns (`sm:grid-cols-2 lg:grid-cols-3`).
- [ ] **Header**
  - [ ] Logo and title scale; no overflow on small screens.
- [ ] **InputForm**
  - [ ] Textarea, time control, dietary chips, and Generate button usable on small screens.
  - [ ] Padding/spacing (`p-5 sm:p-8`, etc.) adapt.
- [ ] **RecipeList**
  - [ ] "Your Recipes" and "New Ideas" wrap correctly (`flex-wrap`).
  - [ ] Cards stack on mobile, 2 cols on `sm`, 3 on `lg`.
- [ ] **RecipeCard**
  - [ ] Badges and meta wrap; ingredients/steps readable.
  - [ ] Hover/scale effects don’t break layout on touch devices (or are disabled if needed).
- [ ] **EmptyState**
  - [ ] Icon and copy scale; container stays within viewport.

---

### **Accessibility (Keyboard Navigation)**

- [ ] **Focus visibility**
  - [ ] Textarea shows visible focus (e.g. `focus:border-orange-500 focus:ring-4 focus:ring-orange-100`).
  - [ ] All interactive elements (Generate, New Ideas, +/-, dietary toggles, slider) focusable and have visible focus.
- [ ] **Tab order**
  - [ ] Tab order is logical: ingredients → time controls → dietary → Generate; then, when visible, New Ideas and any other interactive elements.
- [ ] **Keyboard operation**
  - [ ] Generate and New Ideas activatable with Enter (and Space where appropriate).
  - [ ] +/- and dietary toggles activatable with Enter/Space.
  - [ ] Slider adjustable with keyboard (arrow keys).
- [ ] **Labels**
  - [ ] Ingredients, time, and dietary have associated `<label>` or `aria-label` so screen readers can identify them.
- [ ] **Error feedback**
  - [ ] Validation/API errors are announced (e.g. `aria-live` region or equivalent).
- [ ] **Loading**
  - [ ] Loading state communicated to assistive tech (e.g. `aria-busy` on form or button, or live region).
- [ ] **Semantics**
  - [ ] Headings (Header, RecipeList, RecipeCard) use appropriate levels (`h1`, `h2`, `h3`, etc.).
  - [ ] Lists (`ingredients`, `instructions`) use `ul`/`ol` and `li`.

---

## 3. Quick Reference: Files Touched

| File | Role |
|------|------|
| `App.jsx` | State (recipes, loading, error, formData), API call, Generate/Regenerate handlers |
| `InputForm.jsx` | Ingredients, time, dietary, validation, Generate button, error display |
| `RecipeList.jsx` | "Your Recipes", New Ideas button, recipe grid |
| `RecipeCard.jsx` | Single recipe layout and content |
| `EmptyState.jsx` | Empty-state message and icon |
| `Header.jsx` | Logo and title |
| `index.html` | Viewport, `lang`, title |

---

## 4. Notes

- **API key:** The app does not send `x-api-key` (or similar) in the fetch request. Use a backend or Vite proxy to add auth so the key is never exposed in the client.
- **Rate limiting / timeouts:** No explicit handling; consider adding timeout and rate-limit handling for production.
- **Error differentiation:** All failures currently use the same user-facing message; you may want to distinguish network vs. API vs. parse errors for debugging or support.
