import { notFound } from 'next/navigation';
import connectToDatabase from '@/lib/db';
import Analysis from '@/models/Analysis';
import Resume from '@/models/Resume';
import AnalysisClient from './AnalysisClient';

export default async function AnalysisPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  
  if (!resolvedParams.id || resolvedParams.id === 'recent') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-white">
        <h1 className="text-3xl font-bold mb-4">Invalid Analysis ID</h1>
        <p className="text-gray-400">Please upload a resume to view its analysis.</p>
      </div>
    );
  }

  console.log(`[Analysis Page] Fetching analysis for analysis ID: ${resolvedParams.id}`);
  await connectToDatabase();

  try {
    const analysis = await Analysis.findById(resolvedParams.id).lean();
    
    if (!analysis) {
      console.warn(`[Analysis Page] No analysis found for analysis ID: ${resolvedParams.id}`);
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-[#030303] text-white">
          <div className="p-8 border border-white/10 rounded-3xl bg-white/[0.02] text-center max-w-md">
            <h1 className="text-3xl font-bold mb-4 text-white">Analysis Not Found</h1>
            <p className="text-gray-400">We couldn't locate the intelligence report for this document. It may have been deleted or the ID is incorrect.</p>
          </div>
        </div>
      );
    }

    const resume = await Resume.findById(analysis.resumeId).lean();

    if (!resume) {
      console.warn(`[Analysis Page] Resume not found for analysis ID: ${resolvedParams.id}`);
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-[#030303] text-white">
          <div className="p-8 border border-white/10 rounded-3xl bg-white/[0.02] text-center max-w-md">
            <h1 className="text-3xl font-bold mb-4 text-white">Resume Not Found</h1>
            <p className="text-gray-400">The original resume document could not be found.</p>
          </div>
        </div>
      );
    }

    console.log(`[Analysis Page] Successfully loaded analysis for: ${resume.title}`);

  // Pass data to client component for interactivity/animations
  return (
    <AnalysisClient 
      analysis={JSON.parse(JSON.stringify(analysis))} 
      resume={JSON.parse(JSON.stringify(resume))} 
    />
  );
  } catch (error) {
    console.error(`[Analysis Page] Error fetching data:`, error);
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-white">
        <h1 className="text-3xl font-bold mb-4 text-red-500">Error Loading Dashboard</h1>
        <p className="text-gray-400">An unexpected database error occurred.</p>
      </div>
    );
  }
}
