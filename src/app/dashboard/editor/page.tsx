import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyToken } from '@/lib/auth';
import connectToDatabase from '@/lib/db';
import Resume from '@/models/Resume';
import Analysis from '@/models/Analysis';
import EditorLandingClient from './EditorLandingClient';

export default async function EditorLandingPage() {
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

  const uniqueHashes = new Set<string>();
  const processedResumes: any[] = [];

  for (const r of resumes) {
    if (uniqueHashes.has(r.textHash)) continue;
    uniqueHashes.add(r.textHash);

    let analysis = await Analysis.findOne({ 
      resumeId: r._id,
      analysisSource: 'gemini',
      fallbackUsed: false
    }).sort({ createdAt: -1 }).lean();

    if (!analysis) {
      analysis = await Analysis.findOne({ resumeId: r._id }).sort({ createdAt: -1 }).lean();
    }

    processedResumes.push({
      ...r,
      _id: r._id?.toString(),
      analysisId: analysis ? analysis._id.toString() : null,
      atsScore: analysis?.ats?.overall_ats_score || null,
    });
  }

  const safeResumes = processedResumes.map((resume) => ({
    id: resume._id?.toString() || "",
    resumeId: resume._id?.toString() || "",
    analysisId: resume.analysisId ? resume.analysisId.toString() : "",
    title: String(resume.title || resume.filename || "Untitled Resume"),
    createdAt: resume.createdAt ? new Date(resume.createdAt).toISOString() : "",
    atsScore: resume.atsScore !== null ? Number(resume.atsScore) : null,
  }));

  return <EditorLandingClient resumes={safeResumes} />;
}
