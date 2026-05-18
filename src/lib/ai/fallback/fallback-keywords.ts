import { KeywordEngineSchema } from '../../validations/ai-schemas';
import { buildDefaultKeywords, deepMerge } from './defaults';

/**
 * Deterministic Fallback Engine for Keywords
 */
export function runFallbackKeywordEngine(resumeText: string, jd?: string) {
  const text = resumeText.toLowerCase();
  
  // Basic predefined dictionary
  const techDictionary = ['react', 'node', 'javascript', 'typescript', 'python', 'java', 'sql', 'aws', 'docker', 'kubernetes', 'html', 'css', 'next.js', 'express', 'mongodb', 'postgresql'];
  const softDictionary = ['leadership', 'communication', 'management', 'teamwork', 'agile', 'scrum', 'collaboration', 'problem solving'];
  const toolsDictionary = ['git', 'jira', 'figma', 'slack', 'trello', 'github', 'gitlab', 'vscode'];

  const extractSkills = (dict: string[]) => {
    return dict.filter(skill => text.includes(skill));
  };

  const detectedTech = extractSkills(techDictionary);
  const detectedSoft = extractSkills(softDictionary);
  const detectedTools = extractSkills(toolsDictionary);

  // Fake density map based on matches
  const density = [...detectedTech, ...detectedSoft].map(keyword => {
    const regex = new RegExp(keyword, 'g');
    const count = (text.match(regex) || []).length;
    return {
      keyword,
      count,
      is_optimal: count > 1 && count < 6
    };
  }).slice(0, 10);

  const payload = {
    confidence_score: 90,
    density,
    detected_skills: {
      technical: detectedTech,
      soft: detectedSoft,
      tools: detectedTools
    },
    missing_critical_skills: [], // Too hard to safely guess deterministically without JD map
    overused_buzzwords: extractSkills(['synergy', 'ninja', 'rockstar', 'guru']),
    semantic_clusters: [
      { category: "Extracted Knowledge", skills: detectedTech }
    ]
  };

  const merged = deepMerge(buildDefaultKeywords(), payload);
  const parsed = KeywordEngineSchema.safeParse(merged);

  if (!parsed.success) {
    return buildDefaultKeywords();
  }
  return parsed.data;
}
