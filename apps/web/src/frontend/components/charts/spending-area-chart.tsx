'use client';

import React, { useState, useMemo, useRef } from 'react';
import { useCurrency } from '../currency-provider';
import { formatExpenseDate } from '@repo/utils';

export interface SpendingDataPoint {
  date: string;
  amount: number;
}

export interface SpendingAreaChartProps {
  data: SpendingDataPoint[];
  height?: number;
  lineColor?: string;
  gradientFrom?: string;
  gradientTo?: string;
}

export function SpendingAreaChart({
  data,
  height = 200,
  lineColor = '#6366f1',
  gradientFrom = 'rgba(99, 102, 241, 0.45)',
  gradientTo = 'rgba(99, 102, 241, 0.0)',
}: SpendingAreaChartProps) {
  const { format } = useCurrency();
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const points = useMemo(() => {
    if (!data || data.length === 0) {
      // Mock 7-day fallback data if empty
      const today = Date.now();
      return Array.from({ length: 7 }, (_, i) => ({
        date: new Date(today - (6 - i) * 86400000).toISOString(),
        amount: Math.floor(Math.random() * 2500) + 500,
      }));
    }
    return data;
  }, [data]);

  const maxAmount = useMemo(() => {
    const max = Math.max(...points.map((p) => p.amount), 100);
    return Math.ceil(max * 1.15); // Add 15% headroom
  }, [points]);

  const width = 600; // Reference SVG viewport width
  const paddingX = 20;
  const paddingY = 25;
  const chartWidth = width - paddingX * 2;
  const chartHeight = height - paddingY * 2;

  // Calculate coordinates for points
  const coords = useMemo(() => {
    return points.map((pt, idx) => {
      const x = paddingX + (idx / Math.max(1, points.length - 1)) * chartWidth;
      const y = paddingY + chartHeight - (pt.amount / maxAmount) * chartHeight;
      return { x, y, ...pt };
    });
  }, [points, maxAmount, chartWidth, chartHeight, paddingX, paddingY]);

  // Construct Smooth Cubic Bezier SVG Path
  const { pathD, areaD } = useMemo(() => {
    if (coords.length === 0) return { pathD: '', areaD: '' };
    if (coords.length === 1) {
      const p = coords[0];
      return {
        pathD: `M ${p.x} ${p.y}`,
        areaD: `M ${p.x} ${p.y} L ${p.x} ${height} Z`,
      };
    }

    let d = `M ${coords[0].x} ${coords[0].y}`;

    for (let i = 0; i < coords.length - 1; i++) {
      const p0 = coords[i === 0 ? 0 : i - 1];
      const p1 = coords[i];
      const p2 = coords[i + 1];
      const p3 = coords[i + 2] || p2;

      // Catmull-Rom to Cubic Bezier conversion
      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
    }

    const areaPath = `${d} L ${coords[coords.length - 1].x} ${height} L ${coords[0].x} ${height} Z`;

    return { pathD: d, areaD: areaPath };
  }, [coords, height]);

  // Mouse move handler for interactive crosshair
  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const relativeX = (mouseX / rect.width) * width;

    // Find nearest point
    let nearestIdx = 0;
    let minDistance = Infinity;
    coords.forEach((c, idx) => {
      const dist = Math.abs(c.x - relativeX);
      if (dist < minDistance) {
        minDistance = dist;
        nearestIdx = idx;
      }
    });

    setHoverIndex(nearestIdx);
  };

  const activePoint = hoverIndex !== null ? coords[hoverIndex] : null;

  return (
    <div className="relative w-full select-none" ref={containerRef}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full overflow-visible"
        style={{ height }}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHoverIndex(null)}
      >
        <defs>
          <linearGradient id="spendingGlow" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={gradientFrom} />
            <stop offset="100%" stopColor={gradientTo} />
          </linearGradient>
          <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor={lineColor} floodOpacity="0.4" />
          </filter>
        </defs>

        {/* Grid Lines */}
        <line
          x1={paddingX}
          y1={paddingY}
          x2={width - paddingX}
          y2={paddingY}
          stroke="currentColor"
          className="text-slate-200/40 dark:text-white/5"
          strokeDasharray="4 4"
        />
        <line
          x1={paddingX}
          y1={paddingY + chartHeight / 2}
          x2={width - paddingX}
          y2={paddingY + chartHeight / 2}
          stroke="currentColor"
          className="text-slate-200/40 dark:text-white/5"
          strokeDasharray="4 4"
        />
        <line
          x1={paddingX}
          y1={height - paddingY}
          x2={width - paddingX}
          y2={height - paddingY}
          stroke="currentColor"
          className="text-slate-200/60 dark:text-white/10"
        />

        {/* Area Gradient Fill */}
        <path d={areaD} fill="url(#spendingGlow)" />

        {/* Spline Stroke */}
        <path
          d={pathD}
          fill="none"
          stroke={lineColor}
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="url(#shadow)"
        />

        {/* Hover Crosshair & Point Indicator */}
        {activePoint && (
          <g>
            <line
              x1={activePoint.x}
              y1={paddingY}
              x2={activePoint.x}
              y2={height - paddingY}
              stroke={lineColor}
              strokeWidth="1.5"
              strokeDasharray="3 3"
              className="opacity-70"
            />
            <circle
              cx={activePoint.x}
              cy={activePoint.y}
              r="6"
              fill={lineColor}
              className="animate-pulse"
            />
            <circle
              cx={activePoint.x}
              cy={activePoint.y}
              r="3"
              fill="#ffffff"
            />
          </g>
        )}
      </svg>

      {/* Floating Glass Tooltip */}
      {activePoint && (
        <div
          className="absolute pointer-events-none z-20 glass-panel px-3 py-1.5 rounded-xl shadow-xl border border-white/40 dark:border-white/15 animate-fade-in text-center transform -translate-x-1/2 -translate-y-full"
          style={{
            left: `${(activePoint.x / width) * 100}%`,
            top: `${(activePoint.y / height) * 100 - 8}%`,
          }}
        >
          <p className="text-[10px] font-semibold text-slate-400">
            {formatExpenseDate(activePoint.date)}
          </p>
          <p className="text-xs font-black text-slate-900 dark:text-white">
            {format(activePoint.amount)}
          </p>
        </div>
      )}
    </div>
  );
}
