import { Link } from "react-router-dom";
import Seo from "../components/Seo.jsx";
import { useList } from "../hooks/useList.js";
import { SEO } from "../seoData.js";

// Used when an episode has no exact link of its own.
const NETFLIX_HOME = "https://www.netflix.com";
const HOTSTAR_HOME = "https://www.jiohotstar.com";

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }) : "";

function SectionPage({ name, seo, lead, resource, soon, layout = "items", render }) {
  const { data, loading, error } = useList(resource);
  return (
    <section style={{ borderTop: 0 }}>
      <Seo {...seo} />
      <div className="wrap">
        <p className="crumb"><Link to="/">Home</Link> / {name}</p>
        <h2>{name}</h2>
        <p className="lead">{lead}</p>

        {loading && <p className="state">Loading…</p>}
        {error && <p className="state err">Could not load {name.toLowerCase()}. Please try again later.</p>}
        {!loading && !error && data.length === 0 && (
          <div className="soon"><strong>Coming soon</strong>{soon}</div>
        )}
        {!loading && !error && data.length > 0 && (
          <div className={layout === "rows" ? "rows" : "items"}>{data.map(render)}</div>
        )}
      </div>
    </section>
  );
}

export function Episodes() {
  return (
    <SectionPage
      name="Episodes"
      seo={SEO.episodes}
      lead="Episode-by-episode recaps and highlights."
      resource="episodes"
      soon="Episode details will be added here."
      render={(e) => (
        <article className="item" key={e._id}>
          <span className="kicker">Episode {e.number}{e.airDate ? ` · ${fmtDate(e.airDate)}` : ""}</span>
          <h3>{e.title}</h3>
          {e.summary && <p>{e.summary}</p>}
          <div className="watch">
            <span className="watch-label">Watch on</span>
            <a className="wbtn netflix" href={e.netflixUrl || NETFLIX_HOME} target="_blank" rel="noopener noreferrer">Netflix</a>
            <a className="wbtn hotstar" href={e.hotstarUrl || HOTSTAR_HOME} target="_blank" rel="noopener noreferrer">JioHotstar</a>
          </div>
        </article>
      )}
    />
  );
}

export function Contestants() {
  return (
    <SectionPage
      name="Contestants"
      seo={SEO.contestants}
      lead="Profiles of the Roadies hopefuls fighting for a place in the gangs."
      resource="contestants"
      soon="Contestant profiles will be added here."
      render={(c) => (
        <article className="item" key={c._id}>
          {c.photo && <img src={c.photo} alt={c.name} loading="lazy" />}
          <span className="kicker">{[c.gang, c.city].filter(Boolean).join(" · ") || "Contestant"}</span>
          <h3>{c.name}</h3>
          <div><span className={`pill${c.status === "eliminated" ? " out" : ""}`}>{c.status === "eliminated" ? "Eliminated" : "In the game"}</span></div>
          {(c.episode || c.leader || c.gang) && (
            <p className="meta">
              {[
                c.episode ? `Selected in Episode ${c.episode}` : null,
                c.leader ? `Joined ${c.leader}'s team` : c.gang ? `Joined ${c.gang === "OGs" ? "Team OG" : "Team NewGs"}` : null,
              ].filter(Boolean).join(" · ")}
            </p>
          )}
          {c.bio && <p>{c.bio}</p>}
        </article>
      )}
    />
  );
}

export function Eliminations() {
  const { data: inGame, loading, error } = useList("eliminations");
  const { data: notSelected } = useList("notselected");
  return (
    <section style={{ borderTop: 0 }}>
      <Seo {...SEO.eliminations} />
      <div className="wrap">
        <p className="crumb"><Link to="/">Home</Link> / Eliminations</p>
        <h2>Eliminations</h2>
        <p className="lead">Who is still in the game, and who has gone home.</p>

        {loading && <p className="state">Loading…</p>}
        {error && <p className="state err">Could not load eliminations. Please try again later.</p>}

        {!loading && !error && (
          <>
            <h3 className="aud-h">Eliminated from the game</h3>
            {inGame.length === 0 ? (
              <div className="soon"><strong>Coming soon</strong>Elimination updates will be added here.</div>
            ) : (
              <div className="rows">
                {inGame.map((x) => (
                  <div className="row" key={x._id}>
                    <span className="ep">{x.episodeNumber ? `EP ${x.episodeNumber}` : "—"}</span>
                    <div>
                      <div className="who">{x.contestantName}{x.gang ? ` · ${x.gang}` : ""}</div>
                      {x.note && <div className="note">{x.note}</div>}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {notSelected.length > 0 && (
              <>
                <h3 className="aud-h">Audition: Not Selected</h3>
                <div className="items">
                  {notSelected.map((x) => (
                    <article className="item" key={x._id}>
                      <span className="kicker">{[x.city, x.result].filter(Boolean).join(" · ") || "Not selected"}</span>
                      <h3>{x.name}</h3>
                      {x.reason && <p>{x.reason}</p>}
                    </article>
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </section>
  );
}

const HIGHLIGHTS = [
  "High-energy crowds at the audition grounds",
  "Dramatic group discussion (GD) rounds",
  "Manya's emotional audition",
  "Bani J returning as a gang leader, years after her own historic audition as a contestant",
];

const FORM_QUESTIONS = [
  ["Self-rating (1 to 10)", "Rate yourself on moral fitness, entertainment factor, intelligence, appearance and confidence."],
  ["The rebirth twist", "“If you had a rebirth, what specific things would you change about yourself and why?”"],
  ["Shock value", "“What is something you have done that your family would be completely shocked to find out?”"],
  ["Rebellion", "“What is the most rebellious, off-beat thing you have done so far?”"],
  ["Secrets and turning points", "Share your biggest turning point, your deepest regrets and the biggest lie you have told."],
];

export function Auditions() {
  const { data, loading, error } = useList("auditions");
  return (
    <section style={{ borderTop: 0 }}>
      <Seo {...SEO.auditions} />
      <div className="wrap">
        <p className="crumb"><Link to="/">Home</Link> / Auditions</p>
        <h2>Auditions</h2>
        <p className="lead">How the auditions work and the moments that stood out.</p>

        <h3 className="aud-h">How it worked</h3>
        <div className="aud-card">
          <p>
            <strong>OGs vs NewGs.</strong> Rather than each leader working alone, the audition rooms were split between two
            rival gangs, <Link to="/gangs">Team OG and Team NewGs</Link>, each with three gang leaders competing to draft the
            best talent. Host Rannvijay Singha keeps the balance as the neutral anchor.
          </p>
          <p>To get through, contestants had to clear a tough physical checkpoint and a high-pressure group discussion round.</p>
        </div>

        <h3 className="aud-h">Moments that stood out</h3>
        <ul className="aud-list">
          {HIGHLIGHTS.map((h) => <li key={h}>{h}</li>)}
        </ul>

        <h3 className="aud-h">Where auditions were held</h3>
        <p className="aud-note">
          Pre-registration was required to get an Audition Pass, and gates opened at 7:00 AM at all four zones.
        </p>
        {loading && <p className="state">Loading…</p>}
        {error && <p className="state err">Could not load the audition cities. Please try again later.</p>}
        {!loading && !error && data.length === 0 && (
          <div className="soon"><strong>Coming soon</strong>Audition cities will be added here.</div>
        )}
        {!loading && !error && data.length > 0 && (
          <div className="items">
            {data.map((a) => (
              <article className="item" key={a._id}>
                <span className="kicker">{fmtDate(a.date) || "Audition"}</span>
                <h3>{a.city}</h3>
                {a.venue && <p><strong>Venue:</strong> {a.venue}</p>}
                {a.summary && <p>{a.summary}</p>}
              </article>
            ))}
          </div>
        )}

        <h3 className="aud-h">Digital auditions: Roadies Battleground</h3>
        <div className="aud-card">
          <p>
            For contestants who missed the on-ground calls, a digital wildcard channel was opened. Aspiring contestants
            submitted their audition tapes online through Roadies Battleground.
          </p>
        </div>

        <h3 className="aud-h">The audition form</h3>
        <p className="aud-note">Contestants filled in a questionnaire before the physical round and group discussion. It included:</p>
        <ol className="aud-q">
          {FORM_QUESTIONS.map(([title, text]) => (
            <li key={title}><b>{title}</b><span>{text}</span></li>
          ))}
        </ol>
      </div>
    </section>
  );
}
