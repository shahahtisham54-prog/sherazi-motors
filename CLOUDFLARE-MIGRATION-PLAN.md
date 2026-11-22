# Sherazi Motors — Cloudflare Pages migration plan

## Safety rules
- Keep the existing AppDeploy production site unchanged as the rollback version.
- Keep the GitHub `main` branch unchanged during migration.
- Perform migration work only on `cloudflare-migration`.
- Do not connect this project to the PinkPeak Exports repository or change its Cloudflare project.

## Verified source dependencies
The current source uses:
- `@appdeploy/client` in `src/App.tsx`, `src/VehicleShowcase.tsx`, and `src/AdminDashboard.tsx`.
- `@appdeploy/sdk` in `backend/index.ts`.
- AppDeploy database tables named `vehicles` and `enquiries`.
- AppDeploy file storage for vehicle photos.
- AppDeploy email notification for enquiries.
- Admin email allowlist: `as3703195@gmail.com`.

The current `package.json` does not list either AppDeploy package. A plain Vite build is therefore not a complete migration.

## Target Cloudflare architecture
- Cloudflare Pages for the React/Vite frontend.
- Pages Functions under `functions/api/` for the API.
- Cloudflare D1 for enquiries and vehicle records.
- Cloudflare Access for admin identity and route protection.
- R2 photo storage can be added later, when vehicle photo work is resumed.
- Email notification integration will remain disabled until an email provider and credentials are explicitly configured. Enquiries must still be saved and provide a WhatsApp follow-up.

## Required Pages build settings
- Framework preset: React (Vite)
- Build command: `npm run build`
- Build output directory: `dist`
- Root directory: blank

## Deployment sequence
1. Complete the migration on the isolated branch.
2. Verify the Vite build and inspect all API/auth code.
3. Create a dedicated D1 database and apply the SQL migration.
4. Configure Cloudflare Access for the admin routes and add the Access values as runtime secrets/variables.
5. Connect Pages to the migration branch for a preview deployment.
6. Test public site, enquiry persistence, admin authorization, and vehicle CRUD.
7. Only after successful QA, decide whether to make this the production branch/custom domain.

## Migration code prepared on the isolated branch
- Replaced the three frontend AppDeploy API client imports with a same-origin API helper.
- Added Pages Functions for public enquiries and vehicle inventory.
- Added admin Pages Functions protected by Cloudflare Access JWT validation and an owner email allowlist.
- Added login/logout endpoints for Cloudflare Access.
- Added the initial D1 SQL migration and `wrangler.jsonc` Pages configuration.
- Temporarily deferred vehicle photo/video uploads and email notifications. Enquiries are saved to D1 and return a WhatsApp follow-up link.

## Not yet done
No Cloudflare Pages deployment has been made, no D1 database has been created or bound, Cloudflare Access has not been configured, and no production AppDeploy settings have been changed. The migration branch has not yet had a full build/runtime test; do not deploy until those checks and Cloudflare bindings are complete.
