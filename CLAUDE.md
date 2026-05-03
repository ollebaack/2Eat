# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

**Keep this file current.** When you make changes that affect any of the topics below — new layers, changed commands, added dependencies, new conventions, infrastructure changes — update the relevant section before finishing the task.

## What This Is

2Eat is a full-stack recipe management application. Backend is ASP.NET Core (.NET 10) Minimal APIs with PostgreSQL via EF Core. Frontend is React 19 + TypeScript + Vite + Tailwind CSS.

## Commands

### Backend

```bash
# Run API locally (http://localhost:5264)
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
```

### Docker (full stack)

```bash
docker compose up --build
```

There are no test projects currently.

## Architecture

### Layer Structure

```
2Eat.Domain        → Core entities, no dependencies
2Eat.Application   → Services, interfaces, error types
2Eat.Infrastructure → EF Core DbContext, migrations, service impls
2Eat.Web.API       → Minimal API endpoints, DI wiring, startup
2Eat.WebApp        → React frontend
```

Domain entities never reference Application or Infrastructure. Application defines interfaces that Infrastructure implements.

### Backend Patterns

- **Minimal APIs only** — no MVC controllers. Endpoints are grouped via extension methods (e.g., `app.MapRecipeEndpoints()`).
- **Services** injected as `IRecipeService`, `IIngredientService`, `IFileService` — implement in Infrastructure, register in `Program.cs`.
- **Database**: PostgreSQL via Npgsql EF Core 10. `ApplicationDbContext` is in Infrastructure. Migrations auto-apply on startup via `app.Services.ApplyMigrations()`.
- **File uploads**: stored in `/uploads` folder with randomized filenames; original name and content type tracked in `FileUpload` entity.
- **OpenAPI**: Scalar UI available at `/scalar/v1` in development.
- **JSON**: `ReferenceHandler.IgnoreCycles` enabled, case-insensitive deserialization.

### Frontend Patterns

- **API client**: all HTTP calls go through the generic wrapper in `src/lib/api.ts`.
- **Server state**: TanStack React Query with 30s stale time. Mutations should invalidate relevant query keys.
- **Routing**: React Router v7 with nested routes under a `Layout` component.
- **UI components**: custom components in `src/components/ui/` built on Radix UI primitives (Shadcn-style). Use these before reaching for Radix directly.
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

- Docker Compose runs three services: `db` (PostgreSQL 17), `api` (.NET 10), `webapp` (React + Nginx).
- DB data persisted in `postgres_data` volume; uploads in `uploads` volume shared between host and API container.
- Database connection string lives in `appsettings.json` (not committed for production — use env vars or secrets).

## Conventions

- Ingredient names are stored in title case — the `Ingredient` entity enforces this in the setter.
- Seed data (categories, sample Swedish recipes) lives in EF Core migrations, not in `OnModelCreating`.
- Unique database indexes on `Recipe.Name` and `Ingredient.Name`.
