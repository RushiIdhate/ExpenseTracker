import { useEffect, useState } from 'react';
import { apiFetch } from '../api/api';
import { EmptyState } from '../components/EmptyState';
import { Loading } from '../components/Loading';
import { PageHeader } from '../components/PageHeader';
import { Modal } from '../components/Modal';
import { StatusMessage } from '../components/StatusMessage';
import type { HistoryBudget } from '../types';
import { dateOnly, dateTime, money } from '../utils/format';

export function HistoryPage() {
  const [history, setHistory] = useState<HistoryBudget[]>([]);
  const [selected, setSelected] = useState<HistoryBudget | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function load() {
    try {
      const result = await apiFetch<{ history: HistoryBudget[] }>('/budget/history');
      setHistory(result.history);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load history.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(); }, []);

  if (loading) return <Loading text="Loading history..." />;

  return (
    <div>
      <PageHeader title="History" subtitle="Closed budget cycles and their preserved expense records." />
      {error && <StatusMessage type="error" message={error} />}
      {!history.length ? <div className="card-custom"><EmptyState icon="bi-clock-history" title="No history yet" message="When you create a new Cash In while a cycle is active, the previous cycle appears here." /></div> : (
        <div className="history-list">
          {history.map((cycle) => {
            const spent = cycle.categories.reduce((sum, category) => sum + category.spent, 0);
            return <section className="card-custom history-card" key={cycle._id}><div className="history-header"><div><span className="status-badge neutral">Closed cycle</span><h2>{money(cycle.cashIn)}</h2><p>{dateOnly(cycle.startDate)} → {dateOnly(cycle.endDate)}</p></div><button className="btn-secondary-custom" onClick={() => setSelected(cycle)}>View details <i className="bi bi-arrow-right" /></button></div><div className="history-metrics"><div><span>Spent</span><strong>{money(spent)}</strong></div><div><span>Remaining</span><strong>{money(Math.max(0, cycle.cashIn - spent))}</strong></div><div><span>Categories</span><strong>{cycle.categories.length}</strong></div><div><span>Expenses</span><strong>{cycle.expenses.length}</strong></div></div></section>;
          })}
        </div>
      )}

      <Modal open={Boolean(selected)} title={selected ? `Cycle — ${money(selected.cashIn)}` : 'Cycle details'} onClose={() => setSelected(null)}>
        {selected && <div className="history-detail">
          <div className="detail-banner"><span>{dateOnly(selected.startDate)} → {dateOnly(selected.endDate)}</span><strong>Cash In {money(selected.cashIn)}</strong></div>
          <h3>Historical categories</h3>
          <div className="table-responsive-custom"><table className="table-custom"><thead><tr><th>Category</th><th>Type</th><th>Budget</th><th>Spent</th><th>Remaining</th></tr></thead><tbody>{selected.categories.map((category) => <tr key={category.categoryId}><td>{category.name}</td><td><span className="status-badge neutral">{category.type}</span></td><td>{money(category.budget)}</td><td>{money(category.spent)}</td><td>{money(Math.max(0, category.budget - category.spent))}</td></tr>)}</tbody></table></div>
          <h3>Historical expenses</h3>
          {selected.expenses.length ? <div className="table-responsive-custom"><table className="table-custom"><thead><tr><th>Description</th><th>Category</th><th>Date</th><th className="text-end">Amount</th></tr></thead><tbody>{selected.expenses.map((expense) => <tr key={expense._id}><td>{expense.description}</td><td>{expense.categoryName}</td><td>{dateTime(expense.expenseDate)}</td><td className="text-end">{money(expense.amount)}</td></tr>)}</tbody></table></div> : <p className="muted-text">No expenses were recorded in this cycle.</p>}
        </div>}
      </Modal>
    </div>
  );
}
