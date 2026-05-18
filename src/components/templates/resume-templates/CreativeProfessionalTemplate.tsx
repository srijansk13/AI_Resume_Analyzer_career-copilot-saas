import React from 'react';
import { EditorState } from '@/models/EditorState';

interface TemplateProps {
  editorState: EditorState;
}

export default function CreativeProfessionalTemplate({ editorState }: TemplateProps) {
  const { content, visibleSections, sectionOrder, theme } = editorState;
  const { personalInfo, summary, experience, education, projects, skills, certifications, achievements = [], awards = [], publications = [], leadership = [] } = content;

  // Compute theme styles
  const wrapperStyle = {
    fontFamily: theme.fontFamily || 'Inter, sans-serif',
    fontSize: theme.fontSize || '9.5pt',
    lineHeight: theme.lineHeight || '1.45',
    color: theme.textColor || '#1e293b',
    padding: theme.pageMargin || '36px',
    backgroundColor: '#ffffff',
    minHeight: '1123px',
    boxSizing: 'border-box' as const,
  };

  const nameStyle = {
    fontFamily: theme.headingFont || theme.fontFamily || 'Inter, sans-serif',
    fontSize: '26pt',
    fontWeight: '900',
    color: '#0f172a',
    letterSpacing: '-0.03em',
    lineHeight: '1.1',
  };

  const roleStyle = {
    fontFamily: theme.fontFamily || 'Inter, sans-serif',
    fontSize: '12pt',
    fontWeight: '600',
    color: theme.accentColor || '#6366f1',
    letterSpacing: '0.05em',
    textTransform: 'uppercase' as const,
    marginTop: '6px',
  };

  const sectionHeaderStyle = {
    fontFamily: theme.headingFont || theme.fontFamily || 'Inter, sans-serif',
    fontSize: '12pt',
    fontWeight: 'bold',
    color: theme.primaryColor || '#1e1b4b',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '12px',
    marginTop: '20px',
  };

  const sectionAccentLine = {
    width: '4px',
    height: '18px',
    backgroundColor: theme.accentColor || '#6366f1',
    borderRadius: '2px',
  };

  const spacingClass = theme.spacing === '1.2' ? 'space-y-3' : theme.spacing === '1.8' ? 'space-y-6' : 'space-y-5';
  const itemSpacingClass = theme.spacing === '1.2' ? 'space-y-1' : theme.spacing === '1.8' ? 'space-y-3' : 'space-y-2';

  return (
    <div style={wrapperStyle} className="w-full relative">
      {/* Visual Accent Element: Elegant Thin Gradient Stripe at the top edge */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: `linear-gradient(to right, ${theme.primaryColor || '#1e1b4b'}, ${theme.accentColor || '#6366f1'})` }} />

      {/* HEADER SECTION */}
      <header className="mb-6 flex justify-between items-start" style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '20px' }}>
        <div>
          <h1 style={nameStyle}>{personalInfo.fullName}</h1>
          {personalInfo.title && <h2 style={roleStyle}>{personalInfo.title}</h2>}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'end', fontSize: '8.5pt', color: '#475569', textAlign: 'right' }}>
          {personalInfo.contact.email && <span>{personalInfo.contact.email}</span>}
          {personalInfo.contact.phone && <span>{personalInfo.contact.phone}</span>}
          {personalInfo.contact.location && <span>{personalInfo.contact.location}</span>}
          {personalInfo.contact.linkedin && (
            <a href={personalInfo.contact.linkedin} target="_blank" rel="noreferrer" style={{ color: theme.accentColor || '#6366f1', textDecoration: 'none', fontWeight: 600 }} className="hover:underline">
              LinkedIn
            </a>
          )}
          {personalInfo.contact.github && (
            <a href={personalInfo.contact.github} target="_blank" rel="noreferrer" style={{ color: theme.accentColor || '#6366f1', textDecoration: 'none', fontWeight: 600 }} className="hover:underline">
              GitHub
            </a>
          )}
        </div>
      </header>

      {/* DYNAMIC SECTIONS */}
      <div className={spacingClass}>
        {sectionOrder.map((sectionKey) => {
          if (!visibleSections[sectionKey as keyof typeof visibleSections]) return null;

          switch (sectionKey) {
            case 'summary':
              return summary ? (
                <section key="summary" data-section-id="summary" data-section-title="Professional Summary">

                  <div style={sectionHeaderStyle}>
                    <div style={sectionAccentLine} />
                    <span style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>About Me</span>
                  </div>
                  <p style={{ fontSize: theme.fontSize || '9.5pt', textAlign: 'justify', lineHeight: '1.5', color: '#334155' }}>{summary}</p>
                </section>
              ) : null;

            case 'experience':
              return experience.length > 0 ? (
                <section key="experience">
                  <div style={sectionHeaderStyle}>
                    <div style={sectionAccentLine} />
                    <span style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>Professional Experience</span>
                  </div>
                  <div className={itemSpacingClass}>
                    {experience.map((exp) => (
                      <div key={exp.id} style={{ marginBottom: '10px' }}>
                        <div style={{ display: 'flex', justifyContent: 'between', alignItems: 'baseline', flexWrap: 'wrap' }}>
                          <span style={{ fontWeight: 'bold', fontSize: '10.5pt', color: '#0f172a' }}>{exp.role}</span>
                          <span style={{ fontSize: '8.5pt', color: '#64748b', marginLeft: 'auto', fontWeight: 600 }}>
                            {exp.startDate} {exp.endDate ? `– ${exp.endDate}` : ''}
                          </span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'between', alignItems: 'baseline', fontSize: '9pt', color: theme.accentColor || '#6366f1', marginBottom: '4px', fontWeight: 500 }}>
                          <span>{exp.company}</span>
                          {exp.location && <span style={{ marginLeft: 'auto', fontSize: '8.5pt', color: '#64748b' }}>{exp.location}</span>}
                        </div>
                        <ul style={{ listStyleType: 'disc', paddingLeft: '20px', margin: '0', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                          {exp.bullets.map((bullet, idx) => (
                            <li key={idx} style={{ fontSize: theme.fontSize || '9.5pt', color: '#334155' }}>{bullet}</li>
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
                  <div style={sectionHeaderStyle}>
                    <div style={sectionAccentLine} />
                    <span style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>Key Projects</span>
                  </div>
                  <div className={itemSpacingClass}>
                    {projects.map((proj) => (
                      <div key={proj.id} style={{ marginBottom: '10px' }}>
                        <div style={{ display: 'flex', justifyContent: 'between', alignItems: 'baseline', flexWrap: 'wrap' }}>
                          <span style={{ fontWeight: 'bold', fontSize: '10pt', color: '#0f172a' }}>
                            {proj.name}
                            {proj.link && (
                              <a href={proj.link} target="_blank" rel="noreferrer" style={{ color: theme.accentColor || '#6366f1', textDecoration: 'none', fontWeight: 'normal', fontSize: '8.5pt', marginLeft: '8px' }}>
                                Link 🔗
                              </a>
                            )}
                          </span>
                          {proj.technologies && proj.technologies.length > 0 && (
                            <span style={{ fontSize: '8pt', color: '#64748b', marginLeft: 'auto', fontWeight: 500 }}>
                              {proj.technologies.join(', ')}
                            </span>
                          )}
                        </div>
                        {proj.description && <p style={{ fontSize: '9pt', color: '#475569', marginTop: '2px', marginBottom: '4px' }}>{proj.description}</p>}
                        <ul style={{ listStyleType: 'circle', paddingLeft: '20px', margin: '0', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                          {proj.bullets.map((bullet, idx) => (
                            <li key={idx} style={{ fontSize: theme.fontSize || '9.5pt', color: '#334155' }}>{bullet}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </section>
              ) : null;

            case 'skills':
              return skills.length > 0 ? (
                <section key="skills">
                  <div style={sectionHeaderStyle}>
                    <div style={sectionAccentLine} />
                    <span style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>Core Competencies</span>
                  </div>
                  {Array.isArray(skills) && typeof skills[0] === 'string' ? (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {(skills as string[]).map((skill, idx) => (
                        <span key={idx} style={{ fontSize: '8.5pt', border: `1px solid ${theme.accentColor || '#6366f1'}`, color: theme.primaryColor || '#1e1b4b', padding: '3px 8px', borderRadius: '6px', fontWeight: 500 }}>
                          {skill}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {(skills as any[]).map((cat, idx) => (
                        <div key={idx} style={{ display: 'flex', alignItems: 'start' }}>
                          <span style={{ fontSize: '9pt', fontWeight: 'bold', width: '120px', flexShrink: 0, color: theme.primaryColor || '#1e1b4b' }}>{cat.category}:</span>
                          <span style={{ fontSize: '9pt', color: '#334155' }}>{cat.skills.join(', ')}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              ) : null;

            case 'education':
              return education.length > 0 ? (
                <section key="education" data-section-id="education" data-section-title="Education" data-breakable="true">

                  <div style={sectionHeaderStyle} data-section-list="true">

                    <div style={sectionAccentLine} />
                    <span style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>Education</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {education.map((edu) => (

                      <div key={edu.id} style={{ display: 'flex', justifyContent: 'between', alignItems: 'start' }} data-section-item="true">

                        <div>
                          <div style={{ fontWeight: 'bold', fontSize: '10pt', color: '#0f172a' }}>{edu.institution}</div>
                          <div style={{ fontSize: '9pt', color: '#475569' }}>
                            {edu.degree} {edu.field ? `in ${edu.field}` : ''}
                          </div>
                          {edu.gpa && <div style={{ fontSize: '8.5pt', color: '#64748b' }}>GPA: {edu.gpa}</div>}
                        </div>
                        <div style={{ marginLeft: 'auto', fontSize: '8.5pt', color: '#64748b', textAlign: 'right', fontWeight: 500 }}>
                          {edu.startDate} {edu.endDate ? `– ${edu.endDate}` : ''}
                        </div>
                      </div>
))}
</div>
</section>
              ) : null;

            case 'certifications':
              return certifications && certifications.length > 0 ? (
                <section key="certifications">
                  <div style={sectionHeaderStyle}>
                    <div style={sectionAccentLine} />
                    <span style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>Certifications</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    {certifications.map((cert) => (
                      <div key={cert.id} style={{ padding: '6px 10px', border: '1px solid #f1f5f9', borderRadius: '6px' }}>
                        <div style={{ fontWeight: 'bold', fontSize: '9pt', color: '#0f172a' }}>{cert.name}</div>
                        <div style={{ fontSize: '8pt', color: '#64748b' }}>{cert.issuer} ({cert.date})</div>
                      </div>
                    ))}
                  </div>
                </section>
              ) : null;

            
            

      
      case 'achievements':
        return visibleSections.achievements !== false && achievements.length > 0 ? (
          <section key="achievements" data-section-id="achievements" data-section-title="Achievements & Awards" data-breakable="true">
            <h3 style={sectionHeaderStyle}>Achievements & Awards</h3>
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
            <h3 style={sectionHeaderStyle}>Awards & Honors</h3>
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
            <h3 style={sectionHeaderStyle}>Publications</h3>
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
            <h3 style={sectionHeaderStyle}>Leadership & Activities</h3>
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
