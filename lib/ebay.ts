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
  // Strip parentheses and special chars for clean search string
  let clean = userQuery
    .replace(/[\(\)]/g, ' ')
    .replace(/[^a-zA-Z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  // Strip restrictive colorways that sellers omit in titles
  const restrictiveEditions = [
    'sand beige', 'aqua night black', 'galaxy black', 'naomi osaka edition', 
    'roland garros', 'us open', 'night session', 'laver cup', 'reverse', 
    'alternate color', '25th anniversary', 'wimbledon', '30th anniversary'
  ];

  restrictiveEditions.forEach((ed) => {
    const reg = new RegExp(`\\b${ed}\\b`, 'gi');
    clean = clean.replace(reg, '');
  });

  // Wilson-style version tags (v8, v9, v14) already identify the generation.
  // A trailing year is usually redundant and makes the eBay query needlessly
  // restrictive. Keep years for families such as VCORE, where the year is the
  // generation identifier.
  if (hasExplicitGenerationTag(clean)) {
    clean = clean.replace(/\b(?:19|20)\d{2}\b/g, ' ');
  }

  clean = clean.replace(/\s+/g, ' ').trim();

  if (!clean.toLowerCase().includes("racket") && !clean.toLowerCase().includes("racquet")) {
    return `${clean} tennis racket`;
  }
  return clean;
}

function hasExplicitGenerationTag(query: string): boolean {
  return /\bv\s*\d+\b/i.test(query)
    || /\b(?:auxetic(?:\s*2(?:\.0)?)?|360\+?|gen\s*\d+|\d+(?:st|nd|rd|th)\s+gen)\b/i.test(query);
}

// Collapses all letter/number spacing: "100 L" -> "100l", "v 9" -> "v9"
function normalizeStr(str: string): string {
  return str
    .toLowerCase()
    .replace(/(\d+)\s*([a-z]+)/gi, '$1$2')
    .replace(/([a-z]+)\s*(\d+)/gi, '$1$2')
    .replace(/[^a-z0-9]/gi, '')
    .trim();
}

function isExactUniversalMatch(title: string, userQuery: string): boolean {
  const lowerTitle = title.toLowerCase();
  const lowerQuery = userQuery.toLowerCase().trim();

  // 1. Block Multi-packs, Bundles & Multi-racket Lots
  const multiPackTerms = [
    'pair', 'set of', 'lot of', '2 pack', '2pack', '3 pack', '3pack',
    '2x', 'x2', '3x', 'x3', 'bundle', 'pair of', '2 rackets',
    '2 racquets', 'two rackets', 'both', 'price for both',
  ];
  for (const term of multiPackTerms) {
    if (!lowerQuery.includes(term) && lowerTitle.includes(term)) return false;
  }

  // 2. Block Standalone Accessories, Grommets, Strings & Bags
  const accessoryTerms = ['backpack', 'bag', 'cover', 'case', 'string reel', 'overgrip', 'dampener', 'stencil', 'grommet', 'bumperguard', 'bumper', 'buffer', 'towel', 'apparel'];
  for (const term of accessoryTerms) {
    if (!lowerQuery.includes(term) && lowerTitle.includes(term)) return false;
  }

  // 3. Block Critical Weight/Size Model Modifiers unless explicitly searched
  const specModifiers = ['pro', 'tour', 'team', 'lite', 'game', 'ace', 'ultra lite', 'pwr', 'extended', 'stretch', 'plus', 'hd'];
  for (const mod of specModifiers) {
    const modRegex = new RegExp(`\\b${mod}\\b`, 'i');
    if (!modRegex.test(lowerQuery) && modRegex.test(lowerTitle)) return false;
  }

  // 4. Block Junior Frames
  if (!lowerQuery.includes('junior') && !lowerQuery.includes('jr')) {
    if (/\b(junior|jr|25"|26"|24"|23"|21"|19"|youth|kids|child)\b/i.test(lowerTitle)) return false;
  }

  // 5. UNIVERSAL CONFLICT-ONLY YEAR & GENERATION FILTERING
  const yearInQueryMatch = lowerQuery.match(/\b(19|20)\d{2}\b/);
  if (yearInQueryMatch && !hasExplicitGenerationTag(lowerQuery)) {
    const queriedYear = parseInt(yearInQueryMatch[0], 10);
    const yearsInTitle = lowerTitle.match(/\b(19|20)\d{2}\b/g);

    if (yearsInTitle) {
      const hasConflictingYear = yearsInTitle.some((y) => parseInt(y, 10) !== queriedYear);
      if (hasConflictingYear) return false;
    }

    if (queriedYear >= 2023 && queriedYear <= 2025) {
      if (/\b(2018|2019|2021|2026|6th gen|gen 6|5th gen|gen 5|8th gen|gen 8|v8|v6|v5|galaxy black)\b/i.test(lowerTitle)) {
        return false;
      }
    } else if (queriedYear <= 2021) {
      if (/\b(2023|2024|2026|7th gen|gen 7|8th gen|gen 8|v9|v14|sand beige)\b/i.test(lowerTitle)) {
        return false;
      }
    }
  }

  // 6. SPACE-INSENSITIVE TOKEN MATCHING
  // Compress spaces entirely for comparison: "yonexvcore100l"
  const compressedTitle = normalizeStr(lowerTitle);
  
  const ignoreTokens = ['tennis', 'racket', 'racquet', 'sand', 'beige', 'scarlet', 'red', 'black', 'edition', 'limited', '2023', '2024', '2022', '2021', '2020', '2019', '2018'];

  // Process user tokens space-insensitively
  const queryTokens = lowerQuery
    .replace(/[^a-z0-9\s]/gi, ' ')
    .split(/\s+/)
    .map(t => t.trim())
    .filter((token) => token.length > 0 && !ignoreTokens.includes(token));

  for (const token of queryTokens) {
    const cleanToken = normalizeStr(token);
    if (cleanToken && !compressedTitle.includes(cleanToken)) {
      return false;
    }
  }

  return true;
}

function isPlayableCondition(title: string): boolean {
  const damageTerms = ['cracked', 'crack', 'broken', 'damaged', 'parts only', 'repair', 'structural'];
  const lowerTitle = title.toLowerCase();
  return !damageTerms.some((term) => lowerTitle.includes(term));
}

function calculateLowPriceFloor(listings: EbayListing[]): number {
  const playableListings = listings.filter((l) => isPlayableCondition(l.title));
  if (playableListings.length === 0) return 0;

  const landedPrices = playableListings
    .map((l) => l.price + (l.shippingPrice || 0))
    .filter((total) => total >= 20)
    .sort((a, b) => a - b);

  if (landedPrices.length === 0) return 0;

  const index = Math.min(1, Math.floor(landedPrices.length * 0.05));
  return Math.round(landedPrices[index]);
}

function sanitizeListings(listings: EbayListing[], userQuery: string): EbayListing[] {
  if (listings.length === 0) return listings;

  const lowerQuery = userQuery.toLowerCase();
  const isCollectorSearch = ['vintage', 'rare', 'autograph', 'kith', 'custom', 'pro stock'].some((term) => lowerQuery.includes(term));

  const cappedListings = listings.filter((l) => {
    if (!isCollectorSearch && l.price > 450) return false;
    return l.price >= 35;
  });

  if (cappedListings.length < 3) return cappedListings;

  const sorted = [...cappedListings].sort((a, b) => a.price - b.price);
  const medianPrice = sorted[Math.floor(sorted.length / 2)].price;

  const maxPrice = medianPrice * 1.70;
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
    console.error("[eBay Engine Error]: Missing EBAY_CLIENT_ID or EBAY_CLIENT_SECRET in process.env at runtime");
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

    if (!tokenResponse.ok) {
      const errText = await tokenResponse.text();
      throw new Error(`eBay Auth Failed (${tokenResponse.status}): ${errText}`);
    }

    const { access_token } = await tokenResponse.json();

    let conditionFilterString = "";
    if (conditionFilter === "used") conditionFilterString = "&filter=conditions:{USED}";
    if (conditionFilter === "new") conditionFilterString = "&filter=conditions:{NEW}";

    const browseUrl = `https://api.ebay.com/buy/browse/v1/item_summary/search?q=${encodeURIComponent(
      formattedQuery
    )}&limit=100${conditionFilterString}`;

    const browseRes = await fetch(browseUrl, {
      headers: {
        Authorization: `Bearer ${access_token}`,
        "X-EBAY-C-MARKETPLACE-ID": "EBAY_US",
      },
      cache: "no-store",
    });

    if (!browseRes.ok) {
      const errText = await browseRes.text();
      throw new Error(`eBay Browse Search Failed (${browseRes.status}): ${errText}`);
    }

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

    const lowPriceFloor = calculateLowPriceFloor(exactListings);
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
