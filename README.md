# Visway Monorepo

Monorepo for the Visway dog community platform. Vue 3 + Vite frontend, Express + Firebase Admin backend, shared TypeScript types/utils, and Docker-based dev setup.

## Stack
- Frontend: Vue 3, Vite, TailwindCSS, Element Plus, Pinia, Vue Router, Axios, Firebase client SDK
- Backend: Node.js, Express, Firebase Admin SDK, Dotenv, Nodemon (hot reload)
- Shared: TypeScript types and validation helpers
- Tooling: pnpm workspaces, Docker/Docker Compose

## Structure
```
root/
  apps/
    frontend/           # Vue app with Tailwind + Element Plus
    backend/            # Express REST API (/auth, /dogs, /community)
  packages/
    shared/             # Types + validateDogProfile util
  deployment/
    docker/             # Dockerfiles for prod builds
    scripts/            # Dev helper scripts
  docker-compose.yml    # Dev hot reload via containers
  pnpm-workspace.yaml
  tsconfig.base.json
```

## Getting Started
1) Ensure Node.js 18+ and pnpm (`corepack enable pnpm`).
2) Install dependencies across the workspace:
```bash
pnpm install --recursive
```
3) Create env files from templates and fill in Firebase + API settings:
```bash
cp apps/frontend/.env.example apps/frontend/.env
cp apps/backend/.env.example apps/backend/.env
```

### Development
Start backend (Express + Nodemon):
```bash
pnpm dev:backend
```
Start frontend (Vite + Tailwind + Element Plus):
```bash
cd apps/frontend
pnpm dev -- --host 0.0.0.0 --port 5173
```
Or run both via helper script:
```bash
./deployment/scripts/dev.sh
```

### Build
Build everything:
```bash
pnpm -r build
```
Build individually:
```bash
pnpm --filter backend build
pnpm --filter frontend build
pnpm --filter @visway/shared build
```

### Docker
Dev hot reload with Docker Compose (installs deps in containers):
```bash
docker-compose up --build
```
Production-style images live in `deployment/docker/Dockerfile.frontend` and `deployment/docker/Dockerfile.backend`.

## Environment
Frontend (`apps/frontend/.env`)
- `VITE_API_BASE_URL` (e.g., http://localhost:4000)
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`

Backend (`apps/backend/.env`)
- `PORT` (default 4000)
- `FIREBASE_PROJECT_ID`
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_PRIVATE_KEY` (use `\n` for newlines if in one line)
- `FIREBASE_DATABASE_URL`
- `ALLOWED_ORIGINS` (comma-separated, e.g., http://localhost:5173)

## API Surface (backend)
- `POST /auth/register` – create Firebase user
- `POST /auth/login` – verify Firebase ID token
- `GET /auth/profile/:uid` – fetch user profile
- `GET /dogs` – list dog profiles
- `POST /dogs` – create dog profile (uses `validateDogProfile`)
- `GET /dogs/:id` – fetch a dog profile
- `PUT /dogs/:id` – update a profile
- `DELETE /dogs/:id` – remove a profile
- `GET /community` – list posts
- `POST /community` – create post
- `POST /community/:id/like` – like a post

### Sample frontend Axios usage
`apps/frontend/src/lib/api.ts` centralizes calls, e.g.:
```ts
const apiClient = axios.create({ baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:4000" });
const dogs = await apiClient.get('/dogs');
const created = await apiClient.post('/dogs', { name: 'Luna', ownerId: 'uid123' });
```
Additional usage appears in `DashboardPage`, `DogRegistrationForm`, and `CommunityPage`.

### Frontend routes/pages
- `/` Landing
- `/login`
- `/dashboard`
- `/dogs/register`
- `/dogs/:id`
- `/community`

## Shared Package
`packages/shared` exports `User`, `DogProfile`, `CommunityPost` types and `validateDogProfile(profile)` returning `{ valid, errors }` for basic client/server validation.

## Firebase
- Frontend initializes Firebase client in `src/lib/firebase.ts` using Vite env vars.
- Backend initializes Firebase Admin in `src/config/firebase.ts` from .env; routes respond with clear errors if not configured.
