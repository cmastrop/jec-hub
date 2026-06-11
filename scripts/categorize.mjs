import { readFileSync } from "fs";

const songs = JSON.parse(readFileSync("C:/Users/CMastropasqua/Downloads/lacuerda_cristiano.json", "utf-8"));
const CATHOLIC_FILTER = /mar[ií]a|virgen|sacramento|rosario|eucarist|hostia|misa\b|santo padre|papa\b|ave mar|salve\b|letaní|inmaculad|asunci[oó]n|guadalupe/i;

const filtered = songs.filter(s => !CATHOLIC_FILTER.test(s.title));
const excluded = songs.filter(s => CATHOLIC_FILTER.test(s.title));

const byArtist = {};
for (const s of filtered) {
  byArtist[s.artist] = (byArtist[s.artist] || 0) + 1;
}

const cats = {
  "ADORACION / WORSHIP EN ESPAÑOL": [
    "Miel San Marcos", "Marco Barrientos", "Marcos Witt", "Marcos Brunet",
    "Generación 12", "Su Presencia", "Montesanto", "Barak",
    "En Espiritu y en Verdad", "New Wine", "Julio Melgar", "Avivamiento",
    "Ebenezer", "Conquistando Fronteras", "Kairo Worship", "Kairos Worship",
    "Horeb Worship", "Jesús Worship Center",
  ],
  "CANTAUTORES CRISTIANOS": [
    "Jesús Adrián Romero", "Danilo Montero", "Alex Campos", "Lilly Goodman",
    "Marcela Gandara", "Danny Berríos", "Juan Carlos Alvarado", "Coalo Zamorano",
    "Abel Zavala", "Ingrid Rosario", "Lucas Conslie", "Majo Solís", "Majo y Dan",
    "Art Aguilera", "Funky", "Averly Morillo", "Tercer Cielo",
  ],
  "WORSHIP EN INGLÉS (traducido al español)": [
    "Hillsong United", "Elevation Worship", "Bethel Music", "Chris Tomlin",
    "Kari Jobe", "Maverick City Music", "Planetshakers", "Gateway Worship",
    "Upperroom", "World Worship",
  ],
  "ROCK / POP CRISTIANO": ["Rojo", "Rescate", "Marcos Vidal"],
  "ALABANZA LATINA": [
    "Alabanzas Llamada Final", "Manantial de Inspiración", "Inspiración",
    "Inspiración Cristiana", "Aline Barros", "Xtreme Kids",
  ],
  "CATEGORÍAS GENÉRICAS": ["Música Católica", "Música Cristiana"],
};

function findCount(name) {
  const entry = Object.entries(byArtist).find(([k]) => k.substring(0, 12) === name.substring(0, 12));
  return entry ? { name: entry[0], count: entry[1] } : null;
}

let grandTotal = 0;
for (const [cat, artists] of Object.entries(cats)) {
  let catTotal = 0;
  const lines = [];
  for (const a of artists) {
    const found = findCount(a);
    if (found) { lines.push(found); catTotal += found.count; }
  }
  lines.sort((a, b) => b.count - a.count);
  console.log(`\n=== ${cat} (${catTotal} canciones) ===`);
  lines.forEach(l => console.log(`  ${l.name}: ${l.count}`));
  grandTotal += catTotal;
}

// Christine D'Clario special
const christine = Object.entries(byArtist).find(([k]) => k.startsWith("Christine"));
if (christine) {
  console.log(`\n  + Christine D'Clario: ${christine[1]} (cantautora)`);
  grandTotal += christine[1];
}

console.log(`\n${"=".repeat(50)}`);
console.log(`TOTAL a subir: ${filtered.length}`);
console.log(`Excluidas (católicas específicas): ${excluded.length}`);
console.log(`${"=".repeat(50)}`);

console.log(`\n--- CANCIONES EXCLUIDAS (${excluded.length}) ---`);
excluded.forEach(s => console.log(`  ✗ ${s.title} (${s.artist})`));
