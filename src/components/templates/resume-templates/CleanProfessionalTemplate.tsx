import React from 'react';
import { EditorState } from '@/models/EditorState';
import { FormattedLinks, getNormalizedProjectLinks } from '@/utils/linkFormatter';

interface TemplateProps {
  editorState: EditorState;
}

export default function CleanProfessionalTemplate({ editorState }: TemplateProps) {
  const { content, visibleSections, sectionOrder, theme } = editorState;
  const { personalInfo, summary, experience, education, projects, skills, certifications, achievements = [], awards = [], publications = [], leadership = [] } = content;

  // Theme styles integration
  const wrapperStyle = {
    fontFamily: theme.fontFamily || 'Inter, sans-serif',
    fontSize: theme.fontSize || '9.5pt',
    color: theme.textColor || '#334155',
    backgroundColor: theme.backgroundColor || '#ffffff',
    padding: theme.pageMargin || '32px',
    lineHeight: theme.lineHeight || '1.5',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: theme.sectionSpacing || '18px',
  };

  const headerStyle = {
    borderBottom: `2px solid ${theme.primaryColor || '#0284c7'}`,
    paddingBottom: '12px',
    marginBottom: '6px',
  };

  const nameStyle = {
    fontFamily: theme.headingFont || theme.fontFamily || 'Inter, sans-serif',
    fontSize: '24pt',
    fontWeight: 800,
    color: theme.primaryColor || '#0f172a',
    letterSpacing: '-0.02em',
    lineHeight: '1.1',
  };

  const titleStyle = {
    fontSize: '11pt',
    fontWeight: 600,
    color: theme.accentColor || '#0284c7',
    marginTop: '4px',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
  };

  const sectionTitleStyle = {
    fontFamily: theme.headingFont || theme.fontFamily || 'Inter, sans-serif',
    fontSize: '12pt',
    fontWeight: 700,
    color: theme.primaryColor || '#0f172a',
    borderBottom: '1px solid #f1f5f9',
    paddingBottom: '6px',
    marginBottom: '10px',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
  };

  return (
    <div style={wrapperStyle} className="w-full">
      {/* HEADER */}
      <header style={headerStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h1 style={nameStyle}>{personalInfo.fullName}</h1>
            {personalInfo.title && <h2 style={titleStyle}>{personalInfo.title}</h2>}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', fontSize: '8.5pt', color: '#64748b', gap: '2px' }}>
            {personalInfo.contact.email && <span>{personalInfo.contact.email}</span>}
            {personalInfo.contact.phone && <span>{personalInfo.contact.phone}</span>}
            {personalInfo.contact.location && <span>{personalInfo.contact.location}</span>}
            <div style={{ display: 'flex', gap: '8px', marginTop: '2px' }}>
              {personalInfo.contact.linkedin && (
                <a href={personalInfo.contact.linkedin} target="_blank" rel="noreferrer" style={{ color: theme.accentColor || '#0284c7', textDecoration: 'none' }}>LinkedIn</a>
              )}
              {personalInfo.contact.github && (
                <a href={personalInfo.contact.github} target="_blank" rel="noreferrer" style={{ color: theme.accentColor || '#0284c7', textDecoration: 'none' }}>GitHub</a>
              )}
              {personalInfo.contact.website && (
                <a href={personalInfo.contact.website} target="_blank" rel="noreferrer" style={{ color: theme.accentColor || '#0284c7', textDecoration: 'none' }}>Portfolio</a>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* SECTIONS */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: theme.sectionSpacing || '18px' }}>
        {sectionOrder.map((sectionKey) => {
          if (!visibleSections[sectionKey as keyof typeof visibleSections]) return null;

          switch (sectionKey) {
            case 'summary':
              return summary ? (
                <section key="summary" data-section-id="summary" data-section-title="Professional Summary">

                  <h3 style={sectionTitleStyle}>Profile Summary</h3>
                  <p style={{ textAlign: 'justify', color: theme.textColor || '#334155' }}>{summary}</p>
                </section>
              ) : null;

            case 'experience':
              return experience.length > 0 ? (
                <section key="experience" data-section-id="experience" data-section-title="Work Experience" data-breakable="true">

                  <h3 style={sectionTitleStyle}>Professional Experience</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }} data-section-list="true">

                    {experience.map((exp) => (

                      <div key={exp.id} data-section-item="true">

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                          <span style={{ fontWeight: 700, fontSize: '10pt', color: '#0f172a' }}>{exp.role}</span>
                          <span style={{ fontSize: '8.5pt', color: '#64748b', fontWeight: 500 }}>
                            {exp.startDate} {exp.endDate ? `– ${exp.endDate}` : ''}
                          </span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', fontSize: '9pt', color: '#475569', marginBottom: '6px' }}>
                          <span style={{ fontWeight: 600, color: theme.accentColor || '#0284c7' }}>{exp.company}</span>
                          {exp.location && <span>{exp.location}</span>}
                        </div>
                        <ul style={{ listStyleType: 'circle', paddingLeft: '18px', margin: '0', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          {exp.bullets.map((bullet, idx) => (
                            <li key={idx} style={{ color: theme.textColor || '#334155' }}>{bullet}</li>
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

                  <h3 style={sectionTitleStyle}>Projects</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }} data-section-list="true">

                    {projects.map((proj) => (

                      <div key={proj.id} data-section-item="true">

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '4px' }}>
                          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', flexWrap: 'wrap' }}>
                            <span style={{ fontWeight: 700, fontSize: '10pt', color: '#0f172a' }}>{proj.name}</span>
                            {getNormalizedProjectLinks(proj) && (
                              <FormattedLinks
                                text={getNormalizedProjectLinks(proj)}
                                context="project"
                                separator=" | "
                                linkColor={theme.accentColor || '#0284c7'}
                                style={{ fontSize: '8pt' }}
                              />
                            )}
                          </div>
                          {proj.technologies && proj.technologies.length > 0 && (
                            <span style={{ fontSize: '8pt', color: theme.accentColor || '#0284c7', backgroundColor: `${theme.accentColor}10` || '#f0f9ff', padding: '2px 8px', borderRadius: '12px', fontWeight: 500 }}>
                              {proj.technologies.join(', ')}
                            </span>
                          )}
                        </div>
                        {proj.description && <p style={{ margin: '0 0 4px 0', fontStyle: 'italic', fontSize: '9pt' }}>{proj.description}</p>}
                        <ul style={{ listStyleType: 'circle', paddingLeft: '18px', margin: '0', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          {proj.bullets.map((bullet, idx) => (
                            <li key={idx} style={{ color: theme.textColor || '#334155' }}>{bullet}</li>
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
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }} data-section-list="true">

                    {education.map((edu) => (

                      <div key={edu.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }} data-section-item="true">

                        <div>
                          <div style={{ fontWeight: 700, color: '#0f172a' }}>{edu.institution}</div>
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
                  <h3 style={sectionTitleStyle}>Core Expertise</h3>
                  {Array.isArray(skills) && typeof skills[0] === 'string' ? (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {(skills as string[]).map((skill, idx) => (
                        <span key={idx} style={{ fontSize: '8.5pt', border: '1px solid #e2e8f0', color: '#475569', padding: '3px 8px', borderRadius: '4px', fontWeight: 500 }}>
                          {skill}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {(skills as any[]).map((cat, idx) => (
                        <div key={idx} style={{ display: 'flex', alignItems: 'start', gap: '8px' }}>
                          <span style={{ fontWeight: 700, fontSize: '9pt', color: '#0f172a', width: '130px', flexShrink: 0 }}>{cat.category}:</span>
                          <span style={{ fontSize: '9pt', color: '#475569' }}>{cat.skills.join(', ')}</span>
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
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {certifications.map((cert) => (
                      <div key={cert.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                        <div>
                          <span style={{ fontWeight: 700, color: '#0f172a' }}>{cert.name}</span>
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
