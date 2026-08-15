"use client";

import React, { useEffect, useState } from "react";
import { SimulationRunRecord } from "../lib/types";
import { fetchRuns } from "../lib/stats";
import { History, RefreshCw, ChevronDown } from "lucide-react";

interface RunHistoryProps {
  lastSavedAt?: number;
}

export const RunHistory: React.FC<RunHistoryProps> = ({ lastSavedAt }) => {
  const [runs, setRuns] = useState<SimulationRunRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<boolean>(false);

  const loadHistory = async () => {
    setLoading(true);
    setError(null);
    const res = await fetchRuns(15);
    if (res.error && res.data.length === 0) {
      setError(res.error);
    } else {
      setRuns(res.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadHistory();
  }, [lastSavedAt]);

  return (
    <div className="bg-[rgb(var(--bg-secondary))] border border-[rgb(var(--accent)/0.12)] rounded-md p-4 space-y-3">
      {/* Panel Header — click to expand/collapse; reference material, not demo focus (§5) */}
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-between border-b border-[rgb(var(--accent)/0.12)] pb-2 focus-console rounded-md cursor-pointer"
        aria-expanded={expanded}
      >
        <h2 className="font-mono text-xs uppercase tracking-wider text-[rgb(var(--accent))] font-semibold flex items-center gap-1.5">
          <History className="w-3.5 h-3.5" />
          Mission Run History
          {!loading && runs.length > 0 && (
            <span className="text-[rgb(var(--text-primary)/0.40)] font-normal normal-case">({runs.length})</span>
          )}
        </h2>
        <div className="flex items-center gap-2">
          {expanded && (
            <span
              role="button"
              tabIndex={0}
              onClick={(e) => {
                e.stopPropagation();
                loadHistory();
              }}
              className="text-[rgb(var(--accent))] hover:text-[rgb(var(--accent)/0.80)] p-1 rounded-md transition-colors duration-150"
              title="Refresh History"
              aria-label="Refresh run history table"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            </span>
          )}
          <ChevronDown
            className={`w-3.5 h-3.5 text-[rgb(var(--text-primary)/0.65)] transition-transform duration-150 ${expanded ? "rotate-180" : ""}`}
          />
        </div>
      </button>

      {!expanded ? null : loading ? (
        <div className="py-6 text-center text-xs font-mono text-[rgb(var(--text-primary)/0.50)]">
          Fetching mission records...
        </div>
      ) : error ? (
        <div className="py-4 text-center text-xs font-mono text-[rgb(var(--danger))] bg-[rgb(var(--danger)/0.10)] rounded-md border border-[rgb(var(--danger)/0.20)] p-3">
          ⚠ Unable to load historical telemetry ({error})
        </div>
      ) : runs.length === 0 ? (
        <div className="py-6 text-center text-xs font-mono text-[rgb(var(--text-primary)/0.40)] italic">
          No archived runs — completed missions will be logged here.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono border-collapse">
            <thead>
              <tr className="border-b border-[rgb(var(--accent)/0.12)] text-[rgb(var(--text-primary)/0.65)] text-[11px] uppercase tracking-wider">
                <th className="py-2 px-2.5 font-normal">Timestamp</th>
                <th className="py-2 px-2.5 font-normal">Grid</th>
                <th className="py-2 px-2.5 font-normal">Rescued</th>
                <th className="py-2 px-2.5 font-normal">Ticks</th>
                <th className="py-2 px-2.5 font-normal">Msgs</th>
                <th className="py-2 px-2.5 font-normal">Duration</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgb(var(--accent)/0.08)] text-[rgb(var(--text-primary))] font-mono-telemetry">
              {runs.map((run, idx) => {
                const dateStr = run.created_at
                  ? new Date(run.created_at).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                    })
                  : `Run #${idx + 1}`;

                const isFullSuccess = run.victims_rescued >= run.victims_total;

                return (
                  <tr
                    key={run.id || idx}
                    className="hover:bg-[rgb(var(--accent)/0.06)] transition-colors duration-150"
                  >
                    <td className="py-2 px-2.5 text-[rgb(var(--text-primary)/0.65)]">{dateStr}</td>
                    <td className="py-2 px-2.5">{run.grid_size}x{run.grid_size}</td>
                    <td className="py-2 px-2.5">
                      <span
                        className={
                          isFullSuccess ? "text-[rgb(var(--success))] font-bold" : "text-[rgb(var(--emergency))]"
                        }
                      >
                        {run.victims_rescued} / {run.victims_total}
                      </span>
                    </td>
                    <td className="py-2 px-2.5">{run.ticks_taken}</td>
                    <td className="py-2 px-2.5 text-[rgb(var(--accent))]">{run.messages_sent}</td>
                    <td className="py-2 px-2.5 text-[rgb(var(--text-primary)/0.65)]">
                      {(run.duration_ms / 1000).toFixed(1)}s
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default RunHistory;