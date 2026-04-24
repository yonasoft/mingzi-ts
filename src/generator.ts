import type { Surname, GivenChar, Gender, NameOptions, GeneratedName } from "./types.js";
import surnamesData from "./data/surnames.json" with { type: "json" };
import givenCharsData from "./data/givenChars.json" with { type: "json" };

const surnames = surnamesData as Surname[];
const givenChars = givenCharsData as GivenChar[];

// ─── Constants ────────────────────────────────────────────────────────────────

// NG threshold for gender classification
const GENDER_THRESHOLD = 0.3;

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Weighted random pick from an array using a numeric weight accessor.
 */
function weightedRandom<T>(items: T[], getWeight: (item: T) => number): T {
  const total = items.reduce((sum, item) => sum + getWeight(item), 0);
  let rand = Math.random() * total;
  for (const item of items) {
    rand -= getWeight(item);
    if (rand <= 0) return item;
  }
  return items[items.length - 1];
}

/**
 * Uniform random pick from an array.
 */
function randomPick<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

/**
 * Classify a NG score into a Gender label.
 */
function classifyGender(ng: number): Gender {
  if (ng > GENDER_THRESHOLD) return "male";
  if (ng < -GENDER_THRESHOLD) return "female";
  return "neutral";
}

// ─── Surname picker ───────────────────────────────────────────────────────────

function pickSurname(options: NameOptions): Surname {
  let pool = surnames.filter((s) =>
    options.allowCompound ? true : !s.compound
  );

  if (options.weighted ?? true) {
    return weightedRandom(pool, (s) => s.ppm);
  }
  return randomPick(pool);
}

// ─── Given name picker ────────────────────────────────────────────────────────

function pickGivenChars(options: NameOptions): GivenChar[] {
  const gender = options.gender ?? "neutral";

  // Filter by gender affinity
  let pool = givenChars.filter((c) => {
    if (gender === "male") return c.gender > -GENDER_THRESHOLD;
    if (gender === "female") return c.gender < GENDER_THRESHOLD;
    return true; // neutral: all chars eligible
  });

  // Filter by optional quality thresholds
  if (options.minValence !== undefined) {
    pool = pool.filter((c) => c.valence >= options.minValence!);
  }
  if (options.minWarmth !== undefined) {
    pool = pool.filter((c) => c.warmth >= options.minWarmth!);
  }
  if (options.minCompetence !== undefined) {
    pool = pool.filter((c) => c.competence >= options.minCompetence!);
  }

  // Fallback if filters are too strict
  if (pool.length === 0) pool = givenChars;

  // Determine given name length
  const givenLength = options.givenLength ?? "random";
  const length =
    givenLength === "random" ? (Math.random() < 0.5 ? 1 : 2) : givenLength;

  const weighted = options.weighted ?? true;
  const pick = () =>
    weighted ? weightedRandom(pool, (c) => c.ppm) : randomPick(pool);

  if (length === 1) {
    return [pick()];
  }

  // Pick 2 distinct characters
  const first = pick();
  let second = pick();
  let attempts = 0;
  while (second.character === first.character && attempts < 10) {
    second = pick();
    attempts++;
  }
  return [first, second];
}

// ─── Core generator ───────────────────────────────────────────────────────────

/**
 * Generate a single Chinese name.
 */
export function generate(options: NameOptions = {}): GeneratedName {
  const surname = pickSurname(options);
  const chars = pickGivenChars(options);

  const given = chars.map((c) => c.character).join("");
  const full = surname.character + given;

  // Determine effective gender from the chosen characters
  const avgNG = chars.reduce((sum, c) => sum + c.gender, 0) / chars.length;
  const gender = options.gender ?? classifyGender(avgNG);

  const result: GeneratedName = {
    full,
    surname: surname.character,
    given,
    gender,
  };

  // Attach optional metadata if quality filters were used
  if (
    options.minValence !== undefined ||
    options.minWarmth !== undefined ||
    options.minCompetence !== undefined
  ) {
    const avgValence = chars.reduce((s, c) => s + c.valence, 0) / chars.length;
    const avgWarmth = chars.reduce((s, c) => s + c.warmth, 0) / chars.length;
    const avgCompetence =
      chars.reduce((s, c) => s + c.competence, 0) / chars.length;
    result.valence = Math.round(avgValence * 100) / 100;
    result.warmth = Math.round(avgWarmth * 100) / 100;
    result.competence = Math.round(avgCompetence * 100) / 100;
  }

  return result;
}

/**
 * Generate multiple Chinese names at once.
 */
export function generateMany(
  count: number,
  options: NameOptions = {}
): GeneratedName[] {
  return Array.from({ length: count }, () => generate(options));
}