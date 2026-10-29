import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISettingsDocument extends Document {
  key: string;
  data: any;
  updatedAt: string;
}

const SettingsSchema = new Schema<ISettingsDocument>(
  {
    key: { type: String, required: true, unique: true, index: true },
    data: { type: Schema.Types.Mixed, required: true },
    updatedAt: { type: String, default: () => new Date().toISOString() },
  },
  {
    timestamps: true,
  }
);

export const SettingsModel: Model<ISettingsDocument> =
  mongoose.models.SiteSetting || mongoose.model<ISettingsDocument>('SiteSetting', SettingsSchema);

