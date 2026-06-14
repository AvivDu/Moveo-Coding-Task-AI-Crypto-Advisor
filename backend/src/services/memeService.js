import memes from "../data/memes.json" with { type: "json" };

export function getMeme() {
  const dayIndex = new Date().getDate() % memes.length;
  return memes[dayIndex];
}
