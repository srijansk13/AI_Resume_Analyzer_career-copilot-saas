'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Sparkles, Settings2, Download, Link2, Shield,
  ArrowLeft, Loader2, CheckCircle2, AlertCircle, Menu, X,
  Save, RefreshCw, Trash2, ToggleLeft, ToggleRight, ChevronRight,
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

// ─── Types ─────────────────────────────────────────────────────────────────────

interface UserPreferences {
  professionalSummary: string;
  targetRoleTitle: string;
  desiredCompensation: string;
  preferredWorkModel: 'Remote' | 'Hybrid' | 'Onsite';
  recruiterMode: boolean;
  atsOptimization: boolean;
  defaultWritingTone: string;
  exportPaperSize: 'A4' | 'Letter';
  telemetry: boolean;
  developerLog: boolean;
  resumeLinkAutoDetect: boolean;
}

interface UserData {
  id: string;
  name: string;
  email: string;
  tier: string;
  preferences: Partial<UserPreferences>;
}

const DEFAULT_PREFS: UserPreferences = {
  professionalSummary: '',
  targetRoleTitle: '',
  desiredCompensation: '$120k – $150k USD',
  preferredWorkModel: 'Remote',
  recruiterMode: true,
  atsOptimization: false,
  defaultWritingTone: 'Confident & Quantitative',
  exportPaperSize: 'A4',
  telemetry: true,
  developerLog: false,
  resumeLinkAutoDetect: true,
};

// ─── Tabs ──────────────────────────────────────────────────────────────────────

const SETTINGS_TABS = [
  { id: 'profile', label: 'Profile Settings', icon: User },
  { id: 'career', label: 'Career Focus', icon: Sparkles },
  { id: 'ai', label: 'AI Intelligence', icon: Settings2 },
  { id: 'export', label: 'Export Presets', icon: Download },
  { id: 'connections', label: 'API & Connections', icon: Link2 },
  { id: 'privacy', label: 'Security & Trust', icon: Shield },
];

// ─── Reusable Components ───────────────────────────────────────────────────────

function Toggle({
  checked,
  onChange,
  disabled = false,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={() => !disabled && onChange(!checked)}
      disabled={disabled}
      aria-checked={checked}
      role="switch"
      className={`relative flex-shrink-0 w-11 h-6 rounded-full transition-all duration-300 outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
        checked ? 'bg-indigo-600' : 'bg-white/10'
      } ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      <motion.div
        layout
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-md"
        style={{ left: checked ? 'calc(100% - 20px)' : '4px' }}
      />
    </button>
  );
}

function SettingRow({
  title,
  description,
  checked,
  onChange,
  disabled = false,
}: {
  title: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <div className="p-4 border border-white/[0.06] bg-white/[0.01] rounded-2xl flex justify-between items-center gap-4">
      <div className="min-w-0">
        <h4 className="text-xs font-bold text-white">{title}</h4>
        <p className="text-[10px] text-gray-500 mt-0.5 font-semibold leading-relaxed">{description}</p>
      </div>
      <Toggle checked={checked} onChange={onChange} disabled={disabled} />
    </div>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="text-[10px] font-black uppercase tracking-wider text-gray-400 block mb-2">
      {children}
    </label>
  );
}

function TextInput({
  value,
  onChange,
  placeholder,
  readOnly = false,
  type = 'text',
}: {
  value: string;
  onChange?: (v: string) => void;
  placeholder?: string;
  readOnly?: boolean;
  type?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={e => onChange?.(e.target.value)}
      placeholder={placeholder}
      readOnly={readOnly}
      className={`w-full rounded-xl px-4 py-3 text-xs font-semibold focus:outline-none transition-all ${
        readOnly
          ? 'bg-black/20 border border-white/5 text-gray-500 cursor-not-allowed'
          : 'bg-black/40 border border-white/10 hover:border-white/20 focus:border-indigo-500 text-white'
      }`}
    />
  );
}

function SelectInput({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className="w-full bg-black/40 border border-white/10 hover:border-white/20 focus:border-indigo-500 rounded-xl px-4 py-3 text-xs font-semibold text-white focus:outline-none transition-all"
    >
      {options.map(opt => (
        <option key={opt} value={opt}>{opt}</option>
      ))}
    </select>
  );
}

function SaveButton({ onClick, saving, saved }: { onClick: () => void; saving: boolean; saved: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={saving}
      className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white font-black text-[10px] uppercase tracking-wider rounded-xl px-5 py-2.5 shadow-md transition-all"
    >
      {saving ? (
        <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving…</>
      ) : saved ? (
        <><CheckCircle2 className="w-3.5 h-3.5" /> Saved!</>
      ) : (
        <><Save className="w-3.5 h-3.5" /> Save Changes</>
      )}
    </button>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

export function SettingsClient() {
  const [activeTab, setActiveTab] = useState('profile');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedTab, setSavedTab] = useState<string | null>(null);
  const [showPurgeModal, setShowPurgeModal] = useState(false);

  // User identity
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [tier, setTier] = useState('free');

  // All preferences as flat state (loaded from backend)
  const [prefs, setPrefs] = useState<UserPreferences>(DEFAULT_PREFS);

  // ── Load from backend ──────────────────────────────────────────────────────
  useEffect(() => {
    fetch('/api/user/preferences')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.user) {
          const u = data.user;
          setName(u.name ?? '');
          setEmail(u.email ?? '');
          setTier(u.tier ?? 'free');
          setPrefs({ ...DEFAULT_PREFS, ...u.preferences });
        }
      })
      .catch(() => {
        toast.error('Failed to load settings.');
      })
      .finally(() => setLoading(false));
  }, []);

  // ── Save handler ───────────────────────────────────────────────────────────
  const save = useCallback(async (tabId: string, overridePrefs?: Partial<UserPreferences>, overrideName?: string) => {
    setSaving(true);
    try {
      const body: any = { preferences: overridePrefs ?? prefs };
      if (overrideName !== undefined) body.name = overrideName;
      else if (tabId === 'profile') body.name = name;

      const res = await fetch('/api/user/preferences', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error ?? 'Save failed');

      // Sync state
      if (data.user) {
        setName(data.user.name ?? name);
        setPrefs({ ...DEFAULT_PREFS, ...data.user.preferences });
        // Persist target role for use across the app
        if (data.user.preferences?.targetRoleTitle) {
          localStorage.setItem('cc_targetRole', data.user.preferences.targetRoleTitle);
        }
        if (data.user.preferences?.exportPaperSize) {
          localStorage.setItem('cc_exportPaperSize', data.user.preferences.exportPaperSize);
        }
        if (typeof data.user.preferences?.developerLog !== 'undefined') {
          localStorage.setItem('cc_devLog', String(data.user.preferences.developerLog));
        }
      }

      setSavedTab(tabId);
      toast.success('Settings saved successfully.');
      setTimeout(() => setSavedTab(null), 2500);
    } catch {
      toast.error('Failed to save settings.');
    } finally {
      setSaving(false);
    }
  }, [prefs, name]);

  // ── Purge session data ─────────────────────────────────────────────────────
  const purgeSessionData = () => {
    const keysToKeep: string[] = []; // keep nothing from cc_ namespace except intentional
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key) continue;
      if (
        key.startsWith('cc_draft_') ||
        key.startsWith('cc_editor_') ||
        key === 'activeResume' ||
        key === 'resumeDraft' ||
        key === 'editorDraft'
      ) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(k => localStorage.removeItem(k));
    setShowPurgeModal(false);
    toast.success(`Purged ${keysToRemove.length} local workspace item(s).`);
  };

  const setPref = <K extends keyof UserPreferences>(key: K, value: UserPreferences[K]) => {
    setPrefs(p => ({ ...p, [key]: value }));
  };

  // ── Loading state ──────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-[#030303] flex items-center justify-center select-none">
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="text-gray-500 font-semibold text-xs tracking-widest uppercase flex items-center gap-2"
        >
          <Loader2 className="w-4 h-4 text-indigo-500 animate-spin" />
          Loading Settings Profile…
        </motion.div>
      </div>
    );
  }

  // ── Initials avatar ────────────────────────────────────────────────────────
  const initials = name
    .split(' ')
    .map(w => w[0] ?? '')
    .join('')
    .toUpperCase()
    .slice(0, 2);

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#030303] text-white pt-24 pb-32 select-none relative overflow-hidden mobile-safe-bottom">

      {/* Background visual graphics */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/[0.015] rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-500/[0.01] rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-6 md:px-10 relative z-10">

        {/* Header */}
        <div className="mb-6 lg:mb-10 flex flex-col lg:flex-row justify-between lg:items-end gap-4">
          <div>
            <Link href="/dashboard" className="text-gray-400 hover:text-white flex items-center mb-6 text-xs font-black uppercase tracking-wider transition-colors w-max">
              <ArrowLeft className="w-3.5 h-3.5 mr-2" /> Back to Dashboard
            </Link>
            <div className="flex items-center space-x-2 text-[10px] text-gray-500 uppercase tracking-widest font-black mb-2">
              <span>Career Copilot</span>
              <span>/</span>
              <span className="text-indigo-400">Settings Console</span>
            </div>
            <h1 className="text-2xl md:text-4xl font-black tracking-tight text-white">Console Controls</h1>
            <p className="text-gray-400 text-[11px] md:text-xs font-semibold mt-1">Configure your premium career intelligence environment</p>
          </div>

          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="lg:hidden flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.02] border border-white/5 text-gray-300 font-bold text-xs outline-none w-max"
          >
            <Menu className="w-4 h-4" />
            <span>Settings Menu</span>
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 lg:gap-10">

          {/* Desktop Sidebar */}
          <aside className="hidden lg:block w-64 shrink-0">
            <nav className="space-y-1">
              {SETTINGS_TABS.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center px-4 py-3 rounded-2xl transition-all duration-200 relative group ${
                      isActive ? 'text-indigo-400 font-extrabold' : 'text-gray-400 hover:text-gray-200 font-semibold'
                    }`}
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

          {/* Main Content */}
          <main className="flex-1 bg-[#0a0a0f]/80 backdrop-blur-3xl border border-white/[0.06] rounded-3xl p-6 md:p-8 min-h-[550px] shadow-2xl relative overflow-hidden">
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

                {/* ── 1. PROFILE TAB ──────────────────────────────────────── */}
                {activeTab === 'profile' && (
                  <div className="space-y-8">
                    <div>
                      <h2 className="text-base font-black text-white uppercase tracking-wider">Profile Credentials</h2>
                      <p className="text-[10px] text-gray-500 mt-0.5">Manage your identity details inside the Career OS platform.</p>
                    </div>

                    {/* Avatar — initials-based, no fake upload */}
                    <div className="flex items-center space-x-5">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500/30 to-purple-500/30 border border-white/10 flex items-center justify-center shrink-0">
                        <span className="text-2xl font-black text-white">{initials || '?'}</span>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white">Profile Avatar</p>
                        <p className="text-[10px] text-gray-500 mt-1 font-semibold leading-relaxed">Your initials are used as your avatar. Avatar photo upload is coming in a future release.</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <FieldLabel>Display Name</FieldLabel>
                        <TextInput value={name} onChange={setName} placeholder="Your full name" />
                      </div>
                      <div>
                        <FieldLabel>Email Address <span className="normal-case text-gray-600 ml-1">(read-only)</span></FieldLabel>
                        <TextInput value={email} readOnly type="email" />
                        <p className="text-[10px] text-gray-600 mt-1.5">Your email is managed by the authentication system and cannot be changed here.</p>
                      </div>
                      <div>
                        <FieldLabel>Professional Summary</FieldLabel>
                        <textarea
                          rows={3}
                          value={prefs.professionalSummary}
                          onChange={e => setPref('professionalSummary', e.target.value)}
                          placeholder="A brief description of your professional identity and career goals…"
                          className="w-full bg-black/40 border border-white/10 hover:border-white/20 focus:border-indigo-500 rounded-xl px-4 py-3 text-xs font-semibold text-white focus:outline-none transition-all resize-none"
                        />
                        <p className="text-[10px] text-gray-600 mt-1.5">Used to personalize AI feedback tone and career roadmap context.</p>
                      </div>
                    </div>

                    <SaveButton onClick={() => save('profile')} saving={saving} saved={savedTab === 'profile'} />
                  </div>
                )}

                {/* ── 2. CAREER FOCUS TAB ─────────────────────────────────── */}
                {activeTab === 'career' && (
                  <div className="space-y-8">
                    <div>
                      <h2 className="text-base font-black text-white uppercase tracking-wider">Career Focus</h2>
                      <p className="text-[10px] text-gray-500 mt-0.5">Set your target parameters. These values are used as defaults across Analysis, JD Matcher, and Roadmap modules.</p>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <FieldLabel>Target Role Title</FieldLabel>
                        <TextInput
                          value={prefs.targetRoleTitle}
                          onChange={v => setPref('targetRoleTitle', v)}
                          placeholder="e.g. Senior Staff Engineer"
                        />
                        <p className="text-[10px] text-gray-600 mt-1.5">Used as the default role in Analysis scoring, JD Matcher, and Recruiter Simulation.</p>
                      </div>

                      <div>
                        <FieldLabel>Desired Base Compensation</FieldLabel>
                        <SelectInput
                          value={prefs.desiredCompensation}
                          onChange={v => setPref('desiredCompensation', v)}
                          options={[
                            '$80k – $100k USD',
                            '$100k – $120k USD',
                            '$120k – $150k USD',
                            '$150k – $180k USD',
                            '$180k – $220k USD',
                            '$220k+ USD',
                          ]}
                        />
                      </div>

                      <div>
                        <FieldLabel>Preferred Work Model</FieldLabel>
                        <div className="grid grid-cols-3 gap-3">
                          {(['Remote', 'Hybrid', 'Onsite'] as const).map(mode => (
                            <button
                              key={mode}
                              type="button"
                              onClick={() => setPref('preferredWorkModel', mode)}
                              className={`px-4 py-3 rounded-xl text-center text-xs font-extrabold cursor-pointer transition-all ${
                                prefs.preferredWorkModel === mode
                                  ? 'bg-indigo-500/10 border border-indigo-500/30 text-indigo-400'
                                  : 'bg-black/40 border border-white/5 text-gray-400 hover:border-white/10'
                              }`}
                            >
                              {mode}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <SaveButton onClick={() => save('career')} saving={saving} saved={savedTab === 'career'} />
                  </div>
                )}

                {/* ── 3. AI INTELLIGENCE TAB ──────────────────────────────── */}
                {activeTab === 'ai' && (
                  <div className="space-y-8">
                    <div>
                      <h2 className="text-base font-black text-white uppercase tracking-wider">AI Intelligence</h2>
                      <p className="text-[10px] text-gray-500 mt-0.5">Customize AI analysis behavior. These preferences are applied when AI enhancement requests are triggered.</p>
                    </div>

                    <div className="space-y-4">
                      <SettingRow
                        title="Recruiter-Focused Mode"
                        description="Emphasizes hiring signal language, measurable impact, and stack clarity in all AI feedback and bullet rewrites."
                        checked={prefs.recruiterMode}
                        onChange={v => setPref('recruiterMode', v)}
                      />
                      <SettingRow
                        title="Aggressive ATS Optimization"
                        description="Increases keyword density guidance and clustering in AI suggestions to target older ATS parsing engines."
                        checked={prefs.atsOptimization}
                        onChange={v => setPref('atsOptimization', v)}
                      />
                      <div>
                        <FieldLabel>Default AI Writing Tone</FieldLabel>
                        <SelectInput
                          value={prefs.defaultWritingTone}
                          onChange={v => setPref('defaultWritingTone', v)}
                          options={[
                            'Confident & Quantitative',
                            'Humble & Execution-Focused',
                            'Strategic & Narrative-Driven',
                          ]}
                        />
                        <p className="text-[10px] text-gray-600 mt-1.5">Applied when AI rewrites resume bullets or generates cover letter sections.</p>
                      </div>
                    </div>

                    <SaveButton onClick={() => save('ai')} saving={saving} saved={savedTab === 'ai'} />
                  </div>
                )}

                {/* ── 4. EXPORT PRESETS TAB ───────────────────────────────── */}
                {activeTab === 'export' && (
                  <div className="space-y-8">
                    <div>
                      <h2 className="text-base font-black text-white uppercase tracking-wider">Export Presets</h2>
                      <p className="text-[10px] text-gray-500 mt-0.5">Select your default PDF paper format. This is used by the PDF export pipeline.</p>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <FieldLabel>Default Paper Size</FieldLabel>
                        <div className="grid grid-cols-2 gap-4">
                          <button
                            type="button"
                            onClick={() => setPref('exportPaperSize', 'A4')}
                            className={`p-4 rounded-2xl text-left transition-all ${
                              prefs.exportPaperSize === 'A4'
                                ? 'bg-indigo-500/10 border border-indigo-500/30'
                                : 'bg-black/40 border border-white/5 hover:border-white/10'
                            }`}
                          >
                            <h4 className={`text-xs font-bold ${prefs.exportPaperSize === 'A4' ? 'text-indigo-400' : 'text-gray-300'}`}>A4 ISO Boundary</h4>
                            <p className="text-[10px] text-gray-500 mt-1 font-semibold">International standard (210×297mm). Recommended for global applications.</p>
                          </button>
                          <button
                            type="button"
                            onClick={() => setPref('exportPaperSize', 'Letter')}
                            className={`p-4 rounded-2xl text-left transition-all ${
                              prefs.exportPaperSize === 'Letter'
                                ? 'bg-indigo-500/10 border border-indigo-500/30'
                                : 'bg-black/40 border border-white/5 hover:border-white/10'
                            }`}
                          >
                            <h4 className={`text-xs font-bold ${prefs.exportPaperSize === 'Letter' ? 'text-indigo-400' : 'text-gray-300'}`}>US Letter Bounds</h4>
                            <p className="text-[10px] text-gray-500 mt-1 font-semibold">US domestic standard (8.5×11in). Preferred by North American employers.</p>
                          </button>
                        </div>
                      </div>

                      <div className="p-4 border border-white/[0.06] bg-white/[0.01] rounded-2xl">
                        <h4 className="text-xs font-bold text-white mb-2">Automated Page Alignment</h4>
                        <p className="text-[10px] text-gray-500 font-semibold leading-relaxed">
                          The PDF engine dynamically measures print coordinates to eliminate orphan lines and loose trailing sections. Page break boundaries are applied automatically based on your selected paper size.
                        </p>
                      </div>
                    </div>

                    <SaveButton onClick={() => save('export')} saving={saving} saved={savedTab === 'export'} />
                  </div>
                )}

                {/* ── 5. CONNECTIONS TAB ──────────────────────────────────── */}
                {activeTab === 'connections' && (
                  <div className="space-y-8">
                    <div>
                      <h2 className="text-base font-black text-white uppercase tracking-wider">API & Connections</h2>
                      <p className="text-[10px] text-gray-500 mt-0.5">Configure link handling and integration behavior within Career Copilot.</p>
                    </div>

                    <div className="space-y-4">
                      <SettingRow
                        title="Resume Link Auto-Detection"
                        description="Automatically detects and validates project URLs pasted in the editor, and flags broken or inaccessible links."
                        checked={prefs.resumeLinkAutoDetect}
                        onChange={v => setPref('resumeLinkAutoDetect', v)}
                      />

                      {/* Coming Soon integrations */}
                      <div className="space-y-3">
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-600 ml-1">Platform Integrations</p>
                        {[
                          { name: 'GitHub Account Sync', desc: 'Auto-populate project repos and contribution stats into your resume.' },
                          { name: 'LinkedIn Profile Import', desc: 'Import your work history and skills from your LinkedIn profile.' },
                        ].map(item => (
                          <div key={item.name} className="p-4 border border-white/[0.04] bg-white/[0.005] rounded-2xl flex items-center justify-between gap-4 opacity-50">
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="p-2 bg-white/5 rounded-lg shrink-0">
                                <Link2 className="w-4 h-4 text-gray-400" />
                              </div>
                              <div className="min-w-0">
                                <h4 className="text-xs font-bold text-white">{item.name}</h4>
                                <p className="text-[9px] text-gray-500 font-semibold mt-0.5">{item.desc}</p>
                              </div>
                            </div>
                            <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-xl text-[9px] font-black uppercase tracking-wider text-gray-500 shrink-0">Coming Soon</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <SaveButton onClick={() => save('connections')} saving={saving} saved={savedTab === 'connections'} />
                  </div>
                )}

                {/* ── 6. SECURITY & TRUST TAB ─────────────────────────────── */}
                {activeTab === 'privacy' && (
                  <div className="space-y-8">
                    <div>
                      <h2 className="text-base font-black text-white uppercase tracking-wider">Security & Trust</h2>
                      <p className="text-[10px] text-gray-500 mt-0.5">Control privacy settings, debug preferences, and local workspace data.</p>
                    </div>

                    <div className="space-y-4">
                      <SettingRow
                        title="Telemetry & Experience Logs"
                        description="Share anonymous, encrypted usage patterns to help improve Career Copilot's AI models and interface quality."
                        checked={prefs.telemetry}
                        onChange={v => setPref('telemetry', v)}
                      />
                      <SettingRow
                        title="Developer Debug Logs"
                        description="Expose detailed API timings and debug panels in the client dashboard. Only useful for development or bug reporting."
                        checked={prefs.developerLog}
                        onChange={v => setPref('developerLog', v)}
                      />

                      <SaveButton onClick={() => save('privacy')} saving={saving} saved={savedTab === 'privacy'} />

                      {/* Purge — destructive action zone */}
                      <div className="mt-6 p-4 border border-red-500/15 bg-red-500/[0.02] rounded-2xl">
                        <h4 className="text-xs font-bold text-red-400 flex items-center gap-1.5 mb-1">
                          <AlertCircle className="w-3.5 h-3.5" />
                          Purge Session Data
                        </h4>
                        <p className="text-[10px] text-gray-500 font-semibold leading-relaxed mb-4">
                          This clears all local editor drafts, cached resume hashes, and active workspace states stored in your browser. Your account data and analysis history are not affected.
                        </p>
                        <button
                          onClick={() => setShowPurgeModal(true)}
                          className="flex items-center gap-2 px-4 py-2 bg-red-950/20 hover:bg-red-950/40 border border-red-900/30 hover:border-red-500/30 rounded-xl text-[10px] font-black uppercase tracking-wider text-red-400 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
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

      {/* ── Purge Confirmation Modal ───────────────────────────────────────── */}
      <AnimatePresence>
        {showPurgeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.18 }}
              className="bg-[#0e0e14] border border-red-500/20 rounded-3xl p-6 max-w-sm w-full shadow-2xl"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0">
                  <Trash2 className="w-5 h-5 text-red-400" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white">Purge Local Workspace?</h3>
                  <p className="text-[10px] text-gray-500">This action cannot be undone.</p>
                </div>
              </div>
              <p className="text-[11px] text-gray-400 leading-relaxed mb-6">
                All local editor drafts, cached resume states, and active workspace data will be permanently cleared from your browser. Your account data and analysis history stored on our servers remain intact.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowPurgeModal(false)}
                  className="flex-1 px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-bold text-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={purgeSessionData}
                  className="flex-1 px-4 py-2.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 rounded-xl text-xs font-black text-red-400 transition-colors"
                >
                  Yes, Purge
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Mobile Settings Menu Drawer ────────────────────────────────────── */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 flex items-stretch justify-start bg-black/60 backdrop-blur-md lg:hidden">
            <motion.div
              initial={{ opacity: 0, x: '-100%' }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: '-100%' }}
              transition={{ type: 'spring', stiffness: 400, damping: 40 }}
              className="w-[85%] max-w-sm bg-[#0a0a0f]/95 backdrop-blur-3xl border-r border-white/10 shadow-2xl overflow-hidden flex flex-col h-full relative"
            >
              <div className="absolute top-0 left-0 w-[200px] h-[200px] bg-indigo-500/10 rounded-full blur-[80px] pointer-events-none" />
              <div className="absolute bottom-0 right-0 w-[200px] h-[200px] bg-purple-500/10 rounded-full blur-[80px] pointer-events-none" />

              <div className="px-6 py-5 flex items-center justify-between border-b border-white/[0.04] relative z-10">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center shrink-0">
                    <Settings2 className="w-4 h-4 text-indigo-400" />
                  </div>
                  <h3 className="text-base font-black text-white tracking-wide">Settings Menu</h3>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 bg-white/5 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-all duration-200"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* User identity pill */}
              <div className="px-5 pt-5 pb-3 relative z-10">
                <div className="flex items-center gap-3 bg-white/[0.03] border border-white/[0.05] rounded-2xl px-4 py-3">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500/30 to-purple-500/30 border border-white/10 flex items-center justify-center shrink-0">
                    <span className="text-sm font-black text-white">{initials || '?'}</span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-white truncate">{name || 'Member'}</p>
                    <p className="text-[10px] text-gray-500 truncate">{email}</p>
                  </div>
                  <span className="ml-auto text-[9px] font-black uppercase tracking-wider px-2 py-1 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shrink-0">{tier}</span>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto px-5 py-3 space-y-1.5 hide-scrollbar mobile-safe-bottom relative z-10">
                <h4 className="text-[10px] uppercase font-black tracking-widest text-gray-500 ml-2 mb-3">Preferences</h4>
                {SETTINGS_TABS.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => { setActiveTab(tab.id); setIsMobileMenuOpen(false); }}
                      className={`w-full flex items-center px-4 py-3.5 rounded-2xl transition-all duration-300 outline-none group relative overflow-hidden ${
                        isActive
                          ? 'bg-white/10 text-white shadow-lg'
                          : 'bg-transparent text-gray-400 hover:bg-white/5 hover:text-gray-200'
                      }`}
                    >
                      {isActive && (
                        <motion.div layoutId="mobileActiveSettings" className="absolute inset-0 bg-indigo-500/20 -z-10" />
                      )}
                      <Icon className={`w-4 h-4 mr-3 transition-colors ${isActive ? 'text-indigo-400' : 'text-gray-500 group-hover:text-gray-300'}`} />
                      <span className="text-sm font-bold flex-1 text-left">{tab.label}</span>
                      <ChevronRight className={`w-3.5 h-3.5 transition-opacity ${isActive ? 'opacity-40' : 'opacity-0 group-hover:opacity-30'}`} />
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
