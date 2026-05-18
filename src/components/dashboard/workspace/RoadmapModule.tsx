'use client';

import { motion } from 'framer-motion';
import { MapPin } from 'lucide-react';
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
          <span className="text-sm text-gray-400">Targeting: <span className="text-white">{roadmap.role_transition?.next_logical_role || 'Next Level'}</span></span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* 30 Days */}
          <div className="bg-white/5 p-5 rounded-2xl border border-white/5">
            <h3 className="text-cyan-400 font-semibold mb-3 flex items-center">
              <div className="w-2 h-2 rounded-full bg-cyan-400 mr-2 shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
              First 30 Days
            </h3>
            <ul className="space-y-2">
              {Array.isArray(roadmap.timeline?.days_30) && roadmap.timeline.days_30.map((item: string, i: number) => (
                <li key={i} className="text-sm text-gray-300 flex items-start">
                  <span className="text-cyan-500 mr-2">›</span> {item}
                </li>
              ))}
            </ul>
          </div>
          
          {/* 60 Days */}
          <div className="bg-white/5 p-5 rounded-2xl border border-white/5">
            <h3 className="text-cyan-400 font-semibold mb-3 flex items-center">
              <div className="w-2 h-2 rounded-full bg-cyan-400 mr-2 shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
              60 Days (Deepening)
            </h3>
            <ul className="space-y-2">
              {Array.isArray(roadmap.timeline?.days_60) && roadmap.timeline.days_60.map((item: string, i: number) => (
                <li key={i} className="text-sm text-gray-300 flex items-start">
                  <span className="text-cyan-500 mr-2">›</span> {item}
                </li>
              ))}
            </ul>
          </div>

          {/* 90 Days */}
          <div className="bg-white/5 p-5 rounded-2xl border border-white/5">
            <h3 className="text-cyan-400 font-semibold mb-3 flex items-center">
              <div className="w-2 h-2 rounded-full bg-cyan-400 mr-2 shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
              90 Days (Mastery)
            </h3>
            <ul className="space-y-2">
              {Array.isArray(roadmap.timeline?.days_90) && roadmap.timeline.days_90.map((item: string, i: number) => (
                <li key={i} className="text-sm text-gray-300 flex items-start">
                  <span className="text-cyan-500 mr-2">›</span> {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </BentoCard>
    </motion.div>
  );
}
