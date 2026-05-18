'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, Columns, Eye, PenTool } from 'lucide-react';
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
    <div className="flex flex-col lg:flex-row h-screen bg-[#030303] overflow-hidden text-white font-sans">
      
      {/* MOBILE & TABLET BOTTOM/TOP NAVIGATION SWITCHER (visible under lg viewport) */}
      <div className="lg:hidden flex items-center justify-between px-4 py-3 bg-[#0a0a0f] border-b border-white/[0.06] shrink-0 z-20">
        <Link 
          href="/dashboard" 
          className="flex items-center justify-center p-2 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-white"
        >
          <ChevronLeft className="w-4 h-4" />
        </Link>
        
        <div className="flex p-0.5 bg-black/40 rounded-xl border border-white/5 shrink-0">
          <button
            onClick={() => setActiveTab('structure')}
            className={`flex items-center px-3.5 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${activeTab === 'structure' ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/25 shadow-[0_0_10px_-2px_rgba(99,102,241,0.2)]' : 'text-gray-500 hover:text-gray-300'}`}
          >
            <Columns className="w-3.5 h-3.5 mr-1.5" /> Structure
          </button>
          <button
            onClick={() => setActiveTab('preview')}
            className={`flex items-center px-3.5 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${activeTab === 'preview' ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/25 shadow-[0_0_10px_-2px_rgba(99,102,241,0.2)]' : 'text-gray-500 hover:text-gray-300'}`}
          >
            <Eye className="w-3.5 h-3.5 mr-1.5" /> Preview
          </button>
          <button
            onClick={() => setActiveTab('edit')}
            className={`flex items-center px-3.5 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${activeTab === 'edit' ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/25 shadow-[0_0_10px_-2px_rgba(99,102,241,0.2)]' : 'text-gray-500 hover:text-gray-300'}`}
          >
            <PenTool className="w-3.5 h-3.5 mr-1.5" /> Edit
          </button>
        </div>
        
        <div className="w-8 h-8" /> {/* Balance space spacer */}
      </div>

      {/* -------------------- 3-PANEL INTERFACES -------------------- */}

      {/* LEFT PANEL - Structure (visible on desktop, or when selected on mobile/tablet) */}
      <div 
        className={`${
          activeTab === 'structure' ? 'flex' : 'hidden'
        } lg:flex flex-col w-full lg:w-64 border-r border-white/[0.06] bg-[#0a0a0f] overflow-y-auto h-full shrink-0`}
      >
        <StructurePanel editorState={editorState} setEditorState={setEditorState} />
      </div>

      {/* CENTER PANEL - Live Preview (visible on desktop, or when selected on mobile/tablet) */}
      <div 
        className={`${
          activeTab === 'preview' ? 'flex' : 'hidden'
        } lg:flex flex-1 flex-col bg-[#111115] overflow-hidden h-full relative`}
      >
        <LivePreviewPanel editorState={editorState} setEditorState={setEditorState} analysis={analysis} />
      </div>

      {/* RIGHT PANEL - Edit & AI (visible on desktop, or when selected on mobile/tablet) */}
      <div 
        className={`${
          activeTab === 'edit' ? 'flex' : 'hidden'
        } lg:flex flex-col w-full lg:w-[420px] border-l border-white/[0.06] bg-[#0a0a0f] overflow-y-auto h-full shrink-0 relative`}
      >
        <EditPanel 
          editorState={editorState} 
          setEditorState={setEditorState} 
          analysis={analysis} 
        />
      </div>

    </div>
  );
}
