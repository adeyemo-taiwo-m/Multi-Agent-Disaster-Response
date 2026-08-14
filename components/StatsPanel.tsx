"use client";

import React from "react";
import { AgentMessage, SimulationStats } from "../lib/types";
import { Activity, CheckCircle, AlertTriangle, Clock, MessageSquare, ShieldAlert } from "lucide-react";

interface StatsPanelProps {
  stats: SimulationStats;
  isRunning: boolean;
  messages: AgentMessage[];
  saveStatus?: { state: "idle" | "saving" | "saved" | "error"; message?: string };
}

export const StatsPanel: React.FC<StatsPanelProps> = ({
  stats,
  isRunning,
  messages,
  saveStatus,
}) => {
  const elapsedTimeSec = Math.floor(
    ((stats.endedAt ?? Date.now()) - stats.startedAt) / 1000
  );

  const rescuePercentage =
    stats.victimsTotal > 0
      ? Math.round((stats.victimsRescued / stats.victimsTotal) * 100)
      : 0;

  const renderEndReason = () => {
    if (!stats.endReason) return null;

    if (stats.endReason === "all_rescued") {
      return (
        <div className="bg-[#22C55E]/15 border border-[#22C55E]/40 rounded-md p-3 flex items-center gap-2.5 text-xs font-mono text-[#22C55E]">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <div>
            <div className="font-bold uppercase tracking-wider">MISSION ACCOMPLISHED</div>
            <div className="text-xs text-[#F8FAFC]/80">All evacuees successfully rescued.</div>
          </div>
        </div>
      );
    }

    if (stats.endReason === "unreachable_victims") {
      return (
        <div className="bg-[#F97316]/15 border border-[#F97316]/40 rounded-md p-3 flex items-center gap-2.5 text-xs font-mono text-[#F97316]">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <div>
            <div className="font-bold uppercase tracking-wider">OPERATION CONCLUDED</div>
            <div className="text-xs text-[#F8FAFC]/80">
              <span className="text-[#EF4444] font-semibold">{stats.unreachableCount || 0}</span> victim(s) unreachable due to hazards/obstacles.
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="bg-[#EF4444]/15 border border-[#EF4444]/40 rounded-md p-3 flex items-center gap-2.5 text-xs font-mono text-[#EF4444]">
        <ShieldAlert className="w-4 h-4 shrink-0" />
        <div>
          <div className="font-bold uppercase tracking-wider">SIMULATION TIMEOUT</div>
          <div className="text-xs text-[#F8FAFC]/80">
            Reached maximum tick limit ({stats.tick} ticks).
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-[#16243A] border border-[rgba(34,211,238,0.12)] rounded-md p-4 space-y-4">
      {/* Header Telemetry Status */}
      <div className="flex items-center justify-between border-b border-[rgba(34,211,238,0.12)] pb-2">
        <h2 className="font-mono text-xs uppercase tracking-wider text-[#22D3EE] font-semibold flex items-center gap-1.5">
          <Activity className="w-3.5 h-3.5" />
          Telemetry Console
        </h2>
        <div className="flex items-center gap-2 text-xs font-mono">
          {isRunning ? (
            <span className="flex items-center gap-1.5 text-[#22D3EE]">
              <span className="w-2 h-2 rounded-full bg-[#22D3EE] animate-status-pulse" />
              SYSTEM ACTIVE
            </span>
          ) : (
            <span className="text-[#F8FAFC]/40">STANDBY</span>
          )}
        </div>
      </div>

      {/* End condition alert banner (§3, §7) */}
      {renderEndReason()}

      {/* Primary KPI Grid — Small-caps mono labels, large tabular figures */}
      <div className="grid grid-cols-2 gap-2.5">
        <div className="bg-[#0B1220] border border-[rgba(34,211,238,0.12)] rounded-md p-2.5">
          <div className="text-xs font-mono text-[#F8FAFC]/65 uppercase tracking-wider">
            Simulation Ticks
          </div>
          <div className="text-2xl font-mono font-bold text-[#22D3EE] mt-0.5">
            {stats.tick}
          </div>
        </div>

        <div className="bg-[#0B1220] border border-[rgba(34,211,238,0.12)] rounded-md p-2.5">
          <div className="text-xs font-mono text-[#F8FAFC]/65 uppercase tracking-wider">
            Evacuees Rescued
          </div>
          <div className="text-2xl font-mono font-bold text-[#22C55E] flex items-baseline justify-between mt-0.5">
            <span>
              {stats.victimsRescued} <span className="text-xs text-[#F8FAFC]/40 font-normal">/ {stats.victimsTotal}</span>
            </span>
            <span className="text-xs text-[#22C55E]/80 font-normal">{rescuePercentage}%</span>
          </div>
        </div>

        <div className="bg-[#0B1220] border border-[rgba(34,211,238,0.12)] rounded-md p-2.5">
          <div className="text-xs font-mono text-[#F8FAFC]/65 uppercase tracking-wider flex items-center gap-1">
            <MessageSquare className="w-3 h-3 text-[#22D3EE]" /> Messages Sent
          </div>
          <div className="text-xl font-mono font-bold text-[#F8FAFC] mt-0.5">
            {stats.messagesSent}
          </div>
        </div>

        <div className="bg-[#0B1220] border border-[rgba(34,211,238,0.12)] rounded-md p-2.5">
          <div className="text-xs font-mono text-[#F8FAFC]/65 uppercase tracking-wider flex items-center gap-1">
            <Clock className="w-3 h-3 text-[#22D3EE]" /> Elapsed Time
          </div>
          <div className="text-xl font-mono font-bold text-[#F8FAFC] mt-0.5">
            {elapsedTimeSec}s
          </div>
        </div>
      </div>

      {/* Save status notification (§3: inline text, never blocking modal) */}
      {saveStatus && saveStatus.state !== "idle" && (
        <div className="text-xs font-mono">
          {saveStatus.state === "saving" && (
            <span className="text-[#22D3EE]">Persisting telemetry record...</span>
          )}
          {saveStatus.state === "saved" && (
            <span className="text-[#22C55E]">✓ Run saved to database</span>
          )}
          {saveStatus.state === "error" && (
            <span className="text-[#EF4444]">⚠ {saveStatus.message}</span>
          )}
        </div>
      )}

      {/* Live Agent Message Log Feed (§3, §4) */}
      <div className="space-y-1.5">
        <div className="text-xs font-mono text-[#F8FAFC]/65 uppercase tracking-wider">
          Message Bus Stream ({messages.length})
        </div>
        <div className="bg-[#0B1220] border border-[rgba(34,211,238,0.12)] rounded-md h-32 overflow-y-auto p-2 space-y-1 text-xs font-mono">
          {messages.length === 0 ? (
            <div className="text-[#F8FAFC]/40 italic text-center py-4">
              No inter-agent communications yet.
            </div>
          ) : (
            [...messages].reverse().map((msg) => {
              let badgeColor = "text-[#22D3EE]";
              if (msg.type === "victim_found") badgeColor = "text-[#FACC15]";
              if (msg.type === "claim_victim") badgeColor = "text-[#22D3EE]";
              if (msg.type === "victim_rescued") badgeColor = "text-[#22C55E]";
              if (msg.type === "unreachable" || msg.type === "path_blocked") badgeColor = "text-[#EF4444]";
              if (msg.type === "task_assignment") badgeColor = "text-[#F97316]";

              return (
                <div key={msg.id} className="border-b border-[rgba(34,211,238,0.06)] pb-1 last:border-0">
                  <span className="text-[#F8FAFC]/40 font-mono">[{msg.from}]</span>{" "}
                  <span className={`font-semibold ${badgeColor}`}>{msg.type}</span>{" "}
                  {msg.payload.x !== undefined && (
                    <span className="text-[#F8FAFC]/65">
                      at ({msg.payload.x},{msg.payload.y})
                    </span>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default StatsPanel;
