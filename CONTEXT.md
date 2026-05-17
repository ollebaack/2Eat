# 2Eat

A recipe management and meal planning application for Swedish households. Users manage recipes, plan weekly meals, track pantry inventory, and organise recipes into named collections.

## Language

**Samling** (plural: **Samlingar**):
A user-owned, named set of Recept. Acts as a curation tool — analogous to a recipe book or thematic playlist. Currently always manually curated; see *Smart Samling* for the deferred auto-generated variant.
_Avoid_: Collection, folder, list, category

**Smart Samling** (plural: **Smarta Samlingar**) — *deferred, not yet implemented*:
A read-only Samling whose membership is computed by a rule rather than set by the user. Examples: *Snabbt ikväll* (total time ≤ 30 min), *Nyligen lagat* (Recept in a Veckoplan within the last 30 days), *Från skafferiet* (Recept whose ingredients are covered by the current Skafferi). When implemented, distinguished from manual Samlingar by an `IsManaged` flag on the entity. Users cannot add or remove Recept from a Smart Samling.
_Avoid_: Smart collection, automatic collection, filter preset

**Favoriter**:
The default Samling auto-created for every User on registration. Semantically identical to a user-created Samling; distinguished only by being pre-populated at signup.
_Avoid_: Favorites, starred recipes, bookmarks

**Recept** (plural: **Recept**):
A dish with a name, ingredients, instructions, and metadata (cook time, servings, nutrition, allergens).
_Avoid_: Recipe (use Swedish term in domain conversations)

**Ingrediens** (plural: **Ingredienser**):
A named food item that belongs to a category and may carry allergen tags.
_Avoid_: Item, food, product

**Veckoplan**:
A user's week-scoped **dinner** planner mapping each day to an optional Recept (main course / middag) and optional note. One slot per day; always represents the evening meal. Non-dinner Recept (desserts, beverages, baked goods) are out of scope.
_Avoid_: Meal plan, schedule, calendar

**Skafferi**:
A user's pantry — the inventory of food items currently at home.
_Avoid_: Pantry, inventory, stock

**Handlista**:
A user's shopping list of free-text items, optionally with quantity and unit.
_Avoid_: Shopping list, grocery list

**Ingrediensfilter**:
A transient, session-scoped selection of one or more Ingredienser used to filter the Recept catalog — surfacing Recept that match those Ingredienser. Not persisted; not tied to the user's Skafferi.
_Avoid_: Ingredient search, pantry filter, recipe search

**Förslag** (plural: **Förslag**):
A lightweight recipe discovery card sourced from an external website (e.g. ICA, Köket.se, Coop). Contains a title, image, and source URL. Not owned by any user — exists in a shared pool. A Förslag is not a Recept; it becomes one only when a user explicitly adds it via the fast-add action, which triggers full extraction via the existing scan flow.
_Avoid_: External recipe, suggestion, discovered recipe, imported recipe

**Utforska** (Explore):
The dedicated page where Förslag are surfaced. Separate from the user's personal Recept library. The primary landing experience — first tab on mobile, first item in the desktop sidebar. Users browse Förslag here and can fast-add them to their library. Tapping a Förslag card opens the source URL in a new browser tab.
_Avoid_: Discovery page, feed, explore feed

## Relationships

- A **User** owns zero or more **Samlingar**
- A **Samling** contains zero or more **Recept** (many-to-many)
- A **Recept** may belong to zero or more **Samlingar**
- A **User** owns exactly one **Handlista**
- A **User** owns zero or more **Veckoplaner** (one per week)
- A **User** owns zero or more **Skafferi**-items
- A **User** has a seen-cursor into the shared **Förslag** pool (tracks which Förslag have been surfaced to them). When exhausted, the cursor resets and the cycle begins again.

## Flagged ambiguities

- **Förslag already-added state**: Should a Förslag that a user has already imported appear differently (e.g. checkmark) in Utforska? Leaning yes, but not decided. Deferred.
