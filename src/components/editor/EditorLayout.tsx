'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, Columns, Eye, PenTool } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { EditorState } from '@/models/EditorState';
import { IAnalysis } from '@/models/Analysis';
import StructurePanel from './StructurePanel';
import LivePreviewPanel from './LivePreviewPanel';
import EditPanel from './EditPanel';

interface EditorLayoutProps {
  editorState: EditorState;
  setEditorState: React.Dispatch<React.SetStateAction<EditorState | null>>;
  analysis: IAnalysis;
}

export default function EditorLayout({ editorState, setEditorState, analysis }: EditorLayoutProps) {
  // Mobile / Tablet Tab selector: 'structure' | 'preview' | 'edit'
  const [activeTab, setActiveTab] = useState<'structure' | 'preview' | 'edit'>('preview');

  return (
    <div className="flex flex-col lg:flex-row h-[100dvh] bg-[#030303] overflow-hidden text-white font-sans">
      
      {/* MOBILE & TABLET NAV + TIP */}
      <div className="lg:hidden shrink-0 z-20 print:hidden">
      <div className="flex items-center justify-between px-4 py-3 bg-[#0a0a0f] border-b border-white/[0.06]">
        <Link 
          href="/dashboard" 
          className="flex items-center justify-center p-2 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-white"
        >
          <ChevronLeft className="w-4 h-4" />
        </Link>
        
        <div className="flex p-1 bg-[#0b0b0f]/80 backdrop-blur-xl rounded-xl border border-white/[0.08] shrink-0 shadow-inner shadow-black/50 relative">
          {['structure', 'preview', 'edit'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`relative z-10 flex flex-1 justify-center items-center px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-colors duration-300 ${activeTab === tab ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}
            >
              {activeTab === tab && (
                <motion.div 
                  layoutId="editor-mobile-tab"
                  className="absolute inset-0 bg-indigo-600/30 border border-indigo-500/30 rounded-lg shadow-[0_0_15px_-3px_rgba(99,102,241,0.3)]"
                  initial={false}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative z-10 flex items-center">
                {tab === 'structure' && <Columns className="w-3.5 h-3.5 mr-1.5" />}
                {tab === 'preview' && <Eye className="w-3.5 h-3.5 mr-1.5" />}
                {tab === 'edit' && <PenTool className="w-3.5 h-3.5 mr-1.5" />}
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </span>
            </button>
          ))}
        </div>
        
        <div className="w-8 h-8" />
      </div>
      <p className="px-4 py-2 text-[10px] text-gray-500 bg-[#08080c] border-b border-white/[0.04] leading-relaxed">
        <span className="text-indigo-400 font-bold">Tip:</span> Use the tabs above to switch between Structure, Preview, and Edit. In Edit, open <span className="text-purple-300 font-semibold">AI Enhance</span> for suggestions.
      </p>
      </div>

      <div className="flex flex-1 min-h-0 w-full overflow-hidden">
      {/* LEFT PANEL - Structure (visible on desktop, or when selected on mobile/tablet) */}
      <div 
        className={`${
          activeTab === 'structure' ? 'flex' : 'hidden'
        } lg:flex flex-col w-full lg:w-64 border-r border-white/[0.06] bg-[#0a0a0f] overflow-y-auto min-h-0 h-full shrink-0 print:hidden mobile-safe-bottom`}
      >
        <StructurePanel editorState={editorState} setEditorState={setEditorState} />
      </div>

      {/* CENTER PANEL - Live Preview (visible on desktop, or when selected on mobile/tablet) */}
      <div 
        className={`${
          activeTab === 'preview' ? 'flex' : 'hidden'
        } lg:flex flex-1 flex-col bg-[#111115] overflow-y-auto min-h-0 h-full relative print:block print:w-full print:flex-none print:overflow-visible mobile-safe-bottom`}
      >
        <LivePreviewPanel editorState={editorState} setEditorState={setEditorState} analysis={analysis} />
      </div>

      {/* RIGHT PANEL - Edit & AI (visible on desktop, or when selected on mobile/tablet) */}
      <div 
        className={`${
          activeTab === 'edit' ? 'flex' : 'hidden'
        } lg:flex flex-col w-full lg:w-[420px] border-l border-white/[0.06] bg-[#0a0a0f] min-h-0 h-full overflow-y-auto shrink-0 relative print:hidden mobile-safe-bottom`}
      >
        <EditPanel 
          editorState={editorState} 
          setEditorState={setEditorState} 
          analysis={analysis} 
        />
      </div>
      </div>

    </div>
  );
}
