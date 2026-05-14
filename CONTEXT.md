# 2Eat

A recipe management and meal planning application for Swedish households. Users manage recipes, plan weekly meals, track pantry inventory, and organise recipes into named collections.

## Language

**Samling** (plural: **Samlingar**):
A user-owned, named set of Recept. Acts as a curation tool — analogous to a recipe book or thematic playlist.
_Avoid_: Collection, folder, list, category

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
A user's week-scoped meal plan mapping each day to an optional Recept and optional note.
_Avoid_: Meal plan, schedule, calendar

**Skafferi**:
A user's pantry — the inventory of food items currently at home.
_Avoid_: Pantry, inventory, stock

**Handlista**:
A user's shopping list of free-text items, optionally with quantity and unit.
_Avoid_: Shopping list, grocery list

## Relationships

- A **User** owns zero or more **Samlingar**
- A **Samling** contains zero or more **Recept** (many-to-many)
- A **Recept** may belong to zero or more **Samlingar**
- A **User** owns exactly one **Handlista**
- A **User** owns zero or more **Veckoplaner** (one per week)
- A **User** owns zero or more **Skafferi**-items

## Flagged ambiguities

_(none yet)_
