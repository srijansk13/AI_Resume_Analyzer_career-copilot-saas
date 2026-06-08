import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IUserPreferences {
  professionalSummary: string;
  targetRoleTitle: string;
  desiredCompensation: string;
  preferredWorkModel: 'Remote' | 'Hybrid' | 'Onsite';
  recruiterMode: boolean;
  atsOptimization: boolean;
  defaultWritingTone: string;
  exportPaperSize: 'A4' | 'Letter';
  telemetry: boolean;
  developerLog: boolean;
  resumeLinkAutoDetect: boolean;
}

export interface IUser extends Document {
  email: string;
  name: string;
  tier: 'free' | 'pro' | 'enterprise';
  preferences: IUserPreferences;
  createdAt: Date;
  updatedAt: Date;
}

const UserPreferencesSchema = new Schema(
  {
    professionalSummary: { type: String, default: '' },
    targetRoleTitle: { type: String, default: '' },
    desiredCompensation: { type: String, default: '$120k – $150k USD' },
    preferredWorkModel: { type: String, enum: ['Remote', 'Hybrid', 'Onsite'], default: 'Remote' },
    recruiterMode: { type: Boolean, default: true },
    atsOptimization: { type: Boolean, default: false },
    defaultWritingTone: { type: String, default: 'Confident & Quantitative' },
    exportPaperSize: { type: String, enum: ['A4', 'Letter'], default: 'A4' },
    telemetry: { type: Boolean, default: true },
    developerLog: { type: Boolean, default: false },
    resumeLinkAutoDetect: { type: Boolean, default: true },
  },
  { _id: false }
);

const UserSchema: Schema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    tier: {
      type: String,
      enum: ['free', 'pro', 'enterprise'],
      default: 'free',
    },
    preferences: {
      type: UserPreferencesSchema,
      default: () => ({}),
    },
  },
  {
    timestamps: true,
  }
);

// Prevent mongoose from recompiling the model in development
const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;
