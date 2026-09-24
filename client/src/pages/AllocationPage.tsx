import { useEffect, useState } from 'react';
import { apiFetch } from '../api/api';
import { PageHeader } from '../components/PageHeader';
import { Loading } from '../components/Loading';
import { StatusMessage } from '../components/StatusMessage';
import { EmptyState } from '../components/EmptyState';
import type { AllocationCategory, AllocationConfig, AllocationType } from '../types';

interface DraftCategory {
  _id?: string;
  name: string;
  type: AllocationType;
  percentage: string;
  fixedAmount: string;
}

function toDraft(category: AllocationCategory): DraftCategory {
  return { _id: category._id, name: category.name, type: category.type, percentage: String(category.percentage ?? ''), fixedAmount: String(category.fixedAmount ?? '') };
}

export function AllocationPage() {
  const [config, setConfig] = useState<AllocationConfig | null>(null);
  const [draft, setDraft] = useState<DraftCategory[]>([]);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  async function load() {
    try {
      const result = await apiFetch<{ config: AllocationConfig | null }>('/allocation');
      setConfig(result.config);
      setDraft((result.config?.categories || []).sort((a, b) => a.sortOrder - b.sortOrder).map(toDraft));
    } catch (err) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Unable to load allocation.' });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(); }, []);

  function addCategory() {
    setDraft((current) => [...current, { name: '', type: 'PERCENTAGE', percentage: '', fixedAmount: '' }]);
  }

  function update(index: number, field: keyof DraftCategory, value: string) {
    setDraft((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, [field]: value } : item));
  }

  function remove(index: number) {
    setDraft((current) => current.filter((_, itemIndex) => itemIndex !== index));
  }

  function move(index: number, direction: -1 | 1) {
    const next = index + direction;
    if (next < 0 || next >= draft.length) return;
    setDraft((current) => {
      const copy = [...current];
      [copy[index], copy[next]] = [copy[next], copy[index]];
      return copy;
    });
  }

  async function save() {
    setSaving(true);
    setMessage(null);
    try {
      const result = await apiFetch<{ message: string; config: AllocationConfig }>('/allocation', {
        method: 'PUT',
        body: JSON.stringify({ categories: draft.map((item) => ({ _id: item._id, name: item.name, type: item.type, percentage: Number(item.percentage || 0), fixedAmount: Number(item.fixedAmount || 0) })) }),
      });
      setConfig(result.config);
      setDraft(result.config.categories.sort((a, b) => a.sortOrder - b.sortOrder).map(toDraft));
      setEditing(false);
      setMessage({ type: 'success', text: result.message });
    } catch (err) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Unable to save allocation.' });
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <Loading text="Loading allocation..." />;

  const percentageTotal = draft.filter((item) => item.type === 'PERCENTAGE').reduce((sum, item) => sum + Number(item.percentage || 0), 0);
  const remainingCount = draft.filter((item) => item.type === 'REMAINING').length;

  return (
    <div>
      <PageHeader title="Allocation" subtitle="Define how each new Cash In is distributed." action={!editing && <button className="btn-primary-custom" onClick={() => setEditing(true)}><i className="bi bi-pencil-square" /> Edit allocation</button>} />
      {message && <StatusMessage type={message.type} message={message.text} onClose={() => setMessage(null)} />}

      {!config && !draft.length ? <div className="card-custom"><EmptyState icon="bi-pie-chart" title="No allocation configuration" message="Create categories to control your budget allocation." /></div> : (
        <>
          {editing && <div className="allocation-validation"><span>Percentage total: <strong>{percentageTotal}%</strong></span><span>Remaining categories: <strong>{remainingCount}</strong></span><span>Only one Remaining category is allowed.</span></div>}
          <section className="card-custom">
            <div className="section-heading"><div><h2>Allocation categories</h2><p>{editing ? 'Changes affect future budget cycles, not historical snapshots.' : 'The current configuration used when a new Cash In is created.'}</p></div></div>
            <div className="allocation-editor">
              {draft.map((item, index) => (
                <div className="allocation-row" key={item._id || `new-${index}`}>
                  {editing ? <>
                    <div className="order-buttons"><button className="icon-button small" onClick={() => move(index, -1)} disabled={index === 0}><i className="bi bi-chevron-up" /></button><button className="icon-button small" onClick={() => move(index, 1)} disabled={index === draft.length - 1}><i className="bi bi-chevron-down" /></button></div>
                    <input value={item.name} onChange={(e) => update(index, 'name', e.target.value)} placeholder="Category name" />
                    <select value={item.type} onChange={(e) => update(index, 'type', e.target.value as AllocationType)}><option value="PERCENTAGE">Percentage</option><option value="FIXED">Fixed</option><option value="REMAINING">Remaining</option></select>
                    {item.type === 'PERCENTAGE' ? <input type="number" min="0" max="100" step="0.01" value={item.percentage} onChange={(e) => update(index, 'percentage', e.target.value)} placeholder="%" /> : item.type === 'FIXED' ? <input type="number" min="0" step="0.01" value={item.fixedAmount} onChange={(e) => update(index, 'fixedAmount', e.target.value)} placeholder="₹ amount" /> : <div className="remaining-label">Auto calculated</div>}
                    <button className="btn-danger-icon" onClick={() => remove(index)} title="Delete category"><i className="bi bi-trash3" /></button>
                  </> : <>
                    <div className="allocation-number">{index + 1}</div><div className="allocation-name"><strong>{item.name}</strong><span>{item.type === 'PERCENTAGE' ? `${item.percentage}% of Cash In` : item.type === 'FIXED' ? `Fixed ${item.fixedAmount}` : 'All remaining amount'}</span></div><span className="status-badge neutral">{item.type}</span>
                  </>}
                </div>
              ))}
            </div>
            {editing && <div className="allocation-actions"><button className="btn-secondary-custom" onClick={addCategory}><i className="bi bi-plus-lg" /> Add category</button><div><button className="btn-secondary-custom" onClick={() => { setEditing(false); void load(); }}>Cancel</button><button className="btn-primary-custom" onClick={() => void save()} disabled={saving}>{saving ? 'Saving...' : 'Save allocation'}</button></div></div>}
          </section>
        </>
      )}
    </div>
  );
}
