import { useEffect, useRef, useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";

const LINKS = [
  ["/", "Home"],
  ["/episodes", "Episodes"],
  ["/contestants", "Contestants"],
  ["/eliminations", "Eliminations"],
  ["/gangs", "Gangs"],
  ["/auditions", "Auditions"],
];

const SUB = [
  ["/super-fan/roadies-rebirth", "🔥 Roadies Rebirth", "Favourite gang leader of this season"],
  ["/super-fan/all-time", "👑 Roadies – All Time", "Rank your top 3 of all time"],
];

export default function Layout() {
  const { pathname } = useLocation();
  const [pinned, setPinned] = useState(false);
  const [hover, setHover] = useState(false);
  const closeTimer = useRef(0);
  const box = useRef(null);
  const open = pinned || hover;

  useEffect(() => {
    window.scrollTo(0, 0);
    setPinned(false);
    setHover(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === "Escape" && (setPinned(false), setHover(false));
    const onDoc = (e) => {
      if (box.current && !box.current.contains(e.target)) {
        setPinned(false);
        setHover(false);
      }
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onDoc);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onDoc);
    };
  }, [open]);

  const canHover = () => typeof window !== "undefined" && window.matchMedia && window.matchMedia("(hover: hover)").matches;
  const enter = () => {
    if (!canHover()) return;
    clearTimeout(closeTimer.current);
    setHover(true);
  };
  const leave = () => {
    if (!canHover()) return;
    clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setHover(false), 180);
  };

  return (
    <>
      <div className="notice">
        Unofficial fan site. Not affiliated with or endorsed by MTV, the Roadies production team, Netflix or JioHotstar.
      </div>

      <header className="nav">
        <div className="wrap" ref={box}>
          <Link className="logo" to="/">
            Roadies <span>Rebirth</span>
          </Link>
          <nav aria-label="Main">
            <ul>
              {LINKS.map(([to, label]) => (
                <li key={to}>
                  <NavLink to={to} end={to === "/"}>{label}</NavLink>
                </li>
              ))}
              <li onMouseEnter={enter} onMouseLeave={leave}>
                <button
                  type="button"
                  className={`navbtn${pathname.startsWith("/super-fan") ? " active" : ""}`}
                  aria-expanded={open}
                  aria-controls="sf-menu"
                  aria-haspopup="true"
                  onClick={() => setPinned((v) => !v)}
                >
                  Super Fan <span aria-hidden="true">▾</span>
                </button>
              </li>
            </ul>
          </nav>
          {open && (
            <div id="sf-menu" className="submenu" onMouseEnter={enter} onMouseLeave={leave}>
              <Link to="/super-fan" className="subhub">Super Fan home</Link>
              {SUB.map(([to, label, hint]) => (
                <NavLink key={to} to={to}>
                  <b>{label}</b>
                  <span>{hint}</span>
                </NavLink>
              ))}
            </div>
          )}
        </div>
      </header>

      <main id="top">
        <Outlet />
      </main>

      <footer>
        <div className="wrap">
          <p>Watch Roadies Rebirth on Netflix and JioHotstar.</p>
          <p>Roadies and all related names and marks belong to their respective owners. This is an independent fan-made website.</p>
        </div>
      </footer>
    </>
  );
}
