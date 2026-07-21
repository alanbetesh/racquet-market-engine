import React from "react";
import { Activity } from "lucide-react";

export default function LoadingAnalyzePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] font-mono text-buy-sick space-y-4">
      <Activity className="h-10 w-10 animate-bounce" />
      <div className="text-sm font-bold uppercase tracking-widest animate-pulse text-textPrimary">
        Querying Live eBay Market Data...
      </div>
      <div className="text-xs text-textSecondary">
        This takes a few seconds to aggregate active and sold listings.
      </div>
    </div>
  );
}