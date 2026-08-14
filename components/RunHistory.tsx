"use client";

import React, { useEffect, useState } from "react";
import { SimulationRunRecord } from "../lib/types";
import { fetchRuns } from "../lib/stats";
import { History, RefreshCw } from "lucide-react";

interface RunHistoryProps {
  lastSavedAt?: number;
}

export const RunHistory: React.FC<RunHistoryProps> = ({ lastSavedAt }) => {
  const [runs, setRuns] = useState<SimulationRunRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

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
    <div className="bg-[#16243A] border border-[rgba(34,211,238,0.12)] rounded-md p-4 space-y-3">
      {/* Panel Header */}
      <div className="flex items-center justify-between border-b border-[rgba(34,211,238,0.12)] pb-2">
        <h2 className="font-mono text-xs uppercase tracking-wider text-[#22D3EE] font-semibold flex items-center gap-1.5">
          <History className="w-3.5 h-3.5" />
          Mission Run History
        </h2>
        <button
          type="button"
          onClick={loadHistory}
          className="text-[#22D3EE] hover:text-[#22D3EE]/80 p-1 rounded-md transition-colors duration-150 focus-console"
          title="Refresh History"
          aria-label="Refresh run history table"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Loading, Error, and Empty States (§7: subdued text, quiet telemetry) */}
      {loading ? (
        <div className="py-6 text-center text-xs font-mono text-[#F8FAFC]/50">
          Fetching mission records...
        </div>
      ) : error ? (
        <div className="py-4 text-center text-xs font-mono text-[#EF4444] bg-[#EF4444]/10 rounded-md border border-[#EF4444]/20 p-3">
          ⚠ Unable to load historical telemetry ({error})
        </div>
      ) : runs.length === 0 ? (
        <div className="py-6 text-center text-xs font-mono text-[#F8FAFC]/40 italic">
          No archived runs — completed missions will be logged here.
        </div>
      ) : (
        <div className="overflow-x-auto">
          {/* Table: No zebra striping, subtle hairline dividers (§7) */}
          <table className="w-full text-left text-xs font-mono border-collapse">
            <thead>
              <tr className="border-b border-[rgba(34,211,238,0.12)] text-[#F8FAFC]/65 text-[11px] uppercase tracking-wider">
                <th className="py-2 px-2.5 font-normal">Timestamp</th>
                <th className="py-2 px-2.5 font-normal">Grid</th>
                <th className="py-2 px-2.5 font-normal">Rescued</th>
                <th className="py-2 px-2.5 font-normal">Ticks</th>
                <th className="py-2 px-2.5 font-normal">Msgs</th>
                <th className="py-2 px-2.5 font-normal">Duration</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(34,211,238,0.08)] text-[#F8FAFC]">
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
                    className="hover:bg-[rgba(34,211,238,0.06)] transition-colors duration-150"
                  >
                    <td className="py-2 px-2.5 text-[#F8FAFC]/65">{dateStr}</td>
                    <td className="py-2 px-2.5">{run.grid_size}x{run.grid_size}</td>
                    <td className="py-2 px-2.5">
                      <span
                        className={
                          isFullSuccess ? "text-[#22C55E] font-bold" : "text-[#F97316]"
                        }
                      >
                        {run.victims_rescued} / {run.victims_total}
                      </span>
                    </td>
                    <td className="py-2 px-2.5">{run.ticks_taken}</td>
                    <td className="py-2 px-2.5 text-[#22D3EE]">{run.messages_sent}</td>
                    <td className="py-2 px-2.5 text-[#F8FAFC]/65">
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
