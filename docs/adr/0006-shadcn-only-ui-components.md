# All interactive UI elements use Shadcn/Radix components

Early pages used raw HTML elements (`<button>`, `<input>`, `<select>`, `<label>`, `<textarea>`) combined with inline CSSProperties objects (`inputStyle`, `labelStyle`, `iconButtonStyle`, `glassBtn`, etc.). This led to visual inconsistencies across pages, bespoke hover hacks (`onMouseEnter`/`onMouseLeave`), missing accessibility attributes (no focus-visible ring, no keyboard support), and styling that drifted from the design token system. Shadcn/Radix components, already adopted in most modals and forms, provide consistent styling through CSS token variables, built-in Radix accessibility, and CVA variant management. The migration standardises on Shadcn components for all interactive elements.

## Considered options

- **Raw HTML + inline CSSProperties** *(rejected — was the original approach)*: Zero dependencies, but each author invents their own hover/focus/disabled styling, leading to drift and duplication.
- **Shadcn/Radix components** *(chosen)*: Wraps Radix primitives (accessibility baked in) with CVA variants and `cn()` for conditional classes. New components added via `npx shadcn@latest add <name>` inside `src/2Eat.WebApp`. Inline `style` permitted only for values with no Tailwind equivalent (CSS variables, `backdropFilter`, `safe-area-inset`).
- **A separate headless UI library (e.g. Headless UI)**: Rejected — Radix is already a dependency via Shadcn; adding another library is redundant.
