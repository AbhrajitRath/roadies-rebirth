import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Seo from "../components/Seo.jsx";
import { SEO } from "../seoData.js";
import { getPoll, castVote } from "../api.js";
import { getVoterId } from "../voter.js";
import Confetti from "../components/Confetti.jsx";
import SuperFanTabs from "../components/SuperFanTabs.jsx";

export default function SuperFan() {
  const [vid] = useState(getVoterId);
  const [poll, setPoll] = useState(null);
  const [error, setError] = useState("");
  const [note, setNote] = useState(null); // { text, bad }
  const [busy, setBusy] = useState(false);
  const [burst, setBurst] = useState(0);

  const load = useCallback(async () => {
    try {
      setPoll(await getPoll(vid));
      setError("");
    } catch (e) {
      setError(e.message);
    }
  }, [vid]);

  // Live results: fetch now, then every 10 seconds while the tab is visible.
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

  async function vote(slug) {
    if (busy || poll?.myVote) return;
    setBusy(true);
    setNote(null);
    try {
      setPoll(await castVote(slug, vid));
      setBurst(Date.now());
    } catch (e) {
      setNote({ text: e.message, bad: true });
      load();
    } finally {
      setBusy(false);
    }
  }

  async function share(name) {
    const text = `I voted ${name} as my favourite Roadies Rebirth gang leader! Who's yours?`;
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ text, url });
      } else {
        await navigator.clipboard.writeText(`${text} ${url}`);
        setNote({ text: "Link copied. Send it to your friends!" });
      }
    } catch {
      /* sharing was cancelled */
    }
  }

  const options = poll?.options || [];
  const total = poll?.total || 0;
  const max = Math.max(0, ...options.map((o) => o.votes));
  const voted = Boolean(poll?.myVote);
  const mine = options.find((o) => o.slug === poll?.myVote);
  const rankOf = (o) => 1 + options.filter((x) => x.votes > o.votes).length;
  const [og, ng] = poll?.teams || [];
  const ogW = total && og ? og.percent : 50;
  const ngW = total && ng ? ng.percent : 50;

  return (
    <section style={{ borderTop: 0 }}>
      <Seo {...SEO.superfanRebirth} />
      {burst > 0 && <Confetti key={burst} />}
      <div className="wrap">
        <p className="crumb"><Link to="/">Home</Link> / <Link to="/super-fan">Super Fan</Link> / Roadies Rebirth</p>
        <h2>Super Fan 🏆</h2>
        <SuperFanTabs />
        <p className="lead">
          Who is your favourite gang leader? Pick one and make it count. You only get <strong>one vote</strong>, so choose wisely!
        </p>

        {error && !poll && <p className="state err">The poll is warming up. Please try again in a moment.</p>}
        {!poll && !error && <p className="state">Loading the poll…</p>}

        {poll && options.length === 0 && (
          <p className="state">The poll opens as soon as the gang leaders are added.</p>
        )}

        {poll && options.length > 0 && (
          <>
            <div className="sf-top">
              <span className="sf-live"><i /> Live results · refreshing every 10 seconds</span>
              <span className="sf-total">
                {total.toLocaleString("en-IN")} {total === 1 ? "fan has" : "fans have"} voted so far
              </span>
            </div>

            {note && <div className={`msg ${note.bad ? "bad" : "ok"}`}>{note.text}</div>}

            {voted && mine && (
              <div className="sf-banner">
                <span>🎉 <strong>Locked in!</strong> You're officially a Super Fan. You voted for <strong>{mine.name}</strong>.</span>
                <button className="btn ghost small" type="button" onClick={() => share(mine.name)}>Share your pick</button>
              </div>
            )}
            {!voted && total === 0 && <div className="sf-banner"><span>🥇 No votes yet. Be the very first Super Fan!</span></div>}

            <div className="sf-battle">
              <h3>⚔️ Team battle</h3>
              <div className="sf-bl">
                <span className="og">Team OG · {total ? og?.percent : 0}%</span>
                <span className="ng">Team NewGs · {total ? ng?.percent : 0}%</span>
              </div>
              <div className="sf-bt" role="img" aria-label={`Team OG ${og?.percent ?? 0} percent, Team NewGs ${ng?.percent ?? 0} percent`}>
                <div className="og" style={{ width: `${ogW}%` }} />
                <div className="ng" style={{ width: `${ngW}%` }} />
              </div>
            </div>

            <div className="sf-grid">
              {options.map((o) => {
                const isMine = o.slug === poll.myVote;
                const leading = o.votes > 0 && o.votes === max;
                return (
                  <article key={o.slug} className={`sf-card${isMine ? " mine" : ""}`} style={{ "--ac": o.accent || "#ff8a1f" }}>
                    <div className="sf-photo">
                      {o.photo && <img src={o.photo} alt={o.name} loading="lazy" />}
                      <span className="sf-rank">#{rankOf(o)}</span>
                      {leading && <span className="sf-crown" title="Fan favourite">👑</span>}
                    </div>
                    <div className="sf-body">
                      <div className="sf-role">{o.gang === "OGs" ? "Team OG" : "Team NewGs"} · {o.role}</div>
                      <h3>{o.name}</h3>
                      <div className="sf-stat">
                        <strong>{o.percent}%</strong>
                        <span>{o.votes.toLocaleString("en-IN")} {o.votes === 1 ? "vote" : "votes"}</span>
                      </div>
                      <div className="sf-bar" role="progressbar" aria-label={`${o.name} vote share`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={o.percent}>
                        <i style={{ width: `${o.percent}%` }} />
                      </div>
                      <div className="sf-foot">
                        {!voted && (
                          <button className="sf-btn" type="button" disabled={busy} onClick={() => vote(o.slug)}>
                            Vote for {o.name.split(" ")[0]} 🔥
                          </button>
                        )}
                        {isMine && <div className="sf-picked">✓ Your pick</div>}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
            {error && <p className="state err">Could not refresh the results. Retrying…</p>}
          </>
        )}
      </div>
    </section>
  );
}
