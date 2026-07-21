"use client";

import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface PriceChartProps {
  data: { name: string; price: number }[];
}

export function PriceChart({ data }: PriceChartProps) {
  // Failsafe: If no data is passed, show a clean empty state
  if (!data || data.length === 0) {
    return (
      <div className="w-full h-[300px] flex items-center justify-center border border-border border-dashed rounded-lg text-textSecondary font-mono text-xs uppercase tracking-widest">
        Insufficient Data for Trend Analysis
      </div>
    );
  }

  // Calculate a nice dynamic Y-axis domain so the chart doesn't look flat
  const minPrice = Math.min(...data.map((d) => d.price));
  const maxPrice = Math.max(...data.map((d) => d.price));
  const buffer = Math.round((maxPrice - minPrice) * 0.2) || 20;

  return (
    <div className="w-full space-y-4 font-mono">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-bold text-textPrimary uppercase tracking-wider">
          90-Day Price Trend & Volume
        </h2>
        <span className="text-[10px] text-textSecondary uppercase">
          Daily Moving Average ($)
        </span>
      </div>

      {/* The defined height here prevents the "Blank Graph" bug! */}
      <div className="w-full h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <defs>
              {/* Emerald Gradient for the Sick Flip vibe */}
              <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#34d399" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#34d399" stopOpacity={0} />
              </linearGradient>
            </defs>
            
            {/* Subtle background grid lines */}
            <CartesianGrid strokeDasharray="3 3" stroke="#333333" vertical={false} />
            
            <XAxis 
              dataKey="name" 
              stroke="#888888" 
              fontSize={10} 
              tickLine={false} 
              axisLine={false} 
              dy={10}
            />
            
            <YAxis
              stroke="#888888"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `$${value}`}
              domain={[Math.max(0, minPrice - buffer), maxPrice + buffer]}
            />
            
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-[#111111] border border-[#333333] p-3 rounded-lg shadow-xl">
                      <p className="text-[10px] text-textSecondary uppercase mb-1">
                        {payload[0].payload.name} Average
                      </p>
                      <p className="text-sm font-bold text-emerald-400">
                        ${payload[0].value}
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            
            <Area
              type="monotone"
              dataKey="price"
              stroke="#34d399"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorPrice)"
              activeDot={{ r: 4, fill: "#34d399", stroke: "#000000", strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}