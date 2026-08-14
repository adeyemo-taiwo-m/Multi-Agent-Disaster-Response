/**
 * Design Tokens & Theme Constants for Multi-Agent Disaster Response Simulation
 * Defined according to STYLE_GUIDE.md
 */

export const THEME_COLORS = {
  // Core Surface & Brand Tokens
  bgPrimary: "#0B1220",
  bgSecondary: "#16243A",
  accent: "#22D3EE",
  emergency: "#F97316",
  danger: "#EF4444",
  success: "#22C55E",
  victim: "#FACC15",
  textPrimary: "#F8FAFC",

  // Derived / Utility Shades
  textSecondary: "rgba(248, 250, 252, 0.65)",
  textMuted: "rgba(248, 250, 252, 0.40)",
  borderSubtle: "rgba(34, 211, 238, 0.12)",
  surfaceHover: "rgba(34, 211, 238, 0.06)",
  emptyCell: "rgba(22, 36, 58, 0.50)",
} as const;

export const AGENT_ROLE_STYLES = {
  scout: {
    name: "Scout Agent",
    color: THEME_COLORS.accent,
    shape: "hollow_circle",
    description: "Searching for victims",
  },
  rescuer: {
    name: "Rescue Agent",
    color: THEME_COLORS.emergency,
    shape: "filled_triangle",
    description: "Navigating to rescue claimed evacuees",
  },
  coordinator: {
    name: "Coordinator",
    color: THEME_COLORS.victim,
    shape: "filled_diamond",
    description: "Assigning tasks and resolving contention",
  },
  evacuee: {
    name: "Evacuee",
    color: THEME_COLORS.textPrimary,
    rescuedColor: THEME_COLORS.success,
    shape: "square",
    description: "Civilians awaiting evacuation",
  },
} as const;

export const MESSAGE_TYPE_COLORS: Record<string, string> = {
  victim_found: THEME_COLORS.victim,
  claim_victim: THEME_COLORS.accent,
  victim_rescued: THEME_COLORS.success,
  path_blocked: THEME_COLORS.danger,
  unreachable: THEME_COLORS.danger,
  task_assignment: THEME_COLORS.emergency,
};
