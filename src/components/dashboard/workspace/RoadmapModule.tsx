'use client';

import { motion } from 'framer-motion';
import { MapPin, ChevronRight } from 'lucide-react';
import { BentoCard } from '../bento/BentoCard';

export default function RoadmapModule({ analysis }: { analysis: any }) {
  const roadmap = analysis?.roadmap || {};

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
    >
      <BentoCard>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-medium text-gray-300 flex items-center">
            <MapPin className="w-5 h-5 mr-2 text-cyan-400" />
            Strategic Growth Roadmap
          </h2>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-400 hidden md:block">Targeting: <span className="text-white">{roadmap.role_transition?.next_logical_role || 'Next Level'}</span></span>
            {/* Mobile-only swipe hint */}
            <span className="text-[9px] text-gray-500 flex md:hidden items-center uppercase tracking-widest font-bold animate-pulse">
              Swipe <ChevronRight className="w-3 h-3 ml-0.5" />
            </span>
          </div>
        </div>

        {/* Carousel with gradient fade on right edge (mobile only) */}
        <div className="relative">
        <div className="flex overflow-x-auto snap-x snap-mandatory md:grid md:grid-cols-3 gap-3 md:gap-4 hide-scrollbar -mx-6 px-6 md:mx-0 md:px-0">
          {/* 30 Days */}
          <div className="snap-center shrink-0 w-[85%] md:w-auto bg-white/5 p-4 md:p-5 rounded-2xl border border-white/5">
            <h3 className="text-[11px] md:text-sm text-cyan-400 font-semibold mb-2.5 md:mb-3 flex items-center">
              <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-cyan-400 mr-2 shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
              First 30 Days
            </h3>
            <ul className="space-y-1.5 md:space-y-2">
              {Array.isArray(roadmap.timeline?.days_30) && roadmap.timeline.days_30.map((item: string, i: number) => (
                <li key={i} className="text-[11px] md:text-sm text-gray-300 flex items-start">
                  <span className="text-cyan-500 mr-2 mt-0.5 md:mt-0">›</span> <span className="leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>
          
          {/* 60 Days */}
          <div className="snap-center shrink-0 w-[85%] md:w-auto bg-white/5 p-4 md:p-5 rounded-2xl border border-white/5">
            <h3 className="text-[11px] md:text-sm text-cyan-400 font-semibold mb-2.5 md:mb-3 flex items-center">
              <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-cyan-400 mr-2 shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
              60 Days (Deepening)
            </h3>
            <ul className="space-y-1.5 md:space-y-2">
              {Array.isArray(roadmap.timeline?.days_60) && roadmap.timeline.days_60.map((item: string, i: number) => (
                <li key={i} className="text-[11px] md:text-sm text-gray-300 flex items-start">
                  <span className="text-cyan-500 mr-2 mt-0.5 md:mt-0">›</span> <span className="leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* 90 Days */}
          <div className="snap-center shrink-0 w-[85%] md:w-auto bg-white/5 p-4 md:p-5 rounded-2xl border border-white/5">
            <h3 className="text-[11px] md:text-sm text-cyan-400 font-semibold mb-2.5 md:mb-3 flex items-center">
              <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-cyan-400 mr-2 shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
              90 Days (Mastery)
            </h3>
            <ul className="space-y-1.5 md:space-y-2">
              {Array.isArray(roadmap.timeline?.days_90) && roadmap.timeline.days_90.map((item: string, i: number) => (
                <li key={i} className="text-[11px] md:text-sm text-gray-300 flex items-start">
                  <span className="text-cyan-500 mr-2 mt-0.5 md:mt-0">›</span> <span className="leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
          {/* Right gradient fade — mobile only */}
          <div className="absolute top-0 right-0 bottom-0 w-10 bg-gradient-to-l from-[#0a0a14] to-transparent pointer-events-none md:hidden" />
          {/* Dot indicators — mobile only */}
          <div className="flex md:hidden justify-center gap-1.5 pt-3">
            <span className="w-2 h-2 rounded-full bg-cyan-400 opacity-90" />
            <span className="w-1.5 h-1.5 rounded-full bg-white/20" />
            <span className="w-1.5 h-1.5 rounded-full bg-white/20" />
          </div>
        </div>
      </BentoCard>
    </motion.div>
  );
}
