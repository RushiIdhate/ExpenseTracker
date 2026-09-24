import { useEffect, useState } from 'react';
import { apiFetch } from '../api/api';
import { EmptyState } from '../components/EmptyState';
import { Loading } from '../components/Loading';
import { PageHeader } from '../components/PageHeader';
import { StatusMessage } from '../components/StatusMessage';
import type { DashboardData } from '../types';
import { dateTime, money } from '../utils/format';

export function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function load() {
    try {
      setError('');
      const result = await apiFetch<DashboardData>('/budget/dashboard');
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load dashboard.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(); }, []);

  if (loading) return <Loading text="Loading dashboard..." />;
  if (error) return <><PageHeader title="Dashboard" /><StatusMessage type="error" message={error} /><button className="btn-secondary-custom" onClick={() => void load()}>Retry</button></>;

  const budget = data?.budget;
  const categories = budget?.categories || [];
  const totalBudget = budget?.cashIn || 0;
  const totalSpent = data?.totalSpending || 0;
  const overallPercent = totalBudget ? Math.min(100, (totalSpent / totalBudget) * 100) : 0;

  return (
    <div>
      <PageHeader title="Dashboard" subtitle="Your current budget cycle at a glance." />

      {!budget ? (
        <div className="card-custom">
          <EmptyState icon="bi-wallet2" title="No active budget" message="Add your first Cash In to start a new budget cycle." />
        </div>
      ) : (
        <>
          <div className="summary-grid">
            <SummaryCard icon="bi-calendar-day" label="Today's spending" value={money(data?.todaySpending)} />
            <SummaryCard icon="bi-calendar3" label="Monthly spending" value={money(data?.monthlySpending)} />
            <SummaryCard icon="bi-wallet2" label="Current Cash In" value={money(budget.cashIn)} />
            <SummaryCard icon="bi-piggy-bank" label="Remaining budget" value={money(data?.remainingBudget)} />
          </div>

          <div className="dashboard-grid">
            <section className="card-custom">
              <div className="section-heading">
                <div><h2>Budget overview</h2><p>{Math.round(overallPercent)}% of this cycle spent</p></div>
                <span className="status-badge success">Active</span>
              </div>
              <div className="overall-progress"><span style={{ width: `${overallPercent}%` }} /></div>
              <div className="metric-row"><span>Spent</span><strong>{money(totalSpent)}</strong></div>
              <div className="metric-row"><span>Remaining</span><strong>{money(data?.remainingBudget)}</strong></div>
              <div className="metric-row"><span>Started</span><strong>{new Date(budget.startDate).toLocaleDateString('en-IN')}</strong></div>
            </section>

            <section className="card-custom">
              <div className="section-heading"><div><h2>Category-wise budget</h2><p>Budget, spending and remaining</p></div></div>
              <div className="category-list">
                {categories.map((category) => {
                  const percent = category.budget ? Math.min(100, (category.spent / category.budget) * 100) : 0;
                  const remaining = Math.max(0, category.budget - category.spent);
                  return (
                    <div className="category-item" key={category.categoryId}>
                      <div className="category-top"><strong>{category.name}</strong><span>{Math.round(percent)}%</span></div>
                      <div className="progress-bar"><span style={{ width: `${percent}%` }} /></div>
                      <div className="category-bottom"><span>Spent {money(category.spent)}</span><span>Remaining {money(remaining)}</span></div>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>

          <section className="card-custom mt-4">
            <div className="section-heading"><div><h2>Recent expenses</h2><p>Latest activity in the active cycle</p></div></div>
            {data?.recentExpenses.length ? (
              <div className="table-responsive-custom">
                <table className="table-custom"><thead><tr><th>Description</th><th>Category</th><th>Date</th><th className="text-end">Amount</th></tr></thead>
                  <tbody>{data.recentExpenses.map((expense) => <tr key={expense._id}><td>{expense.description}</td><td><span className="status-badge neutral">{expense.categoryName}</span></td><td>{dateTime(expense.expenseDate)}</td><td className="text-end expense-amount">-{money(expense.amount)}</td></tr>)}</tbody>
                </table>
              </div>
            ) : <EmptyState icon="bi-receipt" title="No expenses yet" message="Your latest expenses will appear here." />}
          </section>
        </>
      )}
    </div>
  );
}

function SummaryCard({ icon, label, value }: { icon: string; label: string; value: string }) {
  return <div className="summary-card"><div className="summary-icon"><i className={`bi ${icon}`} /></div><div><span>{label}</span><strong>{value}</strong></div></div>;
}
