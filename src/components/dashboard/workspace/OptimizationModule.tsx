'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowRight, CheckCircle2, ChevronDown } from 'lucide-react';
import { BentoCard } from '../bento/BentoCard';
import { Button } from '@/components/ui/button';

export default function OptimizationModule({ analysis }: { analysis: any }) {
  const optimization = analysis?.optimization || {};
  const summaryRewrite = optimization.summary_rewrite || {};
  const bullets = optimization.bullet_optimizations || [];
  const [isSummaryExpanded, setIsSummaryExpanded] = useState(false);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-4 md:space-y-6"
    >
      {/* Summary Rewrite */}
      <BentoCard className="p-4 md:p-6">
        <div className="flex items-center justify-between mb-3 md:mb-4">
          <h2 className="text-sm md:text-xl font-medium text-gray-200 flex items-center">
            <Sparkles className="w-4 h-4 md:w-5 md:h-5 mr-1.5 md:mr-2 text-yellow-400" />
            AI Professional Summary
          </h2>
          <span className="px-2 md:px-3 py-0.5 md:py-1 bg-yellow-500/10 text-yellow-400 text-[9px] md:text-xs rounded-full border border-yellow-500/20 font-bold uppercase tracking-wider">
            ATS Optimized
          </span>
        </div>
        
        <div className="bg-white/5 rounded-xl md:rounded-2xl border border-white/5 relative group overflow-hidden">
          <button 
            onClick={() => setIsSummaryExpanded(!isSummaryExpanded)}
            className="w-full text-left p-3 md:p-5 outline-none"
          >
            <div className="relative">
              <p className={`text-gray-300 leading-relaxed text-[11px] md:text-base ${!isSummaryExpanded ? 'line-clamp-2 md:line-clamp-none' : ''}`}>
                {summaryRewrite.optimized || "No optimized summary generated."}
              </p>
              <div className="md:hidden absolute -right-1 -bottom-1 bg-gradient-to-l from-[#1e1e24] pl-6 py-1 flex items-center">
                {!isSummaryExpanded && <ChevronDown className="w-3.5 h-3.5 text-gray-400 animate-pulse" />}
              </div>
            </div>
          </button>
          
          <AnimatePresence>
            {(isSummaryExpanded || typeof window !== 'undefined' && window.innerWidth >= 768) && summaryRewrite.recruiter_impact && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="px-3 pb-3 md:px-5 md:pb-5 md:pt-0"
              >
                <div className="p-2.5 md:p-3 bg-blue-500/10 rounded-lg md:rounded-xl border border-blue-500/20 flex items-start mt-2 md:mt-0">
                  <CheckCircle2 className="w-3.5 h-3.5 md:w-4 md:h-4 text-blue-400 mt-0.5 mr-2 shrink-0" />
                  <p className="text-[10px] md:text-sm text-blue-200">
                    <span className="font-semibold text-blue-400">Recruiter Impact: </span> 
                    {summaryRewrite.recruiter_impact}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </BentoCard>

      {/* Bullet Optimizer */}
      <h2 className="text-sm md:text-xl font-medium text-gray-200 mt-6 md:mt-8 mb-2 md:mb-4 px-1">STAR-Method Bullet Enhancements</h2>
      
      {bullets.length > 0 ? (
        <div className="space-y-4">
          {bullets.map((b: any, i: number) => {
            const originalText =
              b.original ||
              b.originalBullet ||
              b.original_bullet ||
              b.before ||
              b.source ||
              b.oldBullet ||
              "Original bullet unavailable";

            const optimizedText =
              b.optimized ||
              b.optimizedBullet ||
              b.optimized_bullet ||
              b.after ||
              "";

            return (
              <BentoCard key={i} className="p-0 overflow-hidden md:p-0">
                {/* Mobile: Swipe hint pill above card */}
                <div className="flex items-center justify-between px-4 pt-3 pb-1 md:hidden">
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] text-red-400/70 font-black uppercase tracking-widest">Original</span>
                    <ArrowRight className="w-2.5 h-2.5 text-gray-600" />
                    <span className="text-[9px] text-green-400/70 font-black uppercase tracking-widest">Improved</span>
                  </div>
                  <span className="text-[9px] text-gray-600 font-bold uppercase tracking-widest animate-pulse">Swipe to compare</span>
                </div>
                <div className="relative">
                  <div className="flex overflow-x-auto snap-x snap-mandatory hide-scrollbar md:grid md:grid-cols-2 divide-x divide-white/10 w-full">
                  
                    {/* Original Bullet */}
                    <div className="snap-center shrink-0 w-full md:w-auto p-4 md:p-5 bg-red-500/5 relative">
                      <span className="text-[10px] md:text-xs font-bold text-red-400 uppercase tracking-wider mb-2 block">Original</span>
                      <p className="text-[11px] md:text-sm text-gray-400 line-through decoration-red-500/50 leading-relaxed">{originalText}</p>
                    </div>
                    
                    {/* Improved Bullet */}
                    <div className="snap-center shrink-0 w-full md:w-auto p-4 md:p-5 bg-green-500/5 relative">
                      <div className="hidden md:flex absolute top-1/2 -left-3 -translate-y-1/2 w-6 h-6 bg-slate-900 rounded-full border border-white/10 items-center justify-center z-10">
                        <ArrowRight className="w-3 h-3 text-gray-500" />
                      </div>
                      <span className="text-[10px] md:text-xs font-bold text-green-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                        Improved
                        {b.quantifiable_metric_added && (
                          <span className="text-[9px] px-2 py-0.5 bg-green-500/20 rounded-full">Quantified</span>
                        )}
                      </span>
                      <p className="text-[11px] md:text-sm text-gray-200 leading-relaxed">{optimizedText}</p>
                    </div>

                  </div>
                  {/* Right gradient fade — mobile only */}
                  <div className="absolute top-0 right-0 bottom-0 w-10 bg-gradient-to-l from-[#0a0a0f] to-transparent pointer-events-none md:hidden" />
                </div>
                {/* Dot indicators — mobile only */}
                <div className="flex md:hidden justify-center gap-1.5 pb-3 pt-1">
                  <span className="w-2 h-2 rounded-full bg-red-400/70" />
                  <span className="w-1.5 h-1.5 rounded-full bg-white/20" />
                </div>
              </BentoCard>
            );
          })}
        </div>
      ) : (
        <BentoCard>
          <p className="text-gray-500 text-xs md:text-sm">No weak bullets found to optimize.</p>
        </BentoCard>
      )}
    </motion.div>
  );
}
