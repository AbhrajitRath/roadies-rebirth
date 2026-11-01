// Adds the six gang leaders to the database.
// Safe to run more than once: leaders that already exist are NOT overwritten,
// so changes you make in the admin page are kept.
import "dotenv/config";
import mongoose from "mongoose";
import { Leader, Episode, Contestant, Audition, Rejected, AllTimeLeader } from "./models/index.js";

// Every Roadies gang leader across the seasons that had gang leaders, compiled from public sources.
// Edit, add or remove people on the /admin page ("All-time leaders" tab).
const LEGENDS = [
  { name: "Rannvijay Singha", seasons: "Roadies X (2013) · X2 (2015) · X4 (2016) · Rising (2017)" },
  { name: "Raghu Ram", seasons: "Roadies X (2013)" },
  { name: "Esha Deol", seasons: "Roadies X2 (2015)" },
  { name: "Vijender Singh", seasons: "Roadies X2 (2015)" },
  { name: "Karan Kundra", seasons: "Roadies X2 (2015) · X4 (2016) · Rising (2017)" },
  { name: "Sushil Kumar", seasons: "Roadies X4 (2016)" },
  {
    name: "Neha Dhupia",
    seasons: "Roadies X4 (2016) · Rising (2017) · Xtreme (2018) · Real Heroes (2019) · Revolution (2020–21) · Double Cross (2025) · Rebirth (2026)",
    photo: "/images/neha-dhupia.jpg",
  },
  {
    name: "Prince Narula",
    seasons: "Roadies X4 (2016) · Rising (2017) · Xtreme (2018) · Real Heroes (2019) · Revolution (2020–21) · Karm Ya Kaand (2023) · Double Cross (2025) · Rebirth (2026)",
    photo: "/images/prince-narula.jpg",
  },
  {
    name: "Nikhil Chinapa",
    seasons: "Roadies Rising (2017) · Xtreme (2018) · Real Heroes (2019) · Revolution (2020–21) · Rebirth (2026)",
    photo: "/images/nikhil-chinapa.jpg",
  },
  { name: "Raftaar", seasons: "Roadies Xtreme (2018) · Real Heroes (2019) · Revolution (2020–21)" },
  { name: "Sandeep Singh", seasons: "Roadies Real Heroes (2019)" },
  { name: "Varun Sood", seasons: "Roadies Revolution (2020–21)" },
  { name: "Rhea Chakraborty", seasons: "Roadies Karm Ya Kaand (2023) · Double Cross (2025)" },
  { name: "Gautam Gulati", seasons: "Roadies Karm Ya Kaand (2023) · Double Cross (2025)" },
  { name: "Elvish Yadav", seasons: "Roadies Double Cross (2025)" },
  { name: "Abhishek Malhan", seasons: "Roadies Rebirth (2026)", photo: "/images/abhishek-malhan.jpg" },
  { name: "Bani J", seasons: "Roadies Rebirth (2026)", photo: "/images/bani-j.jpg" },
  { name: "Baseer Ali", seasons: "Roadies Rebirth (2026)", photo: "/images/baseer-ali.jpg" },
];
const PALETTE = ["#ff5a4d", "#5ec8ff", "#ffc83d", "#7be0a4", "#c58bff", "#ff8a1f", "#ff6fae", "#4fd1c5"];

// Aspirants who were not selected at the auditions.
const REJECTED = [
  { name: "Hrietik Walia", city: "Delhi", result: "Not selected", reason: "Asked to leave after criticism from all six gang leaders and host Rannvijay Singha" },
  { name: "Allen Choudhary", city: "Not confirmed", result: "Not selected", reason: "Asked to leave after criticism from all six gang leaders and host Rannvijay Singha" },
  { name: "Vihaan Bhatt", city: "Jammu and Kashmir", result: "Not selected (Episode 2)", reason: "Fitness athlete and content creator who was rejected by the gang leaders" },
];

// On-ground audition zones. Add dates and venues on the /admin page when you have them.
const AUDITIONS = [
  { city: "Delhi-NCR", summary: "Auditions held in Noida." },
  { city: "Chandigarh", summary: "Auditions held in Panchkula." },
  { city: "Kolkata", date: "2026-09-10", venue: "Army Institute of Management" },
  { city: "Pune", date: "2026-09-12" },
];

// Contestants selected so far, and the gang leader whose team they joined.
const CONTESTANTS = [
  { episode: 1, name: "Preet", city: "Gurgaon", gang: "OGs", leader: "Prince Narula" },
  { episode: 1, name: "Sneha", city: "Kolkata", gang: "OGs", leader: "Neha Dhupia" },
  { episode: 1, name: "Shine", city: "Shimla", gang: "OGs", leader: "Prince Narula" },
  { episode: 1, name: "Karishma Talwar", city: "Dehradun", gang: "OGs", leader: "" },
  { episode: 2, name: "Salbani", city: "Shillong", gang: "NewGs", leader: "Bani J" },
  { episode: 2, name: "Rhythm", city: "New Delhi", gang: "NewGs", leader: "Baseer Ali" },
  { episode: 2, name: "Kunwar Vinay Pratap Singh", city: "Jammu", gang: "NewGs", leader: "Abhishek Malhan" },
  { episode: 2, name: "Shravani Sarjerao", city: "Pune", gang: "OGs", leader: "Neha Dhupia" },
  { episode: 2, name: "Soumya Yadav", city: "Greater Noida", gang: "OGs", leader: "Nikhil Chinapa" },
  { episode: 2, name: "Ganesh Chand Thakuri (ARWIN)", city: "Nepal", gang: "OGs", leader: "Neha Dhupia" },
  { episode: 2, name: "Kiaan", city: "Mumbai", gang: "NewGs", leader: "Baseer Ali" },
];

// Episodes released so far (Fridays and Saturdays from the 16 October 2026 premiere).
// Titles and summaries are placeholders: edit them on the /admin page.
const EPISODES = [
  { number: 1, title: "Season Premiere", airDate: "2026-10-16" },
  { number: 2, title: "Episode 2", airDate: "2026-10-17" },
  { number: 3, title: "Episode 3", airDate: "2026-10-23" },
  { number: 4, title: "Episode 4", airDate: "2026-10-24" },
  { number: 5, title: "Episode 5", airDate: "2026-10-30" },
  { number: 6, title: "Episode 6", airDate: "2026-10-31" },
];

const LEADERS = [
  {
    name: "Nikhil Chinapa", gang: "OGs", order: 1, accent: "#5ec8ff",
    role: "The Strategic Veteran",
    speciality: "Calm, analytical decision-making and long-term strategy.",
    strength: "Experience with the Roadies format and judging contestants beyond first impressions.",
    tagline: "Experience sees moves before they happen.",
    photo: "/images/nikhil-chinapa.jpg",
  },
  {
    name: "Neha Dhupia", gang: "OGs", order: 2, accent: "#ff5a4d",
    role: "The Fearless Strategist",
    speciality: "Direct questioning, confidence and standing firm under pressure.",
    strength: "Challenging contestants' reasoning and making decisive calls.",
    tagline: "Strong opinions. Stronger decisions.",
    photo: "/images/neha-dhupia.jpg",
  },
  {
    name: "Prince Narula", gang: "OGs", order: 3, accent: "#ffc83d",
    role: "The Competitor",
    speciality: "Competitive drive, confidence and a winner's mentality.",
    strength: "Understanding the pressures of being a Roadie himself and motivating contestants to fight for survival.",
    tagline: "Born to compete. Driven to win.",
    photo: "/images/prince-narula.jpg",
  },
  {
    name: "Abhishek Malhan", gang: "NewGs", order: 4, accent: "#7be0a4",
    role: "The Digital Strategist",
    speciality: "Creative thinking, digital-era audience awareness and adaptability.",
    strength: "Bringing a fresh perspective from online content creation and reality television.",
    tagline: "Think differently. Play intelligently.",
    photo: "/images/abhishek-malhan.jpg",
  },
  {
    name: "Bani J", gang: "NewGs", order: 5, accent: "#c58bff",
    role: "The Fitness Warrior",
    speciality: "Fitness, resilience and a fearless attitude.",
    strength: "Bringing a physically driven mindset and first-hand understanding of the Roadies experience.",
    tagline: "Strength is built under pressure.",
    photo: "/images/bani-j.jpg",
  },
  {
    name: "Baseer Ali", gang: "NewGs", order: 6, accent: "#ff8a1f",
    role: "The Comeback Competitor",
    speciality: "Competitive instincts and familiarity with the reality-show environment.",
    strength: "Having experienced Roadies as a contestant, he can draw on that journey when mentoring new participants.",
    tagline: "Once a Roadie, always a fighter.",
    photo: "/images/baseer-ali.jpg",
  },
];

const slugify = (n) => n.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

if (!process.env.MONGODB_URI) {
  console.error("Set MONGODB_URI in server/.env first.");
  process.exit(1);
}

await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 10000 });
let added = 0;
for (const l of LEADERS) {
  const r = await Leader.updateOne({ slug: slugify(l.name) }, { $setOnInsert: { ...l, slug: slugify(l.name) } }, { upsert: true });
  if (r.upsertedCount) added++;
}
console.log(`Seed done. Added ${added} new leader(s), ${LEADERS.length - added} already existed.`);

let addedEp = 0;
for (const ep of EPISODES) {
  const r = await Episode.updateOne(
    { number: ep.number },
    { $setOnInsert: { ...ep, airDate: new Date(ep.airDate) } },
    { upsert: true }
  );
  if (r.upsertedCount) addedEp++;
}
console.log(`Episodes: added ${addedEp} new, ${EPISODES.length - addedEp} already existed.`);

let addedC = 0;
for (const c of CONTESTANTS) {
  const r = await Contestant.updateOne(
    { name: c.name },
    { $setOnInsert: { ...c, status: "active" } },
    { upsert: true }
  );
  if (r.upsertedCount) addedC++;
}
console.log(`Contestants: added ${addedC} new, ${CONTESTANTS.length - addedC} already existed.`);

let addedA = 0;
for (const a of AUDITIONS) {
  const doc = { ...a };
  if (a.date) doc.date = new Date(a.date);
  const r = await Audition.updateOne({ city: a.city }, { $setOnInsert: doc }, { upsert: true });
  if (r.upsertedCount) addedA++;
}
console.log(`Auditions: added ${addedA} new, ${AUDITIONS.length - addedA} already existed.`);

let addedR = 0;
for (const [i, r0] of REJECTED.entries()) {
  const r = await Rejected.updateOne({ name: r0.name }, { $setOnInsert: { ...r0, order: i + 1 } }, { upsert: true });
  if (r.upsertedCount) addedR++;
}
console.log(`Not selected: added ${addedR} new, ${REJECTED.length - addedR} already existed.`);

let addedL = 0;
for (const [i, l] of LEGENDS.entries()) {
  const slug = slugify(l.name);
  const r = await AllTimeLeader.updateOne(
    { slug },
    { $setOnInsert: { ...l, slug, order: i + 1, accent: PALETTE[i % PALETTE.length] } },
    { upsert: true }
  );
  if (r.upsertedCount) addedL++;
}
console.log(`All-time leaders: added ${addedL} new, ${LEGENDS.length - addedL} already existed.`);
await mongoose.disconnect();
