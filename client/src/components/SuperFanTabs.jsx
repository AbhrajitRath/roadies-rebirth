import { NavLink } from "react-router-dom";

export default function SuperFanTabs() {
  return (
    <div className="sf-tabs" role="navigation" aria-label="Super Fan polls">
      <NavLink to="/super-fan/roadies-rebirth">🔥 Roadies Rebirth</NavLink>
      <NavLink to="/super-fan/all-time">👑 Roadies – All Time</NavLink>
    </div>
  );
}
