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
    <div className="bg-[#16243A] border border-[#22D3EE]/15 rounded-md p-4 space-y-3">
      <div className="flex items-center justify-between border-b border-[#22D3EE]/15 pb-2">
        <h2 className="font-mono-telemetry text-xs uppercase tracking-wider text-[#22D3EE] font-semibold flex items-center gap-1.5">
          <History className="w-3.5 h-3.5" />
          Mission Run History
        </h2>
        <button
          onClick={loadHistory}
          className="text-[#22D3EE] hover:text-[#22D3EE]/80 p-1 rounded transition-colors"
          title="Refresh History"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {loading ? (
        <div className="py-8 text-center text-xs font-mono-telemetry text-[#F8FAFC]/50">
          Loading past runs...
        </div>
      ) : error ? (
        <div className="py-6 text-center text-xs font-mono-telemetry text-[#EF4444] bg-[#EF4444]/10 rounded border border-[#EF4444]/20 p-3">
          ⚠ Couldn&apos;t load run history ({error})
        </div>
      ) : runs.length === 0 ? (
        <div className="py-8 text-center text-xs font-mono-telemetry text-[#F8FAFC]/40 italic">
          No runs yet — completed simulations will appear here.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono-telemetry border-collapse">
            <thead>
              <tr className="border-b border-[#22D3EE]/15 text-[#F8FAFC]/60 text-[11px]">
                <th className="py-2 px-2 font-normal">Timestamp</th>
                <th className="py-2 px-2 font-normal">Grid</th>
                <th className="py-2 px-2 font-normal">Rescued</th>
                <th className="py-2 px-2 font-normal">Ticks</th>
                <th className="py-2 px-2 font-normal">Msgs</th>
                <th className="py-2 px-2 font-normal">Duration</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#22D3EE]/10 text-[#F8FAFC]">
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
                  <tr key={run.id || idx} className="hover:bg-[#22D3EE]/5 transition-colors">
                    <td className="py-2 px-2 text-[#F8FAFC]/70">{dateStr}</td>
                    <td className="py-2 px-2">{run.grid_size}x{run.grid_size}</td>
                    <td className="py-2 px-2">
                      <span
                        className={
                          isFullSuccess ? "text-[#22C55E] font-bold" : "text-amber-400"
                        }
                      >
                        {run.victims_rescued} / {run.victims_total}
                      </span>
                    </td>
                    <td className="py-2 px-2">{run.ticks_taken}</td>
                    <td className="py-2 px-2 text-[#22D3EE]">{run.messages_sent}</td>
                    <td className="py-2 px-2 text-[#F8FAFC]/70">
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
