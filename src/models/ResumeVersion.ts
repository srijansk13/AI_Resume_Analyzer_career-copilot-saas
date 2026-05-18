import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IResumeVersion extends Document {
  userId: mongoose.Types.ObjectId; // E.g., user who owns the resume
  title: string;
  originalText: string;
  isActive: boolean;
  parentVersionId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ResumeVersionSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    title: { type: String, required: true },
    originalText: { type: String, required: true },
    isActive: { type: Boolean, default: true },
    parentVersionId: { type: Schema.Types.ObjectId, ref: 'ResumeVersion' }
  },
  { timestamps: true }
);

const ResumeVersion: Model<IResumeVersion> = mongoose.models.ResumeVersion || mongoose.model<IResumeVersion>('ResumeVersion', ResumeVersionSchema);

export default ResumeVersion;
