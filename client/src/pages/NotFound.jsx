import { Link } from "react-router-dom";
import Seo from "../components/Seo.jsx";

export default function NotFound() {
  return (
    <section style={{ borderTop: 0 }}>
      <Seo title="Page not found – Roadies Rebirth" description="Page not found." noindex />
      <div className="wrap">
        <h2>Page not found</h2>
        <p className="lead">That page does not exist.</p>
        <Link className="btn primary" to="/">Back to home</Link>
      </div>
    </section>
  );
}
