import { ResumeData } from '@/models/EditorState';

export interface EditorAITrackingFlags {
  aiSummaryApplied: boolean;
  aiBulletsApplied: boolean;
  aiKeywordsApplied: boolean;
  aiSkillsApplied: boolean;
  aiProjectsApplied: boolean;
}

export interface ATSChecklistItem {
  id: string;
  label: string;
  status: 'success' | 'warning' | 'error';
  scoreImpact: number;
  description: string;
}

export interface EditorATSScoreBreakdown {
  score: number;
  keywordScore: number;
  actionVerbScore: number;
  metricScore: number;
  structureScore: number;
  checklist: ATSChecklistItem[];
  matchedKeywords: string[];
  missingKeywords: string[];
}

const STRONG_ACTION_VERBS = new Set([
  'led', 'designed', 'developed', 'spearheaded', 'optimized', 'managed', 'built', 
  'created', 'improved', 'reduced', 'increased', 'accelerated', 'implemented', 
  'architected', 'coordinated', 'established', 'formulated', 'generated', 'handled', 
  'launched', 'modernized', 'orchestrated', 'planned', 'resolved', 'supervised', 
  'trained', 'upgraded', 'delivered', 'expanded', 'directed', 'pioneered', 'secured',
  'streamlined', 'transformed', 'negotiated', 'maximized', 'cultivated', 'executed'
]);

export function calculateEditorATSScore(
  content: ResumeData, 
  keywordsData: any, 
  aiFlags: EditorAITrackingFlags,
  templateId: string = 'modern',
  originalAnalysisATS?: number
): EditorATSScoreBreakdown {
  const checklist: ATSChecklistItem[] = [];
  
  // 1. Gather all resume text for searching
  const summaryText = (content.summary || '').toLowerCase();
  
  const expTexts = content.experience.map(exp => 
    `${exp.role} ${exp.company} ${exp.location || ''} ${(exp.bullets || []).join(' ')}`
  ).join(' ').toLowerCase();

  const projTexts = content.projects.map(proj => 
    `${proj.name} ${proj.description || ''} ${(proj.bullets || []).join(' ')} ${(proj.technologies || []).join(' ')}`
  ).join(' ').toLowerCase();

  const eduTexts = content.education.map(edu => 
    `${edu.institution} ${edu.degree} ${edu.field || ''}`
  ).join(' ').toLowerCase();

  const rawSkills: string[] = [];
  if (Array.isArray(content.skills)) {
    content.skills.forEach(s => {
      if (typeof s === 'string') {
        rawSkills.push(s.toLowerCase());
      } else if (s && typeof s === 'object' && Array.isArray(s.skills)) {
        rawSkills.push(s.category.toLowerCase(), ...s.skills.map(sk => sk.toLowerCase()));
      }
    });
  }
  const skillsText = rawSkills.join(' ');

  const fullResumeText = `${content.personalInfo.fullName} ${content.personalInfo.title} ${summaryText} ${expTexts} ${projTexts} ${eduTexts} ${skillsText}`;

  // 2. KEYWORD DENSITY (25% Weight)
  const targetKeywordsSet = new Set<string>();
  
  if (keywordsData) {
    const detected = keywordsData.detected_skills || {};
    if (Array.isArray(detected.technical)) detected.technical.forEach((s: string) => targetKeywordsSet.add(s.toLowerCase()));
    if (Array.isArray(detected.tools)) detected.tools.forEach((s: string) => targetKeywordsSet.add(s.toLowerCase()));
    if (Array.isArray(detected.soft)) detected.soft.forEach((s: string) => targetKeywordsSet.add(s.toLowerCase()));

    const missing = keywordsData.missing_critical_skills || [];
    if (Array.isArray(missing)) {
      missing.forEach((item: any) => {
        if (typeof item === 'string') targetKeywordsSet.add(item.toLowerCase());
        else if (item && typeof item === 'object' && item.skill) targetKeywordsSet.add(item.skill.toLowerCase());
      });
    }

    const density = keywordsData.density || [];
    if (Array.isArray(density)) {
      density.forEach((item: any) => {
        if (item && item.keyword) targetKeywordsSet.add(item.keyword.toLowerCase());
      });
    }
  }

  if (targetKeywordsSet.size === 0) {
    const defaultTechKeywords = [
      'javascript', 'typescript', 'react', 'node.js', 'python', 'aws', 'docker', 'kubernetes',
      'git', 'ci/cd', 'agile', 'database', 'rest api', 'sql', 'system design', 'cloud'
    ];
    defaultTechKeywords.forEach(k => targetKeywordsSet.add(k));
  }

  const matchedKeywords: string[] = [];
  const missingKeywords: string[] = [];

  targetKeywordsSet.forEach(keyword => {
    const escapedKeyword = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`\\b${escapedKeyword}\\b`, 'i');
    if (regex.test(fullResumeText) || fullResumeText.includes(keyword)) {
      matchedKeywords.push(keyword);
    } else {
      missingKeywords.push(keyword);
    }
  });

  const keywordCoverage = targetKeywordsSet.size > 0 ? (matchedKeywords.length / targetKeywordsSet.size) : 1;
  const keywordScoreRaw = Math.min(100, Math.round(Math.min(1.0, keywordCoverage * 1.8) * 100));
  const keywordWeighted = keywordScoreRaw * 0.25; // 25% weight

  if (keywordCoverage >= 0.5) {
    checklist.push({
      id: 'keyword-density',
      label: 'Core Keyword Coverage',
      status: 'success',
      scoreImpact: 0,
      description: `Excellent skill density! Matched ${matchedKeywords.length} of ${targetKeywordsSet.size} core target keywords.`
    });
  } else if (keywordCoverage >= 0.2) {
    checklist.push({
      id: 'keyword-density',
      label: 'Core Keyword Coverage',
      status: 'warning',
      scoreImpact: -2,
      description: `Moderate skill alignment. Matched ${matchedKeywords.length} of ${targetKeywordsSet.size} keywords.`
    });
  }

  // 3. CONTENT QUALITY (25% Weight) - Combines Action Verbs & Metrics
  const allBullets: string[] = [];
  content.experience.forEach(exp => {
    if (Array.isArray(exp.bullets)) allBullets.push(...exp.bullets);
  });
  content.projects.forEach(proj => {
    if (Array.isArray(proj.bullets)) allBullets.push(...proj.bullets);
  });

  let actionVerbCount = 0;
  let metricCount = 0;
  const metricRegex = /\b(?:\d+(?:\.\d+)?%|\$\d+(?:\s*(?:million|billion|thousand|k|K|m|M))?|\d+\s*\+\s*|\d+x|\d+\s*(?:users|clients|servers|projects|hours|dollars|leads|percent|employees))\b/i;

  allBullets.forEach(bullet => {
    const trimmed = bullet.trim();
    if (!trimmed) return;
    
    if (metricRegex.test(trimmed)) {
      metricCount++;
    }

    const firstWordMatch = trimmed.match(/^([a-zA-Z]+)/);
    if (firstWordMatch) {
      const firstWord = firstWordMatch[1].toLowerCase();
      if (STRONG_ACTION_VERBS.has(firstWord)) {
        actionVerbCount++;
      }
    }
  });

  const actionVerbRatio = allBullets.length > 0 ? (actionVerbCount / allBullets.length) : 0;
  const metricRatio = allBullets.length > 0 ? (metricCount / allBullets.length) : 0;
  
  const contentQualityScoreRaw = Math.min(100, Math.round(((Math.min(actionVerbRatio * 2.5, 1) * 50) + (Math.min(metricRatio * 3.5, 1) * 50))));
  const contentQualityWeighted = contentQualityScoreRaw * 0.25; // 25% weight

  if (allBullets.length === 0) {
    checklist.push({
      id: 'content-quality',
      label: 'Content Quality',
      status: 'error',
      scoreImpact: -5,
      description: 'Add work experiences or projects bullet points to showcase active accomplishments.'
    });
  } else if (metricRatio >= 0.2 && actionVerbRatio >= 0.4) {
    checklist.push({
      id: 'content-quality',
      label: 'Content Quality',
      status: 'success',
      scoreImpact: 0,
      description: `Elite business impact! ${metricCount} quantified metrics and high action verb usage.`
    });
  }

  // 4. RESUME STRUCTURE & COMPLETENESS (20% Weight)
  let structurePoints = 0;
  const missingCoreSections: string[] = [];

  if (content.summary && content.summary.trim().length > 10) structurePoints += 20;
  else missingCoreSections.push('Summary');

  if (content.experience && content.experience.length > 0) structurePoints += 30;
  else missingCoreSections.push('Work Experience');

  if (content.skills && (Array.isArray(content.skills) ? content.skills.length > 0 : Object.keys(content.skills).length > 0)) structurePoints += 20;
  else missingCoreSections.push('Skills');

  if (content.education && content.education.length > 0) structurePoints += 20;
  else missingCoreSections.push('Education');

  if (content.projects && content.projects.length > 0) structurePoints += 10;
  
  if (content.personalInfo && content.personalInfo.contact && content.personalInfo.contact.email) structurePoints += 10;
  else missingCoreSections.push('Contact Info');

  const structureScoreRaw = Math.min(100, Math.round((structurePoints / 110) * 100));
  const structureWeighted = structureScoreRaw * 0.20; // 20% weight

  // 5. FORMATTING QUALITY (10% Weight)
  // Editor guarantees ATS-friendly structural HTML formatting out of the box, but we can penalize slightly for empty or weird fields.
  let formattingScoreRaw = 95; // Base high because our templates are ATS-safe
  if (missingCoreSections.length > 2) formattingScoreRaw -= 20; // Bad formatting if missing too much
  if (templateId === 'ats-classic') formattingScoreRaw = 100; // ATS Classic is the most parser friendly
  const formattingWeighted = formattingScoreRaw * 0.10; // 10% weight

  // 6. AI OPTIMIZATION STATUS (20% Weight)
  let aiOptimizationScoreRaw = 0;
  if (aiFlags.aiSummaryApplied) aiOptimizationScoreRaw += 35;
  if (aiFlags.aiBulletsApplied) aiOptimizationScoreRaw += 35;
  if (aiFlags.aiKeywordsApplied) aiOptimizationScoreRaw += 15;
  if (aiFlags.aiSkillsApplied) aiOptimizationScoreRaw += 10;
  if (aiFlags.aiProjectsApplied) aiOptimizationScoreRaw += 5;
  aiOptimizationScoreRaw = Math.min(100, aiOptimizationScoreRaw);
  
  const aiOptimizationWeighted = aiOptimizationScoreRaw * 0.20; // 20% weight

  // Calculate overall weighted score
  const baseScore = keywordWeighted + contentQualityWeighted + structureWeighted + formattingWeighted + aiOptimizationWeighted;
  
  // Apply minor checklist impacts
  let penaltyOffset = 0;
  checklist.forEach(item => {
    penaltyOffset += item.scoreImpact;
  });

  let finalScore = Math.round(baseScore + penaltyOffset);

  const hasAppliedAI = aiFlags.aiSummaryApplied || aiFlags.aiBulletsApplied || aiFlags.aiKeywordsApplied || aiFlags.aiSkillsApplied || aiFlags.aiProjectsApplied;

  if (originalAnalysisATS !== undefined) {
    const isCriticalContentRemoved = missingCoreSections.length >= 2 || allBullets.length === 0;

    if (isCriticalContentRemoved) {
      // If critical content is removed, let it drop naturally
      finalScore = Math.max(15, finalScore);
    } else {
      let entryBoost = 5;
      if (originalAnalysisATS >= 80) entryBoost = 4;
      if (originalAnalysisATS >= 88) entryBoost = 4;
      if (originalAnalysisATS >= 94) entryBoost = 2;
      if (originalAnalysisATS >= 96) entryBoost = 1;

      const baselineScore = originalAnalysisATS;
      
      // Calculate a raw score WITHOUT the AI optimization weight to represent the initial raw editor score
      const rawWithoutAI = Math.round(keywordWeighted + contentQualityWeighted + structureWeighted + formattingWeighted + penaltyOffset);
      
      const initialEditorScore = Math.max(baselineScore + entryBoost, rawWithoutAI);

      // Add AI improvements based on actual content changes beyond the initial editor score
      let aiBonus = 0;
      if (aiFlags.aiSummaryApplied) aiBonus += 2;
      if (aiFlags.aiBulletsApplied) aiBonus += 4;
      if (aiFlags.aiKeywordsApplied) aiBonus += 1;
      if (aiFlags.aiSkillsApplied) aiBonus += 1;
      if (aiFlags.aiProjectsApplied) aiBonus += 1;

      finalScore = initialEditorScore + aiBonus;

      // Never allow liveEditorScore < originalAnalysisATS unless critical content was removed
      finalScore = Math.max(originalAnalysisATS, finalScore);
    }
  }

  // Enforce Ceilings
  if (!hasAppliedAI) {
    finalScore = Math.min(95, finalScore);
  } else {
    finalScore = Math.min(98, finalScore);
  }

  // Baseline floor global
  finalScore = Math.max(15, finalScore);

  return {
    score: finalScore,
    keywordScore: keywordScoreRaw,
    actionVerbScore: actionVerbRatio * 100,
    metricScore: metricRatio * 100,
    structureScore: structureScoreRaw,
    checklist,
    matchedKeywords,
    missingKeywords
  };
}
