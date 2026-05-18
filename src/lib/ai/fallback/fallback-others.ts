import { 
  RecruiterEngineSchema, 
  RoadmapEngineSchema, 
  OptimizationEngineSchema, 
  WowEngineSchema 
} from '../../validations/ai-schemas';
import { 
  buildDefaultRecruiter, 
  buildDefaultRoadmap, 
  buildDefaultOptimization, 
  buildDefaultWow,
  deepMerge 
} from './defaults';

export function runFallbackRecruiterEngine() {
  const payload = {
    confidence_score: 85,
    hiring_probability: "High",
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
    top_strengths: ["Structured Experience", "Technical Foundation", "Clear Formatting"],
    competitiveness_percentile: 75
  };
  const parsed = RecruiterEngineSchema.safeParse(deepMerge(buildDefaultRecruiter(), payload));
  return parsed.success ? parsed.data : buildDefaultRecruiter();
}

export function runFallbackRoadmapEngine() {
  const payload = {
    confidence_score: 80,
    role_transition: {
      current_level: "Professional",
      next_logical_role: "Senior Level",
      estimated_salary_impact: "Unknown"
    },
    timeline: {
      days_30: ["Review current skill gaps", "Update online portfolio"],
      days_60: ["Take an advanced certification", "Contribute to open source"],
      days_90: ["Apply for senior roles", "Network with industry leaders"]
    },
    skill_dependencies: []
  };
  const parsed = RoadmapEngineSchema.safeParse(deepMerge(buildDefaultRoadmap(), payload));
  return parsed.success ? parsed.data : buildDefaultRoadmap();
}

export function runFallbackOptimizationEngine() {
  const payload = {
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
  const parsed = OptimizationEngineSchema.safeParse(deepMerge(buildDefaultOptimization(), payload));
  return parsed.success ? parsed.data : buildDefaultOptimization();
}

export function runFallbackWowEngine() {
  const payload = {
    confidence_score: 80,
    tone_analysis: "Professional",
    interview_questions: [
      {
        question: "Can you walk me through your most impactful project?",
        purpose: "To gauge communication skills and technical depth."
      },
      {
        question: "How do you handle technical disagreements in a team?",
        purpose: "To assess soft skills and conflict resolution."
      }
    ],
    achievement_amplifier: []
  };
  const parsed = WowEngineSchema.safeParse(deepMerge(buildDefaultWow(), payload));
  return parsed.success ? parsed.data : buildDefaultWow();
}
