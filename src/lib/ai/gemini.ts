import { GoogleGenerativeAI } from '@google/generative-ai';

// Backward compatibility: instantiate default genAI instance
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

const MODELS = [
  'gemini-2.5-flash',
  'gemini-2.5-flash-lite',
  'gemini-2.0-flash',
  'gemini-2.0-flash-001',
  'gemini-2.0-flash-lite',
  'gemini-2.0-flash-lite-001'
];

/**
 * Returns the effective model queue prioritizing environment variables if present,
 * maintaining backward compatibility.
 */
export function getModelsToUse(): string[] {
  const envModels = process.env.GEMINI_MODELS;
  if (envModels) {
    return envModels
      .split(',')
      .map(m => m.trim())
      .filter(m => m.length > 0);
  }
  return MODELS;
}

interface KeyRecord {
  key: string;
  cooldownUntil: number; // timestamp in ms
  status: 'available' | 'cooldown' | 'failed' | 'exhausted';
}

let keyRecords: KeyRecord[] | null = null;
const unavailableModels = new Set<string>();

/**
 * Parses configured API keys prioritizing GEMINI_API_KEYS over GEMINI_API_KEY,
 * maintaining persistent in-memory cooldown states.
 */
export function getGeminiKeys(): KeyRecord[] {
  if (keyRecords) {
    return keyRecords;
  }

  const keysEnv = process.env.GEMINI_API_KEYS;
  const singleKeyEnv = process.env.GEMINI_API_KEY;
  let parsedKeys: string[] = [];

  if (keysEnv && keysEnv.trim().length > 0) {
    const rawKeys = keysEnv.split(',');
    for (const rawKey of rawKeys) {
      let cleaned = rawKey.trim();
      // Remove accidental quotes
      cleaned = cleaned.replace(/['"]/g, '');
      // Remove newline characters
      cleaned = cleaned.replace(/[\r\n]/g, '');
      cleaned = cleaned.trim();
      if (cleaned.length > 0) {
        parsedKeys.push(cleaned);
      }
    }
    // Deduplicate exact duplicate keys
    parsedKeys = Array.from(new Set(parsedKeys));
  }

  // Fallback to GEMINI_API_KEY only if GEMINI_API_KEYS is empty (or yields 0 keys after robust parsing)
  if (parsedKeys.length === 0 && singleKeyEnv) {
    let cleaned = singleKeyEnv.trim();
    cleaned = cleaned.replace(/['"]/g, '');
    cleaned = cleaned.replace(/[\r\n]/g, '');
    cleaned = cleaned.trim();
    if (cleaned) {
      parsedKeys = [cleaned];
    }
  }

  keyRecords = parsedKeys.map(key => ({
    key,
    cooldownUntil: 0,
    status: 'available' as const
  }));

  console.log(`[Gemini Keys] Loaded key count: ${keyRecords.length}`);
  console.log(`[Gemini Keys] Using multi-key mode: ${keyRecords.length > 1}`);

  if (keysEnv && keysEnv.trim().length > 0) {
    const expectedCount = keysEnv.split(',').length;
    if (keyRecords.length < expectedCount) {
      console.warn(`[Gemini Keys] Warning: Only ${keyRecords.length} keys detected. Check GEMINI_API_KEYS formatting.`);
    }
  }

  return keyRecords;
}

let lastUsedKeyIndex = -1;

/**
 * Searches the parsed key array for the next key in round-robin sequence,
 * skipping keys currently in cooldown or tried in the active request,
 * and falling back to emergency reuse of the least recently used key if all are locked.
 */
export async function selectRoundRobinKey(
  triedIndexes: Set<number>,
  jobContext = '[AI]'
): Promise<{ record: KeyRecord; index: number; total: number } | null> {
  const records = getGeminiKeys();
  const total = records.length;
  if (total === 0) {
    return null;
  }

  const now = Date.now();

  // Update status dynamically
  for (let offset = 0; offset < total; offset++) {
    if (records[offset].cooldownUntil > now) {
      records[offset].status = 'cooldown';
    } else if (records[offset].status === 'cooldown' || records[offset].status === 'exhausted') {
      records[offset].status = 'available';
    }
  }
  
  // Start searching from the key index AFTER lastUsedKeyIndex
  const startSearchIndex = (lastUsedKeyIndex + 1) % total;

  // 1. Primary search: Find next available key that has no active cooldown AND has not been tried in this request
  for (let offset = 0; offset < total; offset++) {
    const i = (startSearchIndex + offset) % total;
    
    if (records[i].cooldownUntil > now) {
      console.log(`${jobContext} [Gemini Key] Skipping key index ${i + 1}/${total} due to cooldown`);
      continue;
    }
    
    if (triedIndexes.has(i)) {
      continue;
    }

    // Found off-cooldown untried key!
    lastUsedKeyIndex = i;
    console.log(`${jobContext} [Gemini Key] Round-robin selected key index: ${i + 1}/${total}`);
    return { record: records[i], index: i, total };
  }

  // 2. Cooldown Emergency Fallback: If ALL keys are on cooldown and none can be selected off-cooldown,
  // find any key that hasn't been tried yet in this request.
  // We prioritize the key with the oldest (least) cooldownUntil value to preserve LRU-based emergency reuse.
  let oldestIndex = -1;
  let minCooldown = Infinity;

  for (let offset = 0; offset < total; offset++) {
    const i = (startSearchIndex + offset) % total;
    if (!triedIndexes.has(i)) {
      if (records[i].cooldownUntil < minCooldown) {
        minCooldown = records[i].cooldownUntil;
        oldestIndex = i;
      }
    }
  }

  if (oldestIndex !== -1) {
    const timeLeft = minCooldown - Date.now();
    if (timeLeft > 0) {
      console.log(`${jobContext} [Gemini Key] All keys cooling down. Least remaining cooldown: ${Math.round(timeLeft / 1000)}s`);
      if (timeLeft <= 10000) {
        console.log(`${jobContext} [Gemini Key] Waiting briefly for ${Math.round(timeLeft / 1000)}s until key index ${oldestIndex + 1}/${total} cools down naturally...`);
        await new Promise(resolve => setTimeout(resolve, timeLeft));
        // Reset cooldown index and reuse it normally!
        records[oldestIndex].cooldownUntil = 0;
        lastUsedKeyIndex = oldestIndex;
        console.log(`${jobContext} [Gemini Key] Round-robin selected key index: ${oldestIndex + 1}/${total}`);
        return { record: records[oldestIndex], index: oldestIndex, total };
      } else {
        // More than 10 seconds. Do not emergency reuse! Throw a clear error.
        console.log(`${jobContext} [Gemini Key] Remaining cooldown time (${Math.round(timeLeft / 1000)}s) exceeds 10s brief wait threshold. Failing gracefully.`);
        throw new Error(`All API keys are temporarily cooling down. Please wait ${Math.round(timeLeft / 1000)} seconds and try again.`);
      }
    }
    
    lastUsedKeyIndex = oldestIndex;
    console.log(`${jobContext} [Gemini Key] Round-robin selected key index: ${oldestIndex + 1}/${total} (emergency reuse of index ${oldestIndex + 1}/${total})`);
    return { record: records[oldestIndex], index: oldestIndex, total };
  }

  // 3. Fully exhausted for this specific request
  for (let offset = 0; offset < total; offset++) {
    records[offset].status = 'exhausted';
  }
  return null;
}

/**
 * Helper to set a key in soft cooldown after use or rotatable failure.
 */
function setKeyCooldown(record: KeyRecord, index: number, jobContext = '[AI]') {
  const records = getGeminiKeys();
  const total = records.length;
  const cooldownMs = Number(process.env.GEMINI_KEY_COOLDOWN_MS) || 90000;
  record.cooldownUntil = Date.now() + cooldownMs;
  record.status = 'cooldown';
  console.log(`${jobContext} [Gemini Key] Key index ${index + 1}/${total} cooling down until: ${new Date(record.cooldownUntil).toISOString()}`);
}

/**
 * Returns true if the exception represents a timeout or standard key rotatable error.
 */
function isCooldownEligibleError(err: any): boolean {
  if (!err) return false;
  const msg = (err.message || '').toLowerCase();
  if (msg.includes('timeout')) return true;
  return isKeyRotatableError(err);
}


/**
 * Returns true if the model error indicates a quota limits rate limit 0 or quotaValue 0.
 */
function isZeroQuotaModelError(err: any): boolean {
  if (!err) return false;
  const msg = (err.message || '').toLowerCase();
  
  return (
    (msg.includes('quota') || msg.includes('limit')) && 
    (
      msg.includes(' 0') || 
      msg.includes(':0') || 
      msg.includes(' 0.0') || 
      msg.includes('value 0') || 
      msg.includes('value: 0') ||
      msg.includes('limit 0') ||
      msg.includes('limit: 0') ||
      msg.includes('quota 0') ||
      msg.includes('quota: 0') ||
      msg.includes('limit is 0') ||
      msg.includes('quota is 0')
    )
  );
}

/**
 * Returns true only if the exception represents a quota exhaust, rate limit,
 * or temporary provider overloaded state.
 */
function isKeyRotatableError(err: any): boolean {
  if (!err) return false;
  
  const msg = (err.message || '').toLowerCase();
  const status = err.status || (err.response && err.response.status);
  
  // 429 represents Resource Exhausted / Rate Limit
  if (status === 429) {
    return true;
  }

  // 401 represents invalid credentials (unauthorized) - do NOT rotate for 401 in production
  if (status === 401 || status === 503) {
    return false;
  }
  
  const targetPhrases = [
    'quota',
    'rate limit',
    'resource_exhausted',
    'exhausted',
    '429',
    'rate_limit'
  ];

  // Exclude 503 and high demand explicitly to prevent key cooldowns
  const excludePhrases = ['503', 'high demand', 'overloaded', 'service unavailable'];
  if (excludePhrases.some(phrase => msg.includes(phrase))) {
    return false;
  }
  
  return targetPhrases.some(phrase => msg.includes(phrase));
}

/**
 * Advanced lexical bracket scanner balancing structurally active braces
 * while securely skipping double-quoted text sections and escape backslashes.
 */
function getMatchingBraceIndex(text: string, firstBraceIndex: number): number {
  let braceCount = 0;
  let inString = false;
  let escapeActive = false;

  for (let i = firstBraceIndex; i < text.length; i++) {
    const char = text[i];

    if (escapeActive) {
      escapeActive = false;
      continue;
    }

    if (char === '\\') {
      escapeActive = true;
      continue;
    }

    if (char === '"') {
      inString = !inString;
      continue;
    }

    if (!inString) {
      if (char === '{') {
        braceCount++;
      } else if (char === '}') {
        braceCount--;
        if (braceCount === 0) {
          return i;
        }
      }
    }
  }

  return -1;
}

/**
 * Aggressive parsing engine cleaning bad control symbols, curly quotes,
 * trailing commas, and escaped raw string newlines inside block segments.
 */
function parseSingleLooseJSON(str: string): any | null {
  try {
    let clean = str.trim();
    clean = clean.replace(/```(?:json)?/gi, '');
    clean = clean.replace(/,\s*([}\]])/g, '$1');
    clean = clean.replace(/[\x00-\x1F\x7F-\x9F]/g, ""); 
    clean = clean.replace(/[\u201C\u201D\u201E\u201F\u2033\u2036]/g, '"');
    
    return JSON.parse(clean);
  } catch (e) {
    try {
      let clean = str.trim()
        .replace(/```(?:json)?/gi, '')
        .replace(/,\s*([}\]])/g, '$1')
        .replace(/[\x00-\x1F\x7F-\x9F]/g, "")
        .replace(/[\u201C\u201D\u201E\u201F\u2033\u2036]/g, '"');
      
      // Escape raw newlines inside multiline string properties
      clean = clean.replace(/(:\s*"[^"]*)\n([^"]*")/g, '$1\\n$2');
      return JSON.parse(clean);
    } catch (innerErr) {
      return null;
    }
  }
}

/**
 * Brace-balanced structural block extractor targeting key analysis modules individually.
 */
export function salvageJSONBlocks(text: string): { data: any; salvagedBlocks: string[] } {
  const blocks = ["parsedData", "ats", "recruiter", "roadmap", "keywords", "optimization", "wow"];
  const salvaged: any = {};
  const salvagedBlocks: string[] = [];

  for (const block of blocks) {
    const regex = new RegExp(`"${block}"\\s*:\\s*`, 'i');
    const match = text.match(regex);
    if (!match || match.index === undefined) continue;

    const startSearchIndex = match.index + match[0].length;
    const firstBrace = text.indexOf('{', startSearchIndex);
    if (firstBrace === -1) continue;

    const endBrace = getMatchingBraceIndex(text, firstBrace);
    if (endBrace !== -1) {
      const blockStr = text.substring(firstBrace, endBrace + 1);
      const parsedBlock = parseSingleLooseJSON(blockStr);
      if (parsedBlock) {
        salvaged[block] = parsedBlock;
        salvagedBlocks.push(block);
      }
    }
  }

  return { data: salvaged, salvagedBlocks };
}

/**
 * Clean extract parser optimizing raw AI strings and falling back to block-by-block salvaging
 */
export function extractJSON(text: string): { 
  data: any | null; 
  raw: string; 
  salvaged?: boolean; 
  salvagedBlocks?: string[]; 
} {
  const raw = text;
  
  // Clean logs requirements
  const firstBrace = text.indexOf('{');
  const lastBrace = text.lastIndexOf('}');
  console.log(`[AI JSON] Raw chars: ${text.length}`);
  console.log(`[AI JSON] First brace index: ${firstBrace}`);
  console.log(`[AI JSON] Last brace index: ${lastBrace}`);

  if (firstBrace === -1 || lastBrace === -1 || lastBrace < firstBrace) {
    console.log(`[AI JSON] Clean parse success: false`);
    console.log(`[AI JSON] Falling back reason: No bracket pairs found.`);
    return { data: null, raw };
  }

  // 1. Try clean JSON.parse of full substring first (No aggressive repair if it's already pristine)
  const cleanText = text.substring(firstBrace, lastBrace + 1).trim();
  try {
    const parsed = JSON.parse(cleanText);
    console.log(`[AI JSON] Clean parse success: true`);
    return { data: parsed, raw };
  } catch (e) {
    // Normal clean parse failed, start progressive loose cleanups
    try {
      const repairCleanText = cleanText
        .replace(/```(?:json)?/gi, '')
        .replace(/,\s*([}\]])/g, '$1')
        .replace(/[\x00-\x1F\x7F-\x9F]/g, "")
        .replace(/[\u201C\u201D\u201E\u201F\u2033\u2036]/g, '"');
      const parsed = JSON.parse(repairCleanText);
      console.log(`[AI JSON] Clean parse success: true (after loose trailing commas & controls cleaning)`);
      return { data: parsed, raw };
    } catch (cleanErr) {
      try {
        const newlineRepaired = cleanText
          .replace(/```(?:json)?/gi, '')
          .replace(/,\s*([}\]])/g, '$1')
          .replace(/[\x00-\x1F\x7F-\x9F]/g, "")
          .replace(/[\u201C\u201D\u201E\u201F\u2033\u2036]/g, '"')
          .replace(/(:\s*"[^"]*)\n([^"]*")/g, '$1\\n$2');
        const parsed = JSON.parse(newlineRepaired);
        console.log(`[AI JSON] Clean parse success: true (after raw newlines escaping)`);
        return { data: parsed, raw };
      } catch (newlineErr) {
        console.log(`[AI JSON] Clean parse success: false`);
      }
    }

    // 2. Fall back to block-by-block structural salvage
    console.log(`[AI JSON] Loose full parse failed. Attempting block-by-block salvage...`);
    const { data: salvagedData, salvagedBlocks } = salvageJSONBlocks(text);
    console.log(`[AI JSON] Salvaged blocks:`, salvagedBlocks);

    if (salvagedBlocks.length > 0) {
      return { 
        data: salvagedData, 
        raw, 
        salvaged: true, 
        salvagedBlocks 
      };
    }

    console.log(`[AI JSON] Falling back reason: No structural JSON blocks could be parsed or salvaged.`);
    return { data: null, raw };
  }
}

export async function callGeminiWaterfall(
  prompt: string, 
  preferredModel?: string,
  jobContext?: string
): Promise<{ 
  data: any | null; 
  rawText: string; 
  model: string;
  salvaged?: boolean;
  salvagedBlocks?: string[];
}> {
  // Automatically generate a 4-char short random jobId for logging tracing if context is missing
  const jobId = Math.random().toString(36).substring(7);
  const ctx = jobContext || `[Job: ${jobId}]`;
  
  const baseModels = getModelsToUse();
  // Reorder queue dynamically prioritizing preferredModel if present
  let modelsToTry = preferredModel && baseModels.includes(preferredModel)
    ? [preferredModel, ...baseModels.filter(m => m !== preferredModel)]
    : baseModels;

  modelsToTry = ["gemini-2.5-flash", "gemini-2.5-flash-lite"];

  console.log(`${ctx} [Gemini Model] Effective models: ${modelsToTry.join(', ')}`);

  for (const modelName of modelsToTry) {
    if (modelName === 'gemini-2.5-flash') {
      console.log(`[Gemini Model] Trying primary model: ${modelName}`);
    }

    // If this model is globally skipped for the current session, bypass it immediately
    if (unavailableModels.has(modelName)) {
      console.log(`${ctx} [Gemini Model] Skipping unavailable model: ${modelName}`);
      continue;
    }

    let timeoutMs = 30000;
    if (modelName === 'gemini-2.5-flash-lite') {
      timeoutMs = 60000;
    } else if (modelName.includes('lite')) {
      timeoutMs = 25000;
    } else if (modelName === 'gemini-2.5-flash') {
      timeoutMs = 45000;
    }

    const triedKeyIndexes = new Set<number>();

    while (true) {
      const activeKeyInfo = await selectRoundRobinKey(triedKeyIndexes, ctx);
      if (!activeKeyInfo) {
        console.log(`${ctx} [Gemini Key] All keys cooling/down or failed: tried all keys`);
        break; // proceed to next model in the waterfall
      }

      const { record, index, total } = activeKeyInfo;

      // If we have already tried some keys, this is "trying the next available key"
      if (triedKeyIndexes.size > 0) {
        console.log(`${ctx} [Gemini Key] Trying next available key: ${index + 1}/${total}`);
      }

      triedKeyIndexes.add(index);

      try {
        console.log(`${ctx} [AI] Attempting generation with model: ${modelName} (Timeout: ${timeoutMs}ms)`);
        
        // Dynamically instantiate the GoogleGenerativeAI client with the selected key
        const genAIInstance = new GoogleGenerativeAI(record.key);
        const model = genAIInstance.getGenerativeModel({
          model: modelName,
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.4,
            topP: 0.9,
            topK: 32,
            maxOutputTokens: 16384,
          },
        });

        const result = await Promise.race([
          model.generateContent(prompt),
          new Promise<never>((_, reject) => setTimeout(() => reject(new Error('TIMEOUT')), timeoutMs))
        ]);

        const text = result.response.text();
        const extracted = extractJSON(text);
        
        // Execution successfully completed! Return result immediately after setting cooldown
        setKeyCooldown(record, index, ctx);

        return { 
          data: extracted.data, 
          rawText: extracted.raw, 
          model: modelName,
          salvaged: extracted.salvaged,
          salvagedBlocks: extracted.salvagedBlocks
        };

      } catch (error: any) {
        console.warn(`${ctx} [AI] Model ${modelName} failed with key index ${index + 1}/${total}: ${error.message}`);
        
        const msg = (error.message || '').toLowerCase();
        const status = error.status || (error.response && error.response.status);
        const isHighDemand = status === 503 || msg.includes('503') || msg.includes('high demand') || msg.includes('overloaded') || msg.includes('service unavailable');
        
        if (isHighDemand) {
          if (modelName === 'gemini-2.5-flash') {
            console.log(`[Gemini Model] Primary model high demand detected`);
            console.log(`[Gemini Model] Switching to fallback model: gemini-2.5-flash-lite`);
          } else {
            console.log(`${ctx} [Gemini Model] Model ${modelName} high demand detected`);
          }
          break; // Stop rotating keys for this model, go to next model in the waterfall
        }

        const isEligible = isCooldownEligibleError(error);
        if (isEligible) {
          setKeyCooldown(record, index, ctx);
        }

        // Check if this error indicates a zero-quota model state (limit 0 or quotaValue 0 or rate limit 0)
        if (isZeroQuotaModelError(error)) {
          console.warn(`${ctx} [Gemini Model] Model ${modelName} returned zero quota limit error. Marking as unavailable.`);
          unavailableModels.add(modelName);
          console.log(`${ctx} [Gemini Model] Marked unavailable: ${modelName}`);
          break; // Stop rotating keys for this model immediately and go to the next model in the waterfall
        }

        if (isEligible) {
          // Re-loop inside while(true) to try next available key record
          continue;
        } else {
          // Do NOT rotate for prompt errors, validation schema errors, app bugs, or custom non-rotatable errors
          throw error;
        }
      }
    }
  }

  console.log(`${ctx} [Gemini Final] All usable Gemini models failed or keys exhausted: ${modelsToTry.join(', ')}`);
  throw new Error("ALL_KEYS_EXHAUSTED");
}
