import type { Request, Response } from 'express';
import { BudgetCycle } from '../models/BudgetCycle';
import { Expense } from '../models/Expense';

export async function listExpenses(req: Request, res: Response): Promise<void> {
  const budgetId = String(req.query.budgetId || '');
  const filter: Record<string, unknown> = { userId: req.userId };
  if (budgetId) filter.budgetId = budgetId;

  const expenses = await Expense.find(filter).sort({ expenseDate: -1, createdAt: -1 });
  res.json({ expenses });
}

export async function createExpense(req: Request, res: Response): Promise<void> {
  const categoryId = String(req.body.categoryId || '');
  const description = String(req.body.description || '').trim();
  const amount = Number(req.body.amount);
  const expenseDate = new Date(req.body.expenseDate);

  if (!categoryId || !description || !Number.isFinite(amount) || amount <= 0 || Number.isNaN(expenseDate.getTime())) {
    res.status(400).json({ message: 'Category, description, valid amount and expense date are required.' });
    return;
  }

  const budget = await BudgetCycle.findOne({ userId: req.userId, isActive: true });
  if (!budget) {
    res.status(400).json({ message: 'Create a Cash In budget before adding an expense.' });
    return;
  }

  const category = budget.categories.find((item) => item.categoryId === categoryId);
  if (!category) {
    res.status(400).json({ message: 'Selected category does not exist in the current budget.' });
    return;
  }

  const remaining = category.budget - category.spent;
  if (amount > remaining + 0.005) {
    res.status(400).json({ message: `Expense exceeds the remaining ${category.name} budget of ₹${remaining.toFixed(2)}.` });
    return;
  }

  category.spent = Math.round((category.spent + amount) * 100) / 100;
  await budget.save();

  try {
    const expense = await Expense.create({
      userId: req.userId,
      budgetId: budget._id,
      categoryId,
      categoryName: category.name,
      description,
      amount,
      expenseDate,
    });

    res.status(201).json({ message: 'Expense added successfully.', expense, budget });
  } catch (error) {
    category.spent = Math.round((category.spent - amount) * 100) / 100;
    await budget.save();
    throw error;
  }
}

export async function deleteExpense(req: Request, res: Response): Promise<void> {
  const expense = await Expense.findOne({ _id: req.params.id, userId: req.userId });
  if (!expense) {
    res.status(404).json({ message: 'Expense not found.' });
    return;
  }

  const budget = await BudgetCycle.findOne({ _id: expense.budgetId, userId: req.userId });
  if (!budget) {
    res.status(404).json({ message: 'Budget cycle not found.' });
    return;
  }

  if (!budget.isActive) {
    res.status(400).json({ message: 'Historical expenses are read-only.' });
    return;
  }

  if (budget.isActive) {
    const category = budget.categories.find((item) => item.categoryId === expense.categoryId);
    if (category) {
      category.spent = Math.max(0, Math.round((category.spent - expense.amount) * 100) / 100);
      await budget.save();
    }
  }

  await expense.deleteOne();
  res.json({ message: 'Expense deleted successfully.' });
}
