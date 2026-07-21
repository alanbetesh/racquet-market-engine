import AutocompleteSearch from "@/components/layout/AutocompleteSearch";
import { BarChart3, ShieldAlert, Zap } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center max-w-3xl mx-auto px-4">
      <div className="inline-flex items-center gap-2 border border-border px-3 py-1 rounded-full bg-surface mb-6 font-mono text-xs text-textSecondary">
        <Zap className="h-3 w-3 text-buy-sick fill-buy-sick" /> Real-time eBay Pricing Intelligence Activated
      </div>
      
      <h1 className="text-3xl md:text-5xl font-bold tracking-tight font-mono mb-4 text-textPrimary">
        TENNIS RACKET MARKET ANALYZER
      </h1>
      
      <p className="text-sm md:text-base text-textSecondary font-mono max-w-xl mb-8">
        Bloomberg-grade market engine tracking completed secondary listings, active competition, data-driven buyer margins, and immediate market health scoring.
      </p>

      <AutocompleteSearch />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full mt-16 text-left border-t border-border pt-12">
        <div className="p-4 rounded border border-border bg-surface/50 font-mono">
          <div className="flex items-center gap-2 text-textPrimary font-bold text-xs mb-2">
            <BarChart3 className="h-4 w-4 text-buy-good" /> VOLUME QUANTILES
          </div>
          <p className="text-xs text-textSecondary leading-relaxed">
            Parses raw historical sale clusters to distinguish real secondary trends from low-frequency statistical outliers.
          </p>
        </div>
        
        <div className="p-4 rounded border border-border bg-surface/50 font-mono">
          <div className="flex items-center gap-2 text-textPrimary font-bold text-xs mb-2">
            <Zap className="h-4 w-4 text-buy-sick" /> MARGIN TARGETING
          </div>
          <p className="text-xs text-textSecondary leading-relaxed">
            Dynamically splits buy ranges into Sick, Good, Fair, and Do Not Buy bounds relative to direct real-time platform velocity.
          </p>
        </div>

        <div className="p-4 rounded border border-border bg-surface/50 font-mono">
          <div className="flex items-center gap-2 text-textPrimary font-bold text-xs mb-2">
            <ShieldAlert className="h-4 w-4 text-buy-bad" /> COMPETITION MATRIX
          </div>
          <p className="text-xs text-textSecondary leading-relaxed">
            Evaluates current inventory ratios against completed order flow to score active listing competition profiles instantly.
          </p>
        </div>
      </div>
    </div>
  );
}