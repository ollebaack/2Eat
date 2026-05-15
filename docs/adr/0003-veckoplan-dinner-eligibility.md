# ADR 0003 — Veckoplan dinner-eligibility rule

**Status:** Accepted  
**Date:** 2026-05-15

## Context

Veckoplan is a dinner planner (one slot per day = one middag). Adding a dessert, beverage, or baked-goods recipe to a dinner slot is semantically wrong. We needed a rule to restrict which Recept categories are allowed in a Veckoplan slot, and a place to store that rule.

## Decision

1. **`IsDinnerEligible` boolean on `Category` entity** — set false for Bakverk, Desserter, Drycker; true for all others. New categories added in the future must be explicitly evaluated.

2. **Dual enforcement** — the rule is enforced in two places:
   - **Backend:** `SetDaySlotAsync` rejects a recipe whose category has `IsDinnerEligible = false` (400 Bad Request).
   - **Frontend:** the recipe picker and recipe library exclude non-eligible categories from the list using the `isDinnerEligible` field returned in the Category API response.

3. **`isDinnerEligible` exposed in the Category DTO** — so the frontend filters dynamically from the flag rather than hardcoding category names.

## Alternatives considered

- **Hardcoded exclusion list in code** — rejected because it creates a dual source of truth that drifts as categories change.
- **Frontend-only filtering** — rejected because the rule has backend weight; an API-level constraint is the right home for it.
- **Flag on Recipe instead of Category** — rejected because eligibility is a property of the dish type, not of individual recipes. Coarse-grained by design.

## Consequences

- A small migration is required to add `IsDinnerEligible` to the `Category` table and backfill existing rows.
- Any future category must have `IsDinnerEligible` set explicitly at seed/migration time.
