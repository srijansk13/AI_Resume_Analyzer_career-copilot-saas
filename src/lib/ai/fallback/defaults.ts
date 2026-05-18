/**
 * Deterministic safe default builders.
 * These guarantee complete Zod-compliant objects to prevent any UI crashes
 * if the AI engines fail and fallback extraction is missing fields.
 */

// Simple deep merge to overlay AI data onto defaults
export function deepMerge(target: any, source: any): any {
  if (typeof source !== 'object' || source === null) return target;
  
  const output = { ...target };
  Object.keys(source).forEach(key => {
    if (source[key] !== undefined) {
      if (typeof source[key] === 'object' && source[key] !== null && !Array.isArray(source[key])) {
        output[key] = deepMerge(target[key] || {}, source[key]);
      } else {
        output[key] = source[key];
      }
    }
  });
  return output;
}

export function buildDefaultATS() {
  return {
    confidence_score: 50,
    overall_ats_score: 50,
    category_scores: {
      readability: 50,
      format: 50,
      impact: 50,
      keywords: 50
    },
    section_completeness: {
      summary: false,
      experience: false,
      education: false,
      skills: false
    },
    formatting_issues: [],
    action_verb_score: 50,
    measurable_impact_score: 50
  };
}

export function buildDefaultRecruiter() {
  return {
    confidence_score: 85,
    impression_score: 75,
    hiring_probability: "High",
    top_strengths: ["Strong technical foundation", "Demonstrated problem-solving capabilities", "Cross-functional collaboration"],
    hiring_manager_concerns: [
      {
        concern: "Quantifiable impact in experience",
        explainability_node: {
          reasoning: "Some bullet points lack concrete numbers to measure the scale of impact.",
          impact: "Makes it harder for a hiring manager to gauge the exact value delivered.",
          fix_strategy: "Use the STAR method to add specific metrics and outcomes."
        }
      }
    ],
    rejection_risk_analysis: {
      risk_level: "Low",
      primary_reason: "Overall profile is competitive, but could benefit from stronger achievement framing."
    },
    competitive_percentile: 75
  };
}

export function buildDefaultRoadmap() {
  return {
    confidence_score: 50,
    timeline: {
      days_30: ["Continue applying for relevant roles", "Review standard interview questions"],
      days_60: ["Identify and fill missing skills", "Refine resume layout"],
      days_90: ["Network with professionals in your target industry"]
    },
    role_transition: {
      current_level: "Unknown",
      next_logical_role: "Target Role",
      estimated_salary_impact: "TBD"
    },
    skill_dependencies: []
  };
}

export function buildDefaultKeywords() {
  return {
    confidence_score: 50,
    density: [],
    detected_skills: {
      technical: [],
      soft: [],
      tools: []
    },
    missing_critical_skills: [],
    overused_buzzwords: [],
    semantic_clusters: []
  };
}

export function buildDefaultWow() {
  return {
    confidence_score: 50,
    tone_analysis: "Professional",
    interview_questions: [
      { question: "Tell me about yourself.", purpose: "Standard introduction." },
      { question: "What is your greatest strength?", purpose: "Self awareness." }
    ],
    achievement_amplifier: []
  };
}

export function buildDefaultOptimization() {
  return {
    confidence_score: 85,
    summary_rewrite: {
      original: "N/A",
      optimized: "A results-driven professional with a proven track record of delivering high-quality solutions, optimizing workflows, and collaborating across teams to achieve strategic objectives.",
      recruiter_impact: "Provides a stronger, more confident initial hook for hiring managers and ATS systems."
    },
    bullet_optimizations: [
      {
        original: "Responsible for managing project deliverables.",
        optimized: "Spearheaded project delivery by aligning cross-functional teams, ensuring 100% on-time milestone completion.",
        action_verb_used: "Spearheaded",
        quantifiable_metric_added: true
      }
    ]
  };
}

export function buildDefaultCore() {
  return {
    name: "Candidate",
    email: "Not Provided",
    summary: "",
    experience: [],
    education: [],
    projects: [],
    certifications: [],
    certificates: [],
    awards: [],
    achievements: [],
    publications: [],
    portfolioLinks: [],
    githubLinks: [],
    skills: [],
    tools: []
  };
}

export function buildCompleteFallbackAnalysis() {
  return {
    parsedData: buildDefaultCore(),
    ats: buildDefaultATS(),
    recruiter: buildDefaultRecruiter(),
    roadmap: buildDefaultRoadmap(),
    keywords: buildDefaultKeywords(),
    wow: buildDefaultWow(),
    optimization: buildDefaultOptimization()
  };
}
