"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Activity, Calculator, ArrowUpRight } from "lucide-react";

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <header className="w-full border-b border-border bg-background/80 backdrop-blur sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-4 font-mono">
        
        {/* Brand Logo & Name */}
        <Link 
          href="/" 
          className="flex items-center gap-2 font-bold text-textPrimary hover:opacity-80 transition-opacity"
        >
          <Activity className="h-5 w-5 text-emerald-400" />
          <span className="tracking-tight text-sm uppercase">Racquet Market Engine</span>
        </Link>

        {/* Dynamic Context Status Subtitle indicator */}
        <div className="hidden md:flex items-center gap-2 text-[10px] text-textSecondary uppercase tracking-wider border-l border-border pl-4">
          Status: <span className="text-emerald-400 font-bold">Operational</span>
        </div>

        {/* Right Navigation Controls */}
        <div className="flex items-center gap-3 ml-auto">
          <Link
            href="/checker"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded border font-bold text-xs transition-colors ${
              pathname === "/checker"
                ? "bg-neutral-100 text-black border-neutral-100"
                : "border-border bg-surface hover:bg-neutral-800 text-textPrimary"
            }`}
          >
            <Calculator className="h-3.5 w-3.5" />
            <span>Margin Diagnostic Tool</span>
          </Link>
          
          <a
            href="https://www.ebay.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-0.5 px-3 py-1.5 text-xs text-textSecondary hover:text-textPrimary transition-colors"
          >
            <span>eBay Live</span>
            <ArrowUpRight className="h-3 w-3" />
          </a>
        </div>
      </div>
    </header>
  );
}

// Default export fallback configuration 
export default Navbar;