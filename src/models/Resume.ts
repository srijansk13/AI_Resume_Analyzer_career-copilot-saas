import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IResume extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  parsedData: any; // Flexible JSON from AI
  originalText?: string;
  textHash: string;
  createdAt: Date;
  updatedAt: Date;
}

const ResumeSchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      default: 'Untitled Resume',
    },
    parsedData: {
      type: Schema.Types.Mixed,
      required: true,
    },
    originalText: {
      type: String,
    },
    textHash: {
      type: String,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

const Resume: Model<IResume> = mongoose.models.Resume || mongoose.model<IResume>('Resume', ResumeSchema);

export default Resume;
