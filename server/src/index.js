import "dotenv/config";
import express from "express";
import helmet from "helmet";
import cors from "cors";
import mongoose from "mongoose";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import apiRouter from "./routes/api.js";
import { Vote, RankVote } from "./models/index.js";
import { pageFor, renderHtml, sitemapXml } from "./seo.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.resolve(__dirname, "../../client/dist");
const indexFile = path.join(distDir, "index.html");

export const app = express();
app.set("trust proxy", 1);

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        "default-src": ["'self'"],
        "script-src": ["'self'"],
        "style-src": ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        "font-src": ["'self'", "https://fonts.gstatic.com"],
        "img-src": ["'self'", "data:", "https:"],
        "connect-src": ["'self'"],
      },
    },
  })
);

// CORS is only needed if the React app is hosted on a different address than this server.
const origins = (process.env.CLIENT_ORIGIN || "").split(",").map((s) => s.trim()).filter(Boolean);
if (origins.length) app.use(cors({ origin: origins }));

app.use(express.json({ limit: "50kb" }));

app.use("/api", apiRouter);

const siteUrl = (req) => (process.env.SITE_URL || `${req.protocol}://${req.get("host")}`).replace(/\/+$/, "");

app.get("/robots.txt", (req, res) => {
  res.type("text/plain").send(`User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /api/\n\nSitemap: ${siteUrl(req)}/sitemap.xml\n`);
});

app.get("/sitemap.xml", (req, res) => {
  res.type("application/xml").send(sitemapXml(siteUrl(req)));
});

const built = fs.existsSync(indexFile);
if (built) {
  app.use(express.static(distDir, { index: false, maxAge: "1h" }));
}

// Every other address returns the React app, with the right title/description for that page.
app.get("*", (req, res) => {
  if (!built) {
    return res
      .status(503)
      .type("text/plain")
      .send("The React app is not built yet. Run: npm run build");
  }
  const { key, meta } = pageFor(req.path);
  const template = fs.readFileSync(indexFile, "utf8");
  res
    .status(meta ? 200 : 404)
    .type("html")
    .send(renderHtml(template, key, meta, process.env.SITE_URL ? siteUrl(req) : ""));
});

const PORT = Number(process.env.PORT) || 5000;

async function start() {
  if (process.env.MONGODB_URI) {
    try {
      await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 10000 });
      console.log("MongoDB connected");
      // Makes sure the "one vote per fan" rule is enforced by the database itself.
      await Promise.all([Vote.init(), RankVote.init()]).catch((e) =>
        console.error("Could not prepare the votes collections:", e.message)
      );
    } catch (e) {
      console.error("MongoDB connection failed:", e.message);
    }
  } else {
    console.warn("MONGODB_URI is not set. The API will answer 503 until you add it to server/.env");
  }
  app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
}

if (process.argv[1] === fileURLToPath(import.meta.url)) start();
