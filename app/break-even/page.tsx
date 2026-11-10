'use client';

import { useMemo, useState } from 'react';
import { Calculator, DollarSign, ReceiptText } from 'lucide-react';

const EBAY_FEE_RATE = 0.1325;
const EBAY_FIXED_FEE = 0.3;
const HANDLING_COST = 7;

export default function BreakEvenPage() {
  const [spent, setSpent] = useState('100');
  const purchaseCost = Number.parseFloat(spent) || 0;

  const breakEvenPrice = useMemo(
    () => (purchaseCost + HANDLING_COST + EBAY_FIXED_FEE) / (1 - EBAY_FEE_RATE),
    [purchaseCost],
  );
  const ebayFee = breakEvenPrice * EBAY_FEE_RATE + EBAY_FIXED_FEE;

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6 py-8 font-mono">
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-emerald-400">
          <Calculator className="h-5 w-5" />
          <span className="text-xs font-bold uppercase tracking-[0.2em]">Selling calculator</span>
        </div>
        <h1 className="text-3xl font-black tracking-tight text-textPrimary">Break-even Price</h1>
        <p className="max-w-xl text-sm text-textSecondary">
          Enter what you paid for any racquet. The buyer pays shipping; the calculation includes a $7 handling cost and eBay fees.
        </p>
      </div>

      <section className="rounded-xl border border-border bg-surface p-6 space-y-5">
        <label htmlFor="purchase-cost" className="block text-xs font-bold uppercase tracking-wider text-textSecondary">
          What did you spend?
        </label>
        <div className="relative">
          <DollarSign className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-textSecondary" />
          <input
            suppressHydrationWarning
            id="purchase-cost"
            type="number"
            min="0"
            step="0.01"
            inputMode="decimal"
            value={spent}
            onChange={(event) => setSpent(event.target.value)}
            className="w-full rounded-lg border border-border bg-background py-4 pl-11 pr-4 text-2xl font-bold text-textPrimary outline-none transition-colors focus:border-emerald-400"
          />
        </div>
      </section>

      <section className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-6">
        <p className="text-xs font-bold uppercase tracking-wider text-emerald-400">Minimum sale price to break even</p>
        <p className="mt-2 text-5xl font-black text-textPrimary">${breakEvenPrice.toFixed(2)}</p>
        <p className="mt-3 text-sm text-textSecondary">List at least this amount to cover your purchase and selling costs.</p>
      </section>

      <section className="rounded-xl border border-border bg-surface p-6">
        <div className="mb-4 flex items-center gap-2 text-textPrimary">
          <ReceiptText className="h-4 w-4 text-emerald-400" />
          <h2 className="text-sm font-bold uppercase tracking-wider">Cost breakdown</h2>
        </div>
        <dl className="space-y-3 text-sm">
          <div className="flex justify-between gap-6 text-textSecondary"><dt>Purchase cost</dt><dd className="font-bold text-textPrimary">${purchaseCost.toFixed(2)}</dd></div>
          <div className="flex justify-between gap-6 text-textSecondary"><dt>Handling cost</dt><dd className="font-bold text-textPrimary">$7.00</dd></div>
          <div className="flex justify-between gap-6 text-textSecondary"><dt>eBay selling fee (13.25% + $0.30)</dt><dd className="font-bold text-textPrimary">${ebayFee.toFixed(2)}</dd></div>
          <div className="flex justify-between gap-6 border-t border-border pt-3 text-textPrimary"><dt className="font-bold">Break-even sale price</dt><dd className="font-black text-emerald-400">${breakEvenPrice.toFixed(2)}</dd></div>
        </dl>
      </section>
    </div>
  );
}
