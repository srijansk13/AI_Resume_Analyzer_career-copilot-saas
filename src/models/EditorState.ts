export interface ResumeContact {
  email?: string;
  phone?: string;
  location?: string;
  linkedin?: string;
  github?: string;
  website?: string;
}

export interface ResumeExperience {
  id: string;
  company: string;
  role: string;
  startDate: string;
  endDate: string;
  location?: string;
  bullets: string[];
}

export interface ResumeEducation {
  id: string;
  institution: string;
  degree: string;
  field?: string;
  startDate?: string;
  endDate?: string;
  gpa?: string;
  bullets?: string[];
}

export interface ResumeProject {
  id: string;
  name: string;
  description?: string;
  technologies?: string[];
  link?: string;
  bullets: string[];
}

export interface ResumeSkillCategory {
  category: string;
  skills: string[];
}

export interface ResumeData {
  personalInfo: {
    fullName: string;
    title: string;
    contact: ResumeContact;
  };
  summary: string;
  experience: ResumeExperience[];
  education: ResumeEducation[];
  projects: ResumeProject[];
  skills: string[] | ResumeSkillCategory[];
  certifications?: { id: string; name: string; issuer: string; date: string }[];
  achievements?: { id: string; title: string; date?: string; description?: string }[];
  awards?: { id: string; title: string; issuer?: string; date?: string; description?: string }[];
  publications?: { id: string; title: string; publisher?: string; date?: string; link?: string; description?: string }[];
  leadership?: { id: string; role: string; organization: string; startDate?: string; endDate?: string; description?: string; bullets?: string[] }[];
}

export interface EditorState {
  analysisId: string;
  resumeId: string;
  templateId: string;
  theme: {
    fontFamily: string; // Body font
    headingFont: string; // Heading font
    fontSize: string;
    headingSize: string;
    primaryColor: string;
    accentColor: string;
    textColor: string;
    backgroundColor: string;
    spacing: string; // Spacing density
    lineHeight: string;
    pageMargin: string;
    sectionSpacing: string;
    layout: string;
  };
  content: ResumeData;
  visibleSections: {
    summary: boolean;
    experience: boolean;
    education: boolean;
    projects: boolean;
    skills: boolean;
    certifications: boolean;
    achievements?: boolean;
    awards?: boolean;
    publications?: boolean;
    leadership?: boolean;
  };
  sectionOrder: string[]; // e.g. ['summary', 'experience', 'projects', 'education', 'skills']
  lastSavedAt: number;
}
