/* Each visitor gets a random id stored in their browser. It is how the site knows
   "one vote per fan". It is not tied to a name, email or anything personal. */
let memoryId = "";
export function getVoterId() {
  const make = () =>
    typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
  try {
    let id = localStorage.getItem("rr_voter");
    if (!id || !/^[A-Za-z0-9-]{16,64}$/.test(id)) {
      id = make();
      localStorage.setItem("rr_voter", id);
    }
    return id;
  } catch {
    if (!memoryId) memoryId = make();
    return memoryId;
  }
}
