import { useState, useEffect } from 'react';
import './Grid.css';

interface GridProps {
  n: number;
  m: number;
}

export function Grid({ n, m }: GridProps) {
  const [grid, setGrid] = useState<number[][] | null>(null);

  useEffect(() => {
    const NB_BOMBS = n;
    setGrid(buildGrid(NB_BOMBS, n, m));
  }, [n, m]);

  return grid === null ? (
    <p>Initialising...</p>
  ) : (
    <div className="Grid">
      {grid.map((row, rowIndex) => (
        <div className="Row" key={rowIndex}>
          {row.map((cellValue, colIndex) => (
            <div className={'Cell' + `${cellValue === -1 ? ' Bomb' : ''}`} key={colIndex}>
              {cellValue}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

function generateRandomPairs(pairsCount: number, n: number, m: number) {
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

function buildGrid(bombsCount: number, n: number, m: number): number[][] {
  const _grid: number[][] = Array(n)
    .fill(0)
    .map(() => Array(m).fill(0));

  const bombsCoordinates = generateRandomPairs(bombsCount, n, m);

  bombsCoordinates.forEach(([row, col]) => {
    // Mark as bomb
    _grid[row][col] = -1;

    // Fill neighbors cells with adjacent bombs count
    for (let i = -1; i <= 1; i++) {
      for (let j = -1; j <= 1; j++) {
        if (i === 0 && j === 0) continue; // The bomb itself
        const r = row + i;
        const c = col + j;
        if (!(r >= 0 && r < n && c >= 0 && c < m)) continue;
        if (_grid[r][c] === -1) continue; // A neighboring bomb => leave it as -1
        _grid[r][c] += 1;
      }
    }
  });
  return _grid;
}
