"use client";

import React from "react";
import { AgentState } from "../lib/types";
import { Shield, Eye, Radio, UserCheck } from "lucide-react";

interface AgentMarkerProps {
  agent: AgentState;
  gridSize: number;
}

export const AgentMarker: React.FC<AgentMarkerProps> = ({ agent, gridSize }) => {
  const { role, x, y, status, id } = agent;

  // Percentage positioning for CSS smooth glide transition
  const leftPercent = (x / gridSize) * 100;
  const topPercent = (y / gridSize) * 100;
  const sizePercent = (1 / gridSize) * 100;

  const renderRoleIcon = () => {
    switch (role) {
      case "scout":
        return (
          <div className="w-full h-full rounded-full border-2 border-[#22D3EE] bg-[#0B1220]/80 flex items-center justify-center text-[#22D3EE] shadow-[0_0_8px_rgba(34,211,238,0.5)]">
            <Eye className="w-3/5 h-3/5" />
          </div>
        );
      case "rescuer":
        return (
          <div className="w-full h-full rounded-md bg-[#F97316] text-[#0B1220] flex items-center justify-center font-bold shadow-[0_0_8px_rgba(249,115,22,0.6)] transform rotate-45">
            <Shield className="w-3/5 h-3/5 transform -rotate-45" />
          </div>
        );
      case "coordinator":
        return (
          <div className="w-full h-full rounded-sm bg-[#FACC15] text-[#0B1220] flex items-center justify-center font-bold shadow-[0_0_8px_rgba(250,204,21,0.6)] transform rotate-45">
            <Radio className="w-3/5 h-3/5 transform -rotate-45" />
          </div>
        );
      case "evacuee":
      default:
        if (status === "rescued") {
          return (
            <div className="w-full h-full rounded-sm bg-[#22C55E] text-[#0B1220] flex items-center justify-center shadow-[0_0_6px_rgba(34,197,94,0.5)]">
              <UserCheck className="w-3/5 h-3/5" />
            </div>
          );
        }
        return (
          <div className="w-full h-full rounded-sm bg-[#F8FAFC]/60 border border-[#F8FAFC]/40 flex items-center justify-center" />
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
      title={`${id} (${role}) - ${status}`}
    >
      {renderRoleIcon()}
    </div>
  );
};
