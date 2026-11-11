# Dharma Quest

Dharma Quest is an interactive web application for learning Hindu philosophy and exploring Vedic and Western astrology. It pairs guided, multi-stage lessons with quizzes, matching exercises, rewards, personalized chart calculations, and a calm, accessible interface.

## Highlights

- **Interactive learning:** structured lessons with progress tracking, quiz validation, matching activities, completion rewards, and activity streaks.
- **Personalized astrology:** browser-side Vedic and Western chart calculations powered by Swiss Ephemeris WebAssembly.
- **Location search:** Open-Meteo geocoding integration for birthplace lookup.
- **Privacy-minded persistence:** lesson progress, preferences, and streaks are stored locally in the browser, with an in-memory fallback when storage is unavailable.
- **Modern UI:** React, TypeScript, Tailwind CSS, and reusable component primitives.

## Tech stack

React 19, TypeScript, Tailwind CSS, Vite/Vinext, WebAssembly, Swiss Ephemeris, Open-Meteo Geocoding API, and localStorage.

## Run locally

```bash
npm install
npm run dev
```

Then open the local URL shown by Vite. Node.js 22.13 or newer is recommended.

## Notes

Astrology content is intended for reflection and learning. Birth-chart calculations run in the browser; no account or server-side personal profile is required for the core experience.
