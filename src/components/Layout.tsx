import { useEffect, useState, type ReactNode } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Bookmark, Compass, Home, Menu, Moon, Search, Sparkles, Sun, UserRound, X } from 'lucide-react';
import { useLibrary } from '../store/LibraryContext';
import { useAuth } from '../store/AuthContext';

const nav = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/discover', label: 'Discover', icon: Compass },
  { to: '/pick', label: 'Pick for me', icon: Sparkles },
  { to: '/library', label: 'My library', icon: Bookmark },
  { to: '/profile', label: 'Profile', icon: UserRound },
];

export function Logo() {
  return <NavLink to="/" className="logo" aria-label="Cinepick home"><span className="logo-mark">C</span><span>cinepick</span></NavLink>;
}

export default function Layout({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState(() => localStorage.getItem('cinepick-theme') || 'dark');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const library = useLibrary();
  const auth = useAuth();
  const accountName = auth.profile?.display_name || auth.user?.email?.split('@')[0] || 'Guest';
  const initials = accountName.slice(0, 2).toUpperCase();

  useEffect(() => { document.documentElement.dataset.theme = theme; localStorage.setItem('cinepick-theme', theme); }, [theme]);
  useEffect(() => setMobileOpen(false), [location.pathname]);

  const submitSearch = (event: React.FormEvent) => {
    event.preventDefault();
    if (search.trim()) navigate(`/search?q=${encodeURIComponent(search.trim())}`);
  };

  return <div className="app-shell">
    <aside className={`sidebar ${mobileOpen ? 'open' : ''}`}>
      <div className="sidebar-head"><Logo /><button className="icon-btn mobile-only" onClick={() => setMobileOpen(false)} aria-label="Close menu"><X size={20} /></button></div>
      <nav className="main-nav" aria-label="Main navigation">
        {nav.map(({ to, label, icon: Icon }) => <NavLink key={to} to={to} end={to === '/'} className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}><Icon size={19} /><span>{label}</span></NavLink>)}
      </nav>
      <div className="sidebar-foot">
        <NavLink to={auth.user ? '/profile' : '/auth'} className="mini-profile"><span className="avatar">{initials}</span><span><b>{accountName}</b><small>{auth.user ? `${library.watched.length} watched · synced` : 'Sign in to sync'}</small></span></NavLink>
      </div>
    </aside>
    <div className="page-column">
      <header className="topbar">
        <button className="icon-btn menu-trigger" onClick={() => setMobileOpen(true)} aria-label="Open menu"><Menu size={20} /></button>
        <div className="mobile-logo"><Logo /></div>
        <form className="search-box" onSubmit={submitSearch}>
          <Search size={18} />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search movies, shows, people…" aria-label="Search" />
          <kbd>⌘ K</kbd>
        </form>
        <div className="top-actions">
          <button className="icon-btn" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} aria-label="Toggle theme">{theme === 'dark' ? <Sun size={19} /> : <Moon size={19} />}</button>
          <NavLink className="avatar avatar-link" to={auth.user ? '/profile' : '/auth'}>{initials}</NavLink>
        </div>
      </header>
      <main>{children}</main>
    </div>
    <nav className="bottom-nav" aria-label="Mobile navigation">
      {nav.slice(0, 4).map(({ to, label, icon: Icon }) => <NavLink key={to} to={to} end={to === '/'} className={({ isActive }) => isActive ? 'active' : ''}><Icon size={20} /><span>{label === 'My library' ? 'Library' : label}</span></NavLink>)}
    </nav>
  </div>;
}
