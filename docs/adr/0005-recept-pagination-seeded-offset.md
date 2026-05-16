# Recept pagination uses seeded-random offset, not cursor-based

The Recept list uses server-side pagination (`GET /api/recipes?seed=&page=&pageSize=`) with a client-supplied random seed to produce a shuffled-but-stable ordering within a browsing session. The sort is `ORDER BY md5(id::text || seed)` with `OFFSET`/`LIMIT`.

Cursor-based pagination was rejected because it requires a stable sort column, which conflicts with the desired random-feeling discovery experience. True `ORDER BY RANDOM()` was rejected because it produces duplicates and skips as the user scrolls. The seeded approach gives stable ordering within a session while appearing random across sessions and to different users.

All filters (search, category, allergens, Ingrediensfilter, Favoriter) are evaluated server-side as query parameters so they apply across the full catalog, not just the loaded page. This was necessary because the catalog will grow with shared and imported Recept.

## Considered Options

- **Cursor-based, newest-first** — stable and skip-proof, but forces a predictable sort order that doesn't suit discovery browsing.
- **Client-side filtering with server pagination** — broken: filters would only apply to the current page, not the full catalog.
