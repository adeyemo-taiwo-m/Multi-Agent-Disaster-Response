import { AgentRole, AgentState, Grid } from "../types";
import { MessageBus } from "../messageBus";

export abstract class BaseAgent {
  id: string;
  role: AgentRole;
  x: number;
  y: number;
  status: AgentState["status"];
  targetX?: number;
  targetY?: number;
  claimedVictimId?: string;

  constructor(id: string, role: AgentRole, x: number, y: number) {
    this.id = id;
    this.role = role;
    this.x = x;
    this.y = y;
    this.status = "idle";
  }

  getState(): AgentState {
    return {
      id: this.id,
      role: this.role,
      x: this.x,
      y: this.y,
      status: this.status,
      targetX: this.targetX,
      targetY: this.targetY,
      claimedVictimId: this.claimedVictimId,
    };
  }

  abstract perceive(grid: Grid, bus: MessageBus): void;
  abstract decide(): void;
  abstract act(grid: Grid, bus: MessageBus): void;
}
