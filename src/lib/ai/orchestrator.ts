import { MasterAnalysisSchema } from '../validations/ai-schemas';
import { callGeminiWaterfall } from './gemini';
import { buildCompleteFallbackAnalysis } from './fallback/defaults';
import { filterVerifiedParsedProjects } from '../resume/projectIntegrity';

function deepMerge(target: any, source: any): any {
  if (typeof target !== 'object' || target === null) return source !== undefined ? source : target;
  if (typeof source !== 'object' || source === null) return target;
  
  if (Array.isArray(target) && Array.isArray(source)) {
    return source.length > 0 ? source : target;
  }
  
  const output = { ...target };
  for (const key of Object.keys(source)) {
    if (source[key] instanceof Object && !Array.isArray(source[key]) && key in target) {
      output[key] = deepMerge(target[key], source[key]);
    } else {
      if (source[key] !== undefined && source[key] !== null) {
        output[key] = source[key];
      }
    }
  }
  return output;
}

function printCounts(stage: string, obj: any) {
  const pd = obj?.parsedData;
  console.log(`[${stage}]`, {
    projects: pd?.projects?.length || 0,
    certifications: pd?.certifications?.length || 0,
    awards: pd?.awards?.length || 0,
    achievements: pd?.achievements?.length || 0,
    skills: pd?.skills?.length || 0,
    experience: pd?.experience?.length || 0,
    education: pd?.education?.length || 0
  });
}

function normalizeData(data: any) {
  if (!data) return;

  // 1. Recruiter Concerns shape coercion
  if (data.recruiter && Array.isArray(data.recruiter.hiring_manager_concerns)) {
    data.recruiter.hiring_manager_concerns = data.recruiter.hiring_manager_concerns.map((c: any) => {
      if (typeof c === 'string') {
        return { 
          concern: c, 
          explainability_node: { 
            reasoning: "Detected from AI context analysis.", 
            impact: "Moderate", 
            fix_strategy: "Consider addressing this directly in the experience section." 
          } 
        };
      }
      if (c && typeof c === 'object') {
        const concern = c.concern || c.issue || c.text || "Recruiter concern detected";
        const expNode = c.explainability_node || {};
        return {
          concern,
          explainability_node: {
            reasoning: expNode.reasoning || "Detected from AI context analysis.",
            impact: expNode.impact || "Moderate",
            fix_strategy: expNode.fix_strategy || "Review and address."
          }
        };
      }
      return c;
    });
  }

  // 2. Timeline dependencies shape coercion
  if (data.roadmap && Array.isArray(data.roadmap.skill_dependencies)) {
    data.roadmap.skill_dependencies = data.roadmap.skill_dependencies.map((s: any) => {
      if (typeof s === 'string') {
        return { skill: s, depends_on: [], roi_score: 5 };
      }
      if (s && typeof s === 'object') {
        return {
          skill: s.skill || s.name || "Required Skill",
          depends_on: Array.isArray(s.depends_on) ? s.depends_on : [],
          roi_score: typeof s.roi_score === 'number' ? s.roi_score : 5
        };
      }
      return s;
    });
  }

  // 3. Keywords missing critical skills shape coercion
  if (data.keywords && Array.isArray(data.keywords.missing_critical_skills)) {
    data.keywords.missing_critical_skills = data.keywords.missing_critical_skills.map((k: any) => {
      if (typeof k === 'string') {
        return { 
          skill: k, 
          explainability_node: { 
            reasoning: "Industry standard requirement for this role.", 
            impact: "High", 
            fix_strategy: "Acquire or highlight this skill." 
          } 
        };
      }
      if (k && typeof k === 'object') {
        const skill = k.skill || k.name || "Missing Skill";
        const expNode = k.explainability_node || {};
        return {
          skill,
          explainability_node: {
            reasoning: expNode.reasoning || "Industry standard requirement.",
            impact: expNode.impact || "High",
            fix_strategy: expNode.fix_strategy || "Acquire or highlight."
          }
        };
      }
      return k;
    });
  }
  
  // 4. Keywords density shape coercion
  if (data.keywords && Array.isArray(data.keywords.density)) {
    data.keywords.density = data.keywords.density.map((k: any) => {
      if (typeof k === 'string') {
        return { keyword: k, count: 1, is_optimal: true };
      }
      if (k && typeof k === 'object') {
        return {
          keyword: k.keyword || k.word || "Keyword",
          count: typeof k.count === 'number' ? k.count : 1,
          is_optimal: typeof k.is_optimal === 'boolean' ? k.is_optimal : true
        };
      }
      return k;
    });
  }

  // 5. Wow interview questions shape coercion
  if (data.wow && Array.isArray(data.wow.interview_questions)) {
    data.wow.interview_questions = data.wow.interview_questions.map((q: any) => {
      if (typeof q === 'string') {
        return { question: q, purpose: "General assessment based on profile gaps." };
      }
      if (q && typeof q === 'object') {
        return {
          question: q.question || q.text || "Interview question",
          purpose: q.purpose || q.reason || "General assessment."
        };
      }
      return q;
    });
  }

  // 6. Keywords semantic_clusters coercion
  if (data.keywords && Array.isArray(data.keywords.semantic_clusters)) {
    data.keywords.semantic_clusters = data.keywords.semantic_clusters.map((cluster: any) => {
      if (typeof cluster === 'string') {
        return { category: 'General', skills: [cluster] };
      }
      if (cluster && typeof cluster === 'object') {
        return {
          category: cluster.category || cluster.name || 'General',
          skills: Array.isArray(cluster.skills) ? cluster.skills : []
        };
      }
      return cluster;
    });
  }

  // 7. Core parsedData normalization (Crucial for preventing lost/dropped arrays)
  if (data.parsedData) {
    const pd = data.parsedData;

    // Normalizing parsedData.experience
    if (Array.isArray(pd.experience)) {
      pd.experience = pd.experience.map((exp: any) => {
        if (!exp || typeof exp !== 'object') return exp;

        // dates normalization
        let dates = exp.dates || '';
        if (!dates) {
          const start = exp.startDate || exp.start || '';
          const end = exp.endDate || exp.end || 'Present';
          if (start) {
            dates = `${start} - ${end}`.trim();
          }
        }

        // bullets normalization from description string or nested bullets
        let bullets = exp.bullets;
        if (!bullets || !Array.isArray(bullets)) {
          const desc = exp.description || exp.bullets || [];
          if (Array.isArray(desc)) {
            bullets = desc.map(b => String(b));
          } else if (typeof desc === 'string') {
            bullets = desc.split('\n').map(b => b.replace(/^[•\-\*\s]+/, '').trim()).filter(b => b.length > 0);
          } else {
            bullets = [];
          }
        }

        return {
          title: exp.title || 'Role',
          company: exp.company || 'Company',
          dates: dates || 'N/A',
          bullets: bullets
        };
      });
    }

    // Normalizing parsedData.education
    if (Array.isArray(pd.education)) {
      pd.education = pd.education.map((edu: any) => {
        if (!edu || typeof edu !== 'object') return edu;

        const year = edu.year || edu.graduationYear || edu.dates || edu.duration || '';
        return {
          degree: edu.degree || 'Degree',
          institution: edu.institution || edu.school || 'Institution',
          year: year || 'N/A'
        };
      });
    }

    // Normalizing parsedData.skills
    if (!Array.isArray(pd.skills)) {
      pd.skills = Array.isArray(pd.tools) ? pd.tools : [];
    }

    // Normalizing parsedData.certifications from certificates/licenses/courses
    if (!Array.isArray(pd.certifications)) {
      pd.certifications = [];
    }
    const potentialCerts = [
      ...(Array.isArray(pd.certificates) ? pd.certificates : []),
      ...(Array.isArray(pd.certifications) ? pd.certifications : []),
      ...(Array.isArray(pd.licenses) ? pd.licenses : []),
      ...(Array.isArray(pd.courses) ? pd.courses : [])
    ];
    if (potentialCerts.length > 0) {
      const seen = new Set<string>();
      pd.certifications = potentialCerts.map((cert: any) => {
        if (typeof cert === 'string') {
          return { name: cert, issuer: 'N/A', year: 'N/A' };
        }
        if (cert && typeof cert === 'object') {
          return {
            name: cert.name || cert.title || 'Certification',
            issuer: cert.issuer || cert.authority || 'N/A',
            year: cert.year || cert.date || 'N/A'
          };
        }
        return cert;
      }).filter((cert: any) => {
        if (!cert || !cert.name) return false;
        const key = `${cert.name}-${cert.issuer}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
    }

    // Preserve awards and achievements separately
    if (!Array.isArray(pd.awards)) pd.awards = [];
    if (!Array.isArray(pd.achievements)) pd.achievements = [];

    if (Array.isArray(pd.projects)) {
      pd.projects = pd.projects.map((proj: any) => {
        if (!proj || typeof proj !== 'object') return proj;
        return {
          title: proj.title || proj.name || 'Project',
          name: proj.name || proj.title || 'Project',
          description: proj.description || proj.summary || '',
          bullets: Array.isArray(proj.bullets) ? proj.bullets : [],
          technologies: proj.technologies || proj.tools || proj.techStack || [],
          link: proj.link || proj.url || proj.github || '',
        };
      });
    } else {
      pd.projects = [];
    }
  }
}

function isMinimumAcceptable(data: any): boolean {
  if (!data) return false;
  const requiredBlocks = ["parsedData", "ats", "keywords", "recruiter", "roadmap", "optimization"];
  return requiredBlocks.every(block => data[block] && typeof data[block] === 'object' && Object.keys(data[block]).length > 0);
}

function passesSalvageQualityThreshold(data: any, originalText: string): boolean {
  if (!data) return false;
  
  // - parsedData exists
  if (!data.parsedData || typeof data.parsedData !== 'object' || Object.keys(data.parsedData).length === 0) return false;
  // - ats exists
  if (!data.ats || typeof data.ats !== 'object' || Object.keys(data.ats).length === 0) return false;
  // - keywords exists
  if (!data.keywords || typeof data.keywords !== 'object' || Object.keys(data.keywords).length === 0) return false;
  
  // - at least 4 of 7 major blocks exist
  const majorBlocks = ["parsedData", "ats", "keywords", "recruiter", "roadmap", "optimization", "wow"];
  const existingBlocksCount = majorBlocks.filter(block => data[block] && typeof data[block] === 'object' && Object.keys(data[block]).length > 0).length;
  if (existingBlocksCount < 4) return false;
  
  // - skills count >= 8
  const skillsCount = Array.isArray(data.parsedData.skills) ? data.parsedData.skills.length : 0;
  if (skillsCount < 8) return false;
  
  // - projects count >= 1 if Projects heading exists
  const hasProjectsHeading = /\b(projects|project)\b/i.test(originalText);
  if (hasProjectsHeading) {
    const projectsCount = Array.isArray(data.parsedData.projects) ? data.parsedData.projects.length : 0;
    if (projectsCount < 1) return false;
  }
  
  // - optimization summary or bullet optimizations exist
  const hasOptimizationSummary = data.optimization?.summary_rewrite?.optimized && data.optimization.summary_rewrite.optimized.length > 0;
  const hasBulletOptimizations = Array.isArray(data.optimization?.bullet_optimizations) && data.optimization.bullet_optimizations.length > 0;
  if (!hasOptimizationSummary && !hasBulletOptimizations) return false;
  
  return true;
}

function buildEnrichedFallback(fallback: any, partialData: any, resumeText: string) {
  const enriched = { ...fallback };
  
  if (partialData) {
    if (partialData.parsedData) {
      enriched.parsedData = deepMerge(enriched.parsedData, partialData.parsedData);
    }
    for (const block of ["ats", "recruiter", "roadmap", "keywords", "wow", "optimization"]) {
      if (partialData[block] && typeof partialData[block] === 'object' && Object.keys(partialData[block]).length > 0) {
        enriched[block] = deepMerge(enriched[block], partialData[block]);
      }
    }
  }

  const pd = enriched.parsedData;
  if (!pd.name || pd.name === "Candidate") {
    const lines = resumeText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    if (lines.length > 0) {
      pd.name = lines[0];
    }
  }
  if (!pd.email || pd.email === "Not Provided") {
    const emailMatch = resumeText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    if (emailMatch) {
      pd.email = emailMatch[0];
    }
  }

  if (!pd.skills || pd.skills.length === 0) {
    const commonSkills = ["react", "javascript", "typescript", "python", "node", "aws", "docker", "kubernetes", "sql", "java", "c++", "html", "css", "git", "linux", "rest api"];
    const foundSkills: string[] = [];
    for (const skill of commonSkills) {
      const escaped = skill.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
      const regex = new RegExp(`\\b${escaped}\\b`, 'i');
      if (regex.test(resumeText)) {
        const cleanName = skill === "c++" ? "C++" : skill.charAt(0).toUpperCase() + skill.slice(1);
        foundSkills.push(cleanName);
      }
    }
    if (foundSkills.length > 0) {
      pd.skills = foundSkills;
    }
  }

  return enriched;
}

export async function runFullAnalysis(resumeText: string, jd?: string, targetRole?: string) {
  console.log(`[AI] Starting Master Analysis (Target Role: ${targetRole || 'None Specified'})`);

  const masterPrompt = `
    You are an elite Career Strategist and FAANG Technical Recruiter.
    Evaluate the candidate's resume and generate deeply personalized insights.
    
    ${targetRole ? `Target Career Role: ${targetRole}. You MUST tailor the entire analysis, ATS suggestions, recruiter concerns, roadmaps, missing skills, bullet optimizations, and project suggestions specifically to align the candidate with a high-caliber ${targetRole} role.` : ''}
    
    CRITICAL RULES:
    1. EXTRACT EXACT project names, metrics, and technical skills from the text. NEVER invent or infer resume content.
    2. parsedData.projects MUST ONLY list projects explicitly named in the resume (typically under a Projects section). If none exist, return "projects": []. NEVER move jobs from experience into projects. NEVER create projects from generic words (website, app, dashboard, platform, manager).
    3. NEVER hallucinate demo projects (e.g. Smart Task Manager, Personal Portfolio Website, CipherKey Password Generator).
    4. suggested_projects are NEW portfolio ideas to build — NOT items on the resume. Return 2-3 practical, beginner-friendly projects tailored to the target role with realistic stacks.
    5. Use recruiter-recognized terminology only (React, Next.js, Node.js, AWS, Docker, PostgreSQL, REST APIs, TypeScript). BAN fluffy phrases like "Structured JSON Processing", "Dashboard Systems", "AI Workflow Integration", "Semantic Resume Analysis".
    6. keywords.detected_skills: max 12 technical, max 15 tools, max 8 soft. keywords.density: top 10 highest-value ATS terms only. missing_critical_skills: max 6 role-relevant gaps.
    7. NEVER output generic templates like "Learn React" or "Add numbers." Focus ONLY on the candidate's actual context.
    8. Generate a 90-day roadmap based strictly on missing adjacent skills to their current stack.
    9. Provide recruiter concerns citing specific gaps in tenure or missing quantifiable impact on real experience.
    10. You MUST return ALL requested top-level blocks: parsedData, ats, recruiter, roadmap, keywords, wow, optimization, and suggested_projects.
    11. Return valid JSON only. No markdown fences or preamble — ONLY the raw JSON object.
    
    ${jd ? `Target Job Description: ${jd}` : ''}
    
    Resume Text:
    ${resumeText}
    
    Output exactly this JSON structure and nothing else:
    {
      "parsedData": { 
        "name": "...", 
        "email": "...", 
        "summary": "...", 
        "experience": [], 
        "education": [],
        "projects": [ { "title": "...", "description": "...", "tools": [] } ],
        "certifications": [ { "name": "...", "issuer": "...", "year": "..." } ],
        "certificates": [],
        "awards": [],
        "achievements": [],
        "publications": [],
        "portfolioLinks": [],
        "githubLinks": [],
        "skills": [],
        "tools": []
      },
      "ats": { "confidence_score": 90, "overall_ats_score": 75, "category_scores": {"readability": 80, "format": 70, "impact": 60, "keywords": 85}, "section_completeness": {"summary": true, "experience": true, "education": true, "skills": true}, "formatting_issues": [], "action_verb_score": 60, "measurable_impact_score": 40 },
      "recruiter": { "confidence_score": 85, "impression_score": 60, "hiring_probability": "High", "top_strengths": [], "hiring_manager_concerns": [], "rejection_risk_analysis": {"risk_level": "Low", "primary_reason": "..."}, "competitive_percentile": 80 },
      "roadmap": { "confidence_score": 80, "timeline": {"days_30": [], "days_60": [], "days_90": []}, "role_transition": {"current_level": "...", "next_logical_role": "...", "estimated_salary_impact": "..."}, "skill_dependencies": [] },
      "keywords": { "confidence_score": 90, "density": [], "detected_skills": {"technical": [], "soft": [], "tools": []}, "missing_critical_skills": [], "overused_buzzwords": [], "semantic_clusters": [] },
      "wow": { "confidence_score": 85, "tone_analysis": "...", "interview_questions": [], "achievement_amplifier": [] },
      "optimization": { "confidence_score": 85, "summary_rewrite": {"original": "...", "optimized": "...", "recruiter_impact": "..."}, "bullet_optimizations": [] },
      "suggested_projects": [
        {
          "title": "Practical project title",
          "why_it_helps": "Why this helps for a ${targetRole || 'target'} role based on their actual gaps.",
          "skills_covered": ["React", "TypeScript"],
          "suggested_stack": ["Next.js", "MongoDB"],
          "resume_impact": "One sentence on recruiter/ATS benefit.",
          "portfolio_value": "One sentence on portfolio/demo value.",
          "difficulty_level": "Beginner"
        }
      ]
    }
  `;

  let analysisSource = 'fallback';
  let masterData: any = {};
  let modelUsed = 'unknown';
  let fallbackUsed = true;
  let aiParseStatus = 'fallback';
  
  const defaults = buildCompleteFallbackAnalysis();

  try {
    await new Promise<void>(async (resolve, reject) => {
      const globalTimeout = setTimeout(() => {
        reject(new Error("GLOBAL_ORCHESTRATOR_TIMEOUT"));
      }, 180000);

      try {
        let { data, rawText, model, salvaged, salvagedBlocks } = await callGeminiWaterfall(masterPrompt);
        
        console.log(`[AI] Raw response preview: ${rawText.substring(0, 1000).replace(/\\n/g, ' ')}...`);
        console.log(`[AI] Response chars: ${rawText.length}`);

        let finalParsedData = data || {};
        let isSalvaged = salvaged || false;
        let activeModel = model;

        // Perform completeness checks
        const allBlocks = ["parsedData", "ats", "keywords", "recruiter", "roadmap", "optimization", "wow"];
        let blocksPresent = allBlocks.filter(b => finalParsedData[b] && typeof finalParsedData[b] === 'object' && Object.keys(finalParsedData[b]).length > 0);
        let missingBlocks = allBlocks.filter(b => !finalParsedData[b] || typeof finalParsedData[b] !== 'object' || Object.keys(finalParsedData[b]).length === 0);

        console.log(`[AI Completeness] Blocks present: ${blocksPresent.join(', ')}`);
        console.log(`[AI Completeness] Missing blocks: ${missingBlocks.join(', ')}`);

        // Check against raised salvage quality threshold
        let passesThreshold = passesSalvageQualityThreshold(finalParsedData, resumeText);
        console.log(`[AI Completeness] Initial passes salvage threshold: ${passesThreshold}`);

        if (!passesThreshold) {
          console.log(`[AI Completeness] Initial data below threshold. Retrying once with strict complete JSON prompt...`);
          try {
            const strictCompletePrompt = `
              ${masterPrompt}
              
              CRITICAL SYSTEM NOTICE:
              The previous attempt failed strict salvage quality constraints. 
              You MUST return a COMPLETE, VALID JSON object containing ALL requested top-level blocks: parsedData, ats, recruiter, roadmap, keywords, wow, and optimization. 
              DO NOT omit or truncate any section. Return the complete, full premium analysis output.
            `;
            const retryResult = await callGeminiWaterfall(strictCompletePrompt, activeModel);
            if (retryResult.data && Object.keys(retryResult.data).length > 0) {
              finalParsedData = retryResult.data;
              activeModel = retryResult.model;
              isSalvaged = retryResult.salvaged || false;
              passesThreshold = passesSalvageQualityThreshold(finalParsedData, resumeText);
              
              // Re-evaluate blocks
              blocksPresent = allBlocks.filter(b => finalParsedData[b] && typeof finalParsedData[b] === 'object' && Object.keys(finalParsedData[b]).length > 0);
              missingBlocks = allBlocks.filter(b => !finalParsedData[b] || typeof finalParsedData[b] !== 'object' || Object.keys(finalParsedData[b]).length === 0);
              
              console.log(`[AI Completeness] Retry blocks present: ${blocksPresent.join(', ')}`);
              console.log(`[AI Completeness] Retry missing blocks: ${missingBlocks.join(', ')}`);
              console.log(`[AI Completeness] Retry passes salvage threshold: ${passesThreshold}`);
            }
          } catch (retryErr: any) {
            console.error(`[AI Completeness] Retry complete JSON generation failed: ${retryErr.message}`);
          }
        }

        // If even after retry we do not pass the salvage quality threshold, fall back to enriched defaults
        if (!passesThreshold) {
          console.log(`[AI Completeness] Salvage accepted: false`);
          console.log(`[AI Completeness] Repairing missing blocks: none`);
          
          const enrichedFallback = buildEnrichedFallback(defaults, finalParsedData, resumeText);
          masterData = enrichedFallback;
          analysisSource = 'fallback-enriched';
          modelUsed = activeModel || 'fallback';
          fallbackUsed = true;
          aiParseStatus = 'fallback-enriched';
          console.log(`[AI Completeness] Final source: ${analysisSource}`);
          clearTimeout(globalTimeout);
          resolve();
          return;
        }

        // We passed the quality threshold! Let's check for missing blocks to repair
        // Repair is triggered if we are missing any of: recruiter, roadmap, optimization, wow
        const missingTargetBlocks = missingBlocks.filter(b => ["recruiter", "roadmap", "optimization", "wow"].includes(b));
        
        let repairSuccess = false;
        if (missingTargetBlocks.length > 0) {
          console.log(`[AI Completeness] Salvage accepted: true`);
          console.log(`[AI Completeness] Repairing missing blocks: ${missingTargetBlocks.join(', ')}`);

          try {
            const missingBlocksStr = missingTargetBlocks.join(', ');
            const repairPrompt = `
              Using this original resume text and the existing parsedData, return ONLY the missing JSON blocks: ${missingBlocksStr}. Do not rewrite existing blocks.

              Original Resume Text:
              ${resumeText}

              Existing parsedData:
              ${JSON.stringify(finalParsedData.parsedData)}

              CRITICAL RULES:
              1. Return ONLY the requested missing JSON blocks: ${missingBlocksStr}.
              2. Do not include any explanations, markdown code blocks, or preamble.
              3. Respond with a valid JSON object matching the structures below for the requested blocks:
              
              Expected Schema structures for reference:
              {
                ${missingTargetBlocks.map(block => {
                  if (block === "recruiter") {
                    return `"recruiter": { "confidence_score": 85, "impression_score": 60, "hiring_probability": "High", "top_strengths": ["..."], "hiring_manager_concerns": [], "rejection_risk_analysis": {"risk_level": "Low", "primary_reason": "..."}, "competitive_percentile": 80 }`;
                  }
                  if (block === "roadmap") {
                    return `"roadmap": { "confidence_score": 80, "timeline": {"days_30": ["..."], "days_60": ["..."], "days_90": ["..."]}, "role_transition": {"current_level": "...", "next_logical_role": "...", "estimated_salary_impact": "..."}, "skill_dependencies": [] }`;
                  }
                  if (block === "optimization") {
                    return `"optimization": { "confidence_score": 85, "summary_rewrite": {"original": "...", "optimized": "...", "recruiter_impact": "..."}, "bullet_optimizations": [] }`;
                  }
                  if (block === "wow") {
                    return `"wow": { "confidence_score": 85, "tone_analysis": "...", "interview_questions": [], "achievement_amplifier": [] }`;
                  }
                  return "";
                }).filter(Boolean).join(',\n                ')}
              }
            `;

            const repairResult = await callGeminiWaterfall(repairPrompt, activeModel);
            if (repairResult.data && Object.keys(repairResult.data).length > 0) {
              // Merge repaired blocks carefully - only filling missing gaps, never overwriting existing richer sections
              let repairMerged = 0;
              for (const block of missingTargetBlocks) {
                if (repairResult.data[block] && typeof repairResult.data[block] === 'object' && Object.keys(repairResult.data[block]).length > 0) {
                  finalParsedData[block] = repairResult.data[block];
                  repairMerged++;
                  console.log(`[AI Completeness] Successfully repaired and merged block: ${block}`);
                }
              }
              if (repairMerged > 0) {
                repairSuccess = true;
              }
            }
          } catch (repairErr: any) {
            console.error(`[AI Completeness] Repair missing blocks failed: ${repairErr.message}`);
          }
        } else {
          console.log(`[AI Completeness] Salvage accepted: true`);
          console.log(`[AI Completeness] Repairing missing blocks: none`);
        }

        // Recheck if it has all required 6 blocks (minimum acceptable)
        const isComp = isMinimumAcceptable(finalParsedData);
        console.log(`[AI Completeness] Is final merged data complete: ${isComp}`);

        // Set final source description
        if (isComp) {
          if (repairSuccess) {
            analysisSource = `${activeModel}-repaired-complete`;
            aiParseStatus = 'repaired-complete';
          } else {
            analysisSource = isSalvaged ? `${activeModel}-salvaged` : `${activeModel}-valid`;
            aiParseStatus = isSalvaged ? 'salvaged' : 'valid';
          }
        } else {
          // If still incomplete, check if we want to accept it as salvaged if it passes threshold
          if (passesThreshold) {
            analysisSource = `${activeModel}-salvaged`;
            aiParseStatus = 'salvaged';
          } else {
            const enrichedFallback = buildEnrichedFallback(defaults, finalParsedData, resumeText);
            finalParsedData = enrichedFallback;
            analysisSource = 'fallback-enriched';
            aiParseStatus = 'fallback-enriched';
          }
        }

        console.log(`[AI Completeness] Final source: ${analysisSource}`);

        // Deep merge with defaults to rescue missing structural fields
        let mergedData = deepMerge(defaults, finalParsedData);

        // Run data normalization
        normalizeData(mergedData);

        modelUsed = activeModel || 'unknown';
        fallbackUsed = (analysisSource === 'fallback-enriched');
        masterData = mergedData;

        clearTimeout(globalTimeout);
        resolve();
      } catch (innerErr) {
        clearTimeout(globalTimeout);
        reject(innerErr);
      }
    });
  } catch (error: any) {
    console.error(`[AI] Waterfall fallback initiated. Master Gemini call completely failed: ${error.message}`);
    
    console.log(`[AI JSON] Falling back reason: ${error.message}`);
    console.log(`[AI] Final source: fallback`);
    return {
      ...defaults,
      analysisSource: 'fallback',
      modelUsed: 'fallback',
      fallbackUsed: true,
      aiParseStatus: 'fallback',
      moduleSources: {
        core: 'fallback', ats: 'fallback', recruiter: 'fallback', roadmap: 'fallback', keywords: 'fallback', wow: 'fallback', optimization: 'fallback'
      }
    };
  }

  const finalAnalysis = {
    parsedData: masterData.parsedData || defaults.parsedData,
    ats: masterData.ats || defaults.ats,
    recruiter: masterData.recruiter || defaults.recruiter,
    roadmap: masterData.roadmap || defaults.roadmap,
    keywords: masterData.keywords || defaults.keywords,
    wow: masterData.wow || defaults.wow,
    optimization: masterData.optimization || defaults.optimization,
    suggested_projects: masterData.suggested_projects || defaults.suggested_projects || [],
    analysisSource,
    modelUsed,
    fallbackUsed,
    aiParseStatus,
    moduleSources: {
      core: analysisSource,
      ats: analysisSource,
      recruiter: analysisSource,
      roadmap: analysisSource,
      keywords: analysisSource,
      wow: analysisSource,
      optimization: analysisSource,
      suggested_projects: analysisSource
    }
  };

  // Consolidate and map skills everywhere for perfect UI compatibility
  try {
    let allUniqueSkills = new Set<string>();

    if (finalAnalysis.parsedData && Array.isArray(finalAnalysis.parsedData.skills)) {
      finalAnalysis.parsedData.skills.forEach((s: any) => {
        if (typeof s === 'string' && s.trim()) allUniqueSkills.add(s.trim());
      });
    }

    if (finalAnalysis.keywords?.detected_skills) {
      const ds = finalAnalysis.keywords.detected_skills;
      if (Array.isArray(ds.technical)) {
        ds.technical.forEach((s: any) => {
          if (typeof s === 'string' && s.trim()) allUniqueSkills.add(s.trim());
        });
      }
      if (Array.isArray(ds.soft)) {
        ds.soft.forEach((s: any) => {
          if (typeof s === 'string' && s.trim()) allUniqueSkills.add(s.trim());
        });
      }
      if (Array.isArray(ds.tools)) {
        ds.tools.forEach((s: any) => {
          if (typeof s === 'string' && s.trim()) allUniqueSkills.add(s.trim());
        });
      }
    }

    if (finalAnalysis.keywords && Array.isArray(finalAnalysis.keywords.matched_keywords)) {
      finalAnalysis.keywords.matched_keywords.forEach((s: any) => {
        if (typeof s === 'string' && s.trim()) {
          allUniqueSkills.add(s.trim());
        } else if (s && typeof s === 'object' && s.keyword) {
          allUniqueSkills.add(String(s.keyword).trim());
        }
      });
    }

    if (finalAnalysis.keywords && Array.isArray(finalAnalysis.keywords.density)) {
      finalAnalysis.keywords.density.forEach((d: any) => {
        if (d && typeof d === 'object' && d.keyword) {
          allUniqueSkills.add(String(d.keyword).trim());
        } else if (typeof d === 'string' && d.trim()) {
          allUniqueSkills.add(d.trim());
        }
      });
    }

    const consolidatedSkills = Array.from(allUniqueSkills).filter(Boolean);

    if (consolidatedSkills.length > 0) {
      if (!finalAnalysis.parsedData) {
        finalAnalysis.parsedData = {};
      }
      // 1. Populate parsedData.skills
      if (!finalAnalysis.parsedData.skills || finalAnalysis.parsedData.skills.length === 0) {
        finalAnalysis.parsedData.skills = consolidatedSkills;
      }

      // 2. Populate keywords.detected_skills
      if (!finalAnalysis.keywords) {
        finalAnalysis.keywords = {};
      }
      if (!finalAnalysis.keywords.detected_skills || typeof finalAnalysis.keywords.detected_skills !== 'object') {
        finalAnalysis.keywords.detected_skills = { technical: [], soft: [], tools: [] };
      }
      const ds = finalAnalysis.keywords.detected_skills;
      if ((!ds.technical || ds.technical.length === 0) && (!ds.soft || ds.soft.length === 0) && (!ds.tools || ds.tools.length === 0)) {
        ds.technical = consolidatedSkills;
      } else {
        // Ensure we merge them so we never lose existing categories
        const currentTech = new Set(ds.technical || []);
        const currentSoft = new Set(ds.soft || []);
        const currentTools = new Set(ds.tools || []);
        consolidatedSkills.forEach(skill => {
          if (!currentTech.has(skill) && !currentSoft.has(skill) && !currentTools.has(skill)) {
            ds.technical = ds.technical || [];
            ds.technical.push(skill);
          }
        });
      }

      // 3. Populate keywords.matched_keywords
      if (!finalAnalysis.keywords.matched_keywords || finalAnalysis.keywords.matched_keywords.length === 0) {
        finalAnalysis.keywords.matched_keywords = consolidatedSkills;
      }

      // 4. Populate keywords.density
      if (!finalAnalysis.keywords.density || finalAnalysis.keywords.density.length === 0) {
        finalAnalysis.keywords.density = consolidatedSkills.map(skill => ({
          keyword: skill,
          count: 1,
          is_optimal: true
        }));
      } else {
        // If density exists, ensure consolidated skills are added if not present
        const existingKeywords = new Set(finalAnalysis.keywords.density.map((d: any) => d && d.keyword ? String(d.keyword).toLowerCase() : ''));
        consolidatedSkills.forEach(skill => {
          if (!existingKeywords.has(skill.toLowerCase())) {
            finalAnalysis.keywords.density.push({
              keyword: skill,
              count: 1,
              is_optimal: true
            });
          }
        });
      }
    }
  } catch (finalizationError: any) {
    console.error("[AI Finalization Error] Skills consolidation block threw an error, using safe recovery:", finalizationError.message);
    analysisSource = `${analysisSource}-valid-safe`;
    finalAnalysis.analysisSource = analysisSource;
    if (finalAnalysis.moduleSources) {
      Object.keys(finalAnalysis.moduleSources).forEach(k => {
        (finalAnalysis.moduleSources as any)[k] = analysisSource;
      });
    }
  }

  if (finalAnalysis.parsedData && Array.isArray(finalAnalysis.parsedData.projects)) {
    finalAnalysis.parsedData.projects = filterVerifiedParsedProjects(
      finalAnalysis.parsedData.projects,
      resumeText
    );
  }

  console.log("[Analysis Extracted Counts]", {
    projects: finalAnalysis.parsedData?.projects?.length || 0,
    certifications: finalAnalysis.parsedData?.certifications?.length || 0,
    awards: finalAnalysis.parsedData?.awards?.length || 0,
    achievements: finalAnalysis.parsedData?.achievements?.length || 0,
    skills: finalAnalysis.parsedData?.skills?.length || 0,
    experience: finalAnalysis.parsedData?.experience?.length || 0,
    education: finalAnalysis.parsedData?.education?.length || 0
  });

  console.log(`[AI Completeness] Final source: ${analysisSource}`);

  return finalAnalysis;
}
