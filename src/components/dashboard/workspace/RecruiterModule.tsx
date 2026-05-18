'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserCircle2, CheckCircle2, ShieldAlert, Building2, Rocket, ArrowRight, MessageSquare, Bot } from 'lucide-react';
import { BentoCard } from '../bento/BentoCard';

export default function RecruiterModule({ analysis }: { analysis: any }) {
  const recruiter = analysis?.recruiter || {};
  const [mode, setMode] = useState<'faang' | 'startup'>('faang');

  // Probability parser
  const getProbabilityScore = (prob: string) => {
    if (!prob) return 50;
    const p = prob.toLowerCase();
    if (p.includes('high')) return 88;
    if (p.includes('medium') || p.includes('modest')) return 58;
    if (p.includes('low')) return 28;
    return 65;
  };
  const probScore = getProbabilityScore(recruiter.hiring_probability);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-6"
    >
      {/* Header and Mode Selector */}
      <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 bg-[#0a0a0f]/80 p-4 rounded-3xl border border-white/[0.06] backdrop-blur-2xl shadow-xl">
        <div className="flex p-1 bg-black/40 rounded-2xl border border-white/5 shrink-0 self-start md:self-auto">
          <button 
            onClick={() => setMode('faang')}
            className={`flex items-center px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${mode === 'faang' ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/20 shadow-[0_0_15px_-3px_rgba(99,102,241,0.2)]' : 'text-gray-500 hover:text-gray-300'}`}
          >
            <Building2 className="w-3.5 h-3.5 mr-2" /> Enterprise Recruiter
          </button>
          <button 
            onClick={() => setMode('startup')}
            className={`flex items-center px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${mode === 'startup' ? 'bg-purple-600/20 text-purple-400 border border-purple-500/20 shadow-[0_0_15px_-3px_rgba(168,85,247,0.2)]' : 'text-gray-500 hover:text-gray-300'}`}
          >
            <Rocket className="w-3.5 h-3.5 mr-2" /> Startup Founder
          </button>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-6 px-4">
          <div className="text-right">
            <p className="text-[10px] text-gray-500 uppercase tracking-widest font-black mb-1">Target Fit Status</p>
            <p className="text-sm font-extrabold text-white">{recruiter.hiring_probability || "Highly Competitive"}</p>
          </div>
          <div className="w-18 h-18 relative flex items-center justify-center shrink-0">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 48 48">
              <circle cx="24" cy="24" r="20" stroke="rgba(255,255,255,0.03)" strokeWidth="4" fill="none" />
              <motion.circle 
                initial={{ strokeDasharray: "0 1000" }}
                animate={{ strokeDasharray: `${probScore * 1.25} 1000` }}
                transition={{ duration: 1.5, type: 'spring' }}
                cx="24" cy="24" r="20" 
                stroke={probScore > 75 ? "#10b981" : probScore > 45 ? "#a855f7" : "#f43f5e"} 
                strokeWidth="4" fill="none" 
                strokeLinecap="round" 
              />
            </svg>
            <span className="absolute text-sm font-black font-mono text-white">{probScore}%</span>
          </div>
        </div>
      </div>

      {/* Recruiter Simulated Slack-Style Feed Card */}
      <BentoCard className="border border-white/[0.06] bg-[#0a0a0f]/80 backdrop-blur-2xl shadow-2xl relative p-6">
        <div className="absolute top-0 right-0 w-44 h-44 bg-indigo-500/[0.01] rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex items-center space-x-3 pb-4 border-b border-white/[0.04] mb-6">
          <div className="relative">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/10">
              <Bot className="h-5 w-5 text-white" />
            </div>
            <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-500 border-2 border-[#0a0a0f]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-black text-white">
                {mode === 'faang' ? 'Sarah Jenkins' : 'Marcus Vance'}
              </h3>
              <span className="text-[9px] uppercase tracking-wider bg-white/5 border border-white/10 text-gray-400 px-1.5 py-0.5 rounded font-extrabold scale-90">
                {mode === 'faang' ? 'Principal Technical Recruiter' : 'Co-Founder & CTO'}
              </span>
            </div>
            <p className="text-[10px] text-gray-500">Active simulated chat channel</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Top Strengths */}
          <div className="space-y-4">
            <h3 className="text-[10px] text-gray-400 uppercase tracking-widest font-black flex items-center mb-4 border-b border-white/[0.03] pb-2">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 mr-2 inline-block" /> Value Proposition
            </h3>
            <div className="space-y-3">
              <AnimatePresence mode="popLayout">
                {Array.isArray(recruiter.top_strengths) && recruiter.top_strengths.length > 0 ? (
                  recruiter.top_strengths.map((str: string, i: number) => (
                    <motion.div 
                      key={i} 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.08 }}
                      className="flex items-start text-xs bg-emerald-500/5 p-4 rounded-2xl border border-emerald-500/15 group hover:border-emerald-500/30 transition-all duration-300"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 mr-3 shrink-0 mt-0.5" />
                      <span className="text-gray-300 font-semibold leading-relaxed">{str}</span>
                    </motion.div>
                  ))
                ) : (
                  <p className="text-gray-500 text-xs italic">No strengths identified in this context.</p>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Hiring manager Concerns */}
          <div className="space-y-4">
            <h3 className="text-[10px] text-gray-400 uppercase tracking-widest font-black flex items-center mb-4 border-b border-white/[0.03] pb-2">
              <span className="h-1.5 w-1.5 rounded-full bg-red-500 mr-2 inline-block" /> Risk Factors
            </h3>
            <div className="space-y-3.5">
              <AnimatePresence mode="popLayout">
                {Array.isArray(recruiter.hiring_manager_concerns) && recruiter.hiring_manager_concerns.length > 0 ? (
                  recruiter.hiring_manager_concerns.map((c: any, i: number) => (
                    <motion.div 
                      key={i} 
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.08 }}
                      className="flex flex-col text-xs bg-red-500/5 p-4 rounded-2xl border border-red-500/15 group hover:border-red-500/30 transition-all duration-300"
                    >
                      <div className="flex items-start mb-3">
                        <ShieldAlert className="w-4 h-4 text-red-400 mr-3 shrink-0 mt-0.5" />
                        <span className="text-gray-200 font-bold leading-relaxed">{c.concern}</span>
                      </div>
                      {c.explainability_node && (
                        <div className="pl-7">
                          <div className="bg-[#0e0e14] border border-red-500/20 p-3.5 rounded-xl">
                            <span className="text-[9px] uppercase text-red-400 font-black tracking-widest block mb-1">Simulated Fix Strategy</span>
                            <span className="text-gray-400 leading-relaxed font-semibold">{c.explainability_node.fix_strategy}</span>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  ))
                ) : (
                  <p className="text-gray-500 text-xs italic">No major risk factors detected.</p>
                )}
              </AnimatePresence>
            </div>
          </div>

        </div>
      </BentoCard>
    </motion.div>
  );
}
