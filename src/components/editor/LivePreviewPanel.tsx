'use client';
import React, { useRef, useState, useEffect } from 'react';
import { EditorState } from '@/models/EditorState';
import { IAnalysis } from '@/models/Analysis';
import { useRouter } from 'next/navigation';
import { useReactToPrint } from 'react-to-print';
import { Download, ZoomIn, ZoomOut, CheckCircle2, LayoutTemplate, ArrowLeft, X, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ResumePageEngine from './ResumePageEngine';

// Import templates
import ATSClassicTemplate from '../templates/resume-templates/ATSClassicTemplate';
import CleanProfessionalTemplate from '../templates/resume-templates/CleanProfessionalTemplate';
import CorporateStandardTemplate from '../templates/resume-templates/CorporateStandardTemplate';
import MinimalEngineerTemplate from '../templates/resume-templates/MinimalEngineerTemplate';
import AcademicSimpleTemplate from '../templates/resume-templates/AcademicSimpleTemplate';
import ExecutiveLeadershipTemplate from '../templates/resume-templates/ExecutiveLeadershipTemplate';
import ModernDeveloperTemplate from '../templates/resume-templates/ModernDeveloperTemplate';
import ProductDesignerTemplate from '../templates/resume-templates/ProductDesignerTemplate';
import StartupResumeTemplate from '../templates/resume-templates/StartupResumeTemplate';
import TechLeadTemplate from '../templates/resume-templates/TechLeadTemplate';
import DataAnalystTemplate from '../templates/resume-templates/DataAnalystTemplate';
import AIEngineerTemplate from '../templates/resume-templates/AIEngineerTemplate';
import ProductManagerTemplate from '../templates/resume-templates/ProductManagerTemplate';
import ElegantSidebarTemplate from '../templates/resume-templates/ElegantSidebarTemplate';
import CreativeProfessionalTemplate from '../templates/resume-templates/CreativeProfessionalTemplate';
import JakesResumeTemplate from '../templates/resume-templates/JakesResumeTemplate';
import DeedyResumeTemplate from '../templates/resume-templates/DeedyResumeTemplate';
import AltaCVTemplate from '../templates/resume-templates/AltaCVTemplate';
import ModernCVTemplate from '../templates/resume-templates/ModernCVTemplate';
import AwesomeCVTemplate from '../templates/resume-templates/AwesomeCVTemplate';
import AcademicCVTemplate from '../templates/resume-templates/AcademicCVTemplate';
import FAANGResumeTemplate from '../templates/resume-templates/FAANGResumeTemplate';
import IITPlacementTemplate from '../templates/resume-templates/IITPlacementTemplate';

const TEMPLATES_MAP: Record<string, React.ElementType> = {
  'ats-classic': ATSClassicTemplate,
  'clean-professional': CleanProfessionalTemplate,
  'corporate-standard': CorporateStandardTemplate,
  'minimal-engineer': MinimalEngineerTemplate,
  'academic-simple': AcademicSimpleTemplate,
  'executive-linear': ExecutiveLeadershipTemplate,
  'modern-developer': ModernDeveloperTemplate,
  'product-designer': ProductDesignerTemplate,
  'startup-resume': StartupResumeTemplate,
  'tech-lead': TechLeadTemplate,
  'data-analyst': DataAnalystTemplate,
  'ai-engineer': AIEngineerTemplate,
  'product-manager': ProductManagerTemplate,
  'elegant-sidebar': ElegantSidebarTemplate,
  'creative-professional': CreativeProfessionalTemplate,
  'jakes-resume': JakesResumeTemplate,
  'deedy-resume': DeedyResumeTemplate,
  'altacv-resume': AltaCVTemplate,
  'moderncv-resume': ModernCVTemplate,
  'awesomecv-resume': AwesomeCVTemplate,
  'academiccv-resume': AcademicCVTemplate,
  'faang-resume': FAANGResumeTemplate,
  'iit-placement': IITPlacementTemplate,
};

const TEMPLATE_OPTIONS = [
  { id: 'ats-classic', name: 'ATS Classic' },
  { id: 'clean-professional', name: 'Clean Professional' },
  { id: 'corporate-standard', name: 'Corporate Standard' },
  { id: 'minimal-engineer', name: 'Minimal Engineer' },
  { id: 'academic-simple', name: 'Academic Simple' },
  { id: 'executive-linear', name: 'Executive Linear' },
  { id: 'modern-developer', name: 'Modern Developer' },
  { id: 'product-designer', name: 'Product Designer' },
  { id: 'startup-resume', name: 'Startup Resume' },
  { id: 'tech-lead', name: 'Tech Lead' },
  { id: 'data-analyst', name: 'Data Analyst' },
  { id: 'ai-engineer', name: 'AI Engineer' },
  { id: 'product-manager', name: 'Product Manager' },
  { id: 'elegant-sidebar', name: 'Elegant Sidebar' },
  { id: 'creative-professional', name: 'Creative Professional' },
  { id: 'jakes-resume', name: "Jake's Resume Inspired" },
  { id: 'deedy-resume', name: 'Deedy Resume Inspired' },
  { id: 'altacv-resume', name: 'AltaCV Inspired' },
  { id: 'awesomecv-resume', name: 'Awesome CV Inspired' },
  { id: 'faang-resume', name: 'Clean FAANG Resume' },
  { id: 'iit-placement', name: 'IIT / NIT Placement Style' },
];

interface LivePreviewPanelProps {
  editorState: EditorState;
  setEditorState: React.Dispatch<React.SetStateAction<EditorState | null>>;
  analysis: IAnalysis;
}

const ZOOM_OPTIONS = [
  { value: 0.4, label: '40%' },
  { value: 0.5, label: '50%' },
  { value: 0.6, label: '60%' },
  { value: 0.75, label: '75%' },
  { value: 0.85, label: '85%' },
  { value: 1.0, label: '100%' },
];

export default function LivePreviewPanel({ editorState, setEditorState, analysis }: LivePreviewPanelProps) {
  const router = useRouter();
  const componentRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(0.85);
  const [isFitWidth, setIsFitWidth] = useState(false);
  const [isFitPage, setIsFitPage] = useState(true); // Default to Fit Page on load
  const [containerHeight, setContainerHeight] = useState(1123);
  const [saveStatus, setSaveStatus] = useState<'synced' | 'saving'>('synced');
  const [showExportModal, setShowExportModal] = useState(false);
  const [customFileName, setCustomFileName] = useState(`${editorState.content.personalInfo.fullName.replace(/\s+/g, '_')}_Resume`);
  
  useEffect(() => {
    setSaveStatus('saving');
    const timer = setTimeout(() => {
      setSaveStatus('synced');
    }, 800);
    return () => clearTimeout(timer);
  }, [editorState]);

  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: customFileName || `${editorState.content.personalInfo.fullName.replace(/\s+/g, '_')}_Resume`,
    onAfterPrint: () => setShowExportModal(false)
  });

  const handleTemplateChange = (templateId: string) => {
    setEditorState(prev => prev ? { ...prev, templateId } : null);
  };

  const getActiveTemplateComponent = () => {
    return TEMPLATES_MAP[editorState.templateId] || ModernDeveloperTemplate;
  };

  // Measure and track the unscaled printable area height using ResizeObserver
  useEffect(() => {
    const el = componentRef.current;
    if (!el) return;

    const updateHeight = () => {
      setContainerHeight(el.getBoundingClientRect().height || el.scrollHeight || 1123);
    };

    updateHeight();

    const observer = new ResizeObserver(() => {
      updateHeight();
    });
    observer.observe(el);

    return () => observer.disconnect();
  }, [editorState]);

  // Unified window resize handler for automatic Fit Page and Fit Width scales
  useEffect(() => {
    if (!isFitWidth && !isFitPage) return;

    const handleResize = () => {
      if (isFitPage) {
        if (canvasRef.current) {
          const canvasWidth = canvasRef.current.clientWidth;
          const canvasHeight = canvasRef.current.clientHeight;
          const padding = 64; // Horizontal & vertical spacing
          const availableWidth = Math.max(200, canvasWidth - padding);
          const availableHeight = Math.max(200, canvasHeight - padding);
          const widthScale = availableWidth / 794;
          const heightScale = availableHeight / 1123;
          const fitScale = Math.min(widthScale, heightScale);
          setZoom(Math.max(0.35, Math.min(1.0, fitScale)));
        }
      } else if (isFitWidth) {
        if (canvasRef.current) {
          const canvasWidth = canvasRef.current.clientWidth;
          const padding = 64;
          const targetWidth = Math.max(200, canvasWidth - padding);
          const newZoom = targetWidth / 794;
          setZoom(Math.max(0.4, Math.min(1.5, newZoom)));
        }
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isFitWidth, isFitPage]);

  // Run initial page-fit on component paint
  useEffect(() => {
    const timer = setTimeout(() => {
      handleFitPage();
    }, 150);
    return () => clearTimeout(timer);
  }, []);

  const handleFitPage = () => {
    setIsFitWidth(false);
    setIsFitPage(true);
    if (canvasRef.current) {
      const canvasWidth = canvasRef.current.clientWidth;
      const canvasHeight = canvasRef.current.clientHeight;
      const padding = 64;
      const availableWidth = Math.max(200, canvasWidth - padding);
      const availableHeight = Math.max(200, canvasHeight - padding);
      const widthScale = availableWidth / 794;
      const heightScale = availableHeight / 1123;
      const fitScale = Math.min(widthScale, heightScale);
      setZoom(Math.max(0.35, Math.min(1.0, fitScale)));
    }
  };

  const handleFitToWidth = () => {
    setIsFitWidth(true);
    setIsFitPage(false);
    if (canvasRef.current) {
      const canvasWidth = canvasRef.current.clientWidth;
      const padding = 64;
      const targetWidth = Math.max(200, canvasWidth - padding);
      const newZoom = targetWidth / 794;
      setZoom(Math.max(0.4, Math.min(1.5, newZoom)));
    }
  };

  const changeZoom = (newZoom: number) => {
    setIsFitWidth(false);
    setIsFitPage(false);
    setZoom(newZoom);
  };

  const handleZoomOut = () => {
    setIsFitWidth(false);
    setIsFitPage(false);
    const currentIdx = ZOOM_OPTIONS.findIndex(opt => Math.abs(opt.value - zoom) < 0.02);
    if (currentIdx > 0) {
      setZoom(ZOOM_OPTIONS[currentIdx - 1].value);
    } else if (currentIdx === -1) {
      const nextOpt = [...ZOOM_OPTIONS].reverse().find(opt => opt.value < zoom);
      if (nextOpt) setZoom(nextOpt.value);
      else setZoom(0.4);
    } else {
      setZoom(0.4);
    }
  };

  const handleZoomIn = () => {
    setIsFitWidth(false);
    setIsFitPage(false);
    const currentIdx = ZOOM_OPTIONS.findIndex(opt => Math.abs(opt.value - zoom) < 0.02);
    if (currentIdx !== -1 && currentIdx < ZOOM_OPTIONS.length - 1) {
      setZoom(ZOOM_OPTIONS[currentIdx + 1].value);
    } else if (currentIdx === -1) {
      const nextOpt = ZOOM_OPTIONS.find(opt => opt.value > zoom);
      if (nextOpt) setZoom(nextOpt.value);
      else setZoom(1.0);
    } else {
      setZoom(1.0);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#121212] select-none">
      {/* Toolbar */}
      <div className="min-h-[4.5rem] py-3.5 px-4 md:px-6 border-b border-white/10 bg-[#0a0a0a] flex flex-wrap gap-4 items-center justify-between sticky top-0 z-10 w-full">
        
        {/* Navigation & Template Selector dropdown */}
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            onClick={() => router.push(`/dashboard/analysis/${analysis._id}`)}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/10 hover:border-white/20 text-gray-300 hover:text-white text-xs font-bold transition-all duration-200 shadow-sm shrink-0 active:scale-95 group focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            title="Return to the Career analysis metrics dashboard"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-indigo-400 group-hover:text-indigo-300 transition-colors shrink-0" />
            <span className="font-extrabold uppercase tracking-widest text-[10px]">Back to Analysis</span>
          </button>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/10 text-gray-300 shrink-0">
            <LayoutTemplate className="w-4 h-4 text-indigo-400 shrink-0" />
            <select
              value={editorState.templateId}
              onChange={(e) => handleTemplateChange(e.target.value)}
              className="bg-transparent text-xs font-bold uppercase tracking-wider focus:outline-none cursor-pointer pr-2 text-white"
            >
              {TEMPLATE_OPTIONS.map(opt => (
                <option key={opt.id} value={opt.id} className="bg-[#0a0a0a] text-white">{opt.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Zoom controls */}
        <div className="flex items-center gap-2 bg-white/[0.03] border border-white/10 px-3 py-1.5 rounded-xl shrink-0 w-[170px] justify-between">
          <button 
            onClick={handleZoomOut}
            className="p-1 hover:bg-white/5 rounded-lg transition-colors text-gray-400 hover:text-white shrink-0"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          
          <select
            value={isFitPage ? 'fit-page' : isFitWidth ? 'fit-width' : ZOOM_OPTIONS.some(o => Math.abs(o.value - zoom) < 0.02) ? String(zoom) : 'custom'}
            onChange={(e) => {
              const val = e.target.value;
              if (val === 'fit-page') {
                handleFitPage();
              } else if (val === 'fit-width') {
                handleFitToWidth();
              } else if (val !== 'custom') {
                changeZoom(parseFloat(val));
              }
            }}
            className="bg-transparent text-xs font-semibold focus:outline-none cursor-pointer text-white font-mono shrink-0 w-[85px] text-center"
          >
            <option value="fit-page" className="bg-[#0a0a0a] text-white">Fit Page</option>
            <option value="fit-width" className="bg-[#0a0a0a] text-white">Fit Width</option>
            {ZOOM_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value} className="bg-[#0a0a0a] text-white">
                {opt.label}
              </option>
            ))}
            {!ZOOM_OPTIONS.some(o => Math.abs(o.value - zoom) < 0.02) && !isFitWidth && !isFitPage && (
              <option value="custom" className="bg-[#0a0a0a] text-white">Custom ({Math.round(zoom * 100)}%)</option>
            )}
          </select>

          <button 
            onClick={handleZoomIn}
            className="p-1 hover:bg-white/5 rounded-lg transition-colors text-gray-400 hover:text-white shrink-0"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Status Indicators & Actions */}
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          {/* Autosave cloud indicator */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/10 text-xs font-semibold select-none shrink-0">
            {saveStatus === 'saving' ? (
              <>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                </span>
                <span className="text-gray-400 font-mono text-[10px]">Saving...</span>
              </>
            ) : (
              <>
                <span className="relative flex h-2 w-2">
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-emerald-400 font-mono text-[10px] uppercase tracking-wider font-black">Synced</span>
              </>
            )}
          </div>

          {/* ATS Safe Badge */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold select-none shrink-0">
            <CheckCircle2 className="w-3.5 h-3.5" />
            ATS Safe
          </div>

          {/* Export PDF Button */}
          <button 
            onClick={() => {
              setCustomFileName(`${editorState.content.personalInfo.fullName.replace(/\s+/g, '_')}_Resume`);
              setShowExportModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-gray-200 text-black text-xs font-black uppercase tracking-wider shadow-lg shadow-white/5 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 shrink-0"
            title="Export standard printable PDF format"
          >
            <Download className="w-4 h-4 shrink-0" />
            Export PDF
          </button>
        </div>
      </div>

      {/* Canvas Area with scroll support */}
      <div 
        ref={canvasRef}
        className="flex-1 overflow-auto custom-scrollbar bg-[#121212] relative w-full flex justify-center items-start p-8 pb-32"
      >
        {/* Inject print-specific stylesheets for standard A4 boundary print rendering */}
        <style dangerouslySetInnerHTML={{ __html: `
          @media print {
            @page {
              size: A4 portrait;
              margin: 0 !important; /* Templates provide their own padding */
            }
            body {
              background: white !important;
              margin: 0 !important;
              padding: 0 !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            .printable-page, .resume-print-root {
              width: 100% !important;
              max-width: 100% !important;
              box-sizing: border-box !important;
              min-height: auto !important; /* Let content determine height, no blank pages */
              margin: 0 !important;
              box-shadow: none !important;
              border: none !important;
              transform: none !important;
              page-break-inside: auto !important;
              page-break-after: auto !important;
              overflow: visible !important;
              word-break: break-word !important;
              overflow-wrap: break-word !important;
            }
            /* Allow large sections to split naturally so we don't get huge blank gaps */
            section, article, .resume-section {
              page-break-inside: auto !important;
              break-inside: auto !important;
            }
            /* Keep headings attached to the content immediately following them */
            h1, h2, h3, h4, h5, h6 {
              page-break-after: avoid !important;
              break-after: avoid !important;
            }
            /* Avoid splitting individual items inside a section (direct children of space-y wrappers) */
            .resume-section > div > div, .resume-section > ul > li, [data-breakable="true"] > div > div, [data-section-item="true"], .break-inside-avoid {
              page-break-inside: avoid !important;
              break-inside: avoid !important;
            }
            ul, li {
              page-break-inside: auto !important;
              break-inside: auto !important;
            }
            li {
              page-break-inside: avoid !important;
              break-inside: avoid !important;
            }
          }
        ` }} />
        <div 
          className="print:!h-auto print:!w-auto print:!block"
          style={{
            height: `${containerHeight * zoom}px`,
            width: `${794 * zoom}px`,
            position: 'relative',
            flexShrink: 0
          }}
        >
          <div 
            className="relative flex-shrink-0 print:!transform-none print:!w-full print:!static print:!left-auto print:!ml-0"
            style={{ 
              transform: `scale(${zoom})`, 
              transformOrigin: 'top center',
              width: '794px',
              position: 'absolute',
              left: '50%',
              marginLeft: '-397px',
              transition: 'transform 0.15s ease-out'
            }}
          >
            {/* The printable area containing pages */}
            <div 
              ref={componentRef} 
              className="flex flex-col gap-8 select-text w-[794px] print:!w-full print:!gap-0 print:!block"
            >
              <ResumePageEngine 
                editorState={editorState}
                TemplateComponent={getActiveTemplateComponent()}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Export PDF Modal */}
      <AnimatePresence>
        {showExportModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-[#121212] border border-white/10 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden"
            >
              <div className="flex items-center justify-between p-5 border-b border-white/10">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <FileText className="w-4 h-4 text-indigo-400" />
                  Export Professional PDF
                </h3>
                <button
                  onClick={() => setShowExportModal(false)}
                  className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="p-6 space-y-5">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-2">
                    PDF File Name
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={customFileName}
                      onChange={(e) => setCustomFileName(e.target.value)}
                      className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder-gray-600"
                      placeholder="e.g. Srijan_Kumar_Resume"
                    />
                    <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-gray-500 text-sm font-mono">
                      .pdf
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 mt-3">
                    Your resume will be exported precisely as it appears in the live preview.
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button
                    onClick={() => setShowExportModal(false)}
                    className="px-4 py-2.5 rounded-xl border border-white/10 text-gray-300 hover:bg-white/5 hover:text-white text-xs font-bold transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      if (!customFileName) setCustomFileName('Resume');
                      handlePrint();
                    }}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-500/20 transition-all"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download PDF
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
