import React from 'react';
import { EditorState } from '@/models/EditorState';

interface TemplateProps {
  editorState: EditorState;
}

export default function DataAnalystTemplate({ editorState }: TemplateProps) {
  const { content, visibleSections, sectionOrder = ['summary', 'experience', 'projects', 'education', 'skills', 'certifications', 'achievements', 'awards', 'publications', 'leadership'], theme } = editorState;
  const { personalInfo, summary, experience, education, projects, skills, certifications, achievements = [], awards = [], publications = [], leadership = [] } = content;

  // Real two-column dashboard-style layout
  const wrapperStyle = {
    display: 'flex',
    fontFamily: theme.fontFamily || 'Inter, sans-serif',
    fontSize: theme.fontSize || '9pt',
    color: '#334155',
    backgroundColor: '#ffffff',
    minHeight: '297mm',
    width: '100%',
  };

  const leftSidebarStyle = {
    width: '33%',
    backgroundColor: '#f8fafc',
    borderRight: '1px solid #e2e8f0',
    padding: '24px 20px',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '20px',
  };

  const rightContentStyle = {
    width: '67%',
    padding: '24px 24px',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '18px',
  };

  const sidebarSectionTitleStyle = {
    fontSize: '9.5pt',
    fontWeight: 'bold',
    color: theme.primaryColor || '#0f172a',
    borderBottom: `2.5px solid ${theme.accentColor || '#3b82f6'}`,
    paddingBottom: '4px',
    marginBottom: '10px',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.08em',
  };

  const rightSectionTitleStyle = {
    fontSize: '11pt',
    fontWeight: 'bold',
    color: theme.primaryColor || '#0f172a',
    borderBottom: '1px dashed #cbd5e1',
    paddingBottom: '4px',
    marginBottom: '10px',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
  };

  // Helper to render level bars for data skills/tools
  const renderDashboardSkill = (name: string, index: number) => {
    // Generate deterministic bar width based on index for professional display
    const levels = ['95%', '90%', '85%', '80%', '75%'];
    const width = levels[index % levels.length];
    return (
      <div key={name} style={{ marginBottom: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '8pt', fontWeight: 600, color: '#334155', marginBottom: '2px' }}>
          <span>{name}</span>
          <span style={{ color: theme.accentColor || '#3b82f6' }}>{width}</span>
        </div>
        <div style={{ width: '100%', height: '6px', backgroundColor: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
          <div style={{ width, height: '100%', backgroundColor: theme.accentColor || '#3b82f6', borderRadius: '3px' }} />
        </div>
      </div>
    );
  };

  const renderSectionById = (sectionId: string) => {
    switch (sectionId) {
      case 'skills':
        return visibleSections.skills !== false && skills.length > 0 ? (
          <div key="skills">
            <h3 style={sidebarSectionTitleStyle}>Analytics Skills</h3>
            {Array.isArray(skills) && typeof skills[0] === 'string' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {(skills as string[]).slice(0, 5).map((skill, idx) => renderDashboardSkill(skill, idx))}
                {skills.length > 5 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '8px' }}>
                    {(skills as string[]).slice(5).map((skill, idx) => (
                      <span key={idx} style={{ fontSize: '7.5pt', backgroundColor: '#e2e8f0', color: '#334155', padding: '2px 6px', borderRadius: '3px', fontWeight: 500 }}>
                        {skill}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {(skills as any[]).map((cat, idx) => (
                  <div key={idx}>
                    <div style={{ fontSize: '8pt', fontWeight: 'bold', color: '#475569', marginBottom: '4px' }}>{cat.category}</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                      {cat.skills.map((s: string, sIdx: number) => (
                        <span key={sIdx} style={{ fontSize: '7.5pt', backgroundColor: '#e2e8f0', color: '#334155', padding: '2px 6px', borderRadius: '3px', fontWeight: 500 }}>
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
            <h3 style={sidebarSectionTitleStyle}>Certifications</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '8pt' }}>
              {certifications.map((cert) => (
                <div key={cert.id}>
                  <div style={{ fontWeight: 'bold', color: '#0f172a' }}>{cert.name}</div>
                  <div style={{ color: '#64748b', fontSize: '7.5pt' }}>{cert.issuer} ({cert.date})</div>
                </div>
              ))}
            </div>
          </div>
        ) : null;

      case 'summary':
        return summary ? (
          <section key="summary" data-section-id="summary" data-section-title="Professional Summary">
            <h3 style={rightSectionTitleStyle}>Professional Summary</h3>
            <p style={{ textAlign: 'justify', color: theme.textColor || '#334155', fontWeight: 'normal', margin: 0 }}>{summary}</p>
          </section>
        ) : null;

      case 'experience':
        return experience.length > 0 ? (
          <section key="experience" data-section-id="experience" data-section-title="Work Experience" data-breakable="true">
            <h3 style={rightSectionTitleStyle}>Work Experience</h3>
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
            <h3 style={rightSectionTitleStyle}>Key Projects</h3>
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
            <h3 style={rightSectionTitleStyle}>Education</h3>
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
            <h3 style={rightSectionTitleStyle}>Achievements & Awards</h3>
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
            <h3 style={rightSectionTitleStyle}>Awards & Honors</h3>
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
            <h3 style={rightSectionTitleStyle}>Publications</h3>
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
            <h3 style={rightSectionTitleStyle}>Leadership & Activities</h3>
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
      {/* LEFT SIDEBAR (contact, skills, tools, certifications, links) */}
      <aside style={leftSidebarStyle}>
        <div>
          <h1 style={{ fontSize: '22pt', fontWeight: 800, color: '#0f172a', lineHeight: '1.2' }}>{personalInfo.fullName}</h1>
          {personalInfo.title && (
            <h2 style={{ fontSize: '9pt', fontWeight: 600, color: theme.accentColor || '#3b82f6', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '4px' }}>
              {personalInfo.title}
            </h2>
          )}
        </div>

        {/* Contact section */}
        <div>
          <h3 style={sidebarSectionTitleStyle}>Contact</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '8pt', color: '#475569' }}>
            {personalInfo.contact.email && <div>✉ {personalInfo.contact.email}</div>}
            {personalInfo.contact.phone && <div>☎ {personalInfo.contact.phone}</div>}
            {personalInfo.contact.location && <div>📍 {personalInfo.contact.location}</div>}
          </div>
        </div>

        {/* Links section */}
        <div>
          <h3 style={sidebarSectionTitleStyle}>Links</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '8pt', color: theme.accentColor || '#3b82f6' }}>
            {personalInfo.contact.linkedin && (
              <a href={personalInfo.contact.linkedin} target="_blank" rel="noreferrer" style={{ color: theme.accentColor || '#3b82f6', textDecoration: 'none' }}>🔗 LinkedIn</a>
            )}
            {personalInfo.contact.github && (
              <a href={personalInfo.contact.github} target="_blank" rel="noreferrer" style={{ color: theme.accentColor || '#3b82f6', textDecoration: 'none' }}>🔗 GitHub</a>
            )}
            {personalInfo.contact.website && (
              <a href={personalInfo.contact.website} target="_blank" rel="noreferrer" style={{ color: theme.accentColor || '#3b82f6', textDecoration: 'none' }}>🔗 Portfolio</a>
            )}
          </div>
        </div>

        {/* Dashboard Tools Section */}
        <div>
          <h3 style={sidebarSectionTitleStyle}>Tools & DBs</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
            {['SQL', 'Python', 'PowerBI', 'Tableau', 'Excel', 'R', 'Spark', 'Airflow', 'BigQuery', 'Snowflake'].map((t) => (
              <span key={t} style={{ fontSize: '7.5pt', backgroundColor: `${theme.accentColor}15` || '#eff6ff', color: theme.accentColor || '#3b82f6', border: `1px solid ${theme.accentColor}30` || '#bfdbfe', padding: '2px 6px', borderRadius: '3px', fontWeight: 600 }}>
                {t}
              </span>
            ))}
          </div>
        </div>

        {/* Dynamic sidebar sections */}
        {leftSections.map(secId => renderSectionById(secId))}
      </aside>

      {/* RIGHT MAIN PANEL (summary, experience, projects, education) */}
      <main style={rightContentStyle}>
        {/* Dynamic main sections */}
        {rightSections.map(secId => renderSectionById(secId))}
      </main>
    </div>
  );
}
