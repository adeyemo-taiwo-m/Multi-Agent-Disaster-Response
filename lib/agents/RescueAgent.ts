import { BaseAgent } from "./BaseAgent";
import { Grid } from "../types";
import { MessageBus } from "../messageBus";
import { findPath } from "../pathfinding";
import { markRescued } from "../grid";

export class RescueAgent extends BaseAgent {
  private currentPath: { x: number; y: number }[] = [];
  private pendingClaimVictim: { victimId: string; x: number; y: number } | null = null;

  constructor(id: string, x: number, y: number) {
    super(id, "rescuer", x, y);
  }

  perceive(grid: Grid, bus: MessageBus): void {
    // If currently moving or busy with a valid victim target, check if victim was already rescued by someone else
    if (this.claimedVictimId) {
      const messages = bus.getAll();
      const isAlreadyRescued = messages.some(
        (m) =>
          m.type === "victim_rescued" && m.payload.victimId === this.claimedVictimId
      );

      if (isAlreadyRescued) {
        this.claimedVictimId = undefined;
        this.targetX = undefined;
        this.targetY = undefined;
        this.currentPath = [];
        this.status = "idle";
      }
    }
  }

  decideWithBus(grid: Grid, bus: MessageBus): void {
    if (this.status !== "idle" && this.claimedVictimId) return;

    // Check latest bus state for unclaimed victim_found messages or task_assignments
    const allMessages = bus.getAll();

    // Collect all claimed or unreachable victim IDs
    const claimedOrDoneVictims = new Set<string>();
    allMessages.forEach((m) => {
      if (
        (m.type === "claim_victim" || m.type === "victim_rescued" || m.type === "unreachable") &&
        m.payload.victimId
      ) {
        claimedOrDoneVictims.add(m.payload.victimId);
      }
    });

    // Check if task assignment was assigned to this specific agent
    const taskAssignment = allMessages.find(
      (m) =>
        m.type === "task_assignment" &&
        m.payload.assignedAgentId === this.id &&
        m.payload.victimId &&
        !claimedOrDoneVictims.has(m.payload.victimId)
    );

    let targetVictimMsg = taskAssignment;

    if (!targetVictimMsg) {
      // Find earliest unclaimed victim_found message
      targetVictimMsg = allMessages.find(
        (m) =>
          m.type === "victim_found" &&
          m.payload.victimId &&
          !claimedOrDoneVictims.has(m.payload.victimId)
      );
    }

    if (targetVictimMsg && targetVictimMsg.payload.victimId && targetVictimMsg.payload.x !== undefined && targetVictimMsg.payload.y !== undefined) {
      const vx = targetVictimMsg.payload.x;
      const vy = targetVictimMsg.payload.y;
      const victimId = targetVictimMsg.payload.victimId;

      // Verify path exists before claiming
      const path = findPath(grid, { x: this.x, y: this.y }, { x: vx, y: vy });
      if (path.length === 0 && !(this.x === vx && this.y === vy)) {
        // Path unreachable: mark as unreachable on bus
        bus.send({
          from: this.id,
          type: "unreachable",
          payload: { victimId, x: vx, y: vy },
        });
        return;
      }

      // Claim synchronously right now in decide
      this.claimedVictimId = victimId;
      this.targetX = vx;
      this.targetY = vy;
      this.currentPath = path;
      this.status = "moving";

      bus.send({
        from: this.id,
        type: "claim_victim",
        payload: { victimId, x: vx, y: vy },
      });
    }
  }

  decide(): void {
    // Deciding is handled in decideWithBus to access current bus state synchronously
  }

  act(grid: Grid, bus: MessageBus): void {
    if (!this.claimedVictimId || this.targetX === undefined || this.targetY === undefined) {
      this.status = "idle";
      return;
    }

    // Check if already at or adjacent to victim
    const isAtTarget = this.x === this.targetX && this.y === this.targetY;
    const isAdjacent =
      Math.abs(this.x - this.targetX) + Math.abs(this.y - this.targetY) <= 1;

    if (isAtTarget || isAdjacent) {
      // Execute Rescue!
      markRescued(grid, this.targetX, this.targetY);

      bus.send({
        from: this.id,
        type: "victim_rescued",
        payload: {
          victimId: this.claimedVictimId,
          x: this.targetX,
          y: this.targetY,
        },
      });

      this.claimedVictimId = undefined;
      this.targetX = undefined;
      this.targetY = undefined;
      this.currentPath = [];
      this.status = "idle";
      return;
    }

    // Recalculate or follow path
    if (this.currentPath.length === 0) {
      this.currentPath = findPath(
        grid,
        { x: this.x, y: this.y },
        { x: this.targetX, y: this.targetY }
      );
    }

    if (this.currentPath.length === 0) {
      // Stuck fallback: cannot find path to target
      bus.send({
        from: this.id,
        type: "unreachable",
        payload: {
          victimId: this.claimedVictimId,
          x: this.targetX,
          y: this.targetY,
        },
      });

      this.claimedVictimId = undefined;
      this.targetX = undefined;
      this.targetY = undefined;
      this.status = "idle";
      return;
    }

    // Move next step along path
    const nextStep = this.currentPath.shift()!;
    this.x = nextStep.x;
    this.y = nextStep.y;
  }
}
