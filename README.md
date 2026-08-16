# Beacon Campus

Beacon Campus is an intelligent campus wayfinding and orientation prototype in the Beacon Wayfinding product
family. It demonstrates situational, question-behind-the-question guidance for a fictional university — Beacon
University — using realistic mock campus data. Beacon Campus is a separate, independently deployed product from
Beacon Airport; it shares design language and architecture patterns but no code, git history, or infrastructure.

## Technology Stack

- React 19
- TypeScript
- Vite 6
- Tailwind CSS
- Vitest and Testing Library
- Framer Motion and Lucide React icons
- pnpm

There is no backend, database, or live university integration yet. All campus data lives in typed fixtures under
`src/data/`, and the local-only Admin Preview console persists edits to `localStorage` for demo purposes.

## Getting Started

```bash
pnpm install
pnpm run dev
```

Vite prints the local preview URL, normally `http://localhost:5173`.

## Commands

| Command | Purpose |
| --- | --- |
| `pnpm run dev` | Start the Vite development server. |
| `pnpm run build` | Type-check the project and create a production build in `dist/`. |
| `pnpm run test` | Run the Vitest test suite once. |
| `pnpm run lint` | Run ESLint across the project. |
| `pnpm run format` | Format project files with Prettier. |

## Project Structure

```text
src/
├── types/campus.ts         Core data model (buildings, entrances, rooms, parking, events, alerts, ...)
├── data/beaconUniversity.ts Fictional Beacon University dataset: 15 buildings, parking, services,
│                            events, alerts, Jordan's demo class schedule, tour stops, orientation content
├── lib/campusEngine.ts     Search, walk-time/leave-by calculation, entrance recommendation + alert-aware
│                           substitution, Dijkstra-based walking-graph routing, guidance-step generation
├── hooks/                  useCampusData (admin overrides), useLocationPermission
├── components/             Screens: Home, Search, Destination, Navigation, Arrival, Schedule, Building
│                           Detail, Parking, Services, Alerts, Events, Orientation Mode, Campus Tour,
│                           Accessibility, Beacon Assistant, and the local Admin Preview console
└── BeaconCampusApp.tsx     Root app shell — single-state-enum screen switching, session persistence
```

## Current Features

- Fictional Beacon University: 15 buildings, 5 parking lots, a walking graph, services, events, alerts,
  construction notices, and a demo first-year student schedule (persona "Jordan").
- Persona-aware onboarding (Student, New Student, Prospective Student, Parent/Family, Visitor, Faculty/Staff).
- Intelligent, alias-aware search with grouped results across buildings, rooms, departments, services,
  events, parking, and amenities.
- Destination intelligence cards: recommended entrance, walk time, floor/room, hours, accessibility, and
  nearby parking — not just coordinates.
- Alert-aware routing: an active entrance closure automatically substitutes the accessible alternate
  entrance and adjusts walking time, both in the destination card and in turn-by-turn guidance.
- Conversational, landmark-based turn-by-turn guidance and building-specific arrival guidance (entrance,
  floor, stairs/elevator).
- Class schedule with calm, non-alarming "leave by" messaging.
- Parking, Services, Alerts, Events, Orientation Mode, self-guided Campus Tour, and an Accessibility panel
  with a "prefer step-free routes" preference.
- A local-only Admin Preview console (no auth, no backend) for toggling alerts, parking closures, building
  hours, construction notices, and events — changes apply live in the same browser session via `localStorage`.
- Mobile-first responsive layout, keyboard/focus support, and empty/error states throughout.

## Known Incomplete Features

- No live university system integrations (SIS, class schedules, parking systems, GIS, indoor maps).
- No live geolocation-driven turn-by-turn — the walking graph and campus map are simulated.
- No live AI concierge — "Ask Beacon" is a scaffold of canned quick questions and answers.
- No backend, database, or authentication — the Admin Preview console is a local-only demonstration.
- Only one campus configuration (Beacon University) is authored, though the data model supports more.

## Data and Persistence

Application data is supplied by TypeScript fixtures in `src/data/beaconUniversity.ts`. Persona choice,
accessibility preference, and admin-console edits are stored in `localStorage`; the active screen and
in-session navigation state are stored in `sessionStorage`. There is no server-side persistence.

## Brand and Data Disclaimer

Beacon University, its buildings, departments, events, and alerts are entirely fictional and created for
product demonstration purposes. Do not use this prototype for real-world navigation or safety-critical
decisions.
