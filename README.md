# TA Solutions Currency Converter

Full-stack currency converter built with Angular 19, Angular Material, and NestJS.

## Tech Stack
- Angular 19 (standalone components)
- Angular Material
- NestJS 11
- IndexedDB (primary) with localStorage fallback

## Local Setup

### Backend
1. `cd backend`
2. `cp .env.example .env` and set `FREE_CURRENCY_API_KEY`
3. `pnpm install`
4. `pnpm start:dev`

Backend runs on `http://localhost:3000`.

### Frontend
1. `cd frontend`
2. `pnpm install`
3. `pnpm start`

Frontend runs on `http://localhost:4200`.

## API Endpoints
- `GET /currencies`
- `GET /convert?from=USD&to=EUR&amount=100&date=2024-01-01`

## Deployment Notes
### Backend
- Set `FREE_CURRENCY_API_KEY` and `ALLOWED_ORIGINS` (comma-separated).

### Frontend (Netlify)
- Update `frontend/src/environments/environment.prod.ts` with your deployed backend URL.
- Run `pnpm build` and publish `frontend/dist/frontend`.

If pnpm reports ignored build scripts, run `pnpm approve-builds` inside the affected package.
