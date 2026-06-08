'use client';

import { motion } from 'framer-motion';
import { AlertCircle, Check, Code, Hash, User, Wand2 } from 'lucide-react';

export default function SampleAnalysisPreview() {
  return (
    <section id="sample-analysis" className="py-16 lg:py-28 relative scroll-mt-12 overflow-hidden border-t border-white/[0.04] bg-[#050508]/50">
      <div className="container px-4 md:px-6 mx-auto max-w-7xl">
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
          <p className="text-[10px] font-black uppercase tracking-widest text-cyan-400">Product preview</p>
          <h2 className="text-2xl md:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
            See what you get after analysis
          </h2>
          <p className="text-sm text-gray-400 font-semibold leading-relaxed">
            Every upload unlocks ATS scoring, skill gaps, bullet rewrites, recruiter-style feedback, and portfolio project ideas — before you edit anything.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="p-5 rounded-2xl border border-white/[0.06] bg-[#08080c]/80 backdrop-blur-xl"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-black uppercase text-gray-500 tracking-wider">ATS score</span>
              <Hash className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-4xl font-black text-emerald-400 font-mono">87<span className="text-lg text-gray-500">%</span></p>
            <p className="text-[11px] text-gray-500 mt-2 font-semibold">Readability, keywords, format & impact breakdown</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.05 }}
            className="p-5 rounded-2xl border border-orange-500/15 bg-orange-500/[0.03]"
          >
            <div className="flex items-center gap-2 mb-3">
              <AlertCircle className="w-4 h-4 text-orange-400" />
              <span className="text-[10px] font-black uppercase text-orange-300 tracking-wider">Missing skills</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {['Docker', 'AWS', 'CI/CD'].map((s) => (
                <span key={s} className="text-[10px] px-2 py-1 rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-200 font-bold">{s}</span>
              ))}
            </div>
            <p className="text-[11px] text-gray-500 mt-3">Aligned to your target role</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="p-5 rounded-2xl border border-white/[0.06] bg-[#08080c]/80 md:col-span-2 lg:col-span-1"
          >
            <div className="flex items-center gap-2 mb-3">
              <Wand2 className="w-4 h-4 text-violet-400" />
              <span className="text-[10px] font-black uppercase text-violet-300 tracking-wider">Bullet optimization</span>
            </div>
            <p className="text-[11px] text-gray-500 line-through">Responsible for fixing bugs in the dashboard</p>
            <p className="text-xs text-white font-semibold mt-2 leading-relaxed">
              Optimized dashboard render latency by 42% through targeted refactors and automated E2E coverage.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15 }}
            className="p-5 rounded-2xl border border-indigo-500/15 bg-indigo-500/[0.03] md:col-span-2"
          >
            <div className="flex items-center gap-2 mb-3">
              <User className="w-4 h-4 text-indigo-400" />
              <span className="text-[10px] font-black uppercase text-indigo-300 tracking-wider">Recruiter feedback</span>
            </div>
            <p className="text-xs text-gray-300 leading-relaxed font-semibold">
              &ldquo;Strong full-stack foundation. Add quantified impact on recent role and surface cloud deployment experience for senior ATS filters.&rdquo;
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="p-5 rounded-2xl border border-cyan-500/15 bg-cyan-500/[0.03]"
          >
            <div className="flex items-center gap-2 mb-3">
              <Code className="w-4 h-4 text-cyan-400" />
              <span className="text-[10px] font-black uppercase text-cyan-300 tracking-wider">Suggested project</span>
            </div>
            <p className="text-sm font-bold text-white">SaaS Dashboard with Auth & Charts</p>
            <p className="text-[11px] text-gray-400 mt-2 leading-relaxed">Build to demonstrate React, APIs, and data visualization for full-stack roles.</p>
            <span className="inline-flex items-center gap-1 mt-3 text-[10px] text-emerald-400 font-bold">
              <Check className="w-3 h-3" /> Portfolio-ready
            </span>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
