"use client";

import React, { useState } from "react";
import { Calculator, DollarSign, TrendingUp, AlertTriangle, CheckCircle2 } from "lucide-react";

interface FlipCalculatorProps {
  estimatedMarketValue: number;
}

export function FlipCalculator({ estimatedMarketValue }: FlipCalculatorProps) {
  const [purchasePrice, setPurchasePrice] = useState<string>("100");
  const [estimatedShipping, setEstimatedShipping] = useState<string>("15");

  const buyPrice = parseFloat(purchasePrice) || 0;
  const shippingCost = parseFloat(estimatedShipping) || 0;

  // Typical eBay fee structure: ~13.25% + $0.30 fixed fee
  const ebayFeeRate = 0.1325;
  const ebayFees = estimatedMarketValue * ebayFeeRate + 0.30;

  // Profit Math
  const netRevenue = estimatedMarketValue - ebayFees - shippingCost;
  const netProfit = netRevenue - buyPrice;
  const roi = buyPrice > 0 ? (netProfit / buyPrice) * 100 : 0;

  // Determine Deal Quality
  const getDealStatus = () => {
    if (buyPrice <= 0) return { label: "ENTER PRICE", color: "text-textSecondary", bg: "bg-neutral-800" };
    if (netProfit >= 50 && roi >= 40) {
      return { label: "SICK FLIP 🔥", color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" };
    }
    if (netProfit >= 25 && roi >= 20) {
      return { label: "GOOD FLIP 👍", color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20" };
    }
    if (netProfit > 0) {
      return { label: "TIGHT MARGIN ⚠️", color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20" };
    }
    return { label: "DO NOT BUY 🛑", color: "text-red-400", bg: "bg-red-500/10 border-red-500/20" };
  };

  const dealStatus = getDealStatus();

  return (
    <div className="border border-border rounded-lg bg-surface p-5 font-mono">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border pb-4 mb-4">
        <div className="flex items-center gap-2">
          <Calculator className="h-4 w-4 text-buy-good" />
          <h3 className="font-bold text-textPrimary uppercase tracking-wider text-sm">
            Flip Profit & Viability Calculator
          </h3>
        </div>
        <div className={`px-3 py-1 rounded border font-bold text-xs ${dealStatus.bg} ${dealStatus.color}`}>
          {dealStatus.label}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Input Column */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs text-textSecondary uppercase font-bold mb-1">
              Your Purchase / Asking Price
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-textSecondary">$</span>
              <input
                type="number"
                value={purchasePrice}
                onChange={(e) => setPurchasePrice(e.target.value)}
                placeholder="100"
                className="w-full h-10 pl-7 pr-3 rounded border border-border bg-background text-textPrimary font-bold text-sm focus:outline-none focus:border-neutral-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-textSecondary uppercase font-bold mb-1">
              Estimated Outbound Shipping
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-textSecondary">$</span>
              <input
                type="number"
                value={estimatedShipping}
                onChange={(e) => setEstimatedShipping(e.target.value)}
                placeholder="15"
                className="w-full h-10 pl-7 pr-3 rounded border border-border bg-background text-textPrimary font-bold text-sm focus:outline-none focus:border-neutral-400"
              />
            </div>
          </div>
        </div>

        {/* Breakdown Column */}
        <div className="border-t md:border-t-0 md:border-l border-border pt-4 md:pt-0 md:pl-6 space-y-2 text-xs">
          <div className="text-textSecondary uppercase font-bold mb-2">Cost Breakdown</div>
          <div className="flex justify-between text-textPrimary">
            <span>Est. Resale Value:</span>
            <span className="font-bold">${estimatedMarketValue.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-textSecondary">
            <span>Est. eBay Fees (~13.25%):</span>
            <span>-${ebayFees.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-textSecondary">
            <span>Shipping Cost:</span>
            <span>-${shippingCost.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-textSecondary">
            <span>Your Buy Price:</span>
            <span>-${buyPrice.toFixed(2)}</span>
          </div>
        </div>

        {/* Result Summary Column */}
        <div className="border-t md:border-t-0 md:border-l border-border pt-4 md:pt-0 md:pl-6 flex flex-col justify-center">
          <div className="text-xs text-textSecondary uppercase font-bold mb-1">
            Expected Net Profit
          </div>
          <div className={`text-3xl font-bold ${netProfit >= 0 ? "text-emerald-400" : "text-red-400"}`}>
            ${netProfit.toFixed(2)}
          </div>
          <div className="text-xs text-textSecondary mt-1">
            Estimated ROI: <span className="font-bold text-textPrimary">{roi.toFixed(1)}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}