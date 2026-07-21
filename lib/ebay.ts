// eBay API Integration for Racket Market Analyzer

export interface EbayListing {
  id: string;
  title: string;
  price: number;
  shippingPrice: number;
  condition: string;
  itemUrl: string;
  imageUrl?: string;
  endTime?: string;
}

export interface EbayMarketResult {
  completedSales: EbayListing[];
  activeListings: EbayListing[];
  avgSoldPrice: number;
  medianSoldPrice: number;
  avgActivePrice: number;
  isLive: boolean;
}

// Cleans up user input & expands special colorway/edition aliases for eBay
export function buildEbaySearchQuery(userQuery: string): string {
  let clean = userQuery.trim();

  // Normalize common colorway / special edition slang for eBay title matches
  clean = clean
    .replace(/\bRG\b/gi, "Roland Garros")
    .replace(/\bRoland Garros\b/gi, "Roland Garros Session de Soiree")
    .replace(/\bParis\b/gi, "Roland Garros")
    .replace(/\bBoom MP Purple\b/gi, "Boom MP Alternate Lavender Purple")
    .replace(/\bBoom Purple\b/gi, "Boom Alternate Lavender Purple")
    .replace(/\bNoir\b/gi, "Noir Limited Edition")
    .replace(/\bRafa\b/gi, "Rafa Origin");

  // Ensure "tennis racket" context exists if not specified
  if (!clean.toLowerCase().includes("racket") && !clean.toLowerCase().includes("racquet")) {
    return `${clean} tennis racket`;
  }

  return clean;
}

// NEW: Helper function to detect and block multi-packs from skewing the data
function isSingleRacket(title: string): boolean {
  const lowerTitle = title.toLowerCase();
  
  // Regex to catch "pair", "set of 2", "2x", "x2", "lot of", "two", "3x", etc.
  // We explicitly look for these bundle indicators.
  const multiPackRegex = /\b(pair|set of|lot of|2x|x2|3x|x3|two|three)\b/i;
  
  // Also catch "2 rackets" or "2 racquets"
  const explicitNumberRegex = /\b[2-5]\s+(rackets?|racquets?|frames?)\b/i;

  if (multiPackRegex.test(lowerTitle) || explicitNumberRegex.test(lowerTitle)) {
    return false; // It's a bundle, throw it out!
  }
  
  return true; // It's a safe, single racket.
}

// Fetch live sales and active listings from eBay Sandbox/Production API
export async function fetchEbayMarketData(
  query: string,
  conditionFilter: "used" | "new" | "all" = "used"
): Promise<EbayMarketResult> {
  const formattedQuery = buildEbaySearchQuery(query);
  const clientId = process.env.EBAY_CLIENT_ID;
  const clientSecret = process.env.EBAY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    console.warn("[eBay Engine] Missing API credentials. Falling back to local calculations.");
    return {
      completedSales: [],
      activeListings: [],
      avgSoldPrice: 0,
      medianSoldPrice: 0,
      avgActivePrice: 0,
      isLive: false,
    };
  }

  try {
    // 1. OAuth Token Request
    const authHeader = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
    const tokenResponse = await fetch("https://api.ebay.com/identity/v1/oauth2/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${authHeader}`,
      },
      body: "grant_type=client_credentials&scope=https://api.ebay.com/oauth/api_scope",
      next: { revalidate: 3600 },
    });

    if (!tokenResponse.ok) {
      throw new Error("Failed to authenticate with eBay API");
    }

    const { access_token } = await tokenResponse.json();

    // Condition mapping: 3000 = Used, 1000 = New
    let conditionParam = "";
    if (conditionFilter === "used") conditionParam = "&filter=conditions:{3000}";
    if (conditionFilter === "new") conditionParam = "&filter=conditions:{1000}";

    // 2. Query Browse API for active listings
    const browseUrl = `https://api.ebay.com/buy/browse/v1/item_summary/search?q=${encodeURIComponent(
      formattedQuery
    )}&limit=30${conditionParam}`; // Increased limit slightly to account for filtered items

    const browseRes = await fetch(browseUrl, {
      headers: {
        Authorization: `Bearer ${access_token}`,
        "X-EBAY-C-MARKETPLACE-ID": "EBAY_US",
      },
      next: { revalidate: 900 }, // Cache active listings for 15 mins
    });

    if (!browseRes.ok) {
      throw new Error("Failed to fetch listings from eBay Browse API");
    }

    const browseData = await browseRes.json();
    const rawItems = browseData.itemSummaries || [];

    // 3. Map and FILTER the listings using our new multi-pack blocker
    const activeListings: EbayListing[] = rawItems
      .filter((item: any) => isSingleRacket(item.title)) // Only keep single items!
      .map((item: any) => ({
        id: item.itemId,
        title: item.title,
        price: parseFloat(item.price?.value || "0"),
        shippingPrice: parseFloat(item.shippingOptions?.[0]?.shippingCost?.value || "0"),
        condition: item.condition || "Pre-owned",
        itemUrl: item.itemWebUrl,
        imageUrl: item.image?.imageUrl,
      }));

    const activePrices = activeListings.map((l) => l.price).filter((p) => p > 0);
    
    // Sort prices to find a proper median
    const sortedPrices = [...activePrices].sort((a, b) => a - b);
    const medianSoldPrice = sortedPrices.length > 0 
      ? sortedPrices[Math.floor(sortedPrices.length / 2)] 
      : 0;

    const avgActivePrice =
      activePrices.length > 0
        ? Math.round(activePrices.reduce((a, b) => a + b, 0) / activePrices.length)
        : 0;

    return {
      completedSales: activeListings, // Using live browse set for valuation
      activeListings,
      avgSoldPrice: avgActivePrice,
      medianSoldPrice: medianSoldPrice,
      avgActivePrice,
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
      isLive: false,
    };
  }
}