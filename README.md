# CampusFind — Connected Frontend + Java Backend Starter

This bundle contains the CampusFind frontend updated to call the Java Spring Boot REST API, plus the MySQL-backed backend project.

## What is connected in code

- Student sign-up/sign-in now call `POST /api/auth/signup` and `POST /api/auth/login` when `VITE_API_BASE_URL` is configured.
- The frontend stores the returned bearer token and sends it to protected endpoints.
- Browse, home, item details, matches, center, and dashboard refresh reports from `GET /api/reports`.
- Lost/found report forms send report fields and selected images to `POST /api/reports`.
- Report update/withdraw actions call the Java API.
- Claim submission and claim status updates call the Java API.
- The frontend retains local demo mode when the API URL is not configured, and keeps seeded sample listings for presentation.

## Important: code is integrated, but live hosting is still required

I have modified the source code, but I cannot deploy into your Vercel/hosting accounts from this ZIP. The shared database will work only after you deploy the backend and connect it to a hosted MySQL instance, then configure the frontend environment variable below.

## Deployment order

### A. Deploy MySQL + Java backend

1. Create a MySQL 8+ database on a hosting provider.
2. Deploy the `backend/` folder as a Docker web service (the included `backend/Dockerfile` builds the Spring Boot application).
3. Set these environment variables in the backend host:
   - `DB_URL` = JDBC URL from your hosted MySQL provider, including its hostname and port
   - `DB_USERNAME` = database username
   - `DB_PASSWORD` = database password
   - `PORT` = use the port expected by your host (commonly provided automatically)
4. The backend schema is in `backend/src/main/resources/schema.sql` and initializes on startup.
5. Test `https://YOUR-BACKEND-HOST/api/health`. Expected JSON: `{"status":"ok","service":"CampusFind Java API"}`.

Do not commit real database passwords to GitHub or put them in the frontend.

### B. Connect the existing Vercel frontend

1. Open your Vercel project `campusfind-kappa`.
2. Go to **Settings → Environment Variables**.
3. Add `VITE_API_BASE_URL` with the backend base URL only, e.g. `https://your-backend-host.example.com`. Do not add `/api` at the end.
4. Apply it to Production (and Preview if you need it there).
5. Redeploy the frontend. Vite environment variables are embedded at build time.

### C. Smoke test

1. Open `https://campusfind-kappa.vercel.app` in an incognito window.
2. Sign up with a test account and sign in.
3. Submit a lost report with a small image.
4. Open the site in another browser and check Browse Items; the new report should be visible.
5. Submit a found report and check possible matches.
6. Try a claim request.

If the frontend displays “Cannot reach the CampusFind backend”, first check `/api/health`, then verify `VITE_API_BASE_URL` and the backend CORS origin.

## Local development

Frontend (`frontend/`):

```bash
npm install
npm run dev
```

Backend (`backend/`): requires JDK 17+, Maven, and MySQL. See `backend/README.md` for local environment settings and run instructions.

## Limitations / production caution

- Seed listings are demo sample content included in the frontend; they are not database rows.
- Matching compares names, categories, locations, descriptions and distinguishing details. It is not AI image recognition.
- The backend is an internal-assessment prototype. Before real campus use, add proper administrator roles, restrict access to private claim details and claim approval, rate limiting, session expiry, and production image storage.
- The frontend build could not be fully run in this environment because package dependencies were not available to install here. Source syntax was checked, but run `npm install` and `npm run build` before redeploying.
