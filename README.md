# Multi-Agent Disaster Response — Autonomous Evacuation Simulation

A compact, visual simulation that demonstrates distributed, multi-agent coordination for disaster evacuation scenarios. It pairs a deterministic simulation engine (scouts, rescuers, coordinator, evacuees) with a message-bus communication model and a presentation-focused UI that highlights key events during a run.

This repository was built for education and demonstrations: it makes coordination, communication, and distributed decision-making visible via an "Event Spotlight" system and a tuned Demo Mode so lecturers can reliably show claim-conflicts, unreachable victims, and successful rescues in a short live walkthrough.

## Key features

- Deterministic demo scenarios (seeded RNG) for repeatable, high-impact runs.
- Event Spotlight system that converts message-bus events (victim found, claim conflict, task assignment, unreachable, rescue) into toast-style UI callouts and cell highlights.
- Simple, modular simulation engine with BFS-based pathfinding and agent behaviours (Scout, Rescue, Coordinator, Evacuee).
- Client UI built with Next.js App Router + React + Tailwind CSS for a compact telemetry-style console and map overlay.

## Repository structure (important files)

- `app/` — Next.js app routes and top-level UI pages (landing, simulation dashboard). See [app/page.tsx](app/page.tsx).
- `components/` — React UI components: `Grid.tsx`, `Cell.tsx`, `AgentMarker.tsx`, `Controls.tsx`, `EventSpotlight.tsx`, `BriefingScreen.tsx`.
- `hooks/` — `useSimulation.ts` manages the engine, UI bindings, spotlight events, and run lifecycle.
- `lib/` — Core simulation code: `simulationEngine.ts`, `messageBus.ts`, `pathfinding.ts`, `grid.ts`, `random.ts`, `spotlightEngine.ts`, `demoScenarios.ts`, `stats.ts`, `types.ts`.

## Quick start (development)

1. Install dependencies

```bash
npm install
```

2. Start dev server

```bash
npm run dev
# Open http://localhost:3000
```

## Production build & start

```bash
npm run build
npm run start
# By default the server listens on PORT=3000. To override in PowerShell:
$env:PORT=3001; npm run start
```

## Running the demo

- Open the app in a browser and use the **Mission Briefing** card to either configure manually or press **Run Demo Scenario**.
- Demo Mode uses `lib/demoScenarios.ts` (seeded) to produce repeatable runs. If you want to tune the scenario, adjust `DEMO_SEED` and `blockedPercent` there and re-run `npm run build`.

## Spotlight & Presentation notes

- The `EventSpotlight` UI displays short, one-line cards for events detected by `lib/spotlightEngine.ts`.
- Cells referenced by events are briefly highlighted on the grid overlay so instructors can point at coordination moments without pausing the simulation.

## Troubleshooting

- Port already in use: if `npm run start` fails with `EADDRINUSE` for port 3000, either kill the process using that port or start the server on another port (example above).
- Supabase errors: the UI hides raw Supabase errors; check server console logs for details. See `lib/stats.ts` for the save-run flow.

## Development tips

- Deterministic behaviour: seeded RNG is implemented in `lib/random.ts`. Pass `seed` in `SimulationConfig` to make runs repeatable for testing and presentation.
- Tuning demo events: run the demo multiple times and pick a `DEMO_SEED` (in `lib/demoScenarios.ts`) that reliably produces both a claim conflict and at least one unreachable victim early in the run.

## Contributing

- The project is intentionally compact and instructional. Feel free to open issues or submit PRs that improve reproducibility, polish UI, or add new agent behaviours.

## License

- This repository is provided as-is for educational/demonstration purposes. Add your preferred license file if you plan to publish or distribute.

## Contact

- For questions about the implementation or to request help preparing a demo, open an issue or contact the maintainer listed in project metadata.
