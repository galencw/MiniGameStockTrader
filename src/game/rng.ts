import type { RNG } from './types';

/**
 * Mulberry32 seeded PRNG.
 * Deterministic: same seed always produces the same sequence.
 */
export function createRNG(seed: number): RNG {
  let state = seed | 0;

  function next(): number {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  function nextInt(min: number, max: number): number {
    return Math.floor(next() * (max - min + 1)) + min;
  }

  function nextFloat(min: number, max: number): number {
    return next() * (max - min) + min;
  }

  function clone(): RNG {
    return createRNG(state);
  }

  return {
    seed,
    next,
    nextInt,
    nextFloat,
    clone,
  };
}
