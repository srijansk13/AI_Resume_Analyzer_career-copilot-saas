'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { EditorState, ResumeExperience, ResumeEducation, ResumeProject } from '@/models/EditorState';
import { IAnalysis } from '@/models/Analysis';
import { calculateATSScore } from '@/utils/atsScorer';
import { calculateEditorATSScore, EditorAITrackingFlags } from '@/utils/editorAtsScorer';
import {
  applyBulletOptimizationToContent,
  normalizeBulletText,
} from '@/lib/editor/applyBulletOptimization';
import { toast } from 'sonner';
import { 
  ChevronDown, ChevronRight, Wand2, Plus, Trash2, CheckCircle2, 
  ArrowRight, Sparkles, PlusCircle, Check, Briefcase, GraduationCap, 
  FolderGit2, Award, User, FileText, PlusSquare, AlertCircle, LayoutTemplate, Trophy, BookOpen, Users,
  Copy, X, HelpCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface EditPanelProps {
  editorState: EditorState;
  setEditorState: React.Dispatch<React.SetStateAction<EditorState | null>>;
  analysis: IAnalysis;
}

const EDITOR_GUIDE_KEY = 'dismissedEditorGuide';

// Custom hook for smooth numerical transitions
function useAnimatedScore(targetScore: number, duration: number = 500) {
  const [displayedScore, setDisplayedScore] = useState(targetScore);

  useEffect(() => {
    if (displayedScore === targetScore) return;
    
    let startTimestamp: number | null = null;
    const startScore = displayedScore;
    const difference = targetScore - startScore;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      
      // Use easeOutQuad for smooth deceleration
      const easeProgress = 1 - (1 - progress) * (1 - progress);
      const currentVal = Math.round(startScore + (difference * easeProgress));
      
      setDisplayedScore(currentVal);
      
      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        setDisplayedScore(targetScore);
      }
    };

    window.requestAnimationFrame(step);
  }, [targetScore, duration, displayedScore]);

  return displayedScore;
}

export default function EditPanel({ editorState, setEditorState, analysis }: EditPanelProps) {
  const [activeTab, setActiveTab] = useState<'content' | 'theme' | 'ai'>('content');
  const [expandedSection, setExpandedSection] = useState<string>('personalInfo');
  const [editorGuideOpen, setEditorGuideOpen] = useState(true);
  const [applyingBulletKey, setApplyingBulletKey] = useState<string | null>(null);
  const [bulletApplyFailed, setBulletApplyFailed] = useState<Record<number, boolean>>({});
  const [summaryApplying, setSummaryApplying] = useState(false);
  const [summaryApplied, setSummaryApplied] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && localStorage.getItem(EDITOR_GUIDE_KEY) === '1') {
      setEditorGuideOpen(false);
    }
  }, []);

  // Original AI Score from analysis
  const originalAIScore = useMemo(() => {
    const ats = analysis?.ats || {};
    return typeof ats.overall_ats_score === 'number' 
      ? ats.overall_ats_score 
      : typeof ats.score === 'number' 
        ? ats.score 
        : 75;
  }, [analysis]);

  // Track which AI improvements the user has explicitly accepted
  const [aiFlags, setAiFlags] = useState<EditorAITrackingFlags>({
    aiSummaryApplied: false,
    aiBulletsApplied: false,
    aiKeywordsApplied: false,
    aiSkillsApplied: false,
    aiProjectsApplied: false,
  });

  // Track the most recent score jump to show a popup indicator
  const [lastScoreJump, setLastScoreJump] = useState<{ jump: number; timestamp: number } | null>(null);
  const [prevScoreRef, setPrevScoreRef] = useState<number | null>(null);

  // 1. Calculate live ATS Score using the dedicated Editor Engine
  const liveATSBreakdown = useMemo(() => {
    return calculateEditorATSScore(editorState.content, analysis.keywords, aiFlags, editorState.templateId, originalAIScore);
  }, [editorState.content, analysis.keywords, aiFlags, editorState.templateId, originalAIScore]);

  // Smoothly animate the target score
  const animatedScore = useAnimatedScore(liveATSBreakdown.score);

  // Detect sudden jumps in score from AI applications to show indicator
  useEffect(() => {
    if (prevScoreRef !== null) {
      const diff = liveATSBreakdown.score - prevScoreRef;
      if (diff >= 2) {
        setLastScoreJump({ jump: diff, timestamp: Date.now() });
        // Hide after 3 seconds
        setTimeout(() => setLastScoreJump(null), 3000);
      }
    }
    setPrevScoreRef(liveATSBreakdown.score);
  }, [liveATSBreakdown.score, prevScoreRef]);

  const scoreDifference = liveATSBreakdown.score - originalAIScore;

  // State update helper
  const updateContent = (updater: (content: typeof editorState.content) => void) => {
    setEditorState(prev => {
      if (!prev) return null;
      const contentCopy = JSON.parse(JSON.stringify(prev.content));
      updater(contentCopy);
      return {
        ...prev,
        content: contentCopy,
        lastSavedAt: Date.now()
      };
    });
  };

  const getOptimizedSummaryText = (): string => {
    const rewrite = analysis.optimization?.summary_rewrite;
    if (typeof rewrite === 'string' && rewrite.trim()) return rewrite.trim();
    if (rewrite && typeof rewrite === 'object' && typeof rewrite.optimized === 'string') {
      return rewrite.optimized.trim();
    }
    const legacy = analysis.optimization?.summaryRewrite;
    if (typeof legacy === 'string' && legacy.trim()) return legacy.trim();
    if (legacy?.optimized && typeof legacy.optimized === 'string') return legacy.optimized.trim();
    return '';
  };

  useEffect(() => {
    const aiSummary = getOptimizedSummaryText();
    if (aiSummary && normalizeBulletText(editorState.content.summary || '') === normalizeBulletText(aiSummary)) {
      setSummaryApplied(true);
    }
  }, [editorState.content.summary, analysis]);

  const dismissEditorGuide = () => {
    setEditorGuideOpen(false);
    localStorage.setItem(EDITOR_GUIDE_KEY, '1');
  };

  // AI Helpers
  const applyAISummary = async () => {
    const aiSummary = getOptimizedSummaryText();
    if (!aiSummary) {
      toast.error('No AI summary rewrite available.');
      return;
    }
    setSummaryApplying(true);
    updateContent((draft) => {
      draft.summary = aiSummary;
    });
    setAiFlags(prev => ({ ...prev, aiSummaryApplied: true }));
    setActiveTab('content');
    setExpandedSection('summary');
    setSummaryApplied(true);
    setSummaryApplying(false);
    toast.success('Summary updated — check the preview.');
  };

  const isBulletOptimized = (_originalText?: string, optimizedText?: string) => {
    if (!optimizedText || typeof optimizedText !== 'string') return false;
    const optNorm = normalizeBulletText(optimizedText);

    const hasOptimizedBullet = (bullets: string[] | undefined) =>
      Array.isArray(bullets) &&
      bullets.some((bullet) => typeof bullet === 'string' && normalizeBulletText(bullet) === optNorm);

    if (hasOptimizedBullet(editorState.content.experience?.flatMap((e) => e.bullets))) return true;
    return hasOptimizedBullet(editorState.content.projects?.flatMap((p) => p.bullets || []));
  };

  const handleApplyBullet = async (index: number, originalText?: string, optimizedText?: string) => {
    if (!optimizedText || typeof optimizedText !== 'string' || applyingBulletKey) return;

    setApplyingBulletKey(`bullet-${index}`);
    setBulletApplyFailed((prev) => ({ ...prev, [index]: false }));

    const contentCopy = JSON.parse(JSON.stringify(editorState.content));
    const matchResult = applyBulletOptimizationToContent(contentCopy, originalText, optimizedText);

    if (matchResult !== 'none') {
      setEditorState((prev) =>
        prev ? { ...prev, content: contentCopy, lastSavedAt: Date.now() } : prev
      );
      setAiFlags(prev => ({ ...prev, aiBulletsApplied: true }));
      toast.success('Bullet applied to your resume.');
    } else {
      setBulletApplyFailed((prev) => ({ ...prev, [index]: true }));
      toast.error("Couldn't auto-match this bullet. Please copy it manually.");
    }

    setApplyingBulletKey(null);
  };

  const copyOptimizedBullet = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Optimized bullet copied.');
    } catch {
      toast.error('Copy failed — select and copy the text manually.');
    }
  };

  const handleResetToAI = () => {
    if (confirm("Are you sure? This will discard your manual edits and reload the AI-optimized version.")) {
      const localKey = `editorState:${analysis._id}`;
      localStorage.removeItem(localKey);
      window.location.reload();
    }
  };

  // Sections toggle helper
  const isSectionVisible = (key: string) => {
    return editorState.visibleSections[key as keyof typeof editorState.visibleSections] !== false;
  };

  return (
    <div className="flex flex-col h-full min-h-0 bg-[#0a0a0a] text-white">
      {/* 1. TOP PREMIUM SCORE COMPARISON CARD */}
      <div className="p-4 border-b border-white/10 bg-gradient-to-b from-slate-900/40 to-transparent">
        <div className="bg-[#121212] border border-white/10 rounded-2xl p-4 relative overflow-hidden shadow-2xl">
          {/* Subtle glowing accents */}
          <div className="absolute -top-12 -right-12 w-24 h-24 bg-indigo-500/20 rounded-full blur-xl" />
          
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              ATS Optimization Live
            </h3>
            
            {/* Score Comparison Badge */}
            <div className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 ${
              scoreDifference > 0 
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                : scoreDifference < 0 
                  ? 'bg-red-500/10 text-red-400 border border-red-500/20' 
                  : 'bg-white/5 text-gray-400 border border-white/10'
            }`}>
              {scoreDifference > 0 ? `+${scoreDifference} Improved` : scoreDifference < 0 ? `${scoreDifference} Change` : 'Matches Original'}
            </div>
          </div>

          <div className="flex items-center justify-between">
            {/* Original Score */}
            <div className="text-center bg-white/[0.02] border border-white/5 rounded-xl px-4 py-2 flex-1 mr-3">
              <div className="text-xs text-gray-500 font-semibold uppercase">Original AI</div>
              <div className="text-2xl font-bold tracking-tight text-gray-400">{originalAIScore}%</div>
            </div>

            {/* Transition Arrow */}
            <ArrowRight className="w-5 h-5 text-gray-600 shrink-0" />

            {/* Live Score */}
            <div className="text-center bg-indigo-500/5 border border-indigo-500/20 rounded-xl px-4 py-2 flex-1 ml-3 relative">
              <div className="text-xs text-indigo-400 font-bold uppercase">Live Editor</div>
              <div className="text-2xl font-black tracking-tight text-white">{animatedScore}%</div>
              
              {/* Green active dot */}
              <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />

              {/* Popup indicator for jumping scores */}
              <AnimatePresence>
                {lastScoreJump && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.8 }}
                    animate={{ opacity: 1, y: -25, scale: 1 }}
                    exit={{ opacity: 0, y: -40, scale: 0.9 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className="absolute -top-4 right-1/4 transform translate-x-1/2 bg-emerald-500 text-white text-[10px] font-black px-2 py-0.5 rounded shadow-[0_0_15px_rgba(16,185,129,0.5)] z-50 whitespace-nowrap"
                  >
                    +{lastScoreJump.jump} ATS
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Simple live progress bar */}
          <div className="flex items-center gap-4 mt-4">
            <div className="flex-1 bg-white/5 rounded-full h-1.5 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-blue-500 to-indigo-500 h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${animatedScore}%` }}
              />
            </div>
            <button 
              onClick={handleResetToAI}
              className="text-[10px] uppercase font-bold text-gray-500 hover:text-red-400 transition-colors whitespace-nowrap"
            >
              Reset to AI Version
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/10 bg-[#0a0a0a] z-10">
        <button 
          onClick={() => setActiveTab('content')}
          className={`flex-1 py-3 text-[10px] font-bold uppercase tracking-wider transition-colors border-b-2 ${
            activeTab === 'content' 
              ? 'border-indigo-500 text-white' 
              : 'border-transparent text-gray-400 hover:text-gray-200'
          }`}
        >
          Content
        </button>
        <button 
          onClick={() => setActiveTab('theme')}
          className={`flex-1 py-3 text-[10px] font-bold uppercase tracking-wider transition-colors border-b-2 flex items-center justify-center gap-1.5 ${
            activeTab === 'theme' 
              ? 'border-blue-500 text-white' 
              : 'border-transparent text-gray-400 hover:text-gray-200'
          }`}
        >
          <LayoutTemplate className="w-3.5 h-3.5" />
          Theme
        </button>
        <button 
          onClick={() => setActiveTab('ai')}
          className={`flex-1 py-3 text-[10px] font-bold uppercase tracking-wider transition-colors border-b-2 flex items-center justify-center gap-1.5 ${
            activeTab === 'ai' 
              ? 'border-purple-500 text-white' 
              : 'border-transparent text-gray-400 hover:text-gray-200'
          }`}
        >
          <Wand2 className="w-3.5 h-3.5 text-purple-400" />
          AI Enhance
        </button>
      </div>

      {/* Collapsible editor quick steps */}
      {editorGuideOpen && (
        <div className="mx-4 mt-3 mb-0 p-3 rounded-xl border border-indigo-500/15 bg-indigo-500/5 relative shrink-0">
          <button
            type="button"
            onClick={dismissEditorGuide}
            className="absolute top-2 right-2 p-1 rounded-lg text-gray-500 hover:text-white hover:bg-white/5"
            aria-label="Dismiss editor guide"
          >
            <X className="w-3.5 h-3.5" />
          </button>
          <p className="text-[10px] font-black uppercase tracking-wider text-indigo-300 flex items-center gap-1.5 mb-2">
            <HelpCircle className="w-3.5 h-3.5" /> Quick steps
          </p>
          <ol className="text-[11px] text-gray-400 space-y-1 list-decimal list-inside pr-6 leading-relaxed">
            <li>Review AI suggestions in the <span className="text-purple-300">AI Enhance</span> tab</li>
            <li>Apply summary or bullet improvements</li>
            <li>Edit content manually in <span className="text-gray-300">Content</span> if needed</li>
            <li>Switch to Preview to check layout</li>
            <li>Export or download when ready</li>
          </ol>
        </div>
      )}

      <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden overscroll-y-contain p-4 pb-[max(6rem,env(safe-area-inset-bottom))] custom-scrollbar">
        <AnimatePresence mode="wait">
          {activeTab === 'content' ? (
            <motion.div 
              key="content-tab"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.15 }}
              className="space-y-4 pb-20"
            >
              {/* 1. PERSONAL INFO SECTION */}
              <div className="border border-white/10 rounded-2xl bg-white/[0.02] overflow-hidden">
                <button 
                  onClick={() => setExpandedSection(expandedSection === 'personalInfo' ? '' : 'personalInfo')}
                  className="w-full flex items-center justify-between p-4 hover:bg-white/[0.02] transition-colors"
                >
                  <span className="font-bold text-sm tracking-wide flex items-center gap-2">
                    <User className="w-4 h-4 text-indigo-400" />
                    Personal Information
                  </span>
                  {expandedSection === 'personalInfo' ? <ChevronDown className="w-4 h-4 text-gray-500" /> : <ChevronRight className="w-4 h-4 text-gray-500" />}
                </button>
                
                {expandedSection === 'personalInfo' && (
                  <div className="p-4 border-t border-white/5 space-y-4 bg-black/30">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Full Name</label>
                        <input 
                          type="text" 
                          value={editorState.content.personalInfo.fullName}
                          onChange={(e) => updateContent(draft => { draft.personalInfo.fullName = e.target.value; })}
                          className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Professional Title</label>
                        <input 
                          type="text" 
                          value={editorState.content.personalInfo.title}
                          onChange={(e) => updateContent(draft => { draft.personalInfo.title = e.target.value; })}
                          className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Email Address</label>
                        <input 
                          type="email" 
                          value={editorState.content.personalInfo.contact.email || ''}
                          onChange={(e) => updateContent(draft => { draft.personalInfo.contact.email = e.target.value; })}
                          className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Phone Number</label>
                        <input 
                          type="text" 
                          value={editorState.content.personalInfo.contact.phone || ''}
                          onChange={(e) => updateContent(draft => { draft.personalInfo.contact.phone = e.target.value; })}
                          className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Location (City, State)</label>
                      <input 
                        type="text" 
                        value={editorState.content.personalInfo.contact.location || ''}
                        onChange={(e) => updateContent(draft => { draft.personalInfo.contact.location = e.target.value; })}
                        className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">LinkedIn URL</label>
                        <input 
                          type="text" 
                          value={editorState.content.personalInfo.contact.linkedin || ''}
                          onChange={(e) => updateContent(draft => { draft.personalInfo.contact.linkedin = e.target.value; })}
                          placeholder="linkedin.com/in/..."
                          className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">GitHub URL</label>
                        <input 
                          type="text" 
                          value={editorState.content.personalInfo.contact.github || ''}
                          onChange={(e) => updateContent(draft => { draft.personalInfo.contact.github = e.target.value; })}
                          placeholder="github.com/..."
                          className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Portfolio/Web</label>
                        <input 
                          type="text" 
                          value={editorState.content.personalInfo.contact.website || ''}
                          onChange={(e) => updateContent(draft => { draft.personalInfo.contact.website = e.target.value; })}
                          placeholder="myportfolio.com"
                          className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* 2. PROFESSIONAL SUMMARY SECTION */}
              <div className="border border-white/10 rounded-2xl bg-white/[0.02] overflow-hidden">
                <button 
                  onClick={() => setExpandedSection(expandedSection === 'summary' ? '' : 'summary')}
                  className="w-full flex items-center justify-between p-4 hover:bg-white/[0.02] transition-colors"
                >
                  <span className="font-bold text-sm tracking-wide flex items-center gap-2">
                    <FileText className="w-4 h-4 text-indigo-400" />
                    Professional Summary
                  </span>
                  {expandedSection === 'summary' ? <ChevronDown className="w-4 h-4 text-gray-500" /> : <ChevronRight className="w-4 h-4 text-gray-500" />}
                </button>
                
                {expandedSection === 'summary' && (
                  <div className="p-4 border-t border-white/5 bg-black/30">
                    <textarea 
                      value={editorState.content.summary}
                      onChange={(e) => updateContent(draft => { draft.summary = e.target.value; })}
                      rows={6}
                      placeholder="Write a powerful executive or tech professional statement..."
                      className="w-full bg-white/[0.03] border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-indigo-500 resize-none leading-relaxed"
                    />
                  </div>
                )}
              </div>

              {/* 3. WORK EXPERIENCE SECTION */}
              <div className="border border-white/10 rounded-2xl bg-white/[0.02] overflow-hidden">
                <button 
                  onClick={() => setExpandedSection(expandedSection === 'experience' ? '' : 'experience')}
                  className="w-full flex items-center justify-between p-4 hover:bg-white/[0.02] transition-colors"
                >
                  <span className="font-bold text-sm tracking-wide flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-indigo-400" />
                    Work Experience ({editorState.content.experience.length})
                  </span>
                  {expandedSection === 'experience' ? <ChevronDown className="w-4 h-4 text-gray-500" /> : <ChevronRight className="w-4 h-4 text-gray-500" />}
                </button>
                
                {expandedSection === 'experience' && (
                  <div className="p-4 border-t border-white/5 space-y-4 bg-black/30">
                    {editorState.content.experience.map((exp, expIdx) => (
                      <div key={exp.id} className="border border-white/5 rounded-xl p-4 bg-black/40 space-y-3 relative group">
                        <button 
                          onClick={() => updateContent(draft => { draft.experience.splice(expIdx, 1); })}
                          className="absolute top-4 right-4 p-1.5 rounded-lg bg-white/5 text-gray-400 hover:bg-red-500/10 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                          title="Remove Job"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        
                        <div className="grid grid-cols-2 gap-3 pr-8">
                          <div>
                            <label className="block text-[9px] font-bold text-gray-500 uppercase mb-0.5">Role / Title</label>
                            <input 
                              type="text" 
                              value={exp.role}
                              onChange={(e) => updateContent(draft => { draft.experience[expIdx].role = e.target.value; })}
                              className="w-full bg-white/[0.02] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white"
                            />
                          </div>
                          <div>
                            <label className="block text-[9px] font-bold text-gray-500 uppercase mb-0.5">Company</label>
                            <input 
                              type="text" 
                              value={exp.company}
                              onChange={(e) => updateContent(draft => { draft.experience[expIdx].company = e.target.value; })}
                              className="w-full bg-white/[0.02] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                          <div>
                            <label className="block text-[9px] font-bold text-gray-500 uppercase mb-0.5">Start Date</label>
                            <input 
                              type="text" 
                              value={exp.startDate}
                              onChange={(e) => updateContent(draft => { draft.experience[expIdx].startDate = e.target.value; })}
                              placeholder="MM/YYYY or Year"
                              className="w-full bg-white/[0.02] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white"
                            />
                          </div>
                          <div>
                            <label className="block text-[9px] font-bold text-gray-500 uppercase mb-0.5">End Date</label>
                            <input 
                              type="text" 
                              value={exp.endDate}
                              onChange={(e) => updateContent(draft => { draft.experience[expIdx].endDate = e.target.value; })}
                              placeholder="Present or MM/YYYY"
                              className="w-full bg-white/[0.02] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white"
                            />
                          </div>
                          <div>
                            <label className="block text-[9px] font-bold text-gray-500 uppercase mb-0.5">Location</label>
                            <input 
                              type="text" 
                              value={exp.location || ''}
                              onChange={(e) => updateContent(draft => { draft.experience[expIdx].location = e.target.value; })}
                              placeholder="City, State"
                              className="w-full bg-white/[0.02] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white"
                            />
                          </div>
                        </div>

                        {/* Bullets List */}
                        <div className="space-y-1.5 mt-2">
                          <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-wide">Key Accomplishments (STAR Method)</label>
                          {exp.bullets.map((bullet, bulletIdx) => (
                            <div key={bulletIdx} className="flex gap-2 items-center">
                              <span className="text-gray-600 font-bold select-none text-[10px]">•</span>
                              <input 
                                type="text"
                                value={bullet}
                                onChange={(e) => updateContent(draft => { draft.experience[expIdx].bullets[bulletIdx] = e.target.value; })}
                                className="flex-1 bg-white/[0.01] border border-white/5 hover:border-white/10 focus:border-indigo-500 rounded px-2 py-1 text-xs text-gray-300 focus:outline-none"
                              />
                              <button 
                                onClick={() => updateContent(draft => { draft.experience[expIdx].bullets.splice(bulletIdx, 1); })}
                                className="text-gray-600 hover:text-red-400 p-1 shrink-0 transition-colors"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                          <button 
                            onClick={() => updateContent(draft => { draft.experience[expIdx].bullets.push('Developed and integrated...'); })}
                            className="mt-2 text-[10px] font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1.5 px-2 py-1 rounded bg-indigo-500/10 border border-indigo-500/20"
                          >
                            <Plus className="w-3 h-3" />
                            Add Accomplishment Bullet
                          </button>
                        </div>
                      </div>
                    ))}
                    
                    <button 
                      onClick={() => updateContent(draft => {
                        draft.experience.push({
                          id: `exp-${Date.now()}`,
                          company: 'New Company',
                          role: 'Software Engineer',
                          startDate: '2025',
                          endDate: 'Present',
                          location: 'San Francisco, CA',
                          bullets: ['Built scalable client microservices.', 'Optimized workflow speeds by 20%.']
                        });
                      })}
                      className="w-full py-2.5 border border-dashed border-white/15 hover:border-white/30 rounded-xl text-xs font-bold text-indigo-400 hover:bg-white/[0.01] flex items-center justify-center gap-1.5 transition-all"
                    >
                      <PlusCircle className="w-4 h-4" />
                      Add Work Experience
                    </button>
                  </div>
                )}
              </div>

              {/* 4. PROJECTS SECTION */}
              <div className="border border-white/10 rounded-2xl bg-white/[0.02] overflow-hidden">
                <button 
                  onClick={() => setExpandedSection(expandedSection === 'projects' ? '' : 'projects')}
                  className="w-full flex items-center justify-between p-4 hover:bg-white/[0.02] transition-colors"
                >
                  <span className="font-bold text-sm tracking-wide flex items-center gap-2">
                    <FolderGit2 className="w-4 h-4 text-indigo-400" />
                    Projects ({editorState.content.projects.length})
                  </span>
                  {expandedSection === 'projects' ? <ChevronDown className="w-4 h-4 text-gray-500" /> : <ChevronRight className="w-4 h-4 text-gray-500" />}
                </button>
                
                {expandedSection === 'projects' && (
                  <div className="p-4 border-t border-white/5 space-y-4 bg-black/30">
                    {editorState.content.projects.length === 0 && (
                      <div className="flex flex-col items-center justify-center py-10 px-4 text-center rounded-xl border border-dashed border-white/10 bg-white/[0.01]">
                        <p className="text-sm font-bold text-gray-300">No projects detected</p>
                        <p className="text-[11px] text-gray-500 mt-1.5 max-w-xs">
                          Projects from your resume will appear here. Add one manually if needed.
                        </p>
                      </div>
                    )}
                    {editorState.content.projects.map((proj, projIdx) => (
                      <div key={proj.id} className="border border-white/5 rounded-xl p-4 bg-black/40 space-y-3 relative group">
                        <button 
                          onClick={() => updateContent(draft => { draft.projects.splice(projIdx, 1); })}
                          className="absolute top-4 right-4 p-1.5 rounded-lg bg-white/5 text-gray-400 hover:bg-red-500/10 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                          title="Remove Project"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>

                        <div className="grid grid-cols-2 gap-3 pr-8">
                          <div>
                            <label className="block text-[9px] font-bold text-gray-500 uppercase mb-0.5">Project Name</label>
                            <input 
                              type="text" 
                              value={proj.name}
                              onChange={(e) => updateContent(draft => { draft.projects[projIdx].name = e.target.value; })}
                              className="w-full bg-white/[0.02] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white"
                            />
                          </div>
                          <div>
                            <label className="block text-[9px] font-bold text-gray-500 uppercase mb-0.5">Project URL / Link</label>
                            <input 
                              type="text" 
                              value={proj.link || ''}
                              onChange={(e) => updateContent(draft => { draft.projects[projIdx].link = e.target.value; })}
                              placeholder="github.com/... or appurl.com"
                              className="w-full bg-white/[0.02] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 gap-3">
                          <div>
                            <label className="block text-[9px] font-bold text-gray-500 uppercase mb-0.5">Short Description</label>
                            <input 
                              type="text" 
                              value={proj.description || ''}
                              onChange={(e) => updateContent(draft => { draft.projects[projIdx].description = e.target.value; })}
                              placeholder="Brief summary of what the project accomplishes"
                              className="w-full bg-white/[0.02] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[9px] font-bold text-gray-500 uppercase mb-0.5">Technologies (Comma Separated)</label>
                          <input 
                            type="text" 
                            value={Array.isArray(proj.technologies) ? proj.technologies.join(', ') : ''}
                            onChange={(e) => updateContent(draft => { 
                              draft.projects[projIdx].technologies = e.target.value.split(',').map((s: string) => s.trim()).filter(Boolean);
                            })}
                            placeholder="React, TypeScript, Node.js"
                            className="w-full bg-white/[0.02] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white"
                          />
                        </div>

                        {/* Project Bullets */}
                        <div className="space-y-1.5 mt-2">
                          <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-wide">Accomplishments</label>
                          {(proj.bullets || []).map((bullet, bulletIdx) => (
                            <div key={bulletIdx} className="flex gap-2 items-center">
                              <span className="text-gray-600 font-bold select-none text-[10px]">•</span>
                              <input 
                                type="text"
                                value={bullet}
                                onChange={(e) => updateContent(draft => { draft.projects[projIdx].bullets[bulletIdx] = e.target.value; })}
                                className="flex-1 bg-white/[0.01] border border-white/5 hover:border-white/10 focus:border-indigo-500 rounded px-2 py-1 text-xs text-gray-300 focus:outline-none"
                              />
                              <button 
                                onClick={() => updateContent(draft => { draft.projects[projIdx].bullets.splice(bulletIdx, 1); })}
                                className="text-gray-600 hover:text-red-400 p-1 shrink-0 transition-colors"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                          <button 
                            onClick={() => updateContent(draft => { 
                              if (!draft.projects[projIdx].bullets) draft.projects[projIdx].bullets = [];
                              draft.projects[projIdx].bullets.push('Architected an open-source library that...'); 
                            })}
                            className="mt-2 text-[10px] font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1.5 px-2 py-1 rounded bg-indigo-500/10 border border-indigo-500/20"
                          >
                            <Plus className="w-3 h-3" />
                            Add Bullet Point
                          </button>
                        </div>
                      </div>
                    ))}

                    <button 
                      onClick={() => updateContent(draft => {
                        draft.projects.push({
                          id: `proj-${Date.now()}`,
                          name: 'New Platform',
                          description: 'Full-stack AI optimization service',
                          link: 'github.com/project',
                          technologies: ['React', 'Next.js'],
                          bullets: ['Leveraged Next.js to deploy dashboard templates.']
                        });
                      })}
                      className="w-full py-2.5 border border-dashed border-white/15 hover:border-white/30 rounded-xl text-xs font-bold text-indigo-400 hover:bg-white/[0.01] flex items-center justify-center gap-1.5 transition-all"
                    >
                      <PlusCircle className="w-4 h-4" />
                      Add Project
                    </button>
                  </div>
                )}
              </div>

              {/* 5. SKILLS SECTION */}
              <div className="border border-white/10 rounded-2xl bg-white/[0.02] overflow-hidden">
                <button 
                  onClick={() => setExpandedSection(expandedSection === 'skills' ? '' : 'skills')}
                  className="w-full flex items-center justify-between p-4 hover:bg-white/[0.02] transition-colors"
                >
                  <span className="font-bold text-sm tracking-wide flex items-center gap-2">
                    <Award className="w-4 h-4 text-indigo-400" />
                    Skills tags
                  </span>
                  {expandedSection === 'skills' ? <ChevronDown className="w-4 h-4 text-gray-500" /> : <ChevronRight className="w-4 h-4 text-gray-500" />}
                </button>
                
                {expandedSection === 'skills' && (
                  <div className="p-4 border-t border-white/5 space-y-4 bg-black/30">
                    {/* Add skill tag */}
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        id="new-skill-input"
                        placeholder="Add a skill (e.g. AWS, Kubernetes)"
                        className="flex-1 bg-white/[0.03] border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            const val = e.currentTarget.value.trim();
                            if (val) {
                              updateContent(draft => {
                                if (Array.isArray(draft.skills)) {
                                  (draft.skills as any[]).push(val);
                                }
                              });
                              e.currentTarget.value = '';
                            }
                          }
                        }}
                      />
                      <button 
                        onClick={() => {
                          const input = document.getElementById('new-skill-input') as HTMLInputElement;
                          const val = input?.value.trim();
                          if (val) {
                            updateContent(draft => {
                              if (Array.isArray(draft.skills)) {
                                (draft.skills as any[]).push(val);
                              }
                            });
                            input.value = '';
                          }
                        }}
                        className="px-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-semibold text-xs flex items-center justify-center transition-colors"
                      >
                        Add Tag
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-2">
                      {Array.isArray(editorState.content.skills) && (editorState.content.skills as any[]).map((skill, index) => {
                        const isFlat = typeof skill === 'string';
                        const label = isFlat ? skill : (skill as any).category || 'Category';

                        return (
                          <div 
                            key={index}
                            className="flex items-center gap-1.5 px-3 py-1 bg-slate-900 border border-white/10 hover:border-white/20 rounded-full text-xs text-gray-300 font-semibold"
                          >
                            <span>{label}</span>
                            <button 
                              onClick={() => updateContent(draft => {
                                draft.skills.splice(index, 1);
                              })}
                              className="text-gray-500 hover:text-red-400 font-black cursor-pointer text-[10px]"
                            >
                              ✕
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* 6. EDUCATION SECTION */}
              <div className="border border-white/10 rounded-2xl bg-white/[0.02] overflow-hidden">
                <button 
                  onClick={() => setExpandedSection(expandedSection === 'education' ? '' : 'education')}
                  className="w-full flex items-center justify-between p-4 hover:bg-white/[0.02] transition-colors"
                >
                  <span className="font-bold text-sm tracking-wide flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-indigo-400" />
                    Education credentials ({editorState.content.education.length})
                  </span>
                  {expandedSection === 'education' ? <ChevronDown className="w-4 h-4 text-gray-500" /> : <ChevronRight className="w-4 h-4 text-gray-500" />}
                </button>
                
                {expandedSection === 'education' && (
                  <div className="p-4 border-t border-white/5 space-y-4 bg-black/30">
                    {editorState.content.education.map((edu, eduIdx) => (
                      <div key={edu.id} className="border border-white/5 rounded-xl p-4 bg-black/40 space-y-3 relative group">
                        <button 
                          onClick={() => updateContent(draft => { draft.education.splice(eduIdx, 1); })}
                          className="absolute top-4 right-4 p-1.5 rounded-lg bg-white/5 text-gray-400 hover:bg-red-500/10 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                          title="Remove Education"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>

                        <div className="grid grid-cols-2 gap-3 pr-8">
                          <div>
                            <label className="block text-[9px] font-bold text-gray-500 uppercase mb-0.5">Institution / School</label>
                            <input 
                              type="text" 
                              value={edu.institution}
                              onChange={(e) => updateContent(draft => { draft.education[eduIdx].institution = e.target.value; })}
                              className="w-full bg-white/[0.02] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white"
                            />
                          </div>
                          <div>
                            <label className="block text-[9px] font-bold text-gray-500 uppercase mb-0.5">Degree Type</label>
                            <input 
                              type="text" 
                              value={edu.degree}
                              onChange={(e) => updateContent(draft => { draft.education[eduIdx].degree = e.target.value; })}
                              placeholder="B.S., M.S., PhD"
                              className="w-full bg-white/[0.02] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                          <div>
                            <label className="block text-[9px] font-bold text-gray-500 uppercase mb-0.5">Field of Study</label>
                            <input 
                              type="text" 
                              value={edu.field || ''}
                              onChange={(e) => updateContent(draft => { draft.education[eduIdx].field = e.target.value; })}
                              placeholder="Computer Science"
                              className="w-full bg-white/[0.02] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white"
                            />
                          </div>
                          <div>
                            <label className="block text-[9px] font-bold text-gray-500 uppercase mb-0.5">GPA (Optional)</label>
                            <input 
                              type="text" 
                              value={edu.gpa || ''}
                              onChange={(e) => updateContent(draft => { draft.education[eduIdx].gpa = e.target.value; })}
                              placeholder="3.8/4.0"
                              className="w-full bg-white/[0.02] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white"
                            />
                          </div>
                          <div>
                            <label className="block text-[9px] font-bold text-gray-500 uppercase mb-0.5">End Date</label>
                            <input 
                              type="text" 
                              value={edu.endDate || ''}
                              onChange={(e) => updateContent(draft => { draft.education[eduIdx].endDate = e.target.value; })}
                              placeholder="Year or Present"
                              className="w-full bg-white/[0.02] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white"
                            />
                          </div>
                        </div>
                      </div>
                    ))}

                    <button 
                      onClick={() => updateContent(draft => {
                        draft.education.push({
                          id: `edu-${Date.now()}`,
                          institution: 'New University',
                          degree: 'B.S.',
                          field: 'Software Engineering',
                          startDate: '2020',
                          endDate: '2024',
                          gpa: '3.7'
                        });
                      })}
                      className="w-full py-2.5 border border-dashed border-white/15 hover:border-white/30 rounded-xl text-xs font-bold text-indigo-400 hover:bg-white/[0.01] flex items-center justify-center gap-1.5 transition-all"
                    >
                      <PlusCircle className="w-4 h-4" />
                      Add Education credentials
                    </button>
                  </div>
                )}
              </div>

              {/* 7. CERTIFICATIONS SECTION */}
              <div className="border border-white/10 rounded-2xl bg-white/[0.02] overflow-hidden">
                <button 
                  onClick={() => setExpandedSection(expandedSection === 'certifications' ? '' : 'certifications')}
                  className="w-full flex items-center justify-between p-4 hover:bg-white/[0.02] transition-colors"
                >
                  <span className="font-bold text-sm tracking-wide flex items-center gap-2">
                    <Award className="w-4 h-4 text-indigo-400" />
                    Certifications ({editorState.content.certifications?.length || 0})
                  </span>
                  {expandedSection === 'certifications' ? <ChevronDown className="w-4 h-4 text-gray-500" /> : <ChevronRight className="w-4 h-4 text-gray-500" />}
                </button>
                
                {expandedSection === 'certifications' && (
                  <div className="p-4 border-t border-white/5 space-y-4 bg-black/30">
                    {(editorState.content.certifications || []).map((cert, certIdx) => (
                      <div key={cert.id} className="border border-white/5 rounded-xl p-4 bg-black/40 space-y-3 relative group">
                        <button 
                          onClick={() => updateContent(draft => { 
                            if (!draft.certifications) draft.certifications = [];
                            draft.certifications.splice(certIdx, 1); 
                          })}
                          className="absolute top-4 right-4 p-1.5 rounded-lg bg-white/5 text-gray-400 hover:bg-red-500/10 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                          title="Remove Certification"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>

                        <div className="grid grid-cols-2 gap-3 pr-8">
                          <div>
                            <label className="block text-[9px] font-bold text-gray-500 uppercase mb-0.5">Cert Name</label>
                            <input 
                              type="text" 
                              value={cert.name}
                              onChange={(e) => updateContent(draft => { 
                                if (draft.certifications) draft.certifications[certIdx].name = e.target.value; 
                              })}
                              className="w-full bg-white/[0.02] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white"
                            />
                          </div>
                          <div>
                            <label className="block text-[9px] font-bold text-gray-500 uppercase mb-0.5">Issuer</label>
                            <input 
                              type="text" 
                              value={cert.issuer}
                              onChange={(e) => updateContent(draft => { 
                                if (draft.certifications) draft.certifications[certIdx].issuer = e.target.value; 
                              })}
                              className="w-full bg-white/[0.02] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-[9px] font-bold text-gray-500 uppercase mb-0.5">Date Issued</label>
                          <input 
                            type="text" 
                            value={cert.date}
                            onChange={(e) => updateContent(draft => { 
                              if (draft.certifications) draft.certifications[certIdx].date = e.target.value; 
                            })}
                            placeholder="MM/YYYY or Year"
                            className="w-full bg-white/[0.02] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white"
                          />
                        </div>
                      </div>
                    ))}

                    <button 
                      onClick={() => updateContent(draft => {
                        if (!draft.certifications) draft.certifications = [];
                        draft.certifications.push({
                          id: `cert-${Date.now()}`,
                          name: 'AWS Solutions Architect',
                          issuer: 'Amazon Web Services',
                          date: '2025'
                        });
                      })}
                      className="w-full py-2.5 border border-dashed border-white/15 hover:border-white/30 rounded-xl text-xs font-bold text-indigo-400 hover:bg-white/[0.01] flex items-center justify-center gap-1.5 transition-all"
                    >
                      <PlusCircle className="w-4 h-4" />
                      Add Certification
                    </button>
                  </div>
                )}
              </div>

              {/* 8. ACHIEVEMENTS & AWARDS SECTION */}
              <div className="border border-white/10 rounded-2xl bg-white/[0.02] overflow-hidden">
                <button 
                  onClick={() => setExpandedSection(expandedSection === 'achievements' ? '' : 'achievements')}
                  className="w-full flex items-center justify-between p-4 hover:bg-white/[0.02] transition-colors"
                >
                  <span className="font-bold text-sm tracking-wide flex items-center gap-2">
                    <Award className="w-4 h-4 text-indigo-400" />
                    Achievements & Awards ({editorState.content.achievements?.length || 0})
                  </span>
                  {expandedSection === 'achievements' ? <ChevronDown className="w-4 h-4 text-gray-500" /> : <ChevronRight className="w-4 h-4 text-gray-500" />}
                </button>
                
                {expandedSection === 'achievements' && (
                  <div className="p-4 border-t border-white/5 space-y-4 bg-black/30">
                    {(editorState.content.achievements || []).map((ach, achIdx) => (
                      <div key={ach.id} className="border border-white/5 rounded-xl p-4 bg-black/40 space-y-3 relative group">
                        <button 
                          onClick={() => updateContent(draft => { 
                            if (!draft.achievements) draft.achievements = [];
                            draft.achievements.splice(achIdx, 1); 
                          })}
                          className="absolute top-4 right-4 p-1.5 rounded-lg bg-white/5 text-gray-400 hover:bg-red-500/10 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                          title="Remove Item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>

                        <div className="grid grid-cols-2 gap-3 pr-8">
                          <div>
                            <label className="block text-[9px] font-bold text-gray-500 uppercase mb-0.5">Title</label>
                            <input 
                              type="text" 
                              value={ach.title}
                              onChange={(e) => updateContent(draft => { 
                                if (draft.achievements) draft.achievements[achIdx].title = e.target.value; 
                              })}
                              className="w-full bg-white/[0.02] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white"
                            />
                          </div>
                          <div>
                            <label className="block text-[9px] font-bold text-gray-500 uppercase mb-0.5">Date / Year</label>
                            <input 
                              type="text" 
                              value={ach.date || ''}
                              onChange={(e) => updateContent(draft => { 
                                if (draft.achievements) draft.achievements[achIdx].date = e.target.value; 
                              })}
                              placeholder="2025"
                              className="w-full bg-white/[0.02] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-[9px] font-bold text-gray-500 uppercase mb-0.5">Description (Optional)</label>
                          <input 
                            type="text" 
                            value={ach.description || ''}
                            onChange={(e) => updateContent(draft => { 
                              if (draft.achievements) draft.achievements[achIdx].description = e.target.value; 
                            })}
                            placeholder="e.g. Placed 1st at hackathon or optimized performance by 40%"
                            className="w-full bg-white/[0.02] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white"
                          />
                        </div>
                      </div>
                    ))}

                    <button 
                      onClick={() => updateContent(draft => {
                        if (!draft.achievements) draft.achievements = [];
                        draft.achievements.push({
                          id: `ach-${Date.now()}`,
                          title: 'New Achievement or Award',
                          date: '2025',
                          description: 'Honored for excellence or achievements.'
                        });
                      })}
                      className="w-full py-2.5 border border-dashed border-white/15 hover:border-white/30 rounded-xl text-xs font-bold text-indigo-400 hover:bg-white/[0.01] flex items-center justify-center gap-1.5 transition-all"
                    >
                      <PlusCircle className="w-4 h-4" />
                      Add Achievement or Award
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          ) : activeTab === 'theme' ? (
            // THEME TAB
            <motion.div 
              key="theme-tab"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.15 }}
              className="space-y-6 pb-20"
            >
              <div className="border border-white/10 rounded-2xl bg-white/[0.02] p-4">
                <h3 className="font-bold text-sm tracking-wide mb-4 text-indigo-400">Typography</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Body Font Family</label>
                    <select
                      value={editorState.theme.fontFamily || 'Inter, sans-serif'}
                      onChange={(e) => setEditorState(prev => prev ? { ...prev, theme: { ...prev.theme, fontFamily: e.target.value } } : null)}
                      className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                    >
                      <option value="Inter, sans-serif" className="bg-[#0a0a0a]">Inter</option>
                      <option value="Roboto, sans-serif" className="bg-[#0a0a0a]">Roboto</option>
                      <option value="Outfit, sans-serif" className="bg-[#0a0a0a]">Outfit</option>
                      <option value="Merriweather, serif" className="bg-[#0a0a0a]">Merriweather (Serif)</option>
                      <option value="JetBrains Mono, monospace" className="bg-[#0a0a0a]">JetBrains Mono</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Heading Font Family</label>
                    <select
                      value={editorState.theme.headingFont || 'Inter, sans-serif'}
                      onChange={(e) => setEditorState(prev => prev ? { ...prev, theme: { ...prev.theme, headingFont: e.target.value } } : null)}
                      className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                    >
                      <option value="Inter, sans-serif" className="bg-[#0a0a0a]">Inter</option>
                      <option value="Outfit, sans-serif" className="bg-[#0a0a0a]">Outfit (Modern)</option>
                      <option value="Montserrat, sans-serif" className="bg-[#0a0a0a]">Montserrat (Bold)</option>
                      <option value="Playfair Display, serif" className="bg-[#0a0a0a]">Playfair Display (Elegant)</option>
                      <option value="Space Grotesk, sans-serif" className="bg-[#0a0a0a]">Space Grotesk (Tech)</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Body Size</label>
                      <select
                        value={editorState.theme.fontSize}
                        onChange={(e) => setEditorState(prev => prev ? { ...prev, theme: { ...prev.theme, fontSize: e.target.value } } : null)}
                        className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                      >
                        <option value="9pt" className="bg-[#0a0a0a]">9pt (Compact)</option>
                        <option value="10pt" className="bg-[#0a0a0a]">10pt (Standard)</option>
                        <option value="11pt" className="bg-[#0a0a0a]">11pt (Large)</option>
                        <option value="12pt" className="bg-[#0a0a0a]">12pt (Extra Large)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Heading Size</label>
                      <select
                        value={editorState.theme.headingSize || '14pt'}
                        onChange={(e) => setEditorState(prev => prev ? { ...prev, theme: { ...prev.theme, headingSize: e.target.value } } : null)}
                        className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                      >
                        <option value="12pt" className="bg-[#0a0a0a]">12pt (Small)</option>
                        <option value="14pt" className="bg-[#0a0a0a]">14pt (Standard)</option>
                        <option value="16pt" className="bg-[#0a0a0a]">16pt (Large)</option>
                        <option value="18pt" className="bg-[#0a0a0a]">18pt (Extra Large)</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Layout & Spacing */}
              <div className="border border-white/10 rounded-2xl bg-white/[0.02] p-4">
                <h3 className="font-bold text-sm tracking-wide mb-4 text-indigo-400">Layout & Spacing</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Resume Layout</label>
                    <div className="flex bg-black/40 rounded-xl p-1 border border-white/5">
                      <button 
                        onClick={() => setEditorState(prev => prev ? { ...prev, theme: { ...prev.theme, layout: 'one-column' } } : null)}
                        className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors ${editorState.theme.layout === 'one-column' ? 'bg-indigo-500 text-white' : 'text-gray-500 hover:text-gray-300'}`}
                      >
                        Single Column
                      </button>
                      <button 
                        onClick={() => setEditorState(prev => prev ? { ...prev, theme: { ...prev.theme, layout: 'two-column' } } : null)}
                        className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors ${editorState.theme.layout === 'two-column' ? 'bg-indigo-500 text-white' : 'text-gray-500 hover:text-gray-300'}`}
                      >
                        Two Column
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Density (Overall)</label>
                      <select
                        value={editorState.theme.spacing}
                        onChange={(e) => setEditorState(prev => prev ? { ...prev, theme: { ...prev.theme, spacing: e.target.value } } : null)}
                        className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                      >
                        <option value="1.2" className="bg-[#0a0a0a]">Compact</option>
                        <option value="1.5" className="bg-[#0a0a0a]">Normal</option>
                        <option value="1.8" className="bg-[#0a0a0a]">Relaxed</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Line Height</label>
                      <select
                        value={editorState.theme.lineHeight || '1.5'}
                        onChange={(e) => setEditorState(prev => prev ? { ...prev, theme: { ...prev.theme, lineHeight: e.target.value } } : null)}
                        className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                      >
                        <option value="1.2" className="bg-[#0a0a0a]">Tight (1.2)</option>
                        <option value="1.5" className="bg-[#0a0a0a]">Normal (1.5)</option>
                        <option value="1.8" className="bg-[#0a0a0a]">Loose (1.8)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Page Margin</label>
                      <select
                        value={editorState.theme.pageMargin || '24px'}
                        onChange={(e) => setEditorState(prev => prev ? { ...prev, theme: { ...prev.theme, pageMargin: e.target.value } } : null)}
                        className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                      >
                        <option value="12px" className="bg-[#0a0a0a]">Narrow</option>
                        <option value="24px" className="bg-[#0a0a0a]">Standard</option>
                        <option value="36px" className="bg-[#0a0a0a]">Wide</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Section Spacing</label>
                      <select
                        value={editorState.theme.sectionSpacing || '16px'}
                        onChange={(e) => setEditorState(prev => prev ? { ...prev, theme: { ...prev.theme, sectionSpacing: e.target.value } } : null)}
                        className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                      >
                        <option value="8px" className="bg-[#0a0a0a]">Compact</option>
                        <option value="16px" className="bg-[#0a0a0a]">Standard</option>
                        <option value="24px" className="bg-[#0a0a0a]">Relaxed</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border border-white/10 rounded-2xl bg-white/[0.02] p-4">
                <h3 className="font-bold text-sm tracking-wide mb-4 text-indigo-400">Colors</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Primary Color</label>
                    <div className="flex gap-2 items-center">
                      <input 
                        type="color" 
                        value={editorState.theme.primaryColor || '#1f2937'}
                        onChange={(e) => setEditorState(prev => prev ? { ...prev, theme: { ...prev.theme, primaryColor: e.target.value } } : null)}
                        className="w-8 h-8 rounded cursor-pointer border-0 p-0 bg-transparent"
                      />
                      <input 
                        type="text" 
                        value={editorState.theme.primaryColor || '#1f2937'}
                        onChange={(e) => setEditorState(prev => prev ? { ...prev, theme: { ...prev.theme, primaryColor: e.target.value } } : null)}
                        className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-2 py-1.5 text-xs text-white uppercase focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Text Color</label>
                    <div className="flex gap-2 items-center">
                      <input 
                        type="color" 
                        value={editorState.theme.textColor}
                        onChange={(e) => setEditorState(prev => prev ? { ...prev, theme: { ...prev.theme, textColor: e.target.value } } : null)}
                        className="w-8 h-8 rounded cursor-pointer border-0 p-0 bg-transparent"
                      />
                      <input 
                        type="text" 
                        value={editorState.theme.textColor}
                        onChange={(e) => setEditorState(prev => prev ? { ...prev, theme: { ...prev.theme, textColor: e.target.value } } : null)}
                        className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-2 py-1.5 text-xs text-white uppercase focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            // AI COPILOT TAB
            <motion.div 
              key="ai-tab"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.15 }}
              className="space-y-6 pb-8 min-h-0"
            >
              {/* Summary Enhancement */}
              <div className="p-5 rounded-2xl border border-purple-500/20 bg-purple-500/5 relative">
                <div className="absolute top-0 right-0 p-4 opacity-5"><Wand2 className="w-20 h-20 text-purple-400" /></div>
                
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-sm font-bold text-white flex items-center gap-1">
                    <Sparkles className="w-4 h-4 text-purple-400" />
                    AI Summary Optimization
                  </h3>
                  <span className="px-2 py-0.5 bg-purple-500/20 text-purple-400 text-[9px] uppercase font-bold rounded-full">ATS Premium</span>
                </div>
                
                <p className="text-xs text-gray-400 leading-relaxed mb-4">
                  Based on your parsing profile and semantic skills, we recommend this high-impact summary rewrite.
                </p>
                
                <div className="bg-black/60 p-4 rounded-xl border border-white/5 mb-4 text-xs leading-relaxed text-gray-300 font-sans text-justify">
                  {getOptimizedSummaryText() || "No summary rewrite optimizations available."}
                </div>

                {analysis.optimization?.summary_rewrite?.recruiter_impact && (
                  <div className="mb-4 p-3 bg-blue-500/10 rounded-xl border border-blue-500/20 text-xs text-blue-200">
                    <span className="font-bold text-blue-400 uppercase tracking-wide">AI Rationale:</span> {analysis.optimization.summary_rewrite.recruiter_impact}
                  </div>
                )}
                
                <button 
                  onClick={applyAISummary}
                  disabled={!getOptimizedSummaryText() || summaryApplying}
                  className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
                >
                  <Wand2 className="w-3.5 h-3.5" />
                  {summaryApplying ? 'Applying…' : summaryApplied ? 'Re-apply AI Summary' : 'Apply AI Rewrite to Summary'}
                </button>
                {summaryApplied && (
                  <p className="text-[10px] text-emerald-400 font-semibold text-center mt-2 flex items-center justify-center gap-1">
                    <Check className="w-3 h-3" /> Summary applied — see Content tab & preview
                  </p>
                )}
              </div>

              {/* STAR-Method Bullet Enhancements */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-400" />
                  STAR Bullet Accomplishment Optimizer
                </h3>
                <p className="text-xs text-gray-500 leading-normal">
                  Click **Apply to Resume** to instantly swap weak bullets inside your Work Experience or Projects list with these data-backed STAR sentences.
                </p>

                {Array.isArray(analysis.optimization?.bullet_optimizations) && analysis.optimization.bullet_optimizations.length > 0 ? (
                  <div className="space-y-3.5">
                    {analysis.optimization.bullet_optimizations.map((b: any, i: number) => {
                      const isApplied = isBulletOptimized(b.original, b.optimized);
                      const isApplying = applyingBulletKey === `bullet-${i}`;
                      const failed = bulletApplyFailed[i];
                      
                      return (
                        <div key={i} className="border border-white/10 rounded-2xl bg-[#121212] flex flex-col shrink-0">
                          <div className="p-3.5 bg-red-500/5 border-b border-white/5">
                            <span className="text-[9px] font-bold text-red-400 uppercase tracking-widest block mb-1">Original wording</span>
                            <p className="text-xs text-gray-500 line-through decoration-red-500/30 leading-relaxed font-sans">{b.original}</p>
                          </div>
                          
                          <div className="p-3.5 bg-emerald-500/5 relative flex-1">
                            <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest block mb-1 flex items-center justify-between">
                              Optimized bullet
                              {b.quantifiable_metric_added && (
                                <span className="px-1.5 py-0.5 bg-emerald-500/20 text-emerald-400 rounded text-[8px] tracking-normal font-bold">Quantified Outcome</span>
                              )}
                            </span>
                            <p className="text-xs text-gray-200 leading-relaxed font-sans text-justify mb-3">{b.optimized}</p>
                            
                            <div className="flex flex-col gap-2 pt-2 border-t border-white/5">
                              {failed && (
                                <p className="text-[10px] text-amber-300/90 leading-relaxed">
                                  Couldn&apos;t auto-match this bullet. Please copy it manually.
                                </p>
                              )}
                              <div className="flex flex-wrap justify-end gap-2">
                              {isApplied ? (
                                <div className="flex items-center gap-1 text-emerald-400 text-xs font-bold py-1.5 px-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 select-none">
                                  <Check className="w-3.5 h-3.5" />
                                  Applied to Resume
                                </div>
                              ) : (
                                <button 
                                  type="button"
                                  onClick={() => handleApplyBullet(i, b.original, b.optimized)}
                                  disabled={!!applyingBulletKey}
                                  className="flex items-center gap-1.5 px-3 py-2 min-h-[36px] bg-white hover:bg-gray-200 text-black rounded-lg text-xs font-bold transition-all active:scale-[0.97] disabled:opacity-50"
                                >
                                  <Wand2 className="w-3.5 h-3.5" />
                                  {isApplying ? 'Applying…' : 'Apply to Resume'}
                                </button>
                              )}
                              {(failed || !isApplied) && b.optimized && (
                                <button
                                  type="button"
                                  onClick={() => copyOptimizedBullet(b.optimized)}
                                  className="flex items-center gap-1.5 px-3 py-2 min-h-[36px] rounded-lg text-xs font-bold border border-white/15 text-gray-300 hover:bg-white/5"
                                >
                                  <Copy className="w-3.5 h-3.5" />
                                  Copy optimized bullet
                                </button>
                              )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-6 border border-dashed border-white/10 rounded-2xl text-center text-gray-500 text-xs">
                    No weak bullets identified for STAR enhancements. Your achievements are already strong!
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
