"use server";

import { fetchEbayMarketData } from "@/lib/ebay";

export async function fetchRacketResaleValue(query: string, condition: "used" | "new" | "all" = "used") {
  if (!query || query.trim().length === 0) {
    return { avgPrice: 0, racketName: "", error: "Please enter a racket name." };
  }

  try {
    // Point the checker directly to our new live eBay engine!
    const data = await fetchEbayMarketData(query, condition);
    return {
      avgPrice: data.avgSoldPrice || 0,
      racketName: query,
      isLiveEbayData: data.isLive,
      error: null,
    };
  } catch (err) {
    console.error("[Price Checker] Error fetching resale value:", err);
    return { avgPrice: 0, racketName: query, error: "Failed to fetch market data." };
  }
}