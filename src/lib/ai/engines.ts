import { callGeminiWaterfall } from './gemini';
import { 
  ATSEngineSchema, 
  RecruiterEngineSchema, 
  RoadmapEngineSchema, 
  KeywordEngineSchema, 
  WowEngineSchema,
  OptimizationEngineSchema,
  CoreExtractionSchema
} from '../validations/ai-schemas';

async function runAIEngine(engineName: string, prompt: string, schema: any) {
  console.log(`[AI][${engineName}] Gemini called: true`);
  let res;
  try {
    res = await callGeminiWaterfall(prompt);
  } catch (error) {
    throw error;
  }

  const validation = schema.safeParse(res);
  
  if (validation.success) {
    console.log(`[AI][${engineName}] Response chars: ${JSON.stringify(res).length}`);
    console.log(`[AI][${engineName}] Source: gemini`);
    return validation.data;
  }

  console.log(`[AI][${engineName}] Validation failed. Attempting schema repair...`);
  const repairPrompt = prompt + `\n\nCRITICAL SYSTEM INSTRUCTION: Your previous response was invalid or failed strict JSON schema validation. You MUST return ONLY a valid JSON object matching the exact structure requested. Do not include markdown formatting or extra text. Fix these specific errors:\n${validation.error.message}`;
  
  const repairRes = await callGeminiWaterfall(repairPrompt);
  const repairValidation = schema.safeParse(repairRes);
  
  if (repairValidation.success) {
    console.log(`[AI][${engineName}] Response chars: ${JSON.stringify(repairRes).length}`);
    console.log(`[AI][${engineName}] Source: gemini (repaired)`);
    return repairValidation.data;
  }
  
  console.error(`[AI][${engineName}] Final repair failed. Throwing to fallback.`);
  throw new Error("SCHEMA_VALIDATION_FAILED");
}

export async function runAtsEngine(resumeText: string, jd?: string) {
  const prompt = `
    You are an elite Senior ATS Consultant and Parsing Architect. 
    Evaluate this resume specifically against modern Applicant Tracking Systems (Workday, Taleo, Greenhouse).
    Do not use generic feedback. You MUST reference exact bullet points, exact missing dates, or specific layout issues found in the resume text.
    ${jd ? `Target Job Description: ${jd}` : ''}
    
    Resume Text:
    ${resumeText}
    
    Return a STRICT JSON response adhering exactly to this structure:
    {
      "confidence_score": 90,
      "overall_ats_score": 75,
      "category_scores": { "readability": 80, "format": 70, "impact": 60, "keywords": 85 },
      "section_completeness": { "summary": true, "experience": true, "education": true, "skills": true },
      "formatting_issues": [
        { "issue": "Missing months in dates for Project X", "explainability_node": { "reasoning": "...", "impact": "...", "fix_strategy": "..." } }
      ],
      "action_verb_score": 60,
      "measurable_impact_score": 40
    }
  `;
  return runAIEngine('ATS', prompt, ATSEngineSchema);
}

export async function runRecruiterEngine(resumeText: string, jd?: string) {
  const prompt = `
    You are a Senior Executive Technical Recruiter at a top-tier FAANG company.
    Evaluate this candidate's resume deeply. Provide rich, highly personalized commentary.
    DO NOT provide generic templates like "Improve skills" or "Add numbers." 
    Instead, specifically name the exact projects, exact tools (e.g. React, Node.js, AWS), and exact career timeline gaps or strengths present in the text.
    ${jd ? `Target Job Description: ${jd}` : ''}
    
    Resume Text:
    ${resumeText}
    
    Return a STRICT JSON response adhering exactly to this structure:
    {
      "confidence_score": 85,
      "impression_score": 60,
      "hiring_probability": "Moderate",
      "top_strengths": ["e.g. Architected highly available AWS infrastructure in recent role", "Strong CS fundamentals from top university"],
      "hiring_manager_concerns": [
        { "concern": "e.g. Short tenure at Company X", "explainability_node": { "reasoning": "...", "impact": "...", "fix_strategy": "..." } }
      ],
      "rejection_risk_analysis": { "risk_level": "High", "primary_reason": "..." },
      "competitive_percentile": 60
    }
  `;
  return runAIEngine('Recruiter', prompt, RecruiterEngineSchema);
}

export async function runRoadmapEngine(resumeText: string, jd?: string) {
  const prompt = `
    You are an elite Career Strategist and Technical Coach.
    Based strictly on the exact skills and experience level shown in the resume, generate a personalized, actionable 90-day roadmap.
    Name specific frameworks, exact certification names, or specific architectural patterns the candidate is missing based on their current tech stack.
    ${jd ? `Target Job Description: ${jd}` : ''}
    
    Resume Text:
    ${resumeText}
    
    Return a STRICT JSON response adhering exactly to this structure:
    {
      "confidence_score": 80,
      "timeline": { "days_30": ["..."], "days_60": ["..."], "days_90": ["..."] },
      "role_transition": { "current_level": "...", "next_logical_role": "...", "estimated_salary_impact": "..." },
      "skill_dependencies": [
        { "skill": "React", "depends_on": ["JavaScript", "HTML"], "roi_score": 9 }
      ]
    }
  `;
  return runAIEngine('Roadmap', prompt, RoadmapEngineSchema);
}

export async function runKeywordEngine(resumeText: string, jd?: string) {
  const prompt = `
    You are an advanced Semantic ATS Engine.
    Analyze the exact keywords, tools, and methodologies in this resume. Look for missing contextual tools (e.g. if they have React, do they have Redux or Next.js?).
    ${jd ? `Target Job Description: ${jd}` : ''}
    
    Resume Text:
    ${resumeText}
    
    Return a STRICT JSON response adhering exactly to this structure:
    {
      "confidence_score": 90,
      "density": [{ "keyword": "React", "count": 5, "is_optimal": true }],
      "detected_skills": { "technical": ["React", "Node"], "soft": ["Leadership"], "tools": ["Git", "Jira"] },
      "missing_critical_skills": [
        { "skill": "TypeScript", "explainability_node": { "reasoning": "...", "impact": "...", "fix_strategy": "..." } }
      ],
      "overused_buzzwords": ["Team player", "Hard worker"],
      "semantic_clusters": [{ "category": "Frontend", "skills": ["React", "CSS"] }]
    }
  `;
  return runAIEngine('Keyword', prompt, KeywordEngineSchema);
}

export async function runWowEngine(resumeText: string) {
  const prompt = `
    You are an elite Hiring Manager and Interview Coach.
    Analyze the tone of the resume. Then, formulate exact interview questions that specifically probe the projects and claims made in the resume.
    Provide an achievement amplifier that takes a specific weak bullet from the resume and transforms it.
    
    Resume Text:
    ${resumeText}
    
    Return a STRICT JSON response adhering exactly to this structure:
    {
      "confidence_score": 85,
      "tone_analysis": "...",
      "interview_questions": [{ "question": "Tell me about how you scaled the notification service at Company Y...", "purpose": "..." }],
      "achievement_amplifier": [{ "original_concept": "...", "amplified_bullet": "..." }]
    }
  `;
  return runAIEngine('Wow', prompt, WowEngineSchema);
}

export async function runOptimizationEngine(resumeText: string) {
  const prompt = `
    You are a Premium Executive Resume Writer.
    Rewrite the candidate's professional summary using high-impact, sophisticated language that synthesizes their actual technical background.
    Then, identify 3 specific, weak bullet points from the resume and rewrite them using the STAR methodology (Situation, Task, Action, Result). 
    Invent reasonable but impactful metrics if necessary to demonstrate how metrics should look, but heavily base the actions on their actual stated work.
    
    Resume Text:
    ${resumeText}
    
    Return a STRICT JSON response adhering exactly to this structure:
    {
      "confidence_score": 85,
      "summary_rewrite": {
        "original": "...",
        "optimized": "...",
        "recruiter_impact": "..."
      },
      "bullet_optimizations": [
        {
          "original": "...",
          "optimized": "...",
          "action_verb_used": "...",
          "quantifiable_metric_added": true
        }
      ]
    }
  `;
  return runAIEngine('Optimization', prompt, OptimizationEngineSchema);
}

export async function runCoreExtraction(resumeText: string) {
  const prompt = `
    You are a precise Data Extraction Engine.
    Extract the core structured information exactly as it appears in the resume.
    
    Resume Text:
    ${resumeText}
    
    Return a STRICT JSON response adhering exactly to this structure:
    {
      "name": "John Doe",
      "email": "john@example.com",
      "summary": "...",
      "experience": [{ "title": "...", "company": "...", "dates": "...", "bullets": ["..."] }],
      "education": [{ "degree": "...", "institution": "...", "year": "..." }]
    }
  `;
  return runAIEngine('CoreExtraction', prompt, CoreExtractionSchema);
}
