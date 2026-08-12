"use client";

import React from "react";
import { AgentState, Grid as GridType } from "../lib/types";
import { Cell } from "./Cell";
import { AgentMarker } from "./AgentMarker";

interface GridProps {
  grid: GridType;
  agents: AgentState[];
}

export const Grid: React.FC<GridProps> = ({ grid, agents }) => {
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

      {/* Overlay Agent Markers */}
      <div className="absolute inset-2 pointer-events-none">
        {agents.map((agent) => (
          <AgentMarker key={agent.id} agent={agent} gridSize={gridSize} />
        ))}
      </div>
    </div>
  );
};
