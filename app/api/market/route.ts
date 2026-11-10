import { NextResponse } from 'next/server';
import { fetchEbayMarketData } from '@/lib/ebay';

export const dynamic = 'force-dynamic';
export const revalidate = 0; 

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');
    const condition = searchParams.get('condition') || 'used';

    if (!query || query.trim().length === 0) {
      return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
    }

    const marketData = await fetchEbayMarketData(query, condition as any);
    const basePrice = marketData?.avgSoldPrice || marketData?.avgPrice || 150;

    const rawListings = marketData?.activeListings || marketData?.listings || [];

    const safeListings = rawListings.map((item: any) => ({
      ...item,
      url: item.url || item.itemWebUrl || item.itemUrl || item.viewItemURL || item.link || null
    }));

    const formattedData = {
      ...marketData,
      avgPrice: marketData?.avgSoldPrice || marketData?.avgPrice || 0,
      medianPrice: marketData?.medianSoldPrice || marketData?.medianPrice || 0,
      lowestPrice: marketData?.lowestPrice || 0,
      listings: safeListings,
      salesVolume: marketData?.listingCount || safeListings.length || 0,
      avgDaysToSell: marketData?.avgDaysToSell || 7,
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