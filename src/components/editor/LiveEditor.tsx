'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Save, Download, LayoutTemplate, Sparkles, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function LiveEditor() {
  const [atsScore, setAtsScore] = useState(85);
  const [resumeData, setResumeData] = useState({
    name: 'John Doe',
    title: 'Senior Frontend Engineer',
    summary: 'A passionate engineer building premium SaaS products.',
    experience: [
      {
        company: 'Tech Corp',
        role: 'Senior Engineer',
        dates: '2021 - Present',
        bullets: ['Led migration to Next.js', 'Improved performance by 40%']
      }
    ]
  });

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Editor Header */}
      <header className="h-16 bg-neutral-900 border-b border-white/10 flex items-center justify-between px-4 lg:px-6 shrink-0">
        <div className="flex items-center space-x-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
              <ChevronLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="h-6 w-px bg-white/10 mx-2" />
          <h1 className="font-medium text-white truncate">Untitled Resume</h1>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="hidden md:flex items-center space-x-2 bg-white/5 rounded-full px-4 py-1.5 border border-white/10">
            <span className="text-sm text-gray-400">ATS Score:</span>
            <span className={`text-sm font-bold ${atsScore >= 80 ? 'text-green-400' : 'text-yellow-400'}`}>
              {atsScore}/100
            </span>
          </div>
          <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
            <LayoutTemplate className="mr-2 h-4 w-4" />
            Templates
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">
            <Download className="mr-2 h-4 w-4" />
            Export PDF
          </Button>
        </div>
      </header>

      {/* Editor Body */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Panel: Editing Forms */}
        <div className="w-full lg:w-1/3 border-r border-white/10 bg-neutral-950 overflow-y-auto p-6 hidden lg:block custom-scrollbar">
          <div className="space-y-8">
            <div>
              <h2 className="text-lg font-medium text-white mb-4">Personal Info</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-400 block mb-1">Full Name</label>
                  <input 
                    type="text" 
                    value={resumeData.name}
                    onChange={(e) => setResumeData({...resumeData, name: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400 block mb-1">Job Title</label>
                  <input 
                    type="text" 
                    value={resumeData.title}
                    onChange={(e) => setResumeData({...resumeData, title: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium text-white">Professional Summary</h2>
                <Button variant="ghost" size="sm" className="h-8 text-blue-400 hover:text-blue-300 hover:bg-blue-400/10">
                  <Sparkles className="mr-2 h-3 w-3" />
                  AI Rewrite
                </Button>
              </div>
              <textarea 
                value={resumeData.summary}
                onChange={(e) => setResumeData({...resumeData, summary: e.target.value})}
                className="w-full h-32 bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors resize-none"
              />
            </div>
            
            {/* Experience section would go here, simplified for demo */}
          </div>
        </div>

        {/* Right Panel: Live Preview */}
        <div className="flex-1 bg-neutral-900 overflow-y-auto p-4 lg:p-8 flex justify-center custom-scrollbar">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-[800px] aspect-[1/1.414] bg-white rounded-sm shadow-2xl p-12 text-black"
          >
            {/* Render Resume Content */}
            <div className="text-center mb-8 border-b-2 border-gray-200 pb-6">
              <h1 className="text-4xl font-bold text-gray-900 mb-2 tracking-tight">{resumeData.name}</h1>
              <p className="text-xl text-blue-600 font-medium">{resumeData.title}</p>
            </div>
            
            <div className="mb-8">
              <h2 className="text-lg font-bold text-gray-900 uppercase tracking-wider mb-3 border-b border-gray-300 pb-1">
                Summary
              </h2>
              <p className="text-gray-700 leading-relaxed">
                {resumeData.summary}
              </p>
            </div>
            
            <div>
              <h2 className="text-lg font-bold text-gray-900 uppercase tracking-wider mb-4 border-b border-gray-300 pb-1">
                Experience
              </h2>
              {resumeData.experience.map((exp, idx) => (
                <div key={idx} className="mb-6">
                  <div className="flex justify-between items-baseline mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{exp.role}</h3>
                    <span className="text-sm font-medium text-gray-500">{exp.dates}</span>
                  </div>
                  <p className="text-blue-600 font-medium mb-2">{exp.company}</p>
                  <ul className="list-disc list-outside ml-5 space-y-1 text-gray-700">
                    {exp.bullets.map((bullet, bIdx) => (
                      <li key={bIdx} className="leading-relaxed pl-1">{bullet}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
