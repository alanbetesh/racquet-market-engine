import React from "react";
import clsx from "clsx";

interface Zone {
  label: string;
  range: string;
  type: "sick" | "good" | "fair" | "bad";
}

export function BuyZoneCards({ zones }: { zones: Zone[] }) {
  const colorMap = {
    sick: "bg-buy-sick/10 border-buy-sick text-buy-sick",
    good: "bg-buy-good/10 border-buy-good text-buy-good",
    fair: "bg-buy-fair/10 border-buy-fair text-buy-fair",
    bad: "bg-buy-bad/10 border-buy-bad text-buy-bad",
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 w-full">
      {zones.map((zone) => (
        <div key={zone.label} className={clsx("flex flex-col items-center justify-center rounded border p-4 font-mono text-center", colorMap[zone.type])}>
          <span className="text-xs font-bold uppercase tracking-wider mb-2">{zone.label}</span>
          <span className="text-lg font-bold">{zone.range}</span>
        </div>
      ))}
    </div>
  );
}