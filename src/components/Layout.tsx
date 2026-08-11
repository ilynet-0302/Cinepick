import { useEffect, useState, type ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { BottomNavigation } from "./navigation/BottomNavigation";
import { Sidebar } from "./navigation/Sidebar";
import { Topbar } from "./navigation/Topbar";

export default function Layout({ children }: { children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  useEffect(() => setMobileOpen(false), [location.pathname]);
  useEffect(() => {
    if (!mobileOpen) return;
    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileOpen(false);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [mobileOpen]);

  return (
    <div className="app-shell">
      <Sidebar open={mobileOpen} onClose={() => setMobileOpen(false)} />
      <button
        className={`sidebar-scrim ${mobileOpen ? "open" : ""}`}
        onClick={() => setMobileOpen(false)}
        aria-label="Close navigation menu"
        tabIndex={mobileOpen ? 0 : -1}
      />
      <div className="page-column">
        <Topbar
          mobileOpen={mobileOpen}
          onOpenMenu={() => setMobileOpen(true)}
        />
        <main>{children}</main>
      </div>
      <BottomNavigation />
    </div>
  );
}
