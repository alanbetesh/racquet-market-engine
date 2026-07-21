"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, TrendingUp, AlertTriangle, Activity, ShieldAlert, Tag } from "lucide-react";
import { FlipCalculator } from "@/components/dashboard/FlipCalculator";
import { ActiveListingsTable } from "@/components/dashboard/ActiveListingsTable";
import { PriceChart } from "@/components/dashboard/PriceChart";

interface MarketData {
  racketName?: string;
  isLiveEbayData?: boolean;
  completedSales?: {
    avgPrice?: number;
    medianPrice?: number;
    highestPrice?: number;
    lowestPrice?: number;
    volume?: number;
  };
  chartData?: any[];
  activeListings?: any[];
}

export default function AnalyzePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const query = searchParams.get("query") || "";
  const currentCondition = searchParams.get("condition") || "used";

  const [data, setData] = useState<MarketData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function getMarketData() {
      if (!query) return;
      try {
        setLoading(true);
        setError(null);
        
        // Appends the current condition to the API call so it filters Used vs New!
        const response = await fetch(`/api/market?query=${encodeURIComponent(query)}&condition=${currentCondition}`);
        if (!response.ok) {
          throw new Error("Failed to communicate with market engine service");
        }
        const json = await response.json();
        setData(json);
      } catch (err: any) {
        console.error("Error retrieving market analytics:", err);
        setError(err?.message || "An error occurred while loading telemetry data.");
      } finally {
        setLoading(false);
      }
    }
    getMarketData();
  }, [query, currentCondition]);

  const racketTitle = data?.racketName || query || "Unknown Frame";
  const rawAvgPrice = data?.completedSales?.avgPrice ?? 0;
  const avgPrice = typeof rawAvgPrice === "number" && !Number.isNaN(rawAvgPrice) ? rawAvgPrice : 0;
  
  const medianPrice = data?.completedSales?.medianPrice ?? avgPrice ?? 0;
  const highestPrice = data?.completedSales?.highestPrice ?? (avgPrice * 1.2) ?? 0;
  const lowestPrice = data?.completedSales?.lowestPrice ?? (avgPrice * 0.8) ?? 0;
  const salesVolume = data?.completedSales?.volume ?? 0;
  const isLiveFeed = !!data?.isLiveEbayData;
  const activeListings = data?.activeListings || [];
  const chartData = data?.chartData || [];

  const buyZoneSick = { min: 0, max: Math.round(avgPrice * 0.55) };
  const buyZoneGood = { min: Math.round(avgPrice * 0.55) + 1, max: Math.round(avgPrice * 0.70) };
  const buyZoneTight = { min: Math.round(avgPrice * 0.70) + 1, max: Math.round(avgPrice * 0.82) };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] font-mono space-y-4">
        <Activity className="h-8 w-8 text-emerald-400 animate-spin" />
        <div className="text-xs uppercase font-bold tracking-widest text-textPrimary animate-pulse">
          Parsing Secondary Markets...
        </div>
      </div>
    );
  }

  if (error || !query) {
    return (
      <div className="max-w-md mx-auto my-12 p-6 border border-red-500/20 bg-surface rounded-lg font-mono text-center space-y-4">
        <ShieldAlert className="h-10 w-10 text-red-400 mx-auto" />
        <h2 className="text-sm font-bold uppercase text-textPrimary">Analysis Diagnostic Fault</h2>
        <p className="text-xs text-textSecondary">{error || "No search parameter query specified."}</p>
        <Link href="/" className="inline-block text-xs uppercase underline text-textPrimary">
          Return to Console
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 font-mono space-y-6 pb-12 animate-in fade-in duration-500">
      <Link href="/" className="inline-flex items-center gap-2 text-xs text-textSecondary hover:text-textPrimary transition-colors">
        <ArrowLeft className="h-4 w-4" /> Return to Terminal
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <h1 className="text-xl font-bold uppercase tracking-tight text-textPrimary">{racketTitle}</h1>
          <p className="text-xs text-textSecondary mt-0.5">Market snapshot compiled across secondary auction indexes.</p>
        </div>
        {isLiveFeed && (
          <span className="self-start sm:self-center text-[10px] text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded border border-emerald-500/20 uppercase font-bold tracking-wider animate-pulse">
            ● Live API Connection Active
          </span>
        )}
      </div>

      {/* RESTORED: Condition Selector Tabs */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border border-border p-2 rounded bg-surface font-mono text-xs gap-3">
        <div className="flex items-center gap-2 text-textSecondary px-2">
          <Tag className="h-4 w-4 text-emerald-400" />
          <span className="font-bold uppercase tracking-wider text-textPrimary">Market Condition Filter:</span>
        </div>
        <div className="flex items-center gap-1 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {(["used", "new", "all"] as const).map((cond) => {
            const isActive = currentCondition === cond;
            return (
              <button
                key={cond}
                onClick={() => router.push(`/analyze?query=${encodeURIComponent(query)}&condition=${cond}`)}
                className={`px-4 py-1.5 rounded transition-colors uppercase font-bold whitespace-nowrap ${
                  isActive
                    ? "bg-neutral-100 text-black"
                    : "text-textSecondary hover:text-textPrimary hover:bg-neutral-800"
                }`}
              >
                {cond === "used" ? "Used / Pre-owned" : cond === "new" ? "Brand New / Unstrung" : "All Listings"}
              </button>
            );
          })}
        </div>
      </div>

      {/* RESTORED: Price Chart */}
      {chartData.length > 0 && (
        <section className="bg-surface border border-border rounded-lg p-4">
          <PriceChart data={chartData} />
        </section>
      )}

      {/* Metrics Card Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="border border-border rounded-lg bg-surface p-4">
          <div className="text-[10px] text-textSecondary uppercase font-bold">Market Average</div>
          <div className="text-2xl font-black text-emerald-400 mt-1">${avgPrice.toFixed(2)}</div>
          <div className="text-[10px] text-textSecondary mt-1">Based on {salesVolume} sales</div>
        </div>
        <div className="border border-border rounded-lg bg-surface p-4">
          <div className="text-[10px] text-textSecondary uppercase font-bold">Median Price</div>
          <div className="text-2xl font-black text-textPrimary mt-1">${medianPrice.toFixed(2)}</div>
        </div>
        <div className="border border-border rounded-lg bg-surface p-4">
          <div className="text-[10px] text-textSecondary uppercase font-bold">Peak Valuation</div>
          <div className="text-2xl font-black text-textPrimary mt-1">${highestPrice.toFixed(2)}</div>
        </div>
        <div className="border border-border rounded-lg bg-surface p-4">
          <div className="text-[10px] text-textSecondary uppercase font-bold">Floor Price</div>
          <div className="text-2xl font-black text-textPrimary mt-1">${lowestPrice.toFixed(2)}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <FlipCalculator estimatedMarketValue={avgPrice} />
        </div>

        <div className="border border-border rounded-lg bg-surface p-5 space-y-4">
          <div className="flex items-center gap-2 border-b border-border pb-2.5">
            <TrendingUp className="h-4 w-4 text-emerald-400" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-textPrimary">Target Purchase Guide</h2>
          </div>

          {avgPrice === 0 ? (
            <div className="flex items-center gap-2 text-xs text-amber-400 border border-amber-500/20 bg-amber-500/5 p-3 rounded">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>Insufficient volume to calculate margin diagnostics safely.</span>
            </div>
          ) : (
            <div className="space-y-3 text-xs">
              <div className="p-3 border border-emerald-500/20 bg-emerald-500/5 rounded">
                <div className="font-bold text-emerald-400 uppercase">Sick Flip Zone 🔥</div>
                <div className="text-textPrimary font-bold mt-0.5">${buyZoneSick.min} - ${buyZoneSick.max}</div>
              </div>
              <div className="p-3 border border-blue-500/20 bg-blue-500/5 rounded">
                <div className="font-bold text-blue-400 uppercase">Good Flip Zone 👍</div>
                <div className="text-textPrimary font-bold mt-0.5">${buyZoneGood.min} - ${buyZoneGood.max}</div>
              </div>
              <div className="p-3 border border-amber-500/20 bg-amber-500/5 rounded">
                <div className="font-bold text-amber-400 uppercase">Tight Margin Zone ⚠️</div>
                <div className="text-textPrimary font-bold mt-0.5">${buyZoneTight.min} - ${buyZoneTight.max}</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {activeListings.length > 0 && (
        <section className="pt-6 border-t border-border mt-8">
          <h2 className="text-sm font-bold font-mono text-textPrimary mb-4 uppercase">
            Live Active Market Listings
          </h2>
          <ActiveListingsTable listings={activeListings} />
        </section>
      )}
    </div>
  );
}