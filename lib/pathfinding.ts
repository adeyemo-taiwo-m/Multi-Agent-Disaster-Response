import { Grid } from "./types";
import { getNeighbors, isWalkable } from "./grid";

export interface Point {
  x: number;
  y: number;
}

export function findPath(grid: Grid, start: Point, target: Point): Point[] {
  if (start.x === target.x && start.y === target.targetY) return [];

  const queue: Point[] = [start];
  const visited = new Set<string>();
  const parentMap = new Map<string, Point>();

  const startKey = `${start.x},${start.y}`;
  visited.add(startKey);

  let found = false;

  while (queue.length > 0) {
    const current = queue.shift()!;

    if (current.x === target.x && current.y === target.y) {
      found = true;
      break;
    }

    const neighbors = getNeighbors(grid, current.x, current.y);
    for (const neighbor of neighbors) {
      // Cell must be walkable unless it is the target cell itself
      const isTargetCell = neighbor.x === target.x && neighbor.y === target.y;
      if (!isWalkable(neighbor) && !isTargetCell) continue;

      const key = `${neighbor.x},${neighbor.y}`;
      if (!visited.has(key)) {
        visited.add(key);
        parentMap.set(key, current);
        queue.push({ x: neighbor.x, y: neighbor.y });
      }
    }
  }

  if (!found) {
    return []; // Target is unreachable
  }

  // Reconstruct path from target back to start
  const path: Point[] = [];
  let currKey = `${target.x},${target.y}`;

  while (currKey !== startKey) {
    const [x, y] = currKey.split(",").map(Number);
    path.unshift({ x, y });

    const parent = parentMap.get(currKey);
    if (!parent) break;
    currKey = `${parent.x},${parent.y}`;
  }

  return path;
}
