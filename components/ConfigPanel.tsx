"use client";

import React, { useState } from "react";
import { SimulationConfig } from "../lib/types";
import { Sliders } from "lucide-react";

interface ConfigPanelProps {
  config: SimulationConfig;
  onUpdateConfig: (newConfig: SimulationConfig) => void;
  isRunning: boolean;
}

export const ConfigPanel: React.FC<ConfigPanelProps> = ({
  config,
  onUpdateConfig,
  isRunning,
}) => {
  const [formState, setFormState] = useState<SimulationConfig>(config);

  const handleChange = (field: keyof SimulationConfig, value: number) => {
    const updated = { ...formState, [field]: value };
    setFormState(updated);
    if (!isRunning) {
      onUpdateConfig(updated);
    }
  };

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateConfig(formState);
  };

  return (
    <div className="bg-[#16243A] border border-[#22D3EE]/15 rounded-md p-4 space-y-3 text-sm">
      <div className="flex items-center justify-between border-b border-[#22D3EE]/15 pb-2">
        <h2 className="font-mono-telemetry text-xs uppercase tracking-wider text-[#22D3EE] font-semibold flex items-center gap-1.5">
          <Sliders className="w-3.5 h-3.5" />
          Environment Setup
        </h2>
        {isRunning && (
          <span className="text-[10px] font-mono-telemetry text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded border border-amber-400/20">
            Locked (Running)
          </span>
        )}
      </div>

      <form onSubmit={handleApply} className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-[#F8FAFC]/65 mb-1 font-mono-telemetry">
            Grid Dimensions: <span className="text-[#F8FAFC]">{formState.gridSize}x{formState.gridSize}</span>
          </label>
          <input
            type="range"
            min={10}
            max={25}
            disabled={isRunning}
            value={formState.gridSize}
            onChange={(e) => handleChange("gridSize", parseInt(e.target.value))}
            className="w-full accent-[#22D3EE] disabled:opacity-40"
          />
        </div>

        <div>
          <label className="block text-xs text-[#F8FAFC]/65 mb-1 font-mono-telemetry">
            Victim Evacuees: <span className="text-[#FACC15]">{formState.victimCount}</span>
          </label>
          <input
            type="number"
            min={1}
            max={30}
            disabled={isRunning}
            value={formState.victimCount}
            onChange={(e) => handleChange("victimCount", parseInt(e.target.value) || 1)}
            className="w-full bg-[#0B1220] border border-[#22D3EE]/20 rounded px-2 py-1 text-xs text-[#F8FAFC] focus:outline-none focus:border-[#22D3EE] disabled:opacity-40"
          />
        </div>

        <div>
          <label className="block text-xs text-[#F8FAFC]/65 mb-1 font-mono-telemetry">
            Scout Agents: <span className="text-[#22D3EE]">{formState.scoutCount}</span>
          </label>
          <input
            type="number"
            min={1}
            max={10}
            disabled={isRunning}
            value={formState.scoutCount}
            onChange={(e) => handleChange("scoutCount", parseInt(e.target.value) || 1)}
            className="w-full bg-[#0B1220] border border-[#22D3EE]/20 rounded px-2 py-1 text-xs text-[#F8FAFC] focus:outline-none focus:border-[#22D3EE] disabled:opacity-40"
          />
        </div>

        <div>
          <label className="block text-xs text-[#F8FAFC]/65 mb-1 font-mono-telemetry">
            Rescue Agents: <span className="text-[#F97316]">{formState.rescueCount}</span>
          </label>
          <input
            type="number"
            min={1}
            max={10}
            disabled={isRunning}
            value={formState.rescueCount}
            onChange={(e) => handleChange("rescueCount", parseInt(e.target.value) || 1)}
            className="w-full bg-[#0B1220] border border-[#22D3EE]/20 rounded px-2 py-1 text-xs text-[#F8FAFC] focus:outline-none focus:border-[#22D3EE] disabled:opacity-40"
          />
        </div>

        <div>
          <label className="block text-xs text-[#F8FAFC]/65 mb-1 font-mono-telemetry">
            Obstacles: <span className="text-[#F8FAFC]">{formState.blockedPercent}%</span>
          </label>
          <input
            type="range"
            min={0}
            max={40}
            disabled={isRunning}
            value={formState.blockedPercent}
            onChange={(e) => handleChange("blockedPercent", parseInt(e.target.value))}
            className="w-full accent-[#22D3EE] disabled:opacity-40"
          />
        </div>

        <div>
          <label className="block text-xs text-[#F8FAFC]/65 mb-1 font-mono-telemetry">
            Hazard Zones: <span className="text-[#EF4444]">{formState.dangerPercent}%</span>
          </label>
          <input
            type="range"
            min={0}
            max={30}
            disabled={isRunning}
            value={formState.dangerPercent}
            onChange={(e) => handleChange("dangerPercent", parseInt(e.target.value))}
            className="w-full accent-[#EF4444] disabled:opacity-40"
          />
        </div>
      </form>
    </div>
  );
};
