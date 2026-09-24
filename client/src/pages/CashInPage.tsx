import { useEffect, useState, type FormEvent } from 'react';
import { apiFetch } from '../api/api';
import { PageHeader } from '../components/PageHeader';
import { Loading } from '../components/Loading';
import { StatusMessage } from '../components/StatusMessage';
import { EmptyState } from '../components/EmptyState';
import type { Budget } from '../types';
import { dateOnly, money } from '../utils/format';

export function CashInPage() {
  const [budget, setBudget] = useState<Budget | null>(null);
  const [cashIn, setCashIn] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  async function load() {
    try {
      const result = await apiFetch<{ budget: Budget | null }>('/budget/current');
      setBudget(result.budget);
    } catch (err) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Unable to load budget.' });
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
      const result = await apiFetch<{ message: string; budget: Budget }>('/budget', { method: 'POST', body: JSON.stringify({ cashIn: Number(cashIn) }) });
      setBudget(result.budget);
      setCashIn('');
      setMessage({ type: 'success', text: result.message });
    } catch (err) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Unable to create budget.' });
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <Loading text="Loading budget..." />;

  const allocated = budget?.categories.reduce((sum, category) => sum + category.budget, 0) || 0;
  const remaining = Math.max(0, (budget?.cashIn || 0) - allocated);

  return (
    <div>
      <PageHeader title="Cash In" subtitle="Create a new budget cycle from your available cash." />
      {message && <StatusMessage type={message.type} message={message.text} onClose={() => setMessage(null)} />}

      <div className="two-column-layout">
        <section className="card-custom">
          <div className="section-heading"><div><h2>New Cash In</h2><p>A new Cash In closes the current active cycle.</p></div></div>
          <form onSubmit={submit} className="form-stack">
            <label className="form-label-custom">Cash In amount<input type="number" min="0.01" step="0.01" value={cashIn} onChange={(e) => setCashIn(e.target.value)} placeholder="50000" required /></label>
            <button className="btn-primary-custom" disabled={saving}>{saving ? 'Creating cycle...' : 'Create budget cycle'}</button>
          </form>
          <div className="info-note"><i className="bi bi-info-circle" /> Previous active cycle is closed and remains available in History.</div>
        </section>

        <section className="card-custom">
          <div className="section-heading"><div><h2>Current cycle</h2><p>Live budget status</p></div></div>
          {!budget ? <EmptyState icon="bi-wallet" title="No active cycle" message="Create Cash In to start your first cycle." /> : <>
            <div className="big-number">{money(budget.cashIn)}</div>
            <div className="cycle-meta"><span>Started</span><strong>{dateOnly(budget.startDate)}</strong></div>
            <div className="cycle-meta"><span>Total allocated</span><strong>{money(allocated)}</strong></div>
            <div className="cycle-meta"><span>Unallocated</span><strong>{money(remaining)}</strong></div>
          </>}
        </section>
      </div>

      {budget && <section className="card-custom mt-4"><div className="section-heading"><div><h2>Category allocations</h2><p>Snapshot used by this budget cycle</p></div></div><div className="allocation-grid">{budget.categories.map((category) => <div className="allocation-card" key={category.categoryId}><span className="status-badge neutral">{category.type}</span><h3>{category.name}</h3><strong>{money(category.budget)}</strong>{category.type === 'PERCENTAGE' && <small>{category.percentage}% of Cash In</small>}{category.type === 'FIXED' && <small>Fixed amount</small>}{category.type === 'REMAINING' && <small>Remaining amount</small>}</div>)}</div></section>}
    </div>
  );
}
