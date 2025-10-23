// lib/visemeMap.ts
/**
 * Maps Amazon Polly viseme codes to our UI viseme sprites.
 * Polly visemes (subset): p, t, S, T, f, k, ch, j, r, a, e, i, o, u
 * We map them approximately to: BMP, L, S, FV, A, E, O, U, REST
 */
export function mapPollyViseme(v: string): string {
  switch (v) {
    case "p": return "BMP";         // bilabial: p/b/m
    case "f": return "FV";          // labio-dental: f/v
    case "t": return "L";           // alveolar: t/d/n/l (approx)
    case "r": return "L";           // approximant
    case "S": return "S";           // s/z/sh/zh
    case "T": return "S";           // th
    case "ch": return "S";          // ch/j (sibilant-ish for sprite set)
    case "j": return "S";
    case "k": return "REST";        // velar stop; no special sprite → neutral
    case "a": return "A";
    case "e": return "E";
    case "i": return "E";
    case "o": return "O";
    case "u": return "U";
    default: return "REST";
  }
}
