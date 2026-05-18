'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Sparkles, FileText, Video, Briefcase, Download, X } from 'lucide-react';
import { toast } from 'sonner';

const DOCK_ACTIONS = [
  { id: 'reanalyze', label: 'Reanalyze AI', icon: Bot, color: 'text-blue-400', bg: 'bg-blue-500/10' },
  { id: 'cover_letter', label: 'Generate Cover Letter', icon: FileText, color: 'text-purple-400', bg: 'bg-purple-500/10' },
  { id: 'mock_interview', label: 'Mock Interview', icon: Video, color: 'text-green-400', bg: 'bg-green-500/10' },
  { id: 'job_match', label: 'Job Match Analysis', icon: Briefcase, color: 'text-orange-400', bg: 'bg-orange-500/10' },
  { id: 'export', label: 'Export Premium PDF', icon: Download, color: 'text-white', bg: 'bg-white/10' },
];

export function AIFloatingDock() {
  const [isOpen, setIsOpen] = useState(false);

  const handleAction = (id: string) => {
    toast.info('Feature coming in Phase 3', { description: 'This module is currently in development.' });
  };

  return (
    <div className="fixed bottom-8 right-8 z-50 flex flex-col items-end">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="mb-4 flex flex-col gap-2 items-end"
          >
            {DOCK_ACTIONS.map((action, i) => (
              <motion.button
                key={action.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => handleAction(action.id)}
                className="group flex items-center space-x-3 bg-slate-900/80 backdrop-blur-xl border border-white/10 px-4 py-2.5 rounded-2xl hover:bg-white/5 transition-all shadow-xl disabled:opacity-50"
              >
                <span className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors">
                  {action.label}
                </span>
                <div className={`p-2 rounded-xl ${action.bg}`}>
                  <action.icon className={`w-4 h-4 ${action.color}`} />
                </div>
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 shadow-[0_0_30px_-5px_rgba(59,130,246,0.5)] flex items-center justify-center border border-white/20 relative overflow-hidden group"
      >
        <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
        {isOpen ? (
          <X className="w-6 h-6 text-white relative z-10" />
        ) : (
          <Sparkles className="w-6 h-6 text-white relative z-10" />
        )}
      </motion.button>
    </div>
  );
}
