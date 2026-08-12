"use client";

import React from "react";
import { AgentState, Grid as GridType } from "../lib/types";
import { Cell } from "./Cell";
import { AgentMarker } from "./AgentMarker";

interface GridProps {
  grid: GridType;
  agents: AgentState[];
  children?: React.ReactNode;
  highlightedCell?: { x: number; y: number; severity?: string } | null;
}

export const Grid: React.FC<GridProps> = ({ grid, agents, children, highlightedCell }) => {
  const gridSize = grid.length;

  return (
    <div className="relative w-full aspect-square bg-[#0B1220] border border-[#22D3EE]/20 rounded-md p-2 shadow-[0_0_20px_rgba(11,18,32,0.8)] overflow-hidden">
      {/* Background Cell Grid */}
      <div
        className="w-full h-full grid gap-0.5"
        style={{
          gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
          gridTemplateRows: `repeat(${gridSize}, minmax(0, 1fr))`,
        }}
      >
        {grid.map((row, y) =>
          row.map((cell, x) => (
            <Cell key={`cell-${x}-${y}`} cell={cell} gridSize={gridSize} />
          ))
        )}
      </div>

      {/* Overlay area for event spotlights and agent markers */}
      <div className="absolute inset-2 pointer-events-none">
        {/* Render custom overlays such as EventSpotlight */}
        {children}

        {highlightedCell && (
          <div
            className={`absolute rounded-full pointer-events-none z-20 animate-pulse ring-4 ${
              highlightedCell.severity === "warning"
                ? "ring-[#F97316]/60"
                : highlightedCell.severity === "success"
                ? "ring-[#22C55E]/60"
                : "ring-[#22D3EE]/60"
            }`}
            style={{
              left: `${(highlightedCell.x / gridSize) * 100}%`,
              top: `${(highlightedCell.y / gridSize) * 100}%`,
              width: `${(1 / gridSize) * 100}%`,
              height: `${(1 / gridSize) * 100}%`,
              transform: "translate(-0%, -0%)",
            }}
          />
        )}

        {agents.map((agent) => (
          <AgentMarker key={agent.id} agent={agent} gridSize={gridSize} />
        ))}
      </div>
    </div>
  );
};
