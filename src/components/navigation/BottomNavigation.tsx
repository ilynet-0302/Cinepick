import { NavLink } from "react-router-dom";
import { navigationItems } from "./navigationItems";

export function BottomNavigation() {
  return (
    <nav className="bottom-nav" aria-label="Mobile navigation">
      {navigationItems.slice(0, 4).map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          end={to === "/"}
          className={({ isActive }) => (isActive ? "active" : "")}
        >
          <Icon size={20} />
          <span>{label === "My library" ? "Library" : label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
