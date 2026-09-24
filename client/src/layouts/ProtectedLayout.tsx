import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const links = [
  { to: '/', label: 'Dashboard', icon: 'bi-grid-1x2-fill' },
  { to: '/cash-in', label: 'Cash In', icon: 'bi-wallet2' },
  { to: '/expenses', label: 'Expenses', icon: 'bi-receipt' },
  { to: '/allocation', label: 'Allocation', icon: 'bi-pie-chart-fill' },
  { to: '/history', label: 'History', icon: 'bi-clock-history' },
];

export function ProtectedLayout() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login', { replace: true });
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark"><i className="bi bi-graph-up-arrow" /></div>
          <div>
            <strong>Expense</strong>
            <span>Tracker</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/'}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <i className={`bi ${link.icon}`} />
              <span>{link.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="theme-toggle" onClick={toggleTheme}>
            <i className={`bi ${theme === 'dark' ? 'bi-sun' : 'bi-moon-stars'}`} />
            <span>{theme === 'dark' ? 'Light mode' : 'Dark mode'}</span>
          </button>
          <div className="user-box">
            <div className="avatar">{user?.name?.charAt(0).toUpperCase()}</div>
            <div className="user-info">
              <strong>{user?.name}</strong>
              <span>{user?.email}</span>
            </div>
            <button className="icon-button" onClick={handleLogout} title="Logout">
              <i className="bi bi-box-arrow-right" />
            </button>
          </div>
        </div>
      </aside>

      <main className="main-content">
        <header className="mobile-topbar">
          <div className="brand compact">
            <div className="brand-mark"><i className="bi bi-graph-up-arrow" /></div>
            <strong>Expense Tracker</strong>
          </div>
          <button className="icon-button" onClick={toggleTheme}>
            <i className={`bi ${theme === 'dark' ? 'bi-sun' : 'bi-moon-stars'}`} />
          </button>
        </header>
        <div className="content-container">
          <Outlet />
        </div>
      </main>

      <nav className="mobile-bottom-nav">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === '/'}
            className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}
          >
            <i className={`bi ${link.icon}`} />
            <span>{link.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
