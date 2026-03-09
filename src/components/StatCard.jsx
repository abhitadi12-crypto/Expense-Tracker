import React from "react";
import { cn } from "../utils/cn";
import { Card } from "./Card";

/**
 * StatCard component for displaying key metrics
 */
export const StatCard = ({ title, value, trend, icon: Icon, color }) => (
  <Card className="flex items-center gap-4">
    <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", color)}>
      <Icon className="text-white w-6 h-6" />
    </div>
    <div>
      <p className="text-sm text-slate-500 font-medium">{title}</p>
      <h3 className="text-2xl font-bold text-slate-800">{value}</h3>
      {trend && <p className="text-xs text-emerald-600 font-medium mt-1">{trend}</p>}
    </div>
  </Card>
);
