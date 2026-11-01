import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Seo from "../components/Seo.jsx";
import Avatar from "../components/Avatar.jsx";
import Confetti from "../components/Confetti.jsx";
import SuperFanTabs from "../components/SuperFanTabs.jsx";
import { SEO } from "../seoData.js";
import { getAllTime, castAllTimeVote } from "../api.js";
import { getVoterId } from "../voter.js";

const MEDALS = ["🥇", "🥈", "🥉"];
const SLOT_NAMES = ["Favourite", "Second", "Third"];

export default function AllTimePoll() {
  const [vid] = useState(getVoterId);
  const [poll, setPoll] = useState(null);
  const [error, setError] = useState("");
  const [note, setNote] = useState(null);
  const [busy, setBusy] = useState(false);
  const [burst, setBurst] = useState(0);
  const [picks, setPicks] = useState([]); // slugs in order: favourite, second, third
  const [query, setQuery] = useState("");
  const [showAll, setShowAll] = useState(false);

  const load = useCallback(async () => {
    try {
      setPoll(await getAllTime(vid));
      setError("");
    } catch (e) {
      setError(e.message);
    }
  }, [vid]);

  useEffect(() => {
    load();
    const t = setInterval(() => {
      if (!document.hidden) load();
    }, 10000);
    return () => clearInterval(t);
  }, [load]);

  useEffect(() => {
    if (!burst) return undefined;
    const t = setTimeout(() => setBurst(0), 3200);
    return () => clearTimeout(t);
  }, [burst]);

  const leaders = poll?.leaders || [];
  const bySlug = useMemo(() => new Map(leaders.map((l) => [l.slug, l])), [leaders]);
  const voted = Boolean(poll?.myVote);
  const total = poll?.total || 0;

  const ranked = useMemo(
    () => [...leaders].sort((a, b) => b.points - a.points || b.first - a.first || a.name.localeCompare(b.name)),
    [leaders]
  );
  const maxPoints = Math.max(1, ...leaders.map((l) => l.points));
  const podium = ranked.slice(0, 3).filter((l) => l.points > 0);
  const shown = showAll ? ranked : ranked.slice(0, 10);

  const filtered = leaders.filter((l) => l.name.toLowerCase().includes(query.trim().toLowerCase()));

  function toggle(slug) {
    if (voted) return;
    setNote(null);
    setPicks((p) => (p.includes(slug) ? p.filter((x) => x !== slug) : p.length < 3 ? [...p, slug] : p));
  }

  async function lockIn() {
    if (busy || picks.length !== 3) return;
    setBusy(true);
    setNote(null);
    try {
      setPoll(await castAllTimeVote({ first: picks[0], second: picks[1], third: picks[2] }, vid));
      setBurst(Date.now());
    } catch (e) {
      setNote({ text: e.message, bad: true });
      load();
    } finally {
      setBusy(false);
    }
  }

  async function share() {
    const m = poll.myVote;
    const text = `My all-time Roadies gang leaders: 🥇 ${bySlug.get(m.first)?.name}, 🥈 ${bySlug.get(m.second)?.name}, 🥉 ${bySlug.get(m.third)?.name}. What's your top 3?`;
    const url = window.location.href;
    try {
      if (navigator.share) await navigator.share({ text, url });
      else {
        await navigator.clipboard.writeText(`${text} ${url}`);
        setNote({ text: "Link copied. Send it to your friends!" });
      }
    } catch {
      /* cancelled */
    }
  }

  const ordered = voted ? [poll.myVote.first, poll.myVote.second, poll.myVote.third] : picks;

  return (
    <section style={{ borderTop: 0 }}>
      <Seo {...SEO.superfanAllTime} />
      {burst > 0 && <Confetti key={burst} />}
      <div className="wrap">
        <p className="crumb"><Link to="/">Home</Link> / <Link to="/super-fan">Super Fan</Link> / Roadies – All Time</p>
        <h2>Roadies – All Time 👑</h2>
        <SuperFanTabs />
        <p className="lead">
          Every gang leader in Roadies history. Pick your <strong>favourite, second and third</strong>. One ballot per fan.
          Points: 🥇 3 · 🥈 2 · 🥉 1.
        </p>

        {error && !poll && <p className="state err">The poll is warming up. Please try again in a moment.</p>}
        {!poll && !error && <p className="state">Loading the poll…</p>}
        {poll && leaders.length === 0 && <p className="state">The poll opens as soon as the gang leaders are added.</p>}

        {poll && leaders.length > 0 && (
          <>
            <div className="sf-top">
              <span className="sf-live"><i /> Live results · refreshing every 10 seconds</span>
              <span className="sf-total">{total.toLocaleString("en-IN")} {total === 1 ? "fan has" : "fans have"} voted so far</span>
            </div>

            {note && <div className={`msg ${note.bad ? "bad" : "ok"}`}>{note.text}</div>}

            {podium.length > 0 && (
              <div className="at-podium" aria-label="Current top three">
                {[1, 0, 2].map((i) => {
                  const l = podium[i];
                  if (!l) return <div key={i} />;
                  return (
                    <div key={l.slug} className={`at-pod p${i + 1}`} style={{ "--ac": l.accent }}>
                      <span className="at-crown">{i === 0 ? "👑" : MEDALS[i]}</span>
                      <Avatar name={l.name} photo={l.photo} accent={l.accent} size={i === 0 ? 84 : 64} />
                      <strong>{l.name}</strong>
                      <span className="at-pct">{l.percent}%</span>
                      <div className="at-step">{i + 1}</div>
                    </div>
                  );
                })}
              </div>
            )}

            {voted ? (
              <div className="sf-banner">
                <span>
                  🎉 <strong>Locked in!</strong> Your top 3:{" "}
                  {ordered.map((s, i) => <span key={s} className="at-chip">{MEDALS[i]} {bySlug.get(s)?.name || s}</span>)}
                </span>
                <button className="btn ghost small" type="button" onClick={share}>Share your top 3</button>
              </div>
            ) : (
              <div className="at-slots">
                {[0, 1, 2].map((i) => {
                  const l = bySlug.get(picks[i]);
                  return (
                    <button
                      key={i}
                      type="button"
                      className={`at-slot${l ? " full" : ""}`}
                      onClick={() => l && toggle(l.slug)}
                      aria-label={l ? `${SLOT_NAMES[i]}: ${l.name}. Tap to remove` : `${SLOT_NAMES[i]}: empty`}
                    >
                      <span className="at-medal">{MEDALS[i]}</span>
                      {l ? <><Avatar name={l.name} photo={l.photo} accent={l.accent} size={36} /><b>{l.name}</b><i>✕</i></> : <em>{SLOT_NAMES[i]}</em>}
                    </button>
                  );
                })}
                <button className="sf-btn at-lock" type="button" disabled={busy || picks.length !== 3} onClick={lockIn}>
                  {picks.length === 3 ? "Lock in my top 3 🔥" : `Pick ${3 - picks.length} more`}
                </button>
              </div>
            )}

            {!voted && (
              <>
                <input
                  className="at-search"
                  type="search"
                  placeholder="Search gang leaders…"
                  aria-label="Search gang leaders"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
                <div className="at-grid">
                  {filtered.map((l) => {
                    const idx = picks.indexOf(l.slug);
                    const on = idx > -1;
                    return (
                      <button
                        key={l.slug}
                        type="button"
                        className={`at-pick${on ? " on" : ""}`}
                        style={{ "--ac": l.accent }}
                        aria-pressed={on}
                        onClick={() => toggle(l.slug)}
                      >
                        <Avatar name={l.name} photo={l.photo} accent={l.accent} size={48} />
                        <span className="at-name">{l.name}</span>
                        <span className="at-seasons">{l.seasons}</span>
                        {on && <span className="at-badge">{MEDALS[idx]}</span>}
                      </button>
                    );
                  })}
                  {filtered.length === 0 && <p className="state">No gang leader matches “{query}”.</p>}
                </div>
              </>
            )}

            <h3 className="aud-h">Live leaderboard</h3>
            <ol className="at-board">
              {shown.map((l, i) => {
                const mine = ordered.indexOf(l.slug);
                return (
                  <li key={l.slug} style={{ "--ac": l.accent }}>
                    <span className="at-rank">{i + 1}</span>
                    <Avatar name={l.name} photo={l.photo} accent={l.accent} size={40} />
                    <div className="at-info">
                      <div className="at-line">
                        <b>{l.name}{voted && mine > -1 ? ` ${MEDALS[mine]}` : ""}</b>
                        <strong>{l.percent}%</strong>
                      </div>
                      <div className="sf-bar" role="progressbar" aria-label={`${l.name} points share`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={l.percent}>
                        <i style={{ width: `${(l.points / maxPoints) * 100}%` }} />
                      </div>
                      <div className="at-counts">🥇 {l.first} · 🥈 {l.second} · 🥉 {l.third} · {l.points} pts</div>
                    </div>
                  </li>
                );
              })}
            </ol>
            {ranked.length > 10 && (
              <button className="btn ghost" type="button" onClick={() => setShowAll((v) => !v)}>
                {showAll ? "Show top 10" : `Show all ${ranked.length}`}
              </button>
            )}
            <p className="at-note">Percent = share of all points handed out. List compiled from public sources; the order of seasons may be corrected over time.</p>
            {error && <p className="state err">Could not refresh the results. Retrying…</p>}
          </>
        )}
      </div>
    </section>
  );
}
