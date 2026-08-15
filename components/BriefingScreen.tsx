"use client";

import React from "react";
import { Play, Zap, Compass } from "lucide-react";

interface BriefingScreenProps {
  onConfigure: () => void;
  onRunDemo: () => void;
}

export const BriefingScreen: React.FC<BriefingScreenProps> = ({
  onConfigure,
  onRunDemo,
}) => {
  return (
    <section className="bg-[rgb(var(--bg-secondary))] border border-[rgb(var(--accent)/0.15)] rounded-md p-6 sm:p-8 max-w-4xl mx-auto">
      {/* Header section */}
      <div className="border-b border-[rgb(var(--accent)/0.15)] pb-6 mb-6">
        <div className="inline-flex items-center gap-2 rounded-md bg-[rgb(var(--bg-primary))] border border-[rgb(var(--accent)/0.15)] px-3 py-1.5 text-xs uppercase tracking-[0.25em] text-[rgb(var(--accent))] font-mono font-semibold">
          <Compass className="w-3.5 h-3.5" />
          MISSION BRIEFING
        </div>

        <h1 className="mt-5 text-2xl md:text-3xl font-mono font-bold tracking-tight text-[rgb(var(--text-primary))]">
          Coordinate autonomous agents to evacuate civilians from disaster zones.
        </h1>

        <p className="mt-3 max-w-2xl text-xs md:text-sm leading-relaxed text-[rgb(var(--text-primary)/0.75)]">
          Observe real-time agent coordination, conflict resolution, and rescue workflows. Use Demo Mode for a curated scenario built for live demonstrations.
        </p>
      </div>

      {/* Objectives & Flow Columns */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-md border border-[rgb(var(--accent)/0.12)] bg-[rgb(var(--bg-primary))] p-4">
          <p className="text-xs uppercase tracking-wider text-[rgb(var(--accent))] font-mono font-semibold mb-3">
            Key objectives
          </p>
          <ul className="space-y-2 text-xs text-[rgb(var(--text-primary)/0.80)] leading-relaxed font-sans">
            <li>• Scouts detect victims and broadcast findings via the message bus.</li>
            <li>• Rescue agents claim tasks and navigate blocked paths.</li>
            <li>• Coordinator assigns priority tasks to idle rescuers.</li>
            <li>• Demo mode guarantees high-impact events for live presentation.</li>
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
      </div>
    </section>
  );
};

export default BriefingScreen;