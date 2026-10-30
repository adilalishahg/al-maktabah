import type { Document } from 'mongoose';
import type mongoose from 'mongoose';
import type { HomeSettings } from './homeSettings';

/**
 * Global cache interface for Mongoose in serverless / hot-reload environments.
 */
export interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

/**
 * Chapter sub-document schema shape.
 */
export interface IChapter {
  id: string;
  number: number;
  title: string;
  arabicTitle: string;
  startPage: number;
  content: string;
  translation: string;
  notes: string;
}

/**
 * Mongoose document interface for BookModel collection.
 */
export interface IBookDocument extends Document {
  id: string;
  title: string;
  arabicTitle: string;
  author: string;
  authorHijriYear: string;
  discipline: string;
  disciplineName: string;
  coverImage: string;
  pdfUrl?: string;
  description: string;
  pages: number;
  sizeMb: number;
  edition: string;
  volumes: number;
  verified: boolean;
  published: boolean;
  formats: string[];
  chapters: IChapter[];
  createdAt: string;
  updatedAt: string;
}

/**
 * Sub-branch sub-document schema shape for categories.
 */
export interface ISubBranch {
  title: string;
  description: string;
  count: number;
}

/**
 * Mongoose document interface for CategoryModel collection.
 */
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

/**
 * Mongoose document interface for SettingsModel collection.
 */
export interface ISettingsDocument extends Document {
  key: string;
  data: HomeSettings | Record<string, unknown>;
  updatedAt: string;
}
