'use client';

import React, { useState, useEffect, Suspense, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import AutocompleteSearch from '@/components/AutocompleteSearch';
import { RacketMasterEntry } from '@/lib/racketsDatabase';

interface MarketData {
  query?: string;
  condition?: string;
  avgPrice?: number;
  medianPrice?: number;
  highestPrice?: number;
  lowestPrice?: number;
  salesVolume?: number;
  avgDaysToSell?: number;
  ebaySearchQuery?: string;
  history?: Array<{ date: string; price: number }>;
  listings?: Array<{
    title: string;
    price: number;
    shippingPrice?: number;
    imageUrl?: string;
    date?: string;
    url?: string;
    condition?: string;
  }>;
  isLiveEbayData?: boolean;
}

function AnalyzeContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const query = searchParams.get('query') || 'Yonex VCORE 100';
  const initialCondition = searchParams.get('condition') || 'used';

  const [condition, setCondition] = useState<string>(initialCondition);
  const [data, setData] = useState<MarketData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<'high-to-low' | 'low-to-high' | 'default'>('high-to-low');

  const [searchInputValue, setSearchInputValue] = useState(query);

  useEffect(() => {
    setSearchInputValue(query);
  }, [query]);

  const handleSelectNewRacket = (racket: RacketMasterEntry) => {
    setSearchInputValue(racket.fullName);
    router.push(`/analyze?query=${encodeURIComponent(racket.fullName)}&condition=${condition}`);
  };

  useEffect(() => {
    async function fetchMarketData() {
      setLoading(true);
      setError(null);
      try {
        const cacheBuster = new Date().getTime();
        
        // CLEAN QUERY FOR API: Remove parentheses and normalize spaces before fetching
        const cleanFetchQuery = query.replace(/[()]/g, '').replace(/\s+/g, ' ').trim();

        const response = await fetch(
          `/api/market?query=${encodeURIComponent(cleanFetchQuery)}&condition=${encodeURIComponent(condition)}&t=${cacheBuster}`,
          { cache: 'no-store' }
        );

        if (!response.ok) throw new Error('Failed to fetch market data');
        const result = await response.json();
        setData(result);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    }
    fetchMarketData();
  }, [query, condition]);

  const avgPrice = data?.avgPrice ?? 0;
  const medianPrice = data?.medianPrice ?? avgPrice ?? 0;
  const lowestBasePrice = data?.lowestPrice ?? 0;
  const salesVolume = data?.salesVolume ?? data?.listings?.length ?? 0;
  const avgDaysToSell = data?.avgDaysToSell ?? 7;
  const isLiveFeed = !!data?.isLiveEbayData;

  const lowestLandedPrice = useMemo(() => {
    if (!data?.listings || data.listings.length === 0) return 0;
    return Math.min(...data.listings.map(item => item.price + (item.shippingPrice || 0)));
  }, [data?.listings]);

  const sortedListings = useMemo(() => {
    if (!data?.listings) return [];
    const list = [...data.listings];
    if (sortOrder === 'high-to-low') return list.sort((a, b) => b.price - a.price);
    if (sortOrder === 'low-to-high') return list.sort((a, b) => a.price - b.price);
    return list;
  }, [data?.listings, sortOrder]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-800 border border-slate-700 p-3 rounded-lg shadow-xl">
          <p className="text-slate-300 text-sm mb-1">{label}</p>
          <p className="text-emerald-400 font-bold text-lg">${payload[0].value.toFixed(2)}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-12">
      <div className="max-w-6xl mx-auto space-y-8">
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-slate-800 pb-6">
          <div className="w-full max-w-md relative z-50">
            <Link href="/checker" className="text-emerald-400 hover:text-emerald-300 text-sm font-semibold transition-colors mb-4 inline-block">
              &larr; Back to Checker
            </Link>
            <div className="mt-2">
              <AutocompleteSearch 
                value={searchInputValue}
                onChange={setSearchInputValue}
                onSelectRacket={handleSelectNewRacket}
              />
            </div>
            <p className="text-slate-400 text-sm mt-2">Market valuation and historical pricing data</p>
          </div>

          <div className="flex bg-slate-900 border border-slate-800 rounded-lg p-1 space-x-1">
            {['all', 'used', 'new'].map((cond) => (
              <button
                key={cond}
                suppressHydrationWarning
                onClick={() => {
                  setCondition(cond);
                  router.push(`/analyze?query=${encodeURIComponent(query)}&condition=${cond}`);
                }}
                className={`px-4 py-2 rounded-md text-sm font-medium capitalize transition-all ${
                  condition === cond
                    ? 'bg-emerald-500 text-slate-950 font-bold shadow'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                {cond}
              </button>
            ))}
          </div>
        </div>

        {loading && (
          <div className="py-20 text-center space-y-3">
            <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-slate-400 text-sm">Analyzing live {condition} market data...</p>
          </div>
        )}

        {error && !loading && (
          <div className="p-4 bg-red-950/50 border border-red-800/50 rounded-xl text-red-300 text-sm">
            {error}
          </div>
        )}

        {!loading && !error && (
          <div className="space-y-8">
            <div className="flex items-center space-x-2">
              <span className={`w-2.5 h-2.5 rounded-full ${isLiveFeed ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
              <span className="text-xs font-semibold tracking-wider text-slate-400 uppercase">
                {isLiveFeed ? 'Live eBay Data Verified' : 'Market Estimates Active'}
              </span>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 font-mono text-xs space-y-2">
              <p className="text-slate-400">
                <span className="font-bold uppercase tracking-wider text-slate-300">eBay API search:</span>{' '}
                <span className="text-emerald-400">{data?.ebaySearchQuery ?? query}</span>
              </p>
              <p className="text-slate-400">
                <span className="font-bold uppercase tracking-wider text-slate-300">Typed in search:</span>{' '}
                <span className="text-white">{query}</span>
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                <div className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-1">Market Average</div>
                <div className="text-3xl font-black text-emerald-400">${avgPrice.toFixed(2)}</div>
                <div className="text-xs text-slate-400 font-medium mt-1">
                  Based on <span className="text-emerald-400 font-bold">{salesVolume}</span> {condition.toUpperCase()} listings
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
                <div>
                  <div className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-1">Bargain Floor</div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black text-amber-400">${lowestBasePrice.toFixed(2)}</span>
                  </div>
                  <div className="text-xs text-slate-400 font-medium mt-1">Base Price</div>
                </div>
                <div className="mt-3 pt-3 border-t border-slate-800">
                  <div className="text-xl font-bold text-emerald-400">${lowestLandedPrice.toFixed(2)}</div>
                  <div className="text-xs text-slate-500 font-medium">Landed (With Shipping)</div>
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                <div className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-1">Median Price</div>
                <div className="text-3xl font-black text-white">${medianPrice.toFixed(2)}</div>
                <div className="text-xs text-slate-500 mt-1">Middle market baseline</div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                <div className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-1">Avg. Time to Sell</div>
                <div className="text-3xl font-black text-white">~{avgDaysToSell} Days</div>
                <div className="text-xs text-slate-500 mt-1">Estimated velocity at this price</div>
              </div>
            </div>

            {data?.history && data.history.length > 0 && (
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 relative z-0">
                <h2 className="text-lg font-bold text-white mb-6">90-Day Price Trend</h2>
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data.history} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                      <XAxis dataKey="date" stroke="#64748b" tick={{ fill: '#64748b', fontSize: 12 }} tickMargin={10} />
                      <YAxis stroke="#64748b" tick={{ fill: '#64748b', fontSize: 12 }} tickFormatter={(value) => `$${value}`} domain={['auto', 'auto']} />
                      <Tooltip content={<CustomTooltip />} />
                      <Line type="monotone" dataKey="price" stroke="#34d399" strokeWidth={3} dot={{ fill: '#0f172a', stroke: '#34d399', strokeWidth: 2, r: 4 }} activeDot={{ r: 6, fill: '#34d399' }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {sortedListings.length > 0 && (
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 relative z-0">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-4 border-b border-slate-800">
                  <h2 className="text-lg font-bold text-white">
                    Active Market Listings ({sortedListings.length})
                  </h2>
                  <div className="flex items-center gap-2">
                    <label htmlFor="sort-order" className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Sort By:
                    </label>
                    <select
                      id="sort-order"
                      value={sortOrder}
                      onChange={(e) => setSortOrder(e.target.value as any)}
                      className="bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-lg p-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                    >
                      <option value="high-to-low">Price: High to Low</option>
                      <option value="low-to-high">Price: Low to High</option>
                      <option value="default">Default Order</option>
                    </select>
                  </div>
                </div>

                <div className="divide-y divide-slate-800/50">
                  {sortedListings.map((item, index) => (
                    <div key={index} className="py-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 hover:bg-slate-800/20 transition-colors rounded-lg px-2 -mx-2">
                      <div className="flex items-start gap-3 min-w-0 flex-1">
                        <span className="flex-shrink-0 w-7 h-7 rounded-full bg-slate-800 border border-slate-700 text-slate-300 font-mono font-bold text-xs flex items-center justify-center mt-0.5">
                          {index + 1}
                        </span>
                        <div className="relative h-20 w-16 shrink-0 overflow-hidden rounded-md border border-slate-700 bg-slate-800">
                          {item.imageUrl ? (
                            <Image
                              src={item.imageUrl}
                              alt=""
                              fill
                              sizes="64px"
                              className="object-cover"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center px-1 text-center text-[9px] font-bold uppercase text-slate-500">
                              No image
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-slate-200 font-medium truncate" title={item.title}>
                            {item.title}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            {item.condition && (
                              <span className="text-xs font-semibold px-2 py-0.5 bg-slate-800 text-slate-400 rounded-md capitalize">
                                {item.condition}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 sm:gap-1 flex-shrink-0">
                        <div className="text-right">
                          <span className="text-emerald-400 font-bold text-lg">${item.price.toFixed(2)}</span>
                          {item.shippingPrice !== undefined && (
                            <span className="text-xs text-slate-400 ml-1.5 block sm:inline">
                              {item.shippingPrice === 0 ? '+ Free Shipping' : `+ $${item.shippingPrice.toFixed(2)} shipping`}
                            </span>
                          )}
                        </div>
                        
                        {item.url && (
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded transition-colors"
                          >
                            Verify on eBay &rarr;
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function AnalyzePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-950 text-slate-100 p-12 text-center">
          <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400 text-sm">Loading market interface...</p>
        </div>
      }
    >
      <AnalyzeContent />
    </Suspense>
  );
}
