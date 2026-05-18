import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IAnalysis extends Document {
  resumeId: mongoose.Types.ObjectId;
  ats: any;
  recruiter: any;
  roadmap: any;
  keywords: any;
  wow: any;
  optimization: any;
  parsedData: any;
  analysisSource: string;
  modelUsed: string;
  fallbackUsed: boolean;
  aiParseStatus: string;
  moduleSources: any;
  createdAt: Date;
  updatedAt: Date;
}

const AnalysisSchema: Schema = new Schema(
  {
    resumeId: {
      type: Schema.Types.ObjectId,
      ref: 'Resume',
      required: true,
      index: true,
    },
  ats: { type: Schema.Types.Mixed },
  recruiter: { type: Schema.Types.Mixed },
  roadmap: { type: Schema.Types.Mixed },
  keywords: { type: Schema.Types.Mixed },
  wow: { type: Schema.Types.Mixed },
  optimization: { type: Schema.Types.Mixed },
  parsedData: { type: Schema.Types.Mixed },
  analysisSource: { type: String, default: 'hybrid' },
  modelUsed: { type: String, default: 'unknown' },
  fallbackUsed: { type: Boolean, default: true },
  aiParseStatus: { type: String, default: 'unknown' },
  moduleSources: { type: Schema.Types.Mixed },
  },
  {
    timestamps: true,
  }
);

AnalysisSchema.index({ resumeId: 1, createdAt: -1 });
AnalysisSchema.index({ analysisSource: 1 });

const Analysis: Model<IAnalysis> = mongoose.models.Analysis || mongoose.model<IAnalysis>('Analysis', AnalysisSchema);

export default Analysis;
