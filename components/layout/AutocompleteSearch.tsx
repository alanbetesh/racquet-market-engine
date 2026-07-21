"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

// Popular defaults for quick suggestions
const POPULAR_RACKETS = [
  "Wilson Blade 98 V9 (2024)",
  "Babolat Pure Drive (2021)",
  "Yonex VCORE 100 (2023)",
  "Babolat Pure Aero (2023)",
  "Head Speed MP (2024)",
  "Wilson Pro Staff 97 V14",
  "Yonex EZONE 98 (2022)",
  "Head Radical MP (2023)",
];

export function AutocompleteSearch() {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  // Filter suggestion list based on user typing
  const filteredRackets = POPULAR_RACKETS.filter((racket) =>
    racket.toLowerCase().includes(query.toLowerCase())
  );

  // Trigger search for WHATEVER is currently typed in the input box
  const executeSearch = (searchTerm: string) => {
    if (!searchTerm.trim()) return;
    setIsOpen(false);
    router.push(`/analyze?query=${encodeURIComponent(searchTerm.trim())}`);
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
          placeholder="Search any racket (e.g., VCORE Pro 100, Speed Pro)..."
          className="w-full h-12 pl-11 pr-24 rounded-lg bg-surface border border-border text-textPrimary placeholder:text-textSecondary text-sm focus:outline-none focus:border-neutral-400 transition-colors"
        />
        <Search className="absolute left-3.5 h-4 w-4 text-textSecondary pointer-events-none" />

        <button
          type="submit"
          className="absolute right-2 px-4 py-1.5 bg-neutral-100 hover:bg-white text-black font-bold text-xs rounded uppercase transition-colors"
        >
          Analyze
        </button>
      </form>

      {/* Autocomplete Suggestions Dropdown */}
      {isOpen && query.trim().length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-surface border border-border rounded-lg shadow-xl overflow-hidden z-50">
          {filteredRackets.length > 0 ? (
            <ul className="divide-y divide-border/50 text-xs text-textPrimary">
              {filteredRackets.map((racket, index) => (
                <li
                  key={index}
                  onMouseDown={() => handleSelectSuggestion(racket)}
                  className="p-3 hover:bg-neutral-800 cursor-pointer flex items-center justify-between transition-colors"
                >
                  <span>{racket}</span>
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

// Export aliases so any import style in app/page.tsx works seamlessly
export const Autocomplete = AutocompleteSearch;
export default AutocompleteSearch;