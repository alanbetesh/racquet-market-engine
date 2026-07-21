import { fetchEbayMarketData } from "./ebay";

export type RacketCondition = "used" | "new" | "all";

export interface MarketMetrics {
  marketScore: number;
  daysToSell: number;
  confidenceScore: number;
}

export interface BuyZone {
  min: number;
  max: number;
}

export interface BuyZones {
  sick: BuyZone;
  good: BuyZone;
  fair: BuyZone;
  bad: BuyZone;
}

export interface ListingItem {
  id: string;
  title: string;
  price: number;
  url: string;
}

export interface MarketData {
  racketName: string;
  modelYear?: string;
  condition: RacketCondition;
  isLiveEbayData: boolean;
  metrics: MarketMetrics;
  buyZones: BuyZones;
  completedSales: {
    avgPrice: number;
    medianPrice: number;
    lowestPrice: number;
    highestPrice: number;
    volume: number;
  };
  activeListings: {
    avgPrice: number;
    medianPrice: number;
    lowestPrice: number;
    highestPrice: number;
    volume: number;
    allListings: ListingItem[];
  };
  chartData: { date: string; avgPrice: number }[];
}

export async function generateMarketData(
  query: string,
  slug?: string,
  condition: RacketCondition = "used"
): Promise<MarketData> {
  const liveEbay = await fetchEbayMarketData(query, condition);
  console.log(`[Market Engine] Live eBay Data Received?`, liveEbay ? "YES" : "NO");

  const basePrice = liveEbay ? liveEbay.avgPrice : 175;
  const isLive = liveEbay !== null;

  const activeAvg = liveEbay ? liveEbay.avgPrice : basePrice;
  const activeMedian = liveEbay ? liveEbay.medianPrice : basePrice - 5;
  const activeLowest = liveEbay ? liveEbay.lowestPrice : basePrice - 35;
  const activeHighest = liveEbay ? liveEbay.highestPrice : basePrice + 45;
  const activeVolume = liveEbay ? liveEbay.volume : 18;

  const sickMax = Math.round(basePrice * 0.65);
  const goodMax = Math.round(basePrice * 0.82);
  const fairMax = Math.round(basePrice * 0.98);

  return {
    racketName: query,
    modelYear: "2024",
    condition,
    isLiveEbayData: isLive,
    metrics: {
      marketScore: 88,
      daysToSell: 9,
      confidenceScore: isLive ? 95 : 82,
    },
    buyZones: {
      sick: { min: 0, max: sickMax },
      good: { min: sickMax + 1, max: goodMax },
      fair: { min: goodMax + 1, max: fairMax },
      bad: { min: fairMax + 1, max: 999 },
    },
    completedSales: {
      avgPrice: Math.round(basePrice * 0.92),
      medianPrice: Math.round(basePrice * 0.90),
      lowestPrice: Math.round(basePrice * 0.60),
      highestPrice: Math.round(basePrice * 1.15),
      volume: 24,
    },
    activeListings: {
      avgPrice: activeAvg,
      medianPrice: activeMedian,
      lowestPrice: activeLowest,
      highestPrice: activeHighest,
      volume: activeVolume,
      allListings: liveEbay ? liveEbay.allListings : [],
    },
    chartData: [
      { date: "Jan", avgPrice: Math.round(basePrice * 0.95) },
      { date: "Feb", avgPrice: Math.round(basePrice * 0.98) },
      { date: "Mar", avgPrice: Math.round(basePrice * 0.92) },
      { date: "Apr", avgPrice: Math.round(basePrice * 1.02) },
      { date: "May", avgPrice: Math.round(basePrice * 1.00) },
      { date: "Jun", avgPrice: basePrice },
    ],
  };
}