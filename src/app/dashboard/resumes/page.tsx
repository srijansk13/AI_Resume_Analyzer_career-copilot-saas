import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyToken } from '@/lib/auth';
import connectToDatabase from '@/lib/db';
import Resume from '@/models/Resume';
import Analysis from '@/models/Analysis';
import { ResumesClient } from '@/components/dashboard/resumes/ResumesClient';

export default async function ResumesPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('session')?.value;

  if (!token) {
    redirect('/login');
  }

  const payload = verifyToken(token);
  if (!payload || !payload.userId) {
    redirect('/login');
  }

  await connectToDatabase();

  const resumes = await Resume.find({ userId: payload.userId }).sort({ createdAt: -1 }).lean();

  // Deduplicate by textHash, keeping the latest valid analysis
  const uniqueHashes = new Set<string>();
  const processedResumes: any[] = [];

  for (const r of resumes) {
    if (uniqueHashes.has(r.textHash)) continue;
    uniqueHashes.add(r.textHash);

    // Find latest valid gemini analysis for this resume
    let analysis = await Analysis.findOne({ 
      resumeId: r._id,
      analysisSource: 'gemini',
      fallbackUsed: false
    }).sort({ createdAt: -1 }).lean();

    // If no valid gemini analysis, fallback to latest of any kind
    if (!analysis) {
      analysis = await Analysis.findOne({ resumeId: r._id }).sort({ createdAt: -1 }).lean();
    }

    processedResumes.push({
      ...r,
      _id: r._id?.toString(),
      analysisId: analysis ? analysis._id.toString() : null,
      atsScore: analysis?.ats?.overall_ats_score || null,
      analysisSource: analysis?.analysisSource || 'unknown',
      fallbackUsed: analysis?.fallbackUsed || false,
      aiParseStatus: analysis?.aiParseStatus || 'unknown'
    });
  }

  const safeResumes = processedResumes.map((resume) => ({
    id: resume._id?.toString() || "",
    userId: resume.userId?.toString() || "",
    analysisId: resume.analysisId ? resume.analysisId.toString() : "",
    resumeId: resume._id?.toString() || "",
    textHash: resume.textHash || "",
    title: String(resume.title || "Untitled Resume"),
    filename: String(resume.title || "Untitled Resume"),
    createdAt: resume.createdAt ? new Date(resume.createdAt).toISOString() : "",
    updatedAt: resume.updatedAt ? new Date(resume.updatedAt).toISOString() : "",
    atsScore: Number(resume.atsScore || 0),
    analysisSource: String(resume.analysisSource || "unknown"),
    fallbackUsed: Boolean(resume.fallbackUsed),
    aiParseStatus: String(resume.aiParseStatus || "unknown"),
  }));

  return <ResumesClient initialData={safeResumes} />;
}
