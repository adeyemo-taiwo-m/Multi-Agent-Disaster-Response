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
        // Obstacles read as "absence" / secondary surface (§2)
        return "bg-[rgb(var(--bg-secondary))] border border-transparent";
      case "danger":
        // Danger cells: ~70% fill, full-opacity 1px danger border (§3)
        return "bg-[rgb(var(--danger)/0.70)] border border-[rgb(var(--danger))]";
      case "safe":
        // Safe zones: ~25% fill, calm subtle border (§3)
        return "bg-[rgb(var(--success)/0.25)] border border-[rgb(var(--success)/0.30)]";
      case "hasVictim":
        // Victim cells: full opacity victim yellow with slow attention pulse (§3, §6)
        return "bg-[rgb(var(--victim))] border border-[rgb(var(--victim))] animate-victim-pulse";
      case "empty":
      default:
        // Empty cells: derived shade between page bg and panel chrome (§2)
        return "bg-[rgb(var(--bg-secondary)/0.50)] border border-[rgb(var(--accent)/0.08)]";
    }
  };

  return (
    <div
      className={`relative w-full h-full rounded-[2px] transition-colors duration-150 flex items-center justify-center ${getStatusClasses()}`}
      title={`Grid Cell (${x}, ${y}) — Status: ${status}`}
      aria-label={`Grid Cell at ${x},${y}, status: ${status}`}
    >
      {status === "safe" && (
        <div className="w-1.5 h-1.5 rounded-full bg-[rgb(var(--success)/0.50)]" />
      )}
      {status === "hasVictim" && (
        <div className="w-2 h-2 rounded-[2px] bg-[rgb(var(--bg-primary))]" />
      )}
      {status === "danger" && (
        <div className="w-1 h-1 rounded-full bg-[rgb(var(--bg-primary)/0.60)]" />
      )}
    </div>
  );
};

export default Cell;