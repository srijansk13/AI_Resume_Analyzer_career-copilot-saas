export type BulletApplyMatch = 'exact' | 'partial' | 'sentence' | 'none';

export function normalizeBulletText(text: string): string {
  return text.toLowerCase().trim().replace(/\s+/g, ' ');
}

function tokenize(norm: string): string[] {
  return norm.split(' ').filter((w) => w.length > 2);
}

function wordOverlapCount(a: string[], b: string[]): number {
  if (a.length === 0 || b.length === 0) return 0;
  const setB = new Set(b);
  return a.filter((w) => setB.has(w)).length;
}

function splitIntoSentences(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+|\n+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function joinSentences(sentences: string[]): string {
  return sentences.join(' ');
}

function tryReplaceInBulletArray(
  bullets: string[],
  originalText: string,
  optimizedText: string
): BulletApplyMatch {
  const origNorm = normalizeBulletText(originalText);
  const optNorm = normalizeBulletText(optimizedText);
  if (!origNorm || !optimizedText.trim()) return 'none';

  for (let i = 0; i < bullets.length; i++) {
    const bNorm = normalizeBulletText(bullets[i] || '');
    if ((origNorm && bNorm === origNorm) || bNorm === optNorm) {
      bullets[i] = optimizedText;
      console.log('[AI Enhance Apply] Exact match found');
      return 'exact';
    }
  }

  if (origNorm.length >= 10) {
    for (let i = 0; i < bullets.length; i++) {
      const current = bullets[i] || '';
      const bNorm = normalizeBulletText(current);
      if (!bNorm.includes(origNorm)) continue;

      const lower = current.toLowerCase();
      const startIdx = lower.indexOf(origNorm);
      if (startIdx === -1) continue;

      bullets[i] =
        current.slice(0, startIdx) + optimizedText + current.slice(startIdx + origNorm.length);
      console.log('[AI Enhance Apply] Partial match found');
      return 'partial';
    }
  }

  const origWords = tokenize(origNorm);
  if (origWords.length >= 3) {
    const minOverlap = Math.max(3, Math.ceil(origWords.length * 0.55));

    for (let i = 0; i < bullets.length; i++) {
      const current = bullets[i] || '';
      const sentences = splitIntoSentences(current);
      if (sentences.length < 2) continue;

      let bestIdx = -1;
      let bestOverlap = 0;

      sentences.forEach((sentence, si) => {
        const overlap = wordOverlapCount(origWords, tokenize(normalizeBulletText(sentence)));
        if (overlap > bestOverlap) {
          bestOverlap = overlap;
          bestIdx = si;
        }
      });

      if (bestIdx >= 0 && bestOverlap >= minOverlap) {
        sentences[bestIdx] = optimizedText;
        bullets[i] = joinSentences(sentences);
        console.log('[AI Enhance Apply] Sentence match found');
        return 'sentence';
      }
    }
  }

  console.log('[AI Enhance Apply] No safe match found');
  return 'none';
}

export function applyBulletOptimizationToContent(
  content: { experience?: { bullets?: string[] }[]; projects?: { bullets?: string[] }[] },
  originalText: string | undefined,
  optimizedText: string
): BulletApplyMatch {
  if (!optimizedText?.trim()) return 'none';

  for (const exp of content.experience || []) {
    if (!exp?.bullets) continue;
    const match = tryReplaceInBulletArray(exp.bullets, originalText || '', optimizedText);
    if (match !== 'none') return match;
  }

  for (const proj of content.projects || []) {
    if (!proj?.bullets) continue;
    const match = tryReplaceInBulletArray(proj.bullets, originalText || '', optimizedText);
    if (match !== 'none') return match;
  }

  return 'none';
}
