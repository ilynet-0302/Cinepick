import { X } from "lucide-react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../../features/auth/useAuth";
import { useLibrary } from "../../features/library/useLibrary";
import { Logo } from "./Logo";
import { navigationItems } from "./navigationItems";

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const library = useLibrary();
  const auth = useAuth();
  const accountName =
    auth.profile?.display_name || auth.user?.email?.split("@")[0] || "Guest";
  const initials = accountName.slice(0, 2).toUpperCase();

  return (
    <aside id="mobile-navigation" className={`sidebar ${open ? "open" : ""}`}>
      <div className="sidebar-head">
        <Logo />
        <button
          className="icon-btn mobile-only"
          onClick={onClose}
          aria-label="Close menu"
        >
          <X size={20} />
        </button>
      </div>
      <nav className="main-nav" aria-label="Main navigation">
        {navigationItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) =>
              isActive ? "nav-item active" : "nav-item"
            }
          >
            <Icon size={19} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="sidebar-foot">
        <NavLink to={auth.user ? "/profile" : "/auth"} className="mini-profile">
          <span className="avatar">{initials}</span>
          <span>
            <b>{accountName}</b>
            <small>
              {auth.user
                ? `${library.watched.length} watched · synced`
                : "Sign in to sync"}
            </small>
          </span>
        </NavLink>
      </div>
    </aside>
  );
}
