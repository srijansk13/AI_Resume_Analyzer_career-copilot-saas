'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { 
  LayoutDashboard, Sparkles, Briefcase, User, 
  Compass, MessageSquare, Download, Command as CmdIcon, Bot, Menu, X,
  RefreshCw, Loader2, Target, HelpCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CommandPalette } from '@/components/dashboard/workspace/CommandPalette';
import { AIFloatingDock } from '@/components/dashboard/workspace/AIFloatingDock';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

// Lazy loaded modules to ensure blazing fast shell load times
const OverviewModule = dynamic(() => import('@/components/dashboard/workspace/OverviewModule'), { 
  loading: () => <ModuleSkeleton />
});
const OptimizationModule = dynamic(() => import('@/components/dashboard/workspace/OptimizationModule'), { 
  loading: () => <ModuleSkeleton />
});
const SkillsModule = dynamic(() => import('@/components/dashboard/workspace/SkillsModule'), { 
  loading: () => <ModuleSkeleton />
});
const RecruiterModule = dynamic(() => import('@/components/dashboard/workspace/RecruiterModule'), { 
  loading: () => <ModuleSkeleton />
});
const RoadmapModule = dynamic(() => import('@/components/dashboard/workspace/RoadmapModule'), { 
  loading: () => <ModuleSkeleton />
});
const InterviewModule = dynamic(() => import('@/components/dashboard/workspace/InterviewModule'), { 
  loading: () => <ModuleSkeleton />
});

function ModuleSkeleton() {
  return (
    <div className="w-full h-[500px] bg-white/[0.02] border border-white/5 rounded-3xl animate-pulse flex items-center justify-center">
      <div className="flex flex-col items-center space-y-4">
        <div className="w-8 h-8 rounded-full border-4 border-t-blue-500 border-white/10 animate-spin" />
        <span className="text-sm text-gray-500">Loading Module Intelligence...</span>
      </div>
    </div>
  );
}

const NAV_ITEMS = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'optimization', label: 'Optimization', icon: Sparkles },
  { id: 'skills', label: 'Skills & Keywords', icon: Briefcase },
  { id: 'recruiter', label: 'Recruiter Simulation', icon: User },
  { id: 'roadmap', label: 'Career Roadmap', icon: Compass },
  { id: 'interview', label: 'Interview Prep', icon: MessageSquare },
];

const LOADING_MESSAGES = [
  'Analyzing resume structure...',
  'Extracting skills and experience...',
  'Evaluating ATS compatibility...',
  'Comparing against market expectations...',
  'Generating recruiter insights...',
  'Calculating keyword relevance...',
  'Building improvement roadmap...',
  'Generating AI recommendations...',
  'Finalizing analysis...',
];

const TARGET_ROLES = [
  'Frontend Developer',
  'Full Stack Developer',
  'Backend Developer',
  'Data Analyst',
  'ML Engineer',
  'Product Manager',
  'UI/UX Designer'
];

export default function AnalysisClient({ analysis, resume }: { analysis: any, resume: any }) {
  const [mounted, setMounted] = useState(false);
  const [activeModule, setActiveModule] = useState('overview');
  const [cmdOpen, setCmdOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAnalysisMenuOpen, setIsAnalysisMenuOpen] = useState(false);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [selectedRole, setSelectedRole] = useState(analysis?.targetRole || 'Full Stack Developer');
  
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [loadingTextIndex, setLoadingTextIndex] = useState(0);
  const refreshLockRef = useRef<boolean>(false);
  const [analysisGuideOpen, setAnalysisGuideOpen] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined' && localStorage.getItem('dismissedAnalysisGuide') === '1') {
      setAnalysisGuideOpen(false);
    }
  }, []);

  const handleRefresh = async (roleOverride?: string) => {
    if (refreshing || refreshLockRef.current) return;
    refreshLockRef.current = true;
    setRefreshing(true);
    setLoadingTextIndex(0);

    const targetRoleToUse = roleOverride || selectedRole;

    const interval = setInterval(() => {
      setLoadingTextIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
    }, 2500);

    toast.info('Bypassing cache and running premium re-analysis...', { id: 'refresh' });

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          resumeId: resume._id || resume.id,
          forceReanalyze: true,
          targetRole: targetRoleToUse,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to refresh analysis');
      }

      toast.success('AI Analysis refreshed successfully!', { id: 'refresh' });
      router.push(`/dashboard/analysis/${data.analysisId}`);
    } catch (err: any) {
      console.error('[Refresh] Error:', err);
      toast.error(`Refresh failed: ${err.message}`, { id: 'refresh' });
    } finally {
      clearInterval(interval);
      setRefreshing(false);
      refreshLockRef.current = false;
    }
  };

  const handleExport = () => {
    toast.info('Premium PDF export is currently being finalized.', {
      description: 'Use the Live Resume Editor to customize, style, and print your resume as a pixel-perfect PDF.',
      duration: 5000,
    });
  };

  useEffect(() => {
    setMounted(true);
    // Restore state from memory
    const saved = localStorage.getItem('activeWorkspaceModule');
    if (saved && NAV_ITEMS.some(n => n.id === saved)) {
      setActiveModule(saved);
    }

    // Save active resume session on dashboard analysis page load
    if (analysis && resume) {
      const activeResume = {
        analysisId: String(analysis._id || analysis.id || ''),
        resumeId: String(resume._id || resume.id || ''),
        title: String(resume.title || 'Untitled Resume')
      };
      localStorage.setItem('activeResume', JSON.stringify(activeResume));
      if (process.env.NODE_ENV !== 'production') {
        console.log("[ActiveResume] Updated:", activeResume);
      }
    }
    
    // Fetch user
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setUser(data.user);
        }
      })
      .catch(console.error);
  }, [analysis, resume]);

  const handleModuleChange = (id: string) => {
    setActiveModule(id);
    localStorage.setItem('activeWorkspaceModule', id);
    setMobileMenuOpen(false);
  };

  if (!mounted) return null;

  // Deriving the single main ATS score variable
  const derivedMainAtsScore = typeof analysis?.ats?.overall_ats_score === 'number'
    ? analysis.ats.overall_ats_score
    : (typeof analysis?.ats?.score === 'number' ? analysis.ats.score : 85);
  const displayAtsScore = derivedMainAtsScore;

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col md:flex-row pt-16">
      
      {/* Mobile Sticky Analysis Menu Bar */}
      <div className="md:hidden sticky top-0 z-40 bg-slate-950/80 backdrop-blur-2xl border-b border-white/[0.05] px-4 py-2 flex items-center justify-between shadow-xl shadow-black/20">
        <button
          onClick={() => setIsAnalysisMenuOpen(true)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-bold text-xs outline-none"
        >
          <Menu className="w-4 h-4" />
          <span>Analysis Menu</span>
        </button>
        <span className="text-[10px] uppercase font-black text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full flex items-center gap-1">
          <Target className="w-3 h-3" />
          ATS {displayAtsScore}%
        </span>
      </div>

        {/* Sidebar Navigation */}
      <aside className="hidden md:flex sticky top-16 h-[calc(100vh-4rem)] w-64 bg-slate-900/30 backdrop-blur-xl border-r border-white/5 flex-col z-40">
        {/* Profile Card */}
        <div className="p-6 pb-4 border-b border-white/5">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center shrink-0">
              <span className="text-blue-400 font-bold text-sm">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {user?.name || 'Career Builder'}
              </p>
              <p className="text-xs text-gray-400 truncate">
                {user?.email || 'Set up your profile'}
              </p>
            </div>
          </div>
        </div>

        {analysisGuideOpen && (
          <div className="mx-4 mt-4 p-3 rounded-xl border border-blue-500/15 bg-blue-500/5 relative">
            <button
              type="button"
              onClick={() => {
                setAnalysisGuideOpen(false);
                localStorage.setItem('dismissedAnalysisGuide', '1');
              }}
              className="absolute top-2 right-2 p-1 rounded-lg text-gray-500 hover:text-white hover:bg-white/5"
              aria-label="Dismiss guide"
            >
              <X className="w-3.5 h-3.5" />
            </button>
            <p className="text-[10px] font-black uppercase tracking-wider text-blue-300 flex items-center gap-1.5 mb-2">
              <HelpCircle className="w-3.5 h-3.5" /> How to use this analysis
            </p>
            <ol className="text-[11px] text-gray-400 space-y-1 list-decimal list-inside pr-4 leading-relaxed">
              <li>Review your ATS score in Overview</li>
              <li>Check missing skills in Skills &amp; Keywords</li>
              <li>Open Optimization for rewrites</li>
              <li>Edit your resume live in the editor</li>
              <li>Re-analyze after major changes</li>
            </ol>
          </div>
        )}

        <div className="p-6 pb-2">
          <h2 className="text-xs uppercase tracking-widest text-gray-500 font-bold mb-4">Intelligence Modules</h2>
          <nav className="space-y-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = activeModule === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleModuleChange(item.id)}
                  className={`w-full flex items-center px-3 py-2.5 rounded-xl transition-all duration-200 text-sm font-medium relative group
                    ${isActive ? 'text-white bg-white/10' : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'}`}
                >
                  <Icon className={`w-4 h-4 mr-3 transition-colors ${isActive ? 'text-blue-400' : 'text-gray-500 group-hover:text-gray-300'}`} />
                  {item.label}
                  {isActive && (
                    <motion.div layoutId="activeNav" className="absolute inset-0 rounded-xl border border-white/10 bg-white/5 -z-10" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="mt-auto p-6 space-y-3">
          <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 mb-4">
            <p className="text-xs text-blue-300 font-medium flex items-center mb-1">
              <CmdIcon className="w-3 h-3 mr-1" /> Quick Commands
            </p>
            <p className="text-[10px] text-blue-400/70 mb-3">Press Cmd+K to open palette</p>
            <Button 
              size="sm" 
              onClick={() => setCmdOpen(true)}
              className="w-full bg-blue-600/20 hover:bg-blue-600/40 text-blue-300 border border-blue-500/30 rounded-lg text-xs"
            >
              Open Command Palette
            </Button>
          </div>

          <div className="space-y-4">
            {/* Quick Stats Placeholder */}
            <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl">
              <h3 className="text-[10px] uppercase text-gray-500 font-bold mb-2">Intelligence</h3>
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-gray-400">ATS Score</span>
                <span className="text-xs text-green-400 font-medium">{displayAtsScore}%</span>
              </div>
              <div className="w-full bg-white/5 rounded-full h-1">
                <div className="bg-green-500 h-1 rounded-full" style={{ width: `${displayAtsScore}%` }}></div>
              </div>
            </div>

            {/* AI Usage Placeholder */}
            <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl flex items-center justify-between">
              <div>
                <h3 className="text-[10px] uppercase text-gray-500 font-bold">AI Engine</h3>
                <p className="text-xs text-gray-400 mt-1">AI Intelligence</p>
              </div>
              <Bot className="w-4 h-4 text-blue-500" />
            </div>
          </div>
        </div>
      </aside>

      {/* Main Workspace Area */}
      <main className="flex-1 p-4 md:p-8 overflow-x-hidden min-h-screen">
        <div className="w-full max-w-7xl mx-auto space-y-8 pb-32 mobile-safe-bottom">
          
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-3 md:gap-4 mb-2 md:mb-0">
            <div className="w-full md:w-auto flex justify-between items-start">
              <div>
                <div className="hidden md:flex items-center space-x-2 text-xs text-gray-400 mb-2">
                  <span>Workspace</span>
                  <span className="text-gray-600">/</span>
                  <span className="text-white capitalize">{activeModule.replace('_', ' ')}</span>
                </div>
                <h1 className="text-lg md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 line-clamp-1 max-w-[220px] md:max-w-none">
                  {resume.title || 'Untitled Resume'}
                </h1>
              </div>
            </div>
            
            <div className="flex items-center justify-between w-full md:w-auto gap-2">
              {/* Target Role Dropdown */}
              <div className="flex-1 md:flex-none flex items-center space-x-2 bg-slate-900/60 border border-white/5 rounded-full px-3 md:px-4 py-1.5 md:py-2 hover:border-white/10 transition-all justify-between md:justify-start">
                <div className="flex items-center">
                  <Target className="w-3.5 h-3.5 text-indigo-400 mr-1 md:mr-2" />
                  <span className="hidden md:inline text-[10px] font-black uppercase tracking-wider text-gray-400">Targeting:</span>
                </div>
                <select
                  value={selectedRole}
                  onChange={(e) => {
                    const newRole = e.target.value;
                    setSelectedRole(newRole);
                    handleRefresh(newRole);
                  }}
                  className="bg-transparent text-[11px] md:text-xs text-white font-bold focus:outline-none cursor-pointer w-full md:w-auto truncate pr-2"
                >
                  {TARGET_ROLES.map(role => (
                    <option key={role} value={role} className="bg-slate-950 text-white font-semibold">
                      {role}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-2 shrink-0">
                <Link href={`/dashboard/editor/${analysis._id || analysis.id}`}>
                  <Button className="bg-blue-600 hover:bg-blue-500 text-white rounded-full text-xs h-8 md:h-9 px-4 shadow-lg shadow-blue-600/20">
                    Edit
                  </Button>
                </Link>
                <div className="md:hidden">
                  <Button 
                    onClick={() => setIsMoreMenuOpen(true)}
                    variant="outline" 
                    className="border-white/10 bg-white/5 text-gray-300 hover:text-white rounded-full text-xs h-8 w-8 p-0"
                  >
                    <Menu className="w-3.5 h-3.5" />
                  </Button>
                </div>
                
                <div className="hidden md:flex gap-2">
                  <Button 
                    onClick={() => handleRefresh()}
                    disabled={refreshing}
                    variant="outline"
                    className="border-blue-500/30 bg-blue-500/5 hover:bg-blue-500/10 text-blue-400 disabled:opacity-50 rounded-full text-xs h-9"
                  >
                    {refreshing ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <RefreshCw className="w-4 h-4" />
                    )}
                    <span className="ml-2">Refresh AI Analysis</span>
                  </Button>
                  <Button 
                    onClick={handleExport}
                    variant="outline" 
                    className="border-white/10 bg-white/5 text-gray-300 hover:text-white rounded-full text-xs h-9 px-4"
                  >
                    <Download className="w-4 h-4 mr-2" /> 
                    <span>Export</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {analysisGuideOpen && (
            <div className="md:hidden p-4 rounded-2xl border border-blue-500/15 bg-blue-500/5 relative">
              <button
                type="button"
                onClick={() => {
                  setAnalysisGuideOpen(false);
                  localStorage.setItem('dismissedAnalysisGuide', '1');
                }}
                className="absolute top-3 right-3 p-1 rounded-lg text-gray-500 hover:text-white"
                aria-label="Dismiss guide"
              >
                <X className="w-3.5 h-3.5" />
              </button>
              <p className="text-[10px] font-black uppercase tracking-wider text-blue-300 flex items-center gap-1.5 mb-2">
                <HelpCircle className="w-3.5 h-3.5" /> How to use this analysis
              </p>
              <ol className="text-xs text-gray-400 space-y-1 list-decimal list-inside pr-6">
                <li>Review ATS score → Overview</li>
                <li>Skills gaps → Skills &amp; Keywords</li>
                <li>Rewrites → Optimization</li>
                <li>Live edits → Edit Resume</li>
              </ol>
            </div>
          )}

          {/* Dynamic Module Area */}
          <div className="relative min-h-[500px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeModule}
                initial={{ opacity: 0, y: 10, filter: 'blur(4px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: -10, filter: 'blur(4px)' }}
                transition={{ duration: 0.2 }}
                className="w-full"
              >
                {activeModule === 'overview' && <OverviewModule analysis={analysis} />}
                {activeModule === 'optimization' && <OptimizationModule analysis={analysis} />}
                {activeModule === 'skills' && <SkillsModule analysis={analysis} />}
                {activeModule === 'recruiter' && <RecruiterModule analysis={analysis} />}
                {activeModule === 'roadmap' && <RoadmapModule analysis={analysis} />}
                {activeModule === 'interview' && <InterviewModule analysis={analysis} />}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Next Best Actions Panel */}
          <div className="hidden md:block bg-[#0a0a0f]/80 backdrop-blur-xl border border-white/[0.06] rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
            {/* Ambient glows */}
            <div className="absolute top-0 left-1/4 w-[300px] h-[300px] bg-blue-500/5 rounded-full blur-[80px] pointer-events-none" />
            <div className="absolute bottom-0 right-1/4 w-[250px] h-[250px] bg-purple-500/5 rounded-full blur-[65px] pointer-events-none" />
            
            <div className="relative z-10 space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-indigo-400 animate-pulse" />
                    Next Best Actions
                  </h2>
                  <p className="text-xs text-gray-400 mt-1">
                    Accelerate your job search and boost your profile with these real-time, AI-powered optimizations.
                  </p>
                </div>
                <div className="text-[10px] uppercase font-bold tracking-widest text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-1 rounded-full shrink-0 self-start md:self-center">
                  Recommended Workflow
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                
                {/* 1. Edit Resume */}
                <button
                  onClick={() => {
                    const analysisId = analysis?._id || analysis?.id;
                    if (!analysisId) {
                      toast.error("Analysis context unavailable.");
                      return;
                    }
                    console.log("[Next Best Actions] Opening editor for analysis:", analysisId);
                    router.push(`/dashboard/editor/${analysisId}`);
                  }}
                  className="group p-5 bg-white/[0.02] hover:bg-white/[0.04] border border-white/5 hover:border-blue-500/30 rounded-2xl text-left transition-all duration-300 flex flex-col justify-between h-40 shadow-xl hover:shadow-[0_0_25px_-5px_rgba(59,130,246,0.15)] cursor-pointer relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-[80px] h-[80px] bg-blue-500/5 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="p-3 bg-blue-500/10 rounded-xl w-fit text-blue-400 group-hover:scale-110 transition-transform duration-300">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white group-hover:text-blue-300 transition-colors">Edit Resume</h3>
                    <p className="text-[11px] text-gray-500 mt-1.5 line-clamp-2">
                      Make live modifications and fine-tune your resume with our smart 3-panel workspace.
                    </p>
                  </div>
                </button>

                {/* 2. Match with Job Description */}
                <button
                  onClick={() => {
                    const analysisId = analysis?._id || analysis?.id;
                    const resumeId = resume?._id || resume?.id;
                    if (!analysisId || !resumeId) {
                      toast.error("Resume context unavailable.");
                      return;
                    }
                    console.log("[Next Best Actions] Saving active resume context:", {
                      analysisId,
                      resumeId,
                      name: analysis?.parsedData?.name,
                      atsScore: displayAtsScore
                    });
                    localStorage.setItem(
                      "activeResume",
                      JSON.stringify({
                        analysisId,
                        resumeId,
                        name: analysis?.parsedData?.name,
                        atsScore: displayAtsScore
                      })
                    );
                    console.log("[Next Best Actions] Redirecting to Job Match");
                    router.push("/dashboard/job-match");
                  }}
                  className="group p-5 bg-white/[0.02] hover:bg-white/[0.04] border border-white/5 hover:border-purple-500/30 rounded-2xl text-left transition-all duration-300 flex flex-col justify-between h-40 shadow-xl hover:shadow-[0_0_25px_-5px_rgba(168,85,247,0.15)] cursor-pointer relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-[80px] h-[80px] bg-purple-500/5 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="p-3 bg-purple-500/10 rounded-xl w-fit text-purple-400 group-hover:scale-110 transition-transform duration-300">
                    <Briefcase className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors">Match Job Description</h3>
                    <p className="text-[11px] text-gray-500 mt-1.5 line-clamp-2">
                      Compare your resume side-by-side with target roles to bridge critical keyword gaps.
                    </p>
                  </div>
                </button>

                {/* 3. Refresh AI Analysis */}
                <button
                  onClick={() => handleRefresh()}
                  disabled={refreshing}
                  className="group p-5 bg-white/[0.02] hover:bg-white/[0.04] border border-white/5 hover:border-emerald-500/30 rounded-2xl text-left transition-all duration-300 flex flex-col justify-between h-40 shadow-xl hover:shadow-[0_0_25px_-5px_rgba(16,185,129,0.15)] disabled:opacity-50 relative overflow-hidden text-ellipsis"
                >
                  <div className="absolute top-0 right-0 w-[80px] h-[80px] bg-emerald-500/5 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="p-3 bg-emerald-500/10 rounded-xl w-fit text-emerald-400 group-hover:scale-110 transition-transform duration-300">
                    {refreshing ? <Loader2 className="w-5 h-5 animate-spin" /> : <RefreshCw className="w-5 h-5" />}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors">
                      {refreshing ? 'Refreshing...' : 'Refresh AI Analysis'}
                    </h3>
                    <p className="text-[11px] text-gray-500 mt-1.5 line-clamp-2">
                      {refreshing ? LOADING_MESSAGES[loadingTextIndex] : 'Re-run full analyzer to generate fresh compatibility indexes.'}
                    </p>
                  </div>
                </button>

                {/* 4. View Optimization Suggestions */}
                <button
                  onClick={() => {
                    handleModuleChange('optimization');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="group p-5 bg-white/[0.02] hover:bg-white/[0.04] border border-white/5 hover:border-orange-500/30 rounded-2xl text-left transition-all duration-300 flex flex-col justify-between h-40 shadow-xl hover:shadow-[0_0_25px_-5px_rgba(249,115,22,0.15)] relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-[80px] h-[80px] bg-orange-500/5 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="p-3 bg-orange-500/10 rounded-xl w-fit text-orange-400 group-hover:scale-110 transition-transform duration-300">
                    <Compass className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white group-hover:text-orange-300 transition-colors">View Optimizations</h3>
                    <p className="text-[11px] text-gray-500 mt-1.5 line-clamp-2">
                      Inspect structural and phrasing suggestions designed to pass demanding ATS rules.
                    </p>
                  </div>
                </button>

              </div>
            </div>
          </div>

        </div>
      </main>

      {/* Global AI Systems */}
      <CommandPalette open={cmdOpen} setOpen={setCmdOpen} setActiveModule={handleModuleChange} />
      
      {/* Mobile Analysis Menu Drawer */}
      <AnimatePresence>
        {isAnalysisMenuOpen && (
          <div className="fixed inset-0 z-50 flex items-stretch justify-start bg-black/60 backdrop-blur-md md:hidden">
            <motion.div
              initial={{ opacity: 0, x: "-100%" }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: "-100%" }}
              transition={{ type: "spring", stiffness: 400, damping: 40 }}
              className="w-[85%] max-w-sm bg-[#0a0a0f]/95 backdrop-blur-3xl border-r border-white/10 shadow-2xl overflow-hidden flex flex-col h-full relative"
            >
              {/* Premium Background Glows */}
              <div className="absolute top-0 left-0 w-[200px] h-[200px] bg-blue-500/10 rounded-full blur-[80px] pointer-events-none" />
              <div className="absolute bottom-0 right-0 w-[200px] h-[200px] bg-purple-500/10 rounded-full blur-[80px] pointer-events-none" />

              <div className="px-6 py-5 flex items-center justify-between border-b border-white/[0.04] relative z-10">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center shrink-0">
                    <Sparkles className="w-4 h-4 text-indigo-400" />
                  </div>
                  <h3 className="text-base font-black text-white tracking-wide">Analysis Menu</h3>
                </div>
                <button
                  onClick={() => setIsAnalysisMenuOpen(false)}
                  className="p-2 bg-white/5 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-all duration-200"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto px-5 py-6 space-y-8 hide-scrollbar mobile-safe-bottom relative z-10">
                
                {/* Modules */}
                <div className="space-y-1.5">
                  <h4 className="text-[10px] uppercase font-black tracking-widest text-gray-500 ml-2 mb-3">Intelligence Modules</h4>
                  {NAV_ITEMS.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeModule === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => { handleModuleChange(item.id); setIsAnalysisMenuOpen(false); }}
                        className={`w-full flex items-center px-4 py-3.5 rounded-2xl transition-all duration-300 outline-none group relative overflow-hidden ${
                          isActive 
                            ? 'bg-white/10 border-white/10 text-white shadow-lg' 
                            : 'bg-transparent text-gray-400 border-transparent hover:bg-white/5 hover:text-gray-200'
                        }`}
                      >
                        {isActive && (
                          <motion.div layoutId="mobileActiveNav" className="absolute inset-0 bg-indigo-500/20 -z-10" />
                        )}
                        <Icon className={`w-4 h-4 mr-3 transition-colors ${isActive ? 'text-indigo-400' : 'text-gray-500 group-hover:text-gray-300'}`} />
                        <span className="text-sm font-bold flex-1 text-left">{item.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Next Best Actions (Mobile Drawer Version) */}
                <div className="space-y-3 relative">
                  <h4 className="text-[10px] uppercase font-black tracking-widest text-indigo-400 ml-2 flex items-center mb-3">
                    <Sparkles className="w-3 h-3 mr-1.5 animate-pulse" /> Next Best Actions
                  </h4>
                  
                  <button
                    onClick={() => {
                      const analysisId = analysis?._id || analysis?.id;
                      if (!analysisId) return toast.error("Context unavailable.");
                      router.push(`/dashboard/editor/${analysisId}`);
                    }}
                    className="w-full flex items-center p-3.5 bg-white/[0.02] border border-white/5 rounded-2xl hover:bg-white/[0.04] transition-all group shadow-sm hover:shadow-md"
                  >
                    <div className="p-2.5 bg-blue-500/10 rounded-xl text-blue-400 mr-3 group-hover:scale-110 transition-transform"><Sparkles className="w-4 h-4" /></div>
                    <div className="text-left">
                      <div className="text-xs font-bold text-white group-hover:text-blue-300 transition-colors">Edit Resume</div>
                      <div className="text-[10px] text-gray-500 mt-0.5">Live modifications workspace</div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      const analysisId = analysis?._id || analysis?.id;
                      const resumeId = resume?._id || resume?.id;
                      if (!analysisId || !resumeId) return toast.error("Context unavailable.");
                      localStorage.setItem("activeResume", JSON.stringify({ analysisId, resumeId, name: analysis?.parsedData?.name, atsScore: displayAtsScore }));
                      router.push("/dashboard/job-match");
                    }}
                    className="w-full flex items-center p-3.5 bg-white/[0.02] border border-white/5 rounded-2xl hover:bg-white/[0.04] transition-all group shadow-sm hover:shadow-md"
                  >
                    <div className="p-2.5 bg-purple-500/10 rounded-xl text-purple-400 mr-3 group-hover:scale-110 transition-transform"><Briefcase className="w-4 h-4" /></div>
                    <div className="text-left">
                      <div className="text-xs font-bold text-white group-hover:text-purple-300 transition-colors">Match Job</div>
                      <div className="text-[10px] text-gray-500 mt-0.5">Compare with target roles</div>
                    </div>
                  </button>

                  <button
                    onClick={() => handleRefresh()}
                    disabled={refreshing}
                    className="w-full flex items-center p-3.5 bg-white/[0.02] border border-white/5 rounded-2xl hover:bg-white/[0.04] transition-all group shadow-sm hover:shadow-md disabled:opacity-50"
                  >
                    <div className="p-2.5 bg-emerald-500/10 rounded-xl text-emerald-400 mr-3 group-hover:scale-110 transition-transform">
                      {refreshing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                    </div>
                    <div className="text-left">
                      <div className="text-xs font-bold text-white group-hover:text-emerald-300 transition-colors">{refreshing ? 'Refreshing...' : 'Refresh Analysis'}</div>
                      <div className="text-[10px] text-gray-500 mt-0.5">Run fresh full analyzer</div>
                    </div>
                  </button>
                </div>

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Mobile More Options Bottom Sheet */}
      <AnimatePresence>
        {isMoreMenuOpen && (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-md md:hidden">
            <motion.div
              initial={{ opacity: 0, y: "100%" }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: "100%" }}
              transition={{ type: "spring", stiffness: 400, damping: 40 }}
              className="w-full bg-[#0a0a0f]/95 backdrop-blur-3xl border-t border-white/10 rounded-t-3xl shadow-2xl overflow-hidden flex flex-col relative"
            >
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[150px] h-[100px] bg-indigo-500/10 rounded-full blur-[60px] pointer-events-none" />
              
              <div className="w-full flex justify-center pt-3 pb-1 relative z-10">
                <div className="w-12 h-1.5 bg-white/20 rounded-full" />
              </div>
              <div className="px-6 pb-4 pt-2 flex items-center justify-between border-b border-white/[0.04] relative z-10">
                <h3 className="text-base font-black text-white tracking-wide">Quick Actions</h3>
                <button
                  onClick={() => setIsMoreMenuOpen(false)}
                  className="p-2 bg-white/5 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto px-5 py-6 space-y-3 relative z-10 mobile-safe-bottom hide-scrollbar">
                <button
                  onClick={() => { handleRefresh(); setIsMoreMenuOpen(false); }}
                  disabled={refreshing}
                  className="w-full flex items-center px-4 py-4 bg-white/[0.02] hover:bg-white/[0.04] border border-white/5 rounded-2xl active:scale-95 transition-all text-white outline-none group"
                >
                  <div className="p-2 bg-blue-500/10 rounded-xl mr-4 group-hover:scale-110 transition-transform">
                    {refreshing ? <Loader2 className="w-4 h-4 animate-spin text-blue-400" /> : <RefreshCw className="w-4 h-4 text-blue-400" />}
                  </div>
                  <span className="text-sm font-bold flex-1 text-left">Refresh AI Analysis</span>
                </button>
                <button
                  onClick={() => { handleExport(); setIsMoreMenuOpen(false); }}
                  className="w-full flex items-center px-4 py-4 bg-white/[0.02] hover:bg-white/[0.04] border border-white/5 rounded-2xl active:scale-95 transition-all text-white outline-none group"
                >
                  <div className="p-2 bg-purple-500/10 rounded-xl mr-4 group-hover:scale-110 transition-transform">
                    <Download className="w-4 h-4 text-purple-400" />
                  </div>
                  <span className="text-sm font-bold flex-1 text-left">Export Resume</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Mobile Reanalyze Overlay */}
      <AnimatePresence>
        {refreshing && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-xl md:hidden p-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-sm bg-[#0a0a0f]/95 border border-white/10 shadow-2xl rounded-3xl p-8 relative overflow-hidden text-center"
            >
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[200px] h-[200px] bg-indigo-500/20 rounded-full blur-[80px] pointer-events-none" />
              
              <div className="relative z-10 flex flex-col items-center">
                {/* Pulsing AI Icon */}
                <div className="relative w-20 h-20 mb-8">
                  <div className="absolute inset-0 border-2 border-indigo-500/30 rounded-full animate-[ping_2s_ease-in-out_infinite]" />
                  <div className="absolute inset-2 border-2 border-purple-500/40 rounded-full animate-[ping_2.5s_ease-in-out_infinite]" />
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-white/10 rounded-full shadow-[0_0_30px_rgba(99,102,241,0.3)] backdrop-blur-md">
                    <Sparkles className="w-8 h-8 text-indigo-400 animate-pulse" />
                  </div>
                </div>

                <h3 className="text-xl font-black text-white mb-2">
                  AI is reviewing your resume
                </h3>
                
                <p className="text-sm font-semibold text-indigo-400 mb-6 min-h-[40px] flex items-center justify-center">
                  <motion.span
                    key={loadingTextIndex}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    transition={{ duration: 0.3 }}
                  >
                    {LOADING_MESSAGES[loadingTextIndex]}
                  </motion.span>
                </p>
                
                {/* Animated progress bar indicator */}
                <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden mb-4 relative">
                   <motion.div 
                     className="absolute top-0 left-0 h-full w-1/3 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                     animate={{ x: ['-100%', '300%'] }}
                     transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                   />
                </div>

                <p className="text-[10px] uppercase font-bold tracking-widest text-gray-500 whitespace-pre-line">
                  {loadingTextIndex > 4 ? 'Still working...\nGenerating deeper insights' : 'This may take a few seconds'}
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
