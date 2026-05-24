import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyToken } from '@/lib/auth';
import connectToDatabase from '@/lib/db';
import User from '@/models/User';
import Resume from '@/models/Resume';
import Analysis from '@/models/Analysis';
import UploadArea from '@/components/dashboard/UploadArea';
import DashboardOverviewClient from '@/components/dashboard/DashboardOverviewClient';

export default async function DashboardPage() {
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

  // Retrieve user details dynamically from the database
  const user = await User.findById(payload.userId).lean();
  if (!user) {
    redirect('/login');
  }

  // Retrieve all uploaded resumes of the authenticated user
  const resumes = await Resume.find({ userId: payload.userId }).sort({ createdAt: -1 }).lean();

  // Deduplicate by textHash to count unique resumes
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

    processedResumes.push({
      ...r,
      _id: r._id?.toString(),
      analysisId: analysis ? analysis._id.toString() : null,
      atsScore: analysis?.ats?.overall_ats_score || null,
      wowCount: analysis?.wow?.strengths?.length || 0,
      optimizationCount: analysis?.optimization?.actionable_steps?.length || 0,
    });
  }

  // Calculate live statistics
  const totalResumes = processedResumes.length;
  
  // Calculate average ATS score
  const resumesWithAts = processedResumes.filter(r => r.atsScore !== null);
  const avgAtsScore = resumesWithAts.length > 0
    ? Math.round(resumesWithAts.reduce((sum, r) => sum + r.atsScore, 0) / resumesWithAts.length)
    : 0;

  // Calculate dynamic AI optimizations generated
  const totalWowStrengths = processedResumes.reduce((sum, r) => sum + r.wowCount, 0);
  const totalOptimizations = processedResumes.reduce((sum, r) => sum + r.optimizationCount, 0);
  const aiImprovements = (totalWowStrengths + totalOptimizations) || (totalResumes > 0 ? totalResumes * 4 : 0);

  // Job matches found simulation
  const matchesFound = totalResumes > 0 ? 78 : 0;

  // Returning vs Newly Registered User check
  // User is considered new if they have uploaded 0 resumes or their account was created in the last 15 minutes
  const isNewUser = totalResumes === 0 || (Date.now() - new Date(user.createdAt).getTime() < 15 * 60 * 1000);

  // Map 5 most recent resumes to display
  const safeRecentResumes = processedResumes.slice(0, 5).map((res) => ({
    id: res.analysisId || res._id?.toString() || "",
    title: String(res.title || "Untitled Resume"),
    filename: String(res.title || "Untitled Resume"),
    createdAt: res.createdAt ? new Date(res.createdAt).toISOString() : "",
    atsScore: Number(res.atsScore || 0),
  }));

  const stats = {
    totalResumes,
    avgAtsScore,
    aiImprovements,
    matchesFound,
  };

  return (
    <div className="p-6 lg:p-12 w-full max-w-7xl mx-auto space-y-10">
      {/* Redesigned AI Upload Dropzone */}
      <div
        id="upload-area-box"
        className="w-full max-w-2xl mx-auto pb-12 border-b border-white/[0.03]"
      >
        <UploadArea />
      </div>

      <DashboardOverviewClient 
        userName={user.name || "Srijan"}
        isNewUser={isNewUser}
        stats={stats}
        recentResumes={safeRecentResumes}
      />
    </div>
  );
}
