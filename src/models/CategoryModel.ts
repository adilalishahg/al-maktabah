import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISubBranch {
  title: string;
  description: string;
  count: number;
}

export interface ICategoryDocument extends Document {
  id: string;
  name: string;
  arabicName: string;
  icon: string;
  description: string;
  volumeCount: number;
  tags: string[];
  subBranches: ISubBranch[];
  foundationTreatises: string[];
  createdAt: string;
  updatedAt: string;
}

const SubBranchSchema = new Schema<ISubBranch>(
  {
    title: { type: String, required: true },
    description: { type: String, default: '' },
    count: { type: Number, default: 0 },
  },
  { _id: false }
);

const CategorySchema = new Schema<ICategoryDocument>(
  {
    id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, trim: true },
    arabicName: { type: String, default: '', trim: true },
    icon: { type: String, default: 'category' },
    description: { type: String, default: '' },
    volumeCount: { type: Number, default: 0 },
    tags: { type: [String], default: [] },
    subBranches: { type: [SubBranchSchema], default: [] },
    foundationTreatises: { type: [String], default: [] },
  },
  {
    timestamps: true,
  }
);

// Fast text search across classification names and descriptions
CategorySchema.index({ name: 'text', arabicName: 'text', description: 'text' });

export const CategoryModel: Model<ICategoryDocument> =
  (mongoose.models?.Category as Model<ICategoryDocument>) ||
  mongoose.model<ICategoryDocument>('Category', CategorySchema);
