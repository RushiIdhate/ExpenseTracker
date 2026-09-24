import type { Request, Response } from 'express';
import { AllocationConfig } from '../models/AllocationConfig';
import { BudgetCycle } from '../models/BudgetCycle';
import { Expense } from '../models/Expense';
import { calculateCategories, totalSpent, validateAllocationConfig } from '../utils/budget';

export async function getCurrentBudget(req: Request, res: Response): Promise<void> {
  const budget = await BudgetCycle.findOne({ userId: req.userId, isActive: true });
  res.json({ budget });
}

export async function createBudget(req: Request, res: Response): Promise<void> {
  const cashIn = Number(req.body.cashIn);
  if (!Number.isFinite(cashIn) || cashIn <= 0) {
    res.status(400).json({ message: 'Cash In must be greater than 0.' });
    return;
  }

  const config = await AllocationConfig.findOne({ userId: req.userId });
  if (!config) {
    res.status(400).json({ message: 'Create an allocation configuration first.' });
    return;
  }

  const allocationError = validateAllocationConfig(config.categories);
  if (allocationError) {
    res.status(400).json({ message: allocationError });
    return;
  }

  let categories;
  try {
    categories = calculateCategories(config.categories, cashIn);
  } catch (error) {
    res.status(400).json({ message: error instanceof Error ? error.message : 'Invalid allocation.' });
    return;
  }

  const now = new Date();
  const previous = await BudgetCycle.findOne({ userId: req.userId, isActive: true });
  if (previous) {
    previous.isActive = false;
    previous.endDate = now;
    await previous.save();
  }

  const allocationSnapshot = config.categories.map((category) => ({
    categoryId: String(category._id),
    name: category.name,
    type: category.type,
    percentage: category.percentage,
    fixedAmount: category.fixedAmount,
    sortOrder: category.sortOrder,
  }));

  const budget = await BudgetCycle.create({
    userId: req.userId,
    cashIn,
    startDate: now,
    isActive: true,
    categories,
    allocationSnapshot,
  });

  res.status(201).json({
    message: previous ? 'Cash In created. Previous cycle moved to History.' : 'Cash In created successfully.',
    budget,
  });
}

export async function getDashboard(req: Request, res: Response): Promise<void> {
  const budget = await BudgetCycle.findOne({ userId: req.userId, isActive: true });
  const empty = {
    budget: null,
    todaySpending: 0,
    monthlySpending: 0,
    totalSpending: 0,
    remainingBudget: 0,
    recentExpenses: [],
  };

  if (!budget) {
    res.json(empty);
    return;
  }

  const expenses = await Expense.find({ budgetId: budget._id }).sort({ expenseDate: -1, createdAt: -1 });
  const totalSpending = totalSpent(budget.categories);
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const todaySpending = expenses
    .filter((expense) => expense.expenseDate >= startOfDay)
    .reduce((sum, expense) => sum + expense.amount, 0);

  const monthlySpending = expenses
    .filter((expense) => expense.expenseDate >= startOfMonth)
    .reduce((sum, expense) => sum + expense.amount, 0);

  res.json({
    budget,
    todaySpending,
    monthlySpending,
    totalSpending,
    remainingBudget: Math.max(0, budget.cashIn - totalSpending),
    recentExpenses: expenses.slice(0, 8),
  });
}

export async function getHistory(req: Request, res: Response): Promise<void> {
  const budgets = await BudgetCycle.find({ userId: req.userId, isActive: false }).sort({ startDate: -1 });
  const result = await Promise.all(
    budgets.map(async (budget) => {
      const expenses = await Expense.find({ budgetId: budget._id }).sort({ expenseDate: -1, createdAt: -1 });
      return { ...budget.toObject(), expenses };
    })
  );
  res.json({ history: result });
}
