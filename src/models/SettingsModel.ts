import mongoose, { Schema, Model } from 'mongoose';
import type { ISettingsDocument } from '@/types/models';

export type { ISettingsDocument };

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

