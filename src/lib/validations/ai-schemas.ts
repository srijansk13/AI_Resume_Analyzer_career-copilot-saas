import { z } from 'zod';

// Shared Sub-Schemas
export const ExplainabilityNodeSchema = z.object({
  reasoning: z.string().default("General assessment based on industry standards."),
  impact: z.string().default("Minimal impact on overall hiring probability."),
  fix_strategy: z.string().default("Review and refine for clarity."),
});

// 1. ATS Engine Schema
export const ATSEngineSchema = z.object({
  confidence_score: z.number().min(0).max(100).default(80),
  overall_ats_score: z.number().min(0).max(100).default(50),
  category_scores: z.object({
    readability: z.number().min(0).max(100).default(50),
    format: z.number().min(0).max(100).default(50),
    impact: z.number().min(0).max(100).default(50),
    keywords: z.number().min(0).max(100).default(50),
  }),
  section_completeness: z.object({
    summary: z.boolean().default(false),
    experience: z.boolean().default(false),
    education: z.boolean().default(false),
    skills: z.boolean().default(false),
  }),
  formatting_issues: z.array(z.object({
    issue: z.string(),
    explainability_node: ExplainabilityNodeSchema
  })).default([]),
  action_verb_score: z.number().min(0).max(100).default(50),
  measurable_impact_score: z.number().min(0).max(100).default(50)
});

// 2. Recruiter Simulation Engine Schema
export const RecruiterEngineSchema = z.object({
  confidence_score: z.number().min(0).max(100).default(80),
  impression_score: z.number().min(0).max(100).default(50),
  hiring_probability: z.string().default("Moderate"), // High, Moderate, Low
  top_strengths: z.array(z.string()).default([]),
  hiring_manager_concerns: z.array(z.object({
    concern: z.string(),
    explainability_node: ExplainabilityNodeSchema
  })).default([]),
  rejection_risk_analysis: z.object({
    risk_level: z.string().default("Medium"),
    primary_reason: z.string().default("Requires deeper impact metrics.")
  }),
  competitive_percentile: z.number().min(0).max(100).default(50)
});

// 3. Career Roadmap Engine Schema
export const RoadmapEngineSchema = z.object({
  confidence_score: z.number().min(0).max(100).default(80),
  timeline: z.object({
    days_30: z.array(z.string()).default([]),
    days_60: z.array(z.string()).default([]),
    days_90: z.array(z.string()).default([])
  }),
  role_transition: z.object({
    current_level: z.string().default("Unknown"),
    next_logical_role: z.string().default("Senior Level"),
    estimated_salary_impact: z.string().default("TBD")
  }),
  skill_dependencies: z.array(z.object({
    skill: z.string(),
    depends_on: z.array(z.string()).default([]),
    roi_score: z.number().min(0).max(10).default(5)
  })).default([])
});

// 4. Keyword Analytics Engine Schema
export const KeywordEngineSchema = z.object({
  confidence_score: z.number().min(0).max(100).default(80),
  density: z.array(z.object({
    keyword: z.string(),
    count: z.number(),
    is_optimal: z.boolean().default(true)
  })).default([]),
  detected_skills: z.object({
    technical: z.array(z.string()).default([]),
    soft: z.array(z.string()).default([]),
    tools: z.array(z.string()).default([])
  }).default({ technical: [], soft: [], tools: [] }),
  missing_critical_skills: z.array(z.object({
    skill: z.string(),
    explainability_node: ExplainabilityNodeSchema
  })).default([]),
  overused_buzzwords: z.array(z.string()).default([]),
  semantic_clusters: z.array(z.object({
    category: z.string(),
    skills: z.array(z.string())
  })).default([])
});

// 5. Wow-Factor / Extras Schema (Interview & Pitch)
export const WowEngineSchema = z.object({
  confidence_score: z.number().min(0).max(100).default(80),
  tone_analysis: z.string().default("Professional"),
  interview_questions: z.array(z.object({
    question: z.string(),
    purpose: z.string()
  })).default([]),
  achievement_amplifier: z.array(z.object({
    original_concept: z.string(),
    amplified_bullet: z.string()
  })).default([])
});

// 6. Optimization Engine Schema (Summary & Bullets)
export const OptimizationEngineSchema = z.object({
  confidence_score: z.number().min(0).max(100).default(80),
  summary_rewrite: z.object({
    original: z.string().default(""),
    optimized: z.string().default(""),
    recruiter_impact: z.string().default("Improves initial hook and clarity.")
  }),
  bullet_optimizations: z.array(z.object({
    original: z.string(),
    optimized: z.string(),
    action_verb_used: z.string().default(""),
    quantifiable_metric_added: z.boolean().default(false)
  })).default([])
});

// Core Extraction (Name, basic details needed for UI quickly)
export const CoreExtractionSchema = z.object({
  name: z.string().default("Candidate"),
  email: z.string().default("Not Provided"),
  summary: z.string().default(""),
  experience: z.array(z.object({
    title: z.string(),
    company: z.string(),
    dates: z.string(),
    bullets: z.array(z.string())
  })).default([]),
  education: z.array(z.object({
    degree: z.string(),
    institution: z.string(),
    year: z.string()
  })).default([]),
  projects: z.array(z.any()).default([]),
  certifications: z.array(z.any()).default([]),
  certificates: z.array(z.any()).default([]),
  awards: z.array(z.any()).default([]),
  achievements: z.array(z.any()).default([]),
  publications: z.array(z.any()).default([]),
  portfolioLinks: z.array(z.string()).default([]),
  githubLinks: z.array(z.string()).default([]),
  skills: z.array(z.string()).default([]),
  tools: z.array(z.string()).default([])
});

// Suggested Projects Schema
export const SuggestedProjectSchema = z.object({
  title: z.string().default("Suggested Project"),
  why_it_helps: z.string().default("Helps bridge critical gaps."),
  skills_covered: z.array(z.string()).default([]),
  suggested_stack: z.array(z.string()).default([]),
  resume_impact: z.string().default("High resume impact."),
  portfolio_value: z.string().default("Strong portfolio signal for recruiters."),
  difficulty_level: z.enum(["Beginner", "Intermediate", "Advanced"]).default("Intermediate"),
});

// Master schema for single Gemini prompt architecture
export const MasterAnalysisSchema = z.object({
  parsedData: CoreExtractionSchema.partial().optional(),
  ats: ATSEngineSchema.partial().optional(),
  recruiter: RecruiterEngineSchema.partial().optional(),
  roadmap: RoadmapEngineSchema.partial().optional(),
  keywords: KeywordEngineSchema.partial().optional(),
  wow: WowEngineSchema.partial().optional(),
  optimization: OptimizationEngineSchema.partial().optional(),
  suggested_projects: z.array(SuggestedProjectSchema).default([]).optional(),
}).partial();
