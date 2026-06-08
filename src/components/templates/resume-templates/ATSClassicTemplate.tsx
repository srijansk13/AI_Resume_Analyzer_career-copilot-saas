import React from 'react';
import { EditorState } from '@/models/EditorState';
import { FormattedLinks, ContactLinks, getNormalizedProjectLinks } from "@/utils/linkFormatter";

interface TemplateProps {
  editorState: EditorState;
}

export default function ATSClassicTemplate({ editorState }: TemplateProps) {
  const { content, visibleSections, sectionOrder, theme } = editorState;
  const { personalInfo, summary, experience, education, projects, skills, certifications, achievements = [], awards = [], publications = [], leadership = [] } = content;

  return (
    <div className="p-12 font-serif text-black text-[10.5pt] leading-normal bg-white min-h-[297mm]">
      {/* HEADER */}
      <header className="text-center mb-6">
        <h1 className="text-4xl font-bold tracking-normal uppercase text-gray-900 mb-1.5">
          {personalInfo.fullName}
        </h1>
        <div className="flex flex-wrap justify-center items-center gap-x-2 gap-y-1 text-sm text-gray-700 font-sans">
          {personalInfo.contact.email && <span>{personalInfo.contact.email}</span>}
          {personalInfo.contact.phone && (
            <>
              <span className="text-gray-400">|</span>
              <span>{personalInfo.contact.phone}</span>
            </>
          )}
          {personalInfo.contact.location && (
            <>
              <span className="text-gray-400">|</span>
              <span>{personalInfo.contact.location}</span>
            </>
          )}
          {personalInfo.contact.linkedin && (
            <>
              <span className="text-gray-400">|</span>
              <a href={personalInfo.contact.linkedin} className="hover:underline">
                LinkedIn
              </a>
            </>
          )}
          {personalInfo.contact.github && (
            <>
              <span className="text-gray-400">|</span>
              <a href={personalInfo.contact.github} className="hover:underline">
                GitHub
              </a>
            </>
          )}
          {personalInfo.contact.website && (
            <>
              <span className="text-gray-400">|</span>
              <a href={personalInfo.contact.website} className="hover:underline">
                Portfolio
              </a>
            </>
          )}
        </div>
      </header>

      {/* DYNAMIC SECTIONS */}
      <div className="space-y-5">
        {sectionOrder.map((sectionKey) => {
          if (!visibleSections[sectionKey as keyof typeof visibleSections]) return null;

          switch (sectionKey) {
            case 'summary':
              return summary ? (
                <section key="summary" data-section-id="summary" data-section-title="Professional Summary">

                  <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide border-b border-black mb-2 pb-0.5">
                    Professional Summary
                  </h2>
                  <p className="text-justify font-serif text-gray-800 text-[10pt] leading-relaxed">
                    {summary}
                  </p>
                </section>
              ) : null;

            case 'experience':
              return experience.length > 0 ? (
                <section key="experience">
                  <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide border-b border-black mb-2.5 pb-0.5">
                    Work Experience
                  </h2>
                  <div className="space-y-3.5">
                    {experience.map((exp) => (
                      <div key={exp.id}>
                        <div className="flex justify-between items-baseline mb-0.5">
                          <span className="font-bold text-gray-900 text-sm">{exp.role}</span>
                          <span className="text-sm text-gray-800 font-semibold font-sans">
                            {exp.startDate} {exp.endDate ? `– ${exp.endDate}` : ''}
                          </span>
                        </div>
                        <div className="flex justify-between items-baseline mb-1">
                          <span className="text-gray-800 font-semibold italic text-[10pt]">{exp.company}</span>
                          {exp.location && <span className="text-sm text-gray-700 italic font-sans">{exp.location}</span>}
                        </div>
                        <ul className="list-disc pl-5 space-y-1">
                          {exp.bullets.map((bullet, idx) => (
                            <li key={idx} className="pl-1 text-gray-800 text-[10pt] text-justify leading-relaxed">
                              {bullet}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </section>
              ) : null;

            case 'projects':
              return projects.length > 0 ? (
                <section key="projects">
                  <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide border-b border-black mb-2.5 pb-0.5">
                    Projects
                  </h2>
                  <div className="space-y-3">
                    {projects.map((proj) => (
                      <div key={proj.id}>
                        <div className="flex justify-between items-baseline mb-0.5">
                          <span className="font-bold text-gray-900 text-sm">
                            {proj.name}
                            {getNormalizedProjectLinks(proj) && (
                              <span style={{ fontWeight: 400, marginLeft: '8px' }}>
                                <FormattedLinks text={getNormalizedProjectLinks(proj)} context="project" separator=" | " linkColor="#1d4ed8" style={{ fontSize: '0.75rem' }} />
                              </span>
                            )}
                          </span>
                          {proj.technologies && proj.technologies.length > 0 && (
                            <span className="text-xs text-gray-700 italic font-sans">
                              {proj.technologies.join(', ')}
                            </span>
                          )}
                        </div>
                        {proj.description && <p className="text-gray-800 text-[10pt] mb-1">{proj.description}</p>}
                        <ul className="list-disc pl-5 space-y-1">
                          {proj.bullets.map((bullet, idx) => (
                            <li key={idx} className="pl-1 text-gray-800 text-[10pt] text-justify leading-relaxed">
                              {bullet}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </section>
              ) : null;

            case 'education':
              return education.length > 0 ? (
                <section key="education">
                  <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide border-b border-black mb-2.5 pb-0.5">
                    Education
                  </h2>
                  <div className="space-y-2">
                    {education.map((edu) => (
                      <div key={edu.id} className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center">
                            <span className="font-bold text-gray-900 text-sm">{edu.institution}</span>
                            {edu.gpa && <span className="text-sm text-gray-700 ml-2 font-sans">(GPA: {edu.gpa})</span>}
                          </div>
                          <p className="text-gray-800 text-[10pt]">
                            {edu.degree} {edu.field ? `in ${edu.field}` : ''}
                          </p>
                        </div>
                        <span className="text-sm text-gray-800 font-semibold whitespace-nowrap font-sans">
                          {edu.startDate} {edu.endDate ? `– ${edu.endDate}` : ''}
                        </span>
                      </div>
                    ))}
                  </div>
                </section>
              ) : null;

            case 'skills':
              return skills.length > 0 ? (
                <section key="skills">
                  <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide border-b border-black mb-2 pb-0.5">
                    Skills
                  </h2>
                  {Array.isArray(skills) && typeof skills[0] === 'string' ? (
                    <p className="text-gray-800 text-[10pt] leading-relaxed">
                      {(skills as string[]).join(', ')}
                    </p>
                  ) : (
                    <div className="space-y-1 text-[10pt]">
                      {(skills as any[]).map((cat, idx) => (
                        <div key={idx} className="flex items-start">
                          <span className="font-bold text-gray-900 mr-2 shrink-0">{cat.category}:</span>
                          <span className="text-gray-800">{cat.skills.join(', ')}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              ) : null;

            case 'certifications':
              return certifications && certifications.length > 0 ? (
                <section key="certifications">
                  <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide border-b border-black mb-2 pb-0.5">
                    Certifications
                  </h2>
                  <div className="space-y-1.5 text-[10pt]">
                    {certifications.map((cert) => (
                      <div key={cert.id} className="flex justify-between items-baseline">
                        <div>
                          <span className="font-bold text-gray-900">{cert.name}</span>
                          <span className="text-gray-700 italic ml-1">— {cert.issuer}</span>
                        </div>
                        <span className="text-sm text-gray-800 font-semibold font-sans">{cert.date}</span>
                      </div>
                    ))}
                  </div>
                </section>
              ) : null;

            
            

      
      case 'achievements':
        return visibleSections.achievements !== false && achievements.length > 0 ? (
          <section key="achievements" data-section-id="achievements" data-section-title="Achievements & Awards" data-breakable="true">
            <h3 style={{}}>Achievements & Awards</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }} data-section-list="true">
              {achievements.map((ach) => (
                <div key={ach.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }} data-section-item="true">
                  <div style={{ fontSize: '9.5pt', color: theme.textColor || '#334155' }}>
                    <span style={{ fontWeight: 'bold', color: theme.primaryColor || '#0f172a' }}>{ach.title}</span>
                    {ach.description && <span style={{ color: theme.textColor || '#475569', marginLeft: '6px', fontWeight: 'normal' }}>— {ach.description}</span>}
                  </div>
                  {ach.date && <span style={{ marginLeft: 'auto', fontSize: '8.5pt', color: '#64748b', fontWeight: 'normal' }}>{ach.date}</span>}
                </div>
              ))}
            </div>
          </section>
        ) : null;

      case 'awards':
        return visibleSections.awards !== false && awards.length > 0 ? (
          <section key="awards" data-section-id="awards" data-section-title="Awards & Honors" data-breakable="true">
            <h3 style={{}}>Awards & Honors</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }} data-section-list="true">
              {awards.map((award) => (
                <div key={award.id} style={{ display: 'flex', flexDirection: 'column' }} data-section-item="true">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 'bold', fontSize: '10pt', color: theme.primaryColor || '#0f172a' }}>{award.title}</span>
                    {award.date && <span style={{ marginLeft: 'auto', fontSize: '8.5pt', color: '#64748b', fontWeight: 'normal' }}>{award.date}</span>}
                  </div>
                  <div style={{ fontSize: '9pt', color: theme.textColor || '#475569', fontStyle: 'italic', fontWeight: 'normal' }}>
                    {award.issuer}
                  </div>
                  {award.description && <p style={{ color: theme.textColor || '#475569', fontSize: '9.5pt', marginTop: '2px', fontWeight: 'normal' }}>{award.description}</p>}
                </div>
              ))}
            </div>
          </section>
        ) : null;

      case 'publications':
        return visibleSections.publications !== false && publications.length > 0 ? (
          <section key="publications" data-section-id="publications" data-section-title="Publications" data-breakable="true">
            <h3 style={{}}>Publications</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }} data-section-list="true">
              {publications.map((pub) => (
                <div key={pub.id} style={{ display: 'flex', flexDirection: 'column' }} data-section-item="true">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 'bold', fontSize: '10pt', color: theme.primaryColor || '#0f172a' }}>
                      {pub.title}
                      {pub.link && (
                        <a href={pub.link} target="_blank" rel="noreferrer" style={{ color: theme.accentColor || '#3b82f6', textDecoration: 'none', fontWeight: 'normal', fontSize: '8.5pt', marginLeft: '8px' }}>
                          🔗 link
                        </a>
                      )}
                    </span>
                    {pub.date && <span style={{ marginLeft: 'auto', fontSize: '8.5pt', color: '#64748b', fontWeight: 'normal' }}>{pub.date}</span>}
                  </div>
                  <div style={{ fontSize: '9pt', color: theme.textColor || '#475569', fontStyle: 'italic', fontWeight: 'normal' }}>
                    {pub.publisher}
                  </div>
                  {pub.description && <p style={{ color: theme.textColor || '#475569', fontSize: '9.5pt', marginTop: '2px', fontWeight: 'normal' }}>{pub.description}</p>}
                </div>
              ))}
            </div>
          </section>
        ) : null;

      case 'leadership':
        return visibleSections.leadership !== false && leadership.length > 0 ? (
          <section key="leadership" data-section-id="leadership" data-section-title="Leadership & Activities" data-breakable="true">
            <h3 style={{}}>Leadership & Activities</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }} data-section-list="true">
              {leadership.map((lead) => (
                <div key={lead.id} data-section-item="true">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 'bold', fontSize: '10pt', color: theme.primaryColor || '#0f172a' }}>{lead.role}</span>
                    <span style={{ fontSize: '8.5pt', color: '#64748b', marginLeft: 'auto', fontWeight: 'normal' }}>
                      {lead.startDate} {lead.endDate ? "– " + lead.endDate : ''}
                    </span>
                  </div>
                  <div style={{ fontSize: '9pt', color: theme.textColor || '#475569', fontStyle: 'italic', marginBottom: '4px', fontWeight: 'normal' }}>
                    {lead.organization}
                  </div>
                  {lead.description && <p style={{ color: theme.textColor || '#475569', fontSize: '9.5pt', marginTop: '2px', marginBottom: '4px', fontWeight: 'normal' }}>{lead.description}</p>}
                  {lead.bullets && lead.bullets.length > 0 && (
                    <ul style={{ listStyleType: 'circle', paddingLeft: '20px', margin: '0', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                      {lead.bullets.map((bullet, idx) => (
                        <li key={idx} style={{ color: theme.textColor || '#334155', fontWeight: 'normal', fontSize: '9.5pt' }}>{bullet}</li>
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
