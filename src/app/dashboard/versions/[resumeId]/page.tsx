import React from 'react';
import Link from 'next/link';
import { History, ArrowLeft, Copy, Eye, FileText } from 'lucide-react';

export default function VersionsPage({ params }: { params: Promise<{ resumeId: string }> }) {
  const versions = [
    { id: 'v1', name: 'Original Parsed Draft', date: '2 hours ago', type: 'system' },
    { id: 'v2', name: 'AI Optimized Draft', date: '1 hour ago', type: 'ai' },
    { id: 'v3', name: 'Manual Edited Version', date: '10 mins ago', type: 'manual' },
  ];

  return (
    <div className="min-h-screen bg-[#030303] text-white p-8 md:p-12">
      <div className="max-w-4xl mx-auto space-y-8">
        <header className="flex items-center justify-between">
          <div>
            <Link href="/dashboard/resumes" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4 text-sm w-max">
              <ArrowLeft className="w-4 h-4" />
              Back to Resumes
            </Link>
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
              <History className="text-blue-500 w-8 h-8" />
              Version History
            </h1>
            <p className="text-gray-400">
              Track changes, compare edits, and restore previous versions of your resume.
            </p>
          </div>
        </header>

        <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-white/10 bg-white/[0.02]">
            <h2 className="font-semibold text-sm text-gray-300">Available Versions</h2>
          </div>
          <div className="divide-y divide-white/5">
            {versions.map(version => (
              <div key={version.id} className="p-4 flex items-center justify-between hover:bg-white/[0.02] transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-lg ${version.type === 'ai' ? 'bg-purple-500/10 text-purple-400' : version.type === 'system' ? 'bg-gray-500/10 text-gray-400' : 'bg-blue-500/10 text-blue-400'}`}>
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-medium text-white">{version.name}</h3>
                    <p className="text-xs text-gray-500">{version.date}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <button className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded transition-colors" title="Preview">
                    <Eye className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded transition-colors" title="Duplicate">
                    <Copy className="w-4 h-4" />
                  </button>
                  <button className="px-4 py-2 ml-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium transition-colors">
                    Restore
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
