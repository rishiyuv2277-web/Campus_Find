# Frontend ↔ Java API wiring notes

The frontend API base URL is read from `VITE_API_BASE_URL` in `frontend/src/services/api.ts`.

- Auth API wiring: `frontend/src/services/auth.ts`
- Report and claim API wiring: `frontend/src/services/reports.ts`
- Initial shared-data loading: `frontend/src/hooks/useReportSync.ts`
- Java controllers: `backend/src/main/java/com/campusfind/api/`
- MySQL schema: `backend/src/main/resources/schema.sql`

When the environment variable is missing, the app intentionally falls back to local demo mode. When it is set, failed API calls show errors instead of silently pretending that a server write succeeded.
