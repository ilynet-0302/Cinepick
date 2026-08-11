import { Menu, Moon, Search, Sun } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../features/auth/useAuth";
import { Logo } from "./Logo";

interface TopbarProps {
  mobileOpen: boolean;
  onOpenMenu: () => void;
}

export function Topbar({ mobileOpen, onOpenMenu }: TopbarProps) {
  const [theme, setTheme] = useState(
    () => localStorage.getItem("cinepick-theme") || "dark",
  );
  const [search, setSearch] = useState("");
  const navigate = useNavigate();
  const auth = useAuth();
  const accountName =
    auth.profile?.display_name || auth.user?.email?.split("@")[0] || "Guest";
  const initials = accountName.slice(0, 2).toUpperCase();

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("cinepick-theme", theme);
  }, [theme]);

  const submitSearch = (event: FormEvent) => {
    event.preventDefault();
    if (search.trim())
      navigate(`/search?q=${encodeURIComponent(search.trim())}`);
  };

  return (
    <header className="topbar">
      <button
        className="icon-btn menu-trigger"
        onClick={onOpenMenu}
        aria-label="Open menu"
        aria-expanded={mobileOpen}
        aria-controls="mobile-navigation"
      >
        <Menu size={20} />
      </button>
      <div className="mobile-logo">
        <Logo />
      </div>
      <form className="search-box" onSubmit={submitSearch}>
        <Search size={18} />
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search movies, shows, people…"
          aria-label="Search"
        />
        <kbd>⌘ K</kbd>
      </form>
      <button
        className="icon-btn mobile-search-btn"
        onClick={() => navigate("/search")}
        aria-label="Open search"
      >
        <Search size={18} />
      </button>
      <div className="top-actions">
        <button
          className="icon-btn"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          aria-label="Toggle theme"
        >
          {theme === "dark" ? <Sun size={19} /> : <Moon size={19} />}
        </button>
        <NavLink
          className="avatar avatar-link"
          to={auth.user ? "/profile" : "/auth"}
        >
          {initials}
        </NavLink>
      </div>
    </header>
  );
}
