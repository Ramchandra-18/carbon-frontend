# Carbon Calculator Frontend (API-aligned)

This frontend is structured against the supplied OpenAPI specification for `http://localhost:8081`.

## Install and run
1. Extract the project.
2. Run `npm install`.
3. Run `npm run dev`.
4. Keep Spring Boot running at port 8081.
5. Sign in with an existing account created through the current Admin user API.

Optional `.env`:
`VITE_API_BASE_URL=http://localhost:8081/api`

## Roles
- Admin: dashboard, organizations, user management, emission factors, operational pages and reports.
- Stakeholder: own organization activity/product/batch/allocation pages, factors and reports.
- Reviewer: dashboard, emission factors and reports.

Frontend route guards are not a security boundary. Enforce permissions and organization isolation in Spring Security and services.

## API limitations in supplied OpenAPI
- Organizations expose GET and POST only: edit/deactivate UI is intentionally not shown.
- Users expose GET and POST only: edit/deactivate UI is intentionally not shown.
- No public registration endpoint exists. Accounts are created by Admin via `POST /api/users`.
- Emission factors expose GET and POST only.
- This version uses HTTP Basic credentials in `sessionStorage` to match the current backend. Use HTTPS and a secure token/session strategy before production.

## Important backend checks
- Confirm `GET /api/organizations` and `GET /api/users` are Admin-only.
- Confirm `POST /api/organizations`, `POST /api/users`, and `POST /api/emission-factors` are Admin-only.
- Confirm organization-scoped endpoints verify the authenticated user's organization, not merely the supplied ID.
- Current Swagger spec does not describe every endpoint's security requirements; check SecurityConfig and service-level authorization.
- Admin report aggregation calls each organization's summary. For larger deployments, add a server-side aggregate endpoint.
