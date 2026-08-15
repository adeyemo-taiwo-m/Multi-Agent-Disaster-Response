"use client";

import React from "react";
import { Play, Zap, Compass, X } from "lucide-react";

interface BriefingScreenProps {
  onConfigure: () => void;
  onRunDemo: () => void;
  mode?: "initial" | "overlay";
  onResume?: () => void;
}

// Shape icons matching AgentMarker.tsx exactly, sized for a fixed icon slot (not inline text)
const ScoutIcon = () => (
  <div className="w-4 h-4 rounded-full border-2 border-[rgb(var(--accent))] bg-[rgb(var(--bg-primary))] flex items-center justify-center shrink-0">
    <div className="w-1 h-1 rounded-full bg-[rgb(var(--accent))]" />
  </div>
);

const RescuerIcon = () => (
  <div className="w-4 h-4 flex items-center justify-center shrink-0">
    <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 text-[rgb(var(--emergency))] fill-current">
      <polygon points="12,3 22,21 2,21" />
    </svg>
  </div>
);

const CoordinatorIcon = () => (
  <div className="w-4 h-4 flex items-center justify-center shrink-0">
    <div className="w-3 h-3 bg-[rgb(var(--accent)/0.55)] border border-[rgb(var(--accent))] rotate-45 rounded-[1px] flex items-center justify-center">
      <div className="w-1 h-1 bg-[rgb(var(--bg-primary))] rounded-full -rotate-45" />
    </div>
  </div>
);

const DemoIcon = () => (
  <div className="w-4 h-4 flex items-center justify-center shrink-0">
    <Zap className="w-3.5 h-3.5 text-[rgb(var(--text-primary)/0.60)]" />
  </div>
);

export const BriefingScreen: React.FC<BriefingScreenProps> = ({
  onConfigure,
  onRunDemo,
  mode = "initial",
  onResume,
}) => {
  const isOverlay = mode === "overlay";

  const objectives = [
    { icon: <ScoutIcon />, text: "Scouts detect victims and broadcast findings via the message bus." },
    { icon: <RescuerIcon />, text: "Rescue agents claim tasks and navigate blocked paths." },
    { icon: <CoordinatorIcon />, text: "Coordinator assigns priority tasks to idle rescuers." },
    { icon: <DemoIcon />, text: "Demo mode guarantees high-impact events for live presentation." },
  ];

  return (
    <section className="relative bg-[rgb(var(--bg-secondary))] border border-[rgb(var(--accent)/0.15)] rounded-md p-6 sm:p-8 max-w-4xl mx-auto">
      {isOverlay && onResume && (
        <button
          type="button"
          onClick={onResume}
          className="absolute top-4 right-4 text-[rgb(var(--text-primary)/0.50)] hover:text-[rgb(var(--text-primary))] transition-colors duration-150 focus-console rounded-md p-1 cursor-pointer"
          aria-label="Close briefing and resume simulation"
        >
          <X className="w-4 h-4" />
        </button>
      )}

      {/* Header section */}
      <div className="border-b border-[rgb(var(--accent)/0.15)] pb-6 mb-6">
        <div className="inline-flex items-center gap-2 rounded-md bg-[rgb(var(--bg-primary))] border border-[rgb(var(--accent)/0.15)] px-3 py-1.5 text-xs uppercase tracking-[0.25em] text-[rgb(var(--accent))] font-mono font-semibold">
          <Compass className="w-3.5 h-3.5" />
          {isOverlay ? "MISSION BRIEFING — SIMULATION PAUSED" : "MISSION BRIEFING"}
        </div>

        <h1 className="mt-5 text-2xl md:text-3xl font-mono font-bold tracking-tight text-[rgb(var(--text-primary))]">
          Coordinate autonomous agents to evacuate civilians from disaster zones.
        </h1>

        <p className="mt-3 max-w-2xl text-xs md:text-sm leading-relaxed text-[rgb(var(--text-primary)/0.75)]">
          {isOverlay
            ? "Your simulation is paused exactly where you left it. Review the briefing below, then resume when ready."
            : "Observe real-time agent coordination, conflict resolution, and rescue workflows. Use Demo Mode for a curated scenario built for live demonstrations."}
        </p>
      </div>

      {/* Reading the Map — cell status swatches, matching Cell.tsx exactly */}
      <div className="rounded-md border border-[rgb(var(--accent)/0.12)] bg-[rgb(var(--bg-primary))] p-4 mb-4">
        <p className="text-xs uppercase tracking-wider text-[rgb(var(--accent))] font-mono font-semibold mb-3">
          Reading the map
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs font-mono text-[rgb(var(--text-primary)/0.80)]">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-[2px] bg-[rgb(var(--bg-secondary)/0.50)] border border-[rgb(var(--accent)/0.08)] shrink-0" />
            <span>Empty</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-[2px] bg-[rgb(var(--bg-secondary))] border border-transparent shrink-0" />
            <span>Blocked</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-[2px] bg-[rgb(var(--success)/0.25)] border border-[rgb(var(--success)/0.30)] shrink-0" />
            <span>Safe zone</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-[2px] bg-[rgb(var(--danger)/0.70)] border border-[rgb(var(--danger))] shrink-0" />
            <span>Hazard</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-[2px] bg-[rgb(var(--victim))] border border-[rgb(var(--victim))] shrink-0" />
            <span>Victim</span>
          </div>
        </div>
      </div>

      {/* Objectives & Flow Columns */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-md border border-[rgb(var(--accent)/0.12)] bg-[rgb(var(--bg-primary))] p-4">
          <p className="text-xs uppercase tracking-wider text-[rgb(var(--accent))] font-mono font-semibold mb-3">
            Key objectives
          </p>
          <ul className="space-y-2.5 text-xs text-[rgb(var(--text-primary)/0.80)] leading-relaxed font-sans">
            {objectives.map((obj, i) => (
              <li key={i} className="flex items-center gap-2.5">
                {obj.icon}
                <span>{obj.text}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-md border border-[rgb(var(--accent)/0.12)] bg-[rgb(var(--bg-primary))] p-4">
          <p className="text-xs uppercase tracking-wider text-[rgb(var(--accent))] font-mono font-semibold mb-3">
            Presentation flow
          </p>
          <ol className="space-y-2 text-xs text-[rgb(var(--text-primary)/0.80)] leading-relaxed list-decimal list-inside font-sans">
            <li>Use &quot;Run Demo Scenario&quot; to start a tuned, seeded mission.</li>
            <li>Point out the on-screen Event Spotlight cards.</li>
            <li>Highlight rescue completion and unreachable victim warnings.</li>
            <li>Wrap up with the end-reason and mission stats panel.</li>
          </ol>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pt-2">
        {isOverlay ? (
          <button
            type="button"
            onClick={onResume}
            className="inline-flex items-center justify-center gap-2 rounded-md bg-[rgb(var(--accent))] px-5 py-2.5 text-xs font-mono font-bold text-[rgb(var(--bg-primary))] transition-colors duration-150 hover:bg-[rgb(var(--accent)/0.90)] focus-console cursor-pointer ml-auto"
          >
            <Play className="w-4 h-4 fill-current" />
            RESUME SIMULATION
          </button>
        ) : (
          <>
            <button
              type="button"
              onClick={onRunDemo}
              className="inline-flex items-center justify-center gap-2 rounded-md bg-[rgb(var(--accent))] px-5 py-2.5 text-xs font-mono font-bold text-[rgb(var(--bg-primary))] transition-colors duration-150 hover:bg-[rgb(var(--accent)/0.90)] focus-console cursor-pointer"
            >
              <Zap className="w-4 h-4" />
              RUN DEMO SCENARIO
            </button>

            <button
              type="button"
              onClick={onConfigure}
              className="inline-flex items-center justify-center gap-2 rounded-md border border-[rgb(var(--accent)/0.25)] bg-transparent px-5 py-2.5 text-xs font-mono text-[rgb(var(--text-primary))] hover:bg-[rgb(var(--accent)/0.06)] transition-colors duration-150 focus-console cursor-pointer"
            >
              <Play className="w-3.5 h-3.5" />
              CONFIGURE MANUALLY
            </button>
          </>
        )}
      </div>
    </section>
  );
};

export default BriefingScreen;