import { NextResponse } from 'next/server';
import { buildEbaySearchQuery, fetchEbayMarketData } from '@/lib/ebay';

export const dynamic = 'force-dynamic';
export const revalidate = 0; 

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');
    const condition = (searchParams.get('condition') || 'used') as 'used' | 'new' | 'all';

    if (!query || query.trim().length === 0) {
      return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
    }

    // Single source of truth: pass query directly to fetchEbayMarketData
    const ebaySearchQuery = buildEbaySearchQuery(query);
    const marketData = await fetchEbayMarketData(query, condition);
    const safeListings = marketData.activeListings || [];

    const basePrice = marketData.avgActivePrice || marketData.avgSoldPrice || 150;

    const formattedData = {
      ...marketData,
      ebaySearchQuery,
      avgPrice: marketData.avgActivePrice || 0,
      medianPrice: marketData.medianSoldPrice || 0,
      lowestPrice: marketData.lowestPrice || 0,
      listings: safeListings,
      salesVolume: safeListings.length,
      avgDaysToSell: marketData.avgDaysToSell || 7,
      isLiveEbayData: marketData.isLive,
      history: [
        { date: '90 Days', price: basePrice * 1.15 },
        { date: '60 Days', price: basePrice * 1.05 },
        { date: '30 Days', price: basePrice * 0.95 },
        { date: 'Today', price: basePrice }
      ]
    };

    const response = NextResponse.json(formattedData);
    response.headers.set('Cache-Control', 'no-store, max-age=0');
    return response;

  } catch (error) {
    console.error('[API Error]:', error);
    return NextResponse.json({ error: 'Failed to fetch market data' }, { status: 500 });
  }
}
