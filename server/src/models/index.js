import mongoose from "mongoose";

const { Schema } = mongoose;

const str = (max = 200, extra = {}) => ({ type: String, trim: true, maxlength: max, ...extra });

const photo = {
  type: String,
  trim: true,
  maxlength: 300,
  validate: {
    validator: (v) => !v || /^(\/|https:\/\/)/.test(v),
    message: "Photo must start with / or https://",
  },
};

const urlField = {
  type: String,
  trim: true,
  maxlength: 300,
  validate: {
    validator: (v) => !v || /^https:\/\//.test(v),
    message: "Link must start with https://",
  },
};

const gang = (required = false) => ({
  type: String,
  enum: required ? ["OGs", "NewGs"] : ["", "OGs", "NewGs"],
  required,
  default: required ? undefined : "",
});

/* ---------- Gang leaders ---------- */
const leaderSchema = new Schema(
  {
    name: str(80, { required: true }),
    slug: str(80, { unique: true, lowercase: true }),
    gang: gang(true),
    order: { type: Number, default: 0 },
    role: str(80),
    speciality: str(300),
    strength: str(500),
    tagline: str(160),
    photo,
    accent: {
      type: String,
      default: "#ff8a1f",
      match: [/^#[0-9a-fA-F]{6}$/, "Accent must be a hex colour like #ff8a1f"],
    },
  },
  { timestamps: true }
);
leaderSchema.pre("validate", function (next) {
  if (!this.slug && this.name) {
    this.slug = this.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  }
  next();
});

/* ---------- Episodes ---------- */
const episodeSchema = new Schema(
  {
    number: { type: Number, required: true, min: 1 },
    title: str(120, { required: true }),
    airDate: Date,
    summary: str(1500),
    netflixUrl: urlField,
    hotstarUrl: urlField,
  },
  { timestamps: true }
);

/* ---------- Contestants ---------- */
const contestantSchema = new Schema(
  {
    name: str(80, { required: true }),
    gang: gang(false),
    city: str(80),
    episode: { type: Number, min: 1 },
    leader: str(80),
    status: { type: String, enum: ["active", "eliminated"], default: "active" },
    photo,
    bio: str(1500),
  },
  { timestamps: true }
);

/* ---------- Eliminations ---------- */
const eliminationSchema = new Schema(
  {
    contestantName: str(80, { required: true }),
    episodeNumber: { type: Number, min: 1 },
    gang: gang(false),
    note: str(1000),
  },
  { timestamps: true }
);

/* ---------- Auditions ---------- */
const auditionSchema = new Schema(
  {
    // "city" is really the entry's title: a city name, or a heading like "Roadies Battleground".
    kind: { type: String, enum: ["on-ground", "digital", "format", "question"], default: "on-ground" },
    order: { type: Number, default: 0 },
    city: str(80, { required: true }),
    date: Date,
    venue: str(150),
    summary: str(1500),
  },
  { timestamps: true }
);

/* ---------- Audition: Not Selected ---------- */
const rejectedSchema = new Schema(
  {
    name: str(80, { required: true }),
    city: str(80),
    result: str(80, { default: "Not selected" }),
    reason: str(500),
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

/* ---------- All-time gang leaders (for the "Roadies - All Time" poll) ---------- */
const allTimeLeaderSchema = new Schema(
  {
    name: str(80, { required: true }),
    slug: str(80, { unique: true, lowercase: true }),
    order: { type: Number, default: 0 },
    seasons: str(300),
    photo,
    accent: {
      type: String,
      default: "#ff8a1f",
      match: [/^#[0-9a-fA-F]{6}$/, "Accent must be a hex colour like #ff8a1f"],
    },
  },
  { timestamps: true }
);
allTimeLeaderSchema.pre("validate", function (next) {
  if (!this.slug && this.name) {
    this.slug = this.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  }
  next();
});

/* ---------- Ranked votes: favourite, second and third (one ballot per fan) ---------- */
const rankVoteSchema = new Schema(
  {
    poll: str(60, { required: true }),
    voterId: str(64, { required: true, match: /^[A-Za-z0-9-]{16,64}$/ }),
    first: str(80, { required: true }),
    second: str(80, { required: true }),
    third: str(80, { required: true }),
  },
  { timestamps: true }
);
rankVoteSchema.index({ poll: 1, voterId: 1 }, { unique: true });

/* ---------- Super Fan poll votes (one per fan per poll) ---------- */
const voteSchema = new Schema(
  {
    poll: str(60, { required: true, default: "favourite-leader" }),
    voterId: str(64, { required: true, match: /^[A-Za-z0-9-]{16,64}$/ }),
    choice: str(80, { required: true }), // slug of the gang leader voted for
  },
  { timestamps: true }
);
voteSchema.index({ poll: 1, voterId: 1 }, { unique: true });
voteSchema.index({ poll: 1, choice: 1 });

const Leader = mongoose.model("Leader", leaderSchema);
const Episode = mongoose.model("Episode", episodeSchema);
const Contestant = mongoose.model("Contestant", contestantSchema);
const Elimination = mongoose.model("Elimination", eliminationSchema);
const Audition = mongoose.model("Audition", auditionSchema);
const Rejected = mongoose.model("Rejected", rejectedSchema);
const AllTimeLeader = mongoose.model("AllTimeLeader", allTimeLeaderSchema);

const HIDDEN = new Set(["_id", "__v", "createdAt", "updatedAt", "slug"]);

function config(Model, sort) {
  return {
    Model,
    sort,
    // only these fields can ever be written through the API
    fields: Object.keys(Model.schema.paths).filter((p) => !HIDDEN.has(p)),
  };
}

export const resources = {
  leaders: config(Leader, { order: 1, createdAt: 1 }),
  episodes: config(Episode, { number: 1 }),
  contestants: config(Contestant, { createdAt: 1 }),
  eliminations: config(Elimination, { episodeNumber: 1, createdAt: 1 }),
  auditions: config(Audition, { order: 1, date: 1, createdAt: 1 }),
  notselected: config(Rejected, { order: 1, createdAt: 1 }),
  legends: config(AllTimeLeader, { order: 1, name: 1 }),
};

const Vote = mongoose.model("Vote", voteSchema);
const RankVote = mongoose.model("RankVote", rankVoteSchema);

export { Leader, Episode, Contestant, Elimination, Audition, Rejected, AllTimeLeader, Vote, RankVote };
