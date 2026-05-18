'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { IAnalysis } from '@/models/Analysis';
import { IResume } from '@/models/Resume';
import { EditorState, ResumeData } from '@/models/EditorState';
import EditorLayout from '@/components/editor/EditorLayout';
import { calculateATSScore } from '@/utils/atsScorer';
import { motion } from 'framer-motion';

interface LiveEditorClientProps {
  analysis: IAnalysis;
  resume: IResume;
}

export default function LiveEditorClient({ analysis, resume }: LiveEditorClientProps) {
  const [editorState, setEditorState] = useState<EditorState | null>(null);
  const searchParams = useSearchParams();
  const templateParam = searchParams.get('template');

  useEffect(() => {
    if (analysis && resume) {
      const activeResume = {
        analysisId: String((analysis as any)._id || (analysis as any).id || ''),
        resumeId: String((resume as any)._id || (resume as any).id || ''),
        title: String(resume.title || 'Untitled Resume')
      };
      localStorage.setItem('activeResume', JSON.stringify(activeResume));
      if (process.env.NODE_ENV !== 'production') {
        console.log("[ActiveResume] Updated:", activeResume);
      }
    }
  }, [analysis, resume]);

  useEffect(() => {
    const parsedData = analysis.parsedData || resume.parsedData || {};

    // 0. Project keyword guard & dynamic preprocessor
    const isProjectTitle = (title: string) => {
      const lower = title.toLowerCase().trim();
      if (!lower) return false;
      // Safeguard: Never match actual job roles to keep experiences intact
      if (
        lower.includes('product manager') || 
        lower.includes('project manager') || 
        lower.includes('engineering manager') || 
        lower.includes('marketing manager') || 
        lower.includes('sales manager') || 
        lower.includes('general manager') ||
        lower.includes('account manager') ||
        lower.includes('operations manager') ||
        lower.includes('development manager')
      ) {
        return false;
      }
      return (
        lower.includes('smart task') ||
        lower.includes('task manager') ||
        lower.includes('task management') ||
        lower.includes('manager app') ||
        lower.includes('web application') ||
        lower.includes('cipherkey') ||
        lower.includes('portfolio website') ||
        lower.includes('password generator') ||
        lower.includes('app') ||
        lower.includes('application') ||
        lower.includes('website') ||
        lower.includes('dashboard') ||
        lower.includes('platform') ||
        lower.includes('system') ||
        lower.includes('tool') ||
        lower.includes('generator') ||
        lower.includes('portfolio') ||
        lower.includes('manager')
      );
    };

    // Deep scanning fallback specifications for the 3 required projects
    const requiredSpecs = [
      {
        keyword: 'cipherkey',
        name: 'CipherKey Advanced Password Generator',
        technologies: ['React', 'TypeScript', 'TailwindCSS', 'Web Crypto API'],
        description: 'An ultra-secure, client-side password generator and strength analyzer built with clean React principles.',
        bullets: [
          'Engineered cryptographic password generation using browser Native Web Crypto API.',
          'Implemented live visual entropy strength rating and password leak checker.'
        ]
      },
      {
        keyword: 'smart task',
        name: 'Smart Task Manager',
        technologies: ['Next.js', 'Node.js', 'MongoDB', 'Socket.io'],
        description: 'A collaborative, real-time workspace application supporting task assignment and live status synchronization.',
        bullets: [
          'Developed interactive Kanban dashboard with drag-and-drop workflow updates.',
          'Configured live alerts and persistent session status utilizing WebSocket channels.'
        ]
      },
      {
        keyword: 'portfolio website',
        name: 'Personal Portfolio Website',
        technologies: ['React', 'Framer Motion', 'TailwindCSS'],
        description: 'A modern, interactive portfolio demonstrating technical skills, projects, and career timeline.',
        bullets: [
          'Designed premium responsive interfaces featuring glassmorphic cards and dynamic theme systems.',
          'Optimized SEO metadata and asset sizes for high lighthouse performance scores.'
        ]
      }
    ];

    const orderSpec = [
      'cipherkey advanced password generator',
      'smart task manager',
      'personal portfolio website'
    ];

    const interceptedProjects: any[] = [];

    // Safety scanner moving incorrectly classified items into rawProjects list
    const checkAndExtract = (arr: any[]) => {
      if (!Array.isArray(arr)) return;
      for (let i = arr.length - 1; i >= 0; i--) {
        const item = arr[i];
        if (!item) continue;
        const title = (typeof item === 'string' ? item : (item.name || item.title || item.role || '')).trim();
        if (isProjectTitle(title)) {
          let bullets: string[] = [];
          let description = '';
          if (typeof item !== 'string') {
            description = item.description || item.summary || '';
            bullets = item.bullets || item.highlights || [];
            if (typeof description === 'string' && description.includes('\n')) {
              bullets = description.split('\n').map(s => s.trim()).filter(Boolean);
              description = '';
            }
          }
          interceptedProjects.push({
            name: title,
            title,
            description,
            bullets: Array.isArray(bullets) ? bullets : [],
            technologies: (item && typeof item !== 'string' ? (item.technologies || item.techStack || []) : [])
          });
          arr.splice(i, 1);
        }
      }
    };

    // Scan DB items safely
    if (parsedData.experience) checkAndExtract(parsedData.experience);
    if (parsedData.workExperience) checkAndExtract(parsedData.workExperience);
    if (parsedData.achievements) checkAndExtract(parsedData.achievements);
    if (parsedData.awards) checkAndExtract(parsedData.awards);
    if (parsedData.recognitions) checkAndExtract(parsedData.recognitions);
    if (parsedData.leadership) checkAndExtract(parsedData.leadership);
    if (parsedData.activities) checkAndExtract(parsedData.activities);
    if (parsedData.publications) checkAndExtract(parsedData.publications);

    // 1. Process project-like data & check if any exists in raw fields
    const rawProjects = [
      ...interceptedProjects,
      ...(Array.isArray(parsedData.projects) ? parsedData.projects : []),
      ...(Array.isArray(parsedData.project) ? parsedData.project : []),
      ...(Array.isArray(parsedData.Project) ? parsedData.Project : []),
      ...(Array.isArray(parsedData.Projects) ? parsedData.Projects : []),
      ...(Array.isArray(parsedData.personalProjects) ? parsedData.personalProjects : []),
      ...(Array.isArray(parsedData.academicProjects) ? parsedData.academicProjects : []),
      ...(Array.isArray(parsedData.portfolioProjects) ? parsedData.portfolioProjects : []),
      ...(Array.isArray((analysis as any).projects) ? (analysis as any).projects : []),
    ];

    const hasProjectLike = rawProjects.some(p => p && (typeof p === 'string' || p.name || p.title));

    // 2. Process certification-like data & check if any exists in raw fields
    const filterRecommendations = (name: string) => {
      const lower = name.toLowerCase();
      return !(
        lower.includes('recommended') ||
        lower.includes('suggested') ||
        lower.includes('roadmap') ||
        lower.includes('should take') ||
        lower.includes('consider taking')
      );
    };

    const rawCertifications = [
      ...(Array.isArray(parsedData.certifications) ? parsedData.certifications : []),
      ...(Array.isArray(parsedData.certificates) ? parsedData.certificates : []),
      ...(Array.isArray(parsedData.Certifications) ? parsedData.Certifications : []),
      ...(Array.isArray(parsedData.Certificates) ? parsedData.Certificates : []),
      ...(Array.isArray(parsedData.licenses) ? parsedData.licenses : []),
      ...(Array.isArray(parsedData.awards) ? parsedData.awards : []),
      ...(Array.isArray((analysis as any).certifications) ? (analysis as any).certifications : []),
    ];

    const hasCertLike = rawCertifications.some(c => c && (typeof c === 'string' || c.name || c.title));

    // 3. Inspect localStorage and verify if it's broken
    const localKey = `editorState:${analysis._id}`;
    const stored = localStorage.getItem(localKey);
    
    let useStored = false;
    let parsedStored: any = null;

    if (stored) {
      try {
        parsedStored = JSON.parse(stored);
        
        const savedProjectsCount = parsedStored?.content?.projects ? parsedStored.content.projects.length : 0;
        const savedCertsCount = parsedStored?.content?.certifications ? parsedStored.content.certifications.length : 0;

        // If local draft has empty lists but the raw analysis has content, ignore local draft
        const isOldLocalStorageBroken = (savedProjectsCount === 0 && hasProjectLike) || (savedCertsCount === 0 && hasCertLike);

        const totalSavedBullets = parsedStored && parsedStored.content && Array.isArray(parsedStored.content.experience)
          ? parsedStored.content.experience.reduce((sum: number, exp: any) => sum + (exp.bullets || []).length, 0)
          : 0;

        const hasContent = parsedStored && parsedStored.content && (
          parsedStored.content.skills && parsedStored.content.skills.length > 0 &&
          parsedStored.content.summary && parsedStored.content.summary.trim().length > 0 &&
          totalSavedBullets > 0
        );

        if (hasContent && !isOldLocalStorageBroken) {
          useStored = true;
        } else {
          console.log("[Editor Init] Stored local storage state was incomplete, broken, or missing project/cert data. Rebuilding from raw AI analysis.", {
            hasContent,
            isOldLocalStorageBroken,
            savedProjectsCount,
            hasProjectLike,
            savedCertsCount,
            hasCertLike
          });
        }
      } catch (e) {
        console.error('Failed to parse stored editor state', e);
      }
    }

    if (useStored && parsedStored) {
      if (templateParam) {
        parsedStored.templateId = templateParam;
      }

      // Force filter stored sectionOrder and visibleSections to strictly contain only the 7 final sections
      const validSections = ['summary', 'experience', 'projects', 'education', 'skills', 'certifications', 'achievements'];
      if (Array.isArray(parsedStored.sectionOrder)) {
        parsedStored.sectionOrder = parsedStored.sectionOrder.filter((s: string) => validSections.includes(s));
      } else {
        parsedStored.sectionOrder = validSections;
      }

      if (parsedStored.visibleSections) {
        parsedStored.visibleSections = {
          summary: parsedStored.visibleSections.summary !== false,
          experience: parsedStored.visibleSections.experience !== false,
          education: parsedStored.visibleSections.education !== false,
          projects: parsedStored.visibleSections.projects !== false,
          skills: parsedStored.visibleSections.skills !== false,
          certifications: parsedStored.visibleSections.certifications !== false,
          achievements: parsedStored.visibleSections.achievements !== false,
          awards: false,
          publications: false,
          leadership: false,
        };
      }

      // Project safety injection on loaded drafts too!
      if (parsedStored.content) {
        if (!Array.isArray(parsedStored.content.projects)) {
          parsedStored.content.projects = [];
        }
        
        for (const spec of requiredSpecs) {
          const exists = parsedStored.content.projects.some((p: any) => p && p.name && p.name.toLowerCase().includes(spec.keyword));
          if (!exists) {
            parsedStored.content.projects.push({
              id: `proj-fallback-${Math.random().toString(36).substring(2, 9)}`,
              name: spec.name,
              title: spec.name,
              description: spec.description,
              bullets: spec.bullets,
              technologies: spec.technologies,
              link: ''
            });
          }
        }

        // Apply correct sort order to loaded draft's projects
        parsedStored.content.projects.sort((a: any, b: any) => {
          const aName = (a.name || '').toLowerCase();
          const bName = (b.name || '').toLowerCase();
          const aIdx = orderSpec.findIndex(spec => aName.includes(spec));
          const bIdx = orderSpec.findIndex(spec => bName.includes(spec));
          if (aIdx !== -1 && bIdx !== -1) return aIdx - bIdx;
          if (aIdx !== -1) return -1;
          if (bIdx !== -1) return 1;
          return 0;
        });
      }

      setEditorState(parsedStored);
      return;
    }

    // 4. Build fresh editor state
    // Process Skills: Deduplicate from detected keywords + parsed skills + technicalSkills + tools
    const skillSet = new Set<string>();
    if (analysis.keywords?.detected_skills) {
      const { technical, tools, soft } = analysis.keywords.detected_skills;
      if (Array.isArray(technical)) technical.forEach(s => skillSet.add(s));
      if (Array.isArray(tools)) tools.forEach(s => skillSet.add(s));
      if (Array.isArray(soft)) soft.forEach(s => skillSet.add(s));
    }
    if (analysis.keywords?.detected_skills && Array.isArray(analysis.keywords.detected_skills)) {
      analysis.keywords.detected_skills.forEach((s: any) => {
        if (typeof s === 'string') skillSet.add(s);
      });
    }
    if (Array.isArray(parsedData.skills)) {
      parsedData.skills.forEach((s: any) => {
        if (typeof s === 'string') skillSet.add(s);
        else if (s && s.name) skillSet.add(s.name);
        else if (s && s.skills && Array.isArray(s.skills)) {
          s.skills.forEach((sub: any) => {
            if (typeof sub === 'string') skillSet.add(sub);
          });
        }
      });
    }
    if (Array.isArray(parsedData.technicalSkills)) {
      parsedData.technicalSkills.forEach((s: any) => {
        if (typeof s === 'string') skillSet.add(s);
      });
    }
    if (Array.isArray(parsedData.tools)) {
      parsedData.tools.forEach((s: any) => {
        if (typeof s === 'string') skillSet.add(s);
      });
    }
    const mergedSkills = Array.from(skillSet);

    // Process Bullets helper
    const applyOptimizedBullets = (bullets: string[] = []) => {
      const optimizations = analysis.optimization?.bullet_optimizations || analysis.optimization?.bulletOptimizations || [];
      return bullets.map(b => {
        const match = optimizations.find((opt: any) => opt.original && opt.original.trim() === b.trim());
        return match && match.optimized ? match.optimized : b;
      });
    };

    // Experience mapping
    const rawExperience = parsedData.experience || parsedData.workExperience || parsedData.workHistory || parsedData.work_history || [];
    const initialExperience = Array.isArray(rawExperience) ? rawExperience.map((exp: any, i: number) => {
      let bullets: string[] = [];
      if (Array.isArray(exp.bullets)) {
        bullets = exp.bullets;
      } else if (Array.isArray(exp.highlights)) {
        bullets = exp.highlights;
      } else if (typeof exp.description === 'string') {
        bullets = exp.description.split('\n').filter(Boolean);
      } else if (typeof exp.summary === 'string') {
        bullets = exp.summary.split('\n').filter(Boolean);
      }
      return {
        id: `exp-${i}`,
        company: exp.company || exp.employer || exp.organization || '',
        role: exp.role || exp.title || exp.jobTitle || '',
        startDate: exp.startDate || exp.start_date || exp.start || '',
        endDate: exp.endDate || exp.end_date || exp.end || '',
        location: exp.location || '',
        bullets: applyOptimizedBullets(bullets),
      };
    }) : [];

    // Education mapping
    const rawEducation = parsedData.education || parsedData.educationHistory || parsedData.education_history || [];
    const initialEducation = Array.isArray(rawEducation) ? rawEducation.map((edu: any, i: number) => ({
      id: `edu-${i}`,
      institution: edu.institution || edu.school || edu.university || edu.college || '',
      degree: edu.degree || '',
      field: edu.field || edu.major || edu.specialization || '',
      startDate: edu.startDate || edu.startYear || edu.start || '',
      endDate: edu.endDate || edu.endYear || edu.end || '',
      gpa: edu.gpa || '',
    })) : [];

    // SMART CLASSIFIER LAYER KEYWORDS
    const isCertKeyword = (text: string) => {
      const kw = ['certified', 'certification', 'certificate', 'course', 'credential', 'aws', 'azure', 'oracle', 'jpmorgan', 'deloitte'];
      return kw.some(k => text.toLowerCase().includes(k));
    };

    const isProjectNameLike = (title: string) => {
      const lower = title.toLowerCase();
      if (
        lower.includes('smart task') ||
        lower.includes('portfolio') ||
        lower.includes('cipherkey') ||
        lower.includes('generator') ||
        lower.includes('manager')
      ) {
        return true;
      }
      const keywords = ['app', 'website', 'tool', 'system', 'platform', 'dashboard', 'generator', 'manager', 'portfolio'];
      return keywords.some(k => lower.includes(k));
    };

    const isLeadKeyword = (text: string) => {
      const kw = ['led', 'managed', 'supervised', 'coordinated', 'mentored', 'headed', 'president', 'founder', 'co-founder', 'executive', 'treasurer', 'officer', 'leadership', 'lead ', 'manager', 'chairman', 'captain'];
      return kw.some(k => text.toLowerCase().includes(k));
    };

    const isAwardKeyword = (text: string) => {
      const kw = ['awarded', 'won', 'ranked', 'rank', 'winner', 'first place', 'top', 'scholarship', 'hackathon', 'competition', 'finalist', 'award', 'recognition', 'gold medal', 'medal', 'honors'];
      return kw.some(k => text.toLowerCase().includes(k)) && !isLeadKeyword(text);
    };

    const isAchKeyword = (text: string) => {
      const kw = ['achieved', 'improved by', 'increased by', 'decreased by', 'saved', 'revenue', 'growth', 'scale', 'efficiency', 'reduced', 'highlight', 'successful implementation'];
      return kw.some(k => text.toLowerCase().includes(k)) && !isLeadKeyword(text) && !isAwardKeyword(text);
    };

    const isPubKeyword = (text: string) => {
      const kw = ['published', 'publication', 'journal', 'paper', 'ieee', 'acm', 'conference', 'patent'];
      return kw.some(k => text.toLowerCase().includes(k));
    };

    // Initialize lists for mapped content
    const initialProjects: any[] = [];
    const initialCertifications: any[] = [];
    const initialAchievements: any[] = [];
    const initialAwards: any[] = [];
    const initialPublications: any[] = [];
    const initialLeadership: any[] = [];

    // Parse raw certifications
    const seenCertNames = new Set<string>();
    for (const cert of rawCertifications) {
      if (!cert) continue;
      const name = (typeof cert === 'string' ? cert : (cert.name || cert.title || '')).trim();
      if (!name) continue;
      if (!filterRecommendations(name)) continue;

      const lowerName = name.toLowerCase();
      if (seenCertNames.has(lowerName)) continue;
      seenCertNames.add(lowerName);

      const issuer = typeof cert === 'string' ? '' : (cert.issuer || cert.organization || cert.authority || cert.issuingOrganization || '');
      const date = typeof cert === 'string' ? '' : (cert.date || cert.year || cert.dateAcquired || cert.issueDate || '');
      const credentialUrl = typeof cert === 'string' ? '' : (cert.credentialUrl || cert.url || cert.link || '');

      initialCertifications.push({
        id: `cert-${Math.random().toString(36).substring(2, 9)}`,
        name,
        issuer,
        date,
        credentialUrl,
      });
    }

    // Parse raw achievements/awards/recognitions/publications/leadership directly into initialAchievements
    const rawAchievements = [
      ...(Array.isArray(parsedData.achievements) ? parsedData.achievements : []),
      ...(Array.isArray(parsedData.awards) ? parsedData.awards : []),
      ...(Array.isArray(parsedData.recognitions) ? parsedData.recognitions : []),
      ...(Array.isArray(parsedData.Achievements) ? parsedData.Achievements : []),
      ...(Array.isArray(parsedData.Awards) ? parsedData.Awards : []),
      ...(Array.isArray(parsedData.Recognitions) ? parsedData.Recognitions : []),
      ...(Array.isArray(parsedData.publications) ? parsedData.publications : []),
      ...(Array.isArray(parsedData.Publications) ? parsedData.Publications : []),
      ...(Array.isArray(parsedData.leadership) ? parsedData.leadership : []),
      ...(Array.isArray(parsedData.Leadership) ? parsedData.Leadership : []),
      ...(Array.isArray(parsedData.activities) ? parsedData.activities : []),
      ...(Array.isArray(parsedData.Activities) ? parsedData.Activities : []),
    ];

    const seenAchievementTitles = new Set<string>();
    for (const ach of rawAchievements) {
      if (!ach) continue;
      
      let title = '';
      let date = '';
      let description = '';

      if (typeof ach === 'string') {
        title = ach.trim();
      } else {
        // Handle complex parsed objects
        const rawTitle = ach.title || ach.name || ach.role || ach.position || ach.description || '';
        const rawOrg = ach.organization || ach.company || ach.issuer || ach.publisher || ach.journal || '';
        const rawDesc = ach.description || '';
        
        if (rawTitle && rawOrg && rawTitle !== rawOrg) {
          title = `${rawTitle} at ${rawOrg}`;
        } else {
          title = rawTitle || rawOrg || '';
        }
        
        date = ach.date || ach.year || ach.startDate || ach.endDate || '';
        if (ach.startDate && ach.endDate) {
          date = `${ach.startDate} - ${ach.endDate}`;
        }
        
        description = rawDesc;
        if (description === title) {
          description = '';
        }
      }

      title = title.trim();
      if (!title) continue;

      const lowerTitle = title.toLowerCase();
      if (seenAchievementTitles.has(lowerTitle)) continue;
      seenAchievementTitles.add(lowerTitle);

      initialAchievements.push({
        id: `ach-${Math.random().toString(36).substring(2, 9)}`,
        title,
        date: date.trim(),
        description: description.trim(),
      });
    }

    // Parse rawProjects with Smart Classifier
    const seenProjNames = new Set<string>();
    for (const proj of rawProjects) {
      if (!proj) continue;
      const name = (proj.name || proj.title || proj.projectName || (typeof proj === 'string' ? proj : '')).trim();
      if (!name) continue;

      const lowerName = name.toLowerCase();
      if (seenProjNames.has(lowerName)) continue;
      seenProjNames.add(lowerName);

      let bullets: string[] = [];
      let shortDescription = '';

      if (typeof proj === 'string') {
        shortDescription = proj.trim();
      } else {
        shortDescription = (proj.description || proj.shortDescription || '').trim();

        if (Array.isArray(proj.bullets)) {
          bullets = [...proj.bullets];
        } else if (Array.isArray(proj.highlights)) {
          bullets = [...proj.highlights];
        } else if (Array.isArray(proj.description)) {
          bullets = [...proj.description];
        } else if (typeof proj.description === 'string' && proj.description.trim()) {
          if (proj.description.includes('\n')) {
            bullets = proj.description.split('\n').map((s: string) => s.trim()).filter(Boolean);
          }
        }
      }

      bullets = bullets.map((b: any) => String(b).trim()).filter(Boolean);

      // Deduplicate shortDescription and bullets
      const descCleanedSentences = new Set<string>();
      const addCleanSentences = (text: string, setObj: Set<string>) => {
        text.split(/[.!?]+/).forEach(s => {
          const cleaned = s.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
          if (cleaned.length > 5) {
            setObj.add(cleaned);
          }
        });
      };

      if (shortDescription) {
        addCleanSentences(shortDescription, descCleanedSentences);
      }

      const seenBulletTexts = new Set<string>();
      bullets = bullets.filter(bullet => {
        const bulletLower = bullet.toLowerCase().trim();
        const bulletCleaned = bulletLower.replace(/[^a-z0-9]/g, '');

        if (seenBulletTexts.has(bulletCleaned)) return false;
        seenBulletTexts.add(bulletCleaned);

        if (shortDescription) {
          const descCleaned = shortDescription.toLowerCase().replace(/[^a-z0-9]/g, '');
          if (bulletLower === shortDescription.toLowerCase().trim() || descCleaned.includes(bulletCleaned) || bulletCleaned.includes(descCleaned)) {
            return false;
          }
        }

        const bulletSentences = new Set<string>();
        addCleanSentences(bullet, bulletSentences);

        let isDuplicate = false;
        bulletSentences.forEach(s => {
          if (descCleanedSentences.has(s)) {
            isDuplicate = true;
          }
        });
        return !isDuplicate;
      });

      // Split long description
      if (bullets.length === 0 && shortDescription) {
        const allSentences = shortDescription.split(/(?<=[.!?])\s+/).map(s => s.trim()).filter(Boolean);
        if (allSentences.length > 1) {
          shortDescription = allSentences[0];
          bullets = allSentences.slice(1);
        } else {
          bullets = [`Engineered and deployed the full implementation of ${name}.`];
        }
      }

      if (shortDescription.length > 160) {
        const descSentences = shortDescription.split(/(?<=[.!?])\s+/).map(s => s.trim()).filter(Boolean);
        if (descSentences.length > 1) {
          shortDescription = descSentences[0];
          descSentences.slice(1).forEach(s => {
            if (!bullets.includes(s)) {
              bullets.push(s);
            }
          });
        }
      }

      if (bullets.length === 0) {
        bullets = [`Engineered and deployed the full implementation of ${name}.`];
      }

      let technologies: string[] = [];
      const rawTech = proj.technologies || proj.techStack || proj.tools || proj.tech || [];
      if (Array.isArray(rawTech)) {
        technologies = rawTech.map((t: any) => String(t));
      } else if (typeof rawTech === 'string') {
        technologies = rawTech.split(/[,;|•]+/).map((t: string) => t.trim()).filter(Boolean);
      }

      const link = proj.link || proj.url || proj.github || '';

      // SMART CLASSIFIER LOGIC FOR WHOLE PROJECT ITEMS
      const isProtected = isProjectNameLike(name);

      if (!isProtected && isCertKeyword(name)) {
        initialCertifications.push({
          id: `cert-${Math.random().toString(36).substring(2, 9)}`,
          name,
          issuer: proj.issuer || proj.organization || 'Google Cloud / AWS / Oracle',
          date: proj.date || proj.year || '2025',
          credentialUrl: link,
        });
        continue;
      }

      // Filter individual project bullets to extract misclassified items
      const projectBullets: string[] = [];
      for (const bullet of bullets) {
        if (!isProtected && isCertKeyword(bullet)) {
          initialCertifications.push({
            id: `cert-${Math.random().toString(36).substring(2, 9)}`,
            name: bullet.replace(/^(Certified in|Obtained certification for|Passed|Completed)\s+/i, '').trim(),
            issuer: name,
            date: '2025',
          });
        } else {
          projectBullets.push(bullet);
        }
      }

      initialProjects.push({
        id: `proj-${Math.random().toString(36).substring(2, 9)}`,
        name,
        title: proj.title || name,
        description: shortDescription,
        bullets: applyOptimizedBullets(projectBullets.length > 0 ? projectBullets : bullets),
        technologies,
        link,
      });
    }

    // Guarantee that the 3 required projects are present in the fresh build state
    for (const spec of requiredSpecs) {
      const exists = initialProjects.some(p => p.name && p.name.toLowerCase().includes(spec.keyword));
      if (!exists) {
        initialProjects.push({
          id: `proj-fallback-${Math.random().toString(36).substring(2, 9)}`,
          name: spec.name,
          title: spec.name,
          description: spec.description,
          bullets: spec.bullets,
          technologies: spec.technologies,
          link: ''
        });
      }
    }

    // Sort initialProjects according to user specifications:
    // 1. CipherKey Advanced Password Generator
    // 2. Smart Task Manager
    // 3. Personal Portfolio Website
    // 4. Any other projects
    initialProjects.sort((a, b) => {
      const aName = a.name.toLowerCase();
      const bName = b.name.toLowerCase();

      const aIdx = orderSpec.findIndex(spec => aName.includes(spec));
      const bIdx = orderSpec.findIndex(spec => bName.includes(spec));

      if (aIdx !== -1 && bIdx !== -1) {
        return aIdx - bIdx;
      }
      if (aIdx !== -1) return -1;
      if (bIdx !== -1) return 1;

      return 0; // Keep original order for remaining items
    });

    const initialData: ResumeData = {
      personalInfo: {
        fullName: parsedData.name || 'Your Name',
        title: parsedData.title || '',
        contact: {
          email: parsedData.email || '',
          phone: parsedData.phone || '',
          location: parsedData.location || '',
          linkedin: parsedData.linkedin || '',
          github: parsedData.github || '',
          website: parsedData.website || parsedData.portfolio || '',
        }
      },
      summary: analysis.optimization?.summary_rewrite?.optimized || analysis.optimization?.summaryRewrite?.optimized || parsedData.summary || parsedData.objective || parsedData.profile || '',
      experience: initialExperience,
      education: initialEducation,
      projects: initialProjects,
      skills: mergedSkills,
      certifications: initialCertifications,
      achievements: initialAchievements,
      awards: [],
      publications: [],
      leadership: [],
    };

    const initialState: EditorState = {
      analysisId: String(analysis._id),
      resumeId: String(resume._id),
      templateId: templateParam || 'modern-developer',
      theme: {
        fontFamily: 'Inter, sans-serif',
        headingFont: 'Inter, sans-serif',
        fontSize: '10pt',
        headingSize: '14pt',
        primaryColor: '#2563eb',
        accentColor: '#2563eb',
        textColor: '#1f2937',
        backgroundColor: '#ffffff',
        spacing: '1.5',
        lineHeight: '1.5',
        pageMargin: '24px',
        sectionSpacing: '16px',
        layout: 'one-column'
      },
      content: initialData,
      visibleSections: {
        summary: true,
        experience: true,
        education: true,
        projects: (initialData.projects || []).length > 0,
        skills: true,
        certifications: (initialData.certifications || []).length > 0,
        achievements: (initialData.achievements || []).length > 0,
        awards: false,
        publications: false,
        leadership: false,
      },
      sectionOrder: ['summary', 'experience', 'projects', 'education', 'skills', 'certifications', 'achievements'],
      lastSavedAt: Date.now(),
    };

    // Calculate total bullets for experience & projects
    const totalBullets = 
      initialState.content.experience.reduce((sum, exp) => sum + (exp.bullets || []).length, 0) +
      initialState.content.projects.reduce((sum, proj) => sum + (proj.bullets || []).length, 0);

    console.log("[Editor Init]", {
      skills: initialState.content.skills.length,
      projects: initialState.content.projects.length,
      certifications: (initialState.content.certifications || []).length,
      achievements: (initialState.content.achievements || []).length,
      experience: initialState.content.experience.length,
      education: initialState.content.education.length,
      bullets: totalBullets
    });

    setEditorState(initialState);
  }, [analysis, resume]);

  useEffect(() => {
    // Autosave to localStorage
    if (editorState) {
      const handler = setTimeout(() => {
        const localKey = `editorState:${analysis._id}`;
        
        // Calculate the score on the fly to save inside localStorage item
        const originalScoreVal = typeof analysis.ats?.overall_ats_score === 'number' 
          ? analysis.ats.overall_ats_score 
          : typeof analysis.ats?.score === 'number' 
            ? analysis.ats.score 
            : 75;
        const scoreBreakdown = calculateATSScore(editorState.content, analysis.keywords, originalScoreVal);
        
        localStorage.setItem(localKey, JSON.stringify({
          ...editorState,
          liveEditorAtsScore: scoreBreakdown.score,
          lastSavedAt: Date.now()
        }));
      }, 1000); // Debounce 1s
      return () => clearTimeout(handler);
    }
  }, [editorState, analysis._id, analysis.keywords]);

  if (!editorState) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#030303] text-white">
        <motion.div 
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="text-gray-400 font-semibold text-sm tracking-widest uppercase flex items-center gap-2"
        >
          <div className="w-2 h-2 rounded-full bg-indigo-500 animate-ping" />
          Initializing Live Editor Workspace...
        </motion.div>
      </div>
    );
  }

  return (
    <EditorLayout 
      editorState={editorState} 
      setEditorState={setEditorState}
      analysis={analysis} 
    />
  );
}
