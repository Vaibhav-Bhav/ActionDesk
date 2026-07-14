"use client";

import { motion } from "framer-motion";
import { TrendingUp } from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 8 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
};

/**
 * Tiny sparkline — renders an SVG polyline from an array of numbers.
 * No axis, no labels, just a subtle trend line.
 */
function Sparkline({ data, color, width = 80, height = 28 }) {
  if (!data || data.length < 2) return null;

  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const padding = 2;

  const points = data
    .map((v, i) => {
      const x = padding + (i / (data.length - 1)) * (width - padding * 2);
      const y = padding + (1 - (v - min) / range) * (height - padding * 2);
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="shrink-0">
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={0.7}
      />
    </svg>
  );
}

export default function MiniTrends({ data }) {
  return (
    <section>
      <div className="mb-3 flex items-center gap-1.5">
        <TrendingUp size={13} className="text-muted" />
        <span className="text-xs font-semibold uppercase tracking-wider text-muted">
          Mini Trends
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {data.map((trend, i) => (
          <motion.div
            key={trend.id}
            custom={i}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="rounded-card border border-border bg-surface px-4 py-3.5"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-[11px] font-medium text-muted truncate">{trend.label}</p>
                <p className="mt-0.5 text-sm font-bold text-white">{trend.value}</p>
                <p className="mt-0.5 text-2xs text-slate-500">{trend.subLabel}</p>
              </div>
              <Sparkline data={trend.data} color={trend.color} />
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
