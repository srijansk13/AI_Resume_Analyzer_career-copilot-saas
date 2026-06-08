'use client';

import { motion } from 'framer-motion';
import { Target } from 'lucide-react';

const ROLES = [
  'Frontend Developer',
  'Full Stack Developer',
  'Backend Developer',
  'Data Analyst',
  'ML Engineer',
  'Product Manager',
  'UI/UX Designer',
];

export default function RoleAwareSection() {
  return (
    <section className="py-16 lg:py-28 relative overflow-hidden bg-[#07070a]/80 border-y border-white/[0.04] backdrop-blur-xl">
      <div className="container px-4 md:px-6 mx-auto max-w-7xl text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/5 px-3 py-1.5 text-[10px] text-indigo-400 font-extrabold tracking-widest uppercase mb-4">
          <Target className="w-3.5 h-3.5" />
          Role-aware analysis
        </div>
        <h2 className="text-2xl md:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight mb-4">
          Optimize your resume for the role you want
        </h2>
        <p className="text-sm text-gray-400 font-semibold max-w-2xl mx-auto leading-relaxed mb-10">
          Choose a target role at upload. Missing skills, ATS suggestions, recruiter feedback, and suggested portfolio projects adapt to that career path.
        </p>
        <div className="flex flex-wrap justify-center gap-2 max-w-3xl mx-auto">
          {ROLES.map((role, i) => (
            <motion.span
              key={role}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.04 }}
              className="px-4 py-2 rounded-xl text-xs font-bold border border-white/10 bg-white/[0.03] text-gray-200 hover:border-indigo-500/30 hover:text-white transition-colors"
            >
              {role}
            </motion.span>
          ))}
        </div>
      </div>
    </section>
  );
}
