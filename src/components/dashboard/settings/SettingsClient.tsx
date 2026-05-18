'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Sparkles, Settings2, Download, Link2, Shield, ArrowLeft, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const SETTINGS_TABS = [
  { id: 'profile', label: 'Profile Settings', icon: User },
  { id: 'career', label: 'Career Focus', icon: Sparkles },
  { id: 'ai', label: 'AI Intelligence', icon: Settings2 },
  { id: 'export', label: 'Export Presets', icon: Download },
  { id: 'connections', label: 'API & Connections', icon: Link2 },
  { id: 'privacy', label: 'Security & Trust', icon: Shield },
];

export function SettingsClient() {
  const [activeTab, setActiveTab] = useState('profile');
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Form states
  const [recruiterMode, setRecruiterMode] = useState(true);
  const [atsOptimization, setAtsOptimization] = useState(false);
  const [telemetry, setTelemetry] = useState(true);
  const [developerLog, setDeveloperLog] = useState(false);

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setUser(data.user);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#030303] flex items-center justify-center select-none">
        <motion.div 
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="text-gray-500 font-semibold text-xs tracking-widest uppercase flex items-center gap-2"
        >
          <Loader2 className="w-4 h-4 text-indigo-500 animate-spin" />
          Loading Settings Profile...
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#030303] text-white pt-24 pb-32 select-none relative overflow-hidden">
      
      {/* Background visual graphics */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/[0.015] rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-500/[0.01] rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-6 md:px-10 relative z-10">
        
        {/* Header */}
        <div className="mb-10">
          <Link href="/dashboard" className="text-gray-400 hover:text-white flex items-center mb-6 text-xs font-black uppercase tracking-wider transition-colors w-max">
            <ArrowLeft className="w-3.5 h-3.5 mr-2" /> Back to Dashboard
          </Link>
          <div className="flex items-center space-x-2 text-[10px] text-gray-500 uppercase tracking-widest font-black mb-2">
            <span>Career Copilot</span>
            <span>/</span>
            <span className="text-indigo-400">Settings console</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white">
            Console Controls
          </h1>
          <p className="text-gray-400 text-xs font-semibold mt-1">Configure your premium career intelligence environment</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-10">
          {/* Sidebar */}
          <aside className="w-full lg:w-64 shrink-0">
            <nav className="space-y-1">
              {SETTINGS_TABS.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center px-4 py-3 rounded-2xl transition-all duration-200 relative group
                      ${isActive ? 'text-indigo-400 font-extrabold' : 'text-gray-400 hover:text-gray-200 font-semibold'}`}
                  >
                    <Icon className={`w-4 h-4 mr-3 transition-colors ${isActive ? 'text-indigo-400' : 'group-hover:text-gray-300'}`} />
                    <span className="text-xs uppercase tracking-wider">{tab.label}</span>
                    {isActive && (
                      <motion.div layoutId="activeSettingsTab" className="absolute inset-0 bg-indigo-500/5 border border-indigo-500/10 rounded-2xl -z-10" />
                    )}
                  </button>
                );
              })}
            </nav>
          </aside>

          {/* Main Content Area */}
          <main className="flex-1 bg-[#0a0a0f]/80 backdrop-blur-3xl border border-white/[0.06] rounded-3xl p-8 min-h-[550px] shadow-2xl relative overflow-hidden">
            <div className="absolute top-[-20%] right-[-20%] w-24 h-24 bg-white/[0.01] rounded-full blur-xl pointer-events-none" />
            
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-8"
              >
                
                {/* 1. PROFILE TAB */}
                {activeTab === 'profile' && (
                  <div className="space-y-8">
                    <div>
                      <h2 className="text-base font-black text-white uppercase tracking-wider">Profile Credentials</h2>
                      <p className="text-[10px] text-gray-500 mt-0.5">Manage your identity details inside the Career OS platform.</p>
                    </div>

                    <div className="flex items-center space-x-6">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-white/10 flex items-center justify-center shrink-0">
                        <User className="w-7 h-7 text-indigo-400" />
                      </div>
                      <div>
                        <Button className="bg-white hover:bg-gray-200 text-black font-black text-xs uppercase tracking-wider py-1.5 px-4 rounded-xl shadow">Upload Avatar</Button>
                        <p className="text-[10px] text-gray-500 mt-1.5 font-semibold">Recommended size: 400x400px. Max 2MB.</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="grid gap-2">
                        <label className="text-[10px] font-black uppercase tracking-wider text-gray-400">Display Name</label>
                        <input type="text" defaultValue={user?.name || 'Member'} className="w-full bg-black/40 border border-white/10 hover:border-white/20 focus:border-indigo-500 rounded-xl px-4 py-3 text-xs font-semibold text-white focus:outline-none transition-all" />
                      </div>
                      <div className="grid gap-2">
                        <label className="text-[10px] font-black uppercase tracking-wider text-gray-400">Email Address</label>
                        <input type="email" defaultValue={user?.email || 'user@example.com'} readOnly className="w-full bg-black/20 border border-white/5 rounded-xl px-4 py-3 text-xs font-semibold text-gray-500 outline-none cursor-not-allowed" />
                      </div>
                      <div className="grid gap-2">
                        <label className="text-[10px] font-black uppercase tracking-wider text-gray-400">Professional Summary</label>
                        <textarea rows={3} defaultValue="Senior Software Engineer focused on technical systems architecture and premium SaaS solutions." className="w-full bg-black/40 border border-white/10 hover:border-white/20 focus:border-indigo-500 rounded-xl px-4 py-3 text-xs font-semibold text-white focus:outline-none transition-all resize-none" />
                      </div>
                    </div>

                    <Button className="bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs uppercase tracking-wider rounded-xl px-6 py-2.5 shadow-md">Save Changes</Button>
                  </div>
                )}

                {/* 2. CAREER TAB */}
                {activeTab === 'career' && (
                  <div className="space-y-8">
                    <div>
                      <h2 className="text-base font-black text-white uppercase tracking-wider">Career Focus</h2>
                      <p className="text-[10px] text-gray-500 mt-0.5">Determine role types and key target parameters for scoring simulations.</p>
                    </div>

                    <div className="space-y-4">
                      <div className="grid gap-2">
                        <label className="text-[10px] font-black uppercase tracking-wider text-gray-400">Target Role Title</label>
                        <input type="text" placeholder="e.g. Senior Staff Engineer" defaultValue="Senior Software Engineer" className="w-full bg-black/40 border border-white/10 hover:border-white/20 focus:border-indigo-500 rounded-xl px-4 py-3 text-xs font-semibold text-white focus:outline-none transition-all" />
                      </div>

                      <div className="grid gap-2">
                        <label className="text-[10px] font-black uppercase tracking-wider text-gray-400">Desired Base Compensation</label>
                        <select className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs font-semibold text-white focus:outline-none transition-all">
                          <option>$120k – $150k USD</option>
                          <option>$150k – $180k USD</option>
                          <option>$180k – $220k USD</option>
                          <option>$220k+ USD</option>
                        </select>
                      </div>

                      <div className="grid gap-2">
                        <label className="text-[10px] font-black uppercase tracking-wider text-gray-400">Preferred Work Model</label>
                        <div className="grid grid-cols-3 gap-3">
                          <div className="px-4 py-3 bg-indigo-500/5 border border-indigo-500/20 text-indigo-400 rounded-xl text-center text-xs font-extrabold cursor-pointer">Remote</div>
                          <div className="px-4 py-3 bg-black/40 border border-white/5 text-gray-400 rounded-xl text-center text-xs font-semibold hover:border-white/10 cursor-pointer">Hybrid</div>
                          <div className="px-4 py-3 bg-black/40 border border-white/5 text-gray-400 rounded-xl text-center text-xs font-semibold hover:border-white/10 cursor-pointer">Onsite</div>
                        </div>
                      </div>
                    </div>

                    <Button className="bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs uppercase tracking-wider rounded-xl px-6 py-2.5 shadow-md">Update Parameters</Button>
                  </div>
                )}

                {/* 3. AI TAB */}
                {activeTab === 'ai' && (
                  <div className="space-y-8">
                    <div>
                      <h2 className="text-base font-black text-white uppercase tracking-wider">AI Intelligence</h2>
                      <p className="text-[10px] text-gray-500 mt-0.5">Customize AI cognitive engine properties and behavior rules.</p>
                    </div>

                    <div className="space-y-4">
                      <div className="p-4 border border-white/[0.06] bg-white/[0.01] rounded-2xl flex justify-between items-center group">
                        <div>
                          <h4 className="text-xs font-bold text-white">Recruiter-Focused Mode</h4>
                          <p className="text-[10px] text-gray-500 mt-1 font-semibold">Prioritize metrics, stack clarity, and technical scopes in audits.</p>
                        </div>
                        <div 
                          onClick={() => setRecruiterMode(!recruiterMode)}
                          className={`w-10 h-5.5 rounded-full relative cursor-pointer transition-all duration-300 ${recruiterMode ? 'bg-indigo-600' : 'bg-white/10'}`}
                        >
                          <motion.div 
                            layout 
                            className="w-4 h-4 bg-white rounded-full absolute top-1 shadow-sm" 
                            style={{ right: recruiterMode ? 4 : 'auto', left: recruiterMode ? 'auto' : 4 }}
                          />
                        </div>
                      </div>

                      <div className="p-4 border border-white/[0.06] bg-white/[0.01] rounded-2xl flex justify-between items-center group">
                        <div>
                          <h4 className="text-xs font-bold text-white">Aggressive ATS Optimization</h4>
                          <p className="text-[10px] text-gray-500 mt-1 font-semibold">Force keyword clustering algorithms for older parsing engines.</p>
                        </div>
                        <div 
                          onClick={() => setAtsOptimization(!atsOptimization)}
                          className={`w-10 h-5.5 rounded-full relative cursor-pointer transition-all duration-300 ${atsOptimization ? 'bg-indigo-600' : 'bg-white/10'}`}
                        >
                          <motion.div 
                            layout 
                            className="w-4 h-4 bg-white rounded-full absolute top-1 shadow-sm" 
                            style={{ right: atsOptimization ? 4 : 'auto', left: atsOptimization ? 'auto' : 4 }}
                          />
                        </div>
                      </div>

                      <div className="grid gap-2">
                        <label className="text-[10px] font-black uppercase tracking-wider text-gray-400">Default Writing Tone</label>
                        <select className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs font-semibold text-white focus:outline-none transition-all">
                          <option>Confident & Quantitative</option>
                          <option>Humble & Execution-Focused</option>
                          <option>Strategic & Narrative-Driven</option>
                        </select>
                      </div>
                    </div>

                    <Button className="bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs uppercase tracking-wider rounded-xl px-6 py-2.5 shadow-md">Apply Presets</Button>
                  </div>
                )}

                {/* 4. EXPORT TAB */}
                {activeTab === 'export' && (
                  <div className="space-y-8">
                    <div>
                      <h2 className="text-base font-black text-white uppercase tracking-wider">Export Presets</h2>
                      <p className="text-[10px] text-gray-500 mt-0.5">Control PDF renderer bounds, paper layouts, and style bounds.</p>
                    </div>

                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-indigo-500/5 border border-indigo-500/20 rounded-2xl select-none">
                          <h4 className="text-xs font-bold text-indigo-400">A4 ISO Boundary</h4>
                          <p className="text-[10px] text-gray-500 mt-1 font-semibold">Standard European and international recruitment layout. (794px scale)</p>
                        </div>
                        <div className="p-4 bg-black/40 border border-white/5 rounded-2xl select-none hover:border-white/10 cursor-pointer">
                          <h4 className="text-xs font-bold text-gray-300">US Letter Bounds</h4>
                          <p className="text-[10px] text-gray-500 mt-1 font-semibold">US domestic standard margin layouts. (816px scale)</p>
                        </div>
                      </div>

                      <div className="p-4 border border-white/[0.06] bg-white/[0.01] rounded-2xl">
                        <h4 className="text-xs font-bold text-white mb-2">Automated Page Alignment</h4>
                        <p className="text-[10px] text-gray-500 font-semibold leading-relaxed">
                          The system dynamically measures print coordinates to eliminate loose trailing lines or orphan titles. It automatically forces clean multi-page boundary splits on PDF print compilation.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* 5. CONNECTIONS TAB */}
                {activeTab === 'connections' && (
                  <div className="space-y-8">
                    <div>
                      <h2 className="text-base font-black text-white uppercase tracking-wider">API & Connected Platforms</h2>
                      <p className="text-[10px] text-gray-500 mt-0.5">Manage external platforms, sandbox access codes, and profile webhooks.</p>
                    </div>

                    <div className="space-y-4">
                      {/* GitHub Connection */}
                      <div className="p-4 border border-white/[0.06] bg-white/[0.01] rounded-2xl flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-white/5 rounded-lg text-white">
                            <Link2 className="w-4 h-4" />
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-white">GitHub Account Sync</h4>
                            <p className="text-[9px] text-emerald-400 font-black uppercase tracking-wider mt-0.5">CONNECTED</p>
                          </div>
                        </div>
                        <button className="px-3.5 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-wider text-gray-300">Disconnect</button>
                      </div>

                      {/* LinkedIn mock */}
                      <div className="p-4 border border-white/[0.06] bg-white/[0.01] rounded-2xl flex items-center justify-between opacity-50">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-white/5 rounded-lg text-white">
                            <Link2 className="w-4 h-4" />
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-white">LinkedIn Profile API</h4>
                            <p className="text-[9px] text-gray-500 font-black uppercase tracking-wider mt-0.5">UNLINKED</p>
                          </div>
                        </div>
                        <button className="px-3.5 py-1.5 bg-indigo-600/10 hover:bg-indigo-600/20 border border-indigo-500/20 rounded-xl text-[10px] font-black uppercase tracking-wider text-indigo-400">Connect</button>
                      </div>
                    </div>
                  </div>
                )}

                {/* 6. PRIVACY TAB */}
                {activeTab === 'privacy' && (
                  <div className="space-y-8">
                    <div>
                      <h2 className="text-base font-black text-white uppercase tracking-wider">Security & Trust Console</h2>
                      <p className="text-[10px] text-gray-500 mt-0.5">Ensure absolute control over document retention limits and telemetry logs.</p>
                    </div>

                    <div className="space-y-4">
                      <div className="p-4 border border-white/[0.06] bg-white/[0.01] rounded-2xl flex justify-between items-center group">
                        <div>
                          <h4 className="text-xs font-bold text-white">Telemetry & Experience Logs</h4>
                          <p className="text-[10px] text-gray-500 mt-1 font-semibold">Share anonymous, encrypted token parsing patterns to improve models.</p>
                        </div>
                        <div 
                          onClick={() => setTelemetry(!telemetry)}
                          className={`w-10 h-5.5 rounded-full relative cursor-pointer transition-all duration-300 ${telemetry ? 'bg-indigo-600' : 'bg-white/10'}`}
                        >
                          <motion.div 
                            layout 
                            className="w-4 h-4 bg-white rounded-full absolute top-1 shadow-sm" 
                            style={{ right: telemetry ? 4 : 'auto', left: telemetry ? 'auto' : 4 }}
                          />
                        </div>
                      </div>

                      <div className="p-4 border border-white/[0.06] bg-white/[0.01] rounded-2xl flex justify-between items-center group">
                        <div>
                          <h4 className="text-xs font-bold text-white">Developer Debug Logs</h4>
                          <p className="text-[10px] text-gray-500 mt-1 font-semibold">Expose circuit breaker stats and API logs on the client dashboard.</p>
                        </div>
                        <div 
                          onClick={() => setDeveloperLog(!developerLog)}
                          className={`w-10 h-5.5 rounded-full relative cursor-pointer transition-all duration-300 ${developerLog ? 'bg-indigo-600' : 'bg-white/10'}`}
                        >
                          <motion.div 
                            layout 
                            className="w-4 h-4 bg-white rounded-full absolute top-1 shadow-sm" 
                            style={{ right: developerLog ? 4 : 'auto', left: developerLog ? 'auto' : 4 }}
                          />
                        </div>
                      </div>

                      <div className="p-4 border border-red-500/10 bg-red-500/[0.02] rounded-2xl">
                        <h4 className="text-xs font-bold text-red-400 flex items-center gap-1.5">
                          <AlertCircle className="w-3.5 h-3.5" />
                          Purge Session Data
                        </h4>
                        <p className="text-[10px] text-gray-500 mt-1 font-semibold leading-relaxed mb-4">
                          This deletes all localStorage draft entries, cache overrides, and active resume hashes. This action is instantaneous and irreversible.
                        </p>
                        <button className="px-4 py-2 bg-red-950/20 hover:bg-red-950/40 border border-red-900/30 hover:border-red-500/30 rounded-xl text-[10px] font-black uppercase tracking-wider text-red-400 transition-colors">
                          Purge Local Workspace
                        </button>
                      </div>
                    </div>
                  </div>
                )}

              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>
    </div>
  );
}
