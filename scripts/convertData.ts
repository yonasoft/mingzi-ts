import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import readline from "readline";
import type { Surname, GivenChar } from "../src/types.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const SCRIPTS_DIR = __dirname;
const OUT_DIR = path.join(__dirname, "../src/data");

// Ensure output directory exists
fs.mkdirSync(OUT_DIR, { recursive: true });

// ─── Generic CSV parser ───────────────────────────────────────────────────────

async function parseCSV(filePath: string): Promise<Record<string, string>[]> {
  const rl = readline.createInterface({
    input: fs.createReadStream(filePath),
    crlfDelay: Infinity,
  });

  const rows: Record<string, string>[] = [];
  let headers: string[] = [];
  let isFirst = true;

  for await (const line of rl) {
    if (!line.trim()) continue;
    const cols = line.split(",");
    if (isFirst) {
      headers = cols.map((h) => h.trim());
      isFirst = false;
      continue;
    }
    const row: Record<string, string> = {};
    headers.forEach((h, i) => {
      row[h] = (cols[i] ?? "").trim();
    });
    rows.push(row);
  }

  return rows;
}

// ─── Convert familyname.csv ───────────────────────────────────────────────────

async function convertSurnames() {
  const filePath = path.join(SCRIPTS_DIR, "familyname.csv");
  const rows = await parseCSV(filePath);

  const surnames: Surname[] = rows
    .filter((r) => r["surname"]) // skip blank rows
    .map((r) => ({
      character: r["surname"],
      compound: r["compound"] === "1",
      initial: r["initial"],
      initialRank: parseInt(r["initial.rank"]),
      count: parseInt(r["n.1930_2008"]),
      ppm: parseFloat(r["ppm.1930_2008"]),
      uniqueness: parseFloat(r["surname.uniqueness"]),
    }));

  const outPath = path.join(OUT_DIR, "surnames.json");
  fs.writeFileSync(outPath, JSON.stringify(surnames, null, 2), "utf-8");
  console.log(`✅ surnames.json written — ${surnames.length} entries`);
}

// ─── Convert givenname.csv ────────────────────────────────────────────────────

async function convertGivenChars() {
  const filePath = path.join(SCRIPTS_DIR, "givenname.csv");
  const rows = await parseCSV(filePath);

  const givenChars: GivenChar[] = rows
    .filter((r) => r["character"])
    .map((r) => ({
      character: r["character"],
      pinyin: r["pinyin"],
      strokes: parseInt(r["bihua"]),
      malePct: parseFloat(r["n.male"]),
      femalePct: parseFloat(r["n.female"]),
      gender: parseFloat(r["name.gender"]),
      ppm: parseFloat(r["name.ppm"]),
      uniqueness: parseFloat(r["name.uniqueness"]),
      valence: parseFloat(r["name.valence"]),
      warmth: parseFloat(r["name.warmth"]),
      competence: parseFloat(r["name.competence"]),
    }));

  const outPath = path.join(OUT_DIR, "givenChars.json");
  fs.writeFileSync(outPath, JSON.stringify(givenChars, null, 2), "utf-8");
  console.log(`✅ givenChars.json written — ${givenChars.length} entries`);
}

// ─── Run ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log("🔄 Converting CSVs to JSON...\n");
  await convertSurnames();
  await convertGivenChars();
  console.log("\n✨ Done! JSON files saved to src/data/");
}

main().catch((err) => {
  console.error("❌ Conversion failed:", err);
  process.exit(1);
});