import React from 'react';
import { Loader2 } from 'lucide-react';

export default function EditorLoading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#030303] text-white p-4">
      <div className="max-w-2xl w-full flex flex-col items-center text-center space-y-6">
        <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-4">
          <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
        </div>
        
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white mb-2">Preparing Resume Editor...</h1>
          <p className="text-sm text-gray-400 font-medium">Loading your resume, analysis, templates, and editor workspace.</p>
        </div>

        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4 mt-8 opacity-40">
          <div className="h-[400px] rounded-3xl border border-white/5 bg-white/[0.02] animate-pulse"></div>
          <div className="h-[400px] rounded-3xl border border-white/5 bg-white/[0.02] animate-pulse hidden md:block"></div>
        </div>
      </div>
    </div>
  );
}
