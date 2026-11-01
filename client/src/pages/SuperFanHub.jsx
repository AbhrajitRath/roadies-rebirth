import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Seo from "../components/Seo.jsx";
import { SEO } from "../seoData.js";
import { getPoll, getAllTime } from "../api.js";
import { getVoterId } from "../voter.js";

export default function SuperFanHub() {
  const [rebirth, setRebirth] = useState(null);
  const [allTime, setAllTime] = useState(null);

  useEffect(() => {
    const vid = getVoterId();
    getPoll(vid).then(setRebirth).catch(() => {});
    getAllTime(vid).then(setAllTime).catch(() => {});
  }, []);

  const n = (x) => (x ? x.toLocaleString("en-IN") : "0");
  return (
    <section style={{ borderTop: 0 }}>
      <Seo {...SEO.superfan} />
      <div className="wrap">
        <p className="crumb"><Link to="/">Home</Link> / Super Fan</p>
        <h2>Super Fan 🏆</h2>
        <p className="lead">Two polls. One question: who are the greatest gang leaders? Pick a poll and cast your vote.</p>

        <div className="sf-hub">
          <Link to="/super-fan/roadies-rebirth" className="sf-hubcard rb">
            <span className="sf-emoji">🔥</span>
            <span className="kicker">Poll 1</span>
            <h3>Roadies Rebirth</h3>
            <p>Pick your <strong>one favourite</strong> from this season's six gang leaders. Team OG vs Team NewGs.</p>
            <span className="sf-meta">
              {rebirth ? `${n(rebirth.total)} votes` : "Live poll"}
              {rebirth?.myVote && <b> · You voted ✓</b>}
            </span>
            <span className="sf-go">Vote now →</span>
          </Link>
          <Link to="/super-fan/all-time" className="sf-hubcard at">
            <span className="sf-emoji">👑</span>
            <span className="kicker">Poll 2</span>
            <h3>Roadies – All Time</h3>
            <p>Every gang leader the show has ever had. Rank your <strong>favourite, second and third</strong>.</p>
            <span className="sf-meta">
              {allTime ? `${n(allTime.total)} ballots` : "Live poll"}
              {allTime?.myVote && <b> · You voted ✓</b>}
            </span>
            <span className="sf-go">Rank your top 3 →</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
