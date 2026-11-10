// eBay API Integration for Racket Market Analyzer

export interface EbayListing {
  id: string;
  title: string;
  price: number;
  shippingPrice: number;
  condition: string;
  itemUrl: string;
  imageUrl?: string;
  startTime?: string;
  endTime?: string;
}

export interface EbayMarketResult {
  completedSales: EbayListing[];
  activeListings: EbayListing[];
  avgSoldPrice: number;
  medianSoldPrice: number;
  avgActivePrice: number;
  lowestPrice: number;
  avgDaysToSell: number;
  listingCount: number;
  isLive: boolean;
}

export function buildEbaySearchQuery(userQuery: string): string {
  let clean = userQuery.replace(/[\(\)]/g, '').trim();
  if (!clean.toLowerCase().includes("racket") && !clean.toLowerCase().includes("racquet")) {
    return `${clean} tennis racket`;
  }
  return clean;
}

function isExactUniversalMatch(title: string, userQuery: string): boolean {
  const lowerTitle = title.toLowerCase();
  const lowerQuery = userQuery.toLowerCase().trim();

  // 1. Block Multi-packs & Bundles
  const multiPackTerms = ['pair', 'set of', 'lot of', '2 pack', '2pack', '3 pack', '3pack', '2x', 'x2', '3x', 'x3', 'bundle', 'pair of', '2 rackets', '2 racquets', 'two rackets'];
  for (const term of multiPackTerms) {
    if (!lowerQuery.includes(term) && lowerTitle.includes(term)) return false;
  }

  // 2. Block Standalone Accessories
  const accessoryTerms = ['backpack', 'string reel', 'overgrip', 'dampener', 'stencil'];
  for (const term of accessoryTerms) {
    if (!lowerQuery.includes(term) && lowerTitle.includes(term) && !/\b(racket|racquet|frame)\b/.test(lowerTitle)) return false;
  }

  // 3. Block Critical Weight/Size Variants
  const specModifiers = ['pro', 'tour', 'team', 'lite', 'game', 'ace', 'ultra lite', 'pwr', 'extended', 'stretch'];
  for (const mod of specModifiers) {
    const modRegex = new RegExp(`\\b${mod}\\b`, 'i');
    if (!modRegex.test(lowerQuery) && modRegex.test(lowerTitle)) return false;
  }

  // 4. Block Special Collabs unless explicitly searched
  const editionModifiers = ['kith', 'pro-labs', 'pro labs', 'us open', 'roland garros', 'wimbledon', 'night session', 'noir', 'autograph', 'prototype'];
  for (const ed of editionModifiers) {
    const edRegex = new RegExp(`\\b${ed}\\b`, 'i');
    if (!edRegex.test(lowerQuery) && edRegex.test(lowerTitle)) return false;
  }

  // 5. Block Junior Frames
  if (!lowerQuery.includes('junior') && !lowerQuery.includes('jr')) {
    if (/\b(junior|jr|25"|26"|24"|23"|21"|19"|youth|kids|child)\b/i.test(lowerTitle)) return false;
  }

  // 6. Token Clean Matcher
  const queryTokens = lowerQuery
    .replace(/[^a-z0-9\s]/gi, ' ')
    .replace(/\b(tennis|racket|racquet)\b/gi, '')
    .trim()
    .split(/\s+/)
    .filter((token) => token.length > 0);

  for (const token of queryTokens) {
    if (!lowerTitle.includes(token)) {
      return false;
    }
  }

  return true;
}

// Filter out non-playable or severely damaged rackets
function isPlayableCondition(title: string): boolean {
  const damageTerms = ['cracked', 'crack', 'broken', 'damaged', 'parts only', 'repair', 'structural'];
  const lowerTitle = title.toLowerCase();
  return !damageTerms.some((term) => lowerTitle.includes(term));
}

// RELAXED BARGAIN FLOOR: Calculated directly on exact listings BEFORE median cuts
function calculateLowPriceFloor(listings: EbayListing[]): number {
  const playableListings = listings.filter((l) => isPlayableCondition(l.title));
  if (playableListings.length === 0) return 0;

  // Total Landed Cost (Price + Shipping)
  const landedPrices = playableListings
    .map((l) => l.price + (l.shippingPrice || 0))
    .filter((total) => total >= 20) // Only drop junk under $20
    .sort((a, b) => a - b);

  if (landedPrices.length === 0) return 0;

  // Grab the 5th percentile or 1st/2nd lowest landed price
  const index = Math.min(1, Math.floor(landedPrices.length * 0.05));
  return Math.round(landedPrices[index]);
}

// RELAXED SANITIZER: Allows lower legitimate prices through
function sanitizeListings(listings: EbayListing[], userQuery: string): EbayListing[] {
  if (listings.length === 0) return listings;

  const lowerQuery = userQuery.toLowerCase();
  const isCollectorSearch = ['vintage', 'rare', 'autograph', 'kith', 'custom', 'pro stock'].some((term) => lowerQuery.includes(term));

  const cappedListings = listings.filter((l) => {
    if (!isCollectorSearch && l.price > 350) return false;
    return l.price >= 20; // Lowered floor to allow bargains
  });

  if (cappedListings.length < 3) return cappedListings;

  const sorted = [...cappedListings].sort((a, b) => a.price - b.price);
  const medianPrice = sorted[Math.floor(sorted.length / 2)].price;

  // Expanded boundaries (allows 65% below median up to 50% above)
  const maxPrice = medianPrice * 1.50;
  const minPrice = medianPrice * 0.35;

  return cappedListings.filter((l) => l.price >= minPrice && l.price <= maxPrice);
}

export async function fetchEbayMarketData(
  query: string,
  conditionFilter: "used" | "new" | "all" = "used"
): Promise<EbayMarketResult> {
  const formattedQuery = buildEbaySearchQuery(query);
  const clientId = process.env.EBAY_CLIENT_ID;
  const clientSecret = process.env.EBAY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return {
      completedSales: [],
      activeListings: [],
      avgSoldPrice: 0,
      medianSoldPrice: 0,
      avgActivePrice: 0,
      lowestPrice: 0,
      avgDaysToSell: 0,
      listingCount: 0,
      isLive: false,
    };
  }

  try {
    const authHeader = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
    const tokenResponse = await fetch("https://api.ebay.com/identity/v1/oauth2/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${authHeader}`,
      },
      body: "grant_type=client_credentials&scope=https://api.ebay.com/oauth/api_scope",
      cache: "no-store",
    });

    if (!tokenResponse.ok) throw new Error("Failed to authenticate with eBay API");

    const { access_token } = await tokenResponse.json();

    let conditionParam = "";
    if (conditionFilter === "used") conditionParam = "&filter=conditionIds:{3000}";
    if (conditionFilter === "new") conditionParam = "&filter=conditionIds:{1000}";

    const browseUrl = `https://api.ebay.com/buy/browse/v1/item_summary/search?q=${encodeURIComponent(
      formattedQuery
    )}&limit=100${conditionParam}`;

    const browseRes = await fetch(browseUrl, {
      headers: {
        Authorization: `Bearer ${access_token}`,
        "X-EBAY-C-MARKETPLACE-ID": "EBAY_US",
      },
      cache: "no-store",
    });

    if (!browseRes.ok) throw new Error("Failed to fetch listings from eBay Browse API");

    const browseData = await browseRes.json();
    const rawItems = browseData.itemSummaries || [];

    const exactListings: EbayListing[] = rawItems
      .filter((item: any) => isExactUniversalMatch(item.title, query))
      .map((item: any) => ({
        id: item.itemId,
        title: item.title,
        price: parseFloat(item.price?.value || "0"),
        shippingPrice: parseFloat(item.shippingOptions?.[0]?.shippingCost?.value || "0"),
        condition: item.condition || "Pre-owned",
        itemUrl: item.itemWebUrl,
        imageUrl: item.image?.imageUrl,
        startTime: item.itemCreationDate,
        endTime: item.itemEndDate,
      }));

    // CRITICAL: Calculate low price floor BEFORE median sanitization removes cheaper listings
    const lowPriceFloor = calculateLowPriceFloor(exactListings);

    // Sanitize active listings for the rest of the metrics & list
    const activeListings = sanitizeListings(exactListings, query);
    const activePrices = activeListings.map((l) => l.price).filter((p) => p > 0);

    const sortedPrices = [...activePrices].sort((a, b) => a - b);
    const medianSoldPrice = sortedPrices.length > 0 ? sortedPrices[Math.floor(sortedPrices.length / 2)] : 0;
    const avgActivePrice = activePrices.length > 0 ? Math.round(activePrices.reduce((a, b) => a + b, 0) / activePrices.length) : 0;

    let totalDays = 0;
    let countedListings = 0;

    activeListings.forEach((item) => {
      if (item.startTime && item.endTime) {
        const start = new Date(item.startTime).getTime();
        const end = new Date(item.endTime).getTime();
        const diffDays = Math.max(1, Math.round((end - start) / (1000 * 60 * 60 * 24)));
        totalDays += diffDays;
        countedListings++;
      }
    });

    const avgDaysToSell = countedListings > 0 ? Math.round(totalDays / countedListings) : (conditionFilter === 'new' ? 12 : 7);

    return {
      completedSales: activeListings,
      activeListings,
      avgSoldPrice: avgActivePrice,
      medianSoldPrice: medianSoldPrice,
      avgActivePrice,
      lowestPrice: lowPriceFloor,
      avgDaysToSell,
      listingCount: activeListings.length,
      isLive: true,
    };
  } catch (error) {
    console.error("[eBay API Engine Error]:", error);
    return {
      completedSales: [],
      activeListings: [],
      avgSoldPrice: 0,
      medianSoldPrice: 0,
      avgActivePrice: 0,
      lowestPrice: 0,
      avgDaysToSell: 0,
      listingCount: 0,
      isLive: false,
    };
  }
}