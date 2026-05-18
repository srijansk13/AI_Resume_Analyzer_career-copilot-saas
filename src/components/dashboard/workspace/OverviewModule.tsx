'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Target, BarChart3, ShieldCheck } from 'lucide-react';
import { BentoCard } from '../bento/BentoCard';
import { CustomRadarChart } from '../charts/RadarChartComponent';

export default function OverviewModule({ analysis }: { analysis: any }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const ats = analysis?.ats || {};
  const score = typeof ats.overall_ats_score === 'number' ? ats.overall_ats_score : 0;
  
  // Outer circle arc mathematics
  const radius = 70;
  const strokeWidth = 10;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const radarData = [
    { category: 'Format', score: ats.category_scores?.format || 0 },
    { category: 'Impact', score: ats.category_scores?.impact || 0 },
    { category: 'Keywords', score: ats.category_scores?.keywords || 0 },
    { category: 'Readability', score: ats.category_scores?.readability || 0 },
    { category: 'Action Verbs', score: ats.action_verb_score || 0 },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full min-w-0"
    >
      <BentoCard className="flex flex-col items-center text-center min-w-0 w-full overflow-hidden bg-[#0a0a0f]/80 border border-white/[0.06] shadow-2xl relative">
        {/* Glow vector backdrops */}
        <div className="absolute top-[-20%] right-[-20%] w-[200px] h-[200px] bg-indigo-500/10 rounded-full blur-[60px] pointer-events-none" />
        <div className="absolute bottom-[-25%] left-[-25%] w-[180px] h-[180px] bg-purple-500/5 rounded-full blur-[50px] pointer-events-none" />

        <h2 className="text-sm font-black uppercase tracking-wider text-gray-300 w-full text-left mb-6 flex items-center justify-between">
          <span className="flex items-center">
            <Target className="w-4 h-4 mr-2 text-indigo-400" />
            Overall ATS Match
          </span>
          <span className="text-[10px] text-gray-500 font-mono tracking-normal">READY</span>
        </h2>
        
        {!mounted ? (
          <div className="w-full min-w-0 h-[220px] animate-pulse rounded-2xl bg-white/5" />
        ) : (
          <div className="w-full min-w-0 h-[220px] relative flex items-center justify-center">
            <svg className="w-44 h-44 transform -rotate-90">
              <defs>
                <linearGradient id="atsGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#818cf8" />
                  <stop offset="100%" stopColor="#a855f7" />
                </linearGradient>
                <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
              {/* Background trace ring */}
              <circle cx="88" cy="88" r={radius} stroke="rgba(255,255,255,0.03)" strokeWidth={strokeWidth} fill="transparent" />
              {/* Foreground matching glowing ring */}
              <motion.circle 
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                cx="88" cy="88" r={radius} 
                stroke="url(#atsGrad)" 
                strokeWidth={strokeWidth} 
                fill="transparent" 
                strokeDasharray={circumference}
                strokeLinecap="round"
                filter="url(#glow)"
              />
            </svg>
            
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-4xl font-black text-white leading-none font-sans tracking-tight">{score}%</span>
              <span className="text-[9px] uppercase tracking-widest text-indigo-400 font-bold mt-1.5 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-400" /> Compliant
              </span>
            </div>
          </div>
        )}
        
        <div className="w-full flex items-center justify-between border-t border-white/[0.05] pt-4 mt-2.5">
          <div className="text-left">
            <p className="text-[9px] text-gray-500 font-bold uppercase tracking-wider">Confidence Level</p>
            <p className="text-xs font-extrabold text-white mt-0.5">{ats.confidence_score || 0}% Accuracy</p>
          </div>
          <div className="text-right">
            <p className="text-[9px] text-gray-500 font-bold uppercase tracking-wider">Category Status</p>
            <p className="text-xs font-extrabold text-emerald-400 mt-0.5 flex items-center gap-1 justify-end">
              <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full inline-block animate-pulse" /> Optimal
            </p>
          </div>
        </div>
      </BentoCard>

      <BentoCard className="lg:col-span-2 flex flex-col min-w-0 w-full overflow-hidden bg-[#0a0a0f]/80 border border-white/[0.06] shadow-2xl relative">
        <div className="absolute top-[-20%] left-[-20%] w-[300px] h-[300px] bg-purple-500/5 rounded-full blur-[80px] pointer-events-none" />
        
        <h2 className="text-sm font-black uppercase tracking-wider text-gray-300 mb-6 flex items-center justify-between border-b border-white/[0.04] pb-4">
          <span className="flex items-center">
            <BarChart3 className="w-4 h-4 mr-2 text-purple-400" />
            Career Intelligence Dimensions
          </span>
          <span className="text-[9px] font-black uppercase tracking-wider bg-purple-500/10 border border-purple-500/20 text-purple-300 px-2 py-0.5 rounded">
            Multivariable Radar
          </span>
        </h2>
        <div className="w-full flex-1">
           <CustomRadarChart data={radarData} color="#a855f7" />
        </div>
      </BentoCard>
    </motion.div>
  );
}
