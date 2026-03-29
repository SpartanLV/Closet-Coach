# ClosetCoach — Next Phase Plan (Post current main)

## Snapshot of Current State

ClosetCoach now has a stable MVP core with:

- Wardrobe CRUD + local persistence
- Weather context integration with structured error handling
- Calendar-based occasion inference (optional)
- Deterministic recommendation ranking + swap behavior
- Wear logging and basic insights
- Passing unit/integration tests with strict TypeScript checks

Recent hardening completed:

- App tests aligned with `getContextResult` service contract
- Storage persistence failure telemetry added (`storage_persist_failed`)
- Recommendation candidate generation bounded to reduce combinatorial risk
- README expanded for onboarding and contributor clarity

---

## Phase Goal (Next 8–10 weeks)

Move from “working MVP” to “retention-ready v1” by improving:

1. onboarding completion,
2. recommendation quality feedback loops,
3. maintainability of the UI architecture,
4. release confidence and observability.

---

## North-Star and Success Metrics

### Primary outcomes

- Increase week-1 wear-log completion rate by **25%**
- Increase users receiving first suggestion within 2 minutes by **20%**
- Keep critical flow failures (weather/calendar/persistence) below **1%**

### Product health indicators

- D7 retention for users with 5+ items
- suggestion acceptance / swap / reject ratio
- mean time from launch to first actionable suggestion

---

## Workstreams

## 1) Product & UX (P0/P1)

### 1.1 Guided onboarding v2 (P0)

- Introduce explicit step flow:
  1. city setup,
  2. minimum closet capture,
  3. first suggestion,
  4. first wear log.
- Add quick-add templates to reduce cold-start effort.
- Improve empty states for missing required categories.

### 1.2 Explicit recommendation feedback (P0)

- Add actions on each suggestion:
  - “Love it”,
  - “Not for today”,
  - “Too hot/cold”.
- Persist lightweight preference events and use as ranking modifiers.
- Keep deterministic fallback ranking for robustness.

### 1.3 Actionable insights (P1)

- Add “wear this next” prompts for neglected items.
- Add weekly summary cards:
  - most worn,
  - least worn,
  - occasion patterns.

---

## 2) Architecture & Code Health (P0/P1)

### 2.1 Decompose `App.tsx` (P0)

- Split into feature-focused modules:
  - `features/today/*`
  - `features/wardrobe/*`
  - `features/insights/*`
- Introduce `hooks/useContextSync.ts` for weather/calendar orchestration.
- Keep pure logic in `src/data/*`, and view logic in feature components.

### 2.2 State flow hardening (P0)

- Add explicit handling of persistence read/write failures in UI status messaging.
- Add retry strategy for hydration on transient storage failures.
- Document persistence schema versioning strategy for future migrations.

### 2.3 Recommendation scalability & quality (P1)

- Replace brute-force generation with staged candidate pruning:
  - pre-rank top-N per category,
  - context-first filtering,
  - score only shortlisted combinations.
- Add profiling benchmark fixture for 50/100/200-item wardrobes.

---

## 3) Reliability, Observability, and Release Discipline (P0/P1)

### 3.1 Telemetry baseline (P0)

Standardize event schema and required attributes for:

- onboarding_started/completed
- suggestion_viewed/swapped/accepted/rejected
- weather_refresh_failed
- calendar_sync_failed
- storage_persist_failed
- wear_logged

### 3.2 Test depth increase (P0)

- Add reducer and recommendation edge-case coverage for:
  - large wardrobes,
  - missing categories,
  - stale weather snapshots.
- Add one happy-path integration test for:
  - add item → refresh context → get suggestion → wear log.

### 3.3 CI quality gates (P0)

- Ensure CI runs:
  - `npm run typecheck`
  - `npm test -- --watch=false`
- Add lint + formatting checks as required gates.

---

## Proposed 3-Sprint Rollout

### Sprint 1 (Weeks 1–2)

- App decomposition scaffold
- `useContextSync` extraction
- onboarding v2 wireframes + copy
- telemetry event schema RFC

### Sprint 2 (Weeks 3–4)

- onboarding v2 implementation
- feedback actions on suggestions
- persistence failure UX improvements
- CI quality gates finalized

### Sprint 3 (Weeks 5–6)

- actionable insights cards
- recommendation pruning strategy + benchmark
- expanded integration/regression tests
- release candidate and staged rollout

---

## Risks and Mitigations

- **Risk:** onboarding remains too heavy.
  - **Mitigation:** quick-add templates + instrument each step funnel.

- **Risk:** recommendation changes reduce determinism.
  - **Mitigation:** deterministic sort/tie-breaker + snapshot tests.

- **Risk:** refactor introduces regressions.
  - **Mitigation:** extract in thin slices with parity tests before/after each move.

---

## Immediate Next Actions (This Week)

1. Draft and approve `App.tsx` decomposition map (module boundaries + ownership).
2. Implement onboarding v2 skeleton with progress state and minimal UX copy.
3. Define telemetry payload schema and enforce required fields in one utility.
4. Add large-wardrobe recommendation benchmark fixture and baseline numbers.
