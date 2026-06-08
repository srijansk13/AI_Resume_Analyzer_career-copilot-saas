'use client';

import React, { useEffect } from 'react';
import { EditorState } from '@/models/EditorState';

interface ResumePageEngineProps {
  editorState: EditorState;
  TemplateComponent: React.ElementType;
}

export default function ResumePageEngine({ editorState, TemplateComponent }: ResumePageEngineProps) {
  const templateId = (TemplateComponent as any).name || (TemplateComponent as any).displayName || 'UnknownTemplate';

  // Add mandated emergency debug logs
  useEffect(() => {
    console.log("[Pagination Emergency] Using safe rendering mode");
    console.log("[Template Render] templateId:", templateId);
    console.log("[Template Render] sections present:", {
      summary: !!editorState.content.summary,
      education: editorState.content.education?.length,
      experience: editorState.content.experience?.length,
      projects: editorState.content.projects?.length,
      skills: editorState.content.skills?.length
    });
  }, [editorState, TemplateComponent]);

  return (
    <div className="flex flex-col items-center gap-8 w-full py-4 select-none print:!p-0 print:!m-0 print:!gap-0 print:!items-start print:!block">
      {/* Page Info Header for UX */}
      <div className="print:hidden w-[794px] px-4 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold flex justify-between items-center font-mono">
        <span>PREVIEW MODE: SAFE HIGH-PERFORMANCE RENDERER</span>
        <span>A4 STANDARD WIDTH (794PX)</span>
      </div>

      {/* Standard Continuous A4 Visual Container */}
      <div
        data-export-page="true"
        className="shadow-2xl shadow-black/85 rounded-sm bg-white relative print:shadow-none print:m-0 printable-page"
        style={{
          width: '794px',
          minHeight: '1123px', // Standard 1 A4 Page Height
          position: 'relative',
          overflow: 'visible',
          color: 'black',
          background: 'white',
          // Inject custom properties
          '--theme-primary': editorState.theme.primaryColor || '#0f172a',
          '--theme-accent': editorState.theme.accentColor || '#3b82f6',
          '--theme-text': editorState.theme.textColor || '#334155',
        } as React.CSSProperties}
      >
        <style dangerouslySetInnerHTML={{ __html: `
          /* Typography Overrides */
          ${editorState.theme.fontFamily ? `
            .printable-page, .resume-print-root { font-family: ${editorState.theme.fontFamily} !important; }
            .printable-page *:not(h1):not(h2):not(h3):not(h4):not(h5):not(h6) { font-family: inherit !important; }
          ` : ''}
          ${editorState.theme.headingFont ? `
            .printable-page h1, .printable-page h2, .printable-page h3, .printable-page h4, .printable-page h5, .printable-page h6,
            .printable-page h1 *, .printable-page h2 *, .printable-page h3 *, .printable-page h4 *, .printable-page h5 *, .printable-page h6 * { 
              font-family: ${editorState.theme.headingFont} !important; 
            }
          ` : ''}
          ${editorState.theme.fontSize ? `
            .printable-page, .resume-print-root { font-size: ${editorState.theme.fontSize} !important; }
          ` : ''}
          
          /* Color Overrides for explicit hardcoded template colors */
          .printable-page .text-\\[\\#3498db\\], .printable-page .text-\\[\\#0055aa\\], .printable-page .text-\\[\\#1b3a4b\\], .printable-page .text-\\[\\#2c7da0\\] {
             color: var(--theme-accent) !important;
          }
          .printable-page .bg-\\[\\#3498db\\], .printable-page .bg-\\[\\#0055aa\\], .printable-page .bg-\\[\\#1b3a4b\\], .printable-page .bg-\\[\\#2c7da0\\] {
             background-color: var(--theme-accent) !important;
          }
          .printable-page .border-\\[\\#3498db\\], .printable-page .border-\\[\\#0055aa\\], .printable-page .border-\\[\\#1b3a4b\\], .printable-page .border-\\[\\#2c7da0\\] {
             border-color: var(--theme-accent) !important;
          }
          .printable-page .text-\\[\\#dc3522\\] {
             color: var(--theme-primary) !important;
          }

          /* General spacing */
          ${editorState.theme.sectionSpacing ? `
            .printable-page section, .printable-page .resume-section { margin-bottom: ${editorState.theme.sectionSpacing} !important; }
          ` : ''}
        `}} />
        <TemplateComponent editorState={editorState} />

      </div>
    </div>
  );
}
