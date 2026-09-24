import type { IAllocationCategory } from '../models/AllocationConfig';

export interface CalculatedCategory {
  categoryId: string;
  name: string;
  type: IAllocationCategory['type'];
  percentage?: number;
  fixedAmount?: number;
  budget: number;
  spent: number;
}

export function validateAllocationConfig(categories: IAllocationCategory[]): string | null {
  if (!categories.length) return 'Add at least one allocation category.';

  const names = categories.map((category) => category.name.trim().toLowerCase());
  if (new Set(names).size !== names.length) return 'Category names must be unique.';

  const remaining = categories.filter((category) => category.type === 'REMAINING');
  if (remaining.length > 1) return 'Only one Remaining category is allowed.';

  const percentageTotal = categories
    .filter((category) => category.type === 'PERCENTAGE')
    .reduce((sum, category) => sum + Number(category.percentage || 0), 0);

  if (percentageTotal > 100) return 'Percentage allocation cannot exceed 100%.';

  for (const category of categories) {
    if (!category.name.trim()) return 'Every category needs a name.';
    if (category.type === 'PERCENTAGE' && (category.percentage === undefined || category.percentage < 0)) {
      return `Enter a valid percentage for ${category.name}.`;
    }
    if (category.type === 'FIXED' && (category.fixedAmount === undefined || category.fixedAmount < 0)) {
      return `Enter a valid fixed amount for ${category.name}.`;
    }
  }

  if (remaining.length === 0 && percentageTotal !== 100) {
    return 'Without a Remaining category, percentage allocations must total exactly 100%. Fixed allocations are taken from the cash in first.';
  }

  return null;
}

export function calculateCategories(categories: IAllocationCategory[], cashIn: number): CalculatedCategory[] {
  const fixedTotal = categories
    .filter((category) => category.type === 'FIXED')
    .reduce((sum, category) => sum + Number(category.fixedAmount || 0), 0);

  const percentageTotal = categories
    .filter((category) => category.type === 'PERCENTAGE')
    .reduce((sum, category) => sum + (cashIn * Number(category.percentage || 0)) / 100, 0);

  const remainingBudget = cashIn - fixedTotal - percentageTotal;

  if (remainingBudget < -0.005) {
    throw new Error('Allocation exceeds the available Cash In.');
  }

  return categories.map((category) => {
    let budget = 0;
    if (category.type === 'PERCENTAGE') {
      budget = (cashIn * Number(category.percentage || 0)) / 100;
    } else if (category.type === 'FIXED') {
      budget = Number(category.fixedAmount || 0);
    } else {
      budget = Math.max(0, remainingBudget);
    }

    return {
      categoryId: String(category._id),
      name: category.name.trim(),
      type: category.type,
      percentage: category.percentage,
      fixedAmount: category.fixedAmount,
      budget: Math.round(budget * 100) / 100,
      spent: 0,
    };
  });
}

export function totalSpent(categories: { spent: number }[]): number {
  return categories.reduce((sum, category) => sum + Number(category.spent || 0), 0);
}
