"use client";

import React, { useEffect, useState } from "react";
import { useSimulation } from "../hooks/useSimulation";
import { Grid } from "../components/Grid";
import EventSpotlight from "../components/EventSpotlight";
import { SpotlightEvent } from "../lib/types";
import { Controls } from "../components/Controls";
import { DEMO_SCENARIO } from "../lib/demoScenarios";
import { StatsPanel } from "../components/StatsPanel";
import { ConfigPanel } from "../components/ConfigPanel";
import { RunHistory } from "../components/RunHistory";
import { Shield, Eye, Radio, UserCheck, Activity } from "lucide-react";

export default function Home() {
  const {
    config,
    grid,
    agents,
    stats,
    isRunning,
    speed,
    saveStatus,
    start,
    pause,
    reset,
    stepOnce,
    setSpeed,
    updateConfig,
    messages,
    spotlightEvents,
  } = useSimulation({
    gridSize: 15,
    scoutCount: 2,
    rescueCount: 3,
    victimCount: 8,
    blockedPercent: 12,
    dangerPercent: 8,
    maxTicks: 300,
  });

  const [displayedSpotlights, setDisplayedSpotlights] = useState<SpotlightEvent[]>([]);
  const [highlightedCell, setHighlightedCell] = useState<{ x: number; y: number; severity?: string } | null>(null);
  const timersRef = React.useRef<number[]>([]);

  useEffect(() => {
    if (!spotlightEvents || spotlightEvents.length === 0) return;
    const existingIds = new Set(displayedSpotlights.map((s) => s.id));
    const newEvents = spotlightEvents.filter((s) => !existingIds.has(s.id));
    newEvents.forEach((e) => {
      setDisplayedSpotlights((prev) => [...prev, e]);
      const t = window.setTimeout(() => {
        setDisplayedSpotlights((prev) => prev.filter((p) => p.id !== e.id));
      }, e.durationMs);
      timersRef.current.push(t);

      if (e.x !== undefined && e.y !== undefined) {
        setHighlightedCell({ x: e.x, y: e.y, severity: e.severity });
        const t2 = window.setTimeout(() => setHighlightedCell(null), e.durationMs);
        timersRef.current.push(t2);
      }
    });

    return () => {
      timersRef.current.forEach((id) => clearTimeout(id));
      timersRef.current = [];
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spotlightEvents]);

  const handleDismiss = (id: string) => {
    setDisplayedSpotlights((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <main className="min-h-screen bg-[#0B1220] text-[#F8FAFC] p-4 md:p-6 font-sans">
      {/* Top Header Console Bar */}
      <header className="max-w-7xl mx-auto mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#22D3EE]/15 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#22D3EE] shadow-[0_0_8px_#22D3EE] animate-status-pulse" />
            <h1 className="text-xl md:text-2xl font-mono-telemetry font-bold tracking-tight text-[#F8FAFC]">
              DISASTER RESPONSE <span className="text-[#22D3EE]">SIMULATION</span>
            </h1>
          </div>
          <p className="text-xs font-mono-telemetry text-[#F8FAFC]/65 mt-1">
            Autonomous Multi-Agent Evacuation & Tactical Coordination Console
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-[#16243A] border border-[#22D3EE]/20 rounded px-3 py-1.5 text-xs font-mono-telemetry flex items-center gap-2">
            <span className="text-[#F8FAFC]/50">PROTOCOL:</span>
            <span className="text-[#22C55E] font-semibold">DISTRIBUTED BFS + BUS</span>
          </div>
        </div>
      </header>

      {/* Main Grid & Instrument Layout */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Hero Section: Simulation Grid Map (7 cols on desktop) */}
        <section className="lg:col-span-7 space-y-4">
          <div className="bg-[#16243A] border border-[#22D3EE]/15 rounded-md p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-[#22D3EE]/15 pb-2">
              <h2 className="font-mono-telemetry text-xs uppercase tracking-wider text-[#22D3EE] font-semibold flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5" />
                Tactical Map Telemetry ({config.gridSize}x{config.gridSize})
              </h2>
              <span className="text-[11px] font-mono-telemetry text-[#F8FAFC]/50">
                Tick: <span className="text-[#22D3EE]">{stats.tick}</span>
              </span>
            </div>

            {/* Grid Container */}
            <Grid grid={grid} agents={agents} highlightedCell={highlightedCell}>
              <EventSpotlight events={displayedSpotlights} onDismiss={handleDismiss} />
            </Grid>

            {/* Legend Toolbar */}
            <div className="pt-2 grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-mono-telemetry border-t border-[#22D3EE]/10">
              <div className="flex items-center gap-1.5 text-[#22D3EE]">
                <div className="w-3 h-3 rounded-full border border-[#22D3EE] bg-[#0B1220] flex items-center justify-center">
                  <Eye className="w-2 h-2" />
                </div>
                <span>Scout Agent</span>
              </div>

              <div className="flex items-center gap-1.5 text-[#F97316]">
                <div className="w-3 h-3 rounded bg-[#F97316] text-[#0B1220] flex items-center justify-center">
                  <Shield className="w-2 h-2" />
                </div>
                <span>Rescue Agent</span>
              </div>

              <div className="flex items-center gap-1.5 text-[#FACC15]">
                <div className="w-3 h-3 rounded bg-[#FACC15] text-[#0B1220] flex items-center justify-center">
                  <Radio className="w-2 h-2" />
                </div>
                <span>Coordinator</span>
              </div>

              <div className="flex items-center gap-1.5 text-[#22C55E]">
                <div className="w-3 h-3 rounded bg-[#22C55E] text-[#0B1220] flex items-center justify-center">
                  <UserCheck className="w-2 h-2" />
                </div>
                <span>Rescued Evacuee</span>
              </div>
            </div>
          </div>

          {/* Past Run Comparison Table */}
          <RunHistory lastSavedAt={stats.endedAt} />
        </section>

        {/* Console Side Panel (5 cols on desktop) */}
        <section className="lg:col-span-5 space-y-4">
          <Controls
            isRunning={isRunning}
            onStart={start}
            onPause={pause}
            onReset={reset}
            onStepOnce={stepOnce}
            speed={speed}
            onSpeedChange={setSpeed}
            onRunDemo={() => {
              updateConfig(DEMO_SCENARIO);
              // ensure simulation starts with demo config
              start();
            }}
            isComplete={stats.endedAt !== undefined}
          />

          <StatsPanel
            stats={stats}
            isRunning={isRunning}
            messages={messages}
            saveStatus={saveStatus}
          />

          <ConfigPanel
            config={config}
            onUpdateConfig={updateConfig}
            isRunning={isRunning}
          />
        </section>
      </div>
    </main>
  );
}
