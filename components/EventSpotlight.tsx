"use client";

import React, { useEffect } from "react";
import { SpotlightEvent } from "../lib/types";
import { X } from "lucide-react";

interface EventSpotlightProps {
  events: SpotlightEvent[];
  onDismiss?: (id: string) => void;
}

export const EventSpotlight: React.FC<EventSpotlightProps> = ({ events, onDismiss }) => {
  useEffect(() => {
    const timers: number[] = [];
    events.forEach((e) => {
      const t = window.setTimeout(() => onDismiss && onDismiss(e.id), e.durationMs);
      timers.push(t);
    });
    return () => timers.forEach((t) => clearTimeout(t));
  }, [events, onDismiss]);

  const visible = events.slice(-3).reverse(); // show up to 3 newest

  return (
    <div className="absolute top-2 right-2 flex flex-col gap-2 z-30 pointer-events-auto">
      {visible.map((e) => {
        let indicatorColor = "bg-[#22D3EE]";
        if (e.severity === "success") {
          indicatorColor = "bg-[#22C55E]";
        } else if (e.severity === "warning") {
          indicatorColor = "bg-[#F97316]";
        }

        return (
          <div
            key={e.id}
            className="w-72 max-w-[28rem] p-3 rounded-md bg-[#0B1220]/75 backdrop-blur-md border border-[rgba(34,211,238,0.25)] shadow-[0_4px_16px_rgba(0,0,0,0.3)] flex items-start gap-2.5 transition-all duration-150"
          >
            <div className="flex-shrink-0 mt-1">
              <div className={`w-2 h-2 rounded-full ${indicatorColor}`} />
            </div>

            <div className="flex-1 min-w-0">
              <div className="font-mono text-xs font-semibold text-[#F8FAFC]">
                {e.title}
              </div>
              <div className="text-xs text-[#F8FAFC]/75 mt-0.5 leading-relaxed">
                {e.detail}
              </div>
            </div>

            <button
              type="button"
              onClick={() => onDismiss && onDismiss(e.id)}
              className="text-[#F8FAFC]/40 hover:text-[#F8FAFC] p-0.5 rounded transition-colors duration-150 focus-console"
              aria-label="Dismiss alert"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default EventSpotlight;
