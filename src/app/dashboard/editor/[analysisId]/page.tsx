import connectToDatabase from '@/lib/db';
import Analysis from '@/models/Analysis';
import Resume from '@/models/Resume';
import LiveEditorClient from './LiveEditorClient';

export default async function EditorPage({
  params,
}: {
  params: Promise<{ analysisId: string }>;
}) {
  const resolvedParams = await params;
  
  if (!resolvedParams.analysisId || resolvedParams.analysisId === 'recent') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-white">
        <h1 className="text-3xl font-bold mb-4">Invalid Analysis ID</h1>
        <p className="text-gray-400">Please provide a valid analysis ID to edit.</p>
      </div>
    );
  }

  await connectToDatabase();

  try {
    const analysis = await Analysis.findById(resolvedParams.analysisId).lean();
    
    if (!analysis) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-[#030303] text-white">
          <div className="p-8 border border-white/10 rounded-3xl bg-white/[0.02] text-center max-w-md">
            <h1 className="text-3xl font-bold mb-4 text-white">Analysis Not Found</h1>
            <p className="text-gray-400">We couldn't locate the intelligence report for this document.</p>
          </div>
        </div>
      );
    }

    const resume = await Resume.findById(analysis.resumeId).lean();

    if (!resume) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-[#030303] text-white">
          <div className="p-8 border border-white/10 rounded-3xl bg-white/[0.02] text-center max-w-md">
            <h1 className="text-3xl font-bold mb-4 text-white">Resume Not Found</h1>
            <p className="text-gray-400">The original resume document could not be found.</p>
          </div>
        </div>
      );
    }

    return (
      <LiveEditorClient 
        analysis={JSON.parse(JSON.stringify(analysis))} 
        resume={JSON.parse(JSON.stringify(resume))} 
      />
    );
  } catch (error) {
    console.error(`[Editor Page] Error fetching data:`, error);
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-white">
        <h1 className="text-3xl font-bold mb-4 text-red-500">Error Loading Editor</h1>
        <p className="text-gray-400">An unexpected database error occurred.</p>
      </div>
    );
  }
}
