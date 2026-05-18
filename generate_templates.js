const fs = require('fs');
const path = require('path');

const templates = [
  'CleanProfessionalTemplate',
  'CorporateStandardTemplate',
  'MinimalEngineerTemplate',
  'AcademicSimpleTemplate',
  'ProductDesignerTemplate',
  'StartupResumeTemplate',
  'TechLeadTemplate',
  'DataAnalystTemplate',
  'AIEngineerTemplate',
  'ProductManagerTemplate',
  'ElegantSidebarTemplate',
  'CreativeProfessionalTemplate'
];

const templateContent = (name) => `import React from 'react';
import { EditorState } from '@/models/EditorState';

interface TemplateProps {
  editorState: EditorState;
}

export default function ${name}({ editorState }: TemplateProps) {
  const { content, visibleSections, sectionOrder } = editorState;
  const { personalInfo, summary, experience, education, projects, skills, certifications } = content;

  return (
    <div className="p-10 font-sans text-gray-800 text-[10pt] leading-normal bg-white min-h-[297mm]">
      {/* HEADER */}
      <header className="mb-8 border-b-2 border-gray-200 pb-4">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-2">
          {personalInfo.fullName}
        </h1>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-gray-600">
          {personalInfo.contact.email && <span>{personalInfo.contact.email}</span>}
          {personalInfo.contact.phone && (
            <>
              <span className="text-gray-300">•</span>
              <span>{personalInfo.contact.phone}</span>
            </>
          )}
          {personalInfo.contact.location && (
            <>
              <span className="text-gray-300">•</span>
              <span>{personalInfo.contact.location}</span>
            </>
          )}
          {personalInfo.contact.linkedin && (
            <>
              <span className="text-gray-300">•</span>
              <a href={personalInfo.contact.linkedin} className="hover:text-blue-600">
                LinkedIn
              </a>
            </>
          )}
        </div>
      </header>

      {/* DYNAMIC SECTIONS */}
      <div className="space-y-6">
        {sectionOrder.map((sectionKey) => {
          if (!visibleSections[sectionKey as keyof typeof visibleSections]) return null;

          switch (sectionKey) {
            case 'summary':
              return summary ? (
                <section key="summary">
                  <h2 className="text-lg font-bold text-gray-900 mb-2">Summary</h2>
                  <p className="text-gray-700 leading-relaxed">{summary}</p>
                </section>
              ) : null;

            case 'experience':
              return experience.length > 0 ? (
                <section key="experience">
                  <h2 className="text-lg font-bold text-gray-900 mb-3">Experience</h2>
                  <div className="space-y-4">
                    {experience.map((exp) => (
                      <div key={exp.id}>
                        <div className="flex justify-between items-baseline mb-1">
                          <span className="font-bold text-gray-900">{exp.role}</span>
                          <span className="text-sm text-gray-500">
                            {exp.startDate} {exp.endDate ? "– " + exp.endDate : ''}
                          </span>
                        </div>
                        <div className="flex justify-between items-baseline mb-2">
                          <span className="text-gray-700 font-medium">{exp.company}</span>
                          {exp.location && <span className="text-sm text-gray-500">{exp.location}</span>}
                        </div>
                        <ul className="list-disc pl-5 space-y-1.5">
                          {exp.bullets.map((bullet, idx) => (
                            <li key={idx} className="text-gray-700">{bullet}</li>
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
                  <h2 className="text-lg font-bold text-gray-900 mb-3">Projects</h2>
                  <div className="space-y-4">
                    {projects.map((proj) => (
                      <div key={proj.id}>
                        <div className="flex justify-between items-baseline mb-1">
                          <span className="font-bold text-gray-900">{proj.name}</span>
                          {proj.technologies && proj.technologies.length > 0 && (
                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                              {proj.technologies.join(', ')}
                            </span>
                          )}
                        </div>
                        <ul className="list-disc pl-5 space-y-1.5 mt-2">
                          {proj.bullets.map((bullet, idx) => (
                            <li key={idx} className="text-gray-700">{bullet}</li>
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
                  <h2 className="text-lg font-bold text-gray-900 mb-3">Education</h2>
                  <div className="space-y-3">
                    {education.map((edu) => (
                      <div key={edu.id} className="flex justify-between items-start">
                        <div>
                          <div className="font-bold text-gray-900">{edu.institution}</div>
                          <div className="text-gray-700">
                            {edu.degree} {edu.field ? "in " + edu.field : ''}
                          </div>
                        </div>
                        <div className="text-sm text-gray-500 text-right">
                          <div>{edu.startDate} {edu.endDate ? "– " + edu.endDate : ''}</div>
                          {edu.gpa && <div>GPA: {edu.gpa}</div>}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              ) : null;

            case 'skills':
              return skills.length > 0 ? (
                <section key="skills">
                  <h2 className="text-lg font-bold text-gray-900 mb-2">Skills</h2>
                  {Array.isArray(skills) && typeof skills[0] === 'string' ? (
                    <p className="text-gray-700">{(skills as string[]).join(', ')}</p>
                  ) : (
                    <div className="space-y-2">
                      {(skills as any[]).map((cat, idx) => (
                        <div key={idx} className="flex items-start">
                          <span className="font-bold text-gray-900 w-32 shrink-0">{cat.category}</span>
                          <span className="text-gray-700">{cat.skills.join(', ')}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              ) : null;

            case 'certifications':
              return certifications && certifications.length > 0 ? (
                <section key="certifications">
                  <h2 className="text-lg font-bold text-gray-900 mb-3">Certifications</h2>
                  <div className="space-y-2">
                    {certifications.map((cert) => (
                      <div key={cert.id} className="flex justify-between items-baseline">
                        <span className="font-bold text-gray-900">{cert.name}</span>
                        <span className="text-sm text-gray-500">{cert.date}</span>
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
`;

const dirPath = 'c:/Users/JithenderS/OneDrive/Desktop/AI_Resume_Analyzer/src/components/templates/resume-templates';

templates.forEach(t => {
  fs.writeFileSync(path.join(dirPath, t + '.tsx'), templateContent(t));
});

console.log('Templates generated successfully!');
