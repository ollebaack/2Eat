# Samlingar recipes are user-ordered, not insertion-ordered

Recipes within a Samling carry an explicit `Order` integer on the junction table (`SamlingRecept`), and the UI exposes drag-to-reorder. We chose this over a simpler unordered (insertion-sorted) model because the primary value of a Samling is curation — users arrange recipes intentionally, not just collect them. The cost is a reorder endpoint and a drag UI that switches the detail page from grid to a list-with-handles, but this is acceptable given the feature's purpose.

## Considered options

- **Unordered / insertion order**: no `Order` column, sort by `createdAt`. Zero schema cost, but users can't express a preferred sequence within a collection.
- **Ordered with drag-to-reorder** *(chosen)*: `Order` integer on junction, assigned `MAX + 1` on insert. Gaps are left on delete (no resequencing). Detail page has an "Ändra ordning" toggle that switches to a compact drag-handle list.
