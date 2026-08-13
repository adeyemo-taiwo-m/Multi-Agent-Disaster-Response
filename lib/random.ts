export type RandomFn = () => number;

export function createSeededRandom(seed: number): RandomFn {
  let value = seed >>> 0;
  return function () {
    value += 0x6d2b79f5;
    let t = value;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function shuffleWithRandom<T>(items: T[], random: RandomFn): T[] {
  const array = [...items];
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

export function chooseRandom<T>(items: T[], random: RandomFn): T | undefined {
  if (items.length === 0) return undefined;
  const index = Math.floor(random() * items.length);
  return items[index];
}
