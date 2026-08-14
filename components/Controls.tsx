"use client";

import React from "react";
import { Play, Pause, RotateCcw, FastForward, Zap } from "lucide-react";

interface ControlsProps {
  isRunning: boolean;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
  onStepOnce: () => void;
  speed: number;
  onSpeedChange: (speed: number) => void;
  onRunDemo?: () => void;
  isComplete: boolean;
}

export const Controls: React.FC<ControlsProps> = ({
  isRunning,
  onStart,
  onPause,
  onReset,
  onStepOnce,
  speed,
  onSpeedChange,
  onRunDemo = () => {},
  isComplete,
}) => {
  return (
    <div className="bg-[#16243A] border border-[rgba(34,211,238,0.12)] rounded-md p-4 space-y-4">
      {/* Panel Header */}
      <div className="flex items-center justify-between border-b border-[rgba(34,211,238,0.12)] pb-2">
        <h2 className="font-mono text-xs uppercase tracking-wider text-[#22D3EE] font-semibold flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5" />
          Mission Operations
        </h2>
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-[#F8FAFC]/65">
            Tick: <span className="text-[#22D3EE] font-semibold">{speed}ms</span>
          </span>
        </div>
      </div>

      {/* Button Grid — Primary Start button is high-contrast accent; secondary actions are outlined (§7) */}
      <div className="grid grid-cols-4 gap-2">
        {!isRunning ? (
          <button
            type="button"
            onClick={onStart}
            className="col-span-2 bg-[#22D3EE] text-[#0B1220] hover:bg-[#22D3EE]/90 font-mono font-bold text-xs py-2 px-3 rounded-md flex items-center justify-center gap-1.5 transition-colors duration-150 focus-console cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            {isComplete ? "RESTART" : "START SIM"}
          </button>
        ) : (
          <button
            type="button"
            onClick={onPause}
            className="col-span-2 bg-transparent border border-[#F97316]/60 text-[#F97316] hover:bg-[rgba(34,211,238,0.06)] font-mono font-bold text-xs py-2 px-3 rounded-md flex items-center justify-center gap-1.5 transition-colors duration-150 focus-console cursor-pointer"
          >
            <Pause className="w-3.5 h-3.5" />
            PAUSE
          </button>
        )}

        <button
          type="button"
          onClick={onStepOnce}
          disabled={isRunning || isComplete}
          className="bg-transparent border border-[rgba(34,211,238,0.25)] text-[#F8FAFC] hover:bg-[rgba(34,211,238,0.06)] disabled:opacity-40 disabled:hover:bg-transparent font-mono text-xs py-2 px-2 rounded-md flex items-center justify-center gap-1 transition-colors duration-150 focus-console cursor-pointer"
          title="Advance 1 Tick"
        >
          <FastForward className="w-3.5 h-3.5" />
          STEP
        </button>

        <button
          type="button"
          onClick={onReset}
          className="bg-transparent border border-[rgba(34,211,238,0.25)] text-[#F8FAFC] hover:bg-[rgba(34,211,238,0.06)] font-mono text-xs py-2 px-2 rounded-md flex items-center justify-center gap-1 transition-colors duration-150 focus-console cursor-pointer"
          title="Reset Simulation"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          RESET
        </button>
      </div>

      {/* Demo Scenario Launch Action */}
      <div className="flex">
        <button
          type="button"
          onClick={onRunDemo}
          disabled={isRunning}
          className="w-full bg-transparent border border-[rgba(34,211,238,0.25)] text-[#22D3EE] hover:bg-[rgba(34,211,238,0.06)] font-mono text-xs py-2 px-3 rounded-md flex items-center justify-center gap-1.5 transition-colors duration-150 focus-console cursor-pointer disabled:opacity-40 disabled:hover:bg-transparent"
        >
          <Zap className="w-3.5 h-3.5" />
          RUN DEMO SCENARIO
        </button>
      </div>

      {/* Speed Slider Control with Recessed Theme Styling */}
      <div className="space-y-1.5 pt-1">
        <div className="flex justify-between text-xs font-mono text-[#F8FAFC]/40">
          <span>Fast (100ms)</span>
          <span>Normal (300ms)</span>
          <span>Slow (1000ms)</span>
        </div>
        <input
          type="range"
          min={100}
          max={1000}
          step={50}
          value={speed}
          onChange={(e) => onSpeedChange(parseInt(e.target.value, 10))}
          className="w-full accent-[#22D3EE] bg-[#0B1220] h-1.5 rounded-md cursor-pointer focus-console"
          aria-label="Simulation speed interval in milliseconds"
        />
      </div>
    </div>
  );
};

export default Controls;
