'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertCircle, RefreshCw, ArrowLeft } from 'lucide-react';

export default function EditorError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#030303] text-white p-4">
      <div className="max-w-md w-full bg-white/[0.02] border border-white/10 rounded-3xl p-8 text-center shadow-xl shadow-black/20">
        <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="w-8 h-8 text-red-500" />
        </div>
        <h1 className="text-2xl font-black tracking-tight text-white mb-3">Unable to open editor</h1>
        <p className="text-sm text-gray-400 font-medium mb-8">
          We encountered an unexpected error while loading your editor workspace.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => reset()}
            className="w-full sm:w-auto px-6 py-3 bg-white hover:bg-gray-200 text-black rounded-xl font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4" /> Retry
          </button>
          <Link
            href="/dashboard/editor"
            className="w-full sm:w-auto px-6 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-black text-xs uppercase tracking-wider border border-white/10 transition-all flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Resumes
          </Link>
        </div>
      </div>
    </div>
  );
}
