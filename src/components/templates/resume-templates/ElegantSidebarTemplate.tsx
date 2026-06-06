import React from 'react';
import { EditorState } from '@/models/EditorState';

interface TemplateProps {
  editorState: EditorState;
}

export default function ElegantSidebarTemplate({ editorState }: TemplateProps) {
  const { content, visibleSections, sectionOrder = ['summary', 'experience', 'projects', 'education', 'skills', 'certifications', 'achievements', 'awards', 'publications', 'leadership'], theme } = editorState;
  const { personalInfo, summary, experience, education, projects, skills, certifications, achievements = [], awards = [], publications = [], leadership = [] } = content;

  const wrapperStyle = {
    fontFamily: theme.fontFamily || 'Outfit, sans-serif',
    fontSize: theme.fontSize || '9.5pt',
    lineHeight: theme.lineHeight || '1.4',
    color: '#334155',
    backgroundColor: '#ffffff',
    minHeight: '1123px',
    boxSizing: 'border-box' as const,
    display: 'flex',
    flexDirection: 'row' as const,
  };

  const leftSidebarStyle = {
    width: '32%',
    backgroundColor: theme.primaryColor || '#1e293b',
    padding: theme.pageMargin || '24px',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '20px',
  };

  const rightContentStyle = {
    width: '68%',
    padding: theme.pageMargin || '24px',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '18px',
  };

  const nameStyle = {
    fontFamily: theme.headingFont || theme.fontFamily || 'Outfit, sans-serif',
    fontSize: '20pt',
    fontWeight: 800,
    color: theme.primaryColor || '#0f172a',
    lineHeight: '1.2',
  };

  const roleStyle = {
    fontFamily: theme.fontFamily || 'Outfit, sans-serif',
    fontSize: '11pt',
    fontWeight: 500,
    color: theme.accentColor || '#3b82f6',
    marginTop: '4px',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
  };

  const sidebarSectionTitleStyle = {
    fontFamily: theme.headingFont || theme.fontFamily || 'Outfit, sans-serif',
    fontSize: '10.5pt',
    fontWeight: 'bold',
    color: theme.accentColor || '#3b82f6',
    borderBottom: '1px solid rgba(255, 255, 255, 0.15)',
    paddingBottom: '4px',
    marginBottom: '8px',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
  };

  const mainSectionTitleStyle = {
    fontFamily: theme.headingFont || theme.fontFamily || 'Outfit, sans-serif',
    fontSize: '11.5pt',
    fontWeight: 'bold',
    color: theme.primaryColor || '#0f172a',
    borderBottom: '2px solid #f1f5f9',
    paddingBottom: '4px',
    marginBottom: '10px',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
  };

  const renderSectionById = (sectionId: string) => {
    switch (sectionId) {
      case 'skills':
        return visibleSections.skills !== false && skills.length > 0 ? (
          <div key="skills">
            <h3 style={sidebarSectionTitleStyle}>Expertise</h3>
            {Array.isArray(skills) && typeof skills[0] === 'string' ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {(skills as string[]).map((skill, idx) => (
                  <span key={idx} style={{ fontSize: '8pt', backgroundColor: 'rgba(255, 255, 255, 0.08)', color: '#f8fafc', padding: '3px 8px', borderRadius: '4px' }}>
                    {skill}
                  </span>
                ))}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {(skills as any[]).map((cat, idx) => (
                  <div key={idx}>
                    <div style={{ fontSize: '8.5pt', fontWeight: 600, color: '#94a3b8', marginBottom: '4px' }}>{cat.category}</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                      {cat.skills.map((s: string, sIdx: number) => (
                        <span key={sIdx} style={{ fontSize: '8pt', backgroundColor: 'rgba(255, 255, 255, 0.08)', color: '#f8fafc', padding: '3px 8px', borderRadius: '4px' }}>
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : null;

      case 'certifications':
        return visibleSections.certifications !== false && certifications && certifications.length > 0 ? (
          <div key="certifications">
            <h3 style={sidebarSectionTitleStyle}>Credentials</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '8.5pt', color: '#cbd5e1' }}>
              {certifications.map((cert) => (
                <div key={cert.id}>
                  <div style={{ fontWeight: 600, color: '#ffffff' }}>{cert.name}</div>
                  <div style={{ color: '#94a3b8', fontSize: '8pt' }}>{cert.issuer} | {cert.date}</div>
                </div>
              ))}
            </div>
          </div>
        ) : null;

      case 'summary':
        return summary ? (
          <section key="summary" data-section-id="summary" data-section-title="Professional Summary">
            <h3 style={mainSectionTitleStyle}>Professional Summary</h3>
            <p style={{ textAlign: 'justify', color: theme.textColor || '#334155', fontWeight: 'normal', margin: 0 }}>{summary}</p>
          </section>
        ) : null;

      case 'experience':
        return experience.length > 0 ? (
          <section key="experience" data-section-id="experience" data-section-title="Work Experience" data-breakable="true">
            <h3 style={mainSectionTitleStyle}>Work Experience</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }} data-section-list="true">
              {experience.map((exp) => (
                <div key={exp.id} data-section-item="true">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <span style={{ fontWeight: 'bold', fontSize: '10pt', color: theme.primaryColor || '#0f172a' }}>{exp.role}</span>
                    <span style={{ fontSize: '8.5pt', color: '#64748b', fontWeight: 'normal' }}>
                      {exp.startDate} {exp.endDate ? "– " + exp.endDate : ''}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', fontSize: '9pt', color: theme.textColor || '#475569', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 600, color: theme.accentColor || '#3b82f6' }}>{exp.company}</span>
                    {exp.location && <span>{exp.location}</span>}
                  </div>
                  <ul style={{ listStyleType: 'disc', paddingLeft: '18px', margin: '0', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    {exp.bullets.map((bullet, idx) => (
                      <li key={idx} style={{ color: theme.textColor || '#334155', fontWeight: 'normal' }}>{bullet}</li>
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
            <h3 style={mainSectionTitleStyle}>Key Projects</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }} data-section-list="true">
              {projects.map((proj) => (
                <div key={proj.id} data-section-item="true">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <span style={{ fontWeight: 'bold', fontSize: '10pt', color: theme.primaryColor || '#0f172a' }}>{proj.name}</span>
                    {proj.technologies && proj.technologies.length > 0 && (
                      <span style={{ fontSize: '8.5pt', color: theme.accentColor || '#3b82f6', fontWeight: 'normal' }}>
                        ({proj.technologies.join(', ')})
                      </span>
                    )}
                  </div>
                  {proj.description && <p style={{ margin: '2px 0 4px 0', fontStyle: 'italic', fontSize: '9pt', fontWeight: 'normal', color: theme.textColor || '#475569' }}>{proj.description}</p>}
                  <ul style={{ listStyleType: 'disc', paddingLeft: '18px', margin: '0', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    {proj.bullets.map((bullet, idx) => (
                      <li key={idx} style={{ color: theme.textColor || '#334155', fontWeight: 'normal' }}>{bullet}</li>
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
            <h3 style={mainSectionTitleStyle}>Education</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }} data-section-list="true">
              {education.map((edu) => (
                <div key={edu.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }} data-section-item="true">
                  <div>
                    <div style={{ fontWeight: 'bold', color: theme.primaryColor || '#0f172a' }}>{edu.institution}</div>
                    <div style={{ fontSize: '9pt', color: theme.textColor || '#475569', fontWeight: 'normal' }}>
                      {edu.degree} {edu.field ? "in " + edu.field : ''}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', fontSize: '8.5pt', color: '#64748b', fontWeight: 'normal' }}>
                    <div>{edu.startDate} {edu.endDate ? "– " + edu.endDate : ''}</div>
                    {edu.gpa && <div style={{ fontWeight: 600 }}>GPA: {edu.gpa}</div>}
                  </div>
                </div>
              ))}
            </div>
          </section>
        ) : null;
  
      case 'achievements':
        return visibleSections.achievements !== false && achievements.length > 0 ? (
          <section key="achievements" data-section-id="achievements" data-section-title="Achievements & Awards" data-breakable="true">
            <h3 style={mainSectionTitleStyle}>Achievements & Awards</h3>
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
            <h3 style={mainSectionTitleStyle}>Awards & Honors</h3>
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
            <h3 style={mainSectionTitleStyle}>Publications</h3>
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
            <h3 style={mainSectionTitleStyle}>Leadership & Activities</h3>
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
  };

  const leftColumnPreferred = ['skills', 'certifications'];
  const leftSections = sectionOrder.filter(secId => leftColumnPreferred.includes(secId));
  const rightSections = sectionOrder.filter(secId => !leftColumnPreferred.includes(secId));

  return (
    <div style={wrapperStyle} className="w-full">
      {/* LEFT SIDEBAR PANEL */}
      <aside style={leftSidebarStyle}>
        {/* Profile Info */}
        <div style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)', paddingBottom: '16px', marginBottom: '8px' }}>
          <div style={{ wordBreak: 'break-word' }}>
            <h1 style={{ ...nameStyle, color: '#ffffff', fontSize: '20pt' }}>{personalInfo.fullName}</h1>
            {personalInfo.title && <h2 style={{ ...roleStyle, color: theme.accentColor || '#3b82f6', fontSize: '9pt' }}>{personalInfo.title}</h2>}
          </div>
        </div>

        {/* Contact info list */}
        <div>
          <h3 style={sidebarSectionTitleStyle}>Contact Info</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '8.5pt', color: '#cbd5e1' }}>
            {personalInfo.contact.email && (
              <div>
                <div style={{ fontWeight: 600, color: '#94a3b8' }}>EMAIL</div>
                <div style={{ wordBreak: 'break-all' }}>{personalInfo.contact.email}</div>
              </div>
            )}
            {personalInfo.contact.phone && (
              <div>
                <div style={{ fontWeight: 600, color: '#94a3b8' }}>PHONE</div>
                <div>{personalInfo.contact.phone}</div>
              </div>
            )}
            {personalInfo.contact.location && (
              <div>
                <div style={{ fontWeight: 600, color: '#94a3b8' }}>LOCATION</div>
                <div>{personalInfo.contact.location}</div>
              </div>
            )}
            {personalInfo.contact.linkedin && (
              <div>
                <div style={{ fontWeight: 600, color: '#94a3b8' }}>LINKEDIN</div>
                <a href={personalInfo.contact.linkedin} target="_blank" rel="noreferrer" style={{ color: '#60a5fa', textDecoration: 'none' }} className="hover:underline">
                  linkedin.com
                </a>
              </div>
            )}
            {personalInfo.contact.github && (
              <div>
                <div style={{ fontWeight: 600, color: '#94a3b8' }}>GITHUB</div>
                <a href={personalInfo.contact.github} target="_blank" rel="noreferrer" style={{ color: '#60a5fa', textDecoration: 'none' }} className="hover:underline">
                  github.com
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Dynamic sidebar sections */}
        {leftSections.map(secId => renderSectionById(secId))}
      </aside>

      {/* RIGHT MAIN PANEL */}
      <main style={rightContentStyle}>
        <div style={{ borderBottom: '3px solid #0f172a', paddingBottom: '16px', marginBottom: '10px' }}>
          <h1 style={nameStyle}>{personalInfo.fullName}</h1>
          {personalInfo.title && <h2 style={roleStyle}>{personalInfo.title}</h2>}
        </div>

        {/* Dynamic main sections */}
        {rightSections.map(secId => renderSectionById(secId))}
      </main>
    </div>
  );
}
