"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Search, Sparkles, Loader2 } from "lucide-react";

const RARE_COLORWAYS_AND_RACKETS = [
  "Head Boom MP Purple (2024)",
  "Wilson Shift 99 Roland Garros",
  "Wilson Blade 98 V8 US Open",
  "Babolat Pure Aero Rafa Origin",
  "Wilson Pro Staff 97 Noir Edition",
  "Yonex VCORE 100 Sand Beige",
  "Head Speed MP Legend",
  "Wilson Ultra 100 Reverse",
];

export function AutocompleteSearch() {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition(); // Tracks the loading state
  const router = useRouter();

  const filteredSuggestions = RARE_COLORWAYS_AND_RACKETS.filter((item) =>
    item.toLowerCase().includes(query.toLowerCase())
  );

  const executeSearch = (searchTerm: string) => {
    if (!searchTerm.trim()) return;
    setIsOpen(false);
    
    // Wraps the router push in a transition so React knows we are loading
    startTransition(() => {
      router.push(`/analyze?query=${encodeURIComponent(searchTerm.trim())}`);
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeSearch(query);
  };

  const handleSelectSuggestion = (racketName: string) => {
    setQuery(racketName);
    executeSearch(racketName);
  };

  return (
    <div className="relative w-full max-w-xl mx-auto font-mono">
      <form onSubmit={handleSubmit} className="relative flex items-center">
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onBlur={() => setTimeout(() => setIsOpen(false), 200)}
          placeholder="Search exact frame or colorway (e.g. Purple Boom MP)..."
          disabled={isPending}
          className="w-full h-12 pl-11 pr-28 rounded-lg bg-surface border border-border text-textPrimary placeholder:text-textSecondary text-xs focus:outline-none focus:border-neutral-400 transition-colors disabled:opacity-50"
        />
        <Search className="absolute left-3.5 h-4 w-4 text-textSecondary pointer-events-none" />

        <button
          type="submit"
          disabled={isPending}
          className="absolute right-2 px-4 py-1.5 bg-neutral-100 hover:bg-white text-black font-bold text-xs rounded uppercase transition-colors disabled:opacity-70 flex items-center gap-2"
        >
          {isPending ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" /> 
              Wait...
            </>
          ) : (
            "Analyze"
          )}
        </button>
      </form>

      {/* Autocomplete Dropdown */}
      {isOpen && query.trim().length > 0 && !isPending && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-surface border border-border rounded-lg shadow-xl overflow-hidden z-50">
          {filteredSuggestions.length > 0 ? (
            <ul className="divide-y divide-border/50 text-xs text-textPrimary">
              {filteredSuggestions.map((racket, index) => (
                <li
                  key={index}
                  onMouseDown={() => handleSelectSuggestion(racket)}
                  className="p-3 hover:bg-neutral-800 cursor-pointer flex items-center justify-between transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <Sparkles className="h-3 w-3 text-buy-good" />
                    {racket}
                  </span>
                  <span className="text-[10px] text-textSecondary uppercase">Select</span>
                </li>
              ))}
            </ul>
          ) : (
            <div
              onMouseDown={() => executeSearch(query)}
              className="p-3 hover:bg-neutral-800 cursor-pointer text-xs text-buy-good font-bold flex items-center justify-between"
            >
              <span>Search custom query: "{query}"</span>
              <span className="text-[10px] uppercase">Press Enter ↵</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default AutocompleteSearch;