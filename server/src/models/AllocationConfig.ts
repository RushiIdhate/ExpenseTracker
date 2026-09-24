import mongoose, { Document, Schema, Types } from 'mongoose';

export type AllocationType = 'PERCENTAGE' | 'FIXED' | 'REMAINING';

export interface IAllocationCategory {
  _id: Types.ObjectId;
  name: string;
  type: AllocationType;
  percentage?: number;
  fixedAmount?: number;
  sortOrder: number;
}

export interface IAllocationConfig extends Document {
  userId: Types.ObjectId;
  categories: IAllocationCategory[];
  createdAt: Date;
  updatedAt: Date;
}

const categorySchema = new Schema<IAllocationCategory>({
  name: { type: String, required: true, trim: true, maxlength: 60 },
  type: {
    type: String,
    enum: ['PERCENTAGE', 'FIXED', 'REMAINING'],
    required: true,
  },
  percentage: { type: Number, min: 0 },
  fixedAmount: { type: Number, min: 0 },
  sortOrder: { type: Number, required: true },
});

const allocationConfigSchema = new Schema<IAllocationConfig>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    categories: { type: [categorySchema], default: [] },
  },
  { timestamps: true }
);

export const AllocationConfig = mongoose.model<IAllocationConfig>('AllocationConfig', allocationConfigSchema);
