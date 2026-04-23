# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Warning: Non-standard Next.js version

This project uses **Next.js 16.2.4** with **React 19** — APIs, conventions, and file structure may differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

## Commands

```bash
npm run dev      # Start development server at http://localhost:3000
npm run build    # Production build (also runs type generation)
npm run start    # Start production server (requires build first)
npm run lint     # Run ESLint
```

No test framework is configured yet.

## Architecture

This is a Next.js App Router project. All source code lives under `src/`.

- `src/app/` — App Router: each folder is a route segment. `layout.tsx` wraps all pages; `page.tsx` is the route UI.
- `@/*` import alias maps to `src/*` (configured in `tsconfig.json`).

**Tailwind CSS v4** is used — there is no `tailwind.config.js`. Configuration is CSS-based via `src/app/globals.css` using the `@tailwindcss/postcss` plugin. The v4 API differs significantly from v3.

Fonts are loaded via `next/font/google` (Geist Sans and Geist Mono) in `src/app/layout.tsx` and injected as CSS variables (`--font-geist-sans`, `--font-geist-mono`).
