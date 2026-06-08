'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, 
  TrendingUp, 
  Cpu, 
  Target, 
  Sparkles, 
  ShieldCheck, 
  ArrowRight,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Award
} from 'lucide-react';
import Link from 'next/link';

interface DashboardOverviewClientProps {
  userName: string;
  isNewUser: boolean;
  stats: {
    totalResumes: number;
    avgAtsScore: number;
    aiImprovements: number;
    matchesFound: number;
  };
  recentResumes: Array<{
    id: string;
    title: string;
    filename: string;
    createdAt: string;
    atsScore: number;
  }>;
}

const AI_TIPS = [
  {
    title: "Quantify Your Achievements",
    content: "Adding numeric metrics (e.g., 'increased efficiency by 22%') improves recruiter callback rates by 40% and boosts ATS classification accuracy.",
    tag: "Resume Structure"
  },
  {
    title: "Optimize for Semantic Synonyms",
    content: "ATS scanners look for semantic variations of skills. Instead of just writing 'React', include 'React.js Ecosystem' or 'Frontend Engineering' to secure top match relevance.",
    tag: "Keywords"
  },
  {
    title: "Avoid Double-Column Layout Scans",
    content: "Standard parser systems occasionally misread columns. Use our 'ATS Classic' or 'Minimal Engineer' simple templates to guarantee 100% reading accuracy.",
    tag: "Formatting"
  },
  {
    title: "Keep Professional Summary Under 4 Lines",
    content: "A premium professional summary must be crisp, high-impact, and spotlight quantified years of engineering value. Avoid generic adjectives like 'hardworking'.",
    tag: "Summary"
  }
];

const PREVIEWS_TEMPLATES = [
  { id: 'ats-classic', name: 'ATS Classic', category: 'Standard' },
  { id: 'modern-developer', name: 'Modern Developer', category: 'Creative' },
  { id: 'clean-professional', name: 'Clean Professional', category: 'Premium' },
  { id: 'elegant-sidebar', name: 'Elegant Sidebar', category: 'Sleek' }
];

export default function DashboardOverviewClient({
  userName,
  isNewUser,
  stats,
  recentResumes,
}: DashboardOverviewClientProps) {
  const [tipIndex, setTipIndex] = useState(0);

  const nextTip = () => setTipIndex((prev) => (prev + 1) % AI_TIPS.length);
  const prevTip = () => setTipIndex((prev) => (prev - 1 + AI_TIPS.length) % AI_TIPS.length);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.08 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 100 } }
  };

  // Sparkline SVG generator for dashboard statistics
  const getSparklineData = (type: string) => {
    if (type === 'resumes') return "M 5 25 Q 15 5, 25 15 T 45 5 T 65 20 T 85 10";
    if (type === 'ats') return "M 5 20 Q 20 10, 35 15 T 65 5 T 85 2";
    if (type === 'improvements') return "M 5 25 Q 15 20, 25 5 T 55 10 T 85 5";
    return "M 5 15 Q 25 5, 45 20 T 75 5 T 85 12";
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-10"
    >
      {/* Dynamic Premium Greeting Hero Header */}
      <motion.div 
        variants={itemVariants}
        className="relative overflow-hidden rounded-3xl p-8 bg-gradient-to-r from-indigo-950/20 via-slate-900/10 to-transparent border border-white/[0.03] backdrop-blur-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/[0.02] to-transparent pointer-events-none" />
        <div>
          <div className="flex items-center space-x-3 mb-2">
            <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            </span>
            <span className="text-[10px] uppercase tracking-wider text-emerald-400 font-extrabold bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
              AI Engine Active
            </span>
            <span className="text-[10px] uppercase tracking-wider text-indigo-400 font-extrabold bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-0.5 rounded-full hidden sm:inline-block">
              Resume Intelligence Ready
            </span>
          </div>
          
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white mb-2 bg-clip-text bg-gradient-to-r from-white via-gray-100 to-gray-400">
            {isNewUser ? 'Welcome' : 'Welcome back'}, {userName || 'Member'} 👋
          </h1>
          <p className="text-gray-400 text-sm md:text-base font-semibold max-w-xl">
            Optimize your resume, evaluate target keywords, and command complete career statistics from your dashboard control center.
          </p>
        </div>

        {/* Action button triggers */}
        <div className="flex overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0 md:flex-wrap gap-2.5 z-10 snap-x hide-scrollbar">
          <button 
            onClick={() => {
              const el = document.getElementById('upload-area-box');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className="shrink-0 snap-start px-4.5 py-2.5 rounded-xl bg-white hover:bg-slate-200 text-black text-xs font-black shadow-lg shadow-white/5 transition-all flex items-center gap-1.5 hover:scale-[1.02] active:scale-[0.98]"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Upload New
          </button>
          
          <Link href="/dashboard/resumes" className="shrink-0 snap-start">
            <div className="px-4.5 py-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] text-white border border-white/10 text-xs font-black transition-all flex items-center gap-1.5 hover:scale-[1.02] active:scale-[0.98]">
              <FileText className="w-3.5 h-3.5 text-gray-400" />
              Resume History
            </div>
          </Link>
          
          <Link href="/dashboard/job-match" className="shrink-0 snap-start">
            <div className="px-4.5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black shadow-lg shadow-indigo-600/10 transition-all flex items-center gap-1.5 hover:scale-[1.02] active:scale-[0.98]">
              <Target className="w-3.5 h-3.5 text-white" />
              Job Matcher
            </div>
          </Link>
        </div>
      </motion.div>

      {/* Dynamic Dashboard Metrics Row */}
      <motion.div variants={itemVariants}>
        {/* Mobile-only swipe hint */}
        <div className="flex justify-between items-center mb-2 lg:hidden px-1">
          <p className="text-[9px] text-gray-600 uppercase tracking-widest font-bold">Key Stats</p>
          <span className="text-[9px] text-gray-600 flex items-center font-bold uppercase tracking-widest animate-pulse">
            Swipe to view <ChevronRight className="w-2.5 h-2.5 ml-0.5" />
          </span>
        </div>
        <div className="relative">
          <div
            className="flex overflow-x-auto pb-3 -mx-4 px-4 lg:mx-0 lg:px-0 lg:grid lg:grid-cols-4 gap-3 lg:gap-4 snap-x snap-mandatory hide-scrollbar"
          >
        {/* Metric 1: Total Resumes */}
        <div className="shrink-0 w-[80vw] sm:w-[280px] lg:w-auto snap-center group relative p-3 lg:p-6 rounded-2xl bg-[#0b0b0f]/60 border border-white/[0.06] backdrop-blur-2xl hover:bg-white/[0.03] hover:border-white/[0.08] transition-all duration-300 shadow-xl">
          <div className="absolute -top-10 -right-10 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute top-0 right-0 p-3 lg:p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <FileText className="h-12 w-12 lg:h-16 lg:w-16 text-blue-500" />
          </div>
          <div className="flex justify-between items-start mb-3 lg:mb-4">
            <div className="h-8 w-8 lg:h-10 lg:w-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
              <FileText className="h-4 w-4 lg:h-5 lg:w-5 text-blue-400" />
            </div>
            {/* Sparkline chart */}
            <svg className="w-16 h-6 lg:w-20 lg:h-8 text-blue-400/20 group-hover:text-blue-400/40 transition-colors" viewBox="0 0 90 30" fill="none" stroke="currentColor" strokeWidth="2">
              <path d={getSparklineData('resumes')} />
            </svg>
          </div>
          <p className="text-gray-400 text-[10px] lg:text-xs font-bold tracking-wide uppercase">Total Resumes</p>
          <h3 className="text-xl lg:text-2xl font-black text-white mt-1 lg:mt-1.5">{stats.totalResumes}</h3>
          <p className="text-[9px] lg:text-[10px] text-gray-500 mt-0.5 lg:mt-1">Unique parsing text hashes</p>
        </div>

        {/* Metric 2: Avg ATS Score */}
        <div className="shrink-0 w-[80vw] sm:w-[280px] lg:w-auto snap-center group relative p-3 lg:p-6 rounded-2xl bg-[#0b0b0f]/60 border border-white/[0.06] backdrop-blur-2xl hover:bg-white/[0.03] hover:border-white/[0.08] transition-all duration-300 shadow-xl">
          <div className="absolute -top-10 -right-10 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute top-0 right-0 p-3 lg:p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <TrendingUp className="h-12 w-12 lg:h-16 lg:w-16 text-emerald-500" />
          </div>
          <div className="flex justify-between items-start mb-3 lg:mb-4">
            <div className="h-8 w-8 lg:h-10 lg:w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <TrendingUp className="h-4 w-4 lg:h-5 lg:w-5 text-emerald-400" />
            </div>
            {/* Sparkline chart */}
            <svg className="w-16 h-6 lg:w-20 lg:h-8 text-emerald-400/20 group-hover:text-emerald-400/40 transition-colors" viewBox="0 0 90 30" fill="none" stroke="currentColor" strokeWidth="2">
              <path d={getSparklineData('ats')} />
            </svg>
          </div>
          <p className="text-gray-400 text-[10px] lg:text-xs font-bold tracking-wide uppercase">Average ATS Score</p>
          <h3 className="text-xl lg:text-2xl font-black text-white mt-1 lg:mt-1.5">{stats.avgAtsScore}%</h3>
          <p className="text-[9px] lg:text-[10px] text-emerald-400/80 mt-0.5 lg:mt-1 flex items-center gap-1">
            <span className="h-1 lg:h-1.5 w-1 lg:w-1.5 bg-emerald-400 rounded-full inline-block" />
            High quality resume standard
          </p>
        </div>

        {/* Metric 3: AI Improvements */}
        <div className="shrink-0 w-[80vw] sm:w-[280px] lg:w-auto snap-center group relative p-3 lg:p-6 rounded-2xl bg-[#0b0b0f]/60 border border-white/[0.06] backdrop-blur-2xl hover:bg-white/[0.03] hover:border-white/[0.08] transition-all duration-300 shadow-xl">
          <div className="absolute -top-10 -right-10 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute top-0 right-0 p-3 lg:p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <Cpu className="h-12 w-12 lg:h-16 lg:w-16 text-indigo-500" />
          </div>
          <div className="flex justify-between items-start mb-3 lg:mb-4">
            <div className="h-8 w-8 lg:h-10 lg:w-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
              <Cpu className="h-4 w-4 lg:h-5 lg:w-5 text-indigo-400" />
            </div>
            {/* Sparkline chart */}
            <svg className="w-16 h-6 lg:w-20 lg:h-8 text-indigo-400/20 group-hover:text-indigo-400/40 transition-colors" viewBox="0 0 90 30" fill="none" stroke="currentColor" strokeWidth="2">
              <path d={getSparklineData('improvements')} />
            </svg>
          </div>
          <p className="text-gray-400 text-[10px] lg:text-xs font-bold tracking-wide uppercase">AI Improvements</p>
          <h3 className="text-xl lg:text-2xl font-black text-white mt-1 lg:mt-1.5">{stats.aiImprovements}</h3>
          <p className="text-[9px] lg:text-[10px] text-gray-500 mt-0.5 lg:mt-1">Optimizations generated</p>
        </div>

        {/* Metric 4: Job Matches */}
        <div className="shrink-0 w-[80vw] sm:w-[280px] lg:w-auto snap-center group relative p-3 lg:p-6 rounded-2xl bg-[#0b0b0f]/60 border border-white/[0.06] backdrop-blur-2xl hover:bg-white/[0.03] hover:border-white/[0.08] transition-all duration-300 shadow-xl">
          <div className="absolute -top-10 -right-10 w-24 h-24 bg-purple-500/5 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute top-0 right-0 p-3 lg:p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <Target className="h-12 w-12 lg:h-16 lg:w-16 text-purple-500" />
          </div>
          <div className="flex justify-between items-start mb-3 lg:mb-4">
            <div className="h-8 w-8 lg:h-10 lg:w-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
              <Target className="h-4 w-4 lg:h-5 lg:w-5 text-purple-400" />
            </div>
            {/* Sparkline chart */}
            <svg className="w-16 h-6 lg:w-20 lg:h-8 text-purple-400/20 group-hover:text-purple-400/40 transition-colors" viewBox="0 0 90 30" fill="none" stroke="currentColor" strokeWidth="2">
              <path d={getSparklineData('matches')} />
            </svg>
          </div>
          <p className="text-gray-400 text-[10px] lg:text-xs font-bold tracking-wide uppercase">Job Match Rate</p>
          <h3 className="text-xl lg:text-2xl font-black text-white mt-1 lg:mt-1.5">{stats.matchesFound}%</h3>
          <p className="text-[9px] lg:text-[10px] text-purple-300 mt-0.5 lg:mt-1">Simulated profile target match</p>
        </div>
          </div>
          {/* Right gradient fade — mobile only */}
          <div className="absolute top-0 right-0 bottom-3 w-12 bg-gradient-to-l from-[#050508] to-transparent pointer-events-none lg:hidden" />
          {/* Dot indicators — mobile only */}
          <div className="flex lg:hidden justify-center gap-1.5 pt-2">
            <span className="w-2 h-2 rounded-full bg-indigo-400 opacity-90" />
            <span className="w-1.5 h-1.5 rounded-full bg-white/20" />
            <span className="w-1.5 h-1.5 rounded-full bg-white/20" />
            <span className="w-1.5 h-1.5 rounded-full bg-white/20" />
          </div>
        </div>
      </motion.div>

      {/* Dynamic Sub-State Feed section */}
      <motion.div 
        variants={itemVariants}
        className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8"
      >
        {/* Section A: Recent Activity Feed */}
        <div className="lg:col-span-2 p-4 lg:p-6 rounded-2xl bg-white/[0.01] border border-white/[0.03] backdrop-blur-xl space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 border-b border-white/[0.04] pb-3">
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4 text-indigo-400" />
                <h3 className="text-sm font-black text-white">Recent Analyses</h3>
              </div>
              <Link href="/dashboard/resumes" className="text-xs text-gray-500 hover:text-white flex items-center gap-1 font-bold">
                View All
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {recentResumes.length === 0 ? (
              <div className="py-12 flex flex-col items-center justify-center text-center text-gray-500">
                <FileText className="w-10 h-10 text-gray-600 mb-3" />
                <p className="text-xs font-bold text-gray-400">No resumes found</p>
                <p className="text-[11px] text-gray-500">Upload a PDF to generate your first analysis.</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {recentResumes.slice(0, 3).map((res) => (
                  <div 
                    key={res.id}
                    className="flex items-center justify-between p-3.5 rounded-xl bg-white/[0.015] border border-white/[0.03] hover:bg-white/[0.03] hover:border-white/[0.05] transition-all duration-300"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="h-8 w-8 rounded-lg bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                        <FileText className="w-4 h-4 text-indigo-400" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-white truncate max-w-[180px] sm:max-w-[280px]">
                          {res.filename || res.title}
                        </p>
                        <p className="text-[10px] text-gray-500">
                          {new Date(res.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      {res.atsScore ? (
                        <div className={`text-[10px] font-black border px-2 py-0.5 rounded ${
                          res.atsScore >= 75 
                            ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400' 
                            : 'bg-amber-500/10 border-amber-500/25 text-amber-400'
                        }`}>
                          ATS: {res.atsScore}%
                        </div>
                      ) : (
                        <div className="text-[10px] font-bold bg-white/5 border border-white/10 text-gray-400 px-2 py-0.5 rounded">
                          Parsed
                        </div>
                      )}
                      
                      <Link href={`/dashboard/analysis/${res.id || res.id}`}>
                        <div className="h-7 w-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-indigo-600 hover:border-indigo-500 transition-all cursor-pointer">
                          <ArrowRight className="w-3.5 h-3.5" />
                        </div>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section B: Career Insight circular progress indicator */}
          <div className="bg-white/[0.015] border border-white/[0.03] p-4.5 rounded-xl mt-4 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div>
              <div className="flex items-center space-x-1.5 mb-1">
                <Award className="w-4 h-4 text-purple-400" />
                <h4 className="text-xs font-bold text-white">Interactive Career Matching</h4>
              </div>
              <p className="text-[11px] text-gray-400 font-semibold max-w-sm">
                Your parsed engineering experience shows a strong match probability for target React/Frontend Developer tracks.
              </p>
              <div className="flex flex-wrap gap-1.5 mt-2.5">
                <span className="text-[9px] font-extrabold tracking-wide uppercase px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-gray-300">TypeScript</span>
                <span className="text-[9px] font-extrabold tracking-wide uppercase px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-gray-300">Next.js Ecosystem</span>
                <span className="text-[9px] font-extrabold tracking-wide uppercase px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300">React Core</span>
              </div>
            </div>
            
            {/* Visual dynamic match rate widget */}
            <div className="relative flex items-center justify-center shrink-0">
              <svg className="w-12 h-12 md:w-16 md:h-16 transform -rotate-90">
                <circle cx="50%" cy="50%" r="42%" className="text-white/[0.04]" strokeWidth="3.5" fill="transparent" stroke="currentColor" />
                <circle cx="50%" cy="50%" r="42%" className="text-indigo-500" strokeWidth="3.5" fill="transparent" stroke="currentColor" 
                  strokeDasharray={175} strokeDashoffset={175 - (175 * 78) / 100} strokeLinecap="round" />
              </svg>
              <span className="absolute text-[10px] md:text-[11px] font-black text-white font-mono">78%</span>
            </div>
          </div>
        </div>

        {/* Right column sidebar widgets */}
        <div className="space-y-6">
          {/* Section C: AI Tips Slider Carousel Widget */}
          <div className="p-4 lg:p-6 rounded-2xl bg-white/[0.01] border border-white/[0.03] backdrop-blur-xl relative overflow-hidden flex flex-col justify-between h-[180px] lg:h-[210px]">
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
              <Sparkles className="w-24 h-24 text-indigo-500" />
            </div>
            
            <div>
              <div className="flex items-center space-x-1.5 mb-3">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <h4 className="text-xs font-black uppercase tracking-wider text-indigo-400">AI Optimization Hack</h4>
              </div>
              
              <h3 className="text-xs font-bold text-white line-clamp-1 mb-1.5">
                {AI_TIPS[tipIndex].title}
              </h3>
              <p className="text-[11px] text-gray-400 font-semibold leading-relaxed line-clamp-4">
                {AI_TIPS[tipIndex].content}
              </p>
            </div>

            <div className="flex items-center justify-between border-t border-white/[0.04] pt-3 mt-3">
              <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest bg-white/[0.03] border border-white/5 px-2 py-0.5 rounded">
                {AI_TIPS[tipIndex].tag}
              </span>
              
              <div className="flex items-center space-x-1.5">
                <button 
                  onClick={prevTip}
                  className="h-6 w-6 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-gray-400 hover:text-white flex items-center justify-center transition-colors"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <button 
                  onClick={nextTip}
                  className="h-6 w-6 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-gray-400 hover:text-white flex items-center justify-center transition-colors"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Section D: Premium Template previews slider */}
          <div className="p-4 lg:p-6 rounded-2xl bg-white/[0.01] border border-white/[0.03] backdrop-blur-xl">
            <div className="flex items-center justify-between mb-4 border-b border-white/[0.04] pb-2">
              <div className="flex items-center space-x-1.5">
                <BookOpen className="w-4 h-4 text-purple-400" />
                <h4 className="text-xs font-black text-white">Smart Design Layouts</h4>
              </div>
              <Link href="/dashboard/templates" className="text-[10px] text-gray-500 hover:text-white font-bold">
                Browse
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {PREVIEWS_TEMPLATES.map((tmpl) => (
                <Link key={tmpl.id} href={`/dashboard/templates?id=${tmpl.id}`}>
                  <div className="group p-2.5 rounded-xl bg-white/[0.015] border border-white/[0.03] hover:bg-white/[0.03] hover:border-white/[0.06] transition-all text-center cursor-pointer">
                    <div className="h-10 w-full rounded bg-white/[0.01] border border-white/5 flex items-center justify-center text-[10px] font-bold text-gray-500 group-hover:bg-indigo-600/10 group-hover:text-indigo-400 group-hover:border-indigo-500/20 transition-all mb-1.5">
                      A4 PREVIEW
                    </div>
                    <p className="text-[10px] font-bold text-white truncate">{tmpl.name}</p>
                    <p className="text-[8px] text-gray-500">{tmpl.category}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
