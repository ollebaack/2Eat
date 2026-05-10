# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

**Keep this file current.** When you make changes that affect any of the topics below — new layers, changed commands, added dependencies, new conventions, infrastructure changes — update the relevant section before finishing the task.

## What This Is

2Eat is a full-stack recipe management application. Backend is ASP.NET Core (.NET 10) Minimal APIs with PostgreSQL via EF Core. Frontend is React 19 + TypeScript + Vite + Tailwind CSS.

## Commands

### Backend

```bash
# Run with Aspire (preferred for local dev — dashboard + observability)
cd aspire/2Eat.AppHost
dotnet run
# Dashboard: http://localhost:15888  Frontend: http://localhost:5173

# One-time developer setup (run once per machine):
cd aspire/2Eat.AppHost
dotnet user-secrets set "Parameters:JwtSecret" "dev-only-secret-key-must-be-at-least-32-chars!"
dotnet user-secrets set "Parameters:AnthropicApiKey" "sk-ant-..."

# Run API alone (no Aspire, no observability)
dotnet run --project src/2Eat.Web.API/

# Build
dotnet build src/2Eat.Web.API/2Eat.Web.API.csproj

# Add/apply EF Core migrations
dotnet ef migrations add <Name> --project src/2Eat.Infrastructure/ --startup-project src/2Eat.Web.API/
dotnet ef database update --project src/2Eat.Infrastructure/ --startup-project src/2Eat.Web.API/
```

### Frontend

```bash
cd src/2Eat.WebApp
npm install
npm run dev    # http://localhost:5173 (proxies /api to backend)
npm run build
npm run test   # Playwright smoke tests (desktop + mobile) against http://localhost
```

### Docker (full stack — production-equivalent)

```bash
docker compose up --build
```

### GitHub Actions

Two workflow files live in `.github/workflows/`:

| File | Trigger | What it does |
|---|---|---|
| `ci.yml` | push / PR → `main` | Builds and tests the .NET solution; lints and builds the frontend |
| `docker.yml` | push / PR → `main` | Builds Docker images for API and WebApp; pushes to `ghcr.io` only on merge to `main` |

Images are tagged with short commit SHA (`type=sha`) and branch name (`type=ref,event=branch`). No secrets beyond `GITHUB_TOKEN` are required. NuGet packages are cached by `**/*.csproj` hash; npm packages by `package-lock.json` hash; Docker layers via `type=gha`.

There are no test projects currently.

## Architecture

### Layer Structure

```
2Eat.Domain        → Core entities, no dependencies
2Eat.Application   → Services, interfaces, error types
2Eat.Infrastructure → EF Core DbContext, migrations, service impls
2Eat.Web.API       → Minimal API endpoints, DI wiring, startup
2Eat.WebApp        → React frontend
2Eat.ServiceDefaults → Shared Aspire defaults: OTel, health checks, resilience
2Eat.AppHost       → Aspire orchestrator (lives in aspire/2Eat.AppHost/)
```

Domain entities never reference Application or Infrastructure. Application defines interfaces that Infrastructure implements.

### Backend Patterns

- **Minimal APIs only** — no MVC controllers. Endpoints are grouped via extension methods (e.g., `app.MapRecipeEndpoints()`).
- **Services** injected as `IRecipeService`, `IIngredientService`, `IFileService` — implement in Infrastructure, register in `Program.cs`.
- **Auth**: JWT Bearer tokens. Config required in `appsettings.Development.json` (see file — `Jwt:Secret`, `Jwt:Issuer`, `Jwt:Audience`, `Jwt:ExpiresInMinutes`). Docker env vars are set in `docker-compose.yml`. The `/api/auth/login` and `/api/auth/register` endpoints use `noAuthRedirect: true` in the API client so a 401 throws an error (shows a toast) rather than redirecting the user away from the auth pages.
- **Secrets**: `appsettings.json` and `appsettings.Development.json` are committed with placeholder/dev values only — never put real keys in them. When running with Aspire, secrets go in AppHost user secrets (see one-time setup above). When running the API directly, real secrets go in `appsettings.local.json` (gitignored, loaded automatically by `Program.cs`). For Docker/production use environment variables.
- **Database**: PostgreSQL via Npgsql EF Core 10. `ApplicationDbContext` is in Infrastructure. Migrations auto-apply on startup via `app.Services.ApplyMigrations()`.
- **File uploads**: stored in `/uploads` folder with randomized filenames; original name and content type tracked in `FileUpload` entity.
- **OpenAPI**: Scalar UI available at `/scalar/v1` in development.
- **JSON**: `ReferenceHandler.IgnoreCycles` enabled, case-insensitive deserialization.

### Frontend Patterns

- **API client**: all HTTP calls go through the generic wrapper in `src/lib/api.ts`.
- **Server state**: TanStack React Query with 30s stale time. Mutations should invalidate relevant query keys.
- **Routing**: React Router v7 with nested routes under a `Layout` component.
- **UI components**: custom components in `src/components/ui/` built on Radix UI primitives (Shadcn-style). Always prefer these over one-off inline elements. When building new UI, extract reusable Shadcn-style components into `src/components/ui/` rather than duplicating markup across pages.
- **Responsive design**: all UI must support phone screens. Use Tailwind responsive prefixes (`sm:`, `md:`) and verify mobile layouts when making frontend changes.
- **Notifications**: Sonner for toasts.
- **Styling**: Tailwind CSS v4 (Vite plugin, no separate config file needed).

### Key Domain Models

| Entity | Notes |
|---|---|
| `Recipe` | Has category, ingredients (via `RecipeIngredient`), rating, cook/prep times |
| `Ingredient` | Belongs to category; names auto-normalized to title case; linked to allergens |
| `RecipeIngredient` | Junction with `IngredientMeasurement` (quantity + unit enum) |
| `Allergen` | Enum: Gluten, Vegetarian, Vegan, Lactose, Nuts |
| `User` | Has `ShoppingList` and `MealPlan` relationships (not yet exposed via API) |

### Infrastructure

- **.NET Aspire** is the preferred local development orchestrator. Running `dotnet run` in `aspire/2Eat.AppHost/` starts PostgreSQL, the API, and the WebApp together, with the Aspire dashboard at `http://localhost:15888`.
- When running with Aspire, secrets (`JwtSecret`, `AnthropicApiKey`) are managed via .NET User Secrets on the AppHost project — not `appsettings.local.json`.
- **Docker Compose** is preserved for production-equivalent and CI runs. It runs three services: `db` (PostgreSQL 17), `api` (.NET 10), `webapp` (React + Nginx).
- DB data persisted in `postgres_data` volume; uploads in `uploads` volume shared between host and API container.
- Database connection string key is `2eat` (used by Aspire). Docker Compose passes the connection string via environment variables.
- Connection string config lives in `appsettings.json` (not committed for production — use env vars or secrets).

## Conventions

- Ingredient names are stored in title case — the `Ingredient` entity enforces this in the setter.
- Seed data (categories, sample Swedish recipes) lives in EF Core migrations, not in `OnModelCreating`.
- Unique database indexes on `Recipe.Name` and `Ingredient.Name`.
