import { Router } from "express";
import mongoose from "mongoose";
import rateLimit from "express-rate-limit";
import crypto from "node:crypto";
import { resources, Leader, Vote, AllTimeLeader, RankVote } from "../models/index.js";

const router = Router();

const httpError = (status, message) => Object.assign(new Error(message), { status });

/* Health check (works even if the database is down) */
router.get("/health", (req, res) => {
  res.json({ ok: true, db: mongoose.connection.readyState === 1 });
});

/* Everything below needs the database */
router.use((req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({ error: "Database not connected" });
  }
  next();
});

/* ---------- Admin protection ---------- */
const writeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests, try again later" },
});

function requireAdmin(req, res, next) {
  const real = process.env.ADMIN_KEY || "";
  if (real.length < 12) {
    return res.status(503).json({ error: "Admin is not configured on the server (set ADMIN_KEY, 12+ characters)" });
  }
  const given = Buffer.from(String(req.get("x-admin-key") || ""));
  const expected = Buffer.from(real);
  if (given.length !== expected.length || !crypto.timingSafeEqual(given, expected)) {
    return res.status(401).json({ error: "Wrong admin key" });
  }
  next();
}

router.post("/admin/verify", writeLimiter, requireAdmin, (req, res) => res.json({ ok: true }));

/* ---------- Super Fan poll: favourite gang leader ---------- */
// These routes must stay above the generic /:resource routes below.
const POLL = "favourite-leader";
const VOTER_RE = /^[A-Za-z0-9-]{16,64}$/;
const TEAM_LABEL = { OGs: "Team OG", NewGs: "Team NewGs" };

const voteLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 120, // generous, because many fans can share one WiFi network
  skipFailedRequests: true,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many votes from this network. Please try again later." },
});

// Whole-number percentages that always add up to exactly 100 (largest-remainder method).
function percents(counts) {
  const total = counts.reduce((a, b) => a + b, 0);
  if (!total) return counts.map(() => 0);
  const raw = counts.map((c) => (c * 100) / total);
  const out = raw.map(Math.floor);
  const left = 100 - out.reduce((a, b) => a + b, 0);
  raw
    .map((r, i) => [r - out[i], i])
    .sort((a, b) => b[0] - a[0])
    .slice(0, left)
    .forEach(([, i]) => out[i]++);
  return out;
}

const readVoter = (req) => {
  const id = String(req.get("x-voter-id") || "");
  return VOTER_RE.test(id) ? id : null;
};

async function pollSnapshot(voterId) {
  const [leaders, grouped, mine] = await Promise.all([
    Leader.find().sort({ order: 1, createdAt: 1 }).lean(),
    Vote.aggregate([{ $match: { poll: POLL } }, { $group: { _id: "$choice", n: { $sum: 1 } } }]),
    voterId ? Vote.findOne({ poll: POLL, voterId }).lean() : null,
  ]);
  const byChoice = new Map(grouped.map((g) => [g._id, g.n]));
  const votes = leaders.map((l) => byChoice.get(l.slug) || 0);
  const pct = percents(votes);
  const gangs = ["OGs", "NewGs"];
  const teamVotes = gangs.map((g) => leaders.reduce((sum, l, i) => (l.gang === g ? sum + votes[i] : sum), 0));
  const teamPct = percents(teamVotes);
  return {
    total: votes.reduce((a, b) => a + b, 0),
    options: leaders.map((l, i) => ({
      slug: l.slug,
      name: l.name,
      gang: l.gang,
      role: l.role,
      photo: l.photo,
      accent: l.accent,
      votes: votes[i],
      percent: pct[i],
    })),
    teams: gangs.map((g, i) => ({ gang: g, label: TEAM_LABEL[g], votes: teamVotes[i], percent: teamPct[i] })),
    myVote: mine ? mine.choice : null,
  };
}

router.get("/poll", async (req, res, next) => {
  try {
    res.set("Cache-Control", "no-store");
    res.json(await pollSnapshot(readVoter(req)));
  } catch (e) {
    next(e);
  }
});

router.post("/poll/vote", voteLimiter, async (req, res, next) => {
  try {
    const voterId = readVoter(req);
    if (!voterId) throw httpError(400, "Missing or invalid voter id");
    const choice = req.body && typeof req.body.leader === "string" ? req.body.leader : "";
    if (!choice || !(await Leader.exists({ slug: choice }))) throw httpError(400, "Pick one of the gang leaders");
    try {
      await Vote.create({ poll: POLL, voterId, choice });
    } catch (e) {
      if (e.code === 11000) {
        const snap = await pollSnapshot(voterId);
        return res.status(409).json({ ...snap, error: "You have already voted. One vote per fan!" });
      }
      throw e;
    }
    res.set("Cache-Control", "no-store");
    res.status(201).json(await pollSnapshot(voterId));
  } catch (e) {
    next(e);
  }
});

/* ---------- Super Fan poll: "Roadies - All Time" (rank your top 3) ---------- */
const ALL_TIME_POLL = "all-time-leader";

// Scoring: favourite = 3 points, second = 2, third = 1. The percentage is each
// leader's share of all points handed out, so the percentages add up to 100.
async function allTimeSnapshot(voterId) {
  const group = (field) =>
    RankVote.aggregate([{ $match: { poll: ALL_TIME_POLL } }, { $group: { _id: `$${field}`, n: { $sum: 1 } } }]);
  const [leaders, g1, g2, g3, voters, mine] = await Promise.all([
    AllTimeLeader.find().sort({ order: 1, name: 1 }).lean(),
    group("first"),
    group("second"),
    group("third"),
    RankVote.countDocuments({ poll: ALL_TIME_POLL }),
    voterId ? RankVote.findOne({ poll: ALL_TIME_POLL, voterId }).lean() : null,
  ]);
  const toMap = (g) => new Map(g.map((x) => [x._id, x.n]));
  const m1 = toMap(g1);
  const m2 = toMap(g2);
  const m3 = toMap(g3);
  const rows = leaders.map((l) => {
    const first = m1.get(l.slug) || 0;
    const second = m2.get(l.slug) || 0;
    const third = m3.get(l.slug) || 0;
    return { l, first, second, third, points: first * 3 + second * 2 + third };
  });
  const pct = percents(rows.map((r) => r.points));
  return {
    total: voters,
    leaders: rows.map((r, i) => ({
      slug: r.l.slug,
      name: r.l.name,
      seasons: r.l.seasons,
      photo: r.l.photo,
      accent: r.l.accent,
      first: r.first,
      second: r.second,
      third: r.third,
      points: r.points,
      percent: pct[i],
    })),
    myVote: mine ? { first: mine.first, second: mine.second, third: mine.third } : null,
  };
}

router.get("/poll/all-time", async (req, res, next) => {
  try {
    res.set("Cache-Control", "no-store");
    res.json(await allTimeSnapshot(readVoter(req)));
  } catch (e) {
    next(e);
  }
});

router.post("/poll/all-time/vote", voteLimiter, async (req, res, next) => {
  try {
    const voterId = readVoter(req);
    if (!voterId) throw httpError(400, "Missing or invalid voter id");
    const b = req.body && typeof req.body === "object" ? req.body : {};
    const picks = [b.first, b.second, b.third];
    if (!picks.every((p) => typeof p === "string" && p.length > 0 && p.length <= 80)) {
      throw httpError(400, "Pick your favourite, second and third gang leader");
    }
    if (new Set(picks).size !== 3) throw httpError(400, "Pick three different gang leaders");
    if ((await AllTimeLeader.countDocuments({ slug: { $in: picks } })) !== 3) {
      throw httpError(400, "One of your picks is not on the list");
    }
    try {
      await RankVote.create({ poll: ALL_TIME_POLL, voterId, first: picks[0], second: picks[1], third: picks[2] });
    } catch (e) {
      if (e.code === 11000) {
        const snap = await allTimeSnapshot(voterId);
        return res.status(409).json({ ...snap, error: "You have already voted. One ballot per fan!" });
      }
      throw e;
    }
    res.set("Cache-Control", "no-store");
    res.status(201).json(await allTimeSnapshot(voterId));
  } catch (e) {
    next(e);
  }
});

/* ---------- Generic CRUD for every section ---------- */
router.param("resource", (req, res, next, name) => {
  const cfg = Object.hasOwn(resources, name) ? resources[name] : null;
  if (!cfg) return res.status(404).json({ error: "Unknown resource" });
  req.cfg = cfg;
  next();
});

function pickFields(cfg, body) {
  if (!body || typeof body !== "object" || Array.isArray(body)) throw httpError(400, "Invalid body");
  const out = {};
  for (const f of cfg.fields) {
    if (body[f] === undefined) continue;
    const v = body[f];
    if (v !== null && typeof v === "object") throw httpError(400, `Invalid value for ${f}`);
    out[f] = v;
  }
  return out;
}

const checkId = (req) => {
  if (!mongoose.isValidObjectId(req.params.id)) throw httpError(404, "Not found");
};

router.get("/:resource", async (req, res, next) => {
  try {
    const items = await req.cfg.Model.find().sort(req.cfg.sort).lean();
    res.json(items);
  } catch (e) {
    next(e);
  }
});

router.post("/:resource", writeLimiter, requireAdmin, async (req, res, next) => {
  try {
    const doc = await req.cfg.Model.create(pickFields(req.cfg, req.body));
    res.status(201).json(doc);
  } catch (e) {
    next(e);
  }
});

router.put("/:resource/:id", writeLimiter, requireAdmin, async (req, res, next) => {
  try {
    checkId(req);
    const changes = pickFields(req.cfg, req.body);
    if (!Object.keys(changes).length) throw httpError(400, "Nothing to update");
    const doc = await req.cfg.Model.findByIdAndUpdate(
      req.params.id,
      { $set: changes },
      { new: true, runValidators: true }
    );
    if (!doc) throw httpError(404, "Not found");
    res.json(doc);
  } catch (e) {
    next(e);
  }
});

router.delete("/:resource/:id", writeLimiter, requireAdmin, async (req, res, next) => {
  try {
    checkId(req);
    const doc = await req.cfg.Model.findByIdAndDelete(req.params.id);
    if (!doc) throw httpError(404, "Not found");
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
});

router.use((req, res) => res.status(404).json({ error: "Not found" }));

// eslint-disable-next-line no-unused-vars
router.use((err, req, res, next) => {
  if (err.status) return res.status(err.status).json({ error: err.message });
  if (err.name === "ValidationError" || err.name === "CastError") {
    return res.status(400).json({ error: err.message });
  }
  if (err.code === 11000) return res.status(409).json({ error: "That entry already exists" });
  console.error(err);
  res.status(500).json({ error: "Server error" });
});

export default router;
