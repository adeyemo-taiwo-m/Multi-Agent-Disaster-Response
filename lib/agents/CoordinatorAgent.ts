import { BaseAgent } from "./BaseAgent";
import { Grid } from "../types";
import { MessageBus } from "../messageBus";

export class CoordinatorAgent extends BaseAgent {
  constructor(id: string, x: number, y: number) {
    super(id, "coordinator", x, y);
    this.status = "idle";
  }

  perceive(_grid: Grid, _bus: MessageBus): void {
    // Coordinator stays operational
    this.status = "idle";
  }

  decide(): void {
    // Decision handled with active agent pool in act
  }

  actWithAgents(_grid: Grid, bus: MessageBus, allAgents: BaseAgent[]): void {
    const allMessages = bus.getAll();

    // Collect claimed, rescued, or unreachable victims
    const claimedOrDone = new Set<string>();
    allMessages.forEach((m) => {
      if (
        (m.type === "claim_victim" ||
          m.type === "victim_rescued" ||
          m.type === "unreachable" ||
          m.type === "task_assignment") &&
        m.payload.victimId
      ) {
        claimedOrDone.add(m.payload.victimId);
      }
    });

    // Unassigned victim_found messages
    const unassignedVictimMsgs = allMessages.filter(
      (m) =>
        m.type === "victim_found" &&
        m.payload.victimId &&
        !claimedOrDone.has(m.payload.victimId)
    );

    if (unassignedVictimMsgs.length === 0) return;

    // Idle rescue agents
    const idleRescuers = allAgents.filter(
      (a) => a.role === "rescuer" && a.status === "idle" && !a.claimedVictimId
    );

    if (idleRescuers.length === 0) return;

    // Assign closest victim to idle rescuers
    for (let i = 0; i < Math.min(unassignedVictimMsgs.length, idleRescuers.length); i++) {
      const victimMsg = unassignedVictimMsgs[i];
      const rescuer = idleRescuers[i];

      if (victimMsg.payload.victimId && victimMsg.payload.x !== undefined && victimMsg.payload.y !== undefined) {
        bus.send({
          from: this.id,
          type: "task_assignment",
          payload: {
            assignedAgentId: rescuer.id,
            victimId: victimMsg.payload.victimId,
            x: victimMsg.payload.x,
            y: victimMsg.payload.y,
          },
        });
      }
    }
  }

  act(_grid: Grid, _bus: MessageBus): void {
    // Default act method; actWithAgents is invoked by SimulationEngine when agent array is present
  }
}
