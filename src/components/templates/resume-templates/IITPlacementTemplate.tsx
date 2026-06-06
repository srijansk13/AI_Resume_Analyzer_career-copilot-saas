import React from 'react';
import { EditorState } from '@/models/EditorState';

interface TemplateProps {
  editorState: EditorState;
}

export default function IITPlacementTemplate({ editorState }: TemplateProps) {
  const { content, visibleSections, sectionOrder, theme } = editorState;
  const { personalInfo, summary, experience, education, projects, skills, certifications, achievements = [], awards = [], publications = [], leadership = [] } = content;

  return (
    <div className="resume-print-root p-10 print:p-14 font-sans text-black text-[1.00em] print:text-[0.89em] leading-tight bg-white border border-gray-300">
      {/* HEADER - Classic IIT Placement Style Centered */}
      <header className="text-center mb-5 border-b-2 border-black pb-3">
        <h1 className="text-[18pt] font-bold uppercase mb-1">{personalInfo.fullName}</h1>
        {education.length > 0 && <div className="text-[1.16em] font-semibold mb-1">{education[0].institution}</div>}
        {education.length > 0 && <div className="text-[1.05em] mb-2">{education[0].degree} {education[0].field ? `in ${education[0].field}` : ''}</div>}
        
        <div className="flex flex-wrap justify-center items-center gap-x-2 text-[0.95em]">
          {personalInfo.contact.email && <span>Email: {personalInfo.contact.email}</span>}
          {personalInfo.contact.email && personalInfo.contact.phone && <span>|</span>}
          {personalInfo.contact.phone && <span>Ph: {personalInfo.contact.phone}</span>}
          {personalInfo.contact.github && <span>| GitHub: {personalInfo.contact.github.split('/').pop()}</span>}
          {personalInfo.contact.linkedin && <span>| LinkedIn: {personalInfo.contact.linkedin.split('/').pop()}</span>}
        </div>
      </header>

      {/* DYNAMIC SECTIONS */}
      <div className="space-y-3">
        {sectionOrder.map((sectionKey) => {
          if (!visibleSections[sectionKey as keyof typeof visibleSections]) return null;

          switch (sectionKey) {
            case 'education':
              return education.length > 0 ? (
                <section key="education" className="resume-section">
                  <h2 className="text-[1.16em] font-bold uppercase bg-gray-200 px-2 py-1 mb-2">Education</h2>
                  <table className="w-full text-[0.95em] border-collapse border border-gray-400">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border border-gray-400 px-2 py-1 text-left">Program</th>
                        <th className="border border-gray-400 px-2 py-1 text-left">Institution</th>
                        <th className="border border-gray-400 px-2 py-1 text-center">% / CGPA</th>
                        <th className="border border-gray-400 px-2 py-1 text-center">Year</th>
                      </tr>
                    </thead>
                    <tbody>
                      {education.map((edu) => (
                        <tr key={edu.id}>
                          <td className="border border-gray-400 px-2 py-1">{edu.degree} {edu.field ? `in ${edu.field}` : ''}</td>
                          <td className="border border-gray-400 px-2 py-1">{edu.institution}</td>
                          <td className="border border-gray-400 px-2 py-1 text-center">{edu.gpa || '-'}</td>
                          <td className="border border-gray-400 px-2 py-1 text-center">{edu.endDate || 'Present'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </section>
              ) : null;

            case 'skills':
              return skills.length > 0 ? (
                <section key="skills" className="resume-section">
                  <h2 className="text-[1.16em] font-bold uppercase bg-gray-200 px-2 py-1 mb-2">Scholastic & Technical Achievements</h2>
                  <div className="px-2">
                    {Array.isArray(skills) && typeof skills[0] === 'string' ? (
                      <p className="leading-snug">{(skills as string[]).join(', ')}</p>
                    ) : (
                      <div className="space-y-1 text-[1.00em]">
                        {(skills as any[]).map((cat, idx) => (
                          <div key={idx} className="flex">
                            <span className="font-bold w-40 shrink-0">&#8226; {cat.category}:</span>
                            <span>{cat.skills.join(', ')}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </section>
              ) : null;

            case 'experience':
              return experience.length > 0 ? (
                <section key="experience" className="resume-section">
                  <h2 className="text-[1.16em] font-bold uppercase bg-gray-200 px-2 py-1 mb-2">Work Experience</h2>
                  <div className="px-2 space-y-3">
                    {experience.map((exp) => (
                      <div key={exp.id}>
                        <div className="flex justify-between items-baseline">
                          <span className="font-bold">{exp.company}</span>
                          <span className="font-semibold text-[0.95em]">{exp.startDate} – {exp.endDate || 'Present'}</span>
                        </div>
                        <div className="italic text-[1.00em] mb-1">{exp.role}</div>
                        <ul className="list-disc pl-5 space-y-0.5 text-[1.00em]">
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
                  <h2 className="text-[1.16em] font-bold uppercase bg-gray-200 px-2 py-1 mb-2">Academic Projects</h2>
                  <div className="px-2 space-y-3">
                    {projects.map((proj) => (
                      <div key={proj.id}>
                        <div className="flex justify-between items-baseline mb-0.5">
                          <div>
                            <span className="font-bold">{proj.name}</span>
                            {proj.technologies && proj.technologies.length > 0 && (
                              <span className="italic text-[0.95em]"> | {proj.technologies.join(', ')}</span>
                            )}
                          </div>
                          <span className="text-[0.95em]"></span>
                        </div>
                        <ul className="list-disc pl-5 space-y-0.5 text-[1.00em]">
                          {proj.bullets.map((bullet, idx) => (
                            <li key={idx} className="pl-1 text-justify">{bullet}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </section>
              ) : null;

            case 'leadership':
              return leadership.length > 0 ? (
                <section key="leadership" className="resume-section">
                  <h2 className="text-[1.16em] font-bold uppercase bg-gray-200 px-2 py-1 mb-2">Positions of Responsibility</h2>
                  <div className="px-2 space-y-2 text-[1.00em]">
                    {leadership.map((lead) => (
                      <div key={lead.id} className="flex">
                        <span className="shrink-0 mr-2">&#8226;</span>
                        <div>
                          <span className="font-bold">{lead.role}</span>, {lead.organization} 
                          <span className="text-gray-600 ml-2">({lead.startDate} – {lead.endDate || 'Present'})</span>
                          <ul className="list-disc pl-4 space-y-0.5 mt-0.5">
                            {lead.bullets?.map((bullet, idx) => (
                              <li key={idx}>{bullet}</li>
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
