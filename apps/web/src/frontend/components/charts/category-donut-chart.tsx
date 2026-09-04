'use client';

import React, { useState, useMemo } from 'react';
import { useCurrency } from '../currency-provider';

export interface DonutCategoryItem {
  id: string;
  name: string;
  amount: number;
  percentage: number;
  color: string;
}

export interface CategoryDonutChartProps {
  data: DonutCategoryItem[];
  size?: number;
}

export function CategoryDonutChart({ data, size = 220 }: CategoryDonutChartProps) {
  const { format } = useCurrency();
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const totalAmount = useMemo(() => {
    return data.reduce((sum, item) => sum + item.amount, 0);
  }, [data]);

  const radius = size * 0.38;
  const strokeWidth = size * 0.12;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;

  // Calculate arc offsets
  const segments = useMemo(() => {
    let accumulatedAngle = 0;
    return data.map((item) => {
      const strokeDasharray = `${(item.percentage / 100) * circumference} ${circumference}`;
      const strokeDashoffset = -((accumulatedAngle / 100) * circumference);
      accumulatedAngle += item.percentage;

      return {
        ...item,
        strokeDasharray,
        strokeDashoffset,
      };
    });
  }, [data, circumference]);

  const activeCategory = data.find((d) => d.id === hoveredId);

  return (
    <div className="flex flex-col sm:flex-row items-center gap-6 justify-between">
      {/* SVG Donut */}
      <div className="relative flex items-center justify-center shrink-0" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="transform -rotate-90 overflow-visible"
        >
          {/* Background Track */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="transparent"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-slate-100 dark:text-white/5"
          />

          {/* Segment Arcs */}
          {segments.map((seg) => {
            const isHovered = hoveredId === seg.id;
            return (
              <circle
                key={seg.id}
                cx={center}
                cy={center}
                r={radius}
                fill="transparent"
                stroke={seg.color}
                strokeWidth={isHovered ? strokeWidth + 4 : strokeWidth}
                strokeDasharray={seg.strokeDasharray}
                strokeDashoffset={seg.strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-300 cursor-pointer opacity-90 hover:opacity-100"
                onMouseEnter={() => setHoveredId(seg.id)}
                onMouseLeave={() => setHoveredId(null)}
              />
            );
          })}
        </svg>

        {/* Center Frosted Hub */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-4">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider truncate max-w-[120px]">
            {activeCategory ? activeCategory.name : 'Total Outflow'}
          </span>
          <span className="text-base sm:text-lg font-black text-slate-900 dark:text-white mt-0.5">
            {format(activeCategory ? activeCategory.amount : totalAmount)}
          </span>
          <span className="text-[10px] font-semibold text-indigo-500 dark:text-indigo-400 mt-0.5">
            {activeCategory ? `${activeCategory.percentage}% of total` : `${data.length} categories`}
          </span>
        </div>
      </div>

      {/* Legend List */}
      <div className="flex-1 space-y-2 w-full max-h-52 overflow-y-auto pr-1">
        {data.map((cat) => {
          const isHovered = hoveredId === cat.id;
          return (
            <div
              key={cat.id}
              onMouseEnter={() => setHoveredId(cat.id)}
              onMouseLeave={() => setHoveredId(null)}
              className={`flex items-center justify-between p-2 rounded-xl transition cursor-pointer ${
                isHovered
                  ? 'bg-indigo-50/60 dark:bg-indigo-950/30 ring-1 ring-indigo-500/30'
                  : 'hover:bg-slate-100/50 dark:hover:bg-white/[0.02]'
              }`}
            >
              <div className="flex items-center gap-2">
                <div
                  className="h-2.5 w-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: cat.color }}
                />
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                  {cat.name}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  {format(cat.amount)}
                </span>
                <span className="text-[10px] font-mono font-bold text-slate-400 w-8 text-right">
                  {cat.percentage}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
