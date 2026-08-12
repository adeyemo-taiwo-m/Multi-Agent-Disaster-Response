"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AgentState, Grid, SimulationConfig, SimulationStats } from "../lib/types";
import { SimulationEngine } from "../lib/simulationEngine";
import { saveRun } from "../lib/stats";

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

  const hasSavedRef = useRef<boolean>(false);

  const updateState = useCallback(() => {
    const engine = engineRef.current;
    setGrid([...engine.grid.map((row) => [...row])]);
    setAgents(engine.agents.map((a) => a.getState()));
    setStats({ ...engine.stats });
  }, []);

  const stepOnce = useCallback(() => {
    const engine = engineRef.current;
    if (engine.isComplete()) {
      setIsRunning(false);
      return;
    }

    engine.tick();
    updateState();

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
      hasSavedRef.current = false;
      setSaveStatus({ state: "idle" });
      updateState();
    }
    setIsRunning(true);
  }, [config, updateState]);

  const pause = useCallback(() => {
    setIsRunning(false);
  }, []);

  const reset = useCallback(() => {
    setIsRunning(false);
    engineRef.current = new SimulationEngine(config);
    hasSavedRef.current = false;
    setSaveStatus({ state: "idle" });
    updateState();
  }, [config, updateState]);

  const updateConfig = useCallback((newConfig: SimulationConfig) => {
    setIsRunning(false);
    setConfig(newConfig);
    engineRef.current = new SimulationEngine(newConfig);
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
    start,
    pause,
    reset,
    stepOnce,
    setSpeed,
    updateConfig,
    messages: engineRef.current.bus.getAll(),
  };
}
