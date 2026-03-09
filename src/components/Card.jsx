import React from "react";
import { cn } from "../utils/cn";

/**
 * Reusable Card component for UI consistency
 */
export const Card = ({ children, title, className }) => (
  <div className={cn("bg-white rounded-2xl border border-slate-200 shadow-sm p-6", className)}>
    {title && <h3 className="text-lg font-semibold text-slate-800 mb-4">{title}</h3>}
    {children}
  </div>
);
