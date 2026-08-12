import { AgentMessage, SpotlightEvent } from "./types";

let lastProcessedIndex = 0;

export function resetSpotlightCursor(): void {
  lastProcessedIndex = 0;
}

export function detectSpotlightEvents(
  allMessages: AgentMessage[],
  tick: number,
): SpotlightEvent[] {
  const newMessages = allMessages.slice(lastProcessedIndex);
  lastProcessedIndex = allMessages.length;
  const events: SpotlightEvent[] = [];

  const claims = newMessages.filter((m) => m.type === "claim_victim");
  const claimsByVictim = new Map<string, AgentMessage[]>();
  for (const c of claims) {
    if (!c.payload.victimId) continue;
    const arr = claimsByVictim.get(c.payload.victimId) ?? [];
    arr.push(c);
    claimsByVictim.set(c.payload.victimId, arr);
  }
  for (const [victimId, claimList] of claimsByVictim.entries()) {
    if (claimList.length > 1) {
      const winner = claimList[0];
      events.push({
        id: `conflict-${victimId}-${tick}`,
        tick,
        title: "Claim conflict resolved",
        detail: `${winner.from} claimed victim ${victimId} first — later claims from ${claimList
          .slice(1)
          .map((c) => c.from)
          .join(", ")} were rejected via the message bus.`,
        severity: "info",
        x: winner.payload.x,
        y: winner.payload.y,
        agentIds: claimList.map((c) => c.from),
        durationMs: 4000,
      });
    }
  }

  for (const m of newMessages.filter((m) => m.type === "victim_rescued")) {
    events.push({
      id: `rescued-${m.id}`,
      tick,
      title: "Victim rescued",
      detail: `${m.from} reached and rescued the evacuee at (${m.payload.x}, ${m.payload.y}).`,
      severity: "success",
      x: m.payload.x,
      y: m.payload.y,
      agentIds: [m.from],
      durationMs: 3000,
    });
  }

  for (const m of newMessages.filter((m) => m.type === "task_assignment")) {
    events.push({
      id: `assign-${m.id}`,
      tick,
      title: "Coordinator assigned task",
      detail: `Coordinator suggested ${m.payload.assignedAgentId} take the victim at (${m.payload.x}, ${m.payload.y}).`,
      severity: "info",
      x: m.payload.x,
      y: m.payload.y,
      agentIds: m.payload.assignedAgentId ? [m.payload.assignedAgentId] : [],
      durationMs: 3000,
    });
  }

  for (const m of newMessages.filter(
    (m) => m.type === "path_blocked" || m.type === "unreachable",
  )) {
    events.push({
      id: `unreachable-${m.id}`,
      tick,
      title: "Victim unreachable",
      detail: `${m.from} could not find a path and released its claim — victim at (${m.payload.x}, ${m.payload.y}) is walled off.`,
      severity: "warning",
      x: m.payload.x,
      y: m.payload.y,
      agentIds: [m.from],
      durationMs: 4000,
    });
  }

  return events;
}

export default detectSpotlightEvents;
