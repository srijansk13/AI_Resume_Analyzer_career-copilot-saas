/**
 * Validates parsed projects against uploaded resume source text.
 * No static title blocklists — only source-based verification.
 */

const TITLE_STOP_WORDS = new Set(['the', 'and', 'for', 'with', 'app', 'web', 'a', 'an', 'of', 'in', 'to']);

export function normalizeProjectTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function getProjectTitle(project: unknown): string {
  if (!project) return '';
  if (typeof project === 'string') return project.trim();
  const obj = project as Record<string, unknown>;
  return String(obj.name || obj.title || obj.projectName || '').trim();
}

export function getProjectDescriptionText(project: unknown): string {
  if (!project) return '';
  if (typeof project === 'string') return project.trim();

  const obj = project as Record<string, unknown>;
  const chunks: string[] = [];

  for (const key of ['description', 'summary', 'shortDescription']) {
    const val = obj[key];
    if (typeof val === 'string' && val.trim()) chunks.push(val.trim());
  }

  for (const key of ['bullets', 'highlights']) {
    const val = obj[key];
    if (Array.isArray(val)) {
      val.forEach((b) => {
        if (typeof b === 'string' && b.trim()) chunks.push(b.trim());
      });
    }
  }

  return chunks.join(' ').trim();
}

/**
 * Returns true when the project title (or its significant tokens) appears in resume text.
 */
export function projectTitleInResumeText(title: string, resumeText: string): boolean {
  const norm = normalizeProjectTitle(title);
  if (!norm || norm.length < 3) return false;

  const resumeNorm = resumeText.toLowerCase();
  if (resumeNorm.includes(norm)) return true;

  const words = norm
    .split(' ')
    .filter((w) => w.length >= 3 && !TITLE_STOP_WORDS.has(w));

  if (words.length === 0) return false;

  const matched = words.filter((w) => resumeNorm.includes(w));
  if (words.length === 1) return matched.length === 1;
  return matched.length >= Math.min(2, words.length);
}

/**
 * Description/bullet overlap against resume body (for titles with minor PDF extraction variance).
 */
export function projectDescriptionInResumeText(project: unknown, resumeText: string): boolean {
  const desc = getProjectDescriptionText(project);
  if (!desc || desc.length < 12) return false;

  const resumeNorm = resumeText.toLowerCase();
  const descWords = [
    ...new Set(
      desc
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, ' ')
        .split(/\s+/)
        .filter((w) => w.length >= 4 && !TITLE_STOP_WORDS.has(w))
    ),
  ].slice(0, 14);

  if (descWords.length === 0) return false;

  let matched = 0;
  for (const w of descWords) {
    if (resumeNorm.includes(w)) matched++;
  }

  return matched >= Math.max(3, Math.ceil(descWords.length * 0.35));
}

/**
 * A project is verified when its title or description strongly matches source resume text.
 */
export function isProjectVerifiedInResume(project: unknown, resumeText: string): boolean {
  const title = getProjectTitle(project);
  if (!title) return false;

  const text = resumeText.trim();
  if (text.length < 20) return true;

  if (projectTitleInResumeText(title, text)) return true;
  return projectDescriptionInResumeText(project, text);
}

/**
 * Filters out projects that cannot be verified against uploaded resume text.
 */
export function filterVerifiedParsedProjects(projects: unknown[], resumeText: string): unknown[] {
  if (!Array.isArray(projects)) return [];

  return projects.filter((p) => {
    const title = getProjectTitle(p);
    if (!title) return false;
    return isProjectVerifiedInResume(p, resumeText);
  });
}
