'use client';

import { motion } from 'framer-motion';
import { MessageSquare, HelpCircle, Zap, Target, ArrowRight } from 'lucide-react';
import { BentoCard } from '../bento/BentoCard';

export default function InterviewModule({ analysis }: { analysis: any }) {
  const wow = analysis?.wow || {};
  const questions = wow.interview_questions || [];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-6"
    >
      <BentoCard className="border border-white/5 bg-slate-900/20 backdrop-blur-3xl shadow-2xl">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-xl font-display font-bold text-gray-200 flex items-center">
            <MessageSquare className="w-5 h-5 mr-2 text-pink-400" />
            AI Interview Intelligence System
          </h2>
          <span className="px-3 py-1.5 bg-pink-500/10 text-pink-400 border border-pink-500/20 rounded-full text-xs font-bold flex items-center shadow-lg shadow-pink-500/5">
            <Zap className="w-3 h-3 mr-1" /> Live Simulation Ready
          </span>
        </div>

        <div className="space-y-6">
          
          {/* Tone Analysis Profile */}
          <div className="p-5 bg-gradient-to-r from-pink-500/10 to-transparent rounded-2xl border border-pink-500/20 flex flex-col md:flex-row gap-4 items-start justify-between">
            <div>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center">
                <Target className="w-3 h-3 mr-1.5 text-pink-400" /> Projected Persona
              </h3>
              <p className="text-gray-300 text-sm font-medium leading-relaxed">
                {wow.tone_analysis || "Professional, structured, and execution-oriented."}
              </p>
            </div>
          </div>

          <div className="grid gap-6">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-4">Predictive Question Matrix</h3>
            
            {questions.length > 0 ? (
              questions.map((q: any, i: number) => (
                <motion.div 
                  key={i} 
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                  className="p-6 bg-slate-900/50 rounded-3xl border border-white/5 group hover:border-pink-500/30 transition-all hover:shadow-[0_0_30px_-10px_rgba(236,72,153,0.15)]"
                >
                  <div className="flex flex-col md:flex-row items-start gap-4">
                    <div className="w-10 h-10 rounded-2xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center shrink-0">
                      <HelpCircle className="w-5 h-5 text-pink-400" />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-2 mb-3">
                        <h4 className="text-gray-100 font-display font-medium text-lg leading-tight">{q.question}</h4>
                        <span className="shrink-0 px-2.5 py-1 bg-white/5 border border-white/10 rounded-lg text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                          Difficulty: Medium
                        </span>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="bg-black/20 p-4 rounded-xl border border-white/5">
                          <p className="text-sm text-gray-400 leading-relaxed">
                            <span className="text-pink-400 font-bold mr-2">Core Intent:</span> 
                            {q.purpose}
                          </p>
                        </div>
                        
                        <div className="grid grid-cols-1 gap-4">
                          <div className="p-4 border border-white/5 bg-white/[0.02] rounded-xl relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-1 h-full bg-blue-500/50" />
                            <h5 className="text-[10px] uppercase font-bold text-gray-500 mb-1">STAR Method Hint</h5>
                            <p className="text-xs text-gray-400">Focus on the specific architecture decisions and quantify the final metric impact.</p>
                          </div>
                        </div>
                      </div>

                    </div>
                  </div>
                </motion.div>
              ))
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
