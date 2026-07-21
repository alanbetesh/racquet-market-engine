"use client";

import React from "react";
import { ExternalLink, Tag, Package } from "lucide-react";

interface Listing {
  id: string;
  title: string;
  price: number;
  shippingPrice: number;
  condition: string;
  itemUrl: string;
  imageUrl?: string;
}

interface ActiveListingsTableProps {
  listings: Listing[];
}

export function ActiveListingsTable({ listings }: ActiveListingsTableProps) {
  if (!listings || listings.length === 0) {
    return (
      <div className="w-full p-6 text-center border border-border border-dashed rounded-lg bg-surface text-textSecondary text-xs font-mono uppercase tracking-widest">
        No Active Listings Found
      </div>
    );
  }

  return (
    <div className="overflow-x-auto border border-border rounded-lg bg-surface font-mono">
      <table className="w-full text-left text-xs text-textPrimary">
        <thead className="bg-neutral-900/50 border-b border-border text-textSecondary uppercase tracking-wider">
          <tr>
            <th className="px-4 py-3 font-bold">Item Description</th>
            <th className="px-4 py-3 font-bold hidden sm:table-cell">Condition</th>
            <th className="px-4 py-3 font-bold">Asking Price</th>
            <th className="px-4 py-3 font-bold text-right">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {listings.map((item) => (
            <tr key={item.id} className="hover:bg-neutral-800/50 transition-colors">
              
              {/* Title Column */}
              <td className="px-4 py-4 max-w-[200px] sm:max-w-[300px]">
                <div className="truncate font-bold text-textPrimary" title={item.title}>
                  {item.title}
                </div>
              </td>
              
              {/* Condition Column (Hidden on super small screens to save space) */}
              <td className="px-4 py-4 hidden sm:table-cell">
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-neutral-800 rounded border border-border text-[10px] uppercase text-textSecondary">
                  <Tag className="h-3 w-3" />
                  {item.condition || "Used"}
                </span>
              </td>
              
              {/* Price Column */}
              <td className="px-4 py-4">
                <div className="font-bold text-emerald-400">
                  ${item.price.toFixed(2)}
                </div>
                {item.shippingPrice > 0 ? (
                  <div className="text-[10px] text-textSecondary mt-0.5 flex items-center gap-1">
                    <Package className="h-3 w-3" />
                    + ${item.shippingPrice.toFixed(2)} Ship
                  </div>
                ) : (
                  <div className="text-[10px] text-textSecondary mt-0.5 flex items-center gap-1">
                    <Package className="h-3 w-3" />
                    Free Ship
                  </div>
                )}
              </td>
              
              {/* Live Link Column */}
              <td className="px-4 py-4 text-right">
                <a
                  href={item.itemUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-neutral-100 hover:bg-white text-black font-bold text-[10px] rounded uppercase transition-colors"
                >
                  <span>View on eBay</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </td>
              
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}