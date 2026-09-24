import type { Request, Response } from 'express';
import { AllocationConfig, type AllocationType, type IAllocationCategory } from '../models/AllocationConfig';
import { validateAllocationConfig } from '../utils/budget';

function normalizeCategories(input: unknown[]): IAllocationCategory[] {
  return input.map((item, index) => {
    const value = item as Record<string, unknown>;
    const type = String(value.type || 'PERCENTAGE') as AllocationType;
    const category: IAllocationCategory = {
      _id: undefined as never,
      name: String(value.name || '').trim(),
      type,
      sortOrder: index,
    };

    if (value._id) category._id = value._id as never;
    if (type === 'PERCENTAGE') category.percentage = Number(value.percentage || 0);
    if (type === 'FIXED') category.fixedAmount = Number(value.fixedAmount || 0);
    return category;
  });
}

export async function getAllocation(req: Request, res: Response): Promise<void> {
  const config = await AllocationConfig.findOne({ userId: req.userId });
  res.json({ config });
}

export async function saveAllocation(req: Request, res: Response): Promise<void> {
  const rawCategories = Array.isArray(req.body.categories) ? req.body.categories : [];
  const categories = normalizeCategories(rawCategories);
  const error = validateAllocationConfig(categories);

  if (error) {
    res.status(400).json({ message: error });
    return;
  }

  const config = await AllocationConfig.findOneAndUpdate(
    { userId: req.userId },
    { $set: { categories } },
    { upsert: true, new: true, runValidators: true }
  );

  res.json({ message: 'Allocation saved successfully.', config });
}
