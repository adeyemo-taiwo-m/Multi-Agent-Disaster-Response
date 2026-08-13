import { BaseAgent } from "./BaseAgent";
import { Grid } from "../types";
import { MessageBus } from "../messageBus";
import { getCell } from "../grid";

export class EvacueeAgent extends BaseAgent {
  constructor(id: string, x: number, y: number) {
    super(id, "evacuee", x, y);
    this.status = "idle";
  }

  perceive(grid: Grid, _bus: MessageBus): void {
    const currentCell = getCell(grid, this.x, this.y);
    if (currentCell && currentCell.status === "safe") {
      this.status = "rescued";
    }
  }

  decide(): void {
    // Evacuees remain in place until rescued
  }

  act(_grid: Grid, _bus: MessageBus): void {
    // No action needed for stationary evacuees
  }
}
