'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useMotionValue, useSpring } from 'framer-motion';
import Link from 'next/link';
import { 
  BrainCircuit, 
  Sparkles, 
  FileText, 
  ArrowRight, 
  TrendingUp, 
  Bot, 
  LineChart, 
  Zap, 
  ShieldCheck, 
  ChevronDown, 
  Activity, 
  Lock, 
  CheckCircle2, 
  Award,
  Eye,
  Cpu,
  Target,
  ArrowUpRight,
  Menu,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import ResumeScanHero from './ResumeScanHero';
import SampleAnalysisPreview from './SampleAnalysisPreview';
import LiveEditorSection from './LiveEditorSection';
import ProblemSolutionSection from './ProblemSolutionSection';
import RoleAwareSection from './RoleAwareSection';

const TRUST_BADGES = [
  { name: 'ATS Optimized', icon: <ShieldCheck className="w-4 h-4 text-emerald-400" /> },
  { name: 'Secure Resume Upload', icon: <Lock className="w-4 h-4 text-blue-400" /> },
  { name: 'Role-Aware Feedback', icon: <Target className="w-4 h-4 text-indigo-400" /> },
  { name: 'Live Resume Editor', icon: <FileText className="w-4 h-4 text-purple-400" /> },
];

// Complex BEFORE / AFTER Resume Optimization Bullets
const COMPLEX_BULLET_OPTIMIZATIONS = [
  {
    category: "Software Engineering",
    title: "Software Engineering",
    before: [
      { text: "Responsible for fixing bugs in the dashboard", style: "deleted" },
      { text: " and writing Cypress tests.", style: "deleted" }
    ],
    after: [
      { text: "Optimized dashboard render latencies by 42% ", style: "inserted" },
      { text: "and designed automated E2E testing pipelines,", style: "inserted" },
      { text: " lowering critical regression rate by 15%.", style: "inserted" }
    ],
    beforeScore: 48,
    afterScore: 94,
    verdictBefore: "Weak action verbs; missing quantified metrics",
    verdictAfter: "Excellent STAR metric alignment; strong business value impact"
  },
  {
    category: "Product Management",
    title: "Product Management",
    before: [
      { text: "Led a team that launched a new mobile app module", style: "deleted" },
      { text: " and worked with engineering.", style: "deleted" }
    ],
    after: [
      { text: "Orchestrated cross-functional launch of mobile checkout module ", style: "inserted" },
      { text: "for 14M active users, achieving a 22% uplift in conversion ", style: "inserted" },
      { text: "and generating $4.5M in run-rate expansion.", style: "inserted" }
    ],
    beforeScore: 52,
    afterScore: 96,
    verdictBefore: "Ambiguous leadership indicators; no product-growth metrics",
    verdictAfter: "Clear scale quantification; strong cross-functional representation"
  },
  {
    category: "Data Science",
    title: "Data Science",
    before: [
      { text: "Built machine learning models to predict customer churn", style: "deleted" },
      { text: " and did analytics on customer SQL tables.", style: "deleted" }
    ],
    after: [
      { text: "Engineered XGBoost churn prediction pipeline ", style: "inserted" },
      { text: "using AWS SageMaker; improved recall by 28%, preserving ", style: "inserted" },
      { text: "$1.8M in annualized contract value.", style: "inserted" }
    ],
    beforeScore: 45,
    afterScore: 91,
    verdictBefore: "Lacks tooling context; unclear target value save",
    verdictAfter: "Exceptional architecture details; clear financial impact metric"
  },
  {
    category: "Marketing",
    title: "Marketing",
    before: [
      { text: "Ran paid advertising campaigns on Google Ads", style: "deleted" },
      { text: " and managed creative assets.", style: "deleted" }
    ],
    after: [
      { text: "Scaled paid acquisition budget from $20k to $120k/mo, ", style: "inserted" },
      { text: "reducing CAC by 34% while maintaining customer LTV ", style: "inserted" },
      { text: "resulting in 3.4x ROAS lift.", style: "inserted" }
    ],
    beforeScore: 50,
    afterScore: 93,
    verdictBefore: "No budget scale mentioned; missing CAC/LTV conversion metrics",
    verdictAfter: "Excellent efficiency indicators; comprehensive CAC/LTV/ROAS scaling"
  }
];

// FAQ Accordion Data
const FAQS = [
  {
    q: "How does the AI Resume Analyzer evaluate compatibility?",
    a: "The engine runs a multi-layered semantic scan. First, it extracts raw text and tokens. Next, it maps skills against standard job descriptions using keyword density matrices. Finally, it uses advanced AI to simulate recruiting manager assessments, yielding an ultra-accurate compatibility score."
  },
  {
    q: "Is my personal data encrypted and private?",
    a: "Absolutely. All resume contents, text hashes, and parsed user metadata are secured using enterprise-grade AES-256 encryption. We strictly hold zero monetization sharing policies—your professional profile remains 100% private and exclusively yours."
  },
  {
    q: "What templates are supported in the live editor?",
    a: "We offer professionally formatted templates spanning classic single-column layouts and modern styles optimized for technical and product roles. All are designed for clean ATS parsing and readable exports."
  },
  {
    q: "Can I customize the generated AI roadmaps?",
    a: "Yes. The Career Roadmap matches skill deficiencies against your target roles and automatically charts course recommendations. You can refine default target industries and preference scopes inside your account console."
  }
];

export default function LandingPage() {
  const [activeBulletIndex, setActiveBulletIndex] = useState(0);
  const [faqOpen, setFaqOpen] = useState<number | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Scrollspy & dynamic navbar state
  const [scrolled, setScrolled] = useState(false);
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down' | null>(null);
  const [activeSection, setActiveSection] = useState('home');

  // Custom Cursor states (GPU-friendly spring variables)
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);
  const springConfig = { damping: 25, stiffness: 250 };
  const cursorSpringX = useSpring(cursorX, springConfig);
  const cursorSpringY = useSpring(cursorY, springConfig);
  const [cursorHovered, setCursorHovered] = useState(false);
  const [isMobileDevice, setIsMobileDevice] = useState(true);

  // Mesh spotlight state
  const meshRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);

    const updateDevice = () => {
      setIsMobileDevice(window.innerWidth < 1024 || window.matchMedia('(pointer: coarse)').matches);
    };

    const handleMouseMove = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);

      // Radial spotlight following mouse slightly
      if (meshRef.current) {
        const { left, top, width, height } = meshRef.current.getBoundingClientRect();
        const x = ((e.clientX - left) / width) * 100;
        const y = ((e.clientY - top) / height) * 100;
        meshRef.current.style.setProperty('--x', `${x}%`);
        meshRef.current.style.setProperty('--y', `${y}%`);
      }
    };

    let lastScrollY = window.scrollY;
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setScrolled(scrollY > 20);

      // Hide/Reveal Navbar
      if (scrollY > lastScrollY && scrollY > 120) {
        setScrollDirection('down');
      } else if (scrollY < lastScrollY) {
        setScrollDirection('up');
      }
      lastScrollY = scrollY;

      // Scrollspy matching
      const sections = ['sample-analysis', 'how-it-works', 'features', 'live-editor', 'optimization', 'faq'];
      for (const sectionId of sections) {
        const el = document.getElementById(sectionId);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 160 && rect.bottom >= 160) {
            setActiveSection(sectionId);
            break;
          }
        }
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', updateDevice);
    updateDevice();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', updateDevice);
    };
  }, [cursorX, cursorY]);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-[#030303] text-slate-100 selection:bg-indigo-500/30 font-sans relative overflow-x-hidden lg:cursor-none">
      
      {/* 1. Custom Optimized Cursor Ring */}
      {!isMobileDevice && (
        <>
          <motion.div
            className="fixed top-0 left-0 w-8 h-8 rounded-full border border-indigo-500/50 pointer-events-none z-[9999] mix-blend-screen"
            style={{
              x: cursorSpringX,
              y: cursorSpringY,
              translateX: "-50%",
              translateY: "-50%"
            }}
            animate={{
              scale: cursorHovered ? 1.6 : 1,
              backgroundColor: cursorHovered ? "rgba(99, 102, 241, 0.08)" : "rgba(99, 102, 241, 0)",
              borderColor: cursorHovered ? "rgba(168, 85, 247, 0.6)" : "rgba(99, 102, 241, 0.4)",
            }}
            transition={{ duration: 0.15 }}
          />
          <motion.div
            className="fixed top-0 left-0 w-2 h-2 bg-indigo-400 rounded-full pointer-events-none z-[9999] shadow-[0_0_8px_rgba(99,102,241,0.8)]"
            style={{
              x: cursorSpringX,
              y: cursorSpringY,
              translateX: "-50%",
              translateY: "-50%"
            }}
          />
        </>
      )}

      {/* 2. Global Ambient Lights & Animated Radial Gradients */}
      <div 
        ref={meshRef}
        style={{
          '--x': '50%',
          '--y': '30%',
          backgroundImage: 'radial-gradient(circle at var(--x) var(--y), rgba(99, 102, 241, 0.06) 0%, rgba(168, 85, 247, 0.02) 40%, transparent 70%)'
        } as any}
        className="absolute top-0 inset-x-0 h-[1000px] pointer-events-none -z-10 transition-all duration-300 ease-out"
      />
      <div className="absolute top-[30%] left-[-10%] w-[600px] h-[600px] bg-indigo-500/[0.015] rounded-full blur-[160px] pointer-events-none -z-10 animate-pulse" />
      <div className="absolute bottom-[20%] right-[-10%] w-[700px] h-[700px] bg-purple-500/[0.015] rounded-full blur-[180px] pointer-events-none -z-10" />

      {/* Futuristic Faint Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.01)_1px,transparent_1px)] [background-size:48px_48px] pointer-events-none -z-10 opacity-70" />

      {/* 3. Sticky Floating Glass Navbar */}
      <header className={`
        fixed top-4 inset-x-4 z-50 max-w-7xl mx-auto transition-transform duration-300
        ${scrollDirection === 'down' && scrolled ? '-translate-y-28' : 'translate-y-0'}
      `}>
        <div className={`
          bg-[#07070a]/60 backdrop-blur-xl border border-white/[0.06] px-6 py-3 rounded-2xl flex items-center justify-between shadow-2xl transition-all duration-300
          ${scrolled ? 'shadow-black/70 border-white/[0.08]' : ''}
        `}>
          <Link 
            href="/" 
            className="flex items-center space-x-2.5 group"
            onMouseEnter={() => setCursorHovered(true)}
            onMouseLeave={() => setCursorHovered(false)}
          >
            <div className="h-8.5 w-8.5 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 border border-white/10 group-hover:scale-105 transition-transform duration-300">
              <BrainCircuit className="h-5 w-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-sm tracking-tight text-white leading-none">
                Career Copilot
              </span>
              <div className="flex items-center space-x-1 mt-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[8px] font-extrabold tracking-widest text-emerald-400 uppercase">AI Intelligence Active</span>
              </div>
            </div>
          </Link>

          {/* Center Links with Active indicator trails */}
          <nav className="hidden md:flex items-center space-x-8 text-[11px] uppercase tracking-wider font-extrabold text-gray-400">
            {[
              { label: 'Preview', href: '#sample-analysis', id: 'sample-analysis' },
              { label: 'How it works', href: '#how-it-works', id: 'how-it-works' },
              { label: 'Features', href: '#features', id: 'features' },
              { label: 'Live Editor', href: '#live-editor', id: 'live-editor' },
              { label: 'FAQ', href: '#faq', id: 'faq' },
            ].map((link) => (
              <a 
                key={link.id} 
                href={link.href} 
                className={`hover:text-white transition-colors relative py-1 ${activeSection === link.id ? 'text-white' : ''}`}
                onMouseEnter={() => setCursorHovered(true)}
                onMouseLeave={() => setCursorHovered(false)}
              >
                {link.label}
                {activeSection === link.id && (
                  <motion.div 
                    layoutId="navActiveLine"
                    className="absolute bottom-0 inset-x-0 h-0.5 bg-indigo-500 rounded-full"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </a>
            ))}
          </nav>

          {/* CTA Group */}
          <div className="hidden md:flex items-center space-x-4">
            <Link 
              href="/login"
              onMouseEnter={() => setCursorHovered(true)}
              onMouseLeave={() => setCursorHovered(false)}
            >
              <Button variant="ghost" className="text-xs font-black text-gray-400 hover:text-white hover:bg-white/5 px-4 h-9 rounded-xl">
                Log in
              </Button>
            </Link>
            <Link 
              href="/signup"
              onMouseEnter={() => setCursorHovered(true)}
              onMouseLeave={() => setCursorHovered(false)}
            >
              <Button className="relative overflow-hidden bg-white hover:bg-slate-200 text-black text-xs font-black px-4.5 h-9 rounded-xl shadow-lg shadow-white/5 hover:scale-[1.02] active:scale-[0.98] transition-all group/cta">
                <span className="relative z-10">Analyze My Resume</span>
                <span className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 opacity-0 group-hover/cta:opacity-100 transition-opacity duration-300" />
              </Button>
            </Link>
          </div>

          {/* Mobile Hamburger toggle */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
            className="md:hidden p-2 text-gray-400 hover:text-white bg-white/5 rounded-lg border border-white/10"
            onMouseEnter={() => setCursorHovered(true)}
            onMouseLeave={() => setCursorHovered(false)}
          >
            {mobileMenuOpen ? <X className="w-4.5 h-4.5" /> : <Menu className="w-4.5 h-4.5" />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="fixed top-20 inset-x-4 z-40 bg-[#07070a]/95 backdrop-blur-2xl border border-white/10 rounded-2xl p-6 shadow-2xl space-y-6 md:hidden flex flex-col"
          >
            <nav className="flex flex-col space-y-4 text-xs font-extrabold tracking-wider uppercase text-gray-400">
              <a href="#sample-analysis" onClick={() => setMobileMenuOpen(false)} className="hover:text-white transition-colors">Preview</a>
              <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)} className="hover:text-white transition-colors">How it works</a>
              <a href="#features" onClick={() => setMobileMenuOpen(false)} className="hover:text-white transition-colors">Features</a>
              <a href="#live-editor" onClick={() => setMobileMenuOpen(false)} className="hover:text-white transition-colors">Live Editor</a>
              <a href="#faq" onClick={() => setMobileMenuOpen(false)} className="hover:text-white transition-colors">FAQ</a>
            </nav>
            <div className="h-px bg-white/5 w-full" />
            <div className="flex flex-col gap-3">
              <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                <Button className="w-full text-xs font-extrabold border border-white/10 hover:bg-white/5 py-2.5 rounded-xl bg-transparent text-white">Log In</Button>
              </Link>
              <Link href="/signup" onClick={() => setMobileMenuOpen(false)}>
                <Button className="w-full text-xs font-extrabold bg-white text-black py-2.5 rounded-xl hover:bg-slate-200">Analyze My Resume</Button>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* HERO */}
      <section id="home" className="relative pt-32 pb-20 lg:pt-44 lg:pb-28 scroll-mt-24">
        <div className="container px-4 md:px-6 mx-auto max-w-7xl relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* Left Column Description */}
            <div className="lg:col-span-6 space-y-8 text-left">
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/5 px-3 py-1.5 text-[10px] text-indigo-400 font-extrabold tracking-widest uppercase"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>AI Resume Analyzer</span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-4xl sm:text-5xl lg:text-[3.25rem] font-extrabold tracking-tight text-white leading-[1.08] max-w-2xl"
              >
                Get recruiter-style AI feedback on your resume in{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-indigo-400 to-purple-400">
                  seconds
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-sm sm:text-base text-gray-400 font-semibold leading-relaxed max-w-xl"
              >
                Analyze your resume, understand what&apos;s holding it back, improve ATS compatibility, optimize bullet points, and edit everything live — all in one workflow.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="flex flex-col sm:flex-row gap-3 pt-2"
              >
                <Link 
                  href="/signup"
                  onMouseEnter={() => setCursorHovered(true)}
                  onMouseLeave={() => setCursorHovered(false)}
                >
                  <Button className="h-11 px-6 bg-white hover:bg-slate-200 text-black rounded-xl text-xs font-black shadow-lg shadow-white/5 flex items-center gap-1.5 hover:scale-[1.02] active:scale-[0.98] transition-all">
                    Analyze My Resume
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <a href="#sample-analysis">
                  <Button variant="outline" className="h-11 px-6 border-white/10 hover:border-white/20 text-white hover:bg-white/5 rounded-xl text-xs font-black bg-white/[0.02] flex items-center gap-1.5 backdrop-blur-md hover:scale-[1.02] active:scale-[0.98] transition-all">
                    <Eye className="h-4 w-4 text-cyan-400" />
                    View Sample Analysis
                  </Button>
                </a>
              </motion.div>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.35 }}
                className="text-[11px] text-gray-500 font-semibold flex items-center gap-1.5"
              >
                <Lock className="w-3.5 h-3.5 text-blue-400/80" />
                Your resume is securely processed and never shared publicly.
              </motion.p>

              {/* Recruiter trust badges bar */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="pt-6 border-t border-white/[0.04] grid grid-cols-2 gap-4 max-w-md"
              >
                {TRUST_BADGES.map((badge, idx) => (
                  <div key={idx} className="flex items-center space-x-2 text-[10px] uppercase tracking-wider font-extrabold text-gray-500">
                    {badge.icon}
                    <span>{badge.name}</span>
                  </div>
                ))}
              </motion.div>
            </div>

            <div className="lg:col-span-6 relative flex justify-center">
              <ResumeScanHero isMobile={isMobileDevice} />
            </div>

          </div>
        </div>
      </section>

      <section className="py-8 bg-[#07070a]/40 border-y border-white/[0.04] backdrop-blur-md relative overflow-hidden">
        <div className="container mx-auto px-4 max-w-7xl flex flex-col items-center gap-3 text-center">
          <p className="text-[11px] text-gray-500 font-semibold max-w-xl">
            Private by design. Built for students, developers, and job seekers preparing for real applications.
          </p>
          <div className="flex flex-wrap justify-center gap-6 text-[10px] font-black tracking-widest text-gray-500 uppercase">
            <span className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-emerald-400" /> Secure processing</span>
            <span className="flex items-center gap-2"><Lock className="w-4 h-4 text-blue-400" /> Documents protected</span>
            <span className="flex items-center gap-2"><Target className="w-4 h-4 text-purple-400" /> Role-aware insights</span>
          </div>
        </div>
      </section>

      <SampleAnalysisPreview />
      <ProblemSolutionSection />

      <LiveEditorSection />

      {/* FEATURES */}
      <section id="features" className="py-28 relative z-10 scroll-mt-12">
        <div className="container px-4 md:px-6 mx-auto max-w-7xl">
          <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-purple-500/20 bg-purple-500/5 px-3 py-1 text-[9px] text-purple-400 font-extrabold tracking-widest uppercase">
              <Cpu className="h-3 w-3" />
              <span>Advanced Capabilities</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
              Everything required to <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-500">conquer ATS</span>
            </h2>
            <p className="text-gray-400 text-sm sm:text-base font-semibold leading-relaxed max-w-2xl mx-auto">
              We engineered a complete high-fidelity system dedicated to optimizing formatting structure, parsing syntax, and matching scores.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Feature 1 - Scoring */}
            <div 
              onMouseEnter={() => setCursorHovered(true)}
              onMouseLeave={() => setCursorHovered(false)}
              className="group p-8 rounded-2xl bg-[#08080c]/50 border border-white/[0.04] backdrop-blur-lg hover:border-indigo-500/30 hover:bg-white/[0.01] hover:scale-[1.01] transition-all duration-300 relative overflow-hidden flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="h-10 w-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:scale-105 transition-transform duration-300">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <h3 className="text-base font-extrabold text-white">ATS Semantic Scoring</h3>
                <p className="text-xs font-semibold text-gray-400 leading-relaxed">
                  Run deep evaluations calculating overall resume performance against core organizational scoring rules.
                </p>
              </div>
              
              {/* Interactive micro preview graphic */}
              <div className="mt-8 h-16 w-full rounded-xl bg-black/40 border border-white/[0.03] p-3.5 flex items-center justify-between">
                <span className="text-[10px] font-mono text-gray-500">ATS Match Rate</span>
                <div className="h-2 w-32 bg-white/5 rounded-full overflow-hidden relative">
                  <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 w-[84%] rounded-full group-hover:w-[94%] transition-all duration-1000" />
                </div>
                <span className="text-[10px] font-mono text-indigo-400 font-extrabold">94%</span>
              </div>
            </div>

            {/* Feature 2 - Keyword analysis */}
            <div 
              onMouseEnter={() => setCursorHovered(true)}
              onMouseLeave={() => setCursorHovered(false)}
              className="group p-8 rounded-2xl bg-[#08080c]/50 border border-white/[0.04] backdrop-blur-lg hover:border-purple-500/30 hover:bg-white/[0.01] hover:scale-[1.01] transition-all duration-300 relative overflow-hidden flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="h-10 w-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 group-hover:scale-105 transition-transform duration-300">
                  <LineChart className="h-5 w-5" />
                </div>
                <h3 className="text-base font-extrabold text-white">Keyword Hole Extraction</h3>
                <p className="text-xs font-semibold text-gray-400 leading-relaxed">
                  Parse job descriptions instantly to discover exactly which tech frameworks and credentials you are missing.
                </p>
              </div>
              
              {/* Interactive micro preview graphic */}
              <div className="mt-8 h-16 w-full rounded-xl bg-black/40 border border-white/[0.03] p-2 flex items-center justify-center gap-1.5 flex-wrap overflow-hidden">
                <span className="text-[8px] px-2 py-0.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-md font-bold group-hover:hidden">GraphQL</span>
                <span className="text-[8px] px-2 py-0.5 bg-white/5 border border-white/10 text-gray-400 rounded-md font-bold">Next.js</span>
                <span className="text-[8px] px-2 py-0.5 bg-white/5 border border-white/10 text-gray-400 rounded-md font-bold">AWS</span>
                <span className="text-[8px] px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-md font-bold hidden group-hover:inline-block animate-pulse">GraphQL Fixed</span>
              </div>
            </div>

            {/* Feature 3 - Rewrite engine */}
            <div 
              onMouseEnter={() => setCursorHovered(true)}
              onMouseLeave={() => setCursorHovered(false)}
              className="group p-8 rounded-2xl bg-[#08080c]/50 border border-white/[0.04] backdrop-blur-lg hover:border-pink-500/30 hover:bg-white/[0.01] hover:scale-[1.01] transition-all duration-300 relative overflow-hidden flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="h-10 w-10 rounded-xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-400 group-hover:scale-105 transition-transform duration-300">
                  <Bot className="h-5 w-5" />
                </div>
                <h3 className="text-base font-extrabold text-white">STAR Quantify Engine</h3>
                <p className="text-xs font-semibold text-gray-400 leading-relaxed">
                  Transform weak descriptive bullet lists into measurable, robust action items using mathematical value indicators.
                </p>
              </div>
              
              {/* Interactive micro preview graphic */}
              <div className="mt-8 h-16 w-full rounded-xl bg-black/40 border border-white/[0.03] p-3 flex items-center justify-between">
                <span className="text-[9px] font-mono text-gray-500">Quantifiable Metrics</span>
                <div className="flex space-x-1">
                  <span className="h-4 w-10 bg-indigo-500/10 border border-indigo-500/20 rounded text-[9px] font-bold text-indigo-400 flex items-center justify-center font-mono">STAR</span>
                  <span className="h-4 w-7 bg-emerald-500/10 border border-emerald-500/20 rounded text-[9px] font-bold text-emerald-400 flex items-center justify-center font-mono">+42%</span>
                </div>
              </div>
            </div>

            {/* Feature 4 - A4 sandbox */}
            <div 
              onMouseEnter={() => setCursorHovered(true)}
              onMouseLeave={() => setCursorHovered(false)}
              className="group p-8 rounded-2xl bg-[#08080c]/50 border border-white/[0.04] backdrop-blur-lg hover:border-blue-500/30 hover:bg-white/[0.01] hover:scale-[1.01] transition-all duration-300 relative overflow-hidden flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="h-10 w-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 group-hover:scale-105 transition-transform duration-300">
                  <FileText className="h-5 w-5" />
                </div>
                <h3 className="text-base font-extrabold text-white">Visual A4 Sandbox</h3>
                <p className="text-xs font-semibold text-gray-400 leading-relaxed">
                  Design with fluid panels, real-time font configurations, customizable section arrangements, and pixel-perfect outputs.
                </p>
              </div>
              
              {/* Interactive micro preview graphic */}
              <div className="mt-8 h-16 w-full rounded-xl bg-black/40 border border-white/[0.03] p-3.5 flex items-center justify-between">
                <div className="flex space-x-1.5 items-center">
                  <span className="w-5 h-7 rounded border border-white/10 bg-white/5 block" />
                  <span className="text-[10px] font-mono text-gray-500">Standard A4 Format</span>
                </div>
                <span className="text-[9px] px-2 py-0.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-md font-bold">1-Column</span>
              </div>
            </div>

            {/* Feature 5 - Exporter */}
            <div 
              onMouseEnter={() => setCursorHovered(true)}
              onMouseLeave={() => setCursorHovered(false)}
              className="group p-8 rounded-2xl bg-[#08080c]/50 border border-white/[0.04] backdrop-blur-lg hover:border-yellow-500/30 hover:bg-white/[0.01] hover:scale-[1.01] transition-all duration-300 relative overflow-hidden flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="h-10 w-10 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center text-yellow-400 group-hover:scale-105 transition-transform duration-300">
                  <Zap className="h-5 w-5" />
                </div>
                <h3 className="text-base font-extrabold text-white">Universal PDF Exporter</h3>
                <p className="text-xs font-semibold text-gray-400 leading-relaxed">
                  Export and download standard A4 formats that are fully compatible with recruiting crawlers and enterprise scanners.
                </p>
              </div>
              
              {/* Interactive micro preview graphic */}
              <div className="mt-8 h-16 w-full rounded-xl bg-black/40 border border-white/[0.03] p-3.5 flex items-center justify-between">
                <span className="text-[10px] font-mono text-gray-500">Crawler Compatibility</span>
                <span className="text-[10px] font-mono text-emerald-400 font-extrabold uppercase flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  100% Verified
                </span>
              </div>
            </div>

            {/* Feature 6 - TIMELINE */}
            <div 
              onMouseEnter={() => setCursorHovered(true)}
              onMouseLeave={() => setCursorHovered(false)}
              className="group p-8 rounded-2xl bg-[#08080c]/50 border border-white/[0.04] backdrop-blur-lg hover:border-orange-500/30 hover:bg-white/[0.01] hover:scale-[1.01] transition-all duration-300 relative overflow-hidden flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="h-10 w-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400 group-hover:scale-105 transition-transform duration-300">
                  <Award className="h-5 w-5" />
                </div>
                <h3 className="text-base font-extrabold text-white">Personalized Pathways</h3>
                <p className="text-xs font-semibold text-gray-400 leading-relaxed">
                  Map matching failures into clean education pathways containing target course titles and certification recommendations.
                </p>
              </div>
              
              {/* Interactive micro preview graphic */}
              <div className="mt-8 h-16 w-full rounded-xl bg-black/40 border border-white/[0.03] p-3.5 flex items-center justify-between">
                <span className="text-[10px] font-mono text-gray-500">Skills Pipeline Path</span>
                <div className="flex space-x-1">
                  <span className="h-4.5 w-4.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-[8px]">1</span>
                  <span className="h-4.5 w-4.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-[8px]">2</span>
                  <span className="h-4.5 w-4.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 flex items-center justify-center font-bold text-[8px]">3</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      <RoleAwareSection />

      {/* BEFORE / AFTER */}
      <section id="optimization" className="py-28 relative scroll-mt-12">
        <div className="container px-4 md:px-6 mx-auto max-w-6xl relative z-10">
          
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/5 px-3 py-1 text-[9px] text-emerald-400 font-extrabold tracking-widest uppercase">
              <Award className="h-3 w-3 animate-bounce" />
              <span>Measurable Enhancements</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
              Interactive Achievement Transformation
            </h2>
            <p className="text-gray-400 text-sm sm:text-base font-semibold max-w-2xl mx-auto leading-relaxed">
              Spotlight the difference between flat, generic responsibilities and high-impact, quantified professional achievements.
            </p>
          </div>

          {/* Interactive Bullet Switcher Cards with scoring ring & text diff */}
          <div className="bg-[#07070a]/90 border border-white/[0.08] rounded-3xl p-6 md:p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden">
            
            {/* Glowing mesh ring inside */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-indigo-500/[0.015] rounded-full blur-[100px] pointer-events-none" />

            {/* Slider Tabs */}
            <div className="flex flex-wrap gap-2 justify-center border-b border-white/[0.06] pb-6 mb-8">
              {COMPLEX_BULLET_OPTIMIZATIONS.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveBulletIndex(idx)}
                  onMouseEnter={() => setCursorHovered(true)}
                  onMouseLeave={() => setCursorHovered(false)}
                  className={`px-5 py-2.5 rounded-xl text-xs uppercase tracking-wider font-extrabold transition-all relative ${
                    activeBulletIndex === idx 
                      ? 'text-white' 
                      : 'text-gray-500 hover:text-white bg-transparent'
                  }`}
                >
                  <span className="relative z-10">{item.category}</span>
                  {activeBulletIndex === idx && (
                    <motion.div 
                      layoutId="optimActiveTab"
                      className="absolute inset-0 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-600/20"
                      transition={{ type: "spring", stiffness: 350, damping: 28 }}
                    />
                  )}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch relative z-10">
              
              {/* Left Column comparative diff cards */}
              <div className="lg:col-span-8 space-y-6 flex flex-col justify-between">
                
                {/* Original (Deleted style) */}
                <div className="p-6 rounded-2xl bg-red-500/[0.01] border border-red-500/10 flex flex-col justify-between min-h-[140px] relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-3 bg-red-500/10 border-b border-l border-red-500/20 text-[9px] uppercase tracking-widest text-red-400 font-extrabold rounded-bl-xl">
                    Original Bullet Draft
                  </div>
                  <div className="space-y-4 pt-4 pr-12">
                    <p className="text-xs md:text-sm font-semibold text-gray-500 leading-relaxed font-mono">
                      "
                      {COMPLEX_BULLET_OPTIMIZATIONS[activeBulletIndex].before.map((b, bIdx) => (
                        <span key={bIdx} className="line-through decoration-red-500/50 bg-red-500/5 px-1 py-0.5 rounded mr-1">
                          {b.text}
                        </span>
                      ))}
                      "
                    </p>
                  </div>
                  <div className="text-[9px] uppercase tracking-widest text-red-400/80 font-black pt-6 flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
                    {COMPLEX_BULLET_OPTIMIZATIONS[activeBulletIndex].verdictBefore}
                  </div>
                </div>

                {/* Optimized (Inserted style) */}
                <div className="p-6 rounded-2xl bg-emerald-500/[0.015] border border-emerald-500/20 flex flex-col justify-between min-h-[140px] relative overflow-hidden group shadow-lg shadow-emerald-500/[0.02]">
                  <div className="absolute top-0 right-0 p-3 bg-emerald-500/10 border-b border-l border-emerald-500/20 text-[9px] uppercase tracking-widest text-emerald-400 font-extrabold rounded-bl-xl">
                    Optimized Achievement
                  </div>
                  <div className="space-y-4 pt-4 pr-12">
                    <p className="text-xs md:text-sm text-white leading-relaxed font-extrabold font-sans">
                      "
                      {COMPLEX_BULLET_OPTIMIZATIONS[activeBulletIndex].after.map((a, aIdx) => (
                        <span key={aIdx} className="bg-emerald-500/10 border-b border-emerald-500/30 text-emerald-300 px-1 py-0.5 rounded mr-1">
                          {a.text}
                        </span>
                      ))}
                      "
                    </p>
                  </div>
                  <div className="text-[9px] uppercase tracking-widest text-emerald-400 font-black pt-6 flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    {COMPLEX_BULLET_OPTIMIZATIONS[activeBulletIndex].verdictAfter}
                  </div>
                </div>

              </div>

              {/* Right Column comparative scores widget */}
              <div className="lg:col-span-4 bg-black/60 border border-white/[0.05] p-6 rounded-2xl flex flex-col justify-between items-center text-center">
                <span className="text-[10px] font-black tracking-widest text-gray-500 uppercase">Impact Assessment</span>
                
                {/* Scoring change representation */}
                <div className="space-y-4 my-6">
                  <div className="flex items-center justify-center space-x-6">
                    <div className="flex flex-col items-center">
                      <span className="text-[11px] font-bold text-gray-500 uppercase">Before</span>
                      <span className="text-2xl font-black text-red-500/70 font-mono mt-1">
                        {COMPLEX_BULLET_OPTIMIZATIONS[activeBulletIndex].beforeScore}%
                      </span>
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-600 animate-pulse" />
                    <div className="flex flex-col items-center">
                      <span className="text-[11px] font-bold text-indigo-400 uppercase">After</span>
                      <span className="text-4xl font-black text-emerald-400 font-mono mt-1 shadow-emerald-500/20 shadow-sm animate-pulse">
                        {COMPLEX_BULLET_OPTIMIZATIONS[activeBulletIndex].afterScore}%
                      </span>
                    </div>
                  </div>

                  {/* Micro comparative bar */}
                  <div className="h-2 w-48 bg-white/5 rounded-full overflow-hidden relative mx-auto">
                    <div 
                      className="absolute left-0 top-0 h-full bg-red-500" 
                      style={{ width: `${COMPLEX_BULLET_OPTIMIZATIONS[activeBulletIndex].beforeScore}%` }} 
                    />
                    <motion.div 
                      className="absolute top-0 h-full bg-emerald-400" 
                      style={{ left: `${COMPLEX_BULLET_OPTIMIZATIONS[activeBulletIndex].beforeScore}%` }}
                      animate={{ width: `${COMPLEX_BULLET_OPTIMIZATIONS[activeBulletIndex].afterScore - COMPLEX_BULLET_OPTIMIZATIONS[activeBulletIndex].beforeScore}%` }}
                      transition={{ duration: 0.8 }}
                    />
                  </div>
                </div>

                <div className="px-4 py-2 rounded-xl bg-emerald-500/5 border border-emerald-500/10 text-[9px] uppercase tracking-wider font-extrabold text-emerald-400 w-full flex items-center justify-center space-x-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Approved by AI Recruiter Analyzer</span>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* 8. FAQ SECTION */}
      <section id="faq" className="py-28 bg-[#050508]/20 border-t border-white/[0.04] scroll-mt-12 relative z-10">
        <div className="container px-4 md:px-6 mx-auto max-w-4xl">
          <div className="text-center mb-20 space-y-4">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-indigo-500/20 bg-indigo-500/5 px-3 py-1 text-[9px] text-indigo-400 font-extrabold tracking-widest uppercase">
              <Bot className="h-3 w-3" />
              <span>General Inquiries</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-extrabold text-white leading-tight">
              General Inquiries
            </h2>
            <p className="text-gray-400 text-sm sm:text-base font-semibold max-w-xl mx-auto leading-relaxed">
              Explore frequently asked questions regarding career operating systems and scanning engines.
            </p>
          </div>

          <div className="space-y-3.5">
            {FAQS.map((faq, index) => {
              const isOpen = faqOpen === index;
              return (
                <div 
                  key={index} 
                  className={`
                    rounded-2xl border border-white/[0.04] bg-[#07070a]/60 backdrop-blur-md overflow-hidden transition-all duration-300
                    ${isOpen ? 'border-indigo-500/20 bg-white/[0.01]' : 'hover:border-white/[0.08]'}
                  `}
                >
                  <button
                    onClick={() => setFaqOpen(isOpen ? null : index)}
                    onMouseEnter={() => setCursorHovered(true)}
                    onMouseLeave={() => setCursorHovered(false)}
                    className="w-full flex items-center justify-between p-5 text-left text-xs md:text-sm font-extrabold text-white transition-colors"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-300 ${isOpen ? 'rotate-180 text-indigo-400' : ''}`} />
                  </button>
                  
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                      >
                        <div className="px-5 pb-5 pt-1.5 border-t border-white/[0.03] text-xs font-semibold text-gray-400 leading-relaxed">
                          {faq.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>

          {/* Still have questions card */}
          <div className="mt-12 p-6 rounded-2xl bg-white/[0.01] border border-white/[0.04] text-center space-y-3 max-w-md mx-auto">
            <p className="text-xs font-extrabold text-gray-400">Still have questions?</p>
            <p className="text-[10px] text-gray-500 font-semibold leading-relaxed">
              Our career support specialists are fully trained to guide formatting parser structures and resume layouts.
            </p>
            <button 
              className="text-[10px] uppercase tracking-wider font-extrabold text-indigo-400 hover:text-indigo-300 flex items-center justify-center gap-1 mx-auto mt-2"
              onMouseEnter={() => setCursorHovered(true)}
              onMouseLeave={() => setCursorHovered(false)}
            >
              <span>Contact AI Support Team</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-28 relative overflow-hidden border-t border-white/[0.04]">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[300px] bg-gradient-to-r from-indigo-500/[0.04] to-cyan-500/[0.04] blur-[150px] pointer-events-none rounded-full" />
        
        <div className="container px-4 md:px-6 mx-auto max-w-4xl text-center relative z-10 space-y-8">
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white leading-[1.1]">
            Ready to see what your resume is missing?
          </h2>
          
          <p className="text-gray-400 text-sm font-semibold max-w-lg mx-auto leading-relaxed">
            Get ATS insights, recruiter-style feedback, and live resume improvements in one workflow.
          </p>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-2">
            <Link href="/signup">
              <Button className="h-12 px-8 bg-white hover:bg-slate-200 text-black rounded-xl text-xs font-black shadow-lg shadow-white/5 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-1.5">
                Analyze My Resume
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <a href="#sample-analysis">
              <Button variant="outline" className="h-12 px-6 border-white/10 text-white hover:bg-white/5 rounded-xl text-xs font-black bg-white/[0.02]">
                View Sample Analysis
              </Button>
            </a>
          </div>

          <p className="text-[11px] text-gray-500 font-semibold max-w-md mx-auto">
            Your resume is securely processed and never shared publicly.
          </p>
        </div>
      </section>

      {/* 10. FOOTER */}
      <footer className="py-10 border-t border-white/[0.03] bg-[#030303] relative z-10">
        <div className="container mx-auto px-4 max-w-7xl space-y-4">
          <p className="text-center text-[11px] text-gray-500 font-semibold normal-case tracking-normal max-w-2xl mx-auto">
            Private by design. Your documents stay protected. Career Copilot helps you prepare stronger applications — not replace professional career advice.
          </p>
          <div className="flex flex-col sm:flex-row justify-between items-center gap-6 text-[10px] font-black text-gray-500 uppercase tracking-widest">
            <span>© 2026 Career Copilot</span>
            <div className="flex flex-wrap justify-center gap-6">
              <a href="#sample-analysis" className="hover:text-white transition-colors">Preview</a>
              <a href="#features" className="hover:text-white transition-colors">Features</a>
              <a href="#live-editor" className="hover:text-white transition-colors">Editor</a>
              <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
