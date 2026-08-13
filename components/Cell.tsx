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
        return "bg-[#16243A] border-transparent";
      case "danger":
        return "bg-[#EF4444]/70 border border-[#EF4444]";
      case "safe":
        return "bg-[#22C55E]/25 border border-[#22C55E]/40";
      case "hasVictim":
        return "bg-[#FACC15] border border-[#FACC15] animate-victim-pulse";
      case "empty":
      default:
        return "bg-[#16243A]/40 border border-[#22D3EE]/10";
    }
  };

  return (
    <div
      className={`relative w-full h-full rounded-[2px] transition-colors duration-150 flex items-center justify-center ${getStatusClasses()}`}
      title={`Cell (${x}, ${y}) - ${status}`}
      aria-label={`Cell at ${x},${y}, status: ${status}`}
    >
      {status === "safe" && (
        <div className="w-1.5 h-1.5 rounded-full bg-[#22C55E]/60" />
      )}
      {status === "hasVictim" && (
        <div className="w-2 h-2 rounded-sm bg-[#0B1220]" />
      )}
    </div>
  );
};
