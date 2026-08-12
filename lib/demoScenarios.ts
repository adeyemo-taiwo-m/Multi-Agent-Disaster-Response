import { SimulationConfig } from "./types";

export const DEMO_SEED = 42;

export const DEMO_SCENARIO: SimulationConfig = {
  gridSize: 15,
  scoutCount: 2,
  rescueCount: 3,
  victimCount: 8,
  blockedPercent: 14,
  dangerPercent: 8,
  maxTicks: 300,
};

export default DEMO_SCENARIO;
