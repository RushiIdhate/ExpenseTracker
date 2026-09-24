const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export interface ApiError {
  message: string;
}

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('expense_tracker_token');
  const headers = new Headers(options.headers);
  headers.set('Content-Type', 'application/json');

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_URL}${path}`, { ...options, headers });
  const data = (await response.json().catch(() => ({}))) as T & ApiError;

  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem('expense_tracker_token');
      localStorage.removeItem('expense_tracker_user');
    }
    throw new Error(data.message || 'Something went wrong.');
  }

  return data;
}
