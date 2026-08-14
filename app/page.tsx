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
import BriefingScreen from "../components/BriefingScreen";
import { Activity } from "lucide-react";

export default function Home() {
  const [showBriefing, setShowBriefing] = useState(true);
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
  }, [spotlightEvents, displayedSpotlights]);

  const handleDismiss = (id: string) => {
    setDisplayedSpotlights((prev) => prev.filter((p) => p.id !== id));
  };

  const handleStart = () => {
    setShowBriefing(false);
    start();
  };

  const handleReset = () => {
    reset();
    setShowBriefing(true);
  };

  const handleRunDemo = () => {
    setShowBriefing(false);
    updateConfig(DEMO_SCENARIO);
    start();
  };

  return (
    <main className="min-h-screen bg-[#0B1220] text-[#F8FAFC] p-4 md:p-6 font-sans">
      {/* Top Header Console Bar (§1, §4) */}
      <header className="max-w-7xl mx-auto mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[rgba(34,211,238,0.12)] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#22D3EE] animate-status-pulse" />
            <h1 className="text-xl md:text-2xl font-mono font-bold tracking-tight text-[#F8FAFC]">
              DISASTER RESPONSE <span className="text-[#22D3EE]">SIMULATION</span>
            </h1>
          </div>
          <p className="text-xs font-mono text-[#F8FAFC]/65 mt-1">
            Autonomous Multi-Agent Evacuation & Tactical Coordination Console
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-[#16243A] border border-[rgba(34,211,238,0.15)] rounded-md px-3 py-1.5 text-xs font-mono flex items-center gap-2">
            <span className="text-[#F8FAFC]/50">PROTOCOL:</span>
            <span className="text-[#22C55E] font-semibold">DISTRIBUTED BFS + BUS</span>
          </div>
        </div>
      </header>

      {/* Main Grid & Instrument Layout (§5) */}
      {showBriefing ? (
        <div className="max-w-7xl mx-auto">
          <BriefingScreen
            onConfigure={() => setShowBriefing(false)}
            onRunDemo={handleRunDemo}
          />
        </div>
      ) : (
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Hero Section: Simulation Grid Map (7 cols on desktop) */}
          <section className="lg:col-span-7 space-y-4">
            <div className="bg-[#16243A] border border-[rgba(34,211,238,0.12)] rounded-md p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-[rgba(34,211,238,0.12)] pb-2">
                <h2 className="font-mono text-xs uppercase tracking-wider text-[#22D3EE] font-semibold flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5" />
                  Tactical Map Telemetry ({config.gridSize}x{config.gridSize})
                </h2>
                <span className="text-xs font-mono text-[#F8FAFC]/50">
                  Tick: <span className="text-[#22D3EE] font-semibold">{stats.tick}</span>
                </span>
              </div>

              {/* Grid Hero Container */}
              <Grid grid={grid} agents={agents} highlightedCell={highlightedCell}>
                <EventSpotlight events={displayedSpotlights} onDismiss={handleDismiss} />
              </Grid>

              {/* Legend Toolbar (§3, §8: exact token colors and shapes) */}
              <div className="pt-2 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono border-t border-[rgba(34,211,238,0.08)]">
                <div className="flex items-center gap-2 text-[#22D3EE]">
                  <div className="w-3.5 h-3.5 rounded-full border-2 border-[#22D3EE] bg-[#0B1220] flex items-center justify-center">
                    <div className="w-1 h-1 rounded-full bg-[#22D3EE]" />
                  </div>
                  <span>Scout</span>
                </div>

                <div className="flex items-center gap-2 text-[#F97316]">
                  <div className="w-3.5 h-3.5 flex items-center justify-center">
                    <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 text-[#F97316] fill-current">
                      <polygon points="12,3 22,21 2,21" />
                    </svg>
                  </div>
                  <span>Rescuer</span>
                </div>

                <div className="flex items-center gap-2 text-[#FACC15]">
                  <div className="w-3 h-3 bg-[#FACC15] rotate-45 rounded-[1px] flex items-center justify-center">
                    <div className="w-1 h-1 bg-[#0B1220] rounded-full" />
                  </div>
                  <span>Coordinator</span>
                </div>

                <div className="flex items-center gap-2 text-[#22C55E]">
                  <div className="w-3.5 h-3.5 rounded-[2px] bg-[#22C55E] text-[#0B1220] font-bold text-[9px] flex items-center justify-center">
                    ✓
                  </div>
                  <span>Rescued</span>
                </div>
              </div>
            </div>

            {/* Past Run History Table (§5, §7) */}
            <RunHistory lastSavedAt={stats.endedAt} />
          </section>

          {/* Console Side Panel (5 cols on desktop) */}
          <section className="lg:col-span-5 space-y-4">
            <Controls
              isRunning={isRunning}
              onStart={handleStart}
              onPause={pause}
              onReset={handleReset}
              onStepOnce={stepOnce}
              speed={speed}
              onSpeedChange={setSpeed}
              onRunDemo={handleRunDemo}
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
      )}
    </main>
  );
}
