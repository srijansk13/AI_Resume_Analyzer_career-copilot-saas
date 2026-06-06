import React from 'react';
import { EditorState } from '@/models/EditorState';

interface TemplateProps {
  editorState: EditorState;
}

export default function DeedyResumeTemplate({ editorState }: TemplateProps) {
  const { content, visibleSections, sectionOrder, theme } = editorState;
  const { personalInfo, summary, experience, education, projects, skills, certifications, awards = [], publications = [] } = content;

  return (
    <div className="resume-print-root p-10 print:p-14 font-sans text-[#333] text-[0.95em] print:text-[0.89em] leading-snug bg-white w-full" style={{ fontFamily: '"Lato", "Helvetica Neue", Helvetica, Arial, sans-serif', minHeight: '297mm' }}>
      {/* HEADER */}
      <header className="mb-6">
        <h1 className="text-[22pt] font-light text-[#333] uppercase tracking-wide leading-none mb-1">
          {personalInfo.fullName.split(' ').map((n, i) => i === 0 ? <span key={i} className="font-semibold">{n} </span> : <span key={i}>{n} </span>)}
        </h1>
        <div className="text-[1.05em] text-[#666]">
          {summary}
        </div>
      </header>

      <div className="flex gap-8">
        {/* LEFT COLUMN */}
        <div className="w-[35%] space-y-4">
          <section className="resume-section">
            <h2 className="text-[1.26em] font-semibold text-[#333] uppercase tracking-widest border-b border-[#333] mb-2 pb-0.5">Links</h2>
            <div className="space-y-0.5 text-[0.89em]">
              {personalInfo.contact.github && <div><a href={personalInfo.contact.github} className="text-[#0055aa] hover:underline">github.com/{personalInfo.contact.github.split('/').pop()}</a></div>}
              {personalInfo.contact.linkedin && <div><a href={personalInfo.contact.linkedin} className="text-[#0055aa] hover:underline">linkedin.com/in/{personalInfo.contact.linkedin.split('/').pop()}</a></div>}
              {personalInfo.contact.email && <div>{personalInfo.contact.email}</div>}
              {personalInfo.contact.phone && <div>{personalInfo.contact.phone}</div>}
            </div>
          </section>

          {visibleSections.education && education.length > 0 && (
            <section className="resume-section">
              <h2 className="text-[1.26em] font-semibold text-[#333] uppercase tracking-widest border-b border-[#333] mb-2 pb-0.5">Education</h2>
              <div className="space-y-3">
                {education.map((edu) => (
                  <div key={edu.id} data-section-item="true">
                    <div className="font-semibold text-[#333] text-[1.05em]">{edu.institution}</div>
                    <div className="italic text-[#666]">{edu.degree} {edu.field ? `in ${edu.field}` : ''}</div>
                    <div className="text-[0.89em] text-[#888]">{edu.startDate} – {edu.endDate || 'Present'}</div>
                    
                    {edu.gpa && <div className="text-[0.89em] font-semibold mt-0.5">GPA: {edu.gpa}</div>}
                  </div>
                ))}
              </div>
            </section>
          )}

          {visibleSections.skills && skills.length > 0 && (
            <section className="resume-section">
              <h2 className="text-[1.26em] font-semibold text-[#333] uppercase tracking-widest border-b border-[#333] mb-2 pb-0.5">Skills</h2>
              {Array.isArray(skills) && typeof skills[0] === 'string' ? (
                <p className="text-[0.89em] leading-snug">{(skills as string[]).join(', ')}</p>
              ) : (
                <div className="space-y-1.5">
                  {(skills as any[]).map((cat, idx) => (
                    <div key={idx}>
                      <div className="font-semibold text-[#333]">{cat.category}</div>
                      <div className="text-[0.89em] text-[#666] leading-snug">{cat.skills.join(' • ')}</div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {visibleSections.certifications && certifications && certifications.length > 0 && (
            <section className="resume-section">
              <h2 className="text-[1.26em] font-semibold text-[#333] uppercase tracking-widest border-b border-[#333] mb-2 pb-0.5">Certifications</h2>
              <div className="space-y-2">
                {certifications.map((cert) => (
                  <div key={cert.id}>
                    <div className="font-semibold text-[#333] text-[0.89em]">{cert.name}</div>
                    <div className="text-[#888] text-[0.84em]">{cert.issuer} • {cert.date}</div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* RIGHT COLUMN */}
        <div className="w-[65%] space-y-4">
          {visibleSections.experience && experience.length > 0 && (
            <section className="resume-section">
              <h2 className="text-[1.26em] font-semibold text-[#333] uppercase tracking-widest border-b border-[#333] mb-2 pb-0.5">Experience</h2>
              <div className="space-y-4">
                {experience.map((exp) => (
                  <div key={exp.id} data-section-item="true">
                    <div className="flex justify-between items-baseline mb-0.5">
                      <span className="font-semibold text-[#333] text-[1.11em]">{exp.company}</span>
                      <span className="text-[0.89em] text-[#888]">{exp.startDate} – {exp.endDate || 'Present'}</span>
                    </div>
                    <div className="flex justify-between items-baseline mb-1">
                      <span className="italic text-[#666] text-[1.00em]">{exp.role}</span>
                      <span className="text-[0.89em] text-[#888]">{exp.location}</span>
                    </div>
                    <ul className="list-disc pl-4 space-y-0.5 text-[0.89em] text-[#444]">
                      {exp.bullets.map((bullet, idx) => (
                        <li key={idx} className="pl-1 leading-snug">{bullet}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>
          )}

          {visibleSections.projects && projects.length > 0 && (
            <section className="resume-section">
              <h2 className="text-[1.26em] font-semibold text-[#333] uppercase tracking-widest border-b border-[#333] mb-2 pb-0.5">Projects</h2>
              <div className="space-y-4">
                {projects.map((proj) => (
                  <div key={proj.id} data-section-item="true">
                    <div className="flex justify-between items-baseline mb-0.5">
                      <div>
                        <span className="font-semibold text-[#333] text-[1.11em]">{proj.name}</span>
                        {proj.technologies && proj.technologies.length > 0 && (
                          <span className="text-[0.89em] italic text-[#666]"> | {proj.technologies.join(', ')}</span>
                        )}
                      </div>
                      <span className="text-[0.89em] text-[#888]"></span>
                    </div>
                    <ul className="list-disc pl-4 space-y-0.5 text-[0.89em] text-[#444]">
                      {proj.bullets.map((bullet, idx) => (
                        <li key={idx} className="pl-1 leading-snug">{bullet}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>
          )}

          {visibleSections.publications && publications && publications.length > 0 && (
            <section className="resume-section">
              <h2 className="text-[1.26em] font-semibold text-[#333] uppercase tracking-widest border-b border-[#333] mb-2 pb-0.5">Publications</h2>
              <div className="space-y-2">
                {publications.map((pub) => (
                  <div key={pub.id}>
                    <div className="flex justify-between items-baseline">
                      <span className="font-semibold text-[#333] text-[1.00em]">{pub.title}</span>
                      <span className="text-[0.89em] text-[#888]">{pub.date}</span>
                    </div>
                    <div className="italic text-[#666] text-[0.89em]">{pub.publisher}</div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
