# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Docs

Before writing or changing any code, always check `/docs` first for a relevant doc and follow it.

## Commands

- `npm run dev` — start dev server (http://localhost:3000)
- `npm run build` — production build
- `npm run start` — run production build
- `npm run lint` — ESLint

## Code Generation Guidelines

**IMPORTANT**: When generating any code, ALWAYS first refer to the relevant documentation files within the `/docs` directory to understand existing conventions.

- /docs/ui.md
- /docs/data-fetching.md
- /docs/auth.md
- /docs/data-mutation.md
- /docs/server-components.md
- /docs/routing.md

## Architecture

This is a fresh `create-next-app` scaffold (Next.js 16, App Router, TypeScript, Tailwind v4) with no custom code yet beyond `src/app/layout.tsx` and `src/app/page.tsx`. There is no established architecture to document — update this section once real features land.
