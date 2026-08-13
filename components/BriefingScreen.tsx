"use client";

import React from "react";
import { ButtonHTMLAttributes } from "react";
import { Play, Zap, Compass, Shield } from "lucide-react";

interface BriefingScreenProps {
  onConfigure: () => void;
  onRunDemo: () => void;
}

const BriefingScreen: React.FC<BriefingScreenProps> = ({ onConfigure, onRunDemo }) => {
  return (
    <section className="bg-[#16243A] border border-[#22D3EE]/15 rounded-md p-8 shadow-[0_0_40px_rgba(11,18,32,0.7)] max-w-4xl mx-auto">
      <div className="border-b border-[#22D3EE]/20 pb-6 mb-6">
        <div className="inline-flex items-center gap-3 rounded-full bg-[#0B1220]/80 px-4 py-2 text-xs uppercase tracking-[0.35em] text-[#22D3EE] font-semibold">
          <Compass className="w-4 h-4" />
          MISSION BRIEFING
        </div>

        <h1 className="mt-6 text-3xl md:text-4xl font-mono-telemetry font-bold tracking-tight text-[#F8FAFC]">
          Coordinate scouts, rescuers, and a command coordinator to evacuate civilians from a disaster zone.
        </h1>

        <p className="mt-4 max-w-2xl text-sm leading-7 text-[#F8FAFC]/80">
          Demonstrate distributed decision-making with real-time communication events, conflict resolution, and mission-critical rescue coordination.
          Use Demo Mode for a tuned scenario that highlights claim races and unreachable victims in a short live presentation.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-[#22D3EE]/15 bg-[#0B1220]/80 p-5">
          <p className="text-sm uppercase tracking-[0.3em] text-[#22D3EE] font-semibold mb-4">Key objectives</p>
          <ul className="space-y-3 text-sm text-[#F8FAFC]/80 leading-6">
            <li>• Scouts detect victims and broadcast findings via the message bus.</li>
            <li>• Rescue agents claim tasks and navigate blocked paths.</li>
            <li>• Coordinator assigns priority tasks to idle rescuers.</li>
            <li>• Demo mode guarantees high-impact events for live presentation.</li>
          </ul>
        </div>

        <div className="rounded-xl border border-[#22D3EE]/15 bg-[#0B1220]/80 p-5">
          <p className="text-sm uppercase tracking-[0.3em] text-[#22D3EE] font-semibold mb-4">Presentation flow</p>
          <ol className="space-y-3 text-sm text-[#F8FAFC]/80 leading-6 list-decimal list-inside">
            <li>Use "Run Demo Scenario" to start a tuned, seeded mission.</li>
            <li>Point out the on-screen Event Spotlight cards.</li>
            <li>Highlight rescue completion and unreachable victim warnings.</li>
            <li>Wrap up with the end-reason and mission stats panel.</li>
          </ol>
        </div>
      </div>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button
          onClick={onRunDemo}
          className="inline-flex items-center justify-center gap-2 rounded-md bg-[#22D3EE] px-5 py-3 text-sm font-semibold text-[#0B1220] shadow-[0_0_16px_rgba(34,211,238,0.25)] transition hover:bg-[#22D3EE]/90"
        >
          <Zap className="w-4 h-4" />
          Run Demo Scenario
        </button>

        <button
          onClick={onConfigure}
          className="inline-flex items-center justify-center gap-2 rounded-md border border-[#22D3EE]/30 bg-transparent px-5 py-3 text-sm font-semibold text-[#F8FAFC] hover:border-[#22D3EE]/60"
        >
          <Play className="w-4 h-4" />
          Configure manually
        </button>
      </div>
    </section>
  );
};

export default BriefingScreen;
