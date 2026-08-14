"use client";

import React from "react";
import { Cell as CellType } from "../lib/types";

interface CellProps {
  cell: CellType;
  gridSize?: number;
}

export const Cell: React.FC<CellProps> = ({ cell }) => {
  const { status, x, y } = cell;

  const getStatusClasses = () => {
    switch (status) {
      case "blocked":
        // Obstacles read as "absence" / secondary surface without border
        return "bg-[#16243A] border border-transparent";
      case "danger":
        // Danger cells: ~70% fill, full-opacity 1px danger border
        return "bg-[#EF4444]/70 border border-[#EF4444]";
      case "safe":
        // Safe zones: ~25% fill, calm subtle border
        return "bg-[#22C55E]/25 border border-[#22C55E]/30";
      case "hasVictim":
        // Victim cells: full opacity victim yellow with slow 1.6s attention pulse
        return "bg-[#FACC15] border border-[#FACC15] animate-victim-pulse";
      case "empty":
      default:
        // Empty cells: derived shade between page bg and panel chrome
        return "bg-[#16243A]/50 border border-[rgba(34,211,238,0.08)]";
    }
  };

  return (
    <div
      className={`relative w-full h-full rounded-[2px] transition-colors duration-150 flex items-center justify-center ${getStatusClasses()}`}
      title={`Grid Cell (${x}, ${y}) — Status: ${status}`}
      aria-label={`Grid Cell at ${x},${y}, status: ${status}`}
    >
      {status === "safe" && (
        <div className="w-1.5 h-1.5 rounded-full bg-[#22C55E]/50" />
      )}
      {status === "hasVictim" && (
        <div className="w-2 h-2 rounded-[2px] bg-[#0B1220]" />
      )}
      {status === "danger" && (
        <div className="w-1 h-1 rounded-full bg-[#0B1220]/60" />
      )}
    </div>
  );
};

export default Cell;
