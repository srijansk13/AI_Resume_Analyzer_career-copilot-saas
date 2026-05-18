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
    <div className="flex flex-col items-center gap-8 w-full py-4 select-none">
      {/* Page Info Header for UX */}
      <div className="w-[794px] px-4 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold flex justify-between items-center font-mono">
        <span>PREVIEW MODE: SAFE HIGH-PERFORMANCE RENDERER</span>
        <span>A4 STANDARD WIDTH (794PX)</span>
      </div>

      {/* Standard Continuous A4 Visual Container */}
      <div
        className="shadow-2xl shadow-black/85 rounded-sm bg-white relative print:shadow-none print:m-0 printable-page"
        style={{
          width: '794px',
          minHeight: '1123px', // Standard 1 A4 Page Height
          position: 'relative',
          overflow: 'visible',
          color: 'black',
          background: 'white'
        }}
      >
        <TemplateComponent editorState={editorState} />

        {/* Subtle, beautiful dashed Page Break indicator at exactly y = 1123px */}
        <div 
          className="print:hidden"
          style={{
            position: 'absolute',
            top: '1123px',
            left: '0',
            right: '0',
            borderTop: '2px dashed #cbd5e1',
            pointerEvents: 'none',
            display: 'block',
            zIndex: 50
          }}
        >
          <span 
            style={{
              position: 'absolute',
              right: '16px',
              top: '-10px',
              background: '#f8fafc',
              color: '#64748b',
              fontSize: '7.5pt',
              fontWeight: 'bold',
              padding: '2px 8px',
              borderRadius: '4px',
              border: '1px solid #e2e8f0',
              fontFamily: 'monospace'
            }}
          >
            A4 PAGE 1 ENDS HERE
          </span>
        </div>

        {/* Subtle, beautiful dashed Page Break indicator at exactly y = 2246px */}
        <div 
          className="print:hidden"
          style={{
            position: 'absolute',
            top: '2246px',
            left: '0',
            right: '0',
            borderTop: '2px dashed #cbd5e1',
            pointerEvents: 'none',
            display: 'block',
            zIndex: 50
          }}
        >
          <span 
            style={{
              position: 'absolute',
              right: '16px',
              top: '-10px',
              background: '#f8fafc',
              color: '#64748b',
              fontSize: '7.5pt',
              fontWeight: 'bold',
              padding: '2px 8px',
              borderRadius: '4px',
              border: '1px solid #e2e8f0',
              fontFamily: 'monospace'
            }}
          >
            A4 PAGE 2 ENDS HERE
          </span>
        </div>
      </div>
    </div>
  );
}
