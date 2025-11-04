# Invest101 Web (Next.js)

A modernized front-end for Invest101 built with Next.js App Router, TypeScript, and Tailwind CSS. This project is optional and lives alongside the existing Node/Express + Mongo stack so you can adopt it iteratively.

## Features

- App Router layout with responsive shell and theme toggle
- Tailwind CSS + custom design tokens for polished UI
- Component library primitives (`Card`, `Badge`, etc.) ready for dashboards and learning content
- Example homepage showcasing stats, spotlight workflows, and live signals
- `next-themes` integration for dark/light modes

## Getting Started

```powershell
cd apps/web
npm install
npm run dev
```

Visit http://localhost:3000 to view the modernized UI.

## Commands

- `npm run dev` – start development server
- `npm run build` – create production build
- `npm start` – run production server locally
- `npm run lint` – lint with ESLint
- `npm run format` – format with Prettier

## Tailwind Cheat Sheet

Tailwind is a utility-first CSS framework. Instead of writing custom class names, you compose utilities like `bg-slate-950`, `text-sm`, or `rounded-2xl` directly in your JSX. The Tailwind CLI (configured via `postcss.config.cjs` and `tailwind.config.cjs`) scans your components and generates just the CSS you use, keeping bundles small while guaranteeing design consistency.

If you prefer a different styling approach later (CSS Modules, Chakra UI, etc.), you can replace Tailwind, but it accelerates polishing the UI during the redesign phase.
