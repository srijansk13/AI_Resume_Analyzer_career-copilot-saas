import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyToken } from '@/lib/auth';
import connectToDatabase from '@/lib/db';
import Resume from '@/models/Resume';
import Analysis from '@/models/Analysis';
import JobMatchClient from './JobMatchClient';

export default async function JobMatchPage() {
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

  // Find all resumes for this user sorted by newest first
  const resumes = await Resume.find({ userId: payload.userId }).sort({ createdAt: -1 }).lean();

  const uniqueHashes = new Set<string>();
  const processedResumes: any[] = [];

  for (const r of resumes) {
    if (uniqueHashes.has(r.textHash)) continue;
    uniqueHashes.add(r.textHash);

    // Find latest valid gemini analysis or fallback
    let analysis = await Analysis.findOne({ 
      resumeId: r._id,
      analysisSource: 'gemini',
      fallbackUsed: false
    }).sort({ createdAt: -1 }).lean();

    if (!analysis) {
      analysis = await Analysis.findOne({ resumeId: r._id }).sort({ createdAt: -1 }).lean();
    }

    if (analysis) {
      processedResumes.push({
        resume: {
          id: r._id.toString(),
          title: String(r.title || 'Untitled Resume'),
          parsedData: JSON.parse(JSON.stringify(r.parsedData || {})),
          createdAt: r.createdAt ? new Date(r.createdAt).toISOString() : null,
          updatedAt: r.updatedAt ? new Date(r.updatedAt).toISOString() : (r.createdAt ? new Date(r.createdAt).toISOString() : null),
        },
        analysis: {
          id: analysis._id.toString(),
          keywords: JSON.parse(JSON.stringify(analysis.keywords || {})),
          ats: JSON.parse(JSON.stringify(analysis.ats || {})),
          optimization: JSON.parse(JSON.stringify(analysis.optimization || {})),
          parsedData: JSON.parse(JSON.stringify(analysis.parsedData || {})),
          createdAt: analysis.createdAt ? new Date(analysis.createdAt).toISOString() : null,
        }
      });
    }
  }

  // Fallbacks for the oldest/backward compatibility
  const defaultResume = processedResumes.length > 0 ? processedResumes[0].resume : null;
  const defaultAnalysis = processedResumes.length > 0 ? processedResumes[0].analysis : null;

  return (
    <JobMatchClient 
      items={processedResumes}
      resume={defaultResume} 
      analysis={defaultAnalysis} 
    />
  );
}
