'use client';

import { motion } from 'framer-motion';
import { Bot, LineChart, FileEdit, Zap, Target, Award } from 'lucide-react';

const features = [
  {
    title: 'ATS Scoring Engine',
    description: 'Get a real-time ATS compatibility score based on exactly what enterprise tracking systems look for.',
    icon: <Target className="h-6 w-6 text-blue-400" />,
  },
  {
    title: 'Missing Skills Analysis',
    description: 'Upload a job description and instantly see which critical keywords you are missing.',
    icon: <LineChart className="h-6 w-6 text-purple-400" />,
  },
  {
    title: 'AI Smart Rewriting',
    description: 'Transform weak bullet points into high-impact, quantifiable achievements using STAR methodology.',
    icon: <Bot className="h-6 w-6 text-pink-400" />,
  },
  {
    title: 'Live Canvas Editor',
    description: 'Edit your resume in real-time with an intuitive, drag-and-drop interface inspired by Notion & Canva.',
    icon: <FileEdit className="h-6 w-6 text-emerald-400" />,
  },
  {
    title: 'Instant PDF Export',
    description: 'Download pixel-perfect, beautifully formatted PDFs that remain 100% ATS-readable.',
    icon: <Zap className="h-6 w-6 text-yellow-400" />,
  },
  {
    title: 'Career Roadmap',
    description: 'Receive personalized recommendations on certifications and courses to bridge your skill gaps.',
    icon: <Award className="h-6 w-6 text-orange-400" />,
  },
];

export default function Features() {
  return (
    <section className="py-24 bg-black relative">
      <div className="container px-4 md:px-6 mx-auto max-w-7xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white mb-4">
            Everything you need to <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">stand out</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Our AI-powered platform provides enterprise-grade insights usually reserved for top recruiting firms.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="p-8 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-colors relative group overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative z-10">
                <div className="h-12 w-12 rounded-xl bg-white/5 flex items-center justify-center mb-6 border border-white/10">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
                <p className="text-gray-400 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
