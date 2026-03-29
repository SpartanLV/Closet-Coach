# ClosetCoach — Next Phase Plan (Post v0.0.2)

## Repository / Main-Branch Snapshot Reviewed

- GitHub `main` currently points to commit `89c4127` (`Revision 0.0.2`), which matches the current local code state.
- Product status: functional Expo MVP with local persistence, weather + calendar context, outfit ranking/swapping, wear logging, and basic insights.

## What Exists Today (Strengths to Keep)

1. **Core habit loop is already wired end-to-end**
   - Wardrobe CRUD + persistence with AsyncStorage.
   - Daily ranked outfit suggestions based on occasion + temperature.
   - One-tap wear logging updates recency and wear counts.
2. **Context integration foundation exists**
   - Open-Meteo integration with city geocode + weather buckets.
   - Calendar permission flow and event-title-based occasion inference.
3. **Good quality baseline**
   - Unit tests for recommendation engine, closet state reducer, and calendar heuristics.
   - TypeScript strictness + clear domain types.

---

## Gaps Identified Before Scale-Up

### Product gaps

- No onboarding funnel optimization (manual data entry is still high-friction).
- Recommendation quality is rule-based only; no feedback loop beyond passive wear logs.
- Insights are descriptive but not yet prescriptive (no clear “what to do next” actions).
- No account system or cloud sync (single-device only).
- No monetization or experimentation instrumentation.

### Technical gaps

- `App.tsx` is a single large orchestration/UI file; maintainability risk as features expand.
- Network services lack retries/timeout and explicit error typing; resilience can degrade in poor connectivity.
- Closet state + recommendation logic are ready for extraction into composable feature modules, but not yet split.
- Test suite is solid at unit-level, but there is no e2e/regression coverage of critical user flows.

---

## Recommended Next Phase

## Phase 2 Theme (8–12 weeks)

**Goal:** Convert the MVP from a “functional demo loop” to a “retention-ready product loop” with measurable behavior change.

### North-star objective

- Improve **7-day retention** and **weekly outfit-log habit rate** while reducing onboarding drop-off.

### Success criteria (exit targets)

- +25% improvement in week-1 outfit log completion.
- +20% increase in users receiving a suggestion within 2 minutes of opening app.
- <1% critical flow failure rate for weather/calendar/context fetch.
- App startup and “Today” screen interaction under acceptable mobile latency budget.

---

## Execution Plan by Workstream

## 1) Product & UX

### 1.1 Guided onboarding v2 (P0)

- Add a **stepwise setup flow**:
  1. city/context,
  2. minimum closet capture,
  3. first suggestion,
  4. first wear log.
- Introduce “quick add” wardrobe templates to reduce first-session effort.
- Add contextual empty states for missing categories (Top/Bottom/Shoes).

### 1.2 Recommendation feedback loop (P0)

- Add explicit actions: **“Loved it” / “Not for today” / “Too hot/cold”**.
- Feed this lightweight preference signal into ranking weights.
- Keep fallback rule-based ranking for cold-start and offline behavior.

### 1.3 Actionable insights (P1)

- Add “Wear this next” nudges for long-unworn items.
- Add weekly summary card (“Most worn”, “Neglected items”, “Best-performing occasion”).

## 2) Architecture & Code Health

### 2.1 Break up `App.tsx` (P0)

- Split into feature slices:
  - `features/today/*`
  - `features/wardrobe/*`
  - `features/insights/*`
  - `hooks/useContextSync.ts`
- Keep domain logic in data modules and move render-only components to feature folders.

### 2.2 Service reliability hardening (P0)

- Add `fetchWithTimeout` utility + retry policy for weather calls.
- Add explicit error result types for weather/calendar services (`ok | error` pattern).
- Add staleness-aware UI messaging when context refresh fails.

### 2.3 Observability baseline (P1)

- Define app-level telemetry events:
  - onboarding_started/completed,
  - suggestion_viewed,
  - suggestion_accepted/rejected/swapped,
  - wear_logged.
- Add lightweight analytics abstraction to avoid vendor lock-in.

## 3) Quality & Release Readiness

### 3.1 End-to-end critical path tests (P0)

- Add smoke flows:
  - first-launch onboarding,
  - add item + generate suggestion,
  - log wear + verify updated insight.

### 3.2 CI pipeline (P0)

- Ensure CI runs `npm run typecheck` + `npm test` on PRs.
- Add linting and formatting checks as gatekeepers.

### 3.3 Feature-flag strategy (P1)

- Launch new recommendation signals and onboarding v2 behind local flags.
- Support staged rollout and quick rollback for regressions.

---

## Improvement Plan While “Combing Through” Current Main

These can be done incrementally during Phase 2 without changing product direction:

1. **Refactor debt burn-down**
   - Extract pure helper logic from `App.tsx` and move to hooks/modules.
2. **Resilience upgrades**
   - Standardize recoverable error states in weather + calendar flows.
3. **Performance pass**
   - Memoize expensive selectors and reduce avoidable rerenders in Today tab.
4. **Data model evolution**
   - Add optional item attributes (`material`, `pattern`, `formality`) to improve fit scoring later.
5. **Experiment readiness**
   - Add event schema + structured logging before monetization experiments.

---

## Proposed 3-Sprint Rollout

### Sprint A (Weeks 1–2)

- App.tsx decomposition + context sync hook.
- Service timeout/retry + error state UX.
- CI baseline (typecheck/test/lint).

### Sprint B (Weeks 3–4)

- Onboarding v2 flow.
- Quick-add templates + improved empty states.
- Event telemetry abstraction.

### Sprint C (Weeks 5–6)

- Feedback-driven recommendation tuning.
- Actionable insights cards.
- E2E smoke tests and rollout flags.

---

## Risks & Mitigations

- **Risk:** onboarding friction remains high despite new flow.
  - **Mitigation:** instrument each onboarding step and run copy/sequence A/B tests.
- **Risk:** recommendation quality appears inconsistent across edge wardrobes.
  - **Mitigation:** preserve deterministic fallback; track reject reasons and tune weights weekly.
- **Risk:** refactor introduces regressions.
  - **Mitigation:** move with feature parity snapshots + smoke tests before/after each extraction.

---

## Immediate Next Actions (This Week)

1. Create architecture RFC for `App.tsx` split and context hook boundaries.
2. Implement timeout/retry network utility and integrate weather service first.
3. Add telemetry interface and wire three events (`suggestion_viewed`, `swapped`, `wear_logged`).
4. Draft onboarding v2 screens in low-fidelity and validate copy with 3–5 target users.

