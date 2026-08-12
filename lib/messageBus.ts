import { AgentMessage, AgentRole } from "./types";

export class MessageBus {
  private messages: AgentMessage[] = [];

  send(message: Omit<AgentMessage, "id" | "timestamp">): AgentMessage {
    const fullMessage: AgentMessage = {
      ...message,
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      timestamp: Date.now(),
    };
    this.messages.push(fullMessage);
    return fullMessage;
  }

  getMessagesFor(role?: AgentRole): AgentMessage[] {
    if (!role) return [...this.messages];
    return this.messages.filter(
      (m) => !m.payload.assignedAgentId || m.payload.assignedAgentId === role
    );
  }

  getAll(): AgentMessage[] {
    return [...this.messages];
  }

  clear(): void {
    this.messages = [];
  }

  count(): number {
    return this.messages.length;
  }
}
