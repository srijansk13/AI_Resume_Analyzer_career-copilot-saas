'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Target, Search, Zap, CheckCircle2, AlertTriangle, ArrowRight, 
  Sparkles, FileText, Briefcase, GraduationCap, ChevronRight, UploadCloud 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface JobMatchClientProps {
  items?: any[];
  resume: any;
  analysis: any;
}

const TECH_DICTIONARY = [
  // Languages
  'javascript', 'typescript', 'python', 'java', 'c\\+\\+', 'c#', 'ruby', 'go', 'rust', 'php', 'sql', 'html', 'css', 'bash', 'kotlin', 'swift',
  // Frontend
  'react', 'angular', 'vue', 'next\\.js', 'nextjs', 'vuejs', 'nuxt\\.js', 'svelte', 'tailwind', 'bootstrap', 'redux', 'webpack', 'vite',
  // Backend & Frameworks
  'node\\.js', 'nodejs', 'express', 'spring boot', 'django', 'flask', 'rails', 'fastapi', 'graphql', 'apollo', 'grpc',
  // Cloud & DevOps
  'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'ci/cd', 'cicd', 'jenkins', 'terraform', 'ansible', 'git', 'github', 'actions', 'argocd', 'prometheus', 'grafana',
  // Databases
  'postgresql', 'mongodb', 'mysql', 'redis', 'elasticsearch', 'dynamodb', 'oracle', 'sqlite', 'cassandra',
  // AI & Data
  'machine learning', 'deep learning', 'nlp', 'pytorch', 'tensorflow', 'pandas', 'numpy', 'scikit-learn', 'spark', 'hadoop', 'tableau', 'powerbi',
  // Soft Skills & Methodologies
  'agile', 'scrum', 'kanban', 'jira', 'tdd', 'system design', 'microservices', 'rest api', 'security', 'testing', 'leadership', 'communication', 'project management', 'collaboration', 'problem solving'
];

interface MatchResults {
  matchPercentage: number;
  matchingKeywords: string[];
  missingKeywords: string[];
  candidateYears: number;
  requiredYears: number;
  experienceMatchScore: number;
  educationMatch: 'matched' | 'partial' | 'unspecified';
  recommendations: string[];
  roleFitCategory: string;
}

export default function JobMatchClient({ items = [], resume, analysis }: JobMatchClientProps) {
  const [mounted, setMounted] = useState(false);
  const [activeItem, setActiveItem] = useState<{ resume: any; analysis: any } | null>(null);
  const [jobDescription, setJobDescription] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [results, setResults] = useState<MatchResults | null>(null);

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [filterQuery, setFilterQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Set mounted status to prevent hydration mismatches
  useEffect(() => {
    setMounted(true);
  }, []);

  // Resolution hook for Active Resume Priority & Stale Prevention
  useEffect(() => {
    const resolveActiveResume = () => {
      const saved = localStorage.getItem('activeResume');
      let matchedItem = null;

      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed && parsed.analysisId && parsed.resumeId) {
            // Validate analysisId and resumeId exist in current database items array
            const found = items.find(
              (item) =>
                item.analysis.id === parsed.analysisId &&
                item.resume.id === parsed.resumeId
            );
            if (found) {
              matchedItem = found;
            }
          }
        } catch (e) {
          console.error("[ActiveResume] Error reading from localStorage:", e);
        }
      }

      // 2nd priority: currently opened analysis/editor session passed via props
      if (!matchedItem && resume && analysis) {
        const foundProps = items.find(
          (item) =>
            item.resume.id === resume.id &&
            item.analysis.id === analysis.id
        );
        if (foundProps) {
          matchedItem = foundProps;
        } else {
          matchedItem = { resume, analysis };
        }
      }

      // 3rd priority: latest valid resume from DB fallback
      if (!matchedItem && items.length > 0) {
        matchedItem = items[0];
      }

      if (matchedItem) {
        setActiveItem(matchedItem);
        const newActive = {
          analysisId: matchedItem.analysis.id,
          resumeId: matchedItem.resume.id,
          title: matchedItem.resume.title
        };
        localStorage.setItem('activeResume', JSON.stringify(newActive));
      }
    };

    resolveActiveResume();

    // Cross-tab synchronization
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'activeResume') {
        resolveActiveResume();
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [items, resume, analysis]);

  // Click outside listener for Change Resume dropdown close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectResume = (resumeId: string) => {
    const found = items.find((item) => item.resume.id === resumeId);
    if (found) {
      setActiveItem(found);
      const newActive = {
        analysisId: found.analysis.id,
        resumeId: found.resume.id,
        title: found.resume.title
      };
      localStorage.setItem('activeResume', JSON.stringify(newActive));
      setResults(null);
    }
  };

  const currentItem = (mounted && activeItem) ? activeItem : { resume, analysis };

  // If no resume uploaded, render premium empty state
  if (!resume || !analysis) {
    return (
      <div className="min-h-screen bg-[#030303] text-white flex flex-col items-center justify-center p-6 text-center select-none">
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md bg-[#0a0a0f] border border-white/[0.06] rounded-3xl p-8 shadow-2xl relative overflow-hidden"
        >
          <div className="absolute -top-12 -left-12 w-24 h-24 bg-indigo-500/10 rounded-full blur-xl animate-pulse" />
          
          <div className="w-16 h-16 bg-white/[0.03] border border-white/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <UploadCloud className="w-8 h-8 text-indigo-400" />
          </div>

          <h2 className="text-xl font-bold tracking-tight text-white mb-3">No parsed resume found</h2>
          <p className="text-gray-400 text-xs leading-relaxed mb-6">
            Before using the real-time Job Matching engine, you need to upload a resume on the dashboard and generate the baseline intelligence report.
          </p>

          <a 
            href="/dashboard"
            className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white hover:bg-gray-200 text-black text-xs font-black uppercase tracking-wider shadow-lg transition-all"
          >
            Upload Resume Now
            <ArrowRight className="w-4 h-4" />
          </a>
        </motion.div>
      </div>
    );
  }

  // Parse required experience and qualifications deterministically on the client
  const runDeterministicMatch = () => {
    setAnalyzing(true);
    
    setTimeout(() => {
      const jdLower = jobDescription.toLowerCase();
      
      // 1. Gather all resume text from the dynamically active resume
      const parsedData = currentItem.analysis.parsedData || currentItem.resume.parsedData || {};
      const resumeSummary = (parsedData.summary || '').toLowerCase();
      
      const resumeExp = Array.isArray(parsedData.experience) 
        ? parsedData.experience.map((e: any) => `${e.role} ${e.company} ${(e.bullets || []).join(' ')}`).join(' ').toLowerCase()
        : '';
        
      const resumeProj = Array.isArray(parsedData.projects)
        ? parsedData.projects.map((p: any) => `${p.name} ${p.description} ${(p.bullets || []).join(' ')}`).join(' ').toLowerCase()
        : '';
        
      const resumeSkills = Array.isArray(parsedData.skills) 
        ? parsedData.skills.join(' ').toLowerCase() 
        : '';

      const fullResumeText = `${resumeSummary} ${resumeExp} ${resumeProj} ${resumeSkills}`;

      // 2. Extract keywords from JD using dictionary
      const jdExtractedKeywords: string[] = [];
      TECH_DICTIONARY.forEach(keywordPattern => {
        const regex = new RegExp(`\\b${keywordPattern}\\b`, 'i');
        if (regex.test(jdLower)) {
          const displayName = keywordPattern.replace(/\\/g, '');
          jdExtractedKeywords.push(displayName);
        }
      });

      const targetKeywords = jdExtractedKeywords.length > 0 ? jdExtractedKeywords : ['agile', 'communication', 'software engineering'];

      const matchingKeywords: string[] = [];
      const missingKeywords: string[] = [];

      targetKeywords.forEach(keyword => {
        const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(`\\b${escaped}\\b`, 'i');
        if (regex.test(fullResumeText) || fullResumeText.includes(keyword)) {
          matchingKeywords.push(keyword);
        } else {
          missingKeywords.push(keyword);
        }
      });

      const keywordCoverage = matchingKeywords.length / targetKeywords.length;

      // 3. Extract years of experience from JD using regex
      const expRegex = /\b(\d+)\s*(?:\+|plus)?\s*(?:years?|yrs?)(?:\s+of)?\s+(?:experience|exp)\b/i;
      const expMatch = jdLower.match(expRegex);
      const requiredYears = expMatch ? parseInt(expMatch[1]) : 3;

      let candidateYears = 0;
      if (Array.isArray(parsedData.experience)) {
        parsedData.experience.forEach((e: any) => {
          const startYearMatch = String(e.startDate || '').match(/\b(20\d{2}|19\d{2})\b/);
          const endYearMatch = String(e.endDate || '').match(/\b(20\d{2}|19\d{2})\b/);
          
          const startYear = startYearMatch ? parseInt(startYearMatch[1]) : 2022;
          const endYear = String(e.endDate || '').toLowerCase().includes('present') 
            ? new Date().getFullYear() 
            : (endYearMatch ? parseInt(endYearMatch[1]) : startYear + 1);
            
          candidateYears += Math.max(1, endYear - startYear);
        });
      }
      if (candidateYears === 0) candidateYears = 2;

      const experienceMatchScore = candidateYears >= requiredYears ? 100 : Math.round((candidateYears / requiredYears) * 100);

      // 4. Check for degree matches (Education)
      let educationMatch: 'matched' | 'partial' | 'unspecified' = 'unspecified';
      const hasBachelorsJD = jdLower.includes("bachelor's") || jdLower.includes("bs") || jdLower.includes("degree in computer");
      const hasMastersJD = jdLower.includes("master's") || jdLower.includes("ms");
      
      const resumeEducationText = Array.isArray(parsedData.education)
        ? parsedData.education.map((edu: any) => `${edu.degree} ${edu.field}`).join(' ').toLowerCase()
        : '';
        
      const candidateHasDegree = resumeEducationText.includes('bachelor') || resumeEducationText.includes('master') || resumeEducationText.includes('bs') || resumeEducationText.includes('ms');

      if (hasBachelorsJD || hasMastersJD) {
        educationMatch = candidateHasDegree ? 'matched' : 'partial';
      }

      // 5. Build match percentage
      const baseKeywordScore = keywordCoverage * 50;
      const baseExpScore = (experienceMatchScore / 100) * 25;
      const baseEducationScore = educationMatch === 'matched' ? 10 : educationMatch === 'partial' ? 6 : 8;
      const semanticScore = Math.min(15, (matchingKeywords.length / 8) * 15);

      const finalMatchPercentage = Math.max(25, Math.min(98, Math.round(baseKeywordScore + baseExpScore + baseEducationScore + semanticScore)));

      // 6. Generate action recommendations
      const recommendations: string[] = [];
      if (missingKeywords.length > 0) {
        recommendations.push(`Incorporate key skills: Add **${missingKeywords.slice(0, 3).join(', ')}** to your profile to align with the core tech requirements.`);
      }
      if (candidateYears < requiredYears) {
        recommendations.push(`Highlight leadership: You have **${candidateYears} years** of experience vs. the requested **${requiredYears}+ years**. Highlight architecture scopes and product ownership to bridge the gap.`);
      }
      
      let bulletCount = 0;
      let metricCount = 0;
      const metricRegex = /\b(?:\d+%|\$\d+|[0-9]+\+)\b/;
      
      if (Array.isArray(parsedData.experience)) {
        parsedData.experience.forEach((e: any) => {
          if (Array.isArray(e.bullets)) {
            e.bullets.forEach((b: string) => {
              bulletCount++;
              if (metricRegex.test(b)) metricCount++;
            });
          }
        });
      }

      if (bulletCount === 0 || (metricCount / bulletCount) < 0.2) {
        recommendations.push("Quantify outcomes: Standard ATS parsers scan for metrics. Quantify achievements (percentages, time saved) inside at least 3 bullet points.");
      }

      if (resumeSummary.split(/\s+/).length < 40) {
        recommendations.push("Expand Professional summary: Grow your header pitch to 60-120 words to incorporate cloud and tech stack terminology.");
      }

      let roleFitCategory = 'Moderate Match';
      if (finalMatchPercentage >= 85) roleFitCategory = 'Strong Core Fit';
      else if (finalMatchPercentage >= 65) roleFitCategory = 'Good Structural Alignment';

      setResults({
        matchPercentage: finalMatchPercentage,
        matchingKeywords,
        missingKeywords,
        candidateYears,
        requiredYears,
        experienceMatchScore,
        educationMatch,
        recommendations,
        roleFitCategory
      });
      setAnalyzing(false);
    }, 1200);
  };

  // SVG Gauge calculations
  const radius = 48;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = results ? circumference - (results.matchPercentage / 100) * circumference : circumference;

  return (
    <div className="min-h-screen bg-[#030303] text-slate-100 pt-20 pb-32 px-6 relative overflow-hidden select-none mobile-safe-bottom">
      {/* Background radial gradient glow */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/[0.02] rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-500/[0.015] rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-6xl mx-auto space-y-8 relative z-10">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/[0.04] pb-6">
          <div>
            <div className="flex items-center space-x-2 text-[10px] text-gray-500 uppercase tracking-widest font-black mb-2">
              <span>Career Copilot</span>
              <span>/</span>
              <span className="text-indigo-400">Match Sim</span>
            </div>
            <h1 className="text-2.5xl md:text-4xl font-black text-white tracking-tight flex items-center gap-3">
              <Target className="text-indigo-400 w-8 h-8 shrink-0 animate-pulse" />
              Job Match Simulator
            </h1>
            <p className="text-gray-400 text-xs font-semibold mt-1">
              Evaluate your resume matches instantly using deterministic semantic overlap, experience ratios, and skill density checks.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            {/* Active Resume badge */}
            <div className="px-4 py-2.5 bg-[#0a0a0f]/60 border border-white/[0.06] rounded-2xl flex items-center gap-3 select-none shadow-sm">
              <FileText className="w-4 h-4 text-indigo-400 shrink-0" />
              <div className="text-left min-w-0 max-w-[180px]">
                <div className="text-[8px] text-gray-500 font-black uppercase tracking-widest">Active Resume</div>
                <div className="text-xs font-extrabold text-gray-200 truncate">{currentItem.resume.title}</div>
              </div>
            </div>

            {/* Change Resume custom dropdown */}
            {items.length > 1 && (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="px-4 py-2.5 bg-indigo-600/10 hover:bg-indigo-600/20 border border-indigo-500/20 rounded-2xl text-xs font-black uppercase tracking-wider text-indigo-400 flex items-center gap-2 transition-all shrink-0 outline-none shadow-sm"
                >
                  Change Resume
                  <ChevronRight className={`w-3.5 h-3.5 transition-transform duration-200 ${dropdownOpen ? 'rotate-90' : ''}`} />
                </button>

                <AnimatePresence>
                  {dropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-72 bg-[#0a0a0f]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-3 z-50 overflow-hidden"
                    >
                      {/* Search Input */}
                      <div className="relative mb-2">
                        <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-gray-500" />
                        <input
                          type="text"
                          placeholder="Search resumes..."
                          value={filterQuery}
                          onChange={(e) => setFilterQuery(e.target.value)}
                          className="w-full pl-8 pr-3 py-1.5 bg-white/[0.03] border border-white/5 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500/50 font-semibold"
                        />
                      </div>

                      <div className="max-h-48 overflow-y-auto space-y-1 custom-scrollbar">
                        {items.filter((item) =>
                          (item.resume.title || '').toLowerCase().includes(filterQuery.toLowerCase())
                        ).length === 0 ? (
                          <div className="text-center py-4 text-xs text-gray-500">No resumes found</div>
                        ) : (
                          items
                            .filter((item) =>
                              (item.resume.title || '').toLowerCase().includes(filterQuery.toLowerCase())
                            )
                            .map((item) => {
                              const isActive = currentItem.resume.id === item.resume.id;
                              const updatedDate = item.resume.updatedAt 
                                ? new Date(item.resume.updatedAt).toLocaleDateString()
                                : item.resume.createdAt 
                                  ? new Date(item.resume.createdAt).toLocaleDateString() 
                                  : 'Unknown Date';
                              return (
                                <button
                                  key={item.resume.id}
                                  onClick={() => {
                                    handleSelectResume(item.resume.id);
                                    setDropdownOpen(false);
                                  }}
                                  className={`w-full text-left p-2 rounded-xl transition-colors flex items-center justify-between text-xs
                                    ${isActive ? 'bg-indigo-600/20 border border-indigo-500/30 text-white font-bold' : 'hover:bg-white/5 text-gray-400 hover:text-white font-semibold'}`}
                                >
                                  <div className="min-w-0 pr-2">
                                    <p className="font-extrabold truncate text-xs">{item.resume.title}</p>
                                    <p className="text-[9px] text-gray-500 mt-0.5">Updated: {updatedDate}</p>
                                  </div>
                                  {isActive && <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 shrink-0" />}
                                </button>
                              );
                            })
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT PANEL - Pasteur Input */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-[#0a0a0f]/80 border border-white/[0.06] rounded-3xl p-6 relative overflow-hidden shadow-2xl">
              <div className="absolute top-[-10%] left-[-10%] w-24 h-24 bg-indigo-500/5 rounded-full blur-xl" />
              
              <label className="block text-xs font-black uppercase tracking-wider text-gray-200 mb-3 flex items-center gap-1.5">
                <Target className="w-4 h-4 text-indigo-400" />
                Paste Job Description
              </label>
              <textarea 
                value={jobDescription}
                onChange={e => setJobDescription(e.target.value)}
                placeholder="Paste the key responsibilities, requirements, and tech stacks of the role here..."
                className="w-full h-[400px] bg-black/40 border border-white/10 hover:border-white/20 focus:border-indigo-500 rounded-2xl p-4 text-xs leading-relaxed text-gray-300 focus:outline-none transition-all resize-none custom-scrollbar font-medium"
              />
              
              <div className="mt-4 flex justify-end">
                <button 
                  onClick={runDeterministicMatch}
                  className="px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-black text-xs text-white uppercase tracking-wider flex items-center gap-2 transition-all shadow-lg"
                  disabled={jobDescription.length < 50 || analyzing}
                >
                  {analyzing ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Analyzing Overlap...
                    </>
                  ) : (
                    <>
                      <Search className="w-3.5 h-3.5" />
                      Analyze Match Overlap
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT PANEL - Match Results */}
          <div className="lg:col-span-7">
            <AnimatePresence mode="wait">
              {!results ? (
                // 1. Awaiting Input Screen
                <motion.div 
                  key="awaiting"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="bg-[#0a0a0f]/80 border border-white/[0.06] rounded-3xl p-8 h-full min-h-[480px] flex flex-col items-center justify-center text-center relative shadow-2xl"
                >
                  <div className="w-16 h-16 bg-white/[0.02] border border-white/5 rounded-full flex items-center justify-center mb-6 relative">
                    <Zap className="w-6 h-6 text-gray-600 animate-pulse" />
                  </div>
                  <h3 className="text-base font-extrabold mb-2 text-gray-300 uppercase tracking-wider">Awaiting Job Specifications</h3>
                  <p className="text-gray-500 text-xs max-w-sm leading-relaxed font-semibold">
                    Paste the target role description on the left and trigger the comparison simulator to benchmark keywords, required experiences, and education metrics.
                  </p>
                </motion.div>
              ) : (
                // 2. Results Dashboard
                <motion.div 
                  key="results"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  {/* Gauge Card */}
                  <div className="bg-[#0a0a0f]/80 border border-white/[0.06] rounded-3xl p-6 relative overflow-hidden shadow-2xl">
                    <div className="absolute top-[-20%] right-[-20%] w-28 h-28 bg-indigo-500/10 rounded-full blur-2xl" />
                    
                    <div className="flex flex-col md:flex-row items-center gap-6">
                      
                      {/* Circular matching score widget */}
                      <div className="relative w-28 h-28 flex items-center justify-center shrink-0">
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 112 112">
                          <defs>
                            <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                              <stop offset="0%" stopColor="#818cf8" />
                              <stop offset="100%" stopColor="#a855f7" />
                            </linearGradient>
                            <filter id="simGlow" x="-20%" y="-20%" width="140%" height="140%">
                              <feGaussianBlur stdDeviation="4" result="blur" />
                              <feMerge>
                                <feMergeNode in="blur" />
                                <feMergeNode in="SourceGraphic" />
                              </feMerge>
                            </filter>
                          </defs>
                          {/* Track ring */}
                          <circle cx="56" cy="56" r={radius} stroke="rgba(255,255,255,0.03)" strokeWidth="8" fill="transparent" />
                          <motion.circle 
                            initial={{ strokeDashoffset: circumference }}
                            animate={{ strokeDashoffset }}
                            transition={{ duration: 1.5, ease: "easeOut" }}
                            cx="56" 
                            cy="56" 
                            r={radius} 
                            stroke="url(#scoreGrad)" 
                            strokeWidth="8" 
                            fill="transparent" 
                            strokeDasharray={circumference} 
                            strokeLinecap="round"
                            filter="url(#simGlow)"
                          />
                        </svg>
                        <div className="absolute flex flex-col items-center">
                          <span className="text-2xl font-black text-white">{results.matchPercentage}%</span>
                          <span className="text-[8px] text-gray-500 font-black uppercase tracking-widest mt-0.5">Match</span>
                        </div>
                      </div>

                      <div className="text-center md:text-left space-y-2">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-500/5 border border-indigo-500/10 rounded-full text-[10px] font-black uppercase tracking-wider text-indigo-400">
                          <Sparkles className="w-3 h-3 text-indigo-400" />
                          {results.roleFitCategory}
                        </div>
                        <h3 className="text-base font-black text-white uppercase tracking-wider">ATS Overlap Simulator Result</h3>
                        <p className="text-gray-400 text-xs font-semibold leading-relaxed max-w-md">
                          Your resume displays robust capabilities. Address the highlighted skill gaps and metric opportunities below to achieve a {Math.min(99, results.matchPercentage + 8)}%+ ranking score.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Comparisons Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    {/* Years experience Comparison Card */}
                    <div className="bg-[#0a0a0f]/80 border border-white/[0.06] rounded-2xl p-4 flex items-center gap-3 shadow-sm">
                      <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/10">
                        <Briefcase className="w-4 h-4 text-indigo-400" />
                      </div>
                      <div>
                        <div className="text-[8px] text-gray-500 font-black uppercase tracking-widest">Experience Level</div>
                        <div className="text-xs font-extrabold text-white mt-0.5">
                          {results.candidateYears} yrs <span className="text-gray-500 font-semibold">vs {results.requiredYears} yrs req</span>
                        </div>
                      </div>
                    </div>

                    {/* Education credential comparison card */}
                    <div className="bg-[#0a0a0f]/80 border border-white/[0.06] rounded-2xl p-4 flex items-center gap-3 shadow-sm">
                      <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/10">
                        <GraduationCap className="w-4 h-4 text-indigo-400" />
                      </div>
                      <div>
                        <div className="text-[8px] text-gray-500 font-black uppercase tracking-widest">Education Match</div>
                        <div className="text-xs font-extrabold text-white mt-0.5 capitalize flex items-center gap-1">
                          {results.educationMatch === 'matched' ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                              Fully Aligned
                            </>
                          ) : results.educationMatch === 'partial' ? (
                            <>
                              <AlertTriangle className="w-3.5 h-3.5 text-yellow-400 animate-pulse" />
                              Partial Match
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5 text-gray-400" />
                              Unspecified
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Keywords Tag Grid */}
                  <div className="bg-[#0a0a0f]/80 border border-white/[0.06] rounded-3xl p-5 space-y-4 shadow-xl">
                    <div>
                      <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Semantic Keyword Matrix</h4>
                      <p className="text-[10px] text-gray-500 font-semibold leading-normal">Matched strengths represent overlap. Missing keywords should be strategically added.</p>
                    </div>

                    {/* Matching strengths */}
                    <div className="space-y-2">
                      <div className="text-[10px] font-black text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 inline-block" />
                        Matching Strengths ({results.matchingKeywords.length})
                      </div>
                      {results.matchingKeywords.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {results.matchingKeywords.map((s, idx) => (
                            <span key={idx} className="px-2.5 py-1 bg-emerald-500/5 text-emerald-300 border border-emerald-500/15 text-[10px] font-black uppercase tracking-wider rounded-lg">
                              {s}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <div className="text-xs text-gray-500 italic pl-5">No keyword overlap detected. Paste a detailed JD.</div>
                      )}
                    </div>

                    {/* Missing keywords */}
                    <div className="space-y-2 pt-2 border-t border-white/[0.04]">
                      <div className="text-[10px] font-black text-yellow-400 uppercase tracking-widest flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-yellow-500 inline-block animate-pulse" />
                        Missing Critical Keywords ({results.missingKeywords.length})
                      </div>
                      {results.missingKeywords.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {results.missingKeywords.map((s, idx) => (
                            <span key={idx} className="px-2.5 py-1 bg-yellow-500/5 text-yellow-300 border border-yellow-500/15 text-[10px] font-black uppercase tracking-wider rounded-lg">
                              {s}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <div className="text-xs text-emerald-400 italic pl-5">Flawless match! You have matched all detected core keywords.</div>
                      )}
                    </div>
                  </div>

                  {/* Recommendation action checklist */}
                  <div className="bg-[#0a0a0f]/80 border border-white/[0.06] rounded-3xl p-5 space-y-4 shadow-xl">
                    <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5 border-b border-white/[0.04] pb-3">
                      <CheckCircle2 className="w-4 h-4 text-indigo-400" />
                      Tailored Match Action Checklist
                    </h4>
                    
                    <div className="space-y-3">
                      {results.recommendations.map((rec, idx) => (
                        <div key={idx} className="flex items-start gap-3 bg-white/[0.01] p-3.5 border border-white/[0.04] rounded-2xl group hover:bg-white/[0.02] hover:border-white/10 transition-all duration-300">
                          <input 
                            type="checkbox" 
                            className="mt-0.5 rounded border-white/10 bg-black text-indigo-600 focus:ring-0 w-3.5 h-3.5 shrink-0 accent-indigo-600 cursor-pointer" 
                          />
                          <p className="text-xs text-gray-300 leading-relaxed font-semibold select-text">
                            {rec.split('**').map((part, i) => i % 2 === 1 ? <strong key={i} className="text-white font-black">{part}</strong> : part)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>
      </div>
    </div>
  );
}
