'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Eye, PenTool, Sparkles, Wand2 } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function LiveEditorSection() {
  return (
    <section id="live-editor" className="py-16 lg:py-28 relative scroll-mt-12 overflow-hidden z-10">
      <div className="container px-4 md:px-6 mx-auto max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-5">
            <p className="text-[10px] font-black uppercase tracking-widest text-purple-400">Live resume editor</p>
            <h2 className="text-2xl md:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
              Don&apos;t just check your resume. <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">Improve it live.</span>
            </h2>
            <p className="text-sm text-gray-400 font-semibold leading-relaxed max-w-lg">
              Most tools stop at a score. Career Copilot explains what&apos;s wrong, suggests stronger wording, and lets you apply improvements directly in a live editor with instant preview.
            </p>
            <ul className="space-y-2 text-sm text-gray-300 font-semibold">
              <li className="flex items-center gap-2"><Sparkles className="w-4 h-4 text-indigo-400 shrink-0" /> Analysis panel with ATS & recruiter insights</li>
              <li className="flex items-center gap-2"><Wand2 className="w-4 h-4 text-purple-400 shrink-0" /> AI Enhance: apply summary & bullet rewrites</li>
              <li className="flex items-center gap-2"><PenTool className="w-4 h-4 text-cyan-400 shrink-0" /> Edit content manually anytime</li>
              <li className="flex items-center gap-2"><Eye className="w-4 h-4 text-emerald-400 shrink-0" /> Pixel-perfect live preview</li>
            </ul>
            <Link href="/signup">
              <Button className="h-11 px-6 bg-white hover:bg-slate-200 text-black rounded-xl text-xs font-black mt-2">
                Try the live editor
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </Link>
          </div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="rounded-2xl border border-white/[0.08] bg-[#07070a]/90 p-4 backdrop-blur-xl shadow-2xl space-y-3"
          >
            <div className="grid grid-cols-3 gap-2 text-[9px] font-black uppercase tracking-wider text-center">
              <span className="py-1.5 rounded-lg bg-indigo-500/15 text-indigo-300 border border-indigo-500/20">Analysis</span>
              <span className="py-1.5 rounded-lg bg-purple-500/15 text-purple-300 border border-purple-500/20">AI Enhance</span>
              <span className="py-1.5 rounded-lg bg-white/5 text-gray-400 border border-white/10">Preview</span>
            </div>
            <div className="rounded-xl border border-white/[0.06] bg-black/50 p-4 space-y-3 min-h-[220px]">
              <div className="p-3 rounded-lg bg-purple-500/5 border border-purple-500/15">
                <p className="text-[9px] font-black text-purple-300 uppercase mb-1">AI suggestion</p>
                <p className="text-[10px] text-gray-400 line-through">Managed team projects</p>
                <p className="text-[11px] text-white font-semibold mt-1">Led 4-engineer squad delivering 12 releases on schedule</p>
                <button type="button" className="mt-2 text-[9px] font-black uppercase bg-white text-black px-2.5 py-1 rounded-lg">
                  Apply to Resume
                </button>
              </div>
              <div className="h-16 rounded-lg border border-dashed border-white/10 bg-white/[0.02] flex items-center justify-center">
                <span className="text-[10px] text-gray-500 font-semibold">Live resume preview updates instantly</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
