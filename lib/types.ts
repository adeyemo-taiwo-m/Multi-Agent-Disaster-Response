export type CellStatus = "empty" | "blocked" | "danger" | "safe" | "hasVictim";

export interface Cell {
  x: number;
  y: number;
  status: CellStatus;
  occupiedBy?: string; // agent id, if any agent is currently on this cell
}

export type Grid = Cell[][];

export type AgentRole = "scout" | "rescuer" | "coordinator" | "evacuee";

export interface AgentState {
  id: string;
  role: AgentRole;
  x: number;
  y: number;
  status: "idle" | "moving" | "busy" | "rescued" | "done";
  targetX?: number;
  targetY?: number;
  claimedVictimId?: string; // for rescue agents, which victim they're heading to
}

export type MessageType =
  | "victim_found"
  | "path_blocked"
  | "claim_victim"
  | "victim_rescued"
  | "task_assignment"
  | "unreachable";

export interface AgentMessage {
  id: string;
  from: string; // agent id
  type: MessageType;
  payload: {
    x?: number;
    y?: number;
    victimId?: string;
    assignedAgentId?: string;
  };
  timestamp: number;
}

export type SpotlightSeverity = "info" | "success" | "warning";

export interface SpotlightEvent {
  id: string;
  tick: number;
  title: string;
  detail: string;
  severity: SpotlightSeverity;
  x?: number;
  y?: number;
  agentIds?: string[];
  durationMs: number;
}

export interface SimulationStats {
  tick: number;
  victimsTotal: number;
  victimsRescued: number;
  messagesSent: number;
  startedAt: number;
  endedAt?: number;
  endReason?: "all_rescued" | "timed_out" | "unreachable_victims";
  unreachableCount?: number;
}

export interface SimulationRunRecord {
  id?: string;
  created_at?: string;
  grid_size: number;
  victims_total: number;
  victims_rescued: number;
  ticks_taken: number;
  messages_sent: number;
  duration_ms: number;
  end_reason?: string;
}

export interface SimulationConfig {
  gridSize: number;
  scoutCount: number;
  rescueCount: number;
  victimCount: number;
  blockedPercent: number;
  dangerPercent: number;
  maxTicks?: number; // defaults to gridSize * 20 if not provided
  seed?: number;
}
