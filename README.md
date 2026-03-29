# ClosetCoach

ClosetCoach is a cross-platform **Expo + React Native + TypeScript** app that helps users plan outfits from what they already own.

The current version focuses on the **core daily loop**:

1. Capture and maintain a wardrobe.
2. Pull context (weather + optional calendar).
3. Rank outfit candidates.
4. Log what was worn.
5. Surface wear insights.

---

## Table of contents

- [Why ClosetCoach](#why-closetcoach)
- [Current capabilities](#current-capabilities)
- [Tech stack](#tech-stack)
- [Project structure](#project-structure)
- [Getting started](#getting-started)
- [Available scripts](#available-scripts)
- [Testing strategy](#testing-strategy)
- [Core architecture notes](#core-architecture-notes)
- [Data model snapshot](#data-model-snapshot)
- [Environment and platform notes](#environment-and-platform-notes)
- [Troubleshooting](#troubleshooting)
- [Roadmap documents](#roadmap-documents)

---

## Why ClosetCoach

ClosetCoach aims to reduce decision fatigue and wardrobe waste by making outfit planning fast and data-informed:

- **Weather-aware suggestions** to match real conditions.
- **Occasion-aware filtering** via manual override and optional calendar inference.
- **Wear tracking** to encourage better wardrobe rotation.
- **Local-first persistence** so the app works as an MVP without backend complexity.

---

## Current capabilities

### Today tab

- Onboarding progress indicators.
- City input + weather refresh.
- Calendar permission/sync controls.
- Occasion override chips.
- Top ranked outfit suggestions (up to 3).
- Per-category swap actions (Top/Bottom/Shoes/Outerwear).
- One-tap wear logging.

### Wardrobe tab

- Add/edit/delete wardrobe items.
- Tags for category, season, and occasions.
- Persistent local storage of wardrobe metadata.

### Insights tab

- Dormant item count.
- Never-worn count.
- Top worn item summary.
- Recent wear log list.

---

## Tech stack

- **Framework**: Expo (React Native)
- **Language**: TypeScript (strict mode)
- **State**: React hooks + reducer (`useClosetState`)
- **Persistence**: `@react-native-async-storage/async-storage`
- **Calendar**: `expo-calendar`
- **Weather provider**: Open-Meteo APIs
- **Testing**: Jest + `jest-expo`

---

## Project structure

```text
.
├── App.tsx                          # Main app shell and tab orchestration
├── src
│   ├── components                   # Shared presentational UI blocks
│   ├── data                         # State, services, recommendation logic, fixtures
│   ├── features                     # Feature-level UI modules (scaffold and reusable)
│   ├── theme                        # Design tokens (colors, spacing)
│   ├── types                        # Domain and service contracts
│   └── utils                        # Generic helpers (date/network)
├── App.test.tsx                     # Integration-style app behavior tests
└── NEXT_PHASE_PLAN.md               # Forward-looking implementation plan
```

---

## Getting started

### Prerequisites

- Node.js 18+
- npm 9+
- iOS Simulator and/or Android Emulator for local device testing

### Install

```bash
npm install
```

### Run

```bash
npm run start
```

From the Expo CLI prompt:

- press `i` for iOS
- press `a` for Android
- press `w` for web

---

## Available scripts

```bash
npm run start      # Start Expo dev server
npm run ios        # Start and target iOS
npm run android    # Start and target Android
npm run web        # Start and target web
npm run typecheck  # TypeScript checks only
npm run test       # Jest unit/integration tests
```

---

## Testing strategy

The repository includes coverage for the most critical MVP logic:

- `App.test.tsx`
  - Context input behavior.
  - Explicit weather refresh behavior.
  - Error/fallback messaging for weather/calendar failures.
- `src/data/recommendationEngine.test.ts`
  - Deterministic ranking, compatibility filtering, swap behavior, and edge conditions.
- `src/data/closetState.test.ts`
  - Reducer hydration and deterministic recency updates.
  - Wear logging side effects.
- `src/data/weatherService.test.ts`
  - Service result mapping for invalid input/not found/success.
- `src/data/calendarService.test.ts`
  - Occasion inference keyword mapping.
- `src/utils/network.test.ts`
  - Timeout/retry and upstream handling.

Run all checks:

```bash
npm run typecheck
npm run test -- --watch=false
```

---

## Core architecture notes

### 1) App orchestration (`App.tsx`)

`App.tsx` currently coordinates tabs, context refresh, suggestion rendering, and CRUD controls. This is intentional for MVP speed, with a planned split into feature slices in future phases.

### 2) State and persistence (`src/data/closetState.ts`)

- Uses a reducer (`closetReducer`) to centralize all state transitions.
- Hydrates from AsyncStorage on app start.
- Persists wardrobe, wear logs, and settings.
- Emits telemetry on storage persistence failure (`storage_persist_failed`).

### 3) Context services

- **Weather** (`src/data/weatherService.ts`)
  - City geocoding + forecast fetch.
  - Structured `ok | error` results (`WeatherContextResult`).
  - Retry + timeout behavior via `src/utils/network.ts`.
- **Calendar** (`src/data/calendarService.ts`)
  - Permission checks/requests.
  - Next-event inference mapped into normalized `Occasion` values.

### 4) Recommendation engine (`src/data/recommendationEngine.ts`)

- Filters by occasion + temperature compatibility.
- Builds outfit candidates from required categories.
- Scores with context fit, rotation, recency, and completeness.
- Supports swap-per-category flows.
- Includes a generation bound to avoid candidate explosion in large wardrobes.

---

## Data model snapshot

Primary domain types are defined in `src/types/index.ts`:

- `WardrobeItem`
- `WearLog`
- `AppSettings`
- `WeatherContext` / `WeatherContextResult`
- `OutfitCandidate` / `RecommendationInput`
- `Occasion`, `Season`, `TemperatureBucket`, `WardrobeCategory`

---

## Environment and platform notes

- Calendar integration is unavailable on web and gracefully degrades.
- Weather context can fail without breaking the suggestion loop (fallback behavior).
- App data is local-only in the current MVP; no account/cloud sync in this phase.

---

## Troubleshooting

### Tests timeout or fail unexpectedly

- Ensure mocks align with current service contracts (for weather, use `getContextResult`).
- Run tests serially (already configured via `--runInBand`).

### Expo app runs but calendar actions do nothing

- Check device/simulator permissions.
- Web platform returns `unavailable` by design for calendar integration.

### Weather updates fail repeatedly

- Confirm network access from emulator/device.
- Verify city string has a valid geocoding match.

---

## Roadmap documents

- `NEXT_PHASE_PLAN.md` — near-term execution priorities.
- `ClosetCoach_Full_Plan.md` — longer-form business/product strategy.

---

## License

No explicit license file is currently present in this repository.
Add one before external distribution.
