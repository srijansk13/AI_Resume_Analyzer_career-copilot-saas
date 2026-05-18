'use client';

import { motion } from 'framer-motion';

interface RadarChartProps {
  data: { category: string; score: number }[];
  color?: string;
}

export function CustomRadarChart({ data, color = "#3b82f6" }: RadarChartProps) {
  // Map color prop to tailwind classes for the gradient if it matches our standard blue, else fallback to standard blue.
  const gradientClass = color === '#3b82f6' ? 'from-blue-500 to-indigo-500' : 'from-purple-500 to-blue-500';

  return (
    <div className="w-full flex flex-col space-y-5 py-2">
      {data.map((item, i) => (
        <div key={item.category} className="group relative">
          <div className="flex justify-between items-end mb-2">
            <span className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors">
              {item.category}
            </span>
            <span className="text-sm font-mono text-gray-500 group-hover:text-blue-400 transition-colors">
              {item.score}%
            </span>
          </div>
          <div className="w-full h-2.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: `${item.score}%`, opacity: 1 }}
              transition={{ duration: 1, delay: i * 0.1, type: "spring", bounce: 0.2 }}
              className={`h-full rounded-full bg-gradient-to-r ${gradientClass} relative`}
            >
              <div className="absolute inset-0 bg-white/20 w-full h-full opacity-0 group-hover:opacity-100 transition-opacity" />
            </motion.div>
          </div>
        </div>
      ))}
    </div>
  );
}
