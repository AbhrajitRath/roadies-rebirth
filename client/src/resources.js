// Describes the forms on the /admin page. To add a field later: add it here AND in server/src/models/index.js.
const GANGS_REQUIRED = [["OGs", "OGs"], ["NewGs", "NewGs"]];
const GANGS_OPTIONAL = [["", "—"], ["OGs", "OGs"], ["NewGs", "NewGs"]];

const AUDITION_KINDS = [
  ["on-ground", "On-ground city"],
  ["digital", "Digital audition"],
  ["format", "How it works"],
  ["question", "Audition question"],
];
const AUDITION_KIND_LABEL = Object.fromEntries(AUDITION_KINDS);

const LEADER_OPTIONS = [
  ["", "— (not specified)"],
  ["Prince Narula", "Prince Narula"],
  ["Nikhil Chinapa", "Nikhil Chinapa"],
  ["Neha Dhupia", "Neha Dhupia"],
  ["Abhishek Malhan", "Abhishek Malhan"],
  ["Bani J", "Bani J"],
  ["Baseer Ali", "Baseer Ali"],
];

export const RESOURCES = {
  leaders: {
    label: "Gang leaders",
    title: (i) => `${i.name} (${i.gang})`,
    fields: [
      { name: "name", label: "Name", required: true },
      { name: "gang", label: "Gang", type: "select", options: GANGS_REQUIRED, required: true },
      { name: "order", label: "Order (1 shows first)", type: "number" },
      { name: "role", label: "Title (e.g. The Strategic Veteran)" },
      { name: "speciality", label: "Speciality", type: "textarea" },
      { name: "strength", label: "Leadership strength", type: "textarea" },
      { name: "tagline", label: "Fan tagline" },
      { name: "photo", label: "Photo", hint: "A path like /images/name.jpg (file placed in client/public/images) or a full https:// link." },
      { name: "accent", label: "Accent colour", type: "color" },
    ],
  },
  episodes: {
    label: "Episodes",
    title: (i) => `Episode ${i.number}: ${i.title}`,
    fields: [
      { name: "number", label: "Episode number", type: "number", required: true },
      { name: "title", label: "Title", required: true },
      { name: "airDate", label: "Air date", type: "date" },
      { name: "summary", label: "Summary", type: "textarea" },
      { name: "netflixUrl", label: "Netflix link (optional)", hint: "Must start with https://. Leave empty to link to Netflix's home page." },
      { name: "hotstarUrl", label: "JioHotstar link (optional)", hint: "Must start with https://. Leave empty to link to JioHotstar's home page." },
    ],
  },
  contestants: {
    label: "Contestants",
    title: (i) => `${i.name}${i.gang ? ` (${i.gang})` : ""} – ${i.status}`,
    fields: [
      { name: "name", label: "Name", required: true },
      { name: "gang", label: "Gang", type: "select", options: GANGS_OPTIONAL },
      { name: "city", label: "City" },
      { name: "episode", label: "Selected in episode", type: "number" },
      { name: "leader", label: "Joined gang leader", type: "select", options: LEADER_OPTIONS },
      { name: "status", label: "Status", type: "select", options: [["active", "In the game"], ["eliminated", "Eliminated"]] },
      { name: "photo", label: "Photo", hint: "A path like /images/name.jpg or a full https:// link." },
      { name: "bio", label: "Bio", type: "textarea" },
    ],
  },
  eliminations: {
    label: "Eliminations",
    title: (i) => `${i.episodeNumber ? `EP ${i.episodeNumber} – ` : ""}${i.contestantName}`,
    fields: [
      { name: "contestantName", label: "Contestant name", required: true },
      { name: "episodeNumber", label: "Episode number", type: "number" },
      { name: "gang", label: "Gang", type: "select", options: GANGS_OPTIONAL },
      { name: "note", label: "Note", type: "textarea" },
    ],
  },
  auditions: {
    label: "Auditions",
    title: (i) => `[${AUDITION_KIND_LABEL[i.kind || "on-ground"]}] ${i.city}${i.date ? ` – ${i.date.slice(0, 10)}` : ""}`,
    fields: [
      { name: "kind", label: "Type of entry", type: "select", options: AUDITION_KINDS, hint: "Decides which part of the Auditions page it appears in." },
      { name: "order", label: "Order (1 shows first)", type: "number" },
      { name: "city", label: "City or title", required: true, hint: "A city for on-ground auditions, otherwise a short heading." },
      { name: "date", label: "Date", type: "date" },
      { name: "venue", label: "Venue" },
      { name: "summary", label: "Details", type: "textarea" },
    ],
  },
  notselected: {
    label: "Audition: Not Selected",
    title: (i) => `${i.name}${i.city ? ` (${i.city})` : ""}`,
    fields: [
      { name: "name", label: "Aspirant name", required: true },
      { name: "city", label: "City" },
      { name: "result", label: "Result", hint: "e.g. Not selected (Episode 2)" },
      { name: "reason", label: "Why", type: "textarea" },
      { name: "order", label: "Order (1 shows first)", type: "number" },
    ],
  },
  legends: {
    label: "All-time leaders",
    title: (i) => i.name,
    fields: [
      { name: "name", label: "Name", required: true },
      { name: "order", label: "Order (1 shows first)", type: "number" },
      { name: "seasons", label: "Seasons they led a gang", hint: "e.g. Roadies Rising (2017) · Xtreme (2018)" },
      { name: "photo", label: "Photo (optional)", hint: "A path like /images/name.jpg or a full https:// link. Initials are shown if empty." },
      { name: "accent", label: "Accent colour", type: "color" },
    ],
  },
};
