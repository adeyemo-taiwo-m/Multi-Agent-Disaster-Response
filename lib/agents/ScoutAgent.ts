import { BaseAgent } from "./BaseAgent";
import { Cell, Grid } from "../types";
import { MessageBus } from "../messageBus";
import { getNeighbors, isWalkable } from "../grid";

export class ScoutAgent extends BaseAgent {
  private visited: Set<string> = new Set();
  private perceivedVictims: Cell[] = [];

  private randomFn: () => number;

  constructor(id: string, x: number, y: number, randomFn: () => number = Math.random) {
    super(id, "scout", x, y);
    this.randomFn = randomFn;
    this.visited.add(`${x},${y}`);
  }

  perceive(grid: Grid, _bus: MessageBus): void {
    const neighbors = getNeighbors(grid, this.x, this.y);
    this.perceivedVictims = [];

    // Inspect adjacent cells and current cell for victims
    const currentCell = grid[this.y]?.[this.x];
    if (currentCell && currentCell.status === "hasVictim") {
      this.perceivedVictims.push(currentCell);
    }

    for (const neighbor of neighbors) {
      if (neighbor.status === "hasVictim") {
        this.perceivedVictims.push(neighbor);
      }
    }
  }

  decide(): void {
    // If victim perceived, announce it
    if (this.perceivedVictims.length > 0) {
      this.status = "busy";
      return;
    }

    this.status = "moving";
  }

  act(grid: Grid, bus: MessageBus): void {
    // Announce all perceived victims
    if (this.perceivedVictims.length > 0) {
      for (const victim of this.perceivedVictims) {
        const victimId = `victim-${victim.x}-${victim.y}`;
        // Check if message already broadcasted for this victim
        const existingMessages = bus.getAll();
        const alreadyReported = existingMessages.some(
          (m) =>
            m.type === "victim_found" &&
            m.payload.x === victim.x &&
            m.payload.y === victim.y
        );

        if (!alreadyReported) {
          bus.send({
            from: this.id,
            type: "victim_found",
            payload: {
              x: victim.x,
              y: victim.y,
              victimId,
            },
          });
        }
      }
    }

    // Move to explore unexplored neighbors or random walk
    const neighbors = getNeighbors(grid, this.x, this.y).filter(isWalkable);
    const unvisited = neighbors.filter((n) => !this.visited.has(`${n.x},${n.y}`));

    let targetCell: Cell | undefined;
    if (unvisited.length > 0) {
      targetCell = unvisited[Math.floor(this.randomFn() * unvisited.length)];
    } else if (neighbors.length > 0) {
      targetCell = neighbors[Math.floor(this.randomFn() * neighbors.length)];
    }

    if (targetCell) {
      this.x = targetCell.x;
      this.y = targetCell.y;
      this.visited.add(`${this.x},${this.y}`);
    }
  }
}
