# ADR 0004 — Dedicated `/api/ingredients` endpoint for Ingrediensfilter

**Status:** Accepted  
**Date:** 2026-05-15

## Context

Ingrediensfilter (2EA-50) lets users pick Ingredienser from the canonical catalog to filter the Recept list. The typeahead combobox needs a list of all Ingredienser to search against.

The Recept page already fetches all recipes via `GET /api/recipes`, which eager-loads each recipe's Ingredienser. A simpler approach would be to derive a deduplicated ingredient list from that already-cached data — no new endpoint needed, and only ingredients that appear in at least one recipe are surfaced.

## Decision

Add a dedicated `GET /api/ingredients` endpoint that returns the full Ingrediens catalog, rather than deriving the list from the client-side recipe cache.

## Alternatives considered

- **Derive from fetched recipes** — rejected because it conflates two separate concerns: the recipe list query and the ingredient catalog. If recipe data is paginated or filtered in the future, the derived ingredient list would silently become incomplete. A dedicated endpoint is the correct long-term contract.

## Consequences

- A new `GET /api/ingredients` endpoint must be added to the backend (service method + repository query + Minimal API mapping).
- The Recept page gains a second query (`['ingredients']`) alongside `['recipes']`.
- The ingredient list is authoritative and complete regardless of how the recipe query evolves.
