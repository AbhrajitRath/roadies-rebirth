import { Link } from "react-router-dom";
import Seo from "../components/Seo.jsx";
import { SEO } from "../seoData.js";

const TILES = [
  ["/episodes", "Episodes", "Recaps and highlights, episode by episode."],
  ["/contestants", "Contestants", "Profiles of the hopefuls in the game."],
  ["/eliminations", "Eliminations", "Who is still in, and who is out."],
  ["/gangs", "Gangs", "Meet the six gang leaders."],
  ["/auditions", "Auditions", "How auditions work and key moments."],
  ["/super-fan", "Super Fan", "Vote for your favourite gang leader."],
];

export default function Home() {
  return (
    <>
      <Seo {...SEO.home} />
      <div className="hero">
        <div className="wrap">
          <span className="tag">New Season &bull; Out Now</span>
          <h1>
            Roadies <em>Rebirth</em>
          </h1>
          <p>Your fan guide to the new season: gangs, episodes, contestants, eliminations and auditions, all in one place.</p>
          <div className="btns">
            <Link className="btn primary" to="/gangs">Meet the Gangs</Link>
            <Link className="btn ghost" to="/episodes">Episode Guide</Link>
          </div>

          <div className="facts">
            <div className="fact"><small>Season</small><strong>Roadies Rebirth</strong></div>
            <div className="fact"><small>Premiere</small><strong>16 October 2026</strong></div>
            <div className="fact"><small>Gangs</small><strong>Team OG vs Team NewGs</strong></div>
            <div className="fact"><small>Where to Watch</small><strong>Netflix &amp; JioHotstar</strong></div>
          </div>
        </div>
      </div>

      <section className="explore">
        <div className="wrap">
          <h2>Explore</h2>
          <p className="lead">Pick a section to open its page.</p>
          <div className="tiles">
            {TILES.map(([to, name, blurb]) => (
              <Link key={to} className="tile" to={to}>
                <h3>{name}</h3>
                <p>{blurb}</p>
                <span>Open &rarr;</span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
