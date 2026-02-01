# Security

This document describes security measures, configuration, and deployment practices for InsightChef.

## Secrets and API Keys

- **Never commit secrets.** The Anthropic API key must stay server-side only.
- **Environment variables:** Copy `.env.example` to `.env` and set `ANTHROPIC_API_KEY`. The `.env` file is gitignored.
- **Backend only:** The frontend calls `POST /api/recipes` (our backend). The backend uses `ANTHROPIC_API_KEY` from `process.env` to call Anthropic. The key is never sent to the client or bundled into frontend assets.

## API Architecture

- **No direct third-party API calls from the frontend.** All Anthropic requests go through the Express backend (`server/index.js`).
- **Proxy in development:** Vite proxies `/api` to the backend (see `vite.config.js`). Run `npm run dev:api` for the API and `npm run dev` for the frontend.
- **Production:** Serve the built frontend (e.g. static files) and run the API on the same host or behind a reverse proxy. Ensure `/api` is routed to the backend. Use HTTPS.

## Input Handling

- **Validation and sanitization:** User input (ingredients, cooking time, dietary) is validated and sanitized in `src/utils/inputValidation.js` and again on the backend before calling Anthropic.
- **Ingredients:** Max length 2000 characters; control characters stripped; empty input rejected.
- **Cooking time:** Clamped to 10–120 minutes, step 5.
- **Dietary:** Allowlist only (`Vegetarian`, `Vegan`, `Gluten-Free`, `Dairy-Free`, `Keto`, `Low-Carb`). Any other values are ignored.
- **Recipe output:** API response is normalized in `recipeHelpers.js`. All string fields (name, cuisine, ingredients, instructions) are sanitized (control chars removed, length capped) before display.

## Error Handling

- **No technical details to users.** Frontend and backend return only generic, user-facing messages. Stack traces, raw errors, and implementation details are never sent to the client.
- **Backend logging:** Errors are logged server-side with `logServerError()`. Stack traces are logged only when `NODE_ENV !== 'production'`.
- **HTTP status mapping:** 400 (bad input), 429 (rate limit), 502/503 (upstream/config), 504 (timeout), 500 (unexpected). Responses use a fixed set of safe messages.

## Rate Limiting

- **API:** `express-rate-limit` is applied to `/api/`. Default: 20 requests per minute per IP. Configure via the `limiter` in `server/index.js`.

## Data and Privacy

- **No collection or storage of personal data.** The app does not use cookies, `localStorage`, or `sessionStorage`. Ingredients, cooking time, and dietary preferences are sent only in the request body to the backend for recipe generation and are not persisted. The in-app disclaimer explains this to users.

## Production Checklist

1. **Environment**
   - Set `ANTHROPIC_API_KEY` in production (e.g. platform env vars). Never commit it.
   - Set `NODE_ENV=production` for the API server.

2. **HTTPS**
   - Serve the app and API over HTTPS only.

3. **Headers**
   - Use security headers (e.g. `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Content-Security-Policy`) via your reverse proxy or Express middleware.

4. **CORS**
   - The API uses `cors({ origin: true })`. Tighten `origin` in production to your frontend origin(s).

5. **Dependencies**
   - Run `npm audit` regularly and address reported vulnerabilities.

6. **Secrets**
   - Rotate the API key if it may have been exposed. Use distinct keys per environment.

## Reporting Vulnerabilities

If you discover a security issue, please report it responsibly (e.g. via a private channel to the maintainers) rather than filing a public issue.
