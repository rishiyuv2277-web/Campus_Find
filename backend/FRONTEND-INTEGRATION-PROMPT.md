# Prompt to integrate the existing CampusFind frontend with this backend

Use this prompt in Antigravity or your AI coding tool after opening the exported CampusFind frontend project. Keep the existing UI and styling intact.

> Connect the existing CampusFind React + TypeScript + Vite frontend to the Java Spring Boot backend in the supplied CampusFindBackend project. The backend base URL must come from `import.meta.env.VITE_API_BASE_URL`. Add a shared typed API client that sends JSON and attaches `Authorization: Bearer <token>` from session storage/localStorage. Replace localStorage-only auth/report/claim persistence with API calls. Because API calls are asynchronous, update all affected components and pages to use loading/error states and await service functions. Do not rewrite the design.
>
> API contracts:
> - `POST /api/auth/signup` JSON `{name, rollNo, department, email, password}` returns `{token, user}`.
> - `POST /api/auth/login` JSON `{email, password}` returns `{token, user}`.
> - `POST /api/auth/logout`, `GET /api/auth/me`.
> - `GET /api/reports`, `GET /api/reports/{id}`, `GET /api/reports/mine`.
> - `POST /api/reports`, `PUT /api/reports/{id}`, `DELETE /api/reports/{id}`.
> - `GET /api/reports/{id}/matches` returns `[{report, score, strength, reasons}]`.
> - `GET /api/claims`, `POST /api/claims`, `PATCH /api/claims/{id}/status`.
>
> Match the existing `src/types/index.ts` shapes exactly. The backend uses lower-case report type/status values: `lost`, `found`, `open`, `under-review`, `matched`, `returned`; claim status values are `pending`, `approved`, `declined`. Preserve `reporterId`, `reporterName`, `createdAt`, `handover`, and optional `image` fields. For report creation, require a signed-in user and include the bearer token. Update report creation forms to convert a selected image file to a data URL (limit to the existing 4 MB validation) before sending it as `image`; do not send a `blob:` object URL because it will not work in another browser. Keep a clearly labelled local demo mode only when `VITE_API_BASE_URL` is unset. Add `.env.example`, update README, run `npm run build`, fix all TypeScript/build errors, and explain how to deploy the frontend to Vercel with `VITE_API_BASE_URL` set to the deployed backend URL.
