#!/usr/bin/env node
/// <reference types="node" />
import { generate, generateMany } from "./generator.js";
import type {
  NameOptions,
  Gender,
  GivenLength,
  GeneratedName,
} from "./types.js";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function printUsage() {
  console.log(`
mingzi - Random Chinese Name Generator

Usage:
  mingzi [options]

Options:
  --count, -n <number>      Number of names to generate (default: 1)
  --gender <gender>         male | female | neutral (default: neutral)
  --compound                Allow compound surnames like 欧阳 (default: off)
  --given-length <length>   1 | 2 | random (default: random)
  --no-weight               Disable frequency-weighted picking
  --min-valence <number>    Min meaning positivity 1-5
  --min-warmth <number>     Min warmth score 1-5
  --min-competence <number> Min competence score 1-5
  --help, -h                Show this help message
  --version, -v             Show version

Examples:
  mingzi
  mingzi --count 5
  mingzi --gender female --given-length 2
  mingzi --compound --min-valence 4
  mingzi -n 3 --gender male
`);
}

function parseArgs(args: string[]): {
  options: NameOptions;
  count: number;
  showHelp: boolean;
} {
  const options: NameOptions = {};
  let count = 1;
  let showHelp = false;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    switch (arg) {
      case "--help":
      case "-h":
        showHelp = true;
        break;

      case "--count":
      case "-n": {
        const val = parseInt(args[++i]);
        if (isNaN(val) || val < 1) {
          console.error("❌ --count must be a positive integer");
          process.exit(1);
        }
        count = val;
        break;
      }

      case "--gender": {
        const val = args[++i] as Gender;
        if (!["male", "female", "neutral"].includes(val)) {
          console.error("❌ --gender must be: male | female | neutral");
          process.exit(1);
        }
        options.gender = val;
        break;
      }

      case "--compound":
        options.allowCompound = true;
        break;

      case "--no-weight":
        options.weighted = false;
        break;

      case "--given-length": {
        const val = args[++i];
        if (!["1", "2", "random"].includes(val)) {
          console.error("❌ --given-length must be: 1 | 2 | random");
          process.exit(1);
        }
        options.givenLength =
          val === "random" ? "random" : (parseInt(val) as GivenLength);
        break;
      }

      case "--min-valence": {
        const val = parseFloat(args[++i]);
        if (isNaN(val) || val < 1 || val > 5) {
          console.error("❌ --min-valence must be a number between 1 and 5");
          process.exit(1);
        }
        options.minValence = val;
        break;
      }

      case "--min-warmth": {
        const val = parseFloat(args[++i]);
        if (isNaN(val) || val < 1 || val > 5) {
          console.error("❌ --min-warmth must be a number between 1 and 5");
          process.exit(1);
        }
        options.minWarmth = val;
        break;
      }

      case "--min-competence": {
        const val = parseFloat(args[++i]);
        if (isNaN(val) || val < 1 || val > 5) {
          console.error("❌ --min-competence must be a number between 1 and 5");
          process.exit(1);
        }
        options.minCompetence = val;
        break;
      }

      case "--version":
      case "-v":
        console.log("1.0.0");
        process.exit(0);

      default:
        console.error(`❌ Unknown option: ${arg}`);
        console.error('Run "mingzi --help" for usage.');
        process.exit(1);
    }
  }

  return { options, count, showHelp };
}

function formatName(
  name: ReturnType<typeof generate>,
  showMeta: boolean,
): string {
  let line = `${name.full}  (${name.surname} + ${name.given})  [${name.gender}]`;

  if (showMeta) {
    const parts: string[] = [];
    if (name.valence !== undefined) parts.push(`valence: ${name.valence}`);
    if (name.warmth !== undefined) parts.push(`warmth: ${name.warmth}`);
    if (name.competence !== undefined)
      parts.push(`competence: ${name.competence}`);
    if (parts.length > 0) line += `  — ${parts.join(", ")}`;
  }

  return line;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

function main() {
  const args = process.argv.slice(2);
  const { options, count, showHelp } = parseArgs(args);

  if (showHelp) {
    printUsage();
    process.exit(0);
  }

  const showMeta =
    options.minValence !== undefined ||
    options.minWarmth !== undefined ||
    options.minCompetence !== undefined;

  if (count === 1) {
    const name = generate(options);
    console.log(formatName(name, showMeta));
  } else {
    const names = generateMany(count, options);
    names.forEach((name: GeneratedName) =>
      console.log(formatName(name, showMeta)),
    );
  }
}

main();
