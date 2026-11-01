# CampusFind Java + MySQL Backend

This is the backend for the CampusFind Smart Campus Lost & Found website. It is a student-friendly Java OOP + DBMS implementation using Spring Boot REST APIs, Spring Data JPA, and MySQL.

## What it includes

- Student sign-up and sign-in with BCrypt password hashing.
- Database-backed bearer sessions (tokens stored in `auth_sessions`).
- Create, list, view, edit and withdraw lost/found reports.
- Search-independent report endpoints and server-side possible matching.
- Create and review claim requests and update claim status.
- MySQL tables for students, item reports, claims and sessions.
- CORS configured for `https://campusfind-kappa.vercel.app` and local Vite development.
- Dockerfile for hosting the Java API.

## OOP concepts to explain in internal assessment

- **Encapsulation:** `Student`, `ItemReport`, `ClaimRequest` keep their fields private and expose methods.
- **Abstraction:** service classes expose operations such as `ReportService.create()` rather than database details to controllers.
- **Separation of concerns:** controllers handle HTTP, services handle business rules, repositories handle database access.
- **Polymorphism / interfaces:** Spring Data repository interfaces are implemented by Spring at runtime; controller/service classes depend on repository abstractions.
- **Objects:** each student, item report and claim is represented by a Java object.

## Database tables

- `students`: student identity and BCrypt password hash.
- `item_reports`: lost/found report fields and status.
- `claim_requests`: claim verification details and status.
- `auth_sessions`: bearer token sessions.

The schema is in `src/main/resources/schema.sql` and runs on application startup.

## Run locally

Requirements: JDK 17+, Maven, and MySQL 8+.

1. Create the MySQL database (or let the URL create it):

   ```sql
   CREATE DATABASE campusfind;
   ```

2. Set environment variables, or update the local defaults in `src/main/resources/application.properties`:

   ```text
   DB_URL=jdbc:mysql://localhost:3306/campusfind?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
   DB_USERNAME=root
   DB_PASSWORD=your_mysql_password
   PORT=8080
   ```

3. In this folder, run:

   ```bash
   mvn spring-boot:run
   ```

4. Test the health endpoint:

   ```text
   http://localhost:8080/api/health
   ```

   Expected response: `{"status":"ok","service":"CampusFind Java API"}`

## API endpoints

| Method | Endpoint | Purpose | Auth |
|---|---|---|---|
| POST | `/api/auth/signup` | Create student account | No |
| POST | `/api/auth/login` | Sign in, returns token + user | No |
| POST | `/api/auth/logout` | End session | Bearer token recommended |
| GET | `/api/auth/me` | Current student | Yes |
| GET | `/api/reports` | List all reports | No |
| GET | `/api/reports/{id}` | Get one report | No |
| GET | `/api/reports/mine` | Current student's reports | Yes |
| POST | `/api/reports` | Create report | Yes |
| PUT | `/api/reports/{id}` | Update own report | Yes, owner only |
| DELETE | `/api/reports/{id}` | Withdraw own report | Yes, owner only |
| GET | `/api/reports/{id}/matches` | Find opposite-type possible matches | No |
| GET | `/api/claims` | List claims for center prototype | Yes |
| POST | `/api/claims` | Submit a claim request | Yes |
| PATCH | `/api/claims/{id}/status` | Update claim status | Yes |

For protected endpoints, send `Authorization: Bearer <token>`.

## Example sign-up request

```json
{
  "name": "Student Name",
  "rollNo": "23CS1042",
  "department": "CSE",
  "email": "student@college.edu",
  "password": "change_this_password"
}
```

## Example report request

```json
{
  "type": "lost",
  "name": "Blue Water Bottle",
  "category": "bottles",
  "description": "Blue steel bottle with a small sticker",
  "date": "2026-10-24",
  "time": "14:30",
  "location": "Library",
  "features": "Small orange sticker near the lid",
  "image": null,
  "status": "open",
  "contact": "student@college.edu",
  "handover": null
}
```

`image` accepts a URL or data URL string. The current frontend ZIP uses browser object URLs for photo previews and does not upload the file to the server yet; the frontend needs a small integration change to send an actual data URL or use a dedicated image-storage service.

## Deploy the backend

The frontend is already hosted on Vercel. The Java backend must be hosted separately (for example, as a Docker web service on Render) and connect to a persistent MySQL database. Do not put database credentials in the React/Vite frontend or in a public Git repository.

For Render:

1. Push this backend folder to a GitHub repository.
2. Create a MySQL service/database and keep it private where possible.
3. Create a Web Service from the backend repository and select Docker.
4. Configure `DB_URL`, `DB_USERNAME`, `DB_PASSWORD` and `PORT` in the service's environment settings.
5. Make sure the JDBC URL uses the database host and port provided by your database host.
6. Deploy and verify `/api/health`.
7. The frontend needs `VITE_API_BASE_URL=https://YOUR-BACKEND-HOST` in Vercel Project Settings → Environment Variables, then redeploy.

Official docs: https://render.com/docs/deploys and https://render.com/docs/deploy-mysql

## Important frontend integration note

The current exported frontend still calls synchronous localStorage-based functions in `src/services/auth.ts` and `src/services/reports.ts`. A backend cannot become connected just by adding a URL in Vercel; those service functions and the pages that call them must be updated to use asynchronous HTTP requests. Do that integration before treating the website as a live shared system.

## Student-project limitations

This is a learning prototype, not production-ready campus infrastructure. Before real use, add role-based center-admin authorization, rate limiting, token expiry, email verification, secure image storage, audit logs, and stricter access control for private claim details. Do not use real student information until those controls are in place.
