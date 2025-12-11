# Ambulance Paramedic Toolkit

A lightweight PWA built with Next.js 16 and Tailwind CSS that delivers quick-reference clinical tools for ambulance crews. The app is installable on mobile devices (standalone mode) and works offline via a custom service worker.

## Features
- Dashboard of time-critical tools: resuscitation timer, paediatric arrest (WAAFELSS), stroke BEFAST, asthma severity, MWCS, vitals and more.
- Dark/light theme toggle with persisted preference.
- Install hint and standalone redirect for a PWA-like experience.
- Offline caching of the dashboard and clinical tools for field use.

## Getting started
1. Install dependencies:
   ```bash
   npm install
   ```
2. Run the development server:
   ```bash
   npm run dev
   ```
   Open http://localhost:3000 to view the app.

## Scripts
- `npm run dev` – start the development server.
- `npm run lint` – lint the codebase with ESLint.
- `npm run type-check` – run TypeScript type checking.
- `npm run test` – run unit tests.
- `npm run build` – create a production build.

## PWA notes
- Manifest is available at `/manifest.webmanifest` and the app targets `/dashboard` as the start URL.
- `public/sw.js` registers caches for key routes and assets; the service worker is registered in `app/layout.tsx` via `ServiceWorkerRegister`.
- When installed, the landing page redirects to `/dashboard` to provide an app-like home screen.
