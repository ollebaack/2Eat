# Use Framer Motion for UI animations

We add Framer Motion as the single animation library for the React frontend. CSS-only transitions (Tailwind + `@keyframes`) remain for hover micro-interactions already in place; Framer Motion handles everything that requires orchestration, exit animations, or staggered sequences.

## Considered options

- **CSS-only** (`@keyframes`, `transition`): zero bundle cost, consistent with existing hover effects, but cannot produce exit animations or staggered list entrances without brittle JS hacks. Page transitions are not feasible.
- **Framer Motion** *(chosen)*: declarative `AnimatePresence` for exit/enter transitions, trivial stagger via `variants`, automatic `prefers-reduced-motion` support via `<MotionConfig reducedMotion="user">`. Bundle cost ~50 KB gzipped, acceptable for a recipe management app.

## Decisions within this ADR

- **Character**: subtle/editorial — durations 150–250 ms, ease-out curves, ≤12 px displacements. No spring overshoots outside the existing ShuffleModal slot-machine.
- **Scope**: staggered card-grid entrance, skeleton→content cross-fade, dialogs/modals (`ShuffleModal`), `EmptyState` fade+slide-up, chip-selection tap pulse. Tier 3 micro-polish (nav indicator slide, star picker) deferred.
- **Page transitions deliberately omitted**: `AnimatePresence` on `<Outlet>` was implemented and then removed. Every `AnimatePresence` mode conflicts with Playwright strict-mode E2E tests — `mode="wait"` keeps the new page out of the DOM during exit (heading not found), while `mode="sync"/"popLayout"` puts both pages in the DOM simultaneously (2 headings found, strict-mode violation). Per-component animations deliver sufficient motion without breaking tests.
- **Mobile**: staggered grid entrance skipped (mobile shows a list, not a grid). All other animations apply.
- **Accessibility**: `<MotionConfig reducedMotion="user">` wraps the app root so all animations collapse to instant for users who have reduced-motion enabled at the OS level.
