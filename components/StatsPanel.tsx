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
        <div className="bg-[#22C55E]/15 border border-[#22C55E]/40 rounded p-2.5 flex items-center gap-2 text-xs font-mono-telemetry text-[#22C55E]">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <div>
            <div className="font-bold uppercase tracking-wider">MISSION ACCOMPLISHED</div>
            <div className="text-[11px] opacity-80">All evacuees successfully rescued!</div>
          </div>
        </div>
      );
    }

    if (stats.endReason === "unreachable_victims") {
      return (
        <div className="bg-amber-500/15 border border-amber-500/40 rounded p-2.5 flex items-center gap-2 text-xs font-mono-telemetry text-amber-400">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <div>
            <div className="font-bold uppercase tracking-wider">PARTIAL SUCCESS</div>
            <div className="text-[11px] opacity-80">
              {stats.unreachableCount || 0} victim(s) unreachable due to hazards/obstacles.
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="bg-[#EF4444]/15 border border-[#EF4444]/40 rounded p-2.5 flex items-center gap-2 text-xs font-mono-telemetry text-[#EF4444]">
        <ShieldAlert className="w-4 h-4 shrink-0" />
        <div>
          <div className="font-bold uppercase tracking-wider">SIMULATION TIMEOUT</div>
          <div className="text-[11px] opacity-80">
            Reached maximum tick limit ({stats.tick} ticks).
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-[#16243A] border border-[#22D3EE]/15 rounded-md p-4 space-y-4">
      {/* Header telemetry bar */}
      <div className="flex items-center justify-between border-b border-[#22D3EE]/15 pb-2">
        <h2 className="font-mono-telemetry text-xs uppercase tracking-wider text-[#22D3EE] font-semibold flex items-center gap-1.5">
          <Activity className="w-3.5 h-3.5" />
          Telemetry Console
        </h2>
        <div className="flex items-center gap-2 text-xs font-mono-telemetry">
          {isRunning ? (
            <span className="flex items-center gap-1 text-[#22D3EE]">
              <span className="w-2 h-2 rounded-full bg-[#22D3EE] animate-status-pulse" />
              SYSTEM ACTIVE
            </span>
          ) : (
            <span className="text-[#F8FAFC]/40">STANDBY</span>
          )}
        </div>
      </div>

      {/* End condition alert */}
      {renderEndReason()}

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-[#0B1220] border border-[#22D3EE]/10 rounded p-2.5">
          <div className="text-[11px] font-mono-telemetry text-[#F8FAFC]/65 uppercase">
            Simulation Ticks
          </div>
          <div className="text-2xl font-mono-telemetry font-bold text-[#22D3EE]">
            {stats.tick}
          </div>
        </div>

        <div className="bg-[#0B1220] border border-[#22D3EE]/10 rounded p-2.5">
          <div className="text-[11px] font-mono-telemetry text-[#F8FAFC]/65 uppercase">
            Evacuees Rescued
          </div>
          <div className="text-2xl font-mono-telemetry font-bold text-[#22C55E] flex items-baseline justify-between">
            <span>
              {stats.victimsRescued} <span className="text-xs text-[#F8FAFC]/40 font-normal">/ {stats.victimsTotal}</span>
            </span>
            <span className="text-xs text-[#22C55E]/80">{rescuePercentage}%</span>
          </div>
        </div>

        <div className="bg-[#0B1220] border border-[#22D3EE]/10 rounded p-2.5">
          <div className="text-[11px] font-mono-telemetry text-[#F8FAFC]/65 uppercase flex items-center gap-1">
            <MessageSquare className="w-3 h-3 text-[#22D3EE]" /> Messages Sent
          </div>
          <div className="text-xl font-mono-telemetry font-bold text-[#F8FAFC]">
            {stats.messagesSent}
          </div>
        </div>

        <div className="bg-[#0B1220] border border-[#22D3EE]/10 rounded p-2.5">
          <div className="text-[11px] font-mono-telemetry text-[#F8FAFC]/65 uppercase flex items-center gap-1">
            <Clock className="w-3 h-3 text-[#22D3EE]" /> Elapsed Time
          </div>
          <div className="text-xl font-mono-telemetry font-bold text-[#F8FAFC]">
            {elapsedTimeSec}s
          </div>
        </div>
      </div>

      {/* Save status notification */}
      {saveStatus && saveStatus.state !== "idle" && (
        <div className="text-xs font-mono-telemetry">
          {saveStatus.state === "saving" && (
            <span className="text-[#22D3EE] animate-pulse">Persisting run record...</span>
          )}
          {saveStatus.state === "saved" && (
            <span className="text-[#22C55E]">✓ Run saved to database</span>
          )}
          {saveStatus.state === "error" && (
            <span className="text-[#EF4444]">⚠ {saveStatus.message}</span>
          )}
        </div>
      )}

      {/* Live Agent Message Log Feed */}
      <div className="space-y-1.5">
        <div className="text-[11px] font-mono-telemetry text-[#F8FAFC]/65 uppercase tracking-wider">
          Message Bus Stream ({messages.length})
        </div>
        <div className="bg-[#0B1220] border border-[#22D3EE]/10 rounded h-32 overflow-y-auto p-2 space-y-1 text-[11px] font-mono-telemetry">
          {messages.length === 0 ? (
            <div className="text-[#F8FAFC]/30 italic text-center py-4">
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
                <div key={msg.id} className="border-b border-[#22D3EE]/5 pb-1 last:border-0">
                  <span className="text-[#F8FAFC]/40 font-mono">[{msg.from}]</span>{" "}
                  <span className={`font-semibold ${badgeColor}`}>{msg.type}</span>{" "}
                  {msg.payload.x !== undefined && (
                    <span className="text-[#F8FAFC]/70">
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
