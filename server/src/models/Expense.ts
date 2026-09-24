import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IExpense extends Document {
  userId: Types.ObjectId;
  budgetId: Types.ObjectId;
  categoryId: string;
  categoryName: string;
  description: string;
  amount: number;
  expenseDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

const expenseSchema = new Schema<IExpense>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    budgetId: { type: Schema.Types.ObjectId, ref: 'BudgetCycle', required: true, index: true },
    categoryId: { type: String, required: true },
    categoryName: { type: String, required: true },
    description: { type: String, required: true, trim: true, maxlength: 300 },
    amount: { type: Number, required: true, min: 0.01 },
    expenseDate: { type: Date, required: true },
  },
  { timestamps: true }
);

export const Expense = mongoose.model<IExpense>('Expense', expenseSchema);
