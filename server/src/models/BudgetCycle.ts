import mongoose, { Document, Schema, Types } from 'mongoose';
import type { AllocationType } from './AllocationConfig';

export interface IBudgetCategorySnapshot {
  categoryId: string;
  name: string;
  type: AllocationType;
  percentage?: number;
  fixedAmount?: number;
  budget: number;
  spent: number;
}

export interface IAllocationSnapshot {
  categoryId: string;
  name: string;
  type: AllocationType;
  percentage?: number;
  fixedAmount?: number;
  sortOrder: number;
}

export interface IBudgetCycle extends Document {
  userId: Types.ObjectId;
  cashIn: number;
  startDate: Date;
  endDate?: Date;
  isActive: boolean;
  categories: IBudgetCategorySnapshot[];
  allocationSnapshot: IAllocationSnapshot[];
  createdAt: Date;
  updatedAt: Date;
}

const categorySchema = new Schema<IBudgetCategorySnapshot>({
  categoryId: { type: String, required: true },
  name: { type: String, required: true },
  type: { type: String, enum: ['PERCENTAGE', 'FIXED', 'REMAINING'], required: true },
  percentage: { type: Number, min: 0 },
  fixedAmount: { type: Number, min: 0 },
  budget: { type: Number, required: true, min: 0 },
  spent: { type: Number, required: true, min: 0, default: 0 },
});

const allocationSnapshotSchema = new Schema<IAllocationSnapshot>({
  categoryId: { type: String, required: true },
  name: { type: String, required: true },
  type: { type: String, enum: ['PERCENTAGE', 'FIXED', 'REMAINING'], required: true },
  percentage: { type: Number, min: 0 },
  fixedAmount: { type: Number, min: 0 },
  sortOrder: { type: Number, required: true },
});

const budgetCycleSchema = new Schema<IBudgetCycle>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    cashIn: { type: Number, required: true, min: 0 },
    startDate: { type: Date, required: true },
    endDate: { type: Date },
    isActive: { type: Boolean, default: true, index: true },
    categories: { type: [categorySchema], default: [] },
    allocationSnapshot: { type: [allocationSnapshotSchema], default: [] },
  },
  { timestamps: true }
);

export const BudgetCycle = mongoose.model<IBudgetCycle>('BudgetCycle', budgetCycleSchema);
