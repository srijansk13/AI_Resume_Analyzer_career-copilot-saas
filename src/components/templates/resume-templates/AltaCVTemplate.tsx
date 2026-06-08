import React from 'react';
import { EditorState } from '@/models/EditorState';
import { ContactLinks, ProjectLinks } from "@/utils/linkFormatter";

interface TemplateProps {
  editorState: EditorState;
}

export default function AltaCVTemplate({ editorState }: TemplateProps) {
  const { content, visibleSections, sectionOrder, theme } = editorState;
  const { personalInfo, summary, experience, education, projects, skills, certifications, awards = [], publications = [] } = content;

  return (
    <div className="resume-print-root p-0 font-sans text-gray-800 text-[0.89em] print:text-[0.84em] leading-relaxed bg-white flex h-full">
      {/* LEFT SIDEBAR */}
      <div className="w-[35%] bg-[#1b3a4b] text-white p-10 print:p-14">
        <header className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight mb-2 uppercase">{personalInfo.fullName}</h1>
          <div className="text-[1.16em] font-semibold text-[#89c2d9]">{personalInfo.title}</div>
        </header>

        <section className="mb-8">
          <h2 className="text-[1.26em] font-bold uppercase tracking-wider mb-3 pb-1 border-b-2 border-[#89c2d9] inline-block">Contact</h2>
          <div className="space-y-2 text-[0.95em] font-light">
            {personalInfo.contact.email && <div>{personalInfo.contact.email}</div>}
            {personalInfo.contact.phone && <div>{personalInfo.contact.phone}</div>}
            {personalInfo.contact.location && <div>{personalInfo.contact.location}</div>}
            {((personalInfo.contact.linkedin) || (personalInfo.contact.github) || (personalInfo.contact.website )) && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <ContactLinks contact={personalInfo.contact} separator={<br />} linkColor="#fff" />
              </div>
            )}
          </div>
        </section>

        {visibleSections.skills && skills.length > 0 && (
          <section className="mb-8">
            <h2 className="text-[1.26em] font-bold uppercase tracking-wider mb-3 pb-1 border-b-2 border-[#89c2d9] inline-block">Skills</h2>
            {Array.isArray(skills) && typeof skills[0] === 'string' ? (
              <p className="text-[0.95em] font-light">{(skills as string[]).join(', ')}</p>
            ) : (
              <div className="space-y-3">
                {(skills as any[]).map((cat, idx) => (
                  <div key={idx}>
                    <div className="font-semibold text-[1.00em] mb-1">{cat.category}</div>
                    <div className="flex flex-wrap gap-1">
                      {cat.skills.map((s: string, i: number) => (
                        <span key={i} className="bg-[#2c7da0]/40 px-2 py-0.5 rounded text-[0.84em]">{s}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {visibleSections.education && education.length > 0 && (
          <section className="mb-8">
            <h2 className="text-[1.26em] font-bold uppercase tracking-wider mb-3 pb-1 border-b-2 border-[#89c2d9] inline-block">Education</h2>
            <div className="space-y-4">
              {education.map((edu) => (
                <div key={edu.id}>
                  <div className="font-bold text-[1.00em]">{edu.degree}</div>
                  <div className="text-[0.95em] text-[#a9d6e5] font-light">{edu.institution}</div>
                  <div className="text-[0.84em] text-gray-300 italic">{edu.startDate} – {edu.endDate || 'Present'}</div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* RIGHT CONTENT */}
      <div className="w-[65%] p-10 print:p-14 bg-white">
        {visibleSections.summary && summary && (
          <section className="resume-section mb-6">
            <h2 className="text-[1.37em] font-bold text-[#1b3a4b] uppercase tracking-wider border-b-2 border-[#1b3a4b] mb-3 pb-0.5">Profile</h2>
            <p className="text-gray-700 text-justify">{summary}</p>
          </section>
        )}

        {visibleSections.experience && experience.length > 0 && (
          <section className="resume-section mb-6">
            <h2 className="text-[1.37em] font-bold text-[#1b3a4b] uppercase tracking-wider border-b-2 border-[#1b3a4b] mb-4 pb-0.5">Experience</h2>
            <div className="space-y-5">
              {experience.map((exp) => (
                <div key={exp.id} className="relative pl-4 border-l-2 border-[#89c2d9]">
                  <div className="absolute w-2 h-2 rounded-full bg-[#1b3a4b] -left-[5px] top-1.5" />
                  <div className="flex justify-between items-baseline mb-0.5">
                    <span className="font-bold text-[1.11em] text-[#1b3a4b]">{exp.role}</span>
                    <span className="text-[0.89em] text-gray-500 font-semibold">{exp.startDate} – {exp.endDate || 'Present'}</span>
                  </div>
                  <div className="text-[#2c7da0] font-medium mb-1.5">{exp.company} <span className="text-gray-400 italic font-normal text-[0.89em] ml-1">{exp.location}</span></div>
                  <ul className="list-disc pl-4 space-y-1 text-gray-700">
                    {exp.bullets.map((bullet, idx) => (
                      <li key={idx} className="pl-1">{bullet}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        )}

        {visibleSections.projects && projects.length > 0 && (
          <section className="resume-section mb-6">
            <h2 className="text-[1.37em] font-bold text-[#1b3a4b] uppercase tracking-wider border-b-2 border-[#1b3a4b] mb-4 pb-0.5">Projects</h2>
            <div className="space-y-5">
              {projects.map((proj) => (
                <div key={proj.id} className="relative pl-4 border-l-2 border-[#89c2d9]">
                  <div className="absolute w-2 h-2 rounded-full bg-[#1b3a4b] -left-[5px] top-1.5" />
                  <div className="flex justify-between items-baseline mb-0.5">
                    <span className="font-bold text-[1.11em] text-[#1b3a4b]">{proj.name}</span>
                    <ProjectLinks
                      project={proj}
                      separator=" | "
                      linkColor={theme.accentColor || '#3b82f6'}
                      style={{ fontSize: '8pt' }}
                    />
                    <span className="text-[0.89em] text-gray-500 font-semibold"></span>
                  </div>
                  {proj.technologies && proj.technologies.length > 0 && (
                    <div className="text-[#2c7da0] text-[0.89em] mb-1.5 font-medium">{proj.technologies.join(', ')}</div>
                  )}
                  <ul className="list-disc pl-4 space-y-1 text-gray-700">
                    {proj.bullets.map((bullet, idx) => (
                      <li key={idx} className="pl-1">{bullet}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
