import React from 'react';
import { EditorState } from '@/models/EditorState';
import { ContactLinks, ProjectLinks } from "@/utils/linkFormatter";

interface TemplateProps {
  editorState: EditorState;
}

export default function JakesResumeTemplate({ editorState }: TemplateProps) {
  const { content, visibleSections, sectionOrder, theme } = editorState;
  const { personalInfo, summary, experience, education, projects, skills, certifications, achievements = [], awards = [], publications = [], leadership = [] } = content;

  return (
    <div className="resume-print-root p-8 print:p-14 font-serif text-black text-[1.05em] print:text-[0.95em] leading-[1.25] bg-white w-full" style={{ fontFamily: '"Times New Roman", Times, serif', minHeight: '297mm' }}>
      {/* HEADER */}
      <header className="text-center mb-4">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 mb-1">
          {personalInfo.fullName}
        </h1>
        <div className="flex flex-wrap justify-center items-center gap-x-2 gap-y-0.5 text-[1.00em] text-gray-800">
          {personalInfo.contact.phone && <span>{personalInfo.contact.phone}</span>}
          {personalInfo.contact.phone && personalInfo.contact.email && <span>|</span>}
          {personalInfo.contact.email && <span>{personalInfo.contact.email}</span>}
          {((personalInfo.contact.linkedin) || (personalInfo.contact.github) || (personalInfo.contact.website )) && (
            <span className="inline-flex items-center gap-2">
              <span>|</span>
              <ContactLinks contact={personalInfo.contact} separator={<span>|</span>} linkColor="inherit" />
            </span>
          )}
        </div>
      </header>

      {/* DYNAMIC SECTIONS */}
      <div className="space-y-2">
        {sectionOrder.map((sectionKey) => {
          if (!visibleSections[sectionKey as keyof typeof visibleSections]) return null;

          switch (sectionKey) {
            case 'education':
              return education.length > 0 ? (
                <section key="education" className="resume-section">
                  <h2 className="text-[1.26em] font-bold text-black border-b border-black mb-1.5 uppercase tracking-wide">Education</h2>
                  <div className="space-y-1.5">
                    {education.map((edu) => (
                      <div key={edu.id} data-section-item="true">
                        <div className="flex justify-between items-baseline">
                          <span className="font-bold">{edu.institution}</span>
                          <span className="italic"></span>
                        </div>
                        <div className="flex justify-between items-baseline">
                          <span className="italic">{edu.degree} {edu.field ? `in ${edu.field}` : ''}</span>
                          <span>{edu.startDate} {edu.endDate ? `– ${edu.endDate}` : ''}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              ) : null;

            case 'experience':
              return experience.length > 0 ? (
                <section key="experience" className="resume-section">
                  <h2 className="text-[1.26em] font-bold text-black border-b border-black mb-1.5 uppercase tracking-wide">Experience</h2>
                  <div className="space-y-1.5">
                    {experience.map((exp) => (
                      <div key={exp.id} data-section-item="true">
                        <div className="flex justify-between items-baseline">
                          <span className="font-bold">{exp.role}</span>
                          <span>{exp.startDate} {exp.endDate ? `– ${exp.endDate}` : ''}</span>
                        </div>
                        <div className="flex justify-between items-baseline mb-1">
                          <span className="italic">{exp.company}</span>
                          <span className="italic">{exp.location}</span>
                        </div>
                        <ul className="list-disc pl-5 space-y-0.5">
                          {exp.bullets.map((bullet, idx) => (
                            <li key={idx} className="pl-1 leading-snug">{bullet}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </section>
              ) : null;

            case 'projects':
              return projects.length > 0 ? (
                <section key="projects" className="resume-section">
                  <h2 className="text-[1.26em] font-bold text-black border-b border-black mb-1.5 uppercase tracking-wide">Projects</h2>
                  <div className="space-y-1.5">
                    {projects.map((proj) => (
                      <div key={proj.id} data-section-item="true">
                        <div className="flex justify-between items-baseline mb-0.5">
                          <div>
                            <span className="font-bold">{proj.name}</span>
                            <ProjectLinks
                              project={proj}
                              separator=" | "
                              linkColor={theme.accentColor || '#3b82f6'}
                              style={{ fontSize: '8pt' }}
                            />
                            {proj.technologies && proj.technologies.length > 0 && (
                              <span className="italic"> | {proj.technologies.join(', ')}</span>
                            )}
                          </div>
                          <span></span>
                        </div>
                        <ul className="list-disc pl-5 space-y-0.5">
                          {proj.bullets.map((bullet, idx) => (
                            <li key={idx} className="pl-1 leading-snug">{bullet}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </section>
              ) : null;

            case 'skills':
              return skills.length > 0 ? (
                <section key="skills" className="resume-section">
                  <h2 className="text-[1.26em] font-bold text-black border-b border-black mb-1.5 uppercase tracking-wide">Technical Skills</h2>
                  {Array.isArray(skills) && typeof skills[0] === 'string' ? (
                    <p className="leading-snug">{(skills as string[]).join(', ')}</p>
                  ) : (
                    <div className="space-y-0.5">
                      {(skills as any[]).map((cat, idx) => (
                        <div key={idx} className="flex">
                          <span className="font-bold w-32 shrink-0">{cat.category}:</span>
                          <span>{cat.skills.join(', ')}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              ) : null;

            case 'leadership':
              return leadership.length > 0 ? (
                <section key="leadership" className="resume-section">
                  <h2 className="text-[1.26em] font-bold text-black border-b border-black mb-1.5 uppercase tracking-wide">Leadership</h2>
                  <div className="space-y-1.5">
                    {leadership.map((lead) => (
                      <div key={lead.id} data-section-item="true">
                        <div className="flex justify-between items-baseline">
                          <span className="font-bold">{lead.role}</span>
                          <span>{lead.startDate} {lead.endDate ? `– ${lead.endDate}` : ''}</span>
                        </div>
                        <div className="flex justify-between items-baseline mb-1">
                          <span className="italic">{lead.organization}</span>
                        </div>
                        {lead.bullets && lead.bullets.length > 0 && (
                          <ul className="list-disc pl-5 space-y-0.5">
                            {lead.bullets.map((bullet, idx) => (
                              <li key={idx} className="pl-1 leading-snug">{bullet}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              ) : null;

            default:
              return null;
          }
        })}
      </div>
    </div>
  );
}
