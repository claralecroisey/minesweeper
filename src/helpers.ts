export enum CellStatus {
  Hidden = 'Hidden',
  Revealed = 'Revealed',
  Flagged = 'Flagged'
}

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

export function buildNMGrid<T>(N: number, M: number, initialValue: T): T[][] {
  return Array(N)
    .fill(initialValue)
    .map(() => Array(M).fill(initialValue));
}

export function revealedCellsCount(grid: CellStatus[][]): number {
  const counts = grid.map((r) => r.filter((el) => el === CellStatus.Revealed).length);
  return counts.reduce((acc, count) => acc + count, 0);
}
