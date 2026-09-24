import { useEffect, useState, type FormEvent } from 'react';
import { apiFetch } from '../api/api';
import { EmptyState } from '../components/EmptyState';
import { Loading } from '../components/Loading';
import { PageHeader } from '../components/PageHeader';
import { StatusMessage } from '../components/StatusMessage';
import type { Budget, Expense } from '../types';
import { dateOnly, money, todayInputValue } from '../utils/format';

export function ExpensesPage() {
  const [budget, setBudget] = useState<Budget | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categoryId, setCategoryId] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [expenseDate, setExpenseDate] = useState(todayInputValue());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  async function load() {
    try {
      const [budgetResult, expenseResult] = await Promise.all([
        apiFetch<{ budget: Budget | null }>('/budget/current'),
        apiFetch<{ expenses: Expense[] }>('/expenses'),
      ]);
      setBudget(budgetResult.budget);
      setExpenses(expenseResult.expenses);
      if (!categoryId && budgetResult.budget?.categories[0]) setCategoryId(budgetResult.budget.categories[0].categoryId);
    } catch (err) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Unable to load expenses.' });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(); }, []);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      await apiFetch('/expenses', { method: 'POST', body: JSON.stringify({ categoryId, description, amount: Number(amount), expenseDate }) });
      setDescription('');
      setAmount('');
      setMessage({ type: 'success', text: 'Expense added successfully.' });
      await load();
    } catch (err) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Unable to add expense.' });
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    if (!window.confirm('Delete this expense? The category remaining budget will be restored.')) return;
    try {
      await apiFetch(`/expenses/${id}`, { method: 'DELETE' });
      setMessage({ type: 'success', text: 'Expense deleted successfully.' });
      await load();
    } catch (err) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Unable to delete expense.' });
    }
  }

  if (loading) return <Loading text="Loading expenses..." />;

  const selectedCategory = budget?.categories.find((item) => item.categoryId === categoryId);
  const selectedRemaining = selectedCategory ? Math.max(0, selectedCategory.budget - selectedCategory.spent) : 0;

  return (
    <div>
      <PageHeader title="Expenses" subtitle="Record spending against the active budget category." />
      {message && <StatusMessage type={message.type} message={message.text} onClose={() => setMessage(null)} />}

      {!budget ? (
        <div className="card-custom"><EmptyState icon="bi-wallet2" title="No active budget" message="Add Cash In before recording expenses." /></div>
      ) : (
        <>
          <section className="card-custom">
            <div className="section-heading"><div><h2>Add expense</h2><p>Available in selected category: {money(selectedRemaining)}</p></div></div>
            <form onSubmit={submit} className="expense-form-grid">
              <label className="form-label-custom">Category<select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} required>{budget.categories.map((category) => <option key={category.categoryId} value={category.categoryId}>{category.name} — {money(Math.max(0, category.budget - category.spent))} left</option>)}</select></label>
              <label className="form-label-custom">Amount<input type="number" min="0.01" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="500" required /></label>
              <label className="form-label-custom">Expense date<input type="date" value={expenseDate} onChange={(e) => setExpenseDate(e.target.value)} required /></label>
              <label className="form-label-custom full-width">Description<textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What did you spend on?" rows={3} maxLength={300} required /></label>
              <div className="full-width"><button className="btn-primary-custom" disabled={saving}>{saving ? 'Saving...' : 'Add expense'}</button></div>
            </form>
          </section>

          <section className="card-custom mt-4">
            <div className="section-heading"><div><h2>Expense list</h2><p>Latest expenses in the active cycle</p></div></div>
            {!expenses.length ? <EmptyState icon="bi-receipt" title="No expenses" message="Your expense records will appear here." /> : <div className="table-responsive-custom"><table className="table-custom"><thead><tr><th>Description</th><th>Category</th><th>Date</th><th className="text-end">Amount</th><th className="text-end">Action</th></tr></thead><tbody>{expenses.map((expense) => <tr key={expense._id}><td>{expense.description}</td><td><span className="status-badge neutral">{expense.categoryName}</span></td><td>{dateOnly(expense.expenseDate)}</td><td className="text-end expense-amount">-{money(expense.amount)}</td><td className="text-end"><button className="btn-danger-icon" onClick={() => void remove(expense._id)} title="Delete"><i className="bi bi-trash3" /></button></td></tr>)}</tbody></table></div>}
          </section>
        </>
      )}
    </div>
  );
}
