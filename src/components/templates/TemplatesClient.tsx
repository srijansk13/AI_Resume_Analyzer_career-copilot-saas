'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { EditorState } from '@/models/EditorState';
import { Search } from 'lucide-react';

// Import Templates
import ATSClassicTemplate from './resume-templates/ATSClassicTemplate';
import CleanProfessionalTemplate from './resume-templates/CleanProfessionalTemplate';
import CorporateStandardTemplate from './resume-templates/CorporateStandardTemplate';
import MinimalEngineerTemplate from './resume-templates/MinimalEngineerTemplate';
import AcademicSimpleTemplate from './resume-templates/AcademicSimpleTemplate';
import ExecutiveLeadershipTemplate from './resume-templates/ExecutiveLeadershipTemplate';
import ModernDeveloperTemplate from './resume-templates/ModernDeveloperTemplate';
import ProductDesignerTemplate from './resume-templates/ProductDesignerTemplate';
import StartupResumeTemplate from './resume-templates/StartupResumeTemplate';
import TechLeadTemplate from './resume-templates/TechLeadTemplate';
import DataAnalystTemplate from './resume-templates/DataAnalystTemplate';
import AIEngineerTemplate from './resume-templates/AIEngineerTemplate';
import ProductManagerTemplate from './resume-templates/ProductManagerTemplate';
import ElegantSidebarTemplate from './resume-templates/ElegantSidebarTemplate';
import CreativeProfessionalTemplate from './resume-templates/CreativeProfessionalTemplate';
import JakesResumeTemplate from './resume-templates/JakesResumeTemplate';
import DeedyResumeTemplate from './resume-templates/DeedyResumeTemplate';
import AltaCVTemplate from './resume-templates/AltaCVTemplate';
import ModernCVTemplate from './resume-templates/ModernCVTemplate';
import AwesomeCVTemplate from './resume-templates/AwesomeCVTemplate';
import AcademicCVTemplate from './resume-templates/AcademicCVTemplate';
import FAANGResumeTemplate from './resume-templates/FAANGResumeTemplate';
import IITPlacementTemplate from './resume-templates/IITPlacementTemplate';

const mockEditorState: EditorState = {
  analysisId: 'mock-1',
  resumeId: 'mock-1',
  templateId: 'ats-classic',
  lastSavedAt: Date.now(),
  theme: {
    fontFamily: 'Inter, sans-serif',
    headingFont: 'Inter, sans-serif',
    fontSize: '10pt',
    headingSize: '14pt',
    primaryColor: '#0f172a',
    accentColor: '#2563eb',
    textColor: '#1f2937',
    backgroundColor: '#ffffff',
    spacing: '1.5',
    lineHeight: '1.4',
    pageMargin: '24px',
    sectionSpacing: '16px',
    layout: 'one-column'
  },
  content: {
    personalInfo: {
      fullName: 'John Doe',
      title: 'Software Engineer',
      contact: {
        email: 'john.doe@example.com',
        phone: '+1 234 567 8900',
        location: 'San Francisco, CA',
        linkedin: 'linkedin.com/in/johndoe',
        github: 'github.com/johndoe'
      }
    },
    summary: 'Experienced software engineer with 5+ years of experience building scalable web applications. Proven ability to lead teams and deliver high-quality solutions.',
    experience: [
      {
        id: '1',
        role: 'Senior Developer',
        company: 'Tech Corp',
        location: 'San Francisco, CA',
        startDate: 'Jan 2020',
        endDate: 'Present',
        bullets: ['Led a team of 5 engineers to rebuild the core platform.', 'Improved performance by 40% and reduced server costs.']
      }
    ],
    education: [
      {
        id: '1',
        institution: 'University of California',
        degree: 'Bachelor of Science',
        field: 'Computer Science',
        startDate: 'Aug 2015',
        endDate: 'May 2019',
        gpa: '3.8'
      }
    ],
    skills: [
      { category: 'Languages', skills: ['JavaScript', 'TypeScript', 'Python'] },
      { category: 'Frameworks', skills: ['React', 'Next.js', 'Node.js'] }
    ],
    projects: [],
    certifications: []
  },
  sectionOrder: ['summary', 'experience', 'education', 'skills'],
  visibleSections: {
    summary: true,
    experience: true,
    education: true,
    skills: true,
    projects: false,
    certifications: false
  }
};

const TEMPLATES_LIST = [
  { id: 'ats-classic', component: ATSClassicTemplate, name: 'ATS Classic', category: 'ATS Safe', cols: 'One Column', description: 'Zero formatting issues. Pure, structured text designed to pass 100% of ATS scanners.' },
  { id: 'clean-professional', component: CleanProfessionalTemplate, name: 'Clean Professional', category: 'Professional', cols: 'One Column', description: 'A polished, clear layout suitable for traditional corporate environments.' },
  { id: 'corporate-standard', component: CorporateStandardTemplate, name: 'Corporate Standard', category: 'Executive', cols: 'One Column', description: 'Formal and strict layout for banking, finance, and legal roles.' },
  { id: 'minimal-engineer', component: MinimalEngineerTemplate, name: 'Minimal Engineer', category: 'Developer', cols: 'One Column', description: 'Highly dense, tech-focused layout to pack maximum projects and skills.' },
  { id: 'academic-simple', component: AcademicSimpleTemplate, name: 'Academic Simple', category: 'Academic', cols: 'One Column', description: 'Focuses on research, publications, and education history.' },
  { id: 'executive-linear', component: ExecutiveLeadershipTemplate, name: 'Executive Linear', category: 'Executive', cols: 'One Column', description: 'Emphasizes impact, metrics, and high-level strategy over tactical skills.' },
  { id: 'modern-developer', component: ModernDeveloperTemplate, name: 'Modern Developer', category: 'Developer', cols: 'Two Column', description: 'Clean, two-column inspired layout perfect for modern engineering roles.' },
  { id: 'product-designer', component: ProductDesignerTemplate, name: 'Product Designer', category: 'Designer', cols: 'Two Column', description: 'High visual aesthetic with balanced whitespace for creative roles.' },
  { id: 'startup-resume', component: StartupResumeTemplate, name: 'Startup Resume', category: 'Modern', cols: 'Two Column', description: 'Bold and energetic layout for fast-paced tech companies.' },
  { id: 'tech-lead', component: TechLeadTemplate, name: 'Tech Lead', category: 'Developer', cols: 'Two Column', description: 'Balances hands-on technical skills with leadership experience.' },
  { id: 'data-analyst', component: DataAnalystTemplate, name: 'Data Analyst', category: 'Tech', cols: 'One Column', description: 'Highlights metrics, tools, and quantifiable business impact.' },
  { id: 'ai-engineer', component: AIEngineerTemplate, name: 'AI Engineer', category: 'Developer', cols: 'Two Column', description: 'Forward-looking layout highlighting ML models, frameworks, and research.' },
  { id: 'product-manager', component: ProductManagerTemplate, name: 'Product Manager', category: 'Management', cols: 'Two Column', description: 'Focuses on product lifecycle, user impact, and cross-functional leadership.' },
  { id: 'elegant-sidebar', component: ElegantSidebarTemplate, name: 'Elegant Sidebar', category: 'Modern', cols: 'Two Column', description: 'A timeless layout with a dedicated sidebar for skills and contact info.' },
  { id: 'creative-professional', component: CreativeProfessionalTemplate, name: 'Creative Professional', category: 'Designer', cols: 'Two Column', description: 'Expressive and unique layout for marketing and design roles.' },
  { id: 'jakes-resume', component: JakesResumeTemplate, name: "Jake's Resume Inspired", category: 'ATS Safe', cols: 'One Column', description: 'Clean ATS format with minimal styling and compact spacing, ideal for software engineers.' },
  { id: 'deedy-resume', component: DeedyResumeTemplate, name: 'Deedy Resume Inspired', category: 'Developer', cols: 'One Column', description: 'Technical resume style, dense but readable, adapted for ATS.' },
  { id: 'altacv-resume', component: AltaCVTemplate, name: 'AltaCV Inspired', category: 'Academic', cols: 'One Column', description: 'Modern academic style with an elegant structure.' },
  { id: 'awesomecv-resume', component: AwesomeCVTemplate, name: 'Awesome CV Inspired', category: 'Executive', cols: 'One Column', description: 'Premium executive appearance with modern visual hierarchy.' },
  { id: 'faang-resume', component: FAANGResumeTemplate, name: 'Clean FAANG Resume', category: 'ATS Safe', cols: 'One Column', description: 'Extremely ATS-friendly, minimal styling, strong achievement focus.' },
  { id: 'iit-placement', component: IITPlacementTemplate, name: 'IIT / NIT Placement Style', category: 'Academic', cols: 'One Column', description: 'Campus placement optimized, skills-first structure, project-heavy layout.' }
];

export function TemplatesClient() {
  const [activeAnalysisId, setActiveAnalysisId] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  useEffect(() => {
    // Determine active analysis from localStorage or something similar if exists
    // We can check if there's an 'editorState_recent' or just get the most recent analysis
    // For now, let's just check if there's any recent draft.
    const hasRecent = localStorage.getItem('editorState_recent');
    // If we had a mechanism to store 'currentAnalysisId', we'd read it here.
    // As a fallback, we'll let the Use Template logic handle navigation based on active state.
    // If no active ID is known here, we could prompt.
  }, []);

  const handleUseTemplate = (templateId: string) => {
    const draft = localStorage.getItem('editorState_recent');
    let targetAnalysisId = null;
    if (draft) {
      try {
        const parsed = JSON.parse(draft);
        if (parsed.analysisId) targetAnalysisId = parsed.analysisId;
      } catch (e) {}
    }

    if (targetAnalysisId) {
      router.push(`/dashboard/editor/${targetAnalysisId}?template=${templateId}`);
    } else {
      // Show prompt or redirect to resumes to select one
      if (confirm("You don't have an active resume selected. Go to your Resume History to select one?")) {
        router.push('/dashboard/resumes');
      }
    }
  };

  const filteredTemplates = TEMPLATES_LIST.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase()) || t.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'All' || t.category === filterCategory || t.cols === filterCategory || (filterCategory === 'ATS Safe' && t.category === 'ATS Safe');
    return matchesSearch && matchesCategory;
  });

  const categories = ['All', 'ATS Safe', 'Developer', 'Executive', 'Designer', 'One Column', 'Two Column'];

  return (
    <div className="min-h-screen bg-[#030303] text-slate-100 pt-20 pb-32 px-6 relative overflow-hidden">
      {/* Background glowing meshes */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/[0.02] rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-500/[0.015] rounded-full blur-[120px] pointer-events-none" />
      
      <div className="max-w-7xl mx-auto relative z-10">
        <header className="mb-14">
          <div className="flex items-center space-x-2 text-[10px] text-gray-500 uppercase tracking-widest font-black mb-3">
            <span>Career Assets</span>
            <span>/</span>
            <span className="text-indigo-400">Canva-Style Templates</span>
          </div>
          <h1 className="text-3.5xl md:text-5xl font-black mb-4 tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-slate-400">
            Premium Templates Gallery
          </h1>
          <p className="text-gray-400 text-sm md:text-base font-semibold max-w-2xl leading-relaxed">
            Deploy beautiful, ATS-optimized layout tracks engineered to comply with corporate parsers and command instant recruiter attention.
          </p>

          <div className="flex flex-col md:flex-row gap-4 mt-10">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-3.5 h-4.5 w-4.5 text-gray-500" />
              <input
                type="text"
                placeholder="Search premium styles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-[#0a0a0f]/60 border border-white/[0.06] rounded-2xl text-xs font-semibold text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all shadow-inner"
              />
            </div>
            
            <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 hide-scrollbar scroll-smooth">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setFilterCategory(cat)}
                  className={`whitespace-nowrap px-4.5 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all ${filterCategory === cat ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/15' : 'bg-[#0a0a0f]/60 text-gray-400 border border-white/[0.06] hover:text-white hover:border-white/10'}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredTemplates.map(template => {
            const TemplateComponent = template.component;
            return (
              <div key={template.id} className="group relative rounded-3xl border border-white/[0.06] bg-[#0b0b0f]/80 overflow-hidden hover:border-indigo-500/40 hover:bg-[#0d0d14]/90 transition-all duration-300 flex flex-col h-full shadow-2xl">
                <div className="aspect-[1/1.3] bg-black/40 relative flex items-start justify-center p-4 overflow-hidden border-b border-white/[0.04]">
                  {/* Real Template Preview Scaled Down to fit the card */}
                  <div className="w-[794px] min-h-[1123px] origin-top absolute top-6 left-1/2 -translate-x-1/2 scale-[0.32] md:scale-[0.27] lg:scale-[0.28] shadow-2xl bg-white transition-transform duration-500 group-hover:scale-[0.29] group-hover:translate-y-[-2px] flex-shrink-0 rounded-sm">
                    <TemplateComponent editorState={mockEditorState} />
                  </div>
                </div>
                
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-base font-black text-white">{template.name}</h3>
                      {(template.category === 'ATS Safe' || template.cols === 'One Column') && (
                        <span className="text-[8px] font-black tracking-widest text-emerald-400 bg-emerald-400/10 border border-emerald-500/20 px-2 py-0.5 rounded whitespace-nowrap ml-2">ATS COMPLIANT</span>
                      )}
                    </div>
                    
                    <div className="flex gap-2 mb-4">
                      <span className="text-[9px] uppercase tracking-wider font-extrabold text-indigo-400 bg-indigo-500/5 border border-indigo-500/10 px-2 py-0.5 rounded">{template.category}</span>
                      <span className="text-[9px] uppercase tracking-wider font-extrabold text-purple-400 bg-purple-500/5 border border-purple-500/10 px-2 py-0.5 rounded">{template.cols}</span>
                    </div>
                    
                    <p className="text-xs text-gray-400 font-semibold leading-relaxed mb-6">{template.description}</p>
                  </div>
                  
                  <button 
                    onClick={() => handleUseTemplate(template.id)}
                    className="block text-center w-full py-3 rounded-2xl bg-white hover:bg-slate-200 text-black text-xs font-black uppercase tracking-wider transition-all shadow-lg"
                  >
                    Select Template
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
