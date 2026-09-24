import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import { apiFetch } from '../api/api';
import type { User } from '../types';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function storedUser(): User | null {
  try {
    const raw = localStorage.getItem('expense_tracker_user');
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(storedUser);
  const [loading] = useState(false);

  async function login(email: string, password: string): Promise<void> {
    const result = await apiFetch<{ token: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    localStorage.setItem('expense_tracker_token', result.token);
    localStorage.setItem('expense_tracker_user', JSON.stringify(result.user));
    setUser(result.user);
  }

  async function register(name: string, email: string, password: string): Promise<void> {
    const result = await apiFetch<{ token: string; user: User }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });
    localStorage.setItem('expense_tracker_token', result.token);
    localStorage.setItem('expense_tracker_user', JSON.stringify(result.user));
    setUser(result.user);
  }

  function logout(): void {
    localStorage.removeItem('expense_tracker_token');
    localStorage.removeItem('expense_tracker_user');
    setUser(null);
  }

  const value = useMemo(() => ({ user, loading, login, register, logout }), [user, loading]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider.');
  return context;
}
