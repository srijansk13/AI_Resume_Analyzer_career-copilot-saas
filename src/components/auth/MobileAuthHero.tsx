'use client';

import { motion } from 'framer-motion';
import { BrainCircuit } from 'lucide-react';

interface MobileAuthHeroProps {
  type?: 'login' | 'signup';
}

export default function MobileAuthHero({ type }: MobileAuthHeroProps) {
  return (
    <div className="lg:hidden w-full px-6 pt-12 pb-8 relative flex flex-col items-center text-center">
      {/* ── Background atmosphere ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* subtle grid */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] [background-size:28px_28px]" />
        {/* subtle radial glows */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] h-[300px] bg-indigo-500/10 rounded-full blur-[80px]" />
      </div>

      {/* ── Logo mark ── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="flex flex-col items-center relative z-10"
      >
        <div className="relative mb-4">
          <div className="absolute inset-0 bg-indigo-500/30 rounded-2xl blur-[12px]" />
          <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 border border-white/10 flex items-center justify-center shadow-xl">
            <BrainCircuit className="w-6 h-6 text-white" />
          </div>
        </div>
        
        <h1 className="text-2xl font-black text-white tracking-tight mb-1">
          Career Copilot
        </h1>
        <p className="text-[11px] font-bold uppercase tracking-widest text-indigo-400/80">
          AI Career Intelligence Engine
        </p>
      </motion.div>
    </div>
  );
}
