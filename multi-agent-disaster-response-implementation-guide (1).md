# Multi-Agent Disaster Response and Emergency Evacuation System

## Full Implementation Guide

### Purpose of this document

This document is a complete technical specification for building a browser-based multi-agent simulation demonstrating coordination, communication, and distributed decision-making in a disaster response and evacuation scenario. It is written to be followed directly by an AI coding agent (e.g. Claude Code, Cursor, etc.) to scaffold and implement the project with minimal ambiguity. Each section specifies what to build, why, the exact data shapes to use, and how pieces connect.

### Tech stack

- Language: TypeScript
- Framework: Next.js (App Router) with React
- Styling: Tailwind CSS
- Rendering: HTML/CSS grid for the map (canvas optional upgrade later)
- Data persistence: Supabase (Postgres + JS client)
- Hosting: Vercel

---

## 0.5 Git workflow (mandatory, follow throughout)

Initialize git and commit continuously as you build — never wait until the end to commit everything at once.

**Setup, first thing after `create-next-app`:**

Create a GitHub/GitLab repo and push before writing any application code, so history exists from step 1.

**Commit after every meaningful unit of work — not just at the end of a session.** A meaningful unit means: one file or one tightly related group of files becomes functional and doesn't break the build. In practice this means committing after each numbered step in section 11's build order, and often more than once within a step if it's large (e.g. `types.ts` gets its own commit before `grid.ts` starts).

**Rules:**

1. Never let more than ~30–45 minutes of work, or more than one component/module, sit uncommitted.
2. Before committing, confirm the app still builds/runs (`npm run dev` or `npm run build`) — don't commit known-broken states to the main branch. If you must checkpoint broken work, commit to a scratch branch or use `git commit -m "wip: ..."` explicitly labeled as WIP.
3. Write commit messages in Conventional Commits style: `feat:`, `fix:`, `refactor:`, `chore:`, `docs:`, `style:`, `test:`. Example: `feat: implement MessageBus with send/getMessagesFor/clear`.
4. One logical change per commit — don't bundle "implement RescueAgent" with an unrelated Tailwind tweak. Split into separate commits if unrelated.
5. Never commit `.env.local` or any file containing real Supabase keys. Confirm `.gitignore` covers it before the first commit that touches env config.
6. After finishing each top-level section of this guide (grid, message bus, each agent, engine, each UI component, Supabase integration), do a final commit for that section even if you committed partial progress along the way, so history has a clear checkpoint per feature.
7. Push to the remote after every commit, or at minimum every few commits — don't let local history diverge from the remote for long stretches.

**Why this matters for this project specifically:** the report needs to demonstrate incremental, well-engineered work, not a single dump commit — a clean commit history is easy evidence of process if a lecturer asks to see it, and frequent commits mean a broken agent/engine change can be reverted in isolation instead of losing the whole session's work.

## 0. Project setup (exact commands)

Run these in order before writing any code:

```
npx create-next-app@latest disaster-response-sim --typescript --tailwind --app --src-dir=false --import-alias "@/*"
cd disaster-response-sim
npm install @supabase/supabase-js
```

When prompted by `create-next-app`, accept defaults (App Router: yes, ESLint: yes, Tailwind: yes).

Create `.env.local` in the project root (never commit this file — it should already be in `.gitignore` by default):

```
NEXT_PUBLIC_SUPABASE_URL=your-project-url-here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

Also create a checked-in `.env.local.example` with the same two keys but empty/placeholder values, so teammates know what env vars they need to set locally:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

**Important Next.js App Router rule**: any file that uses React state, effects, or event handlers (`useState`, `useEffect`, `onClick`, the `useSimulation` hook, `Controls.tsx`, `Grid.tsx`, `RunHistory.tsx`, the main page if it holds state) must have `"use client";` as the very first line of the file. Server components (the default in App Router) cannot use these. This is a common build-breaking mistake — the agent should add `"use client";` to every interactive component listed above.

---

## 1. Project structure

Set up the project as a standard Next.js + TypeScript app. Recommended folder layout:

```
/app
  /page.tsx                → main simulation page
  /layout.tsx
/components
  /Grid.tsx                → renders the map
  /Cell.tsx                → renders a single grid cell
  /AgentMarker.tsx          → renders an agent on top of a cell
  /Controls.tsx             → start / pause / reset / speed buttons
  /StatsPanel.tsx            → live stats display
  /RunHistory.tsx            → past runs pulled from Supabase
/lib
  /types.ts                 → shared TypeScript types/interfaces
  /grid.ts                  → grid generation and helper functions
  /messageBus.ts             → the communication system
  /agents
    /BaseAgent.ts            → shared agent logic
    /ScoutAgent.ts
    /RescueAgent.ts
    /CoordinatorAgent.ts
    /EvacueeAgent.ts
  /simulationEngine.ts        → the main tick loop
  /pathfinding.ts             → BFS pathfinding helper
  /supabaseClient.ts           → Supabase connection setup
  /stats.ts                   → stats tracking helpers
/hooks
  /useSimulation.ts            → React hook wrapping the engine for the UI
```

---

## 2. Core data types

Create `/lib/types.ts` with the following shared types. Every other file should import from here rather than redefining shapes.

```ts
export type CellStatus = "empty" | "blocked" | "danger" | "safe" | "hasVictim";

export interface Cell {
  x: number;
  y: number;
  status: CellStatus;
  occupiedBy?: string; // agent id, if any agent is currently on this cell
}

export type Grid = Cell[][];

export type AgentRole = "scout" | "rescuer" | "coordinator" | "evacuee";

export interface AgentState {
  id: string;
  role: AgentRole;
  x: number;
  y: number;
  status: "idle" | "moving" | "busy" | "rescued" | "done";
  targetX?: number;
  targetY?: number;
  claimedVictimId?: string; // for rescue agents, which victim they're heading to
}

export type MessageType =
  | "victim_found"
  | "path_blocked"
  | "claim_victim"
  | "victim_rescued"
  | "task_assignment";

export interface AgentMessage {
  id: string;
  from: string; // agent id
  type: MessageType;
  payload: {
    x?: number;
    y?: number;
    victimId?: string;
    assignedAgentId?: string;
  };
  timestamp: number;
}

export interface SimulationStats {
  tick: number;
  victimsTotal: number;
  victimsRescued: number;
  messagesSent: number;
  startedAt: number;
  endedAt?: number;
}

export interface SimulationRunRecord {
  id?: string;
  created_at?: string;
  grid_size: number;
  victims_total: number;
  victims_rescued: number;
  ticks_taken: number;
  messages_sent: number;
  duration_ms: number;
}
```

---

## 3. The grid (`/lib/grid.ts`)

Responsibilities:

- Generate a grid of a given size (e.g. 15x15).
- Randomly place blocked cells (obstacles), danger zones, and victims (evacuees) on it, based on configurable percentages.
- Provide helper functions: `getNeighbors(grid, x, y)`, `isWalkable(cell)`, `getCell(grid, x, y)`, `markRescued(grid, x, y)`.

Example function signatures the agent should implement:

```ts
export function generateGrid(
  size: number,
  options: {
    blockedPercent: number;
    dangerPercent: number;
    victimCount: number;
  },
): Grid;

export function getNeighbors(grid: Grid, x: number, y: number): Cell[];

export function isWalkable(cell: Cell): boolean;
```

Keep obstacle/danger/victim placement random but seeded (use a simple seedable random function) so runs can be reproduced for the report if needed.

---

## 4. Pathfinding (`/lib/pathfinding.ts`)

Implement a simple breadth-first search (BFS) that returns the next step (or full path) from an agent's current position to a target position, treating `blocked` cells as impassable.

```ts
export function findPath(
  grid: Grid,
  start: { x: number; y: number },
  target: { x: number; y: number },
): { x: number; y: number }[];
```

Each agent, on its turn, calls this to get its next move rather than moving randomly once a target is known. Scouts without a target can move using a simple unexplored-cell-seeking heuristic or random walk.

---

## 5. The message bus (`/lib/messageBus.ts`)

This is the shared communication layer every agent reads from and writes to. Implement it as a simple in-memory class, not a networked service — this all runs client-side.

```ts
export class MessageBus {
  private messages: AgentMessage[] = [];

  send(message: Omit<AgentMessage, "id" | "timestamp">): void;
  getMessagesFor(role: AgentRole, sinceTick?: number): AgentMessage[];
  getAll(): AgentMessage[];
  clear(): void;
  count(): number;
}
```

Design note for the agent: keep this dead simple. `send()` pushes to the array with a generated id and timestamp. Agents read from `getAll()` or a filtered subset each tick to decide what to react to. This satisfies the "communication" requirement of the project directly — the report should reference this class by name as the communication protocol.

---

## 6. Agents (`/lib/agents/`)

### 6.1 BaseAgent.ts

A shared base class or interface all agent types extend:

```ts
export abstract class BaseAgent {
  id: string;
  role: AgentRole;
  x: number;
  y: number;
  status: AgentState["status"];

  abstract perceive(grid: Grid, bus: MessageBus): void;
  abstract decide(): void;
  abstract act(grid: Grid, bus: MessageBus): void;
}
```

Every concrete agent implements `perceive → decide → act` each simulation tick. This three-step cycle is the core "agent loop" and should be described explicitly in the report as demonstrating autonomous, distributed behavior (no external controller calls into an agent's internals).

### 6.2 ScoutAgent.ts

- `perceive`: looks at neighboring cells via `getNeighbors`.
- `decide`: if a victim cell is adjacent/visible, decide to report it; otherwise pick a direction to continue exploring (random walk or frontier-based exploration).
- `act`: moves one step; if a victim was found, calls `bus.send({ type: "victim_found", ... })`.

### 6.3 RescueAgent.ts

- `perceive`: reads messages of type `victim_found` from the bus that don't yet have a claim.
- `decide`: if idle and an unclaimed victim message exists, claim it by sending a `claim_victim` message (this is how conflict avoidance happens without a central controller — first claim wins, other rescuers see the claim and skip that victim).
- `act`: moves toward the claimed victim's coordinates using `findPath`; once adjacent, marks the victim rescued, updates the grid, and sends a `victim_rescued` message.

**Claim tie-breaker (important, prevents race-condition bugs)**: within a single tick, it's possible for two idle Rescue agents to both perceive the same unclaimed `victim_found` message before either has acted, and both attempt to claim it. To resolve this deterministically:

1. Process agents in a fixed, stable order each tick (e.g. the order they appear in the `agents` array — do not shuffle it).
2. When a Rescue agent decides to claim a victim, it writes the claim to the message bus immediately, before the engine moves to the next agent in the loop (claims are synchronous within a tick, not batched at the end).
3. Every Rescue agent's `decide()` must check the _latest_ state of the bus, including claims made earlier in the same tick by agents processed before it, never a cached snapshot taken at the start of the tick.

This way, whichever Rescue agent is processed first in the loop order wins any same-tick conflict, and agents processed later in that same tick will already see the claim and skip that victim. State this rule explicitly in the report as the conflict-resolution mechanism.

**Stuck-agent fallback**: if `findPath` returns an empty array (target unreachable, e.g. victim is fully walled off by blocked cells), the Rescue agent must not crash or freeze. It should release its claim (send a message marking the victim as `unreachable`), return to `idle`, and become eligible to claim a different victim next tick.

### 6.4 CoordinatorAgent.ts

Two acceptable designs — pick one and document the choice in the report:

- **Lightweight/pure-distributed version**: Coordinator only listens and logs, does not assign tasks (claiming happens directly between Rescue agents via message bus). This is the simplest and still satisfies "distributed decision-making" since no agent is centrally controlled.
- **Assisted version**: Coordinator listens for `victim_found` messages and, if multiple rescuers are idle, sends a `task_assignment` message suggesting which rescuer should take which victim. Rescuers may still override this if circumstances change. This version more visibly demonstrates "coordination" for the report.

Recommended: implement the assisted version since it gives clearer material to point to for the coordination requirement, while agents can still act independently if the coordinator's suggestion is stale.

### 6.5 EvacueeAgent.ts

Simplest agent. Stays in place with status `idle` until a Rescue agent reaches it, then flips to `rescued`. Optionally, add basic self-preservation logic (move away from adjacent danger cells) as a stretch feature.

---

## 7. Simulation engine (`/lib/simulationEngine.ts`)

This drives the whole simulation forward.

```ts
export class SimulationEngine {
  grid: Grid;
  agents: BaseAgent[];
  bus: MessageBus;
  stats: SimulationStats;
  tickCount: number;

  maxTicks: number; // hard cutoff, e.g. gridSize * 20, prevents infinite loops

  constructor(config: SimulationConfig);
  tick(): void; // runs one perceive→decide→act cycle for every agent
  isComplete(): boolean; // true when all victims rescued, all remaining victims are unreachable, or maxTicks hit
  reset(): void;
}

export interface SimulationConfig {
  gridSize: number;
  scoutCount: number;
  rescueCount: number;
  victimCount: number;
  blockedPercent: number;
  dangerPercent: number;
  maxTicks?: number; // defaults to gridSize * 20 if not provided
}
```

`tick()` should loop through all agents calling `perceive`, then `decide`, then `act`, in that order for each agent (perceive-decide-act per agent, agent by agent, is simplest to implement correctly; a stricter simultaneous-perceive-then-simultaneous-act model is a valid stretch improvement but not required).

**Deadlock and timeout handling (required, not optional)**: without a cutoff, a simulation where one or more victims are unreachable (walled off by blocked cells) will run forever, since it will never reach 100% rescued. Handle this explicitly:

- Track `maxTicks` (a sensible default is `gridSize * 20`). If `tickCount` exceeds `maxTicks`, the engine must stop and mark the run as ended regardless of rescue completion.
- `isComplete()` returns true if either: all victims have status `rescued`, OR every remaining un-rescued victim has been marked `unreachable` by a Rescue agent's stuck-agent fallback (see section 6.3), OR `tickCount >= maxTicks`.
- When the run ends this way, the stats/summary shown to the user must distinguish between "all victims rescued" and "simulation ended with N victims unreachable/timed out" — do not silently report it as a full success.

---

## 8. React integration (`/hooks/useSimulation.ts`)

Wrap `SimulationEngine` in a React hook so the UI can drive it:

```ts
export function useSimulation(config: SimulationConfig) {
  // holds engine instance in a ref
  // exposes: grid, agents, stats, isRunning, start(), pause(), reset(), stepOnce()
  // internally uses setInterval (tied to a speed control) to call engine.tick() repeatedly while running
}
```

The interval should be cleared on pause/unmount. Expose the current grid/agents/stats as state so components re-render each tick.

---

## 9. UI components

### Grid.tsx

Renders a `<div>` grid using CSS grid (`display: grid; grid-template-columns: repeat(size, 1fr)`), one `Cell` per grid position, with `AgentMarker`s absolutely positioned or rendered inside the relevant cell based on agent x/y.

### Cell.tsx

Colors by status: `empty` = light gray, `blocked` = dark gray, `danger` = red/orange, `safe` = green, `hasVictim` = yellow, using Tailwind classes.

Add a CSS transition on the agent marker's position so movement glides between cells instead of jumping instantly. Since the marker's position is driven by inline style (`left`/`top` percentages) or a CSS grid position tied to x/y, apply `transition: all 200ms ease-in-out` (or a Tailwind `transition-all duration-200` class) to `AgentMarker.tsx`. This is a cheap but important detail for how polished the live demo looks.

### AgentMarker.tsx

Small colored/icon marker per role (e.g. blue circle = scout, purple = rescuer, gold = coordinator, gray = evacuee). Use distinct Tailwind color classes per role for instant visual read during the demo. Apply the transition described above.

### ConfigPanel.tsx (new, required)

Shown before the simulation starts (or collapsible during setup). Lets the user set, via number inputs or sliders, before clicking Start:

- Grid size (e.g. 10–25)
- Number of Scout agents
- Number of Rescue agents
- Number of victims
- Blocked-cell percentage
- Danger-cell percentage

These values populate the `SimulationConfig` object passed into `useSimulation`. Without this panel everything is hardcoded, which makes it impossible to demonstrate the system under different conditions during the presentation (a likely thing a lecturer will ask to see). Disable config inputs while a simulation is running; re-enable after Reset.

### Controls.tsx

Buttons: Start, Pause, Reset, Step Once, and a speed slider (interval ms). Wire directly to the `useSimulation` hook's functions. When the run ends via timeout/unreachable victims rather than full rescue, Controls or StatsPanel should visibly flag that (see section 7's deadlock handling), not just show a generic "complete" state.

### StatsPanel.tsx

Live-updating display of: tick count, victims rescued / total, messages sent, elapsed time, and the run's end reason once finished (`all rescued` vs `timed out` vs `N unreachable`).

### RunHistory.tsx

Fetches past runs from Supabase and displays them in a small table for comparison (see section 10). Must handle three explicit UI states:

- **Loading**: show a simple "Loading past runs…" placeholder while the fetch is in flight.
- **Error**: if `fetchRuns` fails (network issue, bad env vars, RLS misconfigured), show a visible inline message like "Couldn't load run history" rather than failing silently or leaving a blank table forever.
- **Empty**: if the fetch succeeds but returns zero rows (first ever run), show "No runs yet — completed simulations will appear here."

Apply the same three states (loading/error/success) to the `saveRun` call after a simulation completes — e.g. a small toast or inline text near StatsPanel confirming "Run saved" or "Couldn't save run" so failures aren't silent.

---

## 10. Supabase integration

### 10.1 Setup

Install the client:

```
npm install @supabase/supabase-js
```

Create `/lib/supabaseClient.ts`:

```ts
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

Add the two environment variables to `.env.local` (values come from the Supabase project dashboard, Settings → API). Never commit `.env.local`.

### 10.2 Database schema

In the Supabase SQL editor, create the results table:

```sql
create table simulation_runs (
  id uuid primary key default gen_random_uuid(),
  created_at timestamp with time zone default now(),
  grid_size integer not null,
  victims_total integer not null,
  victims_rescued integer not null,
  ticks_taken integer not null,
  messages_sent integer not null,
  duration_ms integer not null
);
```

For a course project, Row Level Security can stay simple: enable RLS and add a policy allowing anonymous insert and select, since there's no real user auth needed here.

```sql
alter table simulation_runs enable row level security;

create policy "Allow anonymous insert" on simulation_runs
  for insert to anon
  with check (true);

create policy "Allow anonymous select" on simulation_runs
  for select to anon
  using (true);
```

### 10.3 Saving a run

When `SimulationEngine.isComplete()` becomes true, call a save function:

```ts
export async function saveRun(stats: SimulationStats, gridSize: number) {
  const { error } = await supabase.from("simulation_runs").insert({
    grid_size: gridSize,
    victims_total: stats.victimsTotal,
    victims_rescued: stats.victimsRescued,
    ticks_taken: stats.tick,
    messages_sent: stats.messagesSent,
    duration_ms: (stats.endedAt ?? Date.now()) - stats.startedAt,
  });
  if (error) console.error("Failed to save run:", error);
}
```

Call this once from the hook when completion is first detected (guard against calling it multiple times per run with a flag).

### 10.4 Reading run history

```ts
export async function fetchRuns(limit = 20) {
  const { data, error } = await supabase
    .from("simulation_runs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) {
    console.error("Failed to fetch runs:", error);
    return [];
  }
  return data as SimulationRunRecord[];
}
```

Call this in `RunHistory.tsx` on mount (and optionally refresh it after each new run is saved) to populate the comparison table.

---

## 11. Build order (recommended sequence for the AI agent to follow)

1. Run the setup commands in section 0, confirm the blank app runs locally with `npm run dev`.
2. Implement `types.ts`, `grid.ts`, and render a static grid with `Grid.tsx` and `Cell.tsx` (remember `"use client"` on any interactive file) — confirm it displays correctly before adding any agents.
3. Implement `MessageBus`.
4. Implement `BaseAgent` and `EvacueeAgent` (simplest, no movement logic needed).
5. Implement `pathfinding.ts` including the empty-path fallback behavior.
6. Implement `ScoutAgent` with basic random-walk movement; confirm it moves and can "see" victims.
7. Implement `RescueAgent` using `findPath`, including the claim tie-breaker logic and stuck-agent fallback from section 6.3.
8. Implement `CoordinatorAgent` (assisted version).
9. Implement `SimulationEngine.tick()` wiring all agents together, including `maxTicks` and the deadlock/timeout handling from section 7; test with `stepOnce()` calls logged to console before wiring the UI loop. Manually test an edge case (fully walled-off victim) to confirm the simulation ends cleanly instead of hanging.
10. Implement `useSimulation` hook and `Controls.tsx` to drive the engine from the browser.
11. Implement `ConfigPanel.tsx` so grid size, agent counts, and victim count are adjustable before Start.
12. Implement `AgentMarker.tsx` with the position transition, so agents render and glide visually on the grid; confirm the full loop works end to end visually.
13. Implement `StatsPanel.tsx`, including the run end-reason display.
14. Set up the Supabase project, run the SQL from section 10.2, add environment variables (both locally and, later, on Vercel), implement `saveRun` and `fetchRuns`, wire up `RunHistory.tsx` with its loading/error/empty states.
15. Polish: colors, speed control, reset behavior, general spacing/layout pass.
16. Deploy to Vercel, add the two environment variables there too, confirm the live link works end to end including Supabase read/write.

---

## 12. What to emphasize in the report

When writing up the project, explicitly map the implementation back to the three required concepts:

- **Coordination**: point to the Coordinator agent's task assignment logic and the claim-based conflict avoidance between Rescue agents.
- **Communication**: point to the `MessageBus` class and the defined `AgentMessage` types as the communication protocol.
- **Distributed decision-making**: point to the `perceive → decide → act` cycle running independently inside each agent, with no central function directly controlling agent movement — each agent only reacts to messages and its own local view of the grid.

Also worth mentioning as design maturity, not just "it works": the claim tie-breaker rule (section 6.3) as your concurrency/conflict-resolution mechanism, and the deadlock/timeout handling (section 7) as evidence you considered failure cases, not just the happy path. These are the kinds of details that separate a project that merely runs from one that is well-engineered, and are good answers to have ready if a lecturer asks "what edge cases did you handle?"

---

## 13. Explicitly out of scope (say so if asked)

To avoid ambiguity for the coding agent and the group: this implementation does not include automated tests (unit/integration tests), user authentication, or responsive/mobile layout support. The grid and controls are designed for a desktop browser demo only. If your course requires any of these, they should be scoped as additional stretch tasks, not assumed to be covered by this guide.
