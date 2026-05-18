'use client';

import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react';
import { BentoCard } from '../bento/BentoCard';
import { Button } from '@/components/ui/button';

export default function OptimizationModule({ analysis }: { analysis: any }) {
  const optimization = analysis?.optimization || {};
  const summaryRewrite = optimization.summary_rewrite || {};
  const bullets = optimization.bullet_optimizations || [];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-6"
    >
      {/* Summary Rewrite */}
      <BentoCard>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-medium text-gray-200 flex items-center">
            <Sparkles className="w-5 h-5 mr-2 text-yellow-400" />
            AI Professional Summary
          </h2>
          <span className="px-3 py-1 bg-yellow-500/10 text-yellow-400 text-xs rounded-full border border-yellow-500/20">
            ATS Optimized
          </span>
        </div>
        
        <div className="bg-white/5 p-5 rounded-2xl border border-white/5 relative group">
          <p className="text-gray-300 leading-relaxed text-sm md:text-base">
            {summaryRewrite.optimized || "No optimized summary generated."}
          </p>
          {summaryRewrite.recruiter_impact && (
            <div className="mt-4 p-3 bg-blue-500/10 rounded-xl border border-blue-500/20 flex items-start">
              <CheckCircle2 className="w-4 h-4 text-blue-400 mt-0.5 mr-2 shrink-0" />
              <p className="text-sm text-blue-200">
                <span className="font-semibold text-blue-400">Recruiter Impact: </span> 
                {summaryRewrite.recruiter_impact}
              </p>
            </div>
          )}
        </div>
      </BentoCard>

      {/* Bullet Optimizer */}
      <h2 className="text-xl font-medium text-gray-200 mt-8 mb-4">STAR-Method Bullet Enhancements</h2>
      
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

            console.log("[Optimization Mapping] Original field resolved:", originalText);
            console.log("[Optimization Mapping] Optimized field resolved:", optimizedText);

            return (
              <BentoCard key={i} className="p-0 overflow-hidden">
                <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-white/10">
                  <div className="p-5 bg-red-500/5">
                    <span className="text-xs font-bold text-red-400 uppercase tracking-wider mb-2 block">Original</span>
                    <p className="text-sm text-gray-400 line-through decoration-red-500/50">{originalText}</p>
                  </div>
                  <div className="p-5 bg-green-500/5 relative">
                    <div className="absolute left-1/2 -top-3 md:top-1/2 md:-left-3 -translate-x-1/2 md:translate-x-0 md:-translate-y-1/2 w-6 h-6 bg-slate-900 rounded-full border border-white/10 flex items-center justify-center z-10">
                      <ArrowRight className="w-3 h-3 text-gray-500 md:rotate-0 rotate-90" />
                    </div>
                    <span className="text-xs font-bold text-green-400 uppercase tracking-wider mb-2 block flex items-center justify-between">
                      Optimized
                      {b.quantifiable_metric_added && (
                        <span className="text-[10px] px-2 py-0.5 bg-green-500/20 rounded-full">Quantified</span>
                      )}
                    </span>
                    <p className="text-sm text-gray-200">{optimizedText}</p>
                  </div>
                </div>
              </BentoCard>
            );
          })}
        </div>
      ) : (
        <BentoCard>
          <p className="text-gray-500 text-sm">No weak bullets found to optimize.</p>
        </BentoCard>
      )}
    </motion.div>
  );
}
