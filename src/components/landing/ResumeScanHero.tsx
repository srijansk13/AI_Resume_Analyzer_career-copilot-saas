'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Bot, FileText, ShieldCheck, Sparkles, User } from 'lucide-react';

const KEYWORDS = ['React', 'TypeScript', 'Next.js', 'Node.js', 'MongoDB', 'REST APIs'];
const MISSING_SKILLS = ['Docker', 'AWS'];

export default function ResumeScanHero({ isMobile }: { isMobile: boolean }) {
  const [atsScore, setAtsScore] = useState(0);
  const [keywordCount, setKeywordCount] = useState(0);
  const [scanPhase, setScanPhase] = useState(0);

  useEffect(() => {
    const scoreDelay = setTimeout(() => {
      const interval = setInterval(() => {
        setAtsScore((prev) => {
          if (prev >= 87) {
            clearInterval(interval);
            return 87;
          }
          return prev + 1;
        });
      }, isMobile ? 22 : 15);
      return () => clearInterval(interval);
    }, 600);
    return () => clearTimeout(scoreDelay);
  }, [isMobile]);

  useEffect(() => {
    const kwInterval = setInterval(() => {
      setKeywordCount((c) => (c >= KEYWORDS.length ? KEYWORDS.length : c + 1));
    }, isMobile ? 900 : 700);
    return () => clearInterval(kwInterval);
  }, [isMobile]);

  useEffect(() => {
    const phaseInterval = setInterval(() => {
      setScanPhase((p) => (p + 1) % 4);
    }, 3200);
    return () => clearInterval(phaseInterval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, delay: 0.15 }}
      className="w-full max-w-[480px] rounded-3xl bg-slate-950/90 border border-white/[0.08] shadow-2xl relative p-5 sm:p-6 backdrop-blur-xl overflow-hidden"
    >
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.01)_1px,transparent_1px)] [background-size:16px_16px] opacity-40 pointer-events-none" />

      {/* Resume preview panel */}
      <div className="relative rounded-2xl border border-white/[0.06] bg-black/40 p-4 mb-4 overflow-hidden min-h-[200px]">
        {!isMobile && (
          <motion.div
            className="absolute left-0 right-0 h-px z-20 pointer-events-none"
            style={{
              background: 'linear-gradient(90deg, transparent, rgba(52, 211, 153, 0.9), rgba(99, 102, 241, 0.9), transparent)',
              boxShadow: '0 0 12px rgba(52, 211, 153, 0.5)',
            }}
            animate={{ top: ['8%', '88%', '8%'] }}
            transition={{ repeat: Infinity, duration: 4.5, ease: 'easeInOut' }}
          />
        )}

        <div className="flex items-start justify-between gap-3 mb-3 relative z-10">
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2">
              <FileText className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-[9px] font-black uppercase tracking-wider text-cyan-400/90">Resume scan</span>
            </div>
            <div className="h-3 w-28 bg-white/10 rounded" />
            <div className="h-2 w-full max-w-[200px] bg-white/5 rounded" />
            <div className="h-2 w-4/5 bg-white/5 rounded" />
            <div className="h-2 w-3/5 bg-white/5 rounded" />
          </div>
          <div className="h-14 w-14 rounded-full border border-white/[0.08] bg-slate-900 flex flex-col items-center justify-center shrink-0">
            <svg className="absolute w-14 h-14 -rotate-90" viewBox="0 0 56 56">
              <circle cx="28" cy="28" r="24" fill="transparent" stroke="rgba(255,255,255,0.05)" strokeWidth="3" />
              <motion.circle
                cx="28"
                cy="28"
                r="24"
                fill="transparent"
                stroke="rgb(52, 211, 153)"
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray={150}
                animate={{ strokeDashoffset: 150 - (150 * atsScore) / 100 }}
                transition={{ duration: 0.4 }}
              />
            </svg>
            <span className="text-xs font-black text-emerald-400 font-mono relative z-10">{atsScore}</span>
            <span className="text-[7px] text-gray-500 font-bold uppercase">ATS</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5 relative z-10">
          {KEYWORDS.slice(0, keywordCount).map((kw) => (
            <motion.span
              key={kw}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-[8px] font-bold px-2 py-0.5 rounded border bg-cyan-500/10 border-cyan-500/25 text-cyan-200"
            >
              {kw}
            </motion.span>
          ))}
        </div>
      </div>

      {/* Insight cards */}
      <div className="space-y-2 relative z-10">
        <AnimatePresence mode="wait">
          {scanPhase === 0 && (
            <motion.div
              key="missing"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="flex items-start gap-2 p-2.5 rounded-xl bg-orange-500/5 border border-orange-500/15"
            >
              <Activity className="w-3.5 h-3.5 text-orange-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-[9px] font-black uppercase text-orange-300 tracking-wider">Missing market skills</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {MISSING_SKILLS.map((s) => (
                    <span key={s} className="text-[8px] px-1.5 py-0.5 rounded bg-orange-500/10 text-orange-200 font-semibold">{s}</span>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
          {scanPhase === 1 && (
            <motion.div
              key="bullet"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="p-2.5 rounded-xl bg-violet-500/5 border border-violet-500/15"
            >
              <p className="text-[9px] font-black uppercase text-violet-300 tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3 h-3" /> Bullet improvement detected
              </p>
              <p className="text-[10px] text-gray-400 mt-1 leading-relaxed">
                Weak: <span className="line-through text-gray-500">helped improve latency</span>
                <br />
                <span className="text-white font-semibold">→ Optimized render latency by 42%</span>
              </p>
            </motion.div>
          )}
          {scanPhase === 2 && (
            <motion.div
              key="recruiter"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="flex items-start gap-2 p-2.5 rounded-xl bg-indigo-500/5 border border-indigo-500/15"
            >
              <User className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              <div>
                <p className="text-[9px] font-black uppercase text-indigo-300 tracking-wider">Recruiter feedback ready</p>
                <p className="text-[10px] text-gray-400 mt-0.5">Strengths, concerns, and role fit summarized.</p>
              </div>
            </motion.div>
          )}
          {scanPhase === 3 && (
            <motion.div
              key="ready"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-500/5 border border-emerald-500/15"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <p className="text-[10px] text-emerald-200 font-semibold">Analysis complete — open live editor to apply fixes</p>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-center gap-2 p-2 rounded-lg bg-white/[0.02] border border-white/[0.04]">
          <Bot className="w-3 h-3 text-purple-400" />
          <span className="text-[9px] text-gray-500 font-semibold">Upload → Scan → Score → Insights → Improve</span>
        </div>
      </div>

      {!isMobile && (
        <div className="absolute -bottom-12 -right-12 w-40 h-40 bg-cyan-500/[0.06] rounded-full blur-3xl pointer-events-none" />
      )}
    </motion.div>
  );
}
