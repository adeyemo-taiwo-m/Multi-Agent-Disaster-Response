import {
  Cell,
  Grid,
  SimulationConfig,
  SimulationStats,
} from "./types";
import { generateGrid } from "./grid";
import { createSeededRandom, RandomFn } from "./random";
import { MessageBus } from "./messageBus";
import { BaseAgent } from "./agents/BaseAgent";
import { ScoutAgent } from "./agents/ScoutAgent";
import { RescueAgent } from "./agents/RescueAgent";
import { CoordinatorAgent } from "./agents/CoordinatorAgent";
import { EvacueeAgent } from "./agents/EvacueeAgent";

export class SimulationEngine {
  grid: Grid;
  agents: BaseAgent[];
  bus: MessageBus;
  stats: SimulationStats;
  tickCount: number;
  maxTicks: number;
  config: SimulationConfig;

  constructor(config: SimulationConfig) {
    this.config = config;
    const gridRandomFn: RandomFn =
      config.seed !== undefined ? createSeededRandom(config.seed) : Math.random;
    this.grid = generateGrid(config.gridSize, {
      blockedPercent: config.blockedPercent,
      dangerPercent: config.dangerPercent,
      victimCount: config.victimCount,
      randomFn: gridRandomFn,
    });
    this.bus = new MessageBus();
    this.tickCount = 0;
    this.maxTicks = config.maxTicks ?? config.gridSize * 20;

    // Collect victim locations to instantiate EvacueeAgents
    const victimCells: Cell[] = [];
    for (let y = 0; y < this.grid.length; y++) {
      for (let x = 0; x < this.grid[y].length; x++) {
        if (this.grid[y][x].status === "hasVictim") {
          victimCells.push(this.grid[y][x]);
        }
      }
    }

    this.agents = [];

    const scoutRandomFn: RandomFn =
      config.seed !== undefined ? createSeededRandom(config.seed + 1) : Math.random;

    // Instantiate Scout Agents (spawn in safe corner 0,0)
    for (let i = 0; i < config.scoutCount; i++) {
      this.agents.push(new ScoutAgent(`scout-${i + 1}`, 0, 0, scoutRandomFn));
    }

    // Instantiate Rescue Agents (spawn in safe corner 1,0)
    for (let i = 0; i < config.rescueCount; i++) {
      this.agents.push(new RescueAgent(`rescuer-${i + 1}`, 1, 0));
    }

    // Instantiate Coordinator Agent (spawn in safe corner 0,1)
    this.agents.push(new CoordinatorAgent("coordinator-1", 0, 1));

    // Instantiate Evacuee Agents on victim locations
    victimCells.forEach((vc, idx) => {
      this.agents.push(new EvacueeAgent(`evacuee-${idx + 1}`, vc.x, vc.y));
    });

    this.stats = {
      tick: 0,
      victimsTotal: victimCells.length,
      victimsRescued: 0,
      messagesSent: 0,
      startedAt: Date.now(),
    };
  }

  tick(): void {
    if (this.isComplete()) return;

    this.tickCount++;

    // 1. Perceive phase for all agents
    for (const agent of this.agents) {
      agent.perceive(this.grid, this.bus);
    }

    // 2. Decide phase in fixed, stable order (executing claim tie-breaker for rescuers)
    for (const agent of this.agents) {
      if (agent instanceof RescueAgent) {
        agent.decideWithBus(this.grid, this.bus);
      } else {
        agent.decide();
      }
    }

    // 3. Act phase in fixed order
    for (const agent of this.agents) {
      if (agent instanceof CoordinatorAgent) {
        agent.actWithAgents(this.grid, this.bus, this.agents);
      } else {
        agent.act(this.grid, this.bus);
      }
    }

    // Update simulation stats
    let rescuedCount = 0;
    for (let y = 0; y < this.grid.length; y++) {
      for (let x = 0; x < this.grid[y].length; x++) {
        // Count evacuees marked rescued or safe cells originally containing victims
        const agent = this.agents.find(
          (a) => a.role === "evacuee" && a.x === x && a.y === y && a.status === "rescued"
        );
        if (agent) rescuedCount++;
      }
    }

    // Also count rescued messages
    const rescuedMessages = this.bus
      .getAll()
      .filter((m) => m.type === "victim_rescued");
    const uniqueRescuedIds = new Set(
      rescuedMessages.map((m) => m.payload.victimId)
    );

    this.stats.tick = this.tickCount;
    this.stats.victimsRescued = Math.max(rescuedCount, uniqueRescuedIds.size);
    this.stats.messagesSent = this.bus.count();

    // Check completion state
    if (this.isComplete() && !this.stats.endedAt) {
      this.stats.endedAt = Date.now();

      const unreachableMsgs = this.bus
        .getAll()
        .filter((m) => m.type === "unreachable");
      const unreachableCount = new Set(unreachableMsgs.map((m) => m.payload.victimId)).size;

      if (this.stats.victimsRescued >= this.stats.victimsTotal && this.stats.victimsTotal > 0) {
        this.stats.endReason = "all_rescued";
      } else if (this.tickCount >= this.maxTicks) {
        this.stats.endReason = "timed_out";
        this.stats.unreachableCount = unreachableCount;
      } else {
        this.stats.endReason = "unreachable_victims";
        this.stats.unreachableCount = unreachableCount;
      }
    }
  }

  isComplete(): boolean {
    if (this.stats.victimsTotal > 0 && this.stats.victimsRescued >= this.stats.victimsTotal) {
      return true;
    }

    if (this.tickCount >= this.maxTicks) {
      return true;
    }

    // Check if every un-rescued victim has been marked unreachable
    const allMsgs = this.bus.getAll();
    const rescuedIds = new Set(
      allMsgs.filter((m) => m.type === "victim_rescued").map((m) => m.payload.victimId)
    );
    const unreachableIds = new Set(
      allMsgs.filter((m) => m.type === "unreachable").map((m) => m.payload.victimId)
    );

    const victimMsgs = allMsgs.filter((m) => m.type === "victim_found" && m.payload.victimId);
    if (victimMsgs.length > 0) {
      const allHandled = victimMsgs.every((m) => {
        const id = m.payload.victimId!;
        return rescuedIds.has(id) || unreachableIds.has(id);
      });

      if (allHandled && rescuedIds.size + unreachableIds.size >= this.stats.victimsTotal) {
        return true;
      }
    }

    return false;
  }

  reset(): void {
    const newEngine = new SimulationEngine(this.config);
    this.grid = newEngine.grid;
    this.agents = newEngine.agents;
    this.bus = newEngine.bus;
    this.stats = newEngine.stats;
    this.tickCount = 0;
  }
}
