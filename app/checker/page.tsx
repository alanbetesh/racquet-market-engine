"use client";

import React, { useState, useEffect } from "react";
import { Search, DollarSign, Calculator, ArrowLeft, RefreshCw, Tag } from "lucide-react";
import Link from "next/link";
import { fetchRacketResaleValue } from "./actions";

export default function PriceCheckerPage() {
  const [racketQuery, setRacketQuery] = useState("Yonex VCORE 100");
  const [condition, setCondition] = useState<"used" | "new">("used");
  const [buyPrice, setBuyPrice] = useState<string>("120");

  const [resaleValue, setResaleValue] = useState<number>(0);
  const [racketName, setRacketName] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isLive, setIsLive] = useState<boolean>(false);

  // Fetch estimated resale price from eBay API whenever racket query or condition changes
  const loadMarketValuation = async () => {
    if (!racketQuery.trim()) return;
    setIsLoading(true);
    const res = await fetchRacketResaleValue(racketQuery, condition);
    setIsLoading(false);

    if (res.avgPrice) {
      setResaleValue(res.avgPrice);
      setRacketName(res.racketName || racketQuery);
      setIsLive(!!res.isLiveEbayData);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadMarketValuation();
    }, 600); // 600ms debounce to avoid spamming API while typing

    return () => clearTimeout(timer);
  }, [racketQuery, condition]);

  const acquisitionPrice = parseFloat(buyPrice) || 0;

  // Fee calculation (eBay ~13.25% + $0.30 fixed fee, est. shipping $15)
  const ebayFees = resaleValue > 0 ? resaleValue * 0.1325 + 0.30 : 0;
  const shipping = 15;
  const netProfit = resaleValue > 0 ? resaleValue - ebayFees - shipping - acquisitionPrice : 0;
  const roi = acquisitionPrice > 0 ? (netProfit / acquisitionPrice) * 100 : 0;

  const getStatus = () => {
    if (isLoading) return { label: "FETCHING EBAY DATA...", color: "text-textSecondary" };
    if (resaleValue <= 0) return { label: "RACKET NOT FOUND", color: "text-textSecondary" };
    if (acquisitionPrice <= 0) return { label: "ENTER BUY PRICE", color: "text-textSecondary" };
    if (netProfit >= 40 && roi >= 35) return { label: "SICK FLIP 🔥", color: "text-emerald-400" };
    if (netProfit >= 20 && roi >= 18) return { label: "GOOD FLIP 👍", color: "text-blue-400" };
    if (netProfit > 0) return { label: "TIGHT MARGIN ⚠️", color: "text-amber-400" };
    return { label: "NO PROFIT / DO NOT BUY 🛑", color: "text-red-400" };
  };

  const status = getStatus();

  return (
    <div className="max-w-4xl mx-auto p-6 font-mono space-y-6 animate-in fade-in duration-300">
      {/* Back Button */}
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-xs text-textSecondary hover:text-textPrimary transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Dashboard
      </Link>

      <div>
        <h1 className="text-2xl font-bold uppercase tracking-wider text-textPrimary">
          Live Margin Diagnostic Engine
        </h1>
        <p className="text-xs text-textSecondary mt-1">
          Select racket model & condition. Resale value is automatically fetched from live eBay sales data.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column: Inputs */}
        <div className="border border-border rounded-lg bg-surface p-5 space-y-5">
          {/* 1. Racket Search Input */}
          <div>
            <label className="block text-xs uppercase font-bold text-textSecondary mb-2">
              1. Racket Model
            </label>
            <div className="relative">
              <input
                type="text"
                value={racketQuery}
                onChange={(e) => setRacketQuery(e.target.value)}
                placeholder="e.g. Yonex VCORE 100, Speed MP..."
                className="w-full h-10 pl-9 pr-3 rounded border border-border bg-background text-textPrimary text-sm focus:outline-none focus:border-neutral-400 transition-colors"
              />
              <Search className="absolute left-3 top-3 h-4 w-4 text-textSecondary" />
            </div>
          </div>

          {/* 2. Condition Selector Buttons */}
          <div>
            <label className="block text-xs uppercase font-bold text-textSecondary mb-2 flex items-center gap-1.5">
              <Tag className="h-3.5 w-3.5 text-buy-good" /> 2. Racket Condition
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setCondition("used")}
                className={`py-2 px-4 rounded font-bold text-xs uppercase border transition-all ${
                  condition === "used"
                    ? "bg-neutral-100 text-black border-neutral-100 shadow-sm"
                    : "bg-background text-textSecondary border-border hover:border-neutral-500"
                }`}
              >
                Used / Pre-owned
              </button>
              <button
                type="button"
                onClick={() => setCondition("new")}
                className={`py-2 px-4 rounded font-bold text-xs uppercase border transition-all ${
                  condition === "new"
                    ? "bg-neutral-100 text-black border-neutral-100 shadow-sm"
                    : "bg-background text-textSecondary border-border hover:border-neutral-500"
                }`}
              >
                Brand New / Unstrung
              </button>
            </div>
          </div>

          {/* 3. Acquisition Price Input */}
          <div>
            <label className="block text-xs uppercase font-bold text-textSecondary mb-2">
              3. Enter Acquisition Price ($)
            </label>
            <div className="relative">
              <input
                type="number"
                value={buyPrice}
                onChange={(e) => setBuyPrice(e.target.value)}
                placeholder="120.00"
                className="w-full h-10 pl-9 pr-3 rounded border border-border bg-background text-textPrimary text-sm font-bold focus:outline-none focus:border-neutral-400"
              />
              <DollarSign className="absolute left-3 top-3 h-4 w-4 text-textSecondary" />
            </div>
          </div>
        </div>

        {/* Right Column: Automated Diagnostics */}
        <div className="border border-border rounded-lg bg-surface p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Calculator className="h-4 w-4 text-buy-good" />
                <h2 className="font-bold text-sm uppercase text-textPrimary">
                  Margin Diagnostics
                </h2>
              </div>
              {isLoading ? (
                <RefreshCw className="h-4 w-4 text-buy-good animate-spin" />
              ) : isLive ? (
                <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 uppercase font-bold">
                  ● Live Market Feed
                </span>
              ) : null}
            </div>

            <div className="text-xs text-textSecondary mb-1">Target Frame:</div>
            <div className="text-sm font-bold text-textPrimary mb-4">
              {racketName || racketQuery}{" "}
              <span className="text-xs font-normal text-textSecondary uppercase">
                ({condition})
              </span>
            </div>

            <div className="space-y-2 text-xs border-t border-border pt-3">
              <div className="flex justify-between">
                <span className="text-textSecondary">Auto-Calculated Resale Value:</span>
                <span className="font-bold text-emerald-400">
                  {isLoading ? "Fetching..." : `$${resaleValue.toFixed(2)}`}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-textSecondary">Your Acquisition Cost:</span>
                <span className="font-bold text-textPrimary">${acquisitionPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-textSecondary">
                <span>Est. eBay Selling Fees (~13.25%):</span>
                <span>-${ebayFees.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-textSecondary">
                <span>Est. Outbound Shipping:</span>
                <span>-${shipping.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="border-t border-border pt-4 mt-4">
            <div className="text-xs text-textSecondary uppercase font-bold">
              Projected Net Profit
            </div>
            <div className={`text-3xl font-bold mt-1 ${netProfit > 0 ? "text-emerald-400" : "text-red-400"}`}>
              ${netProfit.toFixed(2)}
            </div>
            <div className="text-xs text-textSecondary mt-1">
              Estimated ROI: <span className="font-bold text-textPrimary">{roi.toFixed(1)}%</span>
            </div>
            <div className={`mt-3 text-xs font-bold ${status.color}`}>
              {status.label}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}