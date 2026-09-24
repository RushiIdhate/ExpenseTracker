import { Navigate, Route, Routes } from 'react-router-dom';
import { ProtectedRoute } from './components/ProtectedRoute';
import { ProtectedLayout } from './layouts/ProtectedLayout';
import { AuthPage } from './pages/AuthPage';
import { AllocationPage } from './pages/AllocationPage';
import { CashInPage } from './pages/CashInPage';
import { DashboardPage } from './pages/DashboardPage';
import { ExpensesPage } from './pages/ExpensesPage';
import { HistoryPage } from './pages/HistoryPage';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<AuthPage mode="login" />} />
      <Route path="/register" element={<AuthPage mode="register" />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<ProtectedLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="cash-in" element={<CashInPage />} />
          <Route path="expenses" element={<ExpensesPage />} />
          <Route path="allocation" element={<AllocationPage />} />
          <Route path="history" element={<HistoryPage />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
