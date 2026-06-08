import React from 'react';
import { EditorState } from '@/models/EditorState';
import { ContactLinks, ProjectLinks } from "@/utils/linkFormatter";

interface TemplateProps {
  editorState: EditorState;
}

export default function AwesomeCVTemplate({ editorState }: TemplateProps) {
  const { content, visibleSections, sectionOrder, theme } = editorState;
  const { personalInfo, summary, experience, education, projects, skills, certifications, awards = [], publications = [] } = content;

  return (
    <div className="resume-print-root p-12 print:p-16 font-sans text-[#333333] text-[0.95em] print:text-[0.89em] leading-relaxed bg-white">
      {/* HEADER */}
      <header className="mb-6 text-center border-b-[3px] border-[#dc3522] pb-6">
        <h1 className="text-3xl font-bold tracking-widest uppercase mb-2">
          {personalInfo.fullName.split(' ').map((n, i, arr) => i === arr.length - 1 ? <span key={i} className="text-[#dc3522]">{n}</span> : <span key={i}>{n} </span>)}
        </h1>
        {personalInfo.title && <div className="text-[1.16em] tracking-widest text-[#555] uppercase font-semibold mb-3">{personalInfo.title}</div>}
        <div className="flex flex-wrap justify-center items-center gap-2.5 text-[0.89em] text-[#555] font-medium">
          {personalInfo.contact.location && <span>{personalInfo.contact.location}</span>}
          {personalInfo.contact.location && personalInfo.contact.phone && <span className="text-[#dc3522] text-[6pt]">●</span>}
          {personalInfo.contact.phone && <span>{personalInfo.contact.phone}</span>}
          {personalInfo.contact.phone && personalInfo.contact.email && <span className="text-[#dc3522] text-[6pt]">●</span>}
          {personalInfo.contact.email && <span>{personalInfo.contact.email}</span>}
          {((personalInfo.contact.linkedin) || (personalInfo.contact.github) || (personalInfo.contact.website )) && (
            <span className="inline-flex items-center gap-2.5">
              <span className="text-[#dc3522] text-[6pt]">●</span>
              <ContactLinks contact={personalInfo.contact} separator={<span className="text-[#dc3522] text-[6pt]">●</span>} linkColor="#555" />
            </span>
          )}
        </div>
      </header>

      <div className="space-y-4">
        {sectionOrder.map((sectionKey) => {
          if (!visibleSections[sectionKey as keyof typeof visibleSections]) return null;

          switch (sectionKey) {
            case 'summary':
              return summary ? (
                <section key="summary" className="resume-section">
                  <h2 className="text-[1.37em] font-bold text-[#222] border-b border-[#ddd] mb-3 pb-1 flex items-center">
                    <span className="w-1.5 h-1.5 bg-[#dc3522] inline-block mr-2 rounded-full"></span> SUMMARY
                  </h2>
                  <p className="text-[#444] text-justify leading-relaxed">{summary}</p>
                </section>
              ) : null;

            case 'experience':
              return experience.length > 0 ? (
                <section key="experience" className="resume-section">
                  <h2 className="text-[1.37em] font-bold text-[#222] border-b border-[#ddd] mb-3 pb-1 flex items-center">
                    <span className="w-1.5 h-1.5 bg-[#dc3522] inline-block mr-2 rounded-full"></span> EXPERIENCE
                  </h2>
                  <div className="space-y-4">
                    {experience.map((exp) => (
                      <div key={exp.id}>
                        <div className="flex justify-between items-baseline mb-0.5">
                          <span className="font-bold text-[1.11em] text-[#dc3522]">{exp.role}</span>
                          <span className="text-[#666] text-[0.89em] font-semibold">{exp.startDate} – {exp.endDate || 'PRESENT'}</span>
                        </div>
                        <div className="flex justify-between items-baseline mb-1.5">
                          <span className="font-semibold text-[#333]">{exp.company}</span>
                          <span className="text-[#777] italic text-[0.89em]">{exp.location}</span>
                        </div>
                        <ul className="list-disc pl-5 space-y-1 text-[#444]">
                          {exp.bullets.map((bullet, idx) => (
                            <li key={idx} className="pl-1 leading-snug">{bullet}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </section>
              ) : null;

            case 'education':
              return education.length > 0 ? (
                <section key="education" className="resume-section">
                  <h2 className="text-[1.37em] font-bold text-[#222] border-b border-[#ddd] mb-3 pb-1 flex items-center">
                    <span className="w-1.5 h-1.5 bg-[#dc3522] inline-block mr-2 rounded-full"></span> EDUCATION
                  </h2>
                  <div className="space-y-3">
                    {education.map((edu) => (
                      <div key={edu.id} className="flex justify-between items-start">
                        <div>
                          <div className="font-bold text-[#dc3522] text-[1.11em] mb-0.5">{edu.institution}</div>
                          <div className="font-semibold text-[#333]">{edu.degree} {edu.field ? `in ${edu.field}` : ''}</div>
                          {edu.gpa && <div className="text-[#666] italic text-[0.89em]">GPA: {edu.gpa}</div>}
                        </div>
                        <div className="text-right">
                          <div className="text-[#666] text-[0.89em] font-semibold mb-0.5">{edu.startDate} – {edu.endDate || 'PRESENT'}</div>
                          <div className="text-[#777] italic text-[0.89em]"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              ) : null;

            case 'skills':
              return skills.length > 0 ? (
                <section key="skills" className="resume-section">
                  <h2 className="text-[1.37em] font-bold text-[#222] border-b border-[#ddd] mb-3 pb-1 flex items-center">
                    <span className="w-1.5 h-1.5 bg-[#dc3522] inline-block mr-2 rounded-full"></span> SKILLS
                  </h2>
                  {Array.isArray(skills) && typeof skills[0] === 'string' ? (
                    <p className="text-[#444]">{(skills as string[]).join(', ')}</p>
                  ) : (
                    <div className="space-y-1.5">
                      {(skills as any[]).map((cat, idx) => (
                        <div key={idx} className="flex items-start">
                          <span className="font-bold text-[#dc3522] w-32 shrink-0">{cat.category}:</span>
                          <span className="text-[#444]">{cat.skills.join(', ')}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              ) : null;

            case 'projects':
              return projects.length > 0 ? (
                <section key="projects" className="resume-section">
                  <h2 className="text-[1.37em] font-bold text-[#222] border-b border-[#ddd] mb-3 pb-1 flex items-center">
                    <span className="w-1.5 h-1.5 bg-[#dc3522] inline-block mr-2 rounded-full"></span> PROJECTS
                  </h2>
                  <div className="space-y-4">
                    {projects.map((proj) => (
                      <div key={proj.id}>
                        <div className="flex justify-between items-baseline mb-0.5">
                          <span className="font-bold text-[1.11em] text-[#dc3522]">{proj.name}</span>
                          <ProjectLinks
                            project={proj}
                            separator=" | "
                            linkColor={theme.accentColor || '#3b82f6'}
                            style={{ fontSize: '8pt' }}
                          />
                          <span className="text-[#666] text-[0.89em] font-semibold"></span>
                        </div>
                        {proj.technologies && proj.technologies.length > 0 && (
                          <div className="font-semibold text-[#333] mb-1.5">{proj.technologies.join(', ')}</div>
                        )}
                        <ul className="list-disc pl-5 space-y-1 text-[#444]">
                          {proj.bullets.map((bullet, idx) => (
                            <li key={idx} className="pl-1 leading-snug">{bullet}</li>
                          ))}
                        </ul>
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
