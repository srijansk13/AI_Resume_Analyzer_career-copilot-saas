import { NextResponse } from 'next/server';
import { runFullAnalysis } from '@/lib/ai/orchestrator';
import { buildCompleteFallbackAnalysis } from '@/lib/ai/fallback/defaults';
// Require the internal lib directly to bypass the buggy index.js that tries to load test PDFs
const pdfParse = require('pdf-parse/lib/pdf-parse.js');
import connectToDatabase from '@/lib/db';
import Resume from '@/models/Resume';
import Analysis from '@/models/Analysis';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';
import crypto from 'crypto';

// Persistent in-memory tracking of active analysis jobs to prevent duplicate parallel re-analyses
const activeAnalysisJobs = new Map<string, Promise<void>>();

function isCacheStaleOrIncomplete(analysis: any, text: string): { incomplete: boolean; reason: string } {
  try {
    if (!analysis || !analysis.parsedData || typeof analysis.parsedData !== 'object') {
      return { incomplete: true, reason: "No valid parsedData object found in cached analysis" };
    }

    const parsed = analysis.parsedData;
    const cleanText = typeof text === 'string' ? text : '';
    const lowerText = cleanText.toLowerCase();

    // Helper to check if a section is empty or missing
    const isEmpty = (arr: any) => {
      if (!arr) return true;
      if (!Array.isArray(arr)) return true;
      return arr.length === 0;
    };

    // Let's check for Projects completeness
    const projectFields = [
      parsed.projects,
      parsed.project,
      parsed.Project,
      parsed.Projects,
      parsed.personalProjects,
      parsed.academicProjects,
      parsed.portfolioProjects
    ];
    const hasProjects = projectFields.some(field => !isEmpty(field));
    const textHasProjectsHeading = /\b(projects|project)\b/i.test(lowerText);
    if (!hasProjects && textHasProjectsHeading) {
      return { incomplete: true, reason: "Missing projects list in cache, but 'Projects' heading exists in resume text" };
    }

    // Let's check for Certifications completeness
    const certFields = [
      parsed.certifications,
      parsed.certificates,
      parsed.Certifications,
      parsed.Certificates,
      parsed.licenses,
      parsed.awards
    ];
    const hasCerts = certFields.some(field => !isEmpty(field));
    const textHasCertsHeading = /\b(certifications|certificates|awards|achievements)\b/i.test(lowerText);
    if (!hasCerts && textHasCertsHeading) {
      return { incomplete: true, reason: "Missing certifications/awards in cache, but relevant headings exist in resume text" };
    }

    // Let's check for Skills completeness
    const hasSkills = !isEmpty(parsed.skills);
    const textHasSkillsHeading = /\b(skills|technologies|technical skills)\b/i.test(lowerText);
    if (!hasSkills && textHasSkillsHeading) {
      return { incomplete: true, reason: "Missing skills in cache, but 'Skills' heading exists in resume text" };
    }

    // Let's check for Experience completeness
    const hasExperience = !isEmpty(parsed.experience) || !isEmpty(parsed.workHistory);
    const textHasExperienceHeading = /\b(experience|employment|work history)\b/i.test(lowerText);
    if (!hasExperience && textHasExperienceHeading) {
      return { incomplete: true, reason: "Missing experience details in cache, but 'Experience' heading exists in resume text" };
    }

    return { incomplete: false, reason: "" };
  } catch (error) {
    console.error('[Cache] Error inside isCacheStaleOrIncomplete:', error);
    return { incomplete: false, reason: "Completeness check failed due to error" };
  }
}

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session');
    
    // Auth check
    let userId = 'demo-user-id'; // Fallback for testing
    if (sessionCookie && sessionCookie.value) {
      const decoded = verifyToken(sessionCookie.value);
      if (decoded) {
        userId = decoded.userId;
      }
    }

    const url = new URL(req.url);
    let queryForce = url.searchParams.get('forceReanalyze') === 'true' || url.searchParams.get('force') === 'true';
    let resumeIdParam = url.searchParams.get('resumeId');

    let file: File | null = null;
    let jd: string | undefined = undefined;
    let forceReanalyze = queryForce;

    // Read request body/formData safely
    const contentType = req.headers.get('content-type') || '';
    if (contentType.includes('multipart/form-data')) {
      try {
        const formData = await req.formData();
        file = formData.get('resume') as File | null;
        jd = formData.get('jd') as string | undefined;
        if (formData.get('forceReanalyze') === 'true' || formData.get('forceRegenerate') === 'true') {
          forceReanalyze = true;
        }
        if (formData.get('resumeId')) {
          resumeIdParam = formData.get('resumeId') as string;
        }
      } catch (err) {
        console.warn('[Upload] Failed to parse formData:', err);
      }
    } else if (contentType.includes('application/json')) {
      try {
        const body = await req.json();
        jd = body.jd;
        if (body.forceReanalyze === true || body.forceRegenerate === true) {
          forceReanalyze = true;
        }
        if (body.resumeId) {
          resumeIdParam = body.resumeId;
        }
      } catch (err) {
        console.warn('[Upload] Failed to parse JSON body:', err);
      }
    }

    // Required logging statements
    console.log("[Upload Route] Request type:", contentType);
    console.log("[Upload Route] Force reanalyze:", forceReanalyze);
    console.log("[Upload Route] ResumeId:", resumeIdParam);

    // Validate resumeId format to prevent MongoDB CastErrors
    const isValidObjectId = (id: any) => {
      if (!id || typeof id !== 'string') return false;
      return /^[0-9a-fA-F]{24}$/.test(id);
    };

    if (resumeIdParam && !isValidObjectId(resumeIdParam)) {
      console.warn(`[Upload Route] Invalid resumeId format ignored: ${resumeIdParam}`);
      resumeIdParam = null;
    }

    // Concurrency Check
    if (forceReanalyze && resumeIdParam) {
      if (activeAnalysisJobs.has(resumeIdParam)) {
        console.warn(`[Upload Route] Re-analysis already in progress for resumeId: ${resumeIdParam}. Rejecting request with 409.`);
        return NextResponse.json(
          { 
            success: false, 
            error: 'Analysis already in progress. Please wait.',
            message: 'Analysis already in progress. Please wait.'
          },
          { status: 409 }
        );
      }
    }

    let resolveJob: (() => void) | null = null;
    let jobKey: string | null = null;

    if (forceReanalyze && resumeIdParam) {
      jobKey = resumeIdParam;
      const jobPromise = new Promise<void>((resolve) => {
        resolveJob = resolve;
      });
      activeAnalysisJobs.set(jobKey, jobPromise);
      console.log(`[Upload Route] Registered active analysis job for resumeId: ${jobKey}`);
    }

    try {
      await connectToDatabase();

      let text = '';
      let existingResume = null;
      let fileNameForResume = 'resume.pdf';

      if (resumeIdParam) {
        console.log("[Upload Route] Entering reanalyze mode");
        try {
          existingResume = await Resume.findById(resumeIdParam);
          if (existingResume) {
            text = existingResume.originalText || '';
            fileNameForResume = existingResume.title || 'resume.pdf';
            console.log(`[Upload Route] Found existing resume originalText (Length: ${text.length} chars)`);
          } else {
            console.warn(`[Upload Route] Resume ${resumeIdParam} not found in DB, reverting to normal upload flow.`);
            resumeIdParam = null;
          }
        } catch (err) {
          console.error('[Upload Route] Error during resume lookup:', err);
          resumeIdParam = null;
        }
      }

      if (!resumeIdParam) {
        console.log("[Upload Route] Falling back to normal upload flow");
        if (!file || typeof file === 'string') {
          console.warn('[Upload] Invalid file format or missing resume field');
          return NextResponse.json({ success: false, error: 'No valid resume file uploaded' }, { status: 400 });
        }

        if (file.type !== 'application/pdf') {
          console.warn(`[Upload] Invalid file type: ${file.type}`);
          return NextResponse.json({ success: false, error: 'Only PDF files are supported' }, { status: 400 });
        }

        if (file.size > 5 * 1024 * 1024) { // 5MB limit
          console.warn(`[Upload] File too large: ${file.size} bytes`);
          return NextResponse.json({ success: false, error: 'File size exceeds 5MB limit' }, { status: 400 });
        }

        fileNameForResume = file.name;
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        
        console.log(`[Upload] Received file: ${file.name} (${buffer.length} bytes)`);

        // Parse PDF
        try {
          console.log(`[Upload] Starting PDF extraction...`);
          const parsedData = await pdfParse(buffer);
          text = parsedData.text;
          console.log(`[Upload] PDF parsed successfully`);
        } catch (parseError) {
          console.error('[Upload] PDF Parsing failed:', parseError instanceof Error ? parseError.stack : parseError);
          return NextResponse.json({ success: false, error: 'Failed to parse PDF document. The file may be corrupted or password-protected.' }, { status: 400 });
        }
      }
      
      // Sanitize and validate extracted text
      text = text
        .replace(/[\r\n]+/g, '\n') // Normalize newlines
        .replace(/[^\x20-\x7E\n]/g, '') // Remove non-printable characters
        .replace(/\s{2,}/g, ' ') // Collapse multiple spaces
        .trim();

      if (!text || text.length < 50) {
        console.warn('[Upload] Extraction failed or returned too little text. Possibly a scanned or image-only PDF.');
        return NextResponse.json({ success: false, error: 'Could not extract sufficient text from PDF. Please ensure the PDF is text-based and not a scanned image.' }, { status: 400 });
      }

      const normalizedText = text.replace(/\s+/g, ' ').replace(/[^\S\r\n]+/g, ' ').trim();
      const textHash = crypto.createHash('sha256').update(normalizedText).digest('hex');

      let shouldUseCache = !forceReanalyze;
      let hitReason = "Cache bypassed due to forceReanalyze";
      let cachedCompleteness = "N/A";

      console.log("[Cache] Force reanalyze:", forceReanalyze);

      if (shouldUseCache) {
        console.log(`[Cache] Current textHash: ${textHash}`);
        try {
          const existingResumes = await Resume.find({ textHash });
          const existingResumeIds = existingResumes.map(r => r._id);
          
          if (existingResumes.length > 0) {
            if (!existingResume) {
              existingResume = existingResumes[0];
            }
            
            const latestAnalysis = await Analysis.findOne({
              resumeId: { $in: existingResumeIds },
              fallbackUsed: { $ne: true },
              analysisSource: /gemini/i
            }).sort({ createdAt: -1 });

            if (latestAnalysis) {
              // Completeness Check with safe try-catch
              let completenessCheck = { incomplete: false, reason: "" };
              try {
                completenessCheck = isCacheStaleOrIncomplete(latestAnalysis, text);
              } catch (err) {
                console.error("[Cache] Completeness check crashed:", err);
              }
              
              cachedCompleteness = completenessCheck.incomplete ? "INCOMPLETE" : "COMPLETE";
              
              if (completenessCheck.incomplete) {
                shouldUseCache = false;
                hitReason = `MISS - Cache is incomplete: ${completenessCheck.reason}`;
              } else {
                hitReason = "HIT - Valid and complete cached analysis found";
                
                console.log("[Cache] Cached analysis completeness:", cachedCompleteness);
                console.log("[Cache] HIT/MISS reason:", hitReason);

                return NextResponse.json({
                  success: true,
                  analysis: latestAnalysis,
                  resumeId: latestAnalysis.resumeId.toString(),
                  analysisId: latestAnalysis._id.toString(),
                  isFallback: false
                });
              }
            } else {
              shouldUseCache = false;
              hitReason = "MISS - No valid Gemini analysis exists for this resume hash";
            }
          } else {
            shouldUseCache = false;
            hitReason = "MISS - Resume hash not found in database";
          }
        } catch (cacheErr) {
          console.error("[Cache] Safe recovery from cache search error:", cacheErr);
          shouldUseCache = false;
          hitReason = "MISS - Cache lookup error";
        }
      } else {
        hitReason = "MISS - Bypassed due to forceReanalyze / forced regeneration";
      }

      console.log("[Cache] Cached analysis completeness:", cachedCompleteness);
      console.log("[Cache] HIT/MISS reason:", hitReason);

      // Call Single Master AI Orchestrator
      console.log(`[AI] Dispatching parallel analysis for text (Length: ${text.length} chars)`);
      let analysisResult;
      let isFallback = false;
      try {
        analysisResult = await runFullAnalysis(text, jd);
        console.log('[AI] Successfully generated analysis payload');
      } catch (e) {
        console.log('[AI] Orchestrator failed completely, using total fallback bundle');
        analysisResult = buildCompleteFallbackAnalysis();
        isFallback = true;
      }
      
      let resumeId = null;
      let analysisId = null;

      if (!existingResume) {
        try {
          const resumesByHash = await Resume.find({ textHash });
          if (resumesByHash.length > 0) {
            existingResume = resumesByHash[0];
          }
        } catch (err) {
          console.error("[Upload] Error searching resumes by hash:", err);
        }
      }

      if (existingResume) {
        resumeId = existingResume._id;
        existingResume.parsedData = analysisResult.parsedData;
        await existingResume.save();
      } else {
        const newResume = await Resume.create({
          userId,
          title: fileNameForResume,
          parsedData: analysisResult.parsedData,
          originalText: text,
          textHash,
        });
        resumeId = newResume._id;
      }
      
      const result = analysisResult as any;
      const newAnalysis = await Analysis.create({
        resumeId: resumeId,
        parsedData: result.parsedData,
        ats: result.ats,
        recruiter: result.recruiter,
        roadmap: result.roadmap,
        keywords: result.keywords,
        wow: result.wow,
        optimization: result.optimization,
        analysisSource: result.analysisSource || 'fallback',
        modelUsed: result.modelUsed || 'unknown',
        fallbackUsed: result.fallbackUsed ?? true,
        aiParseStatus: result.aiParseStatus || 'unknown',
        moduleSources: result.moduleSources || {},
      });
      analysisId = newAnalysis._id;

      console.log("[Cache] Fresh analysis created:", analysisId);

      return NextResponse.json({ 
        success: true, 
        analysis: analysisResult,
        resumeId: resumeId.toString(),
        analysisId: analysisId.toString(),
        isFallback
      });
    } finally {
      if (jobKey && resolveJob) {
        activeAnalysisJobs.delete(jobKey);
        (resolveJob as () => void)();
        console.log(`[Upload Route] Cleared active analysis job for resumeId: ${jobKey}`);
      }
    }
  } catch (error) {
    console.error('================ UPLOAD ROUTE CRITICAL ERROR ================');
    console.error(error instanceof Error ? error.stack : error);
    console.error('===========================================================');
    return NextResponse.json({ success: false, error: 'Internal Server Error while processing resume' }, { status: 500 });
  }
}
