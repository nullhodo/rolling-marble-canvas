/** 再現性のある乱数 (mulberry32) */
export function createSeededRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** p5.noise の代わり。位置から決まる 0..1 の値 */
export function fakeNoise(x: number, y = 0): number {
  return Math.abs((Math.sin(x * 12.9898 + y * 78.233) * 43758.5453) % 1);
}
