'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { FileText, Clock, Bot, Search, Filter, AlertCircle, ShieldCheck, RefreshCw, Loader2, Target, Calendar, Trash2, Edit3 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export function ResumesClient({ initialData }: { initialData: any[] }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState('newest');
  
  const router = useRouter();
  const [reanalyzingId, setReanalyzingId] = useState<string | null>(null);
  const reanalyzeLockRef = useRef<boolean>(false);

  const updateActiveResume = (resume: any) => {
    const activeResume = {
      analysisId: String(resume.analysisId || resume.id || ''),
      resumeId: String(resume.resumeId || resume.id || ''),
      title: String(resume.filename || resume.title || 'Untitled Resume')
    };
    localStorage.setItem('activeResume', JSON.stringify(activeResume));
    if (process.env.NODE_ENV !== 'production') {
      console.log("[ActiveResume] Updated:", activeResume);
    }
  };

  const handleReanalyze = async (resumeId: string) => {
    if (reanalyzingId || reanalyzeLockRef.current) return;
    reanalyzeLockRef.current = true;
    setReanalyzingId(resumeId);
    
    toast.info('Bypassing cache and running premium re-analysis...', { id: 'reanalyze' });
    
    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          resumeId,
          forceReanalyze: true,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to re-analyze resume');
      }

      toast.success('AI Re-analysis complete! Redirecting...', { id: 'reanalyze' });
      const currentResume = initialData.find((r) => (r.resumeId || r.id) === resumeId);
      const activeResume = {
        analysisId: String(data.analysisId),
        resumeId: String(resumeId),
        title: String(currentResume?.filename || currentResume?.title || 'Untitled Resume')
      };
      localStorage.setItem('activeResume', JSON.stringify(activeResume));
      router.push(`/dashboard/analysis/${data.analysisId}`);
    } catch (err: any) {
      console.error('[Reanalyze] Error:', err);
      toast.error(`Re-analysis failed: ${err.message}`, { id: 'reanalyze' });
    } finally {
      setReanalyzingId(null);
      reanalyzeLockRef.current = false;
    }
  };

  const handleDelete = async (resumeId: string) => {
    toast.error('Resume deletion is temporarily disabled during this preview.', { id: 'delete' });
  };

  const filteredResumes = initialData
    .filter((resume) => {
      const matchesSearch = (resume.filename || resume.title || 'Untitled Resume').toLowerCase().includes(searchQuery.toLowerCase());
      const matchesSource = sourceFilter === 'all' || resume.analysisSource === sourceFilter;
      return matchesSearch && matchesSource;
    })
    .sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      if (sortOrder === 'newest') return dateB - dateA;
      if (sortOrder === 'oldest') return dateA - dateB;
      if (sortOrder === 'score_high') return (b.atsScore || 0) - (a.atsScore || 0);
      return 0;
    });

  return (
    <div className="pt-24 pb-32 px-6 md:px-10 w-full max-w-6xl mx-auto min-h-screen relative overflow-hidden select-none mobile-safe-bottom">
      
      {/* Background soft glow rings */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/[0.015] rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-500/[0.01] rounded-full blur-[120px] pointer-events-none" />

      <header className="mb-10 relative z-10">
        <div className="flex items-center space-x-2 text-[10px] text-gray-500 uppercase tracking-widest font-black mb-2">
          <span>Career Copilot</span>
          <span>/</span>
          <span className="text-indigo-400">History Workspace</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white mb-2">
          Resume History Archive
        </h1>
        <p className="text-gray-400 text-xs font-semibold max-w-2xl leading-relaxed">
          A read-only archive of your previously analyzed resumes and their performance metrics. All sessions are locally cached and encrypted.
        </p>
      </header>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-4 mb-10 relative z-10">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search by filename..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-[#0a0a0f]/60 border border-white/[0.06] hover:border-white/10 focus:border-indigo-500/50 rounded-2xl text-xs text-white placeholder-gray-500 focus:outline-none transition-all font-semibold"
          />
        </div>
        <div className="flex gap-4 shrink-0">
          <div className="relative">
            <Filter className="absolute left-3.5 top-3.5 h-3.5 w-3.5 text-gray-500" />
            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className="pl-9 pr-8 py-3 bg-[#0a0a0f]/60 border border-white/[0.06] hover:border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-wider text-white appearance-none focus:outline-none focus:border-indigo-500/50 transition-all cursor-pointer shadow-sm"
            >
              <option value="all" className="bg-[#0a0a0f] text-white">All Engines</option>
              <option value="gemini" className="bg-[#0a0a0f] text-white">AI Analysis</option>
              <option value="fallback" className="bg-[#0a0a0f] text-white">Local Recov</option>
            </select>
          </div>
          <div className="relative">
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="px-5 py-3 bg-[#0a0a0f]/60 border border-white/[0.06] hover:border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-wider text-white appearance-none focus:outline-none focus:border-indigo-500/50 transition-all cursor-pointer shadow-sm"
            >
              <option value="newest" className="bg-[#0a0a0f] text-white">Newest First</option>
              <option value="oldest" className="bg-[#0a0a0f] text-white">Oldest First</option>
              <option value="score_high" className="bg-[#0a0a0f] text-white">Highest Score</option>
            </select>
          </div>
        </div>
      </div>

      {initialData.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-[#0a0a0f]/40 border border-white/[0.06] rounded-3xl relative z-10">
          <div className="w-16 h-16 bg-white/[0.02] border border-white/5 rounded-full flex items-center justify-center mb-6">
            <FileText className="w-8 h-8 text-gray-500" />
          </div>
          <h2 className="text-base font-extrabold text-white uppercase tracking-wider mb-2">No career history found</h2>
          <p className="text-gray-400 text-xs font-semibold mb-8 max-w-sm text-center">
            Upload your first resume to build your career intelligence history.
          </p>
          <Link 
            href="/dashboard"
            className="px-5 py-3 bg-white hover:bg-gray-200 text-black rounded-xl font-black text-xs uppercase tracking-wider shadow-lg shadow-white/5 transition-all"
          >
            Upload Resume
          </Link>
        </div>
      ) : filteredResumes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-[#0a0a0f]/40 border border-white/[0.06] rounded-3xl relative z-10">
          <Search className="w-8 h-8 text-gray-500 mb-4" />
          <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">No resumes match your current filters.</p>
          <button 
            onClick={() => { setSearchQuery(''); setSourceFilter('all'); }}
            className="mt-4 text-indigo-400 hover:text-indigo-300 text-xs font-black uppercase tracking-wider"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 relative z-10">
          <AnimatePresence>
            {filteredResumes.map((resume, i) => {
              const uniqueKey = 
                (resume.id && resume.id !== "") ? resume.id :
                (resume.analysisId && resume.analysisId !== "") ? resume.analysisId :
                (resume.textHash && resume.textHash !== "") ? resume.textHash :
                `${resume.filename || resume.title || 'untitled'}-${resume.createdAt}-${i}`;

              const formattedDate = resume.createdAt 
                ? new Date(resume.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })
                : 'Date Unknown';

              return (
                <motion.div 
                  key={uniqueKey}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2, delay: i * 0.05 }}
                  className="bg-[#0a0a0f]/80 backdrop-blur-xl border border-white/[0.06] hover:border-indigo-500/30 rounded-3xl p-6 flex flex-col relative overflow-hidden group transition-all duration-300 shadow-sm hover:shadow-[0_0_20px_-5px_rgba(99,102,241,0.15)]"
                >
                  <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-indigo-500/20 to-purple-500/20 group-hover:from-indigo-500 group-hover:to-purple-500 transition-all duration-500" />
                  
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex flex-col gap-2">
                      <div className="p-2.5 bg-white/[0.02] border border-white/10 rounded-xl w-max">
                        <FileText className="w-4 h-4 text-gray-300" />
                      </div>
                      {resume.fallbackUsed ? (
                        <span className="flex items-center text-[8px] uppercase font-black tracking-widest text-orange-400 bg-orange-400/5 px-2 py-1 rounded-lg w-max border border-orange-400/10">
                          <AlertCircle className="w-2.5 h-2.5 mr-1" /> Recovered
                        </span>
                      ) : (
                        <span className="flex items-center text-[8px] uppercase font-black tracking-widest text-emerald-400 bg-emerald-400/5 px-2 py-1 rounded-lg w-max border border-emerald-400/10 animate-pulse">
                          <ShieldCheck className="w-2.5 h-2.5 mr-1" /> AI Certified
                        </span>
                      )}
                    </div>

                    {resume.atsScore !== null ? (
                      <div className="flex flex-col items-end">
                        <span className="text-2xl font-black text-white tracking-tighter">
                          {resume.atsScore}<span className="text-[10px] text-gray-500 font-bold">%</span>
                        </span>
                        <span className="text-[8px] uppercase font-black tracking-widest text-emerald-400 mt-0.5">ATS SCORE</span>
                      </div>
                    ) : (
                      <span className="text-[8px] uppercase font-black tracking-widest text-gray-500 mt-0.5">UNRATED</span>
                    )}
                  </div>
                  
                  <div className="flex-1 mt-2">
                    <h3 className="text-base font-extrabold text-white truncate mb-1 group-hover:text-indigo-400 transition-colors" title={resume.filename || resume.title || 'Untitled Resume'}>
                      {resume.filename || resume.title || 'Untitled Resume'}
                    </h3>
                    <div className="flex flex-col gap-2 mt-4 text-[10px] text-gray-400 font-semibold">
                      <span className="flex items-center">
                        <Calendar className="w-3.5 h-3.5 mr-2 text-gray-500 shrink-0" />
                        {formattedDate}
                      </span>
                      <span className="flex items-center">
                        <Bot className="w-3.5 h-3.5 mr-2 text-gray-500 shrink-0" />
                        <span className="capitalize">{resume.analysisSource} Engine</span>
                      </span>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-white/[0.04] flex flex-col gap-3">
                    <div className="flex items-center justify-between gap-2 w-full">
                      <Link
                        href={`/dashboard/analysis/${resume.analysisId || resume.id}`}
                        onClick={() => updateActiveResume(resume)}
                        className="flex-1 py-2 text-center rounded-xl bg-white/[0.02] hover:bg-white/5 text-gray-300 hover:text-white text-[10px] font-black uppercase tracking-wider transition-colors border border-white/5 flex items-center justify-center gap-1.5"
                      >
                        <Search className="w-3 h-3" /> View
                      </Link>
                      <Link
                        href={`/dashboard/editor/${resume.analysisId || resume.id}`}
                        onClick={() => updateActiveResume(resume)}
                        className="flex-1 py-2 text-center rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 text-[10px] font-black uppercase tracking-wider transition-colors border border-indigo-500/20 flex items-center justify-center gap-1.5"
                      >
                        <Edit3 className="w-3 h-3" /> Edit
                      </Link>
                      <button
                        onClick={(e) => { e.preventDefault(); handleDelete(resume.id); }}
                        className="py-2 px-3 text-center rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 text-[10px] font-black uppercase tracking-wider transition-colors border border-red-500/20 flex items-center justify-center"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <button
                      onClick={() => handleReanalyze(resume.resumeId || resume.id)}
                      disabled={reanalyzingId !== null}
                      className="w-full py-2.5 rounded-xl bg-white hover:bg-gray-200 disabled:bg-indigo-800 disabled:opacity-30 text-black text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center space-x-2"
                    >
                      {reanalyzingId === (resume.resumeId || resume.id) ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Re-analyzing...</span>
                        </>
                      ) : (
                        <>
                          <RefreshCw className="w-3.5 h-3.5" />
                          <span>Re-analyze AI</span>
                        </>
                      )}
                    </button>
                  </div>

                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
