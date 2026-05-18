'use client';

import * as React from 'react';
import { Command } from 'cmdk';
import { useRouter } from 'next/navigation';
import { Search, LayoutDashboard, Briefcase, FileText, Bot, Compass, TrendingUp, Sparkles, User, Settings, LogOut, Target } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function CommandPalette({ open, setOpen, setActiveModule }: { open: boolean, setOpen: (v: boolean) => void, setActiveModule?: (v: string) => void }) {
  const router = useRouter();

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen(true);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, [setOpen]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="fixed top-[20%] left-1/2 -translate-x-1/2 w-full max-w-2xl z-[101] p-4"
          >
            <div className="bg-slate-900/90 border border-white/10 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-xl ring-1 ring-white/5">
              <Command
                className="w-full text-white"
                onKeyDown={(e) => {
                  if (e.key === 'Escape') setOpen(false);
                }}
              >
                <div className="flex items-center px-4 py-3 border-b border-white/5">
                  <Search className="w-5 h-5 text-gray-400 mr-3" />
                  <Command.Input
                    autoFocus
                    placeholder="Search intelligence, modules, or jump to..."
                    className="flex-1 bg-transparent border-none outline-none text-white placeholder:text-gray-500 text-lg"
                  />
                  <div className="flex items-center space-x-1">
                    <kbd className="bg-white/10 text-gray-400 px-2 py-0.5 rounded text-xs">esc</kbd>
                  </div>
                </div>

                <Command.List className="max-h-[350px] overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                  <Command.Empty className="p-6 text-center text-gray-400">No results found.</Command.Empty>
                  
                  <Command.Group heading={<span className="text-xs font-semibold text-gray-500 px-3 uppercase tracking-wider">AI Modules</span>}>
                    <Command.Item 
                      onSelect={() => { if(setActiveModule) setActiveModule('overview'); setOpen(false); }}
                      className="flex items-center px-3 py-3 mt-1 rounded-xl hover:bg-white/10 cursor-pointer transition-colors"
                    >
                      <LayoutDashboard className="w-4 h-4 mr-3 text-blue-400" />
                      Intelligence Overview
                    </Command.Item>
                    <Command.Item 
                      onSelect={() => { if(setActiveModule) setActiveModule('optimization'); setOpen(false); }}
                      className="flex items-center px-3 py-3 mt-1 rounded-xl hover:bg-white/10 cursor-pointer transition-colors"
                    >
                      <Sparkles className="w-4 h-4 mr-3 text-yellow-400" />
                      AI Optimization & Rewrites
                    </Command.Item>
                    <Command.Item 
                      onSelect={() => { if(setActiveModule) setActiveModule('skills'); setOpen(false); }}
                      className="flex items-center px-3 py-3 mt-1 rounded-xl hover:bg-white/10 cursor-pointer transition-colors"
                    >
                      <Briefcase className="w-4 h-4 mr-3 text-emerald-400" />
                      Skills & Keyword Analytics
                    </Command.Item>
                    <Command.Item 
                      onSelect={() => { if(setActiveModule) setActiveModule('recruiter'); setOpen(false); }}
                      className="flex items-center px-3 py-3 mt-1 rounded-xl hover:bg-white/10 cursor-pointer transition-colors"
                    >
                      <User className="w-4 h-4 mr-3 text-purple-400" />
                      Recruiter Simulation
                    </Command.Item>
                    <Command.Item 
                      onSelect={() => { if(setActiveModule) setActiveModule('roadmap'); setOpen(false); }}
                      className="flex items-center px-3 py-3 mt-1 rounded-xl hover:bg-white/10 cursor-pointer transition-colors"
                    >
                      <Compass className="w-4 h-4 mr-3 text-cyan-400" />
                      Career Roadmap
                    </Command.Item>
                  </Command.Group>

                  <Command.Group heading={<span className="text-xs font-semibold text-gray-500 px-3 mt-4 block uppercase tracking-wider">Actions</span>}>
                    <Command.Item 
                      onSelect={() => { router.push('/dashboard'); setOpen(false); }}
                      className="flex items-center px-3 py-3 mt-1 rounded-xl hover:bg-white/10 cursor-pointer transition-colors"
                    >
                      <FileText className="w-4 h-4 mr-3 text-gray-400" />
                      Upload New Resume
                    </Command.Item>
                    <Command.Item 
                      onSelect={() => { router.push('/dashboard/resumes'); setOpen(false); }}
                      className="flex items-center px-3 py-3 mt-1 rounded-xl hover:bg-white/10 cursor-pointer transition-colors"
                    >
                      <LayoutDashboard className="w-4 h-4 mr-3 text-gray-400" />
                      My Resumes
                    </Command.Item>
                    <Command.Item 
                      onSelect={() => { router.push('/dashboard/templates'); setOpen(false); }}
                      className="flex items-center px-3 py-3 mt-1 rounded-xl hover:bg-white/10 cursor-pointer transition-colors"
                    >
                      <Briefcase className="w-4 h-4 mr-3 text-gray-400" />
                      Template Gallery
                    </Command.Item>
                    <Command.Item 
                      onSelect={() => { router.push('/dashboard/job-match'); setOpen(false); }}
                      className="flex items-center px-3 py-3 mt-1 rounded-xl hover:bg-white/10 cursor-pointer transition-colors"
                    >
                      <Target className="w-4 h-4 mr-3 text-gray-400" />
                      Job Match Workspace
                    </Command.Item>
                    <Command.Item 
                      onSelect={() => { router.push('/dashboard/settings'); setOpen(false); }}
                      className="flex items-center px-3 py-3 mt-1 rounded-xl hover:bg-white/10 cursor-pointer transition-colors"
                    >
                      <Settings className="w-4 h-4 mr-3 text-gray-400" />
                      Platform Settings
                    </Command.Item>
                    <Command.Item 
                      onSelect={() => { router.push('/'); setOpen(false); }}
                      className="flex items-center px-3 py-3 mt-1 rounded-xl hover:bg-red-500/20 text-red-400 cursor-pointer transition-colors"
                    >
                      <LogOut className="w-4 h-4 mr-3" />
                      Sign Out
                    </Command.Item>
                  </Command.Group>
                </Command.List>
              </Command>
              <div className="bg-white/5 px-4 py-3 border-t border-white/5 flex items-center justify-between text-xs text-gray-500">
                <span className="flex items-center">
                  Powered by <Bot className="w-3 h-3 ml-1 text-blue-500" />
                </span>
                <span className="flex items-center space-x-2">
                  <span>Use <kbd className="bg-white/10 px-1 rounded">↑</kbd> <kbd className="bg-white/10 px-1 rounded">↓</kbd> to navigate</span>
                  <span><kbd className="bg-white/10 px-1 rounded">enter</kbd> to select</span>
                </span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
