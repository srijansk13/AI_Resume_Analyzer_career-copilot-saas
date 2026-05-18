import { ResumeData } from '@/models/EditorState';

export interface ATSChecklistItem {
  id: string;
  label: string;
  status: 'success' | 'warning' | 'error';
  scoreImpact: number;
  description: string;
}

export interface ATSScoreBreakdown {
  score: number;
  keywordScore: number;
  actionVerbScore: number;
  metricScore: number;
  structureScore: number;
  checklist: ATSChecklistItem[];
  matchedKeywords: string[];
  missingKeywords: string[];
}

// Comprehensive dictionary of common strong action verbs for resume checking
const STRONG_ACTION_VERBS = new Set([
  'led', 'designed', 'developed', 'spearheaded', 'optimized', 'managed', 'built', 
  'created', 'improved', 'reduced', 'increased', 'accelerated', 'implemented', 
  'architected', 'coordinated', 'established', 'formulated', 'generated', 'handled', 
  'launched', 'modernized', 'orchestrated', 'planned', 'resolved', 'supervised', 
  'trained', 'upgraded', 'delivered', 'expanded', 'directed', 'pioneered', 'secured',
  'streamlined', 'transformed', 'negotiated', 'maximized', 'cultivated', 'executed'
]);

export function calculateATSScore(content: ResumeData, keywordsData: any, originalScore?: number): ATSScoreBreakdown {
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

  // 2. KEYWORD MATCHING (40% Weight)
  const targetKeywordsSet = new Set<string>();
  
  // Extract keywords from analysis data
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

  // Fallback default keywords if none provided from original analysis
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
    // Exact word boundary or clean substring check
    const escapedKeyword = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`\\b${escapedKeyword}\\b`, 'i');
    if (regex.test(fullResumeText) || fullResumeText.includes(keyword)) {
      matchedKeywords.push(keyword);
    } else {
      missingKeywords.push(keyword);
    }
  });

  // non-linear keyword scaling
  const keywordCoverage = targetKeywordsSet.size > 0 ? (matchedKeywords.length / targetKeywordsSet.size) : 1;
  const keywordScore = Math.min(100, Math.round(Math.min(1.0, keywordCoverage * 2.2) * 100));

  if (keywordCoverage >= 0.4) {
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
      scoreImpact: -3,
      description: `Moderate skill alignment. Matched ${matchedKeywords.length} of ${targetKeywordsSet.size} keywords. Add missing skills like ${missingKeywords.slice(0, 3).join(', ')}.`
    });
  } else {
    checklist.push({
      id: 'keyword-density',
      label: 'Core Keyword Coverage',
      status: 'error',
      scoreImpact: -6,
      description: `Critical skill gaps. Matched only ${matchedKeywords.length} of ${targetKeywordsSet.size} keywords. Integrate major technical tags.`
    });
  }

  // 3. ACTION VERBS CHECK (20% Weight)
  const allBullets: string[] = [];
  content.experience.forEach(exp => {
    if (Array.isArray(exp.bullets)) allBullets.push(...exp.bullets);
  });
  content.projects.forEach(proj => {
    if (Array.isArray(proj.bullets)) allBullets.push(...proj.bullets);
  });

  let actionVerbCount = 0;
  allBullets.forEach(bullet => {
    const trimmed = bullet.trim();
    if (!trimmed) return;
    
    // Check first word of bullet point
    const firstWordMatch = trimmed.match(/^([a-zA-Z]+)/);
    if (firstWordMatch) {
      const firstWord = firstWordMatch[1].toLowerCase();
      if (STRONG_ACTION_VERBS.has(firstWord)) {
        actionVerbCount++;
      }
    }
  });

  const actionVerbRatio = allBullets.length > 0 ? (actionVerbCount / allBullets.length) : 0;
  const actionVerbScore = Math.min(100, Math.round(Math.min(actionVerbRatio * 2.5, 1) * 100)); 

  if (allBullets.length === 0) {
    checklist.push({
      id: 'action-verbs',
      label: 'Action-Oriented Bullets',
      status: 'error',
      scoreImpact: -5,
      description: 'Add work experiences or projects bullet points to showcase active accomplishments.'
    });
  } else if (actionVerbRatio >= 0.3) {
    checklist.push({
      id: 'action-verbs',
      label: 'Action-Oriented Bullets',
      status: 'success',
      scoreImpact: 0,
      description: `Great phrasing! ${actionVerbCount} of ${allBullets.length} bullets start with highly strong action verbs.`
    });
  } else {
    checklist.push({
      id: 'action-verbs',
      label: 'Action-Oriented Bullets',
      status: 'warning',
      scoreImpact: -2,
      description: `Only ${Math.round(actionVerbRatio * 100)}% of bullets start with action verbs. Replace passive wording with words like "Delivered", "Led", or "Spearheaded".`
    });
  }

  // 4. QUANTIFIABLE METRICS CHECK (20% Weight)
  let metricCount = 0;
  const metricRegex = /\b(?:\d+(?:\.\d+)?%|\$\d+(?:\s*(?:million|billion|thousand|k|K|m|M))?|\d+\s*\+\s*|\d+x|\d+\s*(?:users|clients|servers|projects|hours|dollars|leads|percent|employees))\b/i;

  allBullets.forEach(bullet => {
    if (metricRegex.test(bullet)) {
      metricCount++;
    }
  });

  const metricRatio = allBullets.length > 0 ? (metricCount / allBullets.length) : 0;
  const metricScore = Math.min(100, Math.round(Math.min(metricRatio * 3.5, 1) * 100)); 

  if (allBullets.length === 0) {
    checklist.push({
      id: 'quantified-metrics',
      label: 'Quantifiable Outcomes',
      status: 'error',
      scoreImpact: -5,
      description: 'Incorporate outcomes and measurable achievements in your accomplishments.'
    });
  } else if (metricRatio >= 0.2) {
    checklist.push({
      id: 'quantified-metrics',
      label: 'Quantifiable Outcomes',
      status: 'success',
      scoreImpact: 0,
      description: `Elite business impact! ${metricCount} of ${allBullets.length} bullets contain quantifiable, data-backed metrics.`
    });
  } else if (metricRatio >= 0.08) {
    checklist.push({
      id: 'quantified-metrics',
      label: 'Quantifiable Outcomes',
      status: 'warning',
      scoreImpact: -2,
      description: `Only ${metricCount} bullets contain data-backed metrics. Try to quantify at least 20% of bullets (e.g. revenue, load times, users).`
    });
  } else {
    checklist.push({
      id: 'quantified-metrics',
      label: 'Quantifiable Outcomes',
      status: 'error',
      scoreImpact: -4,
      description: 'Critical lack of metrics. Quantify achievements (percentages, time saved, budget saved) to impress recruiters.'
    });
  }

  // 5. STRUCTURE & COMPLETENESS (20% Weight)
  let structurePoints = 0;
  const missingCoreSections: string[] = [];

  // Check section presences
  if (content.summary && content.summary.trim().length > 10) {
    structurePoints += 20;
  } else {
    missingCoreSections.push('Summary');
  }

  if (content.experience && content.experience.length > 0) {
    structurePoints += 30;
  } else {
    missingCoreSections.push('Work Experience');
  }

  if (content.skills && (Array.isArray(content.skills) ? content.skills.length > 0 : Object.keys(content.skills).length > 0)) {
    structurePoints += 20;
  } else {
    missingCoreSections.push('Skills');
  }

  if (content.education && content.education.length > 0) {
    structurePoints += 20;
  } else {
    missingCoreSections.push('Education');
  }

  if (content.projects && content.projects.length > 0) {
    structurePoints += 10;
  }

  const structureScore = structurePoints;

  if (missingCoreSections.length === 0) {
    checklist.push({
      id: 'core-structure',
      label: 'Resume Structural Completeness',
      status: 'success',
      scoreImpact: 0,
      description: 'Excellent structure! All essential, mandatory ATS sections are populated.'
    });
  } else {
    checklist.push({
      id: 'core-structure',
      label: 'Resume Structural Completeness',
      status: 'error',
      scoreImpact: -5,
      description: `Missing standard core sections: ${missingCoreSections.join(', ')}. Complete these to avoid parser rejections.`
    });
  }

  // Check summary word count
  const summaryWordCount = content.summary ? content.summary.trim().split(/\s+/).length : 0;
  if (summaryWordCount > 0) {
    if (summaryWordCount >= 40 && summaryWordCount <= 200) {
      checklist.push({
        id: 'summary-length',
        label: 'Optimal Summary Length',
        status: 'success',
        scoreImpact: 0,
        description: `Perfect summary density (${summaryWordCount} words). Fits standard recruiter scanning patterns.`
      });
    } else {
      checklist.push({
        id: 'summary-length',
        label: 'Optimal Summary Length',
        status: 'warning',
        scoreImpact: -2,
        description: `Summary has ${summaryWordCount} words. Keep it within 40-200 words for readability.`
      });
    }
  }

  // Calculate overall weighted score
  const baseScore = (keywordScore * 0.4) + (actionVerbScore * 0.2) + (metricScore * 0.2) + (structureScore * 0.2);
  
  // Apply minor checklist impacts to prevent double penalty tanking
  let penaltyOffset = 0;
  checklist.forEach(item => {
    penaltyOffset += item.scoreImpact;
  });

  let finalScore = Math.max(10, Math.min(99, Math.round(baseScore + penaltyOffset)));

  // If we have an original score calibration baseline, ensure the score initializes high & remains realistic
  if (originalScore && originalScore > 10) {
    const baseline = Math.max(originalScore, 75);
    
    // Calculate a dynamic quality bonus based on content completeness & keyword matches
    const keywordBonus = Math.min(6, Math.round(keywordCoverage * 8));
    const verbBonus = Math.min(4, Math.round(actionVerbRatio * 6));
    const metricBonus = Math.min(4, Math.round(metricRatio * 6));
    const totalBonus = 1 + keywordBonus + verbBonus + metricBonus; // Max bonus is +15

    finalScore = Math.min(99, Math.max(finalScore, baseline + totalBonus));
  }

  return {
    score: finalScore,
    keywordScore,
    actionVerbScore,
    metricScore,
    structureScore,
    checklist,
    matchedKeywords,
    missingKeywords
  };
}
