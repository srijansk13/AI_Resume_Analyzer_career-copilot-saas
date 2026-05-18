'use client';

import React from 'react';
import { EditorState } from '@/models/EditorState';
import { motion } from 'framer-motion';
import { GripVertical, Eye, EyeOff, ChevronUp, ChevronDown, CheckCircle2, AlertTriangle, Layers } from 'lucide-react';

interface StructurePanelProps {
  editorState: EditorState;
  setEditorState: React.Dispatch<React.SetStateAction<EditorState | null>>;
}

const SECTION_LABELS: Record<string, string> = {
  summary: 'Professional Summary',
  experience: 'Work Experience',
  projects: 'Projects',
  education: 'Education',
  skills: 'Skills',
  certifications: 'Certifications',
  achievements: 'Achievements & Awards',
};

export default function StructurePanel({ editorState, setEditorState }: StructurePanelProps) {
  const { content, visibleSections, sectionOrder } = editorState;

  const moveSection = (index: number, direction: 'up' | 'down') => {
    const filteredOrder = sectionOrder.filter(key => SECTION_LABELS[key]);
    const newOrder = [...filteredOrder];
    if (direction === 'up' && index > 0) {
      [newOrder[index - 1], newOrder[index]] = [newOrder[index], newOrder[index - 1]];
    } else if (direction === 'down' && index < newOrder.length - 1) {
      [newOrder[index + 1], newOrder[index]] = [newOrder[index], newOrder[index + 1]];
    } else {
      return;
    }
    
    setEditorState(prev => prev ? { ...prev, sectionOrder: newOrder } : null);
  };

  const toggleVisibility = (section: keyof EditorState['visibleSections']) => {
    setEditorState(prev => {
      if (!prev) return null;
      return {
        ...prev,
        visibleSections: {
          ...prev.visibleSections,
          [section]: !prev.visibleSections[section]
        }
      };
    });
  };

  // Helper to compute rich status badges for each section
  const getSectionBadge = (sectionKey: string) => {
    const isVisible = visibleSections[sectionKey as keyof typeof visibleSections];
    if (!isVisible) {
      return {
        label: 'Hidden',
        className: 'bg-white/5 text-gray-500 border border-white/5',
        icon: EyeOff
      };
    }

    switch (sectionKey) {
      case 'summary':
        const summaryCount = content.summary ? content.summary.trim().split(/\s+/).length : 0;
        if (summaryCount === 0) {
          return { label: 'Empty', className: 'bg-red-500/10 text-red-400 border border-red-500/20', icon: AlertTriangle };
        } else if (summaryCount >= 50 && summaryCount <= 180) {
          return { label: 'ATS Ready', className: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20', icon: CheckCircle2 };
        } else {
          return { label: 'Needs Polish', className: 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20', icon: AlertTriangle };
        }

      case 'experience':
        const expCount = content.experience ? content.experience.length : 0;
        if (expCount === 0) {
          return { label: 'Empty', className: 'bg-red-500/10 text-red-400 border border-red-500/20', icon: AlertTriangle };
        }
        return { label: `${expCount} Jobs`, className: 'bg-blue-500/10 text-blue-400 border border-blue-500/20', icon: CheckCircle2 };

      case 'projects':
        const projCount = content.projects ? content.projects.length : 0;
        if (projCount === 0) {
          return { label: 'No Projects', className: 'bg-white/5 text-gray-400 border border-white/5', icon: Layers };
        }
        return { label: `${projCount} Projects`, className: 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20', icon: CheckCircle2 };

      case 'education':
        const eduCount = content.education ? content.education.length : 0;
        if (eduCount === 0) {
          return { label: 'Empty', className: 'bg-red-500/10 text-red-400 border border-red-500/20', icon: AlertTriangle };
        }
        return { label: `${eduCount} Degree${eduCount > 1 ? 's' : ''}`, className: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20', icon: CheckCircle2 };

      case 'skills':
        let skillCount = 0;
        if (Array.isArray(content.skills)) {
          content.skills.forEach(s => {
            if (typeof s === 'string') skillCount++;
            else if (s && s.skills) skillCount += s.skills.length;
          });
        }
        if (skillCount === 0) {
          return { label: 'Empty', className: 'bg-red-500/10 text-red-400 border border-red-500/20', icon: AlertTriangle };
        }
        return { label: `${skillCount} Skills`, className: 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20', icon: CheckCircle2 };

      case 'certifications':
        const certCount = content.certifications ? content.certifications.length : 0;
        if (certCount === 0) {
          return { label: 'No Certs', className: 'bg-white/5 text-gray-400 border border-white/5', icon: Layers };
        }
        return { label: `${certCount} Certs`, className: 'bg-purple-500/10 text-purple-400 border border-purple-500/20', icon: CheckCircle2 };

      case 'achievements':
        const achCount = content.achievements ? content.achievements.length : 0;
        return { label: `${achCount} Items`, className: 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20', icon: CheckCircle2 };

      default:
        return { label: 'Visible', className: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20', icon: CheckCircle2 };
    }
  };

  const resetLayout = () => {
    if (confirm("Reset layout to default section order and visibility?")) {
      setEditorState(prev => {
        if (!prev) return null;
        return {
          ...prev,
          sectionOrder: ['summary', 'experience', 'projects', 'education', 'skills', 'certifications', 'achievements'],
          visibleSections: {
            ...prev.visibleSections,
            summary: true,
            experience: true,
            education: true,
            projects: true,
            skills: true,
            certifications: true,
            achievements: true,
            awards: false,
            publications: false,
            leadership: false,
          }
        };
      });
    }
  };

  return (
    <div className="flex flex-col h-full p-4">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold text-white/90">Structure</h2>
          <p className="text-xs text-gray-500 mt-1">Reorder or hide resume sections</p>
        </div>
        <button 
          onClick={resetLayout}
          className="text-xs text-indigo-400 hover:text-indigo-300 font-bold uppercase tracking-wider"
        >
          Reset
        </button>
      </div>

      <div className="space-y-2.5">
        {sectionOrder.filter(key => SECTION_LABELS[key]).map((sectionKey, index) => {
          const isVisible = visibleSections[sectionKey as keyof EditorState['visibleSections']];
          const label = SECTION_LABELS[sectionKey] || sectionKey;
          const badge = getSectionBadge(sectionKey);
          const BadgeIcon = badge.icon;

          return (
            <motion.div 
              layout
              key={sectionKey}
              className={`p-3.5 rounded-2xl border bg-white/[0.01] transition-all duration-200 ${
                isVisible 
                  ? 'border-white/10 hover:border-white/20' 
                  : 'border-white/5 opacity-40 hover:opacity-60'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <GripVertical className="w-4 h-4 text-gray-600 cursor-grab active:cursor-grabbing shrink-0" />
                  <span className="text-sm font-semibold tracking-wide text-white/90">{label}</span>
                </div>
                
                {/* Section Badge */}
                <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${badge.className}`}>
                  <BadgeIcon className="w-2.5 h-2.5 shrink-0" />
                  {badge.label}
                </div>
              </div>

              <div className="flex items-center justify-end gap-1 border-t border-white/5 pt-2 mt-2">
                <button 
                  onClick={() => moveSection(index, 'up')}
                  disabled={index === 0}
                  className="p-1.5 hover:bg-white/10 text-gray-400 hover:text-white rounded-lg transition-colors disabled:opacity-20"
                  title="Move Up"
                >
                  <ChevronUp className="w-3.5 h-3.5" />
                </button>
                <button 
                  onClick={() => moveSection(index, 'down')}
                  disabled={index === sectionOrder.length - 1}
                  className="p-1.5 hover:bg-white/10 text-gray-400 hover:text-white rounded-lg transition-colors disabled:opacity-20"
                  title="Move Down"
                >
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
                <div className="w-px h-4 bg-white/10 mx-1"></div>
                <button 
                  onClick={() => toggleVisibility(sectionKey as keyof EditorState['visibleSections'])}
                  className={`p-1.5 rounded-lg transition-colors flex items-center justify-center ${
                    isVisible 
                      ? 'bg-blue-600/10 hover:bg-blue-600/20 text-blue-400' 
                      : 'hover:bg-white/10 text-gray-400 hover:text-white'
                  }`}
                  title={isVisible ? 'Hide Section' : 'Show Section'}
                >
                  {isVisible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>
      
      <div className="mt-auto pt-6">
        <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
          <h3 className="text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-2">ATS Tips</h3>
          <p className="text-xs text-gray-400 leading-relaxed">
            Keep your Summary at the top. Ensure Experience is listed before Education unless you are a recent graduate. Toggle certifications to show professional credentials.
          </p>
        </div>
      </div>
    </div>
  );
}
