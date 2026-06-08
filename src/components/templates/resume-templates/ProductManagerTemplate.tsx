import React from 'react';
import { EditorState } from '@/models/EditorState';
import { ContactLinks, ProjectLinks } from "@/utils/linkFormatter";

interface TemplateProps {
  editorState: EditorState;
}

export default function ProductManagerTemplate({ editorState }: TemplateProps) {
  const { content, visibleSections, sectionOrder, theme } = editorState;
  const { personalInfo, summary, experience, education, projects, skills, certifications, achievements = [], awards = [], publications = [], leadership = [] } = content;

  const wrapperStyle = {
    fontFamily: theme.fontFamily || 'Outfit, Inter, sans-serif',
    fontSize: theme.fontSize || '9.5pt',
    color: '#334155',
    backgroundColor: '#ffffff',
    padding: theme.pageMargin || '32px',
    lineHeight: '1.45',
    minHeight: '297mm',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '16px',
  };

  const headerStyle = {
    borderLeft: `4px solid ${theme.primaryColor || '#4f46e5'}`,
    paddingLeft: '16px',
    marginBottom: '8px',
  };

  const nameStyle = {
    fontFamily: theme.headingFont || theme.fontFamily || 'Inter, sans-serif',
    fontSize: '24pt',
    fontWeight: 800,
    color: theme.primaryColor || '#0f172a',
    letterSpacing: '-0.025em',
  };

  const titleStyle = {
    fontSize: '11pt',
    fontWeight: 700,
    color: theme.accentColor || '#4f46e5',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
    marginTop: '2px',
  };

  const sectionTitleStyle = {
    fontFamily: theme.headingFont || theme.fontFamily || 'Inter, sans-serif',
    fontSize: '11.5pt',
    fontWeight: 800,
    color: theme.primaryColor || '#0f172a',
    borderBottom: '2px solid #f1f5f9',
    paddingBottom: '4px',
    marginBottom: '8px',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
  };

  // Helper to format bullets by highlighting key numbers/percentages/metrics
  const formatBullet = (bullet: string) => {
    const metricRegex = /(\b\d+%\b|\b\d+x\b|\$\b\d+M\b|\$\b\d+K\b|\b\d+\s+percent\b|\b\d+\s+times\b|\b\d+\s+billion\b|\b\d+\s+million\b|\b\d+\s+thousand\b)/gi;
    if (!metricRegex.test(bullet)) {
      return <span>{bullet}</span>;
    }
    const parts = bullet.split(metricRegex);
    return (
      <span>
        {parts.map((part, i) => {
          if (metricRegex.test(part)) {
            return (
              <strong key={i} style={{ color: theme.primaryColor || '#4f46e5', fontWeight: 700 }}>
                {part}
              </strong>
            );
          }
          return part;
        })}
      </span>
    );
  };

  return (
    <div style={wrapperStyle} className="w-full">
      {/* HEADER */}
      <header style={headerStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h1 style={nameStyle}>{personalInfo.fullName}</h1>
            {personalInfo.title && <h2 style={titleStyle}>{personalInfo.title}</h2>}
          </div>
          <div style={{ fontSize: '8.5pt', color: '#64748b', display: 'flex', flexDirection: 'column', gap: '1px' }}>
            {personalInfo.contact.email && <span>✉ {personalInfo.contact.email}</span>}
            {personalInfo.contact.phone && <span>☎ {personalInfo.contact.phone}</span>}
            {personalInfo.contact.location && <span>📍 {personalInfo.contact.location}</span>}
            {((personalInfo.contact.linkedin) || (personalInfo.contact.github) || (personalInfo.contact.website )) && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                <span>🔗</span>
                <ContactLinks contact={personalInfo.contact} separator={<span>•</span>} linkColor="#64748b" />
              </span>
            )}
          </div>
        </div>
      </header>

      {/* HIGHLIGHT STAT BLOCK */}
      <div style={{ display: 'flex', gap: '12px', width: '100%', marginBottom: '4px' }}>
        <div style={{ flex: 1, backgroundColor: '#f5f3ff', border: '1px solid #ddd6fe', borderRadius: '8px', padding: '10px', textAlign: 'center' }}>
          <div style={{ fontSize: '14pt', fontWeight: 800, color: '#6d28d9' }}>$10M+</div>
          <div style={{ fontSize: '7.5pt', color: '#6b21a8', fontWeight: 600, textTransform: 'uppercase' }}>Revenue Driven</div>
        </div>
        <div style={{ flex: 1, backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px', padding: '10px', textAlign: 'center' }}>
          <div style={{ fontSize: '14pt', fontWeight: 800, color: '#1d4ed8' }}>40%+</div>
          <div style={{ fontSize: '7.5pt', color: '#1e3a8a', fontWeight: 600, textTransform: 'uppercase' }}>Engagement Lift</div>
        </div>
        <div style={{ flex: 1, backgroundColor: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '8px', padding: '10px', textAlign: 'center' }}>
          <div style={{ fontSize: '14pt', fontWeight: 800, color: '#047857' }}>2x</div>
          <div style={{ fontSize: '7.5pt', color: '#064e3b', fontWeight: 600, textTransform: 'uppercase' }}>Velocity Increase</div>
        </div>
      </div>

      {/* DYNAMIC SECTIONS */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {sectionOrder.map((sectionKey) => {
          if (!visibleSections[sectionKey as keyof typeof visibleSections]) return null;

          switch (sectionKey) {
            case 'summary':
              return summary ? (
                <section key="summary" data-section-id="summary" data-section-title="Professional Summary">
                  <h3 style={sectionTitleStyle}>Executive Impact & Vision</h3>
                  <p style={{ textAlign: 'justify', margin: '0' }}>{summary}</p>
                </section>
              ) : null;

            case 'experience':
              return experience.length > 0 ? (
                <section key="experience" data-section-id="experience" data-section-title="Work Experience" data-breakable="true">
                  <h3 style={sectionTitleStyle}>Professional Experience</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }} data-section-list="true">
                    {experience.map((exp) => (
                      <div key={exp.id} data-section-item="true">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                          <span style={{ fontWeight: 800, fontSize: '10pt', color: '#0f172a' }}>{exp.role}</span>
                          <span style={{ fontSize: '8.5pt', color: '#64748b', fontWeight: 600 }}>
                            {exp.startDate} {exp.endDate ? `– ${exp.endDate}` : ''}
                          </span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', fontSize: '8.5pt', color: theme.accentColor || '#4f46e5', fontWeight: 600, marginBottom: '4px' }}>
                          <span>{exp.company}</span>
                          {exp.location && <span>{exp.location}</span>}
                        </div>
                        <ul style={{ listStyleType: 'disc', paddingLeft: '16px', margin: '0', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                          {exp.bullets.map((bullet, idx) => (
                            <li key={idx} style={{ fontSize: '9pt' }}>{formatBullet(bullet)}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </section>
              ) : null;

            case 'projects':
              return projects.length > 0 ? (
                <section key="projects" data-section-id="projects" data-section-title="Key Projects" data-breakable="true">
                  <h3 style={sectionTitleStyle}>Product Deliveries & Launches</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }} data-section-list="true">
                    {projects.map((proj) => (
                      <div key={proj.id} data-section-item="true">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '2px' }}>
                          <span style={{ fontWeight: 800, fontSize: '9.5pt', color: '#0f172a' }}>{proj.name}</span>
                          <ProjectLinks
                            project={proj}
                            separator=" | "
                            linkColor={theme.accentColor || '#3b82f6'}
                            style={{ fontSize: '8pt' }}
                          />
                          {proj.technologies && proj.technologies.length > 0 && (
                            <span style={{ fontSize: '8pt', color: theme.accentColor || '#4f46e5', fontWeight: 600 }}>
                              {proj.technologies.join(' • ')}
                            </span>
                          )}
                        </div>
                        {proj.description && <div style={{ fontSize: '8.5pt', color: '#64748b', fontStyle: 'italic', marginBottom: '4px' }}>{proj.description}</div>}
                        <ul style={{ listStyleType: 'circle', paddingLeft: '16px', margin: '0', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                          {proj.bullets.map((bullet, idx) => (
                            <li key={idx} style={{ fontSize: '9pt' }}>{formatBullet(bullet)}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </section>
              ) : null;

            case 'education':
              return education.length > 0 ? (
                <section key="education" data-section-id="education" data-section-title="Education" data-breakable="true">
                  <h3 style={sectionTitleStyle}>Education</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }} data-section-list="true">
                    {education.map((edu) => (
                      <div key={edu.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }} data-section-item="true">
                        <div>
                          <div style={{ fontWeight: 800, color: '#0f172a' }}>{edu.institution}</div>
                          <div style={{ fontSize: '9pt', color: '#475569' }}>
                            {edu.degree} {edu.field ? `in ${edu.field}` : ''}
                          </div>
                        </div>
                        <div style={{ textAlign: 'right', fontSize: '8.5pt', color: '#64748b' }}>
                          <div>{edu.startDate} {edu.endDate ? `– ${edu.endDate}` : ''}</div>
                          {edu.gpa && <div style={{ fontWeight: 600 }}>GPA: {edu.gpa}</div>}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              ) : null;

            case 'skills':
              return skills.length > 0 ? (
                <section key="skills">
                  <h3 style={sectionTitleStyle}>Skills & Competencies</h3>
                  {Array.isArray(skills) && typeof skills[0] === 'string' ? (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                      {(skills as string[]).map((skill, idx) => (
                        <span key={idx} style={{ fontSize: '8pt', backgroundColor: '#f3f4f6', color: '#1f2937', padding: '3px 8px', borderRadius: '4px', fontWeight: 600 }}>
                          {skill}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {(skills as any[]).map((cat, idx) => (
                        <div key={idx} style={{ display: 'flex', alignItems: 'start' }}>
                          <span style={{ fontWeight: 800, fontSize: '8.5pt', width: '130px', flexShrink: 0 }}>{cat.category}:</span>
                          <span style={{ fontSize: '8.5pt' }}>{cat.skills.join(', ')}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              ) : null;

            case 'certifications':
              return certifications && certifications.length > 0 ? (
                <section key="certifications">
                  <h3 style={sectionTitleStyle}>Certifications</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {certifications.map((cert) => (
                      <div key={cert.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                        <div>
                          <span style={{ fontWeight: 800, color: '#0f172a' }}>{cert.name}</span>
                          <span style={{ fontSize: '8.5pt', color: '#64748b', marginLeft: '6px' }}>— {cert.issuer}</span>
                        </div>
                        <span style={{ fontSize: '8.5pt', color: '#64748b' }}>{cert.date}</span>
                      </div>
                    ))}
                  </div>
                </section>
              ) : null;

            case 'achievements':
              return visibleSections.achievements !== false && achievements.length > 0 ? (
                <section key="achievements" data-section-id="achievements" data-section-title="Achievements & Awards" data-breakable="true">
                  <h3 style={sectionTitleStyle}>Achievements & Awards</h3>
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
                  <h3 style={sectionTitleStyle}>Awards & Honors</h3>
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
                  <h3 style={sectionTitleStyle}>Publications</h3>
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
                  <h3 style={sectionTitleStyle}>Leadership & Activities</h3>
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
