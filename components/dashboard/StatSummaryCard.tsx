import React from "react";

export function StatSummaryCard({ title, value, subtitle }: { title: string, value: string, subtitle?: string }) {
  return (
    <div className="flex flex-col rounded border border-border bg-surface p-4 font-mono">
      <span className="text-xs text-textSecondary uppercase tracking-wider">{title}</span>
      <span className="mt-2 text-xl font-bold text-textPrimary">{value}</span>
      {subtitle && <span className="mt-1 text-xs text-textSecondary">{subtitle}</span>}
    </div>
  );
}