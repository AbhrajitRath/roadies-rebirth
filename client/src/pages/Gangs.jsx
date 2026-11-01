import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import Seo from "../components/Seo.jsx";
import { useList } from "../hooks/useList.js";
import { SEO } from "../seoData.js";

const teamName = (g) => (g === "OGs" ? "Team OG" : "Team NewGs");
const initials = (n = "") =>
  n.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase();

export default function Gangs() {
  const { data, loading, error } = useList("leaders");
  const [team, setTeam] = useState("all");
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(null);
  const dlg = useRef(null);

  const leaders = useMemo(() => data.map((l, i) => ({ ...l, num: String(i + 1).padStart(2, "0") })), [data]);

  const visible = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return leaders.filter((l) => {
      if (team !== "all" && l.gang !== team) return false;
      if (!needle) return true;
      return [l.name, teamName(l.gang), l.role, l.speciality, l.strength, l.tagline].join(" ").toLowerCase().includes(needle);
    });
  }, [leaders, team, q]);

  useEffect(() => {
    const d = dlg.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  return (
    <>
      <Seo {...SEO.gangs} />
      <div className="wrap pagehead" style={{ paddingBottom: 0 }}>
        <p className="crumb"><Link to="/">Home</Link> / Gangs</p>
      </div>

      <section id="gangs">
        <div className="wrap">
          <div className="head">
            <h2>Meet the <em>Leaders</em></h2>
            <p>Six gang leaders across Team OG and Team NewGs. Tap a card to see their speciality, leadership strength and fan tagline.</p>
          </div>

          <div className="tools">
            <div className="tabs" role="group" aria-label="Filter leaders by gang">
              {[["all", "All leaders"], ["OGs", "OGs"], ["NewGs", "NewGs"]].map(([value, label]) => (
                <button key={value} type="button" className={team === value ? "on" : ""} onClick={() => setTeam(value)}>
                  {label}
                </button>
              ))}
            </div>
            <label className="search">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" />
              </svg>
              <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search leaders or styles…" aria-label="Search leaders or styles" />
            </label>
          </div>

          {loading && <p className="state">Loading leaders…</p>}
          {error && <p className="state err">Could not load the leaders. Please try again later.</p>}
          {!loading && !error && leaders.length === 0 && <p className="state">Leaders will be added soon.</p>}

          <div className="lgrid">
            {visible.map((l) => (
              <article key={l._id} className="lcard" style={{ "--ac": l.accent }} onClick={() => setOpen(l)}>
                <div className="lphoto">
                  {l.photo && <img src={l.photo} alt={l.name} loading="lazy" />}
                  <span className="lbadge">{l.gang}</span>
                  <span className="lnum">{l.num}</span>
                  <span className="lmark">{initials(l.name)}</span>
                </div>
                <div className="lbody">
                  <div className="lrole">{l.role}</div>
                  <h3>{l.name}</h3>
                  <p>{l.speciality}</p>
                </div>
                <button className="lbtn" type="button">
                  <span>View profile</span><span className="larrow">&#8599;</span>
                </button>
              </article>
            ))}
          </div>
          {!loading && !error && leaders.length > 0 && visible.length === 0 && (
            <p className="nomatch">No leaders match your search.</p>
          )}
        </div>
      </section>

      <dialog
        ref={dlg}
        className="card"
        aria-labelledby="cardName"
        onClose={() => setOpen(null)}
        onClick={(e) => e.target === dlg.current && setOpen(null)}
      >
        <div className="bar" />
        <button className="close" type="button" aria-label="Close" onClick={() => setOpen(null)}>&times;</button>
        {open && (
          <>
            {open.photo && <img className="photo" src={open.photo} alt={open.name} />}
            <div className="inner">
              <span className="team">{teamName(open.gang)}</span>
              <h3 id="cardName">{open.name}</h3>
              <div className="role">{open.role}</div>
              <h4>Speciality</h4>
              <p>{open.speciality}</p>
              <h4>Leadership strength</h4>
              <p>{open.strength}</p>
              <h4>Fan tagline</h4>
              <blockquote>“{open.tagline}”</blockquote>
            </div>
          </>
        )}
      </dialog>
    </>
  );
}
