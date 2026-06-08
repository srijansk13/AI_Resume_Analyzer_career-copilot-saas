'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Briefcase, AlertCircle, Hash, TrendingUp, Sparkles, Code, ChevronDown, ChevronUp, CheckSquare, ChevronRight } from 'lucide-react';
import { BentoCard } from '../bento/BentoCard';

// List of noisy AI-generated fluff phrases to filter out
const NOISY_PHRASES = [
  'responsive layout', 'responsive layout systems', 'structured json', 'structured json processing',
  'dashboard systems', 'ai workflow', 'ai workflow integration', 'semantic resume', 'semantic resume analysis',
  'production deployment', 'production deployment systems', 'responsive design', 'clean code principles',
  'best practices', 'modern web', 'modern web development', 'software engineering', 'web application development',
  'data visualization systems', 'cross-functional collaboration systems', 'version control workflows',
  'scalable backend systems', 'ci/cd automation pipelines', 'interactive web', 'modern interface systems',
  'production deployment systems', 'semantic resume analysis', 'ai workflow integration',
];

// Clean formatting maps for standard technical skills
const renameSkill = (s: string): string => {
  if (!s || typeof s !== 'string') return '';
  const lower = s.trim().toLowerCase();
  const replacements: Record<string, string> = {
    'nextjs': 'Next.js',
    'nodejs': 'Node.js',
    'typescript': 'TypeScript',
    'javascript': 'JavaScript',
    'tailwindcss': 'Tailwind CSS',
    'mongodb': 'MongoDB',
    'postgresql': 'PostgreSQL',
    'aws': 'AWS',
    'docker': 'Docker',
    'reactjs': 'React',
    'graphql': 'GraphQL',
    'github': 'GitHub',
    'rest': 'REST APIs',
    'restapi': 'REST APIs',
    'rest api': 'REST APIs',
    'jwt': 'JWT Auth',
    'jwt auth': 'JWT Auth',
    'kubernetes': 'Kubernetes',
    'html': 'HTML5',
    'css': 'CSS3',
  };
  
  if (replacements[lower]) {
    return replacements[lower];
  }
  
  // Convert standard dash-separated/lowercase phrases to Title Case
  return s.split(/[\s_-]+/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
};

const dedupeSkills = (items: string[]): string[] => {
  const seen = new Set<string>();
  return items.filter((s) => {
    const key = s.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

export default function SkillsModule({ analysis }: { analysis: any }) {
  const [showAllKeywords, setShowAllKeywords] = useState(false);
  const [showAllCore, setShowAllCore] = useState(false);
  const [showAllFrameworks, setShowAllFrameworks] = useState(false);
  const [showAllSoft, setShowAllSoft] = useState(false);
  const keywords = analysis?.keywords || {};
  const targetRole = analysis?.targetRole || 'Full Stack Developer';
  
  // Extract and clean raw data arrays (cast to string[] to avoid implicit any downstream)
  const detectedSkills = keywords.detected_skills || { technical: [], soft: [], tools: [] };
  const missingSkills: string[] = keywords.missing_critical_skills || [];
  const keywordDensity: any[] = keywords.density || [];

  // 1. Skill filtering helper function
  const filterSkill = (s: string): boolean => {
    if (!s || typeof s !== 'string') return false;
    const clean = s.trim().toLowerCase();
    
    // Check blocklist
    if (NOISY_PHRASES.some(phrase => clean.includes(phrase))) {
      return false;
    }
    
    // Drop generic AI filler words
    if (clean.length > 25 && (
      clean.includes('system') || 
      clean.includes('integration') || 
      clean.includes('processing') || 
      clean.includes('analysis') || 
      clean.includes('development') ||
      clean.includes('management')
    )) {
      return false;
    }

    return true;
  };

  // 2. Prepare Curated Lists
  const cleanTechnical: string[] = (detectedSkills.technical as string[] || [])
    .filter(filterSkill)
    .map(renameSkill);

  // Core Technical Skills - max 10-12
  const coreTechnical: string[] = dedupeSkills(cleanTechnical).slice(0, 12);
  const coreSet = new Set(coreTechnical.map((s) => s.toLowerCase()));

  // Frameworks & Tools (exclude duplicates already in core)
  const frameworksTools: string[] = dedupeSkills(
    (detectedSkills.tools as string[] || [])
      .filter(filterSkill)
      .map(renameSkill)
      .filter((s) => !coreSet.has(s.toLowerCase()))
  ).slice(0, 15);

  // Leadership & Collaboration (Soft Skills)
  const softSkills: string[] = dedupeSkills(
    (detectedSkills.soft as string[] || [])
      .filter(filterSkill)
      .map(renameSkill)
  ).slice(0, 8);

  // Missing critical skills (elements may be strings or objects depending on AI response shape)
  interface MissingItem { skill: string; impact: string; }
  const cleanMissing: MissingItem[] = (missingSkills as any[])
    .filter((gap: any) => {
      const name = typeof gap === 'string' ? gap : (gap.skill || gap.name || '');
      return filterSkill(name);
    })
    .map((gap: any): MissingItem => ({
      skill: renameSkill(typeof gap === 'string' ? gap : (gap.skill || gap.name || '')),
      impact: typeof gap === 'object' ? (gap.explainability_node?.impact || 'High resume impact.') : 'High resume impact.'
    }))
    .slice(0, 6);

  // ATS Keywords density curation (Top 8-10 high-value keywords initially)
  interface DensityItem { keyword: string; count: number; is_optimal: boolean; }
  let curatedDensity: DensityItem[] = (keywordDensity as any[])
    .filter((k) => {
      const name = (k.keyword || k.word || '') as string;
      return filterSkill(name);
    })
    .map((k): DensityItem => ({
      keyword: renameSkill(k.keyword || k.word || ''),
      count: typeof k.count === 'number' ? k.count : 1,
      is_optimal: typeof k.is_optimal === 'boolean' ? k.is_optimal : true
    }))
    .sort((a: DensityItem, b: DensityItem) => b.count - a.count);

  // Remove low-confidence duplicates or single counts if we have enough high counts
  const highConfidenceKeywords = curatedDensity.filter((k: DensityItem) => k.count >= 2);
  if (highConfidenceKeywords.length >= 6) {
    curatedDensity = curatedDensity.filter((k: DensityItem) => k.count >= 2);
  }

  // Slice displayed density list
  const displayedDensity = showAllKeywords ? curatedDensity : curatedDensity.slice(0, 8);

  const suggestedProjects = Array.isArray(analysis?.suggested_projects)
    ? analysis.suggested_projects.slice(0, 3)
    : [];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-8 font-sans"
    >
      {/* Top Metrics Row */}
      <div className="grid grid-cols-3 gap-3 md:gap-4 mb-2">
        <div className="bg-[#0a0a0f]/80 backdrop-blur-2xl border border-white/[0.06] p-4 rounded-3xl flex flex-col items-center justify-center text-center relative overflow-hidden shadow-xl">
          <div className="absolute top-0 right-0 p-2 opacity-10"><Briefcase className="w-10 h-10 text-blue-500" /></div>
          <span className="text-2xl md:text-3xl font-black text-white">{coreTechnical.length + frameworksTools.length}</span>
          <span className="text-[9px] md:text-[10px] uppercase font-black tracking-widest text-gray-500 mt-1">Matched Skills</span>
        </div>
        <div className="bg-[#0a0a0f]/80 backdrop-blur-2xl border border-white/[0.06] p-4 rounded-3xl flex flex-col items-center justify-center text-center relative overflow-hidden shadow-xl">
          <div className="absolute top-0 right-0 p-2 opacity-10"><AlertCircle className="w-10 h-10 text-orange-500" /></div>
          <span className="text-2xl md:text-3xl font-black text-white">{cleanMissing.length}</span>
          <span className="text-[9px] md:text-[10px] uppercase font-black tracking-widest text-gray-500 mt-1">Missing Skills</span>
        </div>
        <div className="bg-[#0a0a0f]/80 backdrop-blur-2xl border border-white/[0.06] p-4 rounded-3xl flex flex-col items-center justify-center text-center relative overflow-hidden shadow-xl">
          <div className="absolute top-0 right-0 p-2 opacity-10"><Hash className="w-10 h-10 text-cyan-500" /></div>
          <span className="text-2xl md:text-3xl font-black text-white">{curatedDensity.length}</span>
          <span className="text-[9px] md:text-[10px] uppercase font-black tracking-widest text-gray-500 mt-1">ATS Keywords</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Card: 3 Core Structured Skill Categories */}
        <BentoCard className="lg:col-span-2 space-y-6 border border-white/[0.06] bg-[#0a0a0f]/80 backdrop-blur-3xl shadow-2xl relative">
          <div className="absolute top-0 left-0 w-32 h-32 bg-emerald-500/[0.02] rounded-full blur-2xl pointer-events-none" />
          
          <div className="flex justify-between items-center mb-6 border-b border-white/[0.04] pb-4">
            <h2 className="text-sm font-black uppercase tracking-wider text-gray-200 flex items-center">
              <Briefcase className="w-4 h-4 mr-2 text-indigo-400" />
              Verified Profile Skills
            </h2>
            <div className="flex items-center space-x-2 text-[10px] text-gray-400 bg-white/5 px-3 py-1 rounded-full border border-white/10">
              <Sparkles className="w-3 h-3 text-blue-400 animate-pulse" />
              <span className="font-bold uppercase tracking-wider text-[8px] hidden sm:inline">{targetRole} Profile</span>
            </div>
          </div>
          
          <div className="space-y-6 md:space-y-8">
            {/* 1. Core Technical Skills */}
            {coreTechnical.length > 0 && (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center">
                    <span className="h-1.5 w-1.5 rounded-full bg-blue-400 mr-2 inline-block shadow-[0_0_8px_rgba(96,165,250,0.6)]" /> 
                    Core Technical Skills
                  </h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(showAllCore ? coreTechnical : coreTechnical.slice(0, 6)).map((s, i) => (
                    <div key={i} className="group relative flex items-center shrink-0 px-3 py-1.5 bg-blue-500/5 hover:bg-blue-500/10 border border-blue-500/15 rounded-xl transition-all cursor-default select-none">
                      <span className="text-blue-200 text-xs font-semibold tracking-wide">{s}</span>
                    </div>
                  ))}
                  {coreTechnical.length > 6 && (
                    <button onClick={() => setShowAllCore(!showAllCore)} className="px-3 py-1.5 bg-white/[0.02] hover:bg-white/[0.05] border border-white/10 rounded-xl transition-all text-gray-400 hover:text-white text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                      {showAllCore ? <><ChevronUp className="w-3 h-3" /> Less</> : <><ChevronDown className="w-3 h-3" /> +{coreTechnical.length - 6} More</>}
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* 2. Frameworks & Tools */}
            {frameworksTools.length > 0 && (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center">
                    <span className="h-1.5 w-1.5 rounded-full bg-purple-400 mr-2 inline-block shadow-[0_0_8px_rgba(192,132,252,0.6)]" /> 
                    Frameworks & Tools
                  </h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(showAllFrameworks ? frameworksTools : frameworksTools.slice(0, 6)).map((s, i) => (
                    <div key={i} className="group relative flex items-center shrink-0 px-3 py-1.5 bg-purple-500/5 hover:bg-purple-500/10 border border-purple-500/15 rounded-xl transition-all cursor-default select-none">
                      <span className="text-purple-200 text-xs font-semibold tracking-wide">{s}</span>
                    </div>
                  ))}
                  {frameworksTools.length > 6 && (
                    <button onClick={() => setShowAllFrameworks(!showAllFrameworks)} className="px-3 py-1.5 bg-white/[0.02] hover:bg-white/[0.05] border border-white/10 rounded-xl transition-all text-gray-400 hover:text-white text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                      {showAllFrameworks ? <><ChevronUp className="w-3 h-3" /> Less</> : <><ChevronDown className="w-3 h-3" /> +{frameworksTools.length - 6} More</>}
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* 3. Leadership & Collaboration */}
            {softSkills.length > 0 && (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 mr-2 inline-block shadow-[0_0_8px_rgba(52,211,153,0.6)]" /> 
                    Leadership & Soft Skills
                  </h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(showAllSoft ? softSkills : softSkills.slice(0, 5)).map((s, i) => (
                    <div key={i} className="flex items-center shrink-0 px-3 py-1.5 bg-emerald-500/5 hover:bg-emerald-500/10 border border-emerald-500/15 rounded-xl transition-all cursor-default select-none">
                      <span className="text-emerald-200 text-xs font-semibold tracking-wide">{s}</span>
                    </div>
                  ))}
                  {softSkills.length > 5 && (
                    <button onClick={() => setShowAllSoft(!showAllSoft)} className="px-3 py-1.5 bg-white/[0.02] hover:bg-white/[0.05] border border-white/10 rounded-xl transition-all text-gray-400 hover:text-white text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                      {showAllSoft ? <><ChevronUp className="w-3 h-3" /> Less</> : <><ChevronDown className="w-3 h-3" /> +{softSkills.length - 5} More</>}
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </BentoCard>

        {/* Right Card: 4. Missing Market Skills */}
        <BentoCard className="border border-white/[0.06] bg-[#0a0a0f]/80 backdrop-blur-2xl shadow-2xl flex flex-col relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/[0.015] rounded-full blur-2xl pointer-events-none" />
          
          <h2 className="text-sm md:text-sm font-black uppercase tracking-wider text-gray-200 mb-4 md:mb-6 flex items-center border-b border-white/[0.04] pb-3 md:pb-4">
            <AlertCircle className="w-4 h-4 mr-2 text-orange-400" />
            <span className="flex-1">Missing Market Skills</span>
            <span className="text-[9px] text-gray-600 flex md:hidden items-center font-bold uppercase tracking-widest animate-pulse">Swipe <ChevronRight className="w-2.5 h-2.5 ml-0.5" /></span>
          </h2>
          
          <div className="relative flex-1">
            <div className="flex overflow-x-auto md:flex-col md:overflow-y-auto md:max-h-[340px] gap-2 md:gap-3 pb-2 md:pb-0 -mx-4 px-4 md:mx-0 md:px-0 md:pr-1 snap-x hide-scrollbar">
            {cleanMissing.length > 0 ? (
              cleanMissing.map((gap: any, i: number) => (
                <div key={i} className="shrink-0 w-[75vw] sm:w-[260px] md:w-auto snap-center p-3 md:p-4 bg-orange-500/5 rounded-xl md:rounded-2xl border border-orange-500/15 relative overflow-hidden group hover:border-orange-500/30 hover:bg-orange-500/10 transition-all duration-300">
                  <div className="absolute top-0 right-0 p-2 md:p-3 opacity-10">
                    <AlertCircle className="w-6 h-6 md:w-8 md:h-8 text-orange-500" />
                  </div>
                  <span className="text-orange-300 font-extrabold text-[11px] md:text-xs block mb-1 md:mb-1.5 relative z-10">{gap.skill}</span>
                  <p className="text-[10px] md:text-[11px] text-gray-400 relative z-10 leading-relaxed font-semibold line-clamp-2 md:line-clamp-none">
                    {gap.impact}
                  </p>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center p-8 opacity-60">
                <div className="w-12 h-12 bg-emerald-500/10 rounded-full flex items-center justify-center mb-4">
                  <Sparkles className="w-6 h-6 text-emerald-400" />
                </div>
                <p className="text-gray-300 text-xs font-bold">No critical gaps identified</p>
                <p className="text-[10px] text-gray-500 mt-1">Your experience alignment looks solid.</p>
              </div>
            )}
            </div>
            <div className="absolute top-0 right-0 bottom-0 w-10 bg-gradient-to-l from-[#0a0a0f] to-transparent pointer-events-none md:hidden" />
          </div>
        </BentoCard>

      </div>

      {/* 3. ATS Keywords Section (redesigned with View More) */}
      {curatedDensity.length > 0 && (
        <BentoCard className="border border-white/[0.06] bg-[#0a0a0f]/80 backdrop-blur-2xl shadow-2xl relative">
          <div className="absolute bottom-0 right-0 w-44 h-44 bg-cyan-500/[0.01] rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex justify-between items-center mb-6 border-b border-white/[0.04] pb-4">
            <h2 className="text-sm font-black uppercase tracking-wider text-gray-200 flex items-center">
              <Hash className="w-4 h-4 mr-2 text-cyan-400" />
              ATS Keywords & Density
            </h2>
            <div className="flex items-center gap-3">
              <div className="text-[10px] text-gray-400 bg-white/5 px-3 py-1 rounded-full border border-white/10 select-none">
                <span className="font-extrabold text-cyan-400">{curatedDensity.length}</span> Total Keywords
              </div>
              <span className="text-[9px] text-gray-600 flex md:hidden items-center font-bold uppercase tracking-widest animate-pulse">Swipe <ChevronRight className="w-2.5 h-2.5 ml-0.5" /></span>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="relative">
              <div className="flex overflow-x-auto snap-x hide-scrollbar gap-2 md:grid md:grid-cols-4 lg:grid-cols-5 md:gap-3 pb-2 md:pb-0 -mx-4 px-4 md:mx-0 md:px-0">
                {displayedDensity.map((k: any, i: number) => (
                  <div 
                    key={i} 
                    className={`shrink-0 w-[35vw] sm:w-[150px] md:w-auto snap-start p-2.5 md:p-3 rounded-xl md:rounded-2xl border flex flex-col justify-between transition-all hover:scale-[1.01] ${
                      k.is_optimal 
                        ? 'bg-white/[0.01] border-white/5 hover:border-white/10 hover:bg-white/[0.02]' 
                        : 'bg-red-500/5 border-red-500/10 hover:border-red-500/20'
                    }`}
                  >
                    <span className="text-[11px] md:text-xs font-bold text-gray-200 truncate w-full mb-1.5 md:mb-2">{k.keyword}</span>
                    <div className="flex items-center justify-between">
                      <span className={`text-[9px] md:text-[10px] font-mono font-bold ${k.is_optimal ? 'text-gray-400' : 'text-red-400'}`}>
                        Freq: {k.count}
                      </span>
                      <div className={`w-1.5 h-1.5 rounded-full ${k.is_optimal ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]' : 'bg-red-500 animate-pulse'}`} />
                    </div>
                  </div>
                ))}
              </div>
              <div className="absolute top-0 right-0 bottom-2 w-12 bg-gradient-to-l from-[#0a0a0f] to-transparent pointer-events-none md:hidden" />
            </div>

            {curatedDensity.length > 8 && (
              <div className="flex justify-center pt-2">
                <button
                  onClick={() => setShowAllKeywords(!showAllKeywords)}
                  className="flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 font-extrabold uppercase tracking-wider bg-cyan-500/5 hover:bg-cyan-500/10 border border-cyan-500/10 hover:border-cyan-500/20 px-4 py-2 rounded-xl transition-all"
                >
                  {showAllKeywords ? (
                    <>
                      <span>Show Less Keywords</span>
                      <ChevronUp className="w-3.5 h-3.5" />
                    </>
                  ) : (
                    <>
                      <span>View More Keywords ({curatedDensity.length - 8} hidden)</span>
                      <ChevronDown className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </BentoCard>
      )}

      {/* Suggested Projects to Build — AI-generated career guidance only */}
      <BentoCard className="border border-white/[0.06] bg-[#0a0a0f]/80 backdrop-blur-2xl shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-indigo-600/[0.02] rounded-full blur-[100px] pointer-events-none" />
          
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6 border-b border-white/[0.04] pb-4">
            <div>
              <h2 className="text-sm font-black uppercase tracking-wider text-gray-200 flex items-center">
                <Code className="w-4 h-4 mr-2 text-indigo-400" />
                Suggested Projects to Build
              </h2>
              <p className="text-[11px] text-gray-400 mt-1 font-semibold">
                Bridge detected experience gaps and keywords by building targeted practical projects for a <span className="text-indigo-400 font-bold">{targetRole}</span> career.
              </p>
            </div>
            <div className="flex items-center gap-3 self-start md:self-center">
              <div className="text-[9px] uppercase font-black tracking-widest text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 rounded-full shrink-0 select-none">
                Career Guidance
              </div>
              <span className="text-[9px] text-gray-600 flex md:hidden items-center font-bold uppercase tracking-widest animate-pulse">Swipe <ChevronRight className="w-2.5 h-2.5 ml-0.5" /></span>
            </div>
          </div>

          {suggestedProjects.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center opacity-70">
              <Code className="w-10 h-10 text-indigo-400/40 mb-3" />
              <p className="text-sm font-bold text-gray-300">No project suggestions yet</p>
              <p className="text-[11px] text-gray-500 mt-1 max-w-md">
                Re-run analysis with a target role to generate tailored portfolio project ideas.
              </p>
            </div>
          ) : (
          <div className="relative">
            <div className="flex overflow-x-auto snap-x snap-mandatory hide-scrollbar gap-3 md:grid md:grid-cols-2 md:gap-6 pb-4 md:pb-0 -mx-4 px-4 md:mx-0 md:px-0">
              {suggestedProjects.map((proj: any, i: number) => (
                <div 
                  key={i} 
                  className="shrink-0 w-[85vw] sm:w-[320px] md:w-auto snap-center p-4 md:p-5 bg-white/[0.01] hover:bg-white/[0.02] border border-white/5 hover:border-indigo-500/20 rounded-2xl transition-all duration-300 flex flex-col justify-between relative group shadow-xl"
                >
                  <div className="space-y-3 md:space-y-4">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-sm font-black text-white group-hover:text-indigo-300 transition-colors">
                        {proj.title || proj.name}
                      </h3>
                      {(proj.difficulty_level || proj.difficultyLevel) && (
                        <span className="text-[9px] font-black uppercase tracking-wider text-amber-300/90 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full shrink-0">
                          {proj.difficulty_level || proj.difficultyLevel}
                        </span>
                      )}
                    </div>
                    
                    <div className="relative">
                      <p className="text-[11px] md:text-xs text-gray-400 leading-relaxed font-semibold line-clamp-3 md:line-clamp-none">
                        {proj.why_it_helps || proj.whyItHelps || proj.description}
                      </p>
                    </div>
                    
                    <div className="space-y-2.5">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-[9px] font-black uppercase tracking-wider text-gray-500 mr-1.5">Stack:</span>
                        {(proj.suggested_stack || proj.suggestedStack || []).map((tech: string, idx: number) => (
                          <span key={idx} className="px-2 py-0.5 rounded-lg bg-indigo-500/5 border border-indigo-500/10 text-[10px] text-indigo-300 font-bold">
                            {tech}
                          </span>
                        ))}
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-[9px] font-black uppercase tracking-wider text-gray-500 mr-1.5">Skills:</span>
                        {(proj.skills_covered || proj.skillsCovered || []).map((skill: string, idx: number) => (
                          <span key={idx} className="px-2 py-0.5 rounded-lg bg-white/5 border border-white/10 text-[10px] text-gray-300 font-semibold">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 pt-3.5 border-t border-white/[0.04] space-y-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center text-[10px] font-bold text-emerald-400 gap-1.5 bg-emerald-500/5 px-2.5 py-1 rounded-lg border border-emerald-500/10 shrink-0">
                        <CheckSquare className="w-3.5 h-3.5" />
                        <span>Resume Impact</span>
                      </div>
                      <span className="text-[10px] text-gray-400 font-semibold text-right leading-tight flex-1">
                        {proj.resume_impact || proj.resumeImpact}
                      </span>
                    </div>
                    {(proj.portfolio_value || proj.portfolioValue) && (
                      <p className="text-[10px] text-gray-500 font-semibold leading-relaxed">
                        <span className="text-indigo-400/90 font-bold uppercase tracking-wider text-[9px] mr-1.5">Portfolio</span>
                        {proj.portfolio_value || proj.portfolioValue}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
            {/* Right gradient fade — mobile only */}
            <div className="absolute top-0 right-0 bottom-4 w-12 bg-gradient-to-l from-[#0a0a0f] to-transparent pointer-events-none md:hidden" />
          </div>
          )}
        </BentoCard>

      {coreTechnical.length === 0 && frameworksTools.length === 0 && softSkills.length === 0 && (
        <p className="text-center text-xs text-gray-500 py-4">No structured skills detected — re-analyze with a target role for curated results.</p>
      )}

    </motion.div>
  );
}
