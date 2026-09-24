import { useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { StatusMessage } from '../components/StatusMessage';

export function AuthPage({ mode }: { mode: 'login' | 'register' }) {
  const isLogin = mode === 'login';
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      if (isLogin) await login(email, password);
      else await register(name, email, password);
      const from = (location.state as { from?: string } | null)?.from || '/';
      navigate(from, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Request failed.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-brand">
          <div className="brand-mark large"><i className="bi bi-graph-up-arrow" /></div>
          <div><strong>Expense Tracker</strong><span>Budget smarter. Spend clearly.</span></div>
        </div>
        <div className="auth-heading">
          <h1>{isLogin ? 'Welcome back' : 'Create your account'}</h1>
          <p>{isLogin ? 'Sign in to manage your budget cycles.' : 'Start tracking your cash flow and expenses.'}</p>
        </div>
        {error && <StatusMessage type="error" message={error} />}
        <form onSubmit={submit} className="form-stack">
          {!isLogin && (
            <label className="form-label-custom">
              Full name
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" required />
            </label>
          )}
          <label className="form-label-custom">
            Email
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
          </label>
          <label className="form-label-custom">
            Password
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 6 characters" minLength={6} required />
          </label>
          <button className="btn-primary-custom full" disabled={submitting}>
            {submitting ? 'Please wait...' : isLogin ? 'Sign in' : 'Create account'}
          </button>
        </form>
        <p className="auth-switch">
          {isLogin ? 'New here?' : 'Already have an account?'}{' '}
          <Link to={isLogin ? '/register' : '/login'}>{isLogin ? 'Create account' : 'Sign in'}</Link>
        </p>
      </div>
    </div>
  );
}
