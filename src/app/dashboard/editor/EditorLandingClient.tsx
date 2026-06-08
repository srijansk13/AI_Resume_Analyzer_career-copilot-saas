'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Edit3, Calendar, Upload } from 'lucide-react';

interface Resume {
  id: string;
  resumeId: string;
  analysisId: string;
  title: string;
  createdAt: string;
  atsScore: number | null;
}

export default function EditorLandingClient({ resumes }: { resumes: Resume[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const activeResumeStr = localStorage.getItem('activeResume');
      if (activeResumeStr) {
        const activeResume = JSON.parse(activeResumeStr);
        if (activeResume && activeResume.analysisId) {
          // If we have an active resume, just go straight there
          router.replace(`/dashboard/editor/${activeResume.analysisId}`);
          return;
        }
      }
    } catch (e) {
      console.error('Failed to parse activeResume', e);
    }
    
    // Fallback: If no valid active resume, we show the list/empty state
    setLoading(false);
  }, [router]);

  const updateActiveResume = (resume: Resume) => {
    const activeResume = {
      analysisId: String(resume.analysisId || resume.id || ''),
      resumeId: String(resume.resumeId || resume.id || ''),
      title: String(resume.title || 'Untitled Resume')
    };
    localStorage.setItem('activeResume', JSON.stringify(activeResume));
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] bg-transparent text-white">
        <div className="w-2 h-2 rounded-full bg-indigo-500 animate-ping" />
      </div>
    );
  }

  return (
    <div className="pt-24 pb-32 px-6 md:px-10 w-full max-w-4xl mx-auto min-h-screen relative overflow-hidden select-none mobile-safe-bottom">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/[0.015] rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-500/[0.01] rounded-full blur-[120px] pointer-events-none" />

      <header className="mb-8 relative z-10">
        <h1 className="text-3xl font-black tracking-tight text-white mb-2">
          Editor Workspace
        </h1>
        <p className="text-gray-400 text-xs font-semibold max-w-xl leading-relaxed">
          Select a resume to open the live editor and customize your content.
        </p>
      </header>

      {resumes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-[#0a0a0f]/80 backdrop-blur-xl border border-white/[0.06] rounded-3xl relative z-10 shadow-lg shadow-black/20">
          <div className="w-16 h-16 bg-white/[0.02] border border-white/5 rounded-full flex items-center justify-center mb-6">
            <FileText className="w-8 h-8 text-gray-500" />
          </div>
          <h2 className="text-base font-extrabold text-white uppercase tracking-wider mb-2">No resume selected</h2>
          <p className="text-gray-400 text-xs font-semibold mb-8 max-w-sm text-center">
            Upload a resume to start editing and optimizing your career profile.
          </p>
          <Link 
            href="/dashboard"
            className="px-6 py-3 bg-white hover:bg-gray-200 text-black rounded-xl font-black text-xs uppercase tracking-wider shadow-lg shadow-white/5 transition-all flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            Upload Resume
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 relative z-10">
          <AnimatePresence>
            {resumes.map((resume, i) => {
              const formattedDate = resume.createdAt 
                ? new Date(resume.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })
                : 'Date Unknown';

              return (
                <motion.div 
                  key={resume.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2, delay: i * 0.05 }}
                  className="bg-[#0a0a0f]/80 backdrop-blur-xl border border-white/[0.06] hover:border-indigo-500/30 rounded-3xl p-5 flex flex-col relative overflow-hidden group transition-all duration-300 shadow-sm hover:shadow-[0_0_20px_-5px_rgba(99,102,241,0.15)]"
                >
                  <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-indigo-500/20 to-purple-500/20 group-hover:from-indigo-500 group-hover:to-purple-500 transition-all duration-500" />
                  
                  <div className="flex justify-between items-start mb-3">
                    <div className="p-2 bg-white/[0.02] border border-white/10 rounded-xl">
                      <FileText className="w-4 h-4 text-gray-300" />
                    </div>

                    {resume.atsScore !== null && (
                      <div className="flex flex-col items-end">
                        <span className="text-xl font-black text-white tracking-tighter">
                          {resume.atsScore}<span className="text-[10px] text-gray-500 font-bold">%</span>
                        </span>
                        <span className="text-[8px] uppercase font-black tracking-widest text-emerald-400 mt-0.5">ATS SCORE</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 mt-1 mb-5">
                    <h3 className="text-sm font-extrabold text-white truncate mb-2 group-hover:text-indigo-400 transition-colors" title={resume.title}>
                      {resume.title}
                    </h3>
                    <span className="flex items-center text-[10px] text-gray-400 font-semibold">
                      <Calendar className="w-3 h-3 mr-1.5 text-gray-500" />
                      {formattedDate}
                    </span>
                  </div>

                  <Link
                    href={`/dashboard/editor/${resume.analysisId || resume.id}`}
                    onClick={() => updateActiveResume(resume)}
                    className="w-full py-2.5 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 text-[10px] font-black uppercase tracking-wider transition-colors border border-indigo-500/20 flex items-center justify-center gap-2"
                  >
                    <Edit3 className="w-3.5 h-3.5" /> Edit Resume
                  </Link>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
