"use client";

import React from "react";
import { List, ExternalLink, Tag } from "lucide-react";

export interface ActiveListing {
  id: string;
  title: string;
  price: number;
  url: string;
}

interface ActiveListingsTableProps {
  listings: ActiveListing[];
}

export function ActiveListingsTable({ listings }: ActiveListingsTableProps) {
  if (!listings || listings.length === 0) return null;

  return (
    <div className="border border-border rounded-lg bg-surface font-mono text-xs overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border p-4 bg-background">
        <div className="flex items-center gap-2">
          <List className="h-4 w-4 text-buy-good" />
          <h3 className="font-bold text-textPrimary uppercase tracking-wider text-sm">
            Source Data (Active Market Listings)
          </h3>
        </div>
        <span className="text-textSecondary text-[10px] uppercase">
          {listings.length} Listings Found
        </span>
      </div>

      {/* Table */}
      <div className="max-h-[400px] overflow-y-auto">
        <table className="w-full text-left border-collapse">
          <thead className="sticky top-0 bg-neutral-900/95 backdrop-blur z-10 shadow-sm">
            <tr className="border-b border-border text-textSecondary uppercase text-[10px]">
              <th className="p-3 font-bold w-3/4">Listing Title</th>
              <th className="p-3 font-bold">Asking Price</th>
              <th className="p-3 font-bold text-right">View</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {listings.map((listing, i) => (
              <tr key={listing.id || i} className="hover:bg-neutral-800/50 transition-colors">
                <td className="p-3 text-textPrimary truncate max-w-xs md:max-w-md">
                  {listing.title}
                </td>
                <td className="p-3 font-bold text-buy-good">
                  ${listing.price.toFixed(2)}
                </td>
                <td className="p-3 text-right">
                  <a 
                    href={listing.url} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="inline-flex items-center text-textSecondary hover:text-buy-sick transition-colors"
                  >
                    eBay <ExternalLink className="ml-1 h-3 w-3" />
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}