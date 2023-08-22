import { useState, useEffect } from 'react';
import './Grid.css';
import { buildNMGrid, generateRandomPairs } from './helpers';

interface GridProps {
  N: number;
  M: number;
}

export function Grid({ N, M }: GridProps) {
  const [referenceGrid, setReferenceGrid] = useState<number[][] | null>(null);
  const [playGrid, setPlayGrid] = useState<number[][] | null>(null);

  useEffect(() => {
    const NB_BOMBS = N;
    setReferenceGrid(buildGrid(NB_BOMBS, N, M));
    setPlayGrid(buildNMGrid(N, M));
  }, [N, M]);

  function handleCellClick(row: number, col: number) {
    if (playGrid === null) return;

    // Reveal
    const updatedGrid = playGrid.map((row) => [...row]);
    updatedGrid[row][col] = 1;
    setPlayGrid(updatedGrid);
  }

  return referenceGrid === null || playGrid === null ? (
    <p>Initialising...</p>
  ) : (
    <div className="Grid">
      {referenceGrid.map((row, rowIndex) => (
        <div className="Row" key={rowIndex}>
          {row.map((cellValue, colIndex) => (
            <div
              className={
                'Cell' +
                `${cellValue === -1 ? ' Bomb' : ''}` +
                `${playGrid[rowIndex][colIndex] === 0 ? ' Hidden' : ''}`
              }
              key={colIndex}
              onClick={() => {
                handleCellClick(rowIndex, colIndex);
              }}>
              {cellValue}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

function buildGrid(bombsCount: number, n: number, m: number): number[][] {
  const _grid = buildNMGrid(n, m);
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
