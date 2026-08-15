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

export const Grid: React.FC<GridProps> = ({
  grid,
  agents,
  children,
  highlightedCell,
}) => {
  const gridSize = grid.length;

  return (
    <div className="relative w-full aspect-square bg-[rgb(var(--bg-primary))] border border-[rgb(var(--accent)/0.15)] rounded-md p-1.5 overflow-hidden">
      {/* Background Cell Grid — 1px gap for continuous telemetry instrument surface (§5) */}
      <div
        className="w-full h-full grid gap-px"
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

      {/* Overlay area for agent markers and telemetry spotlight events */}
      <div className="absolute inset-1.5 pointer-events-none">
        {children}

        {highlightedCell && (
          <div
            className={`absolute pointer-events-none z-20 transition-all duration-150 ring-2 rounded-[2px] ${
              highlightedCell.severity === "warning"
                ? "ring-[rgb(var(--emergency))]"
                : highlightedCell.severity === "success"
                ? "ring-[rgb(var(--success))]"
                : "ring-[rgb(var(--accent))]"
            }`}
            style={{
              left: `${(highlightedCell.x / gridSize) * 100}%`,
              top: `${(highlightedCell.y / gridSize) * 100}%`,
              width: `${(1 / gridSize) * 100}%`,
              height: `${(1 / gridSize) * 100}%`,
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

export default Grid;