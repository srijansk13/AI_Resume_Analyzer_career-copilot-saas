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
  Briefcase,
  Terminal,
  Cpu,
  Target,
  ArrowUpRight,
  Menu,
  X,
  Compass
} from 'lucide-react';
import { Button } from '@/components/ui/button';

// Mock Recruiter Trust Badges
const TRUST_BADGES = [
  { name: 'ATS-Safe Scan Verified', icon: <ShieldCheck className="w-4 h-4 text-emerald-400" /> },
  { name: 'STAR Compliance Standard', icon: <Award className="w-4 h-4 text-purple-400" /> },
  { name: 'ISO-27001 Data Privacy', icon: <Lock className="w-4 h-4 text-blue-400" /> },
  { name: 'Recruiter Aligned Scoring', icon: <CheckCircle2 className="w-4 h-4 text-indigo-400" /> }
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
    q: "What templates are supported in the Career OS?",
    a: "We offer 15+ professionally formatted templates spanning classic 1-column layouts (trusted by rigid banking/traditional systems) and modern 2-column styles (optimized for design, technical startups, and product roles). All are verified to pass parsing parsers with 100% reading accuracy."
  },
  {
    q: "Can I customize the generated AI roadmaps?",
    a: "Yes. The Career Roadmap matches skill deficiencies against your target roles and automatically charts course recommendations. You can refine default target industries and preference scopes inside your account console."
  }
];

export default function LandingPage() {
  const [activeBulletIndex, setActiveBulletIndex] = useState(0);
  const [scanStep, setScanStep] = useState(0);
  const [atsScore, setAtsScore] = useState(0);
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
      const sections = ['features', 'scanning-flow', 'optimization', 'faq'];
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

  // Simulated Scanning loop (Hero Visualizer)
  useEffect(() => {
    const scanInterval = setInterval(() => {
      setScanStep((prev) => (prev + 1) % 4);
    }, 4500);
    return () => clearInterval(scanInterval);
  }, []);

  // Rising ATS Score simulation on load
  useEffect(() => {
    const scoreTimeout = setTimeout(() => {
      const interval = setInterval(() => {
        setAtsScore((prev) => {
          if (prev >= 87) {
            clearInterval(interval);
            return 87;
          }
          return prev + 1;
        });
      }, 15);
      return () => clearInterval(interval);
    }, 800);
    return () => clearTimeout(scoreTimeout);
  }, []);

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
              { label: 'Features', href: '#features', id: 'features' },
              { label: 'Intelligence Pipeline', href: '#scanning-flow', id: 'scanning-flow' },
              { label: 'Before / After', href: '#optimization', id: 'optimization' },
              { label: 'FAQ', href: '#faq', id: 'faq' }
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
                <span className="relative z-10">Get Started</span>
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
              <a href="#features" onClick={() => setMobileMenuOpen(false)} className="hover:text-white transition-colors">Features</a>
              <a href="#scanning-flow" onClick={() => setMobileMenuOpen(false)} className="hover:text-white transition-colors">Intelligence Pipeline</a>
              <a href="#optimization" onClick={() => setMobileMenuOpen(false)} className="hover:text-white transition-colors">Before / After</a>
              <a href="#faq" onClick={() => setMobileMenuOpen(false)} className="hover:text-white transition-colors">FAQ</a>
            </nav>
            <div className="h-px bg-white/5 w-full" />
            <div className="flex flex-col gap-3">
              <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                <Button className="w-full text-xs font-extrabold border border-white/10 hover:bg-white/5 py-2.5 rounded-xl bg-transparent text-white">Log In</Button>
              </Link>
              <Link href="/signup" onClick={() => setMobileMenuOpen(false)}>
                <Button className="w-full text-xs font-extrabold bg-white text-black py-2.5 rounded-xl hover:bg-slate-200">Get Started</Button>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 4. HERO SECTION */}
      <section className="relative pt-32 pb-20 lg:pt-44 lg:pb-28">
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
                <span>AI Career Operating System</span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.05] max-w-2xl"
              >
                Command your path with{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-500">
                  AI Intelligence
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-sm sm:text-base text-gray-400 font-semibold leading-relaxed max-w-xl"
              >
                An investor-grade dashboard engineered to analyze resume ATS compatibility, detect critical keyword holes, rewrite bullet points with quantifiable STAR metrics, and structure personalized learning roadmaps.
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
                    Start Analyzing Free
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link 
                  href="/login"
                  onMouseEnter={() => setCursorHovered(true)}
                  onMouseLeave={() => setCursorHovered(false)}
                >
                  <Button variant="outline" className="h-11 px-6 border-white/10 hover:border-white/20 text-white hover:bg-white/5 rounded-xl text-xs font-black bg-white/[0.02] flex items-center gap-1.5 backdrop-blur-md hover:scale-[1.02] active:scale-[0.98] transition-all">
                    <Briefcase className="h-4 w-4 text-indigo-400" />
                    Open Sandbox
                  </Button>
                </Link>
              </motion.div>

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

            {/* Right Column - Premium AI Scanning Dashboard Panel */}
            <div className="lg:col-span-6 relative flex justify-center">
              <motion.div 
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.15 }}
                className="w-full max-w-[480px] rounded-3xl bg-slate-950/90 border border-white/[0.08] shadow-2xl relative p-6 backdrop-blur-xl overflow-hidden group hover:border-white/[0.12] transition-all duration-500 shadow-indigo-500/[0.03]"
              >
                {/* Embedded Grid Lines */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.01)_1px,transparent_1px)] [background-size:16px_16px] opacity-40 pointer-events-none" />

                {/* Animated Laser Scanning Line */}
                <motion.div 
                  animate={{ y: ["0%", "450%", "0%"] }}
                  transition={{ repeat: Infinity, duration: 5.5, ease: "easeInOut" }}
                  className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent opacity-70 blur-[2px] z-10 pointer-events-none"
                  style={{ top: '10%' }}
                />
                
                {/* Holographic Resume Panel Details */}
                <div className="space-y-6 relative z-10">
                  
                  {/* Title & ATS Ring */}
                  <div className="flex justify-between items-start pb-4 border-b border-white/[0.06]">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-0.5 bg-indigo-500/10 border border-indigo-500/20 text-[9px] font-black text-indigo-400 rounded-md">PARSING ACTIVE</span>
                        <span className="text-[10px] font-mono text-gray-500">v1.2.9</span>
                      </div>
                      <div className="h-4.5 w-36 bg-white/10 rounded-md animate-pulse" />
                      <div className="h-3 w-48 bg-white/5 rounded" />
                    </div>

                    {/* Circular ATS Ring with sweeping border */}
                    <div className="h-16 w-16 rounded-full border border-white/[0.08] bg-slate-900 flex flex-col items-center justify-center relative shrink-0 shadow-lg shadow-black">
                      <svg className="absolute inset-0 w-full h-full -rotate-90">
                        <circle cx="32" cy="32" r="28" fill="transparent" stroke="rgba(255,255,255,0.02)" strokeWidth="3" />
                        <motion.circle 
                          cx="32" cy="32" r="28" 
                          fill="transparent" 
                          stroke="rgb(99, 102, 241)" 
                          strokeWidth="3.5" 
                          strokeDasharray={175} 
                          animate={{ strokeDashoffset: 175 - (175 * atsScore) / 100 }}
                          transition={{ duration: 1.5, ease: "easeOut" }}
                        />
                      </svg>
                      <span className="text-[14px] font-black text-indigo-400 font-mono relative z-10">{atsScore}%</span>
                      <span className="text-[7px] text-gray-500 font-bold uppercase tracking-wider relative z-10">Score</span>
                    </div>
                  </div>

                  {/* Terminal parsing simulation */}
                  <div className="p-3.5 bg-black/60 border border-white/[0.04] rounded-2xl space-y-2 font-mono text-[9px] text-gray-400">
                    <div className="flex items-center justify-between text-indigo-400 border-b border-white/[0.03] pb-1.5 mb-1.5">
                      <div className="flex items-center space-x-1.5">
                        <Terminal className="w-3 h-3" />
                        <span>AI_ENGINE_SCANNER</span>
                      </div>
                      <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    </div>
                    <div className="space-y-1">
                      <p><span className="text-purple-400">INPUT:</span> "Srijan_Kumar_Resume.pdf"</p>
                      <p><span className="text-yellow-400">EXTRACTING:</span> <span className="text-gray-300">"Experienced software engineer..."</span></p>
                      <p><span className="text-emerald-400">ATS_MATCH:</span> 94% Skills compliance matched.</p>
                      <p className="text-gray-500 animate-pulse">&gt; Analyzing structural hierarchy... COMPLETE</p>
                    </div>
                  </div>

                  {/* Keyword Extraction Stream */}
                  <div className="space-y-2">
                    <div className="flex items-center space-x-1.5">
                      <Activity className="w-3.5 h-3.5 text-indigo-400" />
                      <span className="text-[9px] uppercase tracking-widest text-indigo-400 font-extrabold">Extracting Keywords</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded border transition-colors ${scanStep >= 0 ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-300 shadow-[0_0_10px_rgba(99,102,241,0.15)]' : 'bg-white/5 border-white/10 text-gray-500'}`}>TypeScript</span>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded border transition-colors ${scanStep >= 1 ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-300 shadow-[0_0_10px_rgba(99,102,241,0.15)]' : 'bg-white/5 border-white/10 text-gray-500'}`}>Next.js</span>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded border transition-colors ${scanStep >= 2 ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-300 shadow-[0_0_10px_rgba(99,102,241,0.15)]' : 'bg-white/5 border-white/10 text-gray-500'}`}>GraphQL</span>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded border transition-colors ${scanStep >= 3 ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-300 shadow-[0_0_10px_rgba(99,102,241,0.15)]' : 'bg-white/5 border-white/10 text-gray-500'}`}>MLOps</span>
                    </div>
                  </div>

                  {/* Optimization Preview Card */}
                  <div className="p-3 bg-white/[0.015] border border-white/[0.04] rounded-2xl space-y-2">
                    <div className="flex items-center space-x-1">
                      <Bot className="w-3 h-3 text-purple-400" />
                      <span className="text-[9px] font-extrabold tracking-wider text-purple-400 uppercase">AI Rewrite Optimizer</span>
                    </div>
                    <p className="text-[10px] text-gray-400 leading-relaxed">
                      "Transformed: <span className="text-gray-600 line-through">helped improve latency</span> into: <span className="text-white font-semibold">optimized dashboard render latencies by 42%</span>."
                    </p>
                  </div>
                </div>

                {/* Ambient glow behind card */}
                <div className="absolute -bottom-16 -right-16 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
              </motion.div>
            </div>

          </div>
        </div>
      </section>

      {/* Recruiter verification ribbon */}
      <section className="py-10 bg-[#07070a]/40 border-y border-white/[0.04] backdrop-blur-md relative overflow-hidden">
        <div className="container mx-auto px-4 max-w-7xl flex flex-wrap justify-around items-center gap-8 opacity-50 text-[10px] font-black tracking-widest text-gray-400 uppercase">
          <div className="flex items-center space-x-2">
            <Cpu className="w-4 h-4 text-indigo-400" />
            <span>AI ENGINE SCORING</span>
          </div>
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>100% PRIVATE SCAN</span>
          </div>
          <div className="flex items-center space-x-2">
            <Lock className="w-4 h-4 text-blue-400" />
            <span>ISO SECURITY STANDARDS</span>
          </div>
          <div className="flex items-center space-x-2">
            <Target className="w-4 h-4 text-purple-400" />
            <span>RECRUITER LEVEL VERIFIED</span>
          </div>
        </div>
      </section>

      {/* 5. ATS FEATURES SECTION */}
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

      {/* 6. AI WORKFLOW TIMELINE SECTION */}
      <section id="scanning-flow" className="py-28 bg-[#050508]/40 border-y border-white/[0.04] scroll-mt-12 relative">
        {/* Background connector line */}
        <div className="absolute top-[280px] bottom-[120px] left-1/2 -translate-x-1/2 w-0.5 bg-gradient-to-b from-indigo-500/40 via-purple-500/20 to-transparent z-0 hidden md:block" />

        <div className="container px-4 md:px-6 mx-auto max-w-7xl relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-indigo-500/20 bg-indigo-500/5 px-3 py-1 text-[9px] text-indigo-400 font-extrabold tracking-widest uppercase">
              <Compass className="h-3 w-3" />
              <span>Real-Time Processing</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-extrabold text-white leading-tight">
              Sleek AI Parsing Workflow
            </h2>
            <p className="text-gray-400 text-sm sm:text-base font-semibold leading-relaxed max-w-xl mx-auto">
              Follow our high-fidelity processing timeline showcasing exactly how Career Copilot digests, refines, and rates target resumes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            
            {/* Step 1 */}
            <div className="bg-[#07070a]/70 border border-white/[0.04] p-6 rounded-2xl hover:border-indigo-500/20 hover:scale-[1.01] transition-all duration-300 relative group flex flex-col justify-between h-64">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="h-10 w-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-xs font-black text-indigo-400 font-mono">01</div>
                  <span className="h-2 w-2 rounded-full bg-indigo-500/30 group-hover:bg-indigo-500 animate-ping" />
                </div>
                <h3 className="text-sm font-extrabold text-white">Parse & Extract</h3>
                <p className="text-[11px] font-semibold text-gray-400 leading-relaxed">
                  Upload your raw PDF draft; our text processing engines extract raw sentences, roles, dates, and keyword hashes.
                </p>
              </div>
              <span className="text-[9px] font-mono text-indigo-500 uppercase tracking-widest font-extrabold">Step 1 Completed</span>
            </div>

            {/* Step 2 */}
            <div className="bg-[#07070a]/70 border border-white/[0.04] p-6 rounded-2xl hover:border-purple-500/20 hover:scale-[1.01] transition-all duration-300 relative group flex flex-col justify-between h-64">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="h-10 w-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-xs font-black text-purple-400 font-mono">02</div>
                  <span className="h-2 w-2 rounded-full bg-purple-500/30 group-hover:bg-purple-500 animate-ping" />
                </div>
                <h3 className="text-sm font-extrabold text-white">ATS Rules Evaluation</h3>
                <p className="text-[11px] font-semibold text-gray-400 leading-relaxed">
                  Evaluate formatting structures, margin guidelines, double columns, abbreviations, and title patterns.
                </p>
              </div>
              <span className="text-[9px] font-mono text-purple-500 uppercase tracking-widest font-extrabold">Step 2 Active</span>
            </div>

            {/* Step 3 */}
            <div className="bg-[#07070a]/70 border border-white/[0.04] p-6 rounded-2xl hover:border-pink-500/20 hover:scale-[1.01] transition-all duration-300 relative group flex flex-col justify-between h-64">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="h-10 w-10 rounded-xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-xs font-black text-pink-400 font-mono">03</div>
                  <span className="h-2 w-2 rounded-full bg-pink-500/30 group-hover:bg-pink-500" />
                </div>
                <h3 className="text-sm font-extrabold text-white">STAR Metric Optimize</h3>
                <p className="text-[11px] font-semibold text-gray-400 leading-relaxed">
                  Advanced AI reviews accomplishments to automatically recommend high-impact metrics and phrasing.
                </p>
              </div>
              <span className="text-[9px] font-mono text-pink-500 uppercase tracking-widest font-extrabold">Step 3 Pending</span>
            </div>

            {/* Step 4 */}
            <div className="bg-[#07070a]/70 border border-white/[0.04] p-6 rounded-2xl hover:border-emerald-500/20 hover:scale-[1.01] transition-all duration-300 relative group flex flex-col justify-between h-64">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-xs font-black text-emerald-400 font-mono">04</div>
                  <span className="h-2 w-2 rounded-full bg-emerald-500/30 group-hover:bg-emerald-500" />
                </div>
                <h3 className="text-sm font-extrabold text-white">Job Target Matching</h3>
                <p className="text-[11px] font-semibold text-gray-400 leading-relaxed">
                  Simulate recruiting evaluations against specific job descriptions to yield real-time compatibility profiles.
                </p>
              </div>
              <span className="text-[9px] font-mono text-emerald-500 uppercase tracking-widest font-extrabold">Step 4 Pending</span>
            </div>

          </div>
        </div>
      </section>

      {/* 7. BEFORE / AFTER COMPARISON SECTION */}
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

      {/* 9. FINAL CTA SECTION */}
      <section className="py-28 relative overflow-hidden border-t border-white/[0.04]">
        {/* Cinematic Background mesh lights */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[300px] bg-gradient-to-r from-indigo-500/[0.04] to-purple-500/[0.04] blur-[150px] pointer-events-none rounded-full" />
        
        <div className="container px-4 md:px-6 mx-auto max-w-4xl text-center relative z-10 space-y-8">
          <h2 className="text-4xl md:text-5.5xl font-extrabold tracking-tight text-white leading-[1.1]">
            Ready to command your <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-pink-500">
              professional growth?
            </span>
          </h2>
          
          <p className="text-gray-400 text-sm font-semibold max-w-lg mx-auto leading-relaxed">
            Create your account today and experience investor-grade intelligence analysis, live editors, and tailored job match profiles inside a closed beta Career OS.
          </p>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-2">
            <Link 
              href="/signup"
              onMouseEnter={() => setCursorHovered(true)}
              onMouseLeave={() => setCursorHovered(false)}
            >
              <Button className="h-12 px-8 bg-white hover:bg-slate-200 text-black rounded-xl text-xs font-black shadow-lg shadow-white/5 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-1.5">
                Access Sandbox Now
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="pt-6 border-t border-white/[0.04] max-w-md mx-auto flex justify-center gap-6 opacity-60">
            <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              ATS Scored Verified
            </span>
            <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-purple-400" />
              STAR Compliant
            </span>
          </div>

          <p className="text-[9px] uppercase tracking-widest font-black text-gray-600">
            Engineered and optimized for ambitious developers & leaders.
          </p>
        </div>
      </section>

      {/* 10. FOOTER */}
      <footer className="py-10 border-t border-white/[0.03] bg-[#030303] relative z-10">
        <div className="container mx-auto px-4 max-w-7xl flex flex-col sm:flex-row justify-between items-center gap-6 text-[10px] font-black text-gray-500 uppercase tracking-widest">
          <span>© 2026 Career Copilot Inc.</span>
          <div className="flex space-x-8">
            <a href="#features" className="hover:text-white transition-colors" onMouseEnter={() => setCursorHovered(true)} onMouseLeave={() => setCursorHovered(false)}>Features</a>
            <a href="#scanning-flow" className="hover:text-white transition-colors" onMouseEnter={() => setCursorHovered(true)} onMouseLeave={() => setCursorHovered(false)}>Flow</a>
            <a href="#faq" className="hover:text-white transition-colors" onMouseEnter={() => setCursorHovered(true)} onMouseLeave={() => setCursorHovered(false)}>FAQ</a>
          </div>
        </div>
      </footer>

    </div>
  );
}
