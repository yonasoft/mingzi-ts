# mingzi-ts 名字

> Random Chinese name generator — CLI and API

Generate realistic Chinese names using a statistically accurate database of 1,806 surnames and 2,614 given-name characters sourced from 1.2 billion Han Chinese records (1930–2008).

## Installation

```bash
# CLI
npm install -g mingzi-ts

# API
npm install mingzi-ts
```

## CLI Usage

```bash
mingzi                            # random name
mingzi --count 5                  # 5 random names
mingzi --gender female            # female name
mingzi --gender male --count 3    # 3 male names
mingzi --compound                 # allow compound surnames (e.g. 欧阳)
mingzi --given-length 1           # single character given name
mingzi --given-length 2           # two character given name
mingzi --no-weight                # disable frequency-weighted picking
mingzi --min-valence 4            # only positive-meaning characters
mingzi --min-warmth 4             # only warm/moral characters
mingzi --min-competence 4         # only competence-associated characters
mingzi --version                  # show version
mingzi --help                     # show help
```

### Example Output

```
王芳  (王 + 芳)  [female]
李伟明  (李 + 伟明)  [male]
欧阳晨  (欧阳 + 晨)  [neutral]
```

## API Usage

```ts
import { generate, generateMany } from "mingzi-ts";

// Single name (neutral gender, defaults)
const name = generate();
console.log(name.full);    // e.g. 王芳
console.log(name.surname); // 王
console.log(name.given);   // 芳
console.log(name.gender);  // "female" | "male" | "neutral"

// With options
const name = generate({
  gender: "male",
  givenLength: 2,
  allowCompound: false,
  weighted: true,
});

// Multiple names
const names = generateMany(5, { gender: "female" });

// Quality filters (returns metadata when used)
const name = generate({ minValence: 4, minWarmth: 4 });
console.log(name.valence);    // e.g. 4.44
console.log(name.warmth);     // e.g. 4.30
console.log(name.competence); // e.g. 3.50
```

## Options

| Option | Type | Default | Description |
|---|---|---|---|
| `gender` | `"male" \| "female" \| "neutral"` | `"neutral"` | Gender affinity of given name characters |
| `allowCompound` | `boolean` | `false` | Allow compound surnames like 欧阳, 司马 |
| `givenLength` | `1 \| 2 \| "random"` | `"random"` | Number of characters in given name |
| `weighted` | `boolean` | `true` | Weight picks by real-world frequency |
| `minValence` | `number` (1–5) | — | Minimum meaning positivity score |
| `minWarmth` | `number` (1–5) | — | Minimum warmth/morality score |
| `minCompetence` | `number` (1–5) | — | Minimum competence score |

## Data

Name data is sourced from the [ChineseNames R package](https://github.com/psychbruce/ChineseNames) (CC BY-NC-SA), originally from China's National Citizen Identity Information Center (2008). Covers ~1.2 billion Han Chinese born 1930–2008.

## License

MIT © [Yonasoft](https://yonasoft.net)