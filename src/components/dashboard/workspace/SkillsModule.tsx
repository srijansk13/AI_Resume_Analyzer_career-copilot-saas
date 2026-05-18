'use client';

import { motion } from 'framer-motion';
import { Briefcase, AlertCircle, Hash, TrendingUp, Sparkles } from 'lucide-react';
import { BentoCard } from '../bento/BentoCard';

export default function SkillsModule({ analysis }: { analysis: any }) {
  const keywords = analysis?.keywords || {};
  const detectedSkills = keywords.detected_skills || { technical: [], soft: [], tools: [] };
  const missingSkills = keywords.missing_critical_skills || [];
  const keywordDensity = keywords.density || [];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-6"
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Detected Skills Categories */}
        <BentoCard className="lg:col-span-2 space-y-6 border border-white/[0.06] bg-[#0a0a0f]/80 backdrop-blur-2xl shadow-2xl relative">
          <div className="absolute top-0 left-0 w-32 h-32 bg-emerald-500/[0.02] rounded-full blur-2xl pointer-events-none" />
          
          <div className="flex justify-between items-center mb-6 border-b border-white/[0.04] pb-4">
            <h2 className="text-sm font-black uppercase tracking-wider text-gray-200 flex items-center">
              <Briefcase className="w-4 h-4 mr-2 text-emerald-400" />
              AI Skill Intelligence Engine
            </h2>
            <div className="flex items-center space-x-2 text-[10px] text-gray-400 bg-white/5 px-3 py-1 rounded-full border border-white/10">
              <Sparkles className="w-3 h-3 text-blue-400 animate-pulse" />
              <span className="font-bold uppercase tracking-wider text-[8px]">Semantic Clustering</span>
            </div>
          </div>
          
          <div className="space-y-8">
            {/* Technical */}
            <div>
              <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-400 mr-2 inline-block" /> Technical Core
              </h3>
              <div className="flex flex-wrap gap-2.5">
                {detectedSkills.technical.map((s: string, i: number) => (
                  <div key={i} className="group relative flex items-center px-3.5 py-1.5 bg-blue-500/5 hover:bg-blue-500/10 border border-blue-500/15 rounded-xl hover:border-blue-500/30 transition-all cursor-default overflow-hidden">
                    <span className="text-blue-200 text-xs font-semibold z-10">{s}</span>
                    <TrendingUp className="w-3 h-3 text-blue-400 ml-2 z-10 opacity-40 group-hover:opacity-100 transition-opacity" />
                  </div>
                ))}
              </div>
            </div>

            {/* Tools */}
            <div>
              <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center">
                <span className="h-1.5 w-1.5 rounded-full bg-purple-400 mr-2 inline-block" /> Ecosystems & Frameworks
              </h3>
              <div className="flex flex-wrap gap-2.5">
                {detectedSkills.tools.map((s: string, i: number) => (
                  <div key={i} className="group relative flex items-center px-3.5 py-1.5 bg-purple-500/5 hover:bg-purple-500/10 border border-purple-500/15 rounded-xl hover:border-purple-500/30 transition-all cursor-default overflow-hidden">
                    <span className="text-purple-200 text-xs font-semibold z-10">{s}</span>
                    <TrendingUp className="w-3 h-3 text-purple-400 ml-2 z-10 opacity-40 group-hover:opacity-100 transition-opacity" />
                  </div>
                ))}
              </div>
            </div>

            {/* Soft */}
            <div>
              <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 mr-2 inline-block" /> Leadership & Collaboration
              </h3>
              <div className="flex flex-wrap gap-2.5">
                {detectedSkills.soft.map((s: string, i: number) => (
                  <div key={i} className="group relative flex items-center px-3.5 py-1.5 bg-emerald-500/5 hover:bg-emerald-500/10 border border-emerald-500/15 rounded-xl hover:border-emerald-500/30 transition-all cursor-default overflow-hidden">
                    <span className="text-emerald-200 text-xs font-semibold z-10">{s}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </BentoCard>

        {/* Missing Critical Skills */}
        <BentoCard className="border border-white/[0.06] bg-[#0a0a0f]/80 backdrop-blur-2xl shadow-2xl flex flex-col relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/[0.015] rounded-full blur-2xl pointer-events-none" />
          
          <h2 className="text-sm font-black uppercase tracking-wider text-gray-200 mb-6 flex items-center border-b border-white/[0.04] pb-4">
            <AlertCircle className="w-4 h-4 mr-2 text-orange-400" />
            Market Gaps Detected
          </h2>
          <div className="space-y-3.5 flex-1 overflow-y-auto max-h-[360px] pr-1">
            {missingSkills.length > 0 ? (
              missingSkills.map((gap: any, i: number) => (
                <div key={i} className="p-4 bg-orange-500/5 rounded-2xl border border-orange-500/15 relative overflow-hidden group hover:border-orange-500/30 hover:bg-orange-500/10 transition-all duration-300">
                  <div className="absolute top-0 right-0 p-3 opacity-10">
                    <AlertCircle className="w-10 h-10 text-orange-500" />
                  </div>
                  <span className="text-orange-300 font-extrabold text-xs block mb-1.5 relative z-10">{gap.skill}</span>
                  {gap.explainability_node?.impact && (
                    <p className="text-[11px] text-gray-400 relative z-10 leading-relaxed font-semibold">{gap.explainability_node.impact}</p>
                  )}
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center p-8 opacity-60">
                <div className="w-12 h-12 bg-emerald-500/10 rounded-full flex items-center justify-center mb-4">
                  <Sparkles className="w-6 h-6 text-emerald-400" />
                </div>
                <p className="text-gray-300 text-xs font-bold">No critical gaps identified</p>
                <p className="text-[10px] text-gray-500 mt-1">Your experience alignment looks solid.</p>
              </div>
            )}
          </div>
        </BentoCard>

      </div>

      {/* Keyword Analytics */}
      <BentoCard className="border border-white/[0.06] bg-[#0a0a0f]/80 backdrop-blur-2xl shadow-2xl relative">
        <div className="absolute bottom-0 right-0 w-44 h-44 bg-cyan-500/[0.01] rounded-full blur-3xl pointer-events-none" />
        
        <h2 className="text-sm font-black uppercase tracking-wider text-gray-200 flex items-center mb-6 border-b border-white/[0.04] pb-4">
          <Hash className="w-4 h-4 mr-2 text-cyan-400" />
          Keyword Density Analysis
        </h2>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
          {keywordDensity.map((k: any, i: number) => (
            <div key={i} className={`p-4 rounded-2xl border flex flex-col justify-between transition-all hover:scale-[1.02] ${k.is_optimal ? 'bg-white/[0.015] border-white/10 hover:bg-white/[0.03]' : 'bg-red-500/5 border-red-500/15 hover:border-red-500/30'}`}>
              <span className="text-xs font-bold text-gray-200 truncate w-full mb-3">{k.keyword}</span>
              <div className="flex items-center justify-between">
                <span className={`text-[10px] font-mono ${k.is_optimal ? 'text-gray-400' : 'text-red-400'}`}>Freq: {k.count}</span>
                <div className={`w-1.5 h-1.5 rounded-full ${k.is_optimal ? 'bg-emerald-500' : 'bg-red-500 animate-pulse'}`} />
              </div>
            </div>
          ))}
        </div>
      </BentoCard>

    </motion.div>
  );
}
