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
      {visible.map((e) => (
        <div
          key={e.id}
          className={`w-72 max-w-[28rem] p-2 rounded-md backdrop-blur-sm border border-white/6 shadow-lg flex items-start gap-3 transition-opacity duration-200 animate-fade-in`}>
          <div className="flex-shrink-0 mt-0.5">
            <div
              className={`w-3 h-3 rounded-full ${
                e.severity === "success" ? "bg-[#22C55E]" : e.severity === "warning" ? "bg-[#F97316]" : "bg-[#22D3EE]"
              }`} />
          </div>

          <div className="flex-1">
            <div className="font-semibold text-sm">{e.title}</div>
            <div className="text-xs text-white/70 mt-1">{e.detail}</div>
          </div>

          <button
            onClick={() => onDismiss && onDismiss(e.id)}
            className="opacity-70 hover:opacity-100 text-white/60 p-1"
            aria-label="Dismiss">
            <X className="w-3 h-3" />
          </button>
        </div>
      ))}
    </div>
  );
};

export default EventSpotlight;
