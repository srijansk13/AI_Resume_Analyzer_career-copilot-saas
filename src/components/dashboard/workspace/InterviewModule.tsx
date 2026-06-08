'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, HelpCircle, Zap, Target, ArrowRight, ChevronDown } from 'lucide-react';
import { BentoCard } from '../bento/BentoCard';

export default function InterviewModule({ analysis }: { analysis: any }) {
  const wow = analysis?.wow || {};
  const questions = wow.interview_questions || [];
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0); // First one open by default

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-4 md:space-y-6"
    >
      <BentoCard className="border border-white/5 bg-slate-900/20 backdrop-blur-3xl shadow-2xl p-4 md:p-6">
        <div className="flex justify-between items-center mb-6 md:mb-8">
          <h2 className="text-lg md:text-xl font-display font-bold text-gray-200 flex items-center">
            <MessageSquare className="w-4 h-4 md:w-5 md:h-5 mr-2 text-pink-400" />
            AI Interview Intelligence System
          </h2>
          <span className="hidden md:flex px-3 py-1.5 bg-pink-500/10 text-pink-400 border border-pink-500/20 rounded-full text-xs font-bold items-center shadow-lg shadow-pink-500/5">
            <Zap className="w-3 h-3 mr-1" /> Live Simulation Ready
          </span>
        </div>

        <div className="space-y-6 md:space-y-8">
          
          {/* Tone Analysis Profile */}
          <div className="p-4 md:p-5 bg-gradient-to-r from-pink-500/10 to-transparent rounded-2xl border border-pink-500/20 flex flex-col md:flex-row gap-3 md:gap-4 items-start justify-between">
            <div>
              <h3 className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5 md:mb-2 flex items-center">
                <Target className="w-3 h-3 mr-1.5 text-pink-400" /> Projected Persona
              </h3>
              <p className="text-gray-300 text-xs md:text-sm font-medium leading-relaxed">
                {wow.tone_analysis || "Professional, structured, and execution-oriented."}
              </p>
            </div>
          </div>

          <div className="grid gap-3 md:gap-4">
            <h3 className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-widest mt-2 md:mt-4 mb-1">Predictive Question Matrix</h3>
            
            {questions.length > 0 ? (
              questions.map((q: any, i: number) => {
                const isExpanded = expandedIndex === i;
                return (
                  <motion.div 
                    key={i} 
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.1 }}
                    className={`bg-slate-900/50 rounded-2xl md:rounded-3xl border transition-all ${isExpanded ? 'border-pink-500/30 shadow-[0_0_30px_-10px_rgba(236,72,153,0.15)]' : 'border-white/5 hover:border-white/10'}`}
                  >
                    <button 
                      onClick={() => setExpandedIndex(isExpanded ? null : i)}
                      className="w-full p-4 md:p-6 flex items-start gap-3 md:gap-4 text-left outline-none"
                    >
                      <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl md:rounded-2xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center shrink-0 mt-0.5 md:mt-0">
                        <HelpCircle className="w-4 h-4 md:w-5 md:h-5 text-pink-400" />
                      </div>
                      
                      <div className="flex-1 pr-2">
                        <h4 className="text-gray-100 font-display font-medium text-sm md:text-lg leading-tight md:mb-1 pr-6 relative">
                          {q.question}
                          <ChevronDown className={`w-4 h-4 text-gray-500 absolute right-0 top-0 md:top-1 transition-transform ${isExpanded ? 'rotate-180 text-pink-400' : ''}`} />
                        </h4>
                        {!isExpanded && (
                          <p className="text-[11px] md:text-sm text-gray-500 line-clamp-1 mt-1.5 md:mt-2">
                            <span className="text-pink-500/70 font-bold mr-1">Intent:</span> {q.purpose}
                          </p>
                        )}
                      </div>
                    </button>

                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="p-4 md:p-6 pt-0 md:pt-0 ml-11 md:ml-14">
                            <div className="flex items-center mb-3 md:mb-4">
                              <span className="shrink-0 px-2.5 py-1 bg-white/5 border border-white/10 rounded-lg text-[9px] md:text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                                Difficulty: Medium
                              </span>
                            </div>
                            
                            <div className="space-y-3 md:space-y-4">
                              <div className="bg-black/20 p-3 md:p-4 rounded-xl border border-white/5">
                                <p className="text-[11px] md:text-sm text-gray-400 leading-relaxed">
                                  <span className="text-pink-400 font-bold mr-2">Core Intent:</span> 
                                  {q.purpose}
                                </p>
                              </div>
                              
                              <div className="p-3 md:p-4 border border-white/5 bg-white/[0.02] rounded-xl relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-1 h-full bg-blue-500/50" />
                                <h5 className="text-[9px] md:text-[10px] uppercase font-bold text-gray-500 mb-1">STAR Method Hint</h5>
                                <p className="text-[11px] md:text-xs text-gray-400">Focus on the specific architecture decisions and quantify the final metric impact.</p>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })
            ) : (
              <div className="flex flex-col items-center justify-center p-12 bg-white/5 rounded-3xl border border-white/5 border-dashed">
                <HelpCircle className="w-12 h-12 text-gray-600 mb-4" />
                <p className="text-gray-400 text-sm font-medium">No interview questions predicted yet.</p>
              </div>
            )}
          </div>
        </div>
      </BentoCard>
    </motion.div>
  );
}
