"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  AgentMessage,
  AgentState,
  Grid,
  SimulationConfig,
  SimulationStats,
  SpotlightEvent,
} from "../lib/types";
import { SimulationEngine } from "../lib/simulationEngine";
import { saveRun } from "../lib/stats";
import { detectSpotlightEvents, resetSpotlightCursor } from "../lib/spotlightEngine";

export function useSimulation(initialConfig: SimulationConfig) {
  const [config, setConfig] = useState<SimulationConfig>(initialConfig);
  const engineRef = useRef<SimulationEngine>(new SimulationEngine(initialConfig));

  const [grid, setGrid] = useState<Grid>(engineRef.current.grid);
  const [agents, setAgents] = useState<AgentState[]>(
    engineRef.current.agents.map((a) => a.getState())
  );
  const [stats, setStats] = useState<SimulationStats>(engineRef.current.stats);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [speed, setSpeed] = useState<number>(300); // interval ms

  const [saveStatus, setSaveStatus] = useState<{
    state: "idle" | "saving" | "saved" | "error";
    message?: string;
  }>({ state: "idle" });

  const [spotlightEvents, setSpotlightEvents] = useState<SpotlightEvent[]>([]);
  const [messages, setMessages] = useState<AgentMessage[]>(
    engineRef.current.bus.getAll()
  );

  const hasSavedRef = useRef<boolean>(false);
  const hasMissionEventRef = useRef<boolean>(false);

  const updateState = useCallback(() => {
    const engine = engineRef.current;
    setGrid([...engine.grid.map((row) => [...row])]);
    setAgents(engine.agents.map((a) => a.getState()));
    setStats({ ...engine.stats });
    setMessages(engine.bus.getAll());
  }, []);

  const stepOnce = useCallback(() => {
    const engine = engineRef.current;
    if (engine.isComplete()) {
      setIsRunning(false);
      return;
    }

    engine.tick();
    updateState();

    // Detect spotlight events from message bus after each tick
    try {
      const newEvents = detectSpotlightEvents(engineRef.current.bus.getAll(), engineRef.current.stats.tick);
      if (newEvents.length > 0) {
        setSpotlightEvents((prev) => [...prev, ...newEvents]);
      }
    } catch (e) {
      // detection should be pure and safe; swallow any unexpected errors
      // so server-side rendering / build isn't affected
      // eslint-disable-next-line no-console
      console.error("Spotlight detection error:", e);
    }

    // Check completion and auto-save
    if (engine.isComplete() && !hasSavedRef.current) {
      hasSavedRef.current = true;
      setIsRunning(false);
      setSaveStatus({ state: "saving" });

      saveRun(engine.stats, config.gridSize).then((res) => {
        if (res.success) {
          setSaveStatus({ state: "saved", message: "Run saved successfully" });
        } else {
          setSaveStatus({
            state: "error",
            message: res.error || "Failed to save run to Supabase",
          });
        }
      });
    }

    // Add a one-time mission-complete spotlight event when engine finishes
    if (engine.isComplete() && !hasMissionEventRef.current) {
      hasMissionEventRef.current = true;
      const completeEvent: SpotlightEvent = {
        id: `mission-complete-${engine.stats.tick}`,
        tick: engine.stats.tick,
        title: "Mission complete",
        detail: `Run completed at tick ${engine.stats.tick}.`,
        severity: "success",
        durationMs: 3500,
      };
      setSpotlightEvents((prev) => [...prev, completeEvent]);
    }
  }, [config.gridSize, updateState]);

  // Simulation tick loop interval
  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      stepOnce();
    }, speed);

    return () => clearInterval(interval);
  }, [isRunning, speed, stepOnce]);

  const start = useCallback(() => {
    if (engineRef.current.isComplete()) {
      // Re-initialize if completed
      engineRef.current = new SimulationEngine(config);
      resetSpotlightCursor();
      hasSavedRef.current = false;
      setSaveStatus({ state: "idle" });
      updateState();
      hasMissionEventRef.current = false;
      setSpotlightEvents([]);
    }
    setIsRunning(true);
  }, [config, updateState]);

  const pause = useCallback(() => {
    setIsRunning(false);
  }, []);

  const reset = useCallback(() => {
    setIsRunning(false);
    engineRef.current = new SimulationEngine(config);
    resetSpotlightCursor();
    hasSavedRef.current = false;
    setSaveStatus({ state: "idle" });
    hasMissionEventRef.current = false;
    setSpotlightEvents([]);
    updateState();
  }, [config, updateState]);

  const updateConfig = useCallback((newConfig: SimulationConfig) => {
    setIsRunning(false);
    setConfig(newConfig);
    engineRef.current = new SimulationEngine(newConfig);
    resetSpotlightCursor();
    hasSavedRef.current = false;
    setSaveStatus({ state: "idle" });
    updateState();
  }, [updateState]);

  return {
    config,
    grid,
    agents,
    stats,
    isRunning,
    speed,
    saveStatus,
    spotlightEvents,
    start,
    pause,
    reset,
    stepOnce,
    setSpeed,
    updateConfig,
    messages,
  };
}
