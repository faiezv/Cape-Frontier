// src/components/ui/FloatingTooltip.jsx

import React from "react";

export default function FloatingTooltip({
  children,
  text = "Open",
  position = "top",
  className = "",
}) {
  const positionClasses = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-3",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-3",
    left: "right-full top-1/2 -translate-y-1/2 mr-3",
    right: "left-full top-1/2 -translate-y-1/2 ml-3",
  };

  return (
    <div className={`relative group/tooltip ${className}`}>
      {children}

      <div
        className={`
          pointer-events-none absolute z-50
          ${positionClasses[position]}
          opacity-0 translate-y-1 scale-95
          group-hover/tooltip:opacity-100
          group-hover/tooltip:translate-y-0
          group-hover/tooltip:scale-100
          group-focus-within/tooltip:opacity-100
          group-focus-within/tooltip:translate-y-0
          group-focus-within/tooltip:scale-100
          transition-all duration-300 ease-out
        `}
      >
        <div className="relative flex items-center gap-2 rounded-full bg-blue-600 px-3 py-1.5 shadow-lg shadow-blue-600/20 border border-white/20">
          <span className="h-2 w-2 rounded-full bg-green-200 animate-pulse" />

          <span className="text-[11px] font-bitter font-semibold text-white whitespace-nowrap">
            {text}
          </span>

          <span className="rounded-full bg-green-200 px-2 py-0.5 text-[10px] font-bitter font-bold text-green-950">
            Open
          </span>

          {position === "top" && (
            <span className="absolute left-1/2 top-full -translate-x-1/2 border-x-8 border-x-transparent border-t-8 border-t-blue-600" />
          )}

          {position === "bottom" && (
            <span className="absolute left-1/2 bottom-full -translate-x-1/2 border-x-8 border-x-transparent border-b-8 border-b-blue-600" />
          )}

          {position === "left" && (
            <span className="absolute left-full top-1/2 -translate-y-1/2 border-y-8 border-y-transparent border-l-8 border-l-blue-600" />
          )}

          {position === "right" && (
            <span className="absolute right-full top-1/2 -translate-y-1/2 border-y-8 border-y-transparent border-r-8 border-r-blue-600" />
          )}
        </div>
      </div>
    </div>
  );
}