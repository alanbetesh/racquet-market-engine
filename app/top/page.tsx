"use client";

import React, { useState } from "react";
import { TrendingUp, ArrowUpDown } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import Link from "next/link";

// Pre-structured data matching our future DB schema
const INITIAL_DATA = [
  { id: "1", rank: 1, name: "Wilson Blade 98 V9", avgSold: 185, avgActive: 199, buyUnder: 140, sellPrice: 200, score: 96, daysToSell: 8, soldVol: 142, listVol: 45 },
  { id: "2", rank: 2, name: "Babolat Pure Aero 2023", avgSold: 175, avgActive: 190, buyUnder: 130, sellPrice: 185, score: 92, daysToSell: 11, soldVol: 115, listVol: 38 },
  { id: "3", rank: 3, name: "Yonex EZONE 100", avgSold: 165, avgActive: 175, buyUnder: 125, sellPrice: 175, score: 88, daysToSell: 14, soldVol: 98, listVol: 42 },
  { id: "4", rank: 4, name: "Head Speed MP", avgSold: 155, avgActive: 170, buyUnder: 115, sellPrice: 165, score: 85, daysToSell: 16, soldVol: 84, listVol: 50 },
  { id: "5", rank: 5, name: "Wilson Pro Staff v14", avgSold: 195, avgActive: 220, buyUnder: 150, sellPrice: 215, score: 82, daysToSell: 21, soldVol: 65, listVol: 28 },
];

type SortKey = keyof typeof INITIAL_DATA[0];

export default function TopRacketsPage() {
  const [data, setData] = useState(INITIAL_DATA);
  const [sortKey, setSortKey] = useState<SortKey>("rank");
  const [sortAsc, setSortAsc] = useState(true);

  const handleSort = (key: SortKey) => {
    const isAsc = sortKey === key ? !sortAsc : true;
    setSortKey(key);
    setSortAsc(isAsc);
    
    const sorted = [...data].sort((a, b) => {
      if (a[key] < b[key]) return isAsc ? -1 : 1;
      if (a[key] > b[key]) return isAsc ? 1 : -1;
      return 0;
    });
    setData(sorted);
  };

  const SortableHead = ({ label, sortKey: key }: { label: string, sortKey: SortKey }) => (
    <TableHead className="cursor-pointer hover:text-textPrimary transition-colors" onClick={() => handleSort(key)}>
      <div className="flex items-center gap-1">
        {label} <ArrowUpDown className="h-3 w-3 opacity-50" />
      </div>
    </TableHead>
  );

  return (
    <div className="flex flex-col w-full mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div>
          <h1 className="text-2xl font-bold font-mono text-textPrimary flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-buy-sick" />
            TOP RACKETS MATRIX
          </h1>
          <p className="text-xs font-mono text-textSecondary mt-1">Global market leaderboard sorted by algorithmic health score.</p>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <SortableHead label="RANK" sortKey="rank" />
            <SortableHead label="MODEL" sortKey="name" />
            <SortableHead label="MARKET SCORE" sortKey="score" />
            <SortableHead label="AVG SOLD" sortKey="avgSold" />
            <SortableHead label="BUY UNDER" sortKey="buyUnder" />
            <SortableHead label="BEST SELL" sortKey="sellPrice" />
            <SortableHead label="DAYS TO SELL" sortKey="daysToSell" />
            <SortableHead label="30D VOL" sortKey="soldVol" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row) => (
            <TableRow key={row.id}>
              <TableCell className="font-bold">{row.rank}</TableCell>
              <TableCell>
                <Link href={`/analyze?query=${encodeURIComponent(row.name)}`} className="hover:underline hover:text-buy-good font-bold">
                  {row.name}
                </Link>
              </TableCell>
              <TableCell>
                <Badge variant={row.score >= 90 ? "success" : row.score >= 85 ? "warning" : "default"}>
                  {row.score}/100
                </Badge>
              </TableCell>
              <TableCell>${row.avgSold}</TableCell>
              <TableCell className="text-buy-sick font-bold">${row.buyUnder}</TableCell>
              <TableCell className="text-buy-good">${row.sellPrice}</TableCell>
              <TableCell>{row.daysToSell}d</TableCell>
              <TableCell>{row.soldVol}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}