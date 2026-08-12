import { supabase } from "./supabaseClient";
import { SimulationRunRecord, SimulationStats } from "./types";

const LOCAL_STORAGE_KEY = "disaster_sim_runs_history";

export async function saveRun(
  stats: SimulationStats,
  gridSize: number
): Promise<{ success: boolean; error?: string }> {
  const durationMs = (stats.endedAt ?? Date.now()) - stats.startedAt;

  const record: SimulationRunRecord = {
    grid_size: gridSize,
    victims_total: stats.victimsTotal,
    victims_rescued: stats.victimsRescued,
    ticks_taken: stats.tick,
    messages_sent: stats.messagesSent,
    duration_ms: Math.max(0, durationMs),
    end_reason: stats.endReason ?? "complete",
    created_at: new Date().toISOString(),
  };

  // Always save to local storage as fallback/immediate storage
  try {
    const existingRaw = localStorage.getItem(LOCAL_STORAGE_KEY);
    const existing: SimulationRunRecord[] = existingRaw ? JSON.parse(existingRaw) : [];
    existing.unshift({ ...record, id: `local-${Date.now()}` });
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(existing.slice(0, 50)));
  } catch (e) {
    console.warn("Failed to write to local storage", e);
  }

  // Attempt Supabase insert if credentials are provided
  if (
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_URL !== "your-project-url-here"
  ) {
    try {
      const { error } = await supabase.from("simulation_runs").insert({
        grid_size: record.grid_size,
        victims_total: record.victims_total,
        victims_rescued: record.victims_rescued,
        ticks_taken: record.ticks_taken,
        messages_sent: record.messages_sent,
        duration_ms: record.duration_ms,
      });

      if (error) {
        console.error("Supabase insert error:", error);
        return { success: false, error: error.message };
      }
      return { success: true };
    } catch (err: any) {
      console.error("Supabase connection exception:", err);
      return { success: false, error: err?.message || "Connection failed" };
    }
  }

  return { success: true };
}

export async function fetchRuns(limit = 20): Promise<{
  data: SimulationRunRecord[];
  error?: string;
}> {
  let supabaseRuns: SimulationRunRecord[] = [];
  let supabaseError: string | undefined;

  if (
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_URL !== "your-project-url-here"
  ) {
    try {
      const { data, error } = await supabase
        .from("simulation_runs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) {
        supabaseError = error.message;
      } else if (data) {
        supabaseRuns = data as SimulationRunRecord[];
      }
    } catch (e: any) {
      supabaseError = e?.message || "Failed to connect to Supabase";
    }
  }

  // Fallback to local storage if Supabase returned empty or error
  if (supabaseRuns.length === 0) {
    try {
      const localRaw = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (localRaw) {
        const localRuns: SimulationRunRecord[] = JSON.parse(localRaw);
        return { data: localRuns.slice(0, limit), error: supabaseError };
      }
    } catch (e) {
      console.warn("Error reading local storage history", e);
    }
  }

  return { data: supabaseRuns, error: supabaseError };
}
