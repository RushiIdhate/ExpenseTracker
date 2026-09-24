export type AllocationType = 'PERCENTAGE' | 'FIXED' | 'REMAINING';

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface AllocationCategory {
  _id: string;
  name: string;
  type: AllocationType;
  percentage?: number;
  fixedAmount?: number;
  sortOrder: number;
}

export interface AllocationConfig {
  _id: string;
  userId: string;
  categories: AllocationCategory[];
}

export interface BudgetCategory {
  categoryId: string;
  name: string;
  type: AllocationType;
  percentage?: number;
  fixedAmount?: number;
  budget: number;
  spent: number;
}

export interface Budget {
  _id: string;
  cashIn: number;
  startDate: string;
  endDate?: string;
  isActive: boolean;
  categories: BudgetCategory[];
  allocationSnapshot: AllocationCategory[];
}

export interface Expense {
  _id: string;
  budgetId: string;
  categoryId: string;
  categoryName: string;
  description: string;
  amount: number;
  expenseDate: string;
  createdAt: string;
}

export interface DashboardData {
  budget: Budget | null;
  todaySpending: number;
  monthlySpending: number;
  totalSpending: number;
  remainingBudget: number;
  recentExpenses: Expense[];
}

export interface HistoryBudget extends Budget {
  expenses: Expense[];
}
