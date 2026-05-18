import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IUserContext extends Document {
  userId: mongoose.Types.ObjectId;
  careerGoals: string[];
  preferredRoles: string[];
  historicalStrengths: string[];
  historicalWeaknesses: string[];
  roadmapProgression: any; // Nested object
  createdAt: Date;
  updatedAt: Date;
}

const UserContextSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    careerGoals: [{ type: String }],
    preferredRoles: [{ type: String }],
    historicalStrengths: [{ type: String }],
    historicalWeaknesses: [{ type: String }],
    roadmapProgression: { type: Schema.Types.Mixed }
  },
  { timestamps: true }
);

const UserContext: Model<IUserContext> = mongoose.models.UserContext || mongoose.model<IUserContext>('UserContext', UserContextSchema);

export default UserContext;
