import React from 'react';
import { EditorState } from '@/models/EditorState';

interface TemplateProps {
  editorState: EditorState;
}

export default function ModernCVTemplate({ editorState }: TemplateProps) {
  const { content, visibleSections, sectionOrder, theme } = editorState;
  const { personalInfo, summary, experience, education, projects, skills, certifications, awards = [], publications = [] } = content;

  return (
    <div className="resume-print-root p-10 font-sans text-gray-700 text-[1.05em] leading-relaxed bg-white">
      {/* HEADER */}
      <header className="mb-10 flex items-end justify-between">
        <div className="w-[60%]">
          <h1 className="text-3xl font-light text-gray-900 tracking-tight mb-2">
            {personalInfo.fullName.split(' ').map((n, i, arr) => i === arr.length - 1 ? <span key={i} className="font-bold text-[#3498db]">{n}</span> : <span key={i}>{n} </span>)}
          </h1>
          {personalInfo.title && <div className="text-xl text-gray-500 font-light">{personalInfo.title}</div>}
        </div>
        <div className="w-[40%] text-right text-[0.89em] space-y-0.5 text-gray-500">
          {personalInfo.contact.email && <div>{personalInfo.contact.email}</div>}
          {personalInfo.contact.phone && <div>{personalInfo.contact.phone}</div>}
          {personalInfo.contact.location && <div>{personalInfo.contact.location}</div>}
          {personalInfo.contact.linkedin && <div>{personalInfo.contact.linkedin.replace(/^https?:\/\//, '')}</div>}
        </div>
      </header>

      <div className="space-y-6">
        {sectionOrder.map((sectionKey) => {
          if (!visibleSections[sectionKey as keyof typeof visibleSections]) return null;

          switch (sectionKey) {
            case 'summary':
              return summary ? (
                <section key="summary" className="resume-section flex gap-6">
                  <div className="w-1/4 shrink-0 text-right pt-0.5">
                    <h2 className="text-[#3498db] font-medium tracking-wide uppercase text-[1.05em]">Profile</h2>
                  </div>
                  <div className="flex-1 text-gray-600 text-justify">
                    {summary}
                  </div>
                </section>
              ) : null;

            case 'experience':
              return experience.length > 0 ? (
                <section key="experience" className="resume-section flex gap-6">
                  <div className="w-1/4 shrink-0 text-right pt-0.5">
                    <h2 className="text-[#3498db] font-medium tracking-wide uppercase text-[1.05em]">Experience</h2>
                  </div>
                  <div className="flex-1 space-y-4">
                    {experience.map((exp) => (
                      <div key={exp.id}>
                        <div className="flex gap-4 items-baseline mb-1">
                          <span className="w-24 shrink-0 text-[0.89em] text-gray-500">{exp.startDate} - {exp.endDate || 'Present'}</span>
                          <div>
                            <span className="font-bold text-gray-800">{exp.role}</span>
                            <span className="text-gray-500 italic">, {exp.company}</span>
                          </div>
                        </div>
                        <div className="ml-[112px]">
                          <ul className="list-none space-y-1 text-gray-600">
                            {exp.bullets.map((bullet, idx) => (
                              <li key={idx} className="relative before:content-['•'] before:absolute before:-left-4 before:text-[#3498db]">{bullet}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              ) : null;

            case 'education':
              return education.length > 0 ? (
                <section key="education" className="resume-section flex gap-6">
                  <div className="w-1/4 shrink-0 text-right pt-0.5">
                    <h2 className="text-[#3498db] font-medium tracking-wide uppercase text-[1.05em]">Education</h2>
                  </div>
                  <div className="flex-1 space-y-3">
                    {education.map((edu) => (
                      <div key={edu.id} className="flex gap-4 items-baseline">
                        <span className="w-24 shrink-0 text-[0.89em] text-gray-500">{edu.startDate} - {edu.endDate || 'Present'}</span>
                        <div>
                          <div className="font-bold text-gray-800">{edu.degree} {edu.field ? `in ${edu.field}` : ''}</div>
                          <div className="text-gray-500 italic">{edu.institution} {edu.gpa && <span className="font-normal">— GPA: {edu.gpa}</span>}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              ) : null;

            case 'skills':
              return skills.length > 0 ? (
                <section key="skills" className="resume-section flex gap-6">
                  <div className="w-1/4 shrink-0 text-right pt-0.5">
                    <h2 className="text-[#3498db] font-medium tracking-wide uppercase text-[1.05em]">Skills</h2>
                  </div>
                  <div className="flex-1">
                    {Array.isArray(skills) && typeof skills[0] === 'string' ? (
                      <p className="text-gray-600">{(skills as string[]).join(' • ')}</p>
                    ) : (
                      <div className="space-y-1.5">
                        {(skills as any[]).map((cat, idx) => (
                          <div key={idx} className="flex gap-4 items-baseline">
                            <span className="w-24 shrink-0 text-[0.89em] text-gray-500 text-right">{cat.category}</span>
                            <span className="text-gray-800 font-medium">{cat.skills.join(' • ')}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </section>
              ) : null;

            case 'projects':
              return projects.length > 0 ? (
                <section key="projects" className="resume-section flex gap-6">
                  <div className="w-1/4 shrink-0 text-right pt-0.5">
                    <h2 className="text-[#3498db] font-medium tracking-wide uppercase text-[1.05em]">Projects</h2>
                  </div>
                  <div className="flex-1 space-y-4">
                    {projects.map((proj) => (
                      <div key={proj.id}>
                        <div className="flex gap-4 items-baseline mb-1">
                          <span className="w-24 shrink-0 text-[0.89em] text-gray-500"> </span>
                          <div>
                            <span className="font-bold text-gray-800">{proj.name}</span>
                            {proj.technologies && proj.technologies.length > 0 && <span className="text-gray-500 italic"> — {proj.technologies.join(', ')}</span>}
                          </div>
                        </div>
                        <div className="ml-[112px]">
                          <ul className="list-none space-y-1 text-gray-600">
                            {proj.bullets.map((bullet, idx) => (
                              <li key={idx} className="relative before:content-['•'] before:absolute before:-left-4 before:text-[#3498db]">{bullet}</li>
                            ))}
                          </ul>
                        </div>
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
