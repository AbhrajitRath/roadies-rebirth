// Page titles/descriptions that the server writes into the HTML before sending it,
// so Google sees the right tags even before JavaScript runs.
// Keep these in sync with client/src/seoData.js.

export const PAGES = {
  "/": {
    title: "Roadies Rebirth – Gangs, Episodes, Contestants & Auditions (Fan Site)",
    description:
      "Unofficial fan site for Roadies Rebirth, premiered 16 October 2026. Gang leaders, episodes, contestants, eliminations, auditions and where to watch on Netflix and JioHotstar.",
  },
  "/episodes": {
    title: "Roadies Rebirth Episodes – Episode Guide & Recaps (Fan Site)",
    description: "Episode guide and recaps for Roadies Rebirth, premiered 16 October 2026. Unofficial fan site.",
  },
  "/contestants": {
    title: "Roadies Rebirth Contestants – Profiles (Fan Site)",
    description: "Meet the contestants of Roadies Rebirth. Unofficial fan site.",
  },
  "/eliminations": {
    title: "Roadies Rebirth Eliminations – Who Is Out (Fan Site)",
    description: "Elimination updates for Roadies Rebirth. Unofficial fan site.",
  },
  "/gangs": {
    title: "Roadies Rebirth Gang Leaders – Team OG & Team NewGs (Fan Site)",
    description:
      "Meet the six gang leaders of Roadies Rebirth: Team OG (Nikhil Chinapa, Neha Dhupia, Prince Narula) and Team NewGs (Abhishek Malhan, Bani J, Baseer Ali). Unofficial fan site.",
  },
  "/auditions": {
    title: "Roadies Rebirth Auditions – Highlights (Fan Site)",
    description: "Audition details and highlights for Roadies Rebirth. Unofficial fan site.",
  },
  "/super-fan": {
    title: "Roadies Super Fan – Vote for Your Favourite Gang Leaders (Fan Site)",
    description:
      "Roadies Super Fan polls: pick your favourite Roadies Rebirth gang leader, or rank your all-time top 3 Roadies gang leaders. Live results. Unofficial fan site.",
  },
  "/super-fan/roadies-rebirth": {
    title: "Roadies Rebirth Poll – Vote for Your Favourite Gang Leader (Fan Site)",
    description:
      "Vote for your favourite Roadies Rebirth gang leader and watch the live results. Team OG vs Team NewGs. Unofficial fan site.",
  },
  "/super-fan/all-time": {
    title: "Roadies All-Time Poll – Rank Your Top 3 Gang Leaders Ever (Fan Site)",
    description:
      "Rank your all-time favourite, second and third Roadies gang leader from every season and see the live leaderboard. Unofficial fan site.",
  },
  "/admin": {
    title: "Admin – Roadies Rebirth",
    description: "Site administration.",
    noindex: true,
  },
};

export const esc = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export function pageFor(pathname) {
  const clean = pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;
  return { key: clean, meta: PAGES[clean] || null };
}

export function renderHtml(template, key, meta, siteUrl) {
  const m = meta || { title: "Page not found – Roadies Rebirth", description: "Page not found.", noindex: true };
  const tags = [];
  if (m.noindex) tags.push('<meta name="robots" content="noindex">');
  if (siteUrl && meta && !m.noindex) {
    tags.push(`<link rel="canonical" href="${esc(siteUrl + (key === "/" ? "/" : key))}">`);
    tags.push(`<meta property="og:url" content="${esc(siteUrl + (key === "/" ? "/" : key))}">`);
  }
  tags.push(`<meta property="og:title" content="${esc(m.title)}">`);
  tags.push(`<meta property="og:description" content="${esc(m.description)}">`);
  tags.push('<meta property="og:type" content="website">');

  return template
    .replace(/<title>.*?<\/title>/s, () => `<title>${esc(m.title)}</title>`)
    .replace(/<meta name="description" content="[^"]*"\s*\/?>/, () => `<meta name="description" content="${esc(m.description)}">`)
    .replace("<!--SEO-->", () => tags.join("\n    "));
}

export function sitemapXml(base) {
  const urls = Object.entries(PAGES)
    .filter(([, m]) => !m.noindex)
    .map(([p]) => `  <url><loc>${esc(base + (p === "/" ? "/" : p))}</loc></url>`)
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}
