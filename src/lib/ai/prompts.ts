import { callGeminiWaterfall } from './gemini';

export async function analyzeResume(resumeText: string, jobDescriptionText?: string) {
  const prompt = `
    You are an expert ATS (Applicant Tracking System) algorithm and a Senior Technical Recruiter.
    Your task is to analyze the following resume and extract key information.
    
    ${jobDescriptionText ? `Compare it against this Job Description:\n${jobDescriptionText}\n` : ''}
    
    Resume Text:
    ${resumeText}
    
    Return a STRICT JSON response adhering to the following schema exactly:
    {
      "ats_score": number (0-100),
      "keyword_match": number (0-100),
      "extracted_data": {
        "name": string,
        "email": string,
        "summary": string,
        "experience": array of objects { title, company, dates, bullets },
        "education": array of objects { degree, institution, year },
        "projects": array of objects { title, description, tools }
      },
      "skills": array of strings,
      "missing_skills": array of strings (based on Job Description or general industry trends if no JD),
      "summary_rewrite": string (A highly optimized, ATS-friendly professional summary rewrite),
      "bullet_optimizations": array of objects { "original": string, "optimized": string } (Select 3 weak bullets and rewrite them using STAR methodology and quantifiable metrics)
    }
    
    DO NOT wrap your response in markdown formatting. RETURN ONLY VALID JSON.
  `;
  
  return callGeminiWaterfall(prompt);
}
