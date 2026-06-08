import React from 'react';
import { EditorState } from '@/models/EditorState';
import { ContactLinks, ProjectLinks } from "@/utils/linkFormatter";

interface TemplateProps {
  editorState: EditorState;
}

export default function AcademicSimpleTemplate({ editorState }: TemplateProps) {
  const { content, visibleSections, sectionOrder, theme } = editorState;
  const { personalInfo, summary, experience, education, projects, skills, certifications, achievements = [], awards = [], publications = [], leadership = [] } = content;

  const wrapperStyle = {
    fontFamily: theme.fontFamily || '"Times New Roman", Times, Georgia, serif',
    fontSize: theme.fontSize || '10.5pt',
    color: '#111111',
    backgroundColor: '#ffffff',
    padding: theme.pageMargin || '38px',
    lineHeight: '1.45',
    minHeight: '297mm',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '20px',
  };

  const headerStyle = {
    textAlign: 'center' as const,
    borderBottom: '1px solid #111111',
    paddingBottom: '14px',
    marginBottom: '10px',
  };

  const nameStyle = {
    fontSize: '24pt',
    fontWeight: "bold",
    color: '#000000',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
    margin: '0 0 4px 0',
  };

  const sectionHeaderStyle = {
    fontSize: '11pt',
    fontWeight: 'bold',
    color: '#000000',
    borderBottom: '0.5px solid #666666',
    paddingBottom: '2px',
    marginBottom: '8px',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.08em',
    marginTop: '12px',
  };

  const hasLinks = personalInfo.contact.linkedin || personalInfo.contact.github || personalInfo.contact.website ;

  return (
    <div style={wrapperStyle} className="w-full">
      {/* HEADER */}
      <header style={headerStyle}>
        <h1 style={nameStyle}>{personalInfo.fullName}</h1>
        {personalInfo.title && (
          <div style={{ fontSize: '9.5pt', fontStyle: 'italic', color: '#444444', marginBottom: '8px' }}>
            {personalInfo.title}
          </div>
        )}
        <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '14px', fontSize: '8.5pt', color: '#333333', alignItems: 'center' }}>
          {personalInfo.contact.email && <span>{personalInfo.contact.email}</span>}
          {personalInfo.contact.phone && <span>• &nbsp; {personalInfo.contact.phone}</span>}
          {personalInfo.contact.location && <span>• &nbsp; {personalInfo.contact.location}</span>}
          {hasLinks && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '14px' }}>
              <span>•</span>
              <ContactLinks contact={personalInfo.contact} separator={<span>•</span>} linkColor="#333333" />
            </span>
          )}
        </div>
      </header>

      {/* SECTIONS */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* For Academic CV, Education is usually prioritized, but we'll follow sectionOrder dynamically */}
        {sectionOrder.map((sectionKey) => {
          if (!visibleSections[sectionKey as keyof typeof visibleSections]) return null;

          switch (sectionKey) {
            case 'education':
              return education.length > 0 ? (
                <section key="education" data-section-id="education" data-section-title="Education" data-breakable="true">
                  <h3 style={sectionHeaderStyle}>Education</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }} data-section-list="true">
                    {education.map((edu) => (
                      <div key={edu.id} data-section-item="true">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', fontWeight: 'bold' }}>
                          <span>{edu.degree} {edu.field ? `in ${edu.field}` : ''}</span>
                          <span style={{ fontWeight: 'normal', fontSize: '9.5pt' }}>
                            {edu.startDate} {edu.endDate ? `– ${edu.endDate}` : ''}
                          </span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', fontSize: '9.5pt' }}>
                          <span style={{ fontStyle: 'italic' }}>{edu.institution}</span>
                        </div>
                        {edu.gpa && <div style={{ fontSize: '9pt', color: '#333' }}>GPA: {edu.gpa}</div>}
                      </div>
                    ))}
                  </div>
                </section>
              ) : null;

            case 'summary':
              return summary ? (
                <section key="summary" data-section-id="summary" data-section-title="Professional Summary">
                  <h3 style={sectionHeaderStyle}>Research Statement & Profile</h3>
                  <p style={{ textAlign: 'justify', margin: '0', fontSize: '10pt' }}>{summary}</p>
                </section>
              ) : null;

            case 'experience':
              return experience.length > 0 ? (
                <section key="experience" data-section-id="experience" data-section-title="Work Experience" data-breakable="true">
                  <h3 style={sectionHeaderStyle}>Research & Professional Experience</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }} data-section-list="true">
                    {experience.map((exp) => (
                      <div key={exp.id} data-section-item="true">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', fontWeight: 'bold' }}>
                          <span>{exp.role}</span>
                          <span style={{ fontWeight: 'normal', fontSize: '9.5pt' }}>
                            {exp.startDate} {exp.endDate ? `– ${exp.endDate}` : ''}
                          </span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', fontSize: '9.5pt', fontStyle: 'italic', marginBottom: '3px' }}>
                          <span>{exp.company}</span>
                          {exp.location && <span>{exp.location}</span>}
                        </div>
                        <ul style={{ listStyleType: 'disc', paddingLeft: '18px', margin: '0', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          {exp.bullets.map((bullet, idx) => (
                            <li key={idx} style={{ fontSize: '9.5pt' }}>{bullet}</li>
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
                  <h3 style={sectionHeaderStyle}>Academic Projects & Publications</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }} data-section-list="true">
                    {projects.map((proj) => (
                      <div key={proj.id} data-section-item="true">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', fontWeight: 'bold' }}>
                          <span>{proj.name}</span>
                          <ProjectLinks
                            project={proj}
                            separator=" | "
                            linkColor={theme.accentColor || '#3b82f6'}
                            style={{ fontSize: '8pt' }}
                          />
                          {proj.technologies && proj.technologies.length > 0 && (
                            <span style={{ fontWeight: 'normal', fontSize: '8.5pt', fontStyle: 'italic' }}>
                              ({proj.technologies.join(', ')})
                            </span>
                          )}
                        </div>
                        {proj.description && <div style={{ fontSize: '9pt', fontStyle: 'italic', margin: '2px 0' }}>{proj.description}</div>}
                        <ul style={{ listStyleType: 'disc', paddingLeft: '18px', margin: '0', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          {proj.bullets.map((bullet, idx) => (
                            <li key={idx} style={{ fontSize: '9.5pt' }}>{bullet}</li>
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
                  <h3 style={sectionHeaderStyle}>Methods & Expertise</h3>
                  {Array.isArray(skills) && typeof skills[0] === 'string' ? (
                    <p style={{ margin: '0', fontSize: '9.5pt' }}>{(skills as string[]).join('; ')}</p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      {(skills as any[]).map((cat, idx) => (
                        <div key={idx} style={{ display: 'flex', alignItems: 'start' }}>
                          <span style={{ fontWeight: 'bold', width: '150px', flexShrink: 0 }}>{cat.category}:</span>
                          <span>{cat.skills.join(', ')}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              ) : null;

            case 'certifications':
              return certifications && certifications.length > 0 ? (
                <section key="certifications">
                  <h3 style={sectionHeaderStyle}>Certifications & Fellowships</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {certifications.map((cert) => (
                      <div key={cert.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                        <div>
                          <span style={{ fontWeight: 'bold' }}>{cert.name}</span>
                          <span style={{ fontSize: '9.5pt', marginLeft: '6px' }}>— {cert.issuer}</span>
                        </div>
                        <span style={{ fontSize: '9.5pt' }}>{cert.date}</span>
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
