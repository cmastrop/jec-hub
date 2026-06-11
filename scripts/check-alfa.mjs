import { readFileSync } from "fs";
const html = readFileSync("C:/Users/CMastropasqua/Downloads/alfa_cifras.html", "utf-8");
const re = /<pre>([\s\S]*?)<\/pre>/gi;
let m;
let i = 0;
while ((m = re.exec(html)) !== null) {
  i++;
  const clean = m[1].replace(/<A>/g, "[").replace(/<\/A>/g, "]").replace(/<[^>]+>/g, "");
  console.log(`=== Block ${i} (${m[1].length} chars) ===`);
  console.log(clean);
  console.log();
}
