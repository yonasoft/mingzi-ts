export interface Surname {
  character: string;
  compound: boolean;
  initial: string;
  initialRank: number;
  count: number;
  ppm: number;
  uniqueness: number;
}

export interface GivenChar {
  character: string;
  pinyin: string;
  strokes: number;
  malePct: number;
  femalePct: number;
  gender: number; // -1 (feminine) to 1 (masculine)
  ppm: number;
  uniqueness: number;
  valence: number; // 1-5 positivity of meaning
  warmth: number; // 1-5
  competence: number; // 1-5
}

export type Gender = "male" | "female" | "neutral";
export type GivenLength = 1 | 2 | "random";

export interface NameOptions {
  gender?: Gender;           // default: "neutral"
  allowCompound?: boolean;   // allow compound surnames like 欧阳, default: false
  givenLength?: GivenLength; // default: "random"
  weighted?: boolean;        // weight picks by real-world frequency, default: true
  minValence?: number;       // min meaning positivity 1-5
  minWarmth?: number;        // min warmth score 1-5
  minCompetence?: number;    // min competence score 1-5
}

export interface GeneratedName {
  full: string;     // 王芳
  surname: string;  // 王
  given: string;    // 芳
  gender: Gender;

  // optional metadata — only included if requested via options
  valence?: number;
  warmth?: number;
  competence?: number;
}