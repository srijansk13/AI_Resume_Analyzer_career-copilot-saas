'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadCloud, FileText, X, ShieldCheck, Lock, Sparkles, Cpu, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

const TARGET_ROLES = [
  'Frontend Developer',
  'Full Stack Developer',
  'Backend Developer',
  'Data Analyst',
  'ML Engineer',
  'Product Manager',
  'UI/UX Designer'
];

export default function UploadArea() {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [jd, setJd] = useState('');
  const [selectedRole, setSelectedRole] = useState('Full Stack Developer');
  const [showJd, setShowJd] = useState(false);
  const [error, setError] = useState('');
  
  // Custom interactive telemetry states
  const [loadingMessage, setLoadingMessage] = useState('Uploading resume securely...');
  const [progressPercent, setProgressPercent] = useState(0);
  const [progressStage, setProgressStage] = useState<'Uploading' | 'Parsing' | 'Analyzing' | 'Finalizing'>('Uploading');

  const router = useRouter();
  const mounted = useRef(true);

  useEffect(() => {
    return () => {
      mounted.current = false;
    };
  }, []);

  // Sync progress percentages, messages, and stages during active processing
  useEffect(() => {
    if (!analyzing) {
      setProgressPercent(0);
      setProgressStage('Uploading');
      return;
    }

    const messages = [
      'Uploading resume securely...',
      'Extracting resume text...',
      'Parsing experience and skills...',
      'Running ATS intelligence engine...',
      'Generating AI career insights...',
      'Building recruiter simulation...',
      'Preparing your analysis workspace...',
      'Almost ready...'
    ];
    
    let msgIndex = 0;
    setLoadingMessage(messages[0]);

    // Dynamic rotation for intelligent status messages every 1.5s
    const msgInterval = setInterval(() => {
      msgIndex = (msgIndex + 1) % messages.length;
      setLoadingMessage(messages[msgIndex]);
    }, 1500);

    // Realistic progressive percentage increments capped at 92%
    const progressInterval = setInterval(() => {
      setProgressPercent((prev) => {
        if (prev >= 92) return 92;

        let increment = 1;
        if (prev < 20) {
          setProgressStage('Uploading');
          increment = 1.4;
        } else if (prev < 45) {
          setProgressStage('Parsing');
          increment = 0.9;
        } else if (prev < 82) {
          setProgressStage('Analyzing');
          increment = 0.55;
        } else {
          setProgressStage('Finalizing');
          increment = 0.12;
        }

        return Math.min(92, parseFloat((prev + increment).toFixed(1)));
      });
    }, 100);

    return () => {
      clearInterval(msgInterval);
      clearInterval(progressInterval);
    };
  }, [analyzing]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (selectedFile: File) => {
    if (selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      setError('');
    } else {
      toast.error('Only PDF documents are supported currently.');
    }
  };

  const handleAnalyze = async () => {
    if (!file || analyzing) return;
    setAnalyzing(true);
    setError('');
    
    const startTime = Date.now();
    toast.info('Initiating secure resume analysis channel...', { id: 'analyze' });
    
    try {
      const formData = new FormData();
      formData.append('resume', file);
      if (jd.trim()) {
        formData.append('jd', jd);
      }
      if (selectedRole) {
        formData.append('targetRole', selectedRole);
      }

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const contentType = res.headers.get("content-type");
      let data;
      
      if (contentType && contentType.includes("application/json")) {
        data = await res.json();
      } else {
        const textError = await res.text();
        console.error("API returned non-JSON response:", textError.substring(0, 500));
        throw new Error("Server returned an invalid response code.");
      }

      if (!res.ok) {
        throw new Error(data.error || 'Failed to analyze resume');
      }

      if (!data.analysisId) {
        throw new Error("Missing analysisId in upload response");
      }

      const elapsed = Date.now() - startTime;
      
      // Polish transition flow depending on Cache Hit (elapsed < 1.5s) vs Cold Gemini Run
      if (elapsed < 1500) {
        setLoadingMessage('Found optimized resume profile...');
        setProgressStage('Finalizing');
        setProgressPercent(100);
        await new Promise(resolve => setTimeout(resolve, 800));
      } else {
        setProgressPercent(100);
        await new Promise(resolve => setTimeout(resolve, 600));
      }

      if (mounted.current) {
        toast.success('Analysis matrix complete!', { id: 'analyze' });
      }
      
      // Route smoothly
      await router.push(`/dashboard/analysis/${data.analysisId}`);
      
    } catch (err: any) {
      console.error('Frontend Analyze Error:', err);
      if (mounted.current) {
        toast.error(`Analysis failed: ${err.message || err}`, { id: 'analyze' });
        setError(err.message || 'Verification failed. Please retry.');
        setAnalyzing(false);
      }
    }
  };

  return (
    <div className="w-full relative mt-6 font-sans min-h-[280px] md:min-h-[340px]">
      
      {/* Decorative ambient backdrop light */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-indigo-500/[0.015] rounded-full blur-[80px] pointer-events-none" />

      {/* Floating dynamic micro-feature tags surrounding the upload zone (hidden on mobile) */}
      <div className="hidden md:block absolute -left-12 top-10 pointer-events-none animate-bounce" style={{ animationDuration: '6s' }}>
        <div className="px-3 py-1.5 rounded-full bg-white/[0.02] border border-white/[0.05] text-[10px] font-bold text-gray-400 flex items-center gap-1.5 backdrop-blur-md shadow-lg">
          <Sparkles className="w-3 h-3 text-yellow-400 animate-pulse" />
          ATS Optimization
        </div>
      </div>
      
      <div className="hidden md:block absolute -right-12 top-6 pointer-events-none animate-bounce" style={{ animationDuration: '8s' }}>
        <div className="px-3 py-1.5 rounded-full bg-white/[0.02] border border-white/[0.05] text-[10px] font-bold text-gray-400 flex items-center gap-1.5 backdrop-blur-md shadow-lg">
          <Cpu className="w-3 h-3 text-indigo-400" />
          AI Resume Rewrite
        </div>
      </div>

      <div className="hidden md:block absolute -left-16 bottom-16 pointer-events-none animate-bounce" style={{ animationDuration: '7s' }}>
        <div className="px-3 py-1.5 rounded-full bg-white/[0.02] border border-white/[0.05] text-[10px] font-bold text-gray-400 flex items-center gap-1.5 backdrop-blur-md shadow-lg">
          <Target className="w-3 h-3 text-emerald-400" />
          Targeted Job Match
        </div>
      </div>

      <div className="hidden md:block absolute -right-16 bottom-12 pointer-events-none animate-bounce" style={{ animationDuration: '9s' }}>
        <div className="px-3 py-1.5 rounded-full bg-white/[0.02] border border-white/[0.05] text-[10px] font-bold text-gray-400 flex items-center gap-1.5 backdrop-blur-md shadow-lg">
          <FileText className="w-3 h-3 text-purple-400" />
          ATS-Safe Parsing
        </div>
      </div>

      <AnimatePresence mode="wait">
        {analyzing ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.25 }}
            className="absolute inset-0 bg-[#07070a]/95 backdrop-blur-sm rounded-3xl border border-white/[0.08] p-8 flex flex-col items-center justify-center z-30 min-h-[340px]"
            role="dialog"
            aria-modal="true"
            aria-label="Resume AI Copilot Analysis secure processing"
          >
            {/* Glowing Miniature Resume Card with laser scanning sweeps */}
            <div className="relative w-16 h-20 rounded-2xl bg-white/[0.01] border border-white/10 p-3 shadow-inner mb-6 overflow-hidden flex flex-col justify-between select-none shrink-0">
              <div className="space-y-1.5">
                <div className="h-1 w-2/3 bg-white/20 rounded-full" />
                <div className="h-0.5 w-full bg-white/10 rounded-full" />
                <div className="h-0.5 w-5/6 bg-white/10 rounded-full" />
                <div className="h-1 w-1/2 bg-white/20 rounded-full" />
              </div>
              <div className="flex items-center justify-between">
                <div className="h-1 w-6 bg-indigo-500/20 rounded-full animate-pulse" />
                <ShieldCheck className="w-3 h-3 text-indigo-400" />
              </div>
              
              {/* Scanning laser line - GPU optimized transform */}
              <motion.div
                animate={{ y: [0, 70, 0] }}
                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-indigo-500 to-transparent shadow-[0_0_8px_rgba(99,102,241,0.8)] motion-reduce:hidden"
              />
            </div>

            {/* Dynamic Telemetry Status Header */}
            <div className="h-5 flex items-center justify-center mb-1 select-none" aria-live="polite">
              <motion.span
                key={loadingMessage}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.2 }}
                className="text-[10px] font-black uppercase tracking-widest text-indigo-300 text-center bg-gradient-to-r from-indigo-300 to-purple-300 bg-clip-text text-transparent"
              >
                {loadingMessage}
              </motion.span>
            </div>

            {/* Stage Capsule indicator */}
            <div className="mb-6 flex items-center gap-2 select-none shrink-0">
              <span className="text-[8px] font-black uppercase tracking-wider text-gray-500">
                Stage:
              </span>
              <span className="text-[8px] font-black uppercase tracking-wider text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-0.5 rounded-full">
                {progressStage}
              </span>
            </div>

            {/* Shimmer progress bar */}
            <div className="w-full max-w-xs space-y-2 select-none shrink-0">
              <div className="flex items-center justify-between text-[9px] font-mono font-bold text-gray-400">
                <span>{progressStage === 'Uploading' ? 'Secure Link' : 'Processing Core'}</span>
                <span>{Math.round(progressPercent)}%</span>
              </div>
              <div className="h-1.5 w-full bg-white/[0.04] rounded-full overflow-hidden border border-white/[0.05] relative">
                <motion.div
                  className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 rounded-full"
                  style={{ width: `${progressPercent}%` }}
                  transition={{ ease: "easeOut", duration: 0.1 }}
                />
                
                {/* Custom Framer Motion Shimmer Highlight - GPU accelerated translation */}
                <motion.div
                  animate={{ x: ['-100%', '100%'] }}
                  transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                  className="absolute inset-y-0 w-1/2 bg-gradient-to-r from-transparent via-white/[0.08] to-transparent motion-reduce:hidden"
                />
              </div>
            </div>

            {/* Secure status tags */}
            <div className="flex items-center gap-4 mt-8 select-none text-[8px] font-black text-gray-600 uppercase tracking-widest shrink-0">
              <span className="flex items-center gap-1"><Lock className="w-3 h-3 text-gray-500" /> AES-256</span>
              <span className="flex items-center gap-1"><ShieldCheck className="w-3 h-3 text-gray-500" /> ATS Secure</span>
              <span className="flex items-center gap-1"><Cpu className="w-3 h-3 text-gray-500" /> AI Engine</span>
            </div>
          </motion.div>
        ) : !file ? (
          <motion.div
            key="upload"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className={`relative p-5 md:p-12 border border-dashed rounded-3xl transition-all duration-500 text-center backdrop-blur-xl ${
              dragActive 
                ? 'border-indigo-500 bg-indigo-500/[0.03] shadow-[0_0_50px_-12px_rgba(99,102,241,0.2)] scale-[1.01]' 
                : 'border-white/10 bg-[#07070a]/40 hover:border-white/20 hover:bg-white/[0.015]'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              type="file"
              accept=".pdf"
              onChange={handleChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
            
            <div className="flex flex-col items-center pointer-events-none relative">
              {/* Spinning circular gradient ring on hover */}
              <div className="relative mb-4 md:mb-6">
                <div className={`absolute inset-[-4px] rounded-full bg-gradient-to-tr from-indigo-500 to-blue-500 opacity-20 blur-sm transition-all duration-500 ${
                  dragActive ? 'scale-110 opacity-60 animate-spin' : 'scale-100 group-hover:opacity-40'
                }`} style={{ animationDuration: '4s' }} />
                
                <div className={`h-12 w-12 md:h-16 md:w-16 rounded-full bg-white/[0.03] flex items-center justify-center border border-white/10 shadow-inner relative z-10 transition-transform duration-500 ${
                  dragActive ? 'translate-y-[-4px] text-white' : ''
                }`}>
                  <UploadCloud className={`h-6 w-6 md:h-8 md:w-8 transition-all duration-300 ${dragActive ? 'text-indigo-400 scale-110' : 'text-gray-400'}`} />
                </div>
              </div>

              <h3 className="text-base md:text-lg font-black text-white mb-1.5 md:mb-2 tracking-tight">
                Drop your resume to unlock AI career intelligence
              </h3>
              
              <p className="text-[11px] md:text-xs text-gray-400 max-w-sm font-semibold leading-relaxed mb-4 md:mb-6">
                Drag and drop your PDF resume here, or <span className="text-indigo-400 hover:text-indigo-300 font-bold underline cursor-pointer">browse your files</span>. We'll instantly evaluate your ATS score.
              </p>

              {/* Supported details & trust badges */}
              <div className="flex flex-wrap items-center justify-center gap-2.5 md:gap-3 pt-4 md:pt-6 border-t border-white/[0.03] w-full max-w-md">
                <div className="flex items-center space-x-1 text-[10px] font-bold text-gray-500 uppercase tracking-wider bg-white/[0.02] px-2.5 py-1 rounded-md border border-white/[0.04]">
                  <span>PDF FORMAT ONLY</span>
                </div>
                
                <div className="flex items-center space-x-1.5 text-[10px] font-bold text-emerald-400 bg-emerald-500/5 px-2.5 py-1 rounded-md border border-emerald-500/10">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>ATS-SAFE SCANNING</span>
                </div>

                <div className="flex items-center space-x-1.5 text-[10px] font-bold text-indigo-400 bg-indigo-500/5 px-2.5 py-1 rounded-md border border-indigo-500/10">
                  <Lock className="w-3.5 h-3.5" />
                  <span>PRIVACY ENCRYPTED</span>
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="file"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-4 md:p-8 rounded-3xl bg-[#07070a]/60 backdrop-blur-xl border border-white/[0.06] shadow-xl"
          >
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 rounded-xl bg-red-500/5 border border-red-500/15 text-red-400 text-xs font-semibold text-center flex flex-col items-center gap-1 select-none"
              >
                <span className="font-extrabold uppercase tracking-wider text-[10px]">Analysis Interrupted</span>
                <span>{error}</span>
              </motion.div>
            )}

            <div className="flex items-center justify-between mb-6 pb-6 border-b border-white/[0.05]">
              <div className="flex items-center space-x-4">
                <div className="h-11 w-11 rounded-xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                  <FileText className="h-5 w-5 text-indigo-400" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white max-w-[180px] sm:max-w-md truncate">{file.name}</h4>
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider font-extrabold">
                    {(file.size / 1024 / 1024).toFixed(2)} MB • PDF DOCUMENT
                  </p>
                </div>
              </div>
              
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => { setFile(null); setError(''); }} 
                disabled={analyzing}
                className="h-8 w-8 rounded-lg bg-white/5 hover:bg-red-500/10 text-gray-400 hover:text-red-400 border border-white/5 transition-all"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="mb-6 space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5 text-indigo-400" />
                  Target Career Role
                </label>
                <div className="flex flex-wrap gap-2">
                  {TARGET_ROLES.map((role) => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => setSelectedRole(role)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all duration-200 ${
                        selectedRole === role
                          ? 'bg-indigo-500/10 border-indigo-500/40 text-indigo-300 shadow-[0_0_15px_-3px_rgba(99,102,241,0.2)]'
                          : 'bg-white/[0.02] border-white/[0.05] text-gray-400 hover:text-gray-200 hover:border-white/10'
                      }`}
                    >
                      {role}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                {!showJd ? (
                  <button
                    onClick={() => setShowJd(true)}
                    className="text-xs text-indigo-400 hover:text-indigo-300 font-black transition-colors flex items-center gap-1 bg-indigo-500/5 px-3 py-1.5 rounded-lg border border-indigo-500/10"
                  >
                    <span>+</span> Add Target Job Description (Highly Recommended)
                  </button>
                ) : (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="space-y-2.5"
                >
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-gray-300 flex items-center gap-1.5">
                      <Target className="w-3.5 h-3.5 text-indigo-400" />
                      Target Job Description <span className="text-gray-500 font-normal">(Paste reqs to compute match %)</span>
                    </label>
                    <button 
                      onClick={() => { setShowJd(false); setJd(''); }} 
                      className="text-[10px] text-gray-500 hover:text-gray-400 font-extrabold uppercase"
                    >
                      Remove
                    </button>
                  </div>
                  <textarea
                    value={jd}
                    onChange={(e) => setJd(e.target.value)}
                    placeholder="Paste full job description, job titles, or key responsibilities here to trigger immediate AI gap analysis..."
                    className="w-full h-28 bg-[#09090b]/80 border border-white/[0.06] rounded-xl p-3.5 text-xs text-white placeholder:text-gray-500 focus:outline-none focus:border-indigo-500/40 focus:ring-2 focus:ring-indigo-500/10 resize-none transition-all font-semibold leading-relaxed"
                  />
                </motion.div>
              )}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button 
                onClick={handleAnalyze} 
                disabled={analyzing}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl px-6 py-5 text-sm font-black w-full sm:w-auto shadow-lg shadow-indigo-600/10 border border-white/10 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center"
              >
                <Sparkles className="mr-2 h-4 w-4 text-indigo-200" />
                Start AI Analysis
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
