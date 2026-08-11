import { NavLink } from "react-router-dom";

export function Logo() {
  return (
    <NavLink to="/" className="logo" aria-label="Cinepick home">
      <span className="logo-mark">C</span>
      <span>cinepick</span>
    </NavLink>
  );
}
