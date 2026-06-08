import React from 'react';
import { EditorState } from '@/models/EditorState';
import { ContactLinks, ProjectLinks } from "@/utils/linkFormatter";

interface TemplateProps {
  editorState: EditorState;
}

export default function FAANGResumeTemplate({ editorState }: TemplateProps) {
  const { content, visibleSections, sectionOrder, theme } = editorState;
  const { personalInfo, summary, experience, education, projects, skills, certifications, achievements = [], awards = [], publications = [], leadership = [] } = content;

  return (
    <div className="resume-print-root p-14 print:p-16 font-sans text-black text-[1.00em] print:text-[0.89em] leading-snug bg-white" style={{ fontFamily: 'Arial, sans-serif' }}>
      {/* HEADER */}
      <header className="mb-4">
        <h1 className="text-[20pt] font-bold text-black mb-1 leading-none">{personalInfo.fullName}</h1>
        <div className="text-[0.95em] flex flex-wrap gap-x-3 gap-y-1 text-gray-700">
          {personalInfo.contact.email && <span>{personalInfo.contact.email}</span>}
          {personalInfo.contact.phone && <span>{personalInfo.contact.phone}</span>}
          {personalInfo.contact.location && <span>{personalInfo.contact.location}</span>}
          {((personalInfo.contact.linkedin) || (personalInfo.contact.github) || (personalInfo.contact.website )) && (
            <ContactLinks contact={personalInfo.contact} separator={<span> </span>} linkColor="#2563eb" />
          )}
        </div>
      </header>

      {/* DYNAMIC SECTIONS */}
      <div className="space-y-3">
        {sectionOrder.map((sectionKey) => {
          if (!visibleSections[sectionKey as keyof typeof visibleSections]) return null;

          switch (sectionKey) {
            case 'experience':
              return experience.length > 0 ? (
                <section key="experience" className="resume-section">
                  <h2 className="text-[1.16em] font-bold text-black uppercase border-b-2 border-black mb-2 pb-0.5">Experience</h2>
                  <div className="space-y-3">
                    {experience.map((exp) => (
                      <div key={exp.id}>
                        <div className="flex justify-between items-baseline mb-1">
                          <div>
                            <span className="font-bold text-[1.11em]">{exp.company}</span>
                            <span className="italic ml-2">{exp.role}</span>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-[1.00em]">{exp.startDate} – {exp.endDate || 'Present'}</div>
                            {exp.location && <div className="text-[0.89em] text-gray-600">{exp.location}</div>}
                          </div>
                        </div>
                        <ul className="list-disc pl-5 space-y-1 mt-1">
                          {exp.bullets.map((bullet, idx) => (
                            <li key={idx} className="pl-1 text-justify">{bullet}</li>
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
                  <h2 className="text-[1.16em] font-bold text-black uppercase border-b-2 border-black mb-2 pb-0.5">Projects</h2>
                  <div className="space-y-3">
                    {projects.map((proj) => (
                      <div key={proj.id}>
                        <div className="flex justify-between items-baseline mb-1">
                          <div>
                            <span className="font-bold text-[1.11em]">{proj.name}</span>
                            <ProjectLinks
                              project={proj}
                              separator=" | "
                              linkColor={theme.accentColor || '#3b82f6'}
                              style={{ fontSize: '8pt' }}
                            />
                            {proj.technologies && proj.technologies.length > 0 && (
                              <span className="italic ml-2">({proj.technologies.join(', ')})</span>
                            )}
                          </div>
                          <div className="font-bold text-[1.00em] text-right"></div>
                        </div>
                        <ul className="list-disc pl-5 space-y-1 mt-1">
                          {proj.bullets.map((bullet, idx) => (
                            <li key={idx} className="pl-1 text-justify">{bullet}</li>
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
                  <h2 className="text-[1.16em] font-bold text-black uppercase border-b-2 border-black mb-2 pb-0.5">Education</h2>
                  <div className="space-y-2">
                    {education.map((edu) => (
                      <div key={edu.id} className="flex justify-between items-start">
                        <div>
                          <div className="font-bold text-[1.11em]">{edu.institution}</div>
                          <div className="italic">{edu.degree} {edu.field ? `in ${edu.field}` : ''}</div>
                          {edu.gpa && <div className="text-[0.95em] mt-0.5 text-gray-700">GPA: {edu.gpa}</div>}
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-[1.00em]">{edu.startDate} – {edu.endDate || 'Present'}</div>

                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              ) : null;

            case 'skills':
              return skills.length > 0 ? (
                <section key="skills" className="resume-section">
                  <h2 className="text-[1.16em] font-bold text-black uppercase border-b-2 border-black mb-2 pb-0.5">Skills</h2>
                  {Array.isArray(skills) && typeof skills[0] === 'string' ? (
                    <p className="leading-snug">{(skills as string[]).join(', ')}</p>
                  ) : (
                    <div className="space-y-1">
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

            default:
              return null;
          }
        })}
      </div>
    </div>
  );
}
