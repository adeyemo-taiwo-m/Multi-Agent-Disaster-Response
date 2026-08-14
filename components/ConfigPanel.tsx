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
    <div className="bg-[#16243A] border border-[rgba(34,211,238,0.12)] rounded-md p-4 space-y-3 text-sm">
      {/* Panel Header */}
      <div className="flex items-center justify-between border-b border-[rgba(34,211,238,0.12)] pb-2">
        <h2 className="font-mono text-xs uppercase tracking-wider text-[#22D3EE] font-semibold flex items-center gap-1.5">
          <Sliders className="w-3.5 h-3.5" />
          Environment Setup
        </h2>
        {isRunning && (
          <span className="text-[10px] font-mono text-[#F97316] bg-[#F97316]/10 px-2 py-0.5 rounded-md border border-[#F97316]/25">
            LOCKED (ACTIVE)
          </span>
        )}
      </div>

      {/* Recessed Form Controls (§7) */}
      <form onSubmit={handleApply} className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-[#F8FAFC]/65 mb-1 font-mono">
            Grid Dimensions: <span className="text-[#F8FAFC] font-semibold">{formState.gridSize}x{formState.gridSize}</span>
          </label>
          <input
            type="range"
            min={10}
            max={25}
            disabled={isRunning}
            value={formState.gridSize}
            onChange={(e) => handleChange("gridSize", parseInt(e.target.value, 10))}
            className="w-full accent-[#22D3EE] bg-[#0B1220] h-1.5 rounded-md cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed focus-console"
            aria-label="Grid Dimension Size"
          />
        </div>

        <div>
          <label className="block text-xs text-[#F8FAFC]/65 mb-1 font-mono">
            Victim Evacuees: <span className="text-[#FACC15] font-semibold">{formState.victimCount}</span>
          </label>
          <input
            type="number"
            min={1}
            max={30}
            disabled={isRunning}
            value={formState.victimCount}
            onChange={(e) => handleChange("victimCount", parseInt(e.target.value, 10) || 1)}
            className="w-full bg-[#0B1220] border border-[rgba(34,211,238,0.15)] rounded-md px-2.5 py-1 text-xs font-mono text-[#F8FAFC] focus-console disabled:opacity-40 disabled:text-[#F8FAFC]/40 disabled:cursor-not-allowed"
            aria-label="Victim Evacuees Count"
          />
        </div>

        <div>
          <label className="block text-xs text-[#F8FAFC]/65 mb-1 font-mono">
            Scout Agents: <span className="text-[#22D3EE] font-semibold">{formState.scoutCount}</span>
          </label>
          <input
            type="number"
            min={1}
            max={10}
            disabled={isRunning}
            value={formState.scoutCount}
            onChange={(e) => handleChange("scoutCount", parseInt(e.target.value, 10) || 1)}
            className="w-full bg-[#0B1220] border border-[rgba(34,211,238,0.15)] rounded-md px-2.5 py-1 text-xs font-mono text-[#F8FAFC] focus-console disabled:opacity-40 disabled:text-[#F8FAFC]/40 disabled:cursor-not-allowed"
            aria-label="Scout Agents Count"
          />
        </div>

        <div>
          <label className="block text-xs text-[#F8FAFC]/65 mb-1 font-mono">
            Rescue Agents: <span className="text-[#F97316] font-semibold">{formState.rescueCount}</span>
          </label>
          <input
            type="number"
            min={1}
            max={10}
            disabled={isRunning}
            value={formState.rescueCount}
            onChange={(e) => handleChange("rescueCount", parseInt(e.target.value, 10) || 1)}
            className="w-full bg-[#0B1220] border border-[rgba(34,211,238,0.15)] rounded-md px-2.5 py-1 text-xs font-mono text-[#F8FAFC] focus-console disabled:opacity-40 disabled:text-[#F8FAFC]/40 disabled:cursor-not-allowed"
            aria-label="Rescue Agents Count"
          />
        </div>

        <div>
          <label className="block text-xs text-[#F8FAFC]/65 mb-1 font-mono">
            Obstacles: <span className="text-[#F8FAFC] font-semibold">{formState.blockedPercent}%</span>
          </label>
          <input
            type="range"
            min={0}
            max={40}
            disabled={isRunning}
            value={formState.blockedPercent}
            onChange={(e) => handleChange("blockedPercent", parseInt(e.target.value, 10))}
            className="w-full accent-[#22D3EE] bg-[#0B1220] h-1.5 rounded-md cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed focus-console"
            aria-label="Obstacle Percentage"
          />
        </div>

        <div>
          <label className="block text-xs text-[#F8FAFC]/65 mb-1 font-mono">
            Hazard Zones: <span className="text-[#EF4444] font-semibold">{formState.dangerPercent}%</span>
          </label>
          <input
            type="range"
            min={0}
            max={30}
            disabled={isRunning}
            value={formState.dangerPercent}
            onChange={(e) => handleChange("dangerPercent", parseInt(e.target.value, 10))}
            className="w-full accent-[#EF4444] bg-[#0B1220] h-1.5 rounded-md cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed focus-console"
            aria-label="Hazard Zone Percentage"
          />
        </div>
      </form>
    </div>
  );
};

export default ConfigPanel;
