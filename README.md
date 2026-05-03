# 2Eat

A full-stack recipe management application for browsing, creating, and managing recipes and ingredients.

## Tech Stack

**Backend:** ASP.NET Core (.NET 10) · Minimal APIs · Entity Framework Core 10 · PostgreSQL  
**Frontend:** React 19 · TypeScript · Vite · Tailwind CSS · TanStack Query · React Router v7

## Getting Started

### With Docker (recommended)

```bash
docker compose up --build
```

| Service | URL |
|---|---|
| Web app | http://localhost |
| API | http://localhost:5264 |
| API docs (Scalar) | http://localhost:5264/scalar/v1 |

### Local Development

Requires .NET 10 SDK, Node 22+, and a running PostgreSQL instance.

**Backend**

```bash
dotnet run --project src/2Eat.Web.API/
# Runs on http://localhost:5264
# Applies migrations automatically on startup
```

**Frontend**

```bash
cd src/2Eat.WebApp
npm install
npm run dev
# Runs on http://localhost:5173, proxies /api to the backend
```

## Features

- Browse and search recipes
- Create and edit recipes with ingredients, cook/prep times, and ratings
- Manage ingredients with allergen tagging (Gluten, Lactose, Nuts, Vegetarian, Vegan)
- Image uploads for recipes
- Ingredient and recipe categorization

## Project Structure

```
src/
├── 2Eat.Domain/         # Entities and domain models
├── 2Eat.Application/    # Service interfaces and application logic
├── 2Eat.Infrastructure/ # EF Core, PostgreSQL, service implementations
├── 2Eat.Web.API/        # ASP.NET Core Minimal API endpoints
└── 2Eat.WebApp/         # React frontend
```

## Database

PostgreSQL is the primary database. Migrations are applied automatically on API startup. When running via Docker Compose, the database is seeded with sample categories, ingredients, and Swedish recipes.

To add a migration:

```bash
dotnet ef migrations add <Name> --project src/2Eat.Infrastructure/ --startup-project src/2Eat.Web.API/
```
