"use client";

import React from "react";
import { AgentState } from "../lib/types";

interface AgentMarkerProps {
  agent: AgentState;
  gridSize: number;
}

export const AgentMarker: React.FC<AgentMarkerProps> = ({ agent, gridSize }) => {
  const { role, x, y, status, id } = agent;

  // Percentage positioning for CSS smooth glide transition (200ms ease-in-out)
  const leftPercent = (x / gridSize) * 100;
  const topPercent = (y / gridSize) * 100;
  const sizePercent = (1 / gridSize) * 100;

  const renderRoleShape = () => {
    switch (role) {
      case "scout":
        // Scout: small circle, hollow ring — "still searching"
        return (
          <div className="w-full h-full flex items-center justify-center p-0.5">
            <div className="w-4/5 h-4/5 rounded-full border-2 border-[#22D3EE] bg-[#0B1220]/60 flex items-center justify-center">
              <div className="w-1 h-1 rounded-full bg-[#22D3EE]" />
            </div>
          </div>
        );

      case "rescuer":
        // Rescuer: emergency orange, filled triangle pointing toward response direction
        return (
          <div className="w-full h-full flex items-center justify-center p-0.5">
            <svg viewBox="0 0 24 24" className="w-4/5 h-4/5 text-[#F97316] fill-current">
              <polygon points="12,3 22,21 2,21" />
            </svg>
          </div>
        );

      case "coordinator":
        // Coordinator: filled diamond shape, stays stationary
        return (
          <div className="w-full h-full flex items-center justify-center p-0.5">
            <div className="w-3/5 h-3/5 bg-[#FACC15] rotate-45 rounded-[1px] flex items-center justify-center">
              <div className="w-1.5 h-1.5 bg-[#0B1220] rounded-full" />
            </div>
          </div>
        );

      case "evacuee":
      default:
        // Evacuee: small square, upgrades to --success filled square when rescued
        if (status === "rescued") {
          return (
            <div className="w-full h-full flex items-center justify-center p-0.5">
              <div className="w-3/5 h-3/5 bg-[#22C55E] rounded-[2px] flex items-center justify-center text-[#0B1220] font-bold text-[8px]">
                ✓
              </div>
            </div>
          );
        }
        return (
          <div className="w-full h-full flex items-center justify-center p-0.5">
            <div className="w-3/5 h-3/5 bg-[#F8FAFC]/65 border border-[#F8FAFC]/40 rounded-[2px]" />
          </div>
        );
    }
  };

  return (
    <div
      className="absolute p-0.5 transition-all duration-200 ease-in-out pointer-events-none z-10"
      style={{
        left: `${leftPercent}%`,
        top: `${topPercent}%`,
        width: `${sizePercent}%`,
        height: `${sizePercent}%`,
      }}
      title={`${id} (${role}) — ${status}`}
      aria-label={`${role} agent ${id}, status: ${status}, at (${x}, ${y})`}
    >
      {renderRoleShape()}
    </div>
  );
};

export default AgentMarker;
