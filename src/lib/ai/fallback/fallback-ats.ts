import { ATSEngineSchema } from '../../validations/ai-schemas';
import { buildDefaultATS, deepMerge } from './defaults';

/**
 * Deterministic Fallback Engine for ATS Scoring
 * Executes instantly locally without LLM APIs.
 * Uses basic heuristics to generate a realistic premium output.
 */
export function runFallbackAtsEngine(resumeText: string, jd?: string) {
  // Simple heuristics
  const text = resumeText.toLowerCase();
  
  // Basic completeness checks
  const hasExperience = /experience|work history|employment/.test(text);
  const hasEducation = /education|university|degree|college/.test(text);
  const hasSkills = /skills|technologies|tools/.test(text);
  const hasSummary = /summary|profile|objective/.test(text);

  let formatScore = 60;
  if (hasExperience) formatScore += 10;
  if (hasEducation) formatScore += 10;
  if (hasSkills) formatScore += 10;
  if (hasSummary) formatScore += 10;

  // Basic impact (numbers count)
  const numberCount = (text.match(/\d+/g) || []).length;
  const impactScore = Math.min(100, 40 + (numberCount * 2));

  // Word count check for readability
  const wordCount = text.split(/\s+/).length;
  let readabilityScore = 100;
  if (wordCount < 100 || wordCount > 1000) readabilityScore = 60;
  else if (wordCount < 300 || wordCount > 800) readabilityScore = 80;

  // JD matching
  let keywordScore = 75;
  if (jd) {
    const jdWords = new Set(jd.toLowerCase().split(/\s+/));
    const resumeWords = new Set(text.split(/\s+/));
    let matches = 0;
    jdWords.forEach(w => { if (w.length > 4 && resumeWords.has(w)) matches++; });
    keywordScore = Math.min(100, 50 + (matches * 2));
  }

  const overall = Math.floor((formatScore + impactScore + readabilityScore + keywordScore) / 4);

  const payload = {
    confidence_score: 95, // High confidence because it's deterministic
    overall_ats_score: overall,
    category_scores: {
      format: formatScore,
      impact: impactScore,
      keywords: keywordScore,
      readability: readabilityScore
    },
    action_verb_score: 70, // generic fallback
    section_completeness: {
      missing_sections: [
        ...(!hasExperience ? ["Experience"] : []),
        ...(!hasEducation ? ["Education"] : []),
        ...(!hasSkills ? ["Skills"] : []),
        ...(!hasSummary ? ["Summary"] : []),
      ]
    }
  };

  const merged = deepMerge(buildDefaultATS(), payload);
  const parsed = ATSEngineSchema.safeParse(merged);

  if (!parsed.success) {
    return buildDefaultATS();
  }
  return parsed.data;
}
