import AuthForm from '@/components/auth/AuthForm';
import MobileAuthHero from '@/components/auth/MobileAuthHero';
import Link from 'next/link';
import { BrainCircuit, ShieldCheck, Lock, Activity, Award } from 'lucide-react';

export const metadata = {
  title: 'Sign Up - Career Copilot',
  description: 'Create a free sandbox account on our Career Intelligence platform.',
};

export default function SignupPage() {
  return (
    <div className="min-h-screen bg-[#030303] text-slate-100 flex items-stretch relative overflow-hidden">

      {/* Background gradients — shared desktop+mobile */}
      <div className="absolute top-1/4 left-1/4 -z-10 w-[500px] h-[500px] opacity-10 bg-indigo-500/20 blur-[130px] rounded-full" />

      {/* Left Column — Auth Form column (full width on mobile, 48% on desktop) */}
      <div className="w-full lg:w-[48%] flex flex-col relative z-10">

        {/* ── MOBILE HERO (hidden on lg+) ── */}
        <MobileAuthHero type="signup" />

        {/* ── Form section ── */}
        <div className="flex flex-col justify-between flex-1 px-6 pb-8 lg:p-10">

          {/* Desktop-only logo header */}
          <div className="hidden lg:flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2.5 group">
              <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center border border-white/10 group-hover:scale-105 transition-transform">
                <BrainCircuit className="h-4.5 w-4.5 text-white" />
              </div>
              <span className="font-extrabold text-sm tracking-tight text-white group-hover:text-slate-200 transition-colors">
                Career Copilot
              </span>
            </Link>
          </div>

          {/* Form card */}
          <div className="lg:my-auto lg:py-8">
            {/* Mobile card wrapper — extra glow and tighter radius */}
            <div className="lg:hidden mb-6 relative">
              <div className="absolute -inset-[1px] rounded-[28px] bg-gradient-to-br from-indigo-500/20 via-purple-500/10 to-transparent pointer-events-none" />
              <div className="relative bg-[#0a0a10]/80 backdrop-blur-3xl rounded-[26px] p-6 border border-white/[0.07] shadow-2xl overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-[40px] pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-purple-500/8 rounded-full blur-[30px] pointer-events-none" />
                <AuthForm type="signup" />
              </div>
            </div>
            {/* Desktop — unchanged AuthForm rendering */}
            <div className="hidden lg:block">
              <AuthForm type="signup" />
            </div>

            <p className="mt-6 text-center text-xs font-bold text-gray-500 uppercase tracking-widest">
              Already have an account?{' '}
              <Link href="/login" className="text-indigo-400 hover:text-indigo-300 font-extrabold transition-colors">
                Log in instead
              </Link>
            </p>
          </div>

          <div className="flex items-center justify-between text-[9px] font-bold text-gray-600 uppercase tracking-widest">
            <span>AES-256 SECURED CONNECTION</span>
            <span>CLOSED BETA</span>
          </div>
        </div>
      </div>

      {/* Right Column — Visual Panel — desktop only, 100% unchanged */}
      <div className="hidden lg:flex lg:w-[52%] bg-[#06060a]/60 border-l border-white/[0.06] relative p-12 flex-col justify-between overflow-hidden">

        {/* Floating background node meshes */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/[0.03] rounded-full blur-[140px]" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-500/[0.02] rounded-full blur-[120px]" />
        <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.01)_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" />

        <div className="space-y-4 max-w-lg relative z-10 pt-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/5 px-3 py-1 text-[10px] text-indigo-400 font-extrabold tracking-wide uppercase">
            <Activity className="h-3.5 w-3.5" />
            <span>Interactive Node Sandbox</span>
          </div>
          <h2 className="text-3xl font-black text-white leading-tight">
            Register your profile to deploy professional templates.
          </h2>
          <p className="text-xs text-gray-400 font-semibold leading-relaxed">
            Configure elegant, ATS-compliant templates to display accomplishments properly, build dynamic skills dashboards, and generate roadmaps instantly.
          </p>
        </div>

        {/* Mock Graphic Console */}
        <div className="w-full max-w-lg aspect-[1.8/1] rounded-3xl bg-black/60 border border-white/[0.06] p-6 shadow-2xl relative overflow-hidden backdrop-blur-md">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.005)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.005)_1px,transparent_1px)] [background-size:12px_12px]" />
          <div className="space-y-4 relative z-10">
            <div className="flex items-center justify-between pb-3.5 border-b border-white/[0.05]">
              <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-400">Security Access Logs</span>
              <div className="flex items-center space-x-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[9px] font-bold text-gray-500">READY</span>
              </div>
            </div>
            <div className="space-y-2 font-mono text-[9px] text-gray-500">
              <p className="flex justify-between"><span>[INIT] SSL HANDSHAKE CONNECTED</span> <span className="text-emerald-500">OK</span></p>
              <p className="flex justify-between"><span>[INTEGRITY] SHA-256 RESUME TEXT VALIDATION</span> <span className="text-indigo-400">ENCRYPTED</span></p>
              <p className="flex justify-between"><span>[AI] ADVANCED COPROCESSOR ORCHESTRATION</span> <span className="text-purple-400">LINKED</span></p>
              <p className="flex justify-between"><span>[DATABASE] MONGODB SECURE TRANSACTION CHANNEL</span> <span className="text-emerald-500">STABLE</span></p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6 relative z-10 max-w-lg">
          <div className="space-y-1">
            <div className="flex items-center space-x-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-[10px] font-black uppercase text-white">ATS SAFE</span>
            </div>
            <p className="text-[9px] text-gray-500 font-semibold">Crawler compliant</p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center space-x-1.5">
              <Lock className="w-3.5 h-3.5 text-blue-400" />
              <span className="text-[10px] font-black uppercase text-white">ENCRYPTED</span>
            </div>
            <p className="text-[9px] text-gray-500 font-semibold">100% data control</p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center space-x-1.5">
              <Award className="w-3.5 h-3.5 text-purple-400" />
              <span className="text-[10px] font-black uppercase text-white">RECRUITER TRUST</span>
            </div>
            <p className="text-[9px] text-gray-500 font-semibold">STAR optimized</p>
          </div>
        </div>

      </div>

    </div>
  );
}
