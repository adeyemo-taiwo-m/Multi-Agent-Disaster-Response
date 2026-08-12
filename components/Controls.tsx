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
  isComplete,
}) => {
  return (
    <div className="bg-[#16243A] border border-[#22D3EE]/15 rounded-md p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-mono-telemetry text-xs uppercase tracking-wider text-[#22D3EE] font-semibold flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5" />
          Mission Operations
        </h2>
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono-telemetry text-[#F8FAFC]/65">
            Tick Interval: <span className="text-[#22D3EE] font-bold">{speed}ms</span>
          </span>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2">
        {!isRunning ? (
          <button
            onClick={onStart}
            className="col-span-2 bg-[#22D3EE] text-[#0B1220] hover:bg-[#22D3EE]/90 font-mono-telemetry font-bold text-xs py-2 px-3 rounded flex items-center justify-center gap-1.5 transition-colors shadow-[0_0_12px_rgba(34,211,238,0.3)] cursor-pointer"
          >
            <Play className="w-4 h-4 fill-current" />
            {isComplete ? "RESTART" : "START SIM"}
          </button>
        ) : (
          <button
            onClick={onPause}
            className="col-span-2 bg-amber-500/20 border border-amber-500/40 text-amber-300 hover:bg-amber-500/30 font-mono-telemetry font-bold text-xs py-2 px-3 rounded flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <Pause className="w-4 h-4" />
            PAUSE
          </button>
        )}

        <button
          onClick={onStepOnce}
          disabled={isRunning || isComplete}
          className="bg-transparent border border-[#22D3EE]/30 text-[#F8FAFC] hover:bg-[#22D3EE]/10 disabled:opacity-30 font-mono-telemetry text-xs py-2 px-2 rounded flex items-center justify-center gap-1 transition-colors cursor-pointer"
          title="Advance 1 Tick"
        >
          <FastForward className="w-3.5 h-3.5" />
          STEP
        </button>

        <button
          onClick={onReset}
          className="bg-transparent border border-[#22D3EE]/30 text-[#F8FAFC] hover:bg-[#22D3EE]/10 font-mono-telemetry text-xs py-2 px-2 rounded flex items-center justify-center gap-1 transition-colors cursor-pointer"
          title="Reset Simulation"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          RESET
        </button>
      </div>

      <div className="mt-2 flex gap-2">
        <button
          onClick={onRunDemo}
          disabled={isRunning}
          className="bg-transparent border border-[#22D3EE]/30 text-[#22D3EE] hover:bg-[#22D3EE]/6 font-mono-telemetry text-xs py-2 px-3 rounded flex items-center justify-center gap-1 transition-colors cursor-pointer disabled:opacity-40"
        >
          DEMO SCENARIO
        </button>
      </div>

      <div className="space-y-1">
        <div className="flex justify-between text-[11px] font-mono-telemetry text-[#F8FAFC]/50">
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
          onChange={(e) => onSpeedChange(parseInt(e.target.value))}
          className="w-full accent-[#22D3EE]"
        />
      </div>
    </div>
  );
};
