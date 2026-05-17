# 0008 — Utforska "Från skafferiet" filter: client-side scoring, cursor not advanced

**Status**: Accepted

## Context

The Utforska page shows Förslag from a shared pool using a per-user seen-cursor. Normally the feed is paginated: each call returns the next 10 unseen items and marks them seen.

The "Från skafferiet" filter scores each Förslag by how many of its ingredient names appear (substring match) in the user's Skafferi, then sorts best-match first. Two questions arose:

1. Where should match scoring happen — backend or frontend?
2. Should filter-fetch advance the seen-cursor?

## Decision

**Client-side scoring.** When the filter activates, the frontend fetches all currently unseen Förslag in a single call (without marking them seen), receives the ingredient name strings alongside each card, fetches the user's Skafferi ingredient names, and computes match scores locally. The sorted result is rendered as a flat list (no infinite scroll while filter is active).

**Cursor does not advance during filter-fetch.** The seen-cursor only advances during normal unfiltered scroll.

## Rationale

**Client-side scoring** avoids embedding Skafferi state into the Förslag query. Server-side scoring would require the API to join Förslag ingredients against the user's Skafferi on every paginated request, complicating the query and coupling two unrelated modules (Utforska and Pantry) in the backend. The Förslag pool is at most ~150 items — trivially small for a client-side sort.

**Cursor non-advancement** preserves the intent of the seen-cursor: to track which Förslag have actually been surfaced to the user in a discovery context. Browsing under a filter is goal-directed, not discovery; burning the quota silently would surprise users who later browse unfiltered and find the pool already exhausted.
