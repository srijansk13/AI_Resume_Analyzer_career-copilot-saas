'use client';

import { motion } from 'framer-motion';
import { BarChart3, Lightbulb, PenLine, RefreshCw } from 'lucide-react';

const STEPS = [
  { icon: BarChart3, title: 'Check score', desc: 'See ATS compatibility and category breakdowns.', color: 'indigo' },
  { icon: Lightbulb, title: 'Understand issues', desc: 'Missing skills, weak bullets, and recruiter concerns explained clearly.', color: 'orange' },
  { icon: PenLine, title: 'Apply improvements', desc: 'Use AI Enhance and the live editor to fix content in one place.', color: 'purple' },
  { icon: RefreshCw, title: 'Re-analyze', desc: 'Upload updates and track score improvements over time.', color: 'emerald' },
];

export default function ProblemSolutionSection() {
  return (
    <section id="how-it-works" className="py-16 lg:py-28 relative z-10 scroll-mt-12 border-y border-white/[0.02] bg-[#050508]/40 backdrop-blur-3xl overflow-hidden">
      <div className="container px-4 md:px-6 mx-auto max-w-7xl">
        <div className="max-w-3xl mx-auto text-center mb-14 space-y-4">
          <h2 className="text-2xl md:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight max-w-2xl mx-auto">
            Most ATS tools only give you a score.
          </h2>
          <p className="text-lg text-gray-400 font-semibold">You still don&apos;t know what to fix.</p>
          <p className="text-sm text-gray-500 leading-relaxed">
            Career Copilot explains the problem, suggests improvements, and lets you edit everything live — so you leave with a stronger resume, not just a number.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {STEPS.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              className="p-6 rounded-2xl border border-white/[0.06] bg-[#08080c]/60 backdrop-blur-lg text-center"
            >
              <div className={`mx-auto w-10 h-10 rounded-xl flex items-center justify-center mb-4 border ${
                step.color === 'indigo' ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400' :
                step.color === 'orange' ? 'bg-orange-500/10 border-orange-500/20 text-orange-400' :
                step.color === 'purple' ? 'bg-purple-500/10 border-purple-500/20 text-purple-400' :
                'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
              }`}>
                <step.icon className="w-5 h-5" />
              </div>
              <p className="text-[10px] font-black uppercase text-gray-500 mb-1">Step {i + 1}</p>
              <h3 className="text-sm font-extrabold text-white mb-2">{step.title}</h3>
              <p className="text-[11px] text-gray-400 font-semibold leading-relaxed">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
