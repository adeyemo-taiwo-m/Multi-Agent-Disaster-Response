# Style Guide — Multi-Agent Disaster Response Simulation

Give this file to the coding agent alongside the implementation guide. It defines the visual language for the whole app: colors, type, spacing, component states, and motion. Every Tailwind class the agent writes for `Grid.tsx`, `Cell.tsx`, `AgentMarker.tsx`, `Controls.tsx`, `ConfigPanel.tsx`, `StatsPanel.tsx`, and `RunHistory.tsx` should trace back to a token defined here — no ad-hoc hex codes or off-palette grays.

---

## 1. Design concept

This is a **command-center / mission-control** aesthetic, not a playful simulation toy. Think NASA ops room or a disaster-response dashboard at 2am: dark surface, one cyan signal color for "system active," and hazard colors reserved strictly for hazards. The UI should feel calm and legible even when 40 agents are moving at once — clarity under load is the whole design brief, since that's also the thing the simulation itself is about.

**Signature element:** the grid itself is the hero, not a card wrapping it. Chrome (panels, controls, stats) reads as a thin instrument console framing the grid, styled like radar/telemetry UI — monospace numerals, thin dividers, small-caps labels — never competing with it in weight or color.

---

## 2. Color tokens

Define these once, either as CSS variables in `globals.css` or a `lib/theme.ts` constants file that components import from. Do not hardcode hex values inside components.

| Token | Hex | Role |
|---|---|---|
| `--bg-primary` | `#0B1220` | App background, outer page |
| `--bg-secondary` | `#16243A` | Panels, cards, control bar, table rows |
| `--accent` | `#22D3EE` | Active/running state, focus rings, links, scout agent, "system online" indicators |
| `--emergency` | `#F97316` | Coordinator agent, task-assignment messages, warnings that aren't failures |
| `--danger` | `#EF4444` | Danger cells, blocked-path errors, failed Supabase calls, "unreachable victim" |
| `--success` | `#22C55E` | Safe cells, rescued victims, successful saves, "all rescued" end state |
| `--victim` | `#FACC15` | Victim cells (`hasVictim`), victim-related message highlights |
| `--text-primary` | `#F8FAFC` | Primary text on dark surfaces |

### Derived/utility shades (agent should compute these, not invent new hues)
- `--text-secondary`: `--text-primary` at 65% opacity — for labels, captions, secondary stats.
- `--text-muted`: `--text-primary` at 40% opacity — for disabled inputs, placeholder text, timestamps.
- `--border-subtle`: `--accent` at 12% opacity — hairline dividers between panels, table row borders.
- `--surface-hover`: `--bg-secondary` lightened ~6% (or `--accent` at 6% opacity over `--bg-secondary`) — hover state for buttons/rows.
- `blocked` cell color: `--bg-secondary` (obstacles read as "absence," not a new gray).
- `empty` cell color: `--bg-primary` at ~40% lighter, or `--bg-secondary` at 50% opacity — must sit visually between `--bg-primary` (page) and `--bg-secondary` (chrome) so the grid reads as its own layer.

### Rule: color = meaning, never decoration
Every non-neutral color on screen must map to exactly one of: agent role, cell status, message/event type, or system state (idle/running/success/error). If the agent wants to add a new UI accent for something purely decorative, it should reuse `--accent` at reduced opacity rather than introduce a new hue.

---

## 3. Color → entity mapping (exact assignments)

**Cell status (`Cell.tsx`)**
| Status | Color |
|---|---|
| `empty` | derived empty-cell shade (see §2) |
| `blocked` | `--bg-secondary` |
| `danger` | `--danger`, ~70% opacity fill, `--danger` full-opacity 1px border |
| `safe` | `--success`, ~25% opacity fill (safe zones should read as "calm," not loud) |
| `hasVictim` | `--victim`, full opacity, small pulse animation (see §6) |

**Agent role (`AgentMarker.tsx`)**
| Role | Color | Shape |
|---|---|---|
| Scout | `--accent` (cyan) | small circle, hollow ring — "still searching" |
| Rescuer | `--emergency` (orange)... *reassign, see note* | filled triangle pointing toward its target |
| Coordinator | `--victim` (yellow)... *reassign, see note* | filled diamond, stays mostly stationary |
| Evacuee | `--text-primary` at reduced opacity | small square, upgrades to `--success` filled square when `rescued` |

> **Note on Rescuer/Coordinator colors:** the given palette only has one clear "role-neutral" accent (`--accent` cyan), and cyan is already best used for the *system-active* signal generally. Reserve `--emergency` (orange) for the Rescuer since rescuers are the agents actually racing toward danger — orange reads as "responding." Reserve `--victim` yellow for the Coordinator marker only if it's visually distinguished from victim cells by shape (diamond vs. square) and size (coordinator marker larger); if that risks confusion during the demo, fall back to a desaturated cyan (`--accent` at 55% opacity) for the Coordinator instead and state the substitution in the report.

**Messages / events (`StatsPanel.tsx` live feed, if built)**
| Message type | Color |
|---|---|
| `victim_found` | `--victim` |
| `claim_victim` | `--accent` |
| `victim_rescued` | `--success` |
| `path_blocked` | `--danger` |
| `task_assignment` | `--emergency` |

**System/run state**
| State | Color |
|---|---|
| Idle / not started | `--text-muted` |
| Running | `--accent`, with the small pulse used sparingly (e.g. a single dot in the header, not a screen-wide glow) |
| Completed — all rescued | `--success` |
| Completed — timed out / N unreachable | `--danger` for the count, neutral text around it (don't let a partial-failure state look identical to a hard error) |
| Save/fetch error (Supabase) | `--danger`, inline text, never a blocking modal |

---

## 4. Typography

- **Display / headers** (`h1`–`h3`, panel titles, stat numbers): a monospace or geometric-mono face — `"JetBrains Mono", "IBM Plex Mono", ui-monospace` — set in `--text-primary`, uppercase with letter-spacing (`tracking-wide`) for panel labels only, not for body copy. This is what sells the "telemetry console" feel.
- **Body / UI text** (buttons, form labels, table cells): a clean grotesk — `"Inter", "IBM Plex Sans", system-ui` — regular weight, sentence case.
- **Numeric stats** (tick count, victims rescued, elapsed time): always the monospace face, tabular figures if available (`font-variant-numeric: tabular-nums`) so numbers don't jitter in width as they update every tick.
- Scale: use a restrained scale — `text-xs` (labels/captions) / `text-sm` (body, buttons) / `text-base` (panel content) / `text-2xl` or `text-3xl` (hero stat numbers only, e.g. tick counter). Avoid intermediate sizes; the console aesthetic depends on discipline here.

---

## 5. Layout & spacing

- Base spacing unit: 4px (Tailwind default scale, don't override). Panels use consistent `p-4` or `p-6`; don't mix arbitrary padding values across `Controls.tsx`, `StatsPanel.tsx`, and `ConfigPanel.tsx`.
- Page structure: grid is the dominant visual block, roughly 60–70% of viewport width on desktop; side column (Controls + StatsPanel + ConfigPanel stacked) takes the remainder. `RunHistory.tsx` sits below the fold or in a collapsible drawer — it's reference material, not part of the live-demo focus.
- Panel chrome: `--bg-secondary` background, 1px `--border-subtle` border, no drop shadows (shadows read as "generic SaaS card," not "console instrument"). Use the border + slight background-brightness difference from `--bg-primary` to separate panels instead.
- Border radius: keep small and consistent — `rounded-md` (6–8px) everywhere. Not fully square (too harsh against a "grid" already made of squares), not pill-shaped (too soft for the mission-control tone).
- Grid cells: no gap or a 1px gap at most (`gap-px`) so the grid reads as a continuous instrument surface, with cell color doing the separation, not whitespace.

---

## 6. Motion

- Agent movement: `transition: all 200ms ease-in-out` on position (already specified in the implementation guide) — keep this as the only "continuous" motion in the UI.
- `hasVictim` cells: a slow pulse (opacity 100% ↔ 70%, ~1.6s ease-in-out infinite) using `--victim` — signals "needs attention" without being frantic. Do not pulse anything else; one pulsing element per screen max, or the eye can't tell what's urgent.
- Stat number updates: no animated count-up effects — just update the number directly. Animated counters look decorative here and this is an ops console, not a marketing site.
- Buttons/rows: simple `background-color` transition (~120ms) on hover to `--surface-hover`. No scale/transform hover effects — keep interactions flat and instant, consistent with the console tone.
- Respect `prefers-reduced-motion`: disable the victim pulse and slow agent-move transition to an instant snap if the user has reduced motion enabled.

---

## 7. Component-specific notes

- **Controls.tsx buttons**: primary action (Start) uses `--accent` background with `--bg-primary` text (high contrast, the one "loud" button on screen); Pause/Reset/Step use outlined style (`--border-subtle` border, `--text-primary` text, transparent background) so Start stays visually dominant.
- **ConfigPanel.tsx**: inputs use `--bg-primary` fill (recessed, "sunken" look against the `--bg-secondary` panel) with `--border-subtle` border, `--accent` border/ring on focus. Disabled state (while sim is running) drops to `--text-muted` text with reduced opacity, not a gray overlay that fights the palette.
- **StatsPanel.tsx**: treat like a small dashboard — label in `--text-secondary` small-caps mono, value in large `--text-primary` mono. The end-reason line (all rescued / timed out / N unreachable) gets its own row with the state color from §3, not folded into the generic stat grid.
- **RunHistory.tsx**: table rows use `--border-subtle` dividers, no zebra-striping (would compete with cell-status colors elsewhere on screen). Loading/error/empty states all render in `--text-secondary` centered text — no spinners in a saturated color, keep it quiet since it's secondary content.

---

## 8. Accessibility floor

- Text contrast: `--text-primary` (#F8FAFC) on `--bg-primary` (#0B1220) and `--bg-secondary` (#16243A) both pass WCAG AA comfortably — safe to use freely for body text.
- Never convey cell/agent/message meaning by color alone: pair every color-coded status with a shape (marker shape per role), icon, or text label (StatsPanel, tooltips) so the sim is still legible to colorblind viewers during the demo.
- Keyboard focus: visible `--accent` focus ring (`ring-2 ring-[--accent] ring-offset-2 ring-offset-[--bg-primary]`) on all interactive elements — buttons, inputs, table rows if clickable.
