# UI Coding Standards

## Components: shadcn/ui only

This project uses **only shadcn/ui components** for UI. There are **no custom components**.

- Never hand-roll a component (button, input, dialog, card, table, etc.) that shadcn already provides.
- Need a component that isn't installed yet? Add it via the CLI, don't write it by hand:
  ```
  npx shadcn@latest add <component>
  ```
- Installed components live in `src/components/ui/` (see `components.json` for aliases). Import from `@/components/ui/*`.
- Composition is fine (assembling a page/feature out of multiple shadcn components), but do not create new base components or reimplement what shadcn already ships.
- If a design need can't be met by any shadcn component or its documented props/variants, raise it before writing custom markup — don't quietly build a one-off.

## Dates: date-fns only

All date formatting goes through [`date-fns`](https://date-fns.org/) — no manual `Date` string-building, `Intl.DateTimeFormat` one-offs, or other date libraries.

```
npm install date-fns
```

Standard display format is an ordinal day + short month + full year:

```
1st Sep 2025
2nd Aug 2025
3rd Jan 2026
4th Jun 2024
```

Produce this with:

```ts
import { format } from "date-fns";

format(date, "do MMM yyyy");
```

Don't build ordinal suffixes ("st"/"nd"/"rd"/"th") by hand — the `do` token already handles it.
