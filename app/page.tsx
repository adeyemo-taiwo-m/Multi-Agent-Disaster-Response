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
import { Activity, HelpCircle } from "lucide-react";

export default function Home() {
  const [showBriefing, setShowBriefing] = useState(true);
  const [showBriefingOverlay, setShowBriefingOverlay] = useState(false);

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
    setShowBriefingOverlay(false);
  };

  const handleRunDemo = () => {
    setShowBriefing(false);
    updateConfig(DEMO_SCENARIO);
  };

  const handleOpenBriefingOverlay = () => {
    if (isRunning) pause();
    setShowBriefingOverlay(true);
  };

  const handleResumeFromOverlay = () => {
    setShowBriefingOverlay(false);
  };

  return (
    <main className="min-h-screen bg-[rgb(var(--bg-primary))] text-[rgb(var(--text-primary))] p-4 md:p-6 font-sans">
      <header className="max-w-7xl mx-auto mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[rgb(var(--accent)/0.12)] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[rgb(var(--accent))] animate-status-pulse" />
            <h1 className="text-xl md:text-2xl font-mono font-bold tracking-tight text-[rgb(var(--text-primary))]">
              DISASTER RESPONSE <span className="text-[rgb(var(--accent))]">SIMULATION</span>
            </h1>
          </div>
          <p className="text-xs font-mono text-[rgb(var(--text-primary)/0.65)] mt-1">
            Autonomous Multi-Agent Evacuation & Tactical Coordination Console
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-[rgb(var(--bg-secondary))] border border-[rgb(var(--accent)/0.15)] rounded-md px-3 py-1.5 text-xs font-mono flex items-center gap-2">
            <span className="text-[rgb(var(--text-primary)/0.50)]">PROTOCOL:</span>
            <span className="text-[rgb(var(--success))] font-semibold">DISTRIBUTED BFS + BUS</span>
          </div>

          {!showBriefing && (
            <button
              type="button"
              onClick={handleOpenBriefingOverlay}
              className="bg-[rgb(var(--bg-secondary))] border border-[rgb(var(--accent)/0.15)] rounded-md p-1.5 text-[rgb(var(--accent))] hover:bg-[rgb(var(--accent)/0.06)] transition-colors duration-150 focus-console cursor-pointer"
              title="View mission briefing"
              aria-label="Pause and view mission briefing"
            >
              <HelpCircle className="w-4 h-4" />
            </button>
          )}
        </div>
      </header>

      {showBriefing ? (
        <div className="max-w-7xl mx-auto">
          <BriefingScreen
            onConfigure={() => setShowBriefing(false)}
            onRunDemo={handleRunDemo}
          />
        </div>
      ) : (
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 relative">
          {showBriefingOverlay && (
            <div className="fixed inset-0 z-50 bg-[rgb(var(--bg-primary)/0.85)] flex items-center justify-center p-4 overflow-y-auto">
              <BriefingScreen
                mode="overlay"
                onResume={handleResumeFromOverlay}
                onConfigure={() => {}}
                onRunDemo={() => {}}
              />
            </div>
          )}

          <section className="lg:col-span-7 space-y-4">
            <div className="bg-[rgb(var(--bg-secondary))] border border-[rgb(var(--accent)/0.12)] rounded-md p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-[rgb(var(--accent)/0.12)] pb-2">
                <h2 className="font-mono text-xs uppercase tracking-wider text-[rgb(var(--accent))] font-semibold flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5" />
                  Tactical Map Telemetry ({config.gridSize}x{config.gridSize})
                </h2>
                <span className="text-xs font-mono text-[rgb(var(--text-primary)/0.50)]">
                  Tick: <span className="text-[rgb(var(--accent))] font-semibold font-mono-telemetry">{stats.tick}</span>
                </span>
              </div>

              <Grid grid={grid} agents={agents} highlightedCell={highlightedCell}>
                <EventSpotlight events={displayedSpotlights} onDismiss={handleDismiss} />
              </Grid>

              <div className="pt-2 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono border-t border-[rgb(var(--accent)/0.08)]">
                <div className="flex items-center gap-2 text-[rgb(var(--accent))]">
                  <div className="w-3.5 h-3.5 rounded-full border-2 border-[rgb(var(--accent))] bg-[rgb(var(--bg-primary))] flex items-center justify-center">
                    <div className="w-1 h-1 rounded-full bg-[rgb(var(--accent))]" />
                  </div>
                  <span>Scout</span>
                </div>

                <div className="flex items-center gap-2 text-[rgb(var(--emergency))]">
                  <div className="w-3.5 h-3.5 flex items-center justify-center">
                    <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 text-[rgb(var(--emergency))] fill-current">
                      <polygon points="12,3 22,21 2,21" />
                    </svg>
                  </div>
                  <span>Rescuer</span>
                </div>

                <div className="flex items-center gap-2 text-[rgb(var(--accent))]">
                  <div className="w-3 h-3 bg-[rgb(var(--accent)/0.55)] border border-[rgb(var(--accent))] rotate-45 rounded-[1px] flex items-center justify-center">
                    <div className="w-1 h-1 bg-[rgb(var(--bg-primary))] rounded-full" />
                  </div>
                  <span>Coordinator</span>
                </div>

                <div className="flex items-center gap-2 text-[rgb(var(--success))]">
                  <div className="w-3.5 h-3.5 rounded-[2px] bg-[rgb(var(--success))] text-[rgb(var(--bg-primary))] font-bold text-[9px] flex items-center justify-center">
                    ✓
                  </div>
                  <span>Rescued</span>
                </div>
              </div>
            </div>

            <RunHistory lastSavedAt={stats.endedAt} />
          </section>

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