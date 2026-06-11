import { readFileSync } from "fs";
const songs = JSON.parse(readFileSync("C:/Users/CMastropasqua/Downloads/lacuerda_cristiano.json", "utf-8"));

const solfegePattern = /\[(DO|RE|MI|FA|SOL|LA|SI)[#b]?/i;
const solfege = songs.filter(s => solfegePattern.test(s.chordpro));
const letter = songs.filter(s => !solfegePattern.test(s.chordpro));

console.log("Total:", songs.length);
console.log("En solfeo (DO RE MI):", solfege.length, "(" + (solfege.length / songs.length * 100).toFixed(1) + "%)");
console.log("En cifrado (C D E):", letter.length, "(" + (letter.length / songs.length * 100).toFixed(1) + "%)");

// By artist
const byArtist = {};
for (const s of solfege) {
  byArtist[s.artist] = (byArtist[s.artist] || 0) + 1;
}
console.log("\nArtistas con canciones en solfeo:");
Object.entries(byArtist).sort((a, b) => b[1] - a[1]).forEach(([name, count]) => {
  const total = songs.filter(s => s.artist === name).length;
  console.log(`  ${name}: ${count}/${total} en solfeo`);
});
