import React from 'react';
import { EditorState } from '@/models/EditorState';

interface TemplateProps {
  editorState: EditorState;
}

export default function AcademicCVTemplate({ editorState }: TemplateProps) {
  const { content, visibleSections, sectionOrder, theme } = editorState;
  const { personalInfo, summary, experience, education, projects, skills, certifications, awards = [], publications = [], leadership = [] } = content;

  return (
    <div className="resume-print-root p-12 font-serif text-[#222] text-[1.05em] leading-normal bg-white" style={{ fontFamily: '"Garamond", "Times New Roman", serif' }}>
      {/* HEADER */}
      <header className="mb-8 text-center border-b-2 border-black pb-4">
        <h1 className="text-[22pt] font-normal tracking-wide uppercase mb-2">{personalInfo.fullName}</h1>
        <div className="text-[1.05em] italic mb-1">{personalInfo.title}</div>
        <div className="text-[0.95em] flex justify-center gap-3">
          {personalInfo.contact.email && <span>{personalInfo.contact.email}</span>}
          {personalInfo.contact.phone && <span>{personalInfo.contact.phone}</span>}
          {personalInfo.contact.location && <span>{personalInfo.contact.location}</span>}
          {personalInfo.contact.linkedin && <span>{personalInfo.contact.linkedin.replace(/^https?:\/\//, '')}</span>}
        </div>
      </header>

      <div className="space-y-6">
        {/* ENFORCE ACADEMIC ORDER: Education first */}
        {visibleSections.education && education.length > 0 && (
          <section className="resume-section">
            <h2 className="text-[1.26em] font-semibold uppercase tracking-widest text-center mb-4">Education</h2>
            <div className="space-y-4">
              {education.map((edu) => (
                <div key={edu.id} className="flex">
                  <div className="w-[18%] text-[1.00em] font-medium pt-0.5">{edu.startDate} – {edu.endDate || 'Present'}</div>
                  <div className="w-[82%]">
                    <div className="font-bold text-[1.11em]">{edu.degree} {edu.field ? `in ${edu.field}` : ''}</div>
                    <div className="italic">{edu.institution}</div>
                    {edu.gpa && <div className="text-[0.95em] mt-1">Cumulative GPA: {edu.gpa}</div>}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {visibleSections.publications && publications && publications.length > 0 && (
          <section className="resume-section">
            <h2 className="text-[1.26em] font-semibold uppercase tracking-widest text-center mb-4">Publications & Presentations</h2>
            <div className="space-y-3">
              {publications.map((pub, i) => (
                <div key={pub.id} className="flex">
                  <div className="w-[18%] text-[1.00em] font-medium pt-0.5">{pub.date}</div>
                  <div className="w-[82%]">
                    <span className="font-bold">"{pub.title}"</span>. <span className="italic">{pub.publisher}</span>.
                    {pub.description && <p className="text-[0.95em] mt-0.5">{pub.description}</p>}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {visibleSections.experience && experience.length > 0 && (
          <section className="resume-section">
            <h2 className="text-[1.26em] font-semibold uppercase tracking-widest text-center mb-4">Academic & Professional Experience</h2>
            <div className="space-y-5">
              {experience.map((exp) => (
                <div key={exp.id} className="flex">
                  <div className="w-[18%] text-[1.00em] font-medium pt-0.5">{exp.startDate} – {exp.endDate || 'Present'}</div>
                  <div className="w-[82%]">
                    <div className="font-bold text-[1.11em]">{exp.role}</div>
                    <div className="italic">{exp.company}, {exp.location}</div>
                    <ul className="list-disc pl-5 space-y-1 mt-2 text-[1.00em]">
                      {exp.bullets.map((bullet, idx) => (
                        <li key={idx} className="pl-1 text-justify">{bullet}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {visibleSections.awards && awards && awards.length > 0 && (
          <section className="resume-section">
            <h2 className="text-[1.26em] font-semibold uppercase tracking-widest text-center mb-4">Honors & Awards</h2>
            <div className="space-y-3">
              {awards.map((award) => (
                <div key={award.id} className="flex">
                  <div className="w-[18%] text-[1.00em] font-medium pt-0.5">{award.date}</div>
                  <div className="w-[82%]">
                    <span className="font-bold">{award.title}</span>, <span className="italic">{award.issuer}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {visibleSections.skills && skills.length > 0 && (
          <section className="resume-section">
            <h2 className="text-[1.26em] font-semibold uppercase tracking-widest text-center mb-4">Technical Skills</h2>
            <div className="flex">
              <div className="w-[18%]" />
              <div className="w-[82%]">
                {Array.isArray(skills) && typeof skills[0] === 'string' ? (
                  <p>{(skills as string[]).join(', ')}</p>
                ) : (
                  <div className="space-y-1">
                    {(skills as any[]).map((cat, idx) => (
                      <div key={idx} className="flex">
                        <span className="font-bold w-36 shrink-0">{cat.category}:</span>
                        <span>{cat.skills.join(', ')}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
