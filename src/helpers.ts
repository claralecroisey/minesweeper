export function generateRandomPairs(pairsCount: number, n: number, m: number) {
  const uniquePairs = new Set<string>();

  while (uniquePairs.size < pairsCount) {
    const i = Math.floor(Math.random() * n);
    const j = Math.floor(Math.random() * m);
    uniquePairs.add(`${i},${j}`);
  }

  return Array.from(uniquePairs).map((pairStr) => {
    const [i, j] = pairStr.split(',').map(Number);
    return [i, j];
  });
}

export function buildNMGrid(N: number, M: number): number[][] {
  return Array(N)
    .fill(0)
    .map(() => Array(M).fill(0));
}
