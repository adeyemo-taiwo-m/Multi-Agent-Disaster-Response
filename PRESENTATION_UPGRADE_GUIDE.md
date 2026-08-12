# Presentation Upgrade — Event Spotlight, Demo Mode & Polish
## Addendum to the Multi-Agent Disaster Response Implementation Guide

### Purpose of this document
This is a follow-up spec to the original implementation guide. The base simulation already works. This addendum adds the features that make it presentable to lecturers: a system that visibly narrates coordination/communication/distributed-decision-making events as they happen, a guaranteed-good demo scenario, a briefing screen, and a short list of polish fixes. Follow it in order — each section builds on the last.

Give this file to your coding agent alongside the original guide. It assumes `types.ts`, `messageBus.ts`, `simulationEngine.ts`, `Grid.tsx`, `Cell.tsx`, `Controls.tsx`, and `StatsPanel.tsx` already exist as specified there.

---

## 1. Why this matters (context for the agent, include in comments if useful)

A lecturer watching the simulation run for 60–90 seconds without narration only sees agents moving around a grid. The things actually being graded — coordination, communication, distributed decision-making — are invisible unless the UI calls them out at the moment they happen. This addendum turns backend events that already exist in the `MessageBus` into visible, briefly-highlighted moments on screen, and makes sure a live demo reliably produces those moments instead of leaving it to chance.

---

## 2. Event Spotlight System

### 2.1 New types

Add to `/lib/types.ts`:

```ts
export type SpotlightSeverity = "info" | "success" | "warning";

export interface SpotlightEvent {
  id: string;
  tick: number;
  title: string;        // short, e.g. "Claim conflict resolved"
  detail: string;        // one sentence, e.g. "Rescuer-1 claimed victim before Rescuer-2 — first-claim-wins via message bus."
  severity: SpotlightSeverity;
  x?: number;             // cell to highlight, if applicable
  y?: number;
  agentIds?: string[];    // agent(s) involved, for marker highlighting
  durationMs: number;     // how long it stays visible, e.g. 3500
}
```

### 2.2 Detection logic (`/lib/spotlightEngine.ts`, new file)

This module watches the `MessageBus` output each tick and turns specific message patterns into `SpotlightEvent`s. Keep it a pure function — it reads bus messages and current tick, returns new spotlight events, and never mutates simulation state directly.

```ts
import { AgentMessage, SpotlightEvent } from "./types";

let lastProcessedIndex = 0; // module-level cursor; reset on simulation reset

export function resetSpotlightCursor(): void {
  lastProcessedIndex = 0;
}

export function detectSpotlightEvents(
  allMessages: AgentMessage[],
  tick: number
): SpotlightEvent[] {
  const newMessages = allMessages.slice(lastProcessedIndex);
  lastProcessedIndex = allMessages.length;
  const events: SpotlightEvent[] = [];

  // Same-tick claim conflict: two claim_victim messages for the same victimId
  // within a short window of each other in the message log.
  const claims = newMessages.filter((m) => m.type === "claim_victim");
  const claimsByVictim = new Map<string, AgentMessage[]>();
  for (const c of claims) {
    if (!c.payload.victimId) continue;
    const arr = claimsByVictim.get(c.payload.victimId) ?? [];
    arr.push(c);
    claimsByVictim.set(c.payload.victimId, arr);
  }
  for (const [victimId, claimList] of claimsByVictim) {
    if (claimList.length > 1) {
      const winner = claimList[0];
      events.push({
        id: `conflict-${victimId}-${tick}`,
        tick,
        title: "Claim conflict resolved",
        detail: `${winner.from} claimed victim ${victimId} first — later claims from ${claimList.slice(1).map(c => c.from).join(", ")} were rejected via the message bus.`,
        severity: "info",
        x: winner.payload.x,
        y: winner.payload.y,
        agentIds: claimList.map((c) => c.from),
        durationMs: 4000,
      });
    }
  }

  // Victim rescued
  for (const m of newMessages.filter((m) => m.type === "victim_rescued")) {
    events.push({
      id: `rescued-${m.id}`,
      tick,
      title: "Victim rescued",
      detail: `${m.from} reached and rescued the evacuee at (${m.payload.x}, ${m.payload.y}).`,
      severity: "success",
      x: m.payload.x,
      y: m.payload.y,
      agentIds: [m.from],
      durationMs: 3000,
    });
  }

  // Task assignment from coordinator
  for (const m of newMessages.filter((m) => m.type === "task_assignment")) {
    events.push({
      id: `assign-${m.id}`,
      tick,
      title: "Coordinator assigned task",
      detail: `Coordinator suggested ${m.payload.assignedAgentId} take the victim at (${m.payload.x}, ${m.payload.y}).`,
      severity: "info",
      x: m.payload.x,
      y: m.payload.y,
      agentIds: m.payload.assignedAgentId ? [m.payload.assignedAgentId] : [],
      durationMs: 3000,
    });
  }

  // Unreachable victim (path_blocked used as the "release claim" signal per section 6.3
  // of the base guide — adjust the type check here if you implemented a distinct
  // "unreachable" message type instead)
  for (const m of newMessages.filter((m) => m.type === "path_blocked")) {
    events.push({
      id: `unreachable-${m.id}`,
      tick,
      title: "Victim unreachable",
      detail: `${m.from} could not find a path and released its claim — victim at (${m.payload.x}, ${m.payload.y}) is walled off.`,
      severity: "warning",
      x: m.payload.x,
      y: m.payload.y,
      agentIds: [m.from],
      durationMs: 4000,
    });
  }

  return events;
}
```

**Note for the agent:** if your `RescueAgent` stuck-agent fallback (base guide §6.3) sends a custom message type rather than reusing `path_blocked`, add that type to `MessageType` in `types.ts` and update the filter above accordingly. Keep the detection logic in this one file so spotlight rules can be tuned without touching the engine or UI.

### 2.3 Wiring into the simulation loop

In `useSimulation.ts`, after each `engine.tick()` call:

```ts
import { detectSpotlightEvents, resetSpotlightCursor } from "@/lib/spotlightEngine";

// inside the hook, alongside existing state:
const [spotlightEvents, setSpotlightEvents] = useState<SpotlightEvent[]>([]);

// after engine.tick() in the interval callback:
const newEvents = detectSpotlightEvents(engine.bus.getAll(), engine.tickCount);
if (newEvents.length > 0) {
  setSpotlightEvents((prev) => [...prev, ...newEvents]);
}

// also add a mission-complete event once, guarded by a ref flag, when engine.isComplete()
// first becomes true — reuse the existing "guard against calling saveRun twice" pattern
// from the base guide's section 10.3 for this same-completion-detection problem.
```

Call `resetSpotlightCursor()` inside `reset()`.

### 2.4 UI component (`/components/EventSpotlight.tsx`, new file, `"use client"`)

Renders active spotlight events as small toast-style cards stacked in a corner (e.g. top-right of the grid, overlaying it — `position: absolute`, not `fixed`, positioned relative to the grid container). Each card:
- Icon or colored dot matching `severity` (info = accent cyan, success = green, warning = orange — reuse the tokens from your style guide).
- `title` in bold, `detail` in smaller muted text below.
- Auto-dismiss after `durationMs`, with a fade-out transition (200–300ms).
- Stack multiple events vertically if more than one is active; cap visible stack at 3, queue the rest.

Also, when an event has `x`/`y`, apply a temporary highlight class to that grid cell (a pulsing outline ring in the event's severity color) for the same `durationMs` — pass the active spotlighted cell coordinates down from the hook into `Grid.tsx`/`Cell.tsx` as a prop, e.g. `highlightedCell: {x, y, severity} | null`.

**Important: keep captions short.** One sentence, no more than ~18 words, so they're readable at a glance during a live demo rather than requiring the lecturer to stop and read a paragraph.

---

## 3. Demo Mode (guaranteed-good preset scenario)

### 3.1 Rationale
Live random configuration risks a boring run with no claim conflicts and no unreachable victims — your two best "we handled distributed-systems edge cases" talking points. Demo Mode removes that risk.

### 3.2 Seeded scenario config (`/lib/demoScenarios.ts`, new file)

```ts
import { SimulationConfig } from "./types";

export const DEMO_SEED = 42; // pass this into your existing seeded random from grid.ts

export const DEMO_SCENARIO: SimulationConfig = {
  gridSize: 15,
  scoutCount: 2,
  rescueCount: 3, // more rescuers than early-visible victims increases odds of a same-tick claim race
  victimCount: 8,
  blockedPercent: 14, // slightly higher than default to guarantee at least one walled-off victim
  dangerPercent: 8,
  maxTicks: 300,
};
```

Tune `DEMO_SEED` and `blockedPercent` by actually running it a handful of times locally and picking a seed that reliably produces both a claim conflict and at least one unreachable victim within the first ~150 ticks — don't assume the numbers above are guaranteed to work with your particular random-generation implementation; verify empirically and adjust.

### 3.3 UI hook-up

In `Controls.tsx`, add a "Run demo scenario" button next to Start (visually secondary — outlined, not competing with the primary Start button). On click: call `reset()`, then call `useSimulation`'s config setter with `DEMO_SCENARIO` and the fixed seed, then `start()`. Disable `ConfigPanel` inputs while demo mode is active, same as while a normal simulation is running.

---

## 4. Briefing screen (`/components/BriefingScreen.tsx`, new file, `"use client"`)

Shown before the grid on first load (and after Reset, optionally — a toggle is fine). Replaces dropping the viewer straight into a config form.

Content:
- Short mission framing, e.g. "Mission: Coordinate scout, rescue, and coordinator agents to locate and evacuate 8 victims from a disaster zone."
- Two buttons: **Configure manually** (reveals `ConfigPanel` + Start, current behavior) and **Run demo scenario** (jumps straight into Demo Mode from §3).
- Keep this screen on-brand with the rest of the UI (same panel chrome, same color tokens) — it should look like a mission-briefing card, not a generic landing page.

---

## 5. Polish fixes (do these regardless of time constraints)

1. **Hide raw backend errors from the UI.** The Supabase "Could not find the table 'public.simulation_runs' in the schema cache" message must never render as visible on-screen text. Route it through the existing loading/error/success state pattern already specified in the base guide's `RunHistory.tsx` and `saveRun` sections — log the real error to `console.error`, show only a short user-facing string like "Couldn't save run." If you're seeing this specific error, it means the SQL from the base guide's section 10.2 hasn't been run in your Supabase project yet — run it before presenting.
2. **Consistent iconography.** Confirm agent markers, cell-status indicators, and panel icons all come from one icon family/style — don't mix icon sets or emoji.
3. **No dev-only banners visible during demo.** Anything like "Next.js is outdated" or framework version badges should not be visible in the browser window you present from — these are typically dev-toolbar elements; confirm they don't appear in a production build (`npm run build && npm run start`) and present from that build, not `npm run dev`, if possible.
4. **Rehearse the exact click sequence** you'll use live (Briefing → Run demo scenario → let it play → point at spotlight events as they appear → StatsPanel end-reason) so the demo has a rhythm instead of improvised clicking.

---

## 6. Build order for this addendum

1. Add `SpotlightEvent` type to `types.ts`.
2. Implement `spotlightEngine.ts`, test detection logic against `console.log` output before touching the UI.
3. Wire spotlight detection into `useSimulation.ts`.
4. Build `EventSpotlight.tsx`, confirm toasts appear and auto-dismiss correctly during a normal run.
5. Add cell/agent highlight-on-event styling to `Grid.tsx` / `Cell.tsx` / `AgentMarker.tsx`.
6. Build `demoScenarios.ts`, run it locally multiple times, tune the seed/percentages until it reliably produces a claim conflict and an unreachable victim.
7. Add the "Run demo scenario" button to `Controls.tsx`.
8. Build `BriefingScreen.tsx` and wire it as the initial view.
9. Fix the Supabase error-visibility issue (§5.1) — confirm the SQL setup from the base guide has actually been run.
10. Do a full dry run from a production build (`npm run build && npm run start`), timing it, and adjust `DEMO_SCENARIO` durations/spotlight `durationMs` values so the whole thing fits comfortably in your presentation window.

---

## Prompt for your AI coding agent

Copy everything below into your coding agent (Claude Code, Cursor, etc.) as a single message, after it has already implemented the base `Multi-Agent Disaster Response and Emergency Evacuation System` implementation guide.

```
You have already implemented the Multi-Agent Disaster Response and Emergency
Evacuation System per the base implementation guide. I'm now giving you a
follow-up addendum document (PRESENTATION_UPGRADE_GUIDE.md) that adds four
things on top of the working simulation:

1. An Event Spotlight system that watches the MessageBus and surfaces
   short on-screen callouts (with matching cell/agent highlights) whenever
   a claim conflict, victim rescue, task assignment, or unreachable-victim
   event occurs — so the coordination/communication/distributed-decision-
   making behaviors are visible in real time during a live demo, not just
   describable afterward.
2. A Demo Mode with a seeded, tuned scenario config that reliably produces
   at least one same-tick claim conflict and one unreachable victim within
   the first ~150 ticks, so a live presentation doesn't depend on random
   luck.
3. A briefing screen shown before the grid, offering "Configure manually"
   or "Run demo scenario" instead of dropping straight into a config form.
4. A short list of polish fixes: no raw backend error strings ever visible
   in the UI, consistent iconography, no dev-toolbar/framework badges
   visible during a presentation, and presenting from a production build
   rather than the dev server.

Follow the build order in section 6 of the addendum exactly, in sequence.
Use git commit-per-step discipline as already established for this project
(Conventional Commits style, one logical change per commit, confirm the
build still runs before each commit).

Before writing any spotlight-detection code, check my existing
messageBus.ts and simulationEngine.ts implementations and adapt the code
samples in section 2 to match my actual message type names and payload
shapes exactly — the samples in the addendum assume the base guide's
types.ts verbatim, and if I changed anything (e.g. a different message
type for "victim unreachable" instead of reusing path_blocked), update
the detection logic accordingly rather than introducing a mismatched type.

After implementing section 3 (Demo Mode), actually run the simulation
multiple times with the seeded config and report back to me whether it
reliably produces a claim conflict and an unreachable victim within 150
ticks. If it doesn't, adjust blockedPercent, rescueCount, or the seed
value and re-test before moving on — don't leave this unverified.

Ask me before starting if anything in the addendum conflicts with a
decision I already made differently in the base implementation (for
example, if I implemented the Coordinator as the lightweight/pure-
distributed version rather than the assisted version — some spotlight
events assume the assisted version's task_assignment messages exist).
```
