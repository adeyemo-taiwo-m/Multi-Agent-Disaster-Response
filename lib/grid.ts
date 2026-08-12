import { Cell, Grid } from "./types";

export function generateGrid(
  size: number,
  options: {
    blockedPercent: number;
    dangerPercent: number;
    victimCount: number;
  }
): Grid {
  const grid: Grid = [];

  // Initialize empty grid
  for (let y = 0; y < size; y++) {
    const row: Cell[] = [];
    for (let x = 0; x < size; x++) {
      row.push({
        x,
        y,
        status: "empty",
      });
    }
    grid.push(row);
  }

  // Safe zones (top-left 2x2 corner designated as evacuation base)
  const safeCoords = [
    { x: 0, y: 0 },
    { x: 1, y: 0 },
    { x: 0, y: 1 },
    { x: 1, y: 1 },
  ];

  safeCoords.forEach((coord) => {
    if (coord.x < size && coord.y < size) {
      grid[coord.y][coord.x].status = "safe";
    }
  });

  const availableCoords: { x: number; y: number }[] = [];
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (grid[y][x].status === "empty") {
        availableCoords.push({ x, y });
      }
    }
  }

  // Shuffle available coordinates deterministically/randomly
  const shuffled = [...availableCoords].sort(() => Math.random() - 0.5);

  const totalEmpty = shuffled.length;
  const numBlocked = Math.floor(totalEmpty * (options.blockedPercent / 100));
  const numDanger = Math.floor(totalEmpty * (options.dangerPercent / 100));
  const numVictims = Math.min(options.victimCount, totalEmpty - numBlocked - numDanger);

  let index = 0;

  // Place blocked obstacles
  for (let i = 0; i < numBlocked && index < shuffled.length; i++) {
    const c = shuffled[index++];
    grid[c.y][c.x].status = "blocked";
  }

  // Place danger zones
  for (let i = 0; i < numDanger && index < shuffled.length; i++) {
    const c = shuffled[index++];
    grid[c.y][c.x].status = "danger";
  }

  // Place victims
  for (let i = 0; i < numVictims && index < shuffled.length; i++) {
    const c = shuffled[index++];
    grid[c.y][c.x].status = "hasVictim";
  }

  return grid;
}

export function getCell(grid: Grid, x: number, y: number): Cell | undefined {
  if (y >= 0 && y < grid.length && x >= 0 && x < grid[0].length) {
    return grid[y][x];
  }
  return undefined;
}

export function getNeighbors(grid: Grid, x: number, y: number): Cell[] {
  const neighbors: Cell[] = [];
  const directions = [
    { x: 0, y: -1 }, // Up
    { x: 1, y: 0 },  // Right
    { x: 0, y: 1 },  // Down
    { x: -1, y: 0 }, // Left
  ];

  for (const dir of directions) {
    const nx = x + dir.x;
    const ny = y + dir.y;
    const cell = getCell(grid, nx, ny);
    if (cell) {
      neighbors.push(cell);
    }
  }

  return neighbors;
}

export function isWalkable(cell: Cell): boolean {
  return cell.status !== "blocked";
}

export function markRescued(grid: Grid, x: number, y: number): void {
  const cell = getCell(grid, x, y);
  if (cell && cell.status === "hasVictim") {
    cell.status = "safe";
  }
}
