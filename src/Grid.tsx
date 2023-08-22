import { useState, useEffect } from 'react';
import './Grid.css';
import { buildNMGrid, generateRandomPairs, revealedCellsCount } from './helpers';
import mine from './assets/mine.png';

interface GridProps {
  N: number;
  M: number;
  minesCount: number;
}

enum GameStatus {
  Running = 'Running',
  Success = 'Success',
  Failure = 'Failure'
}

export function Grid({ N, M, minesCount }: GridProps) {
  const [referenceGrid, setReferenceGrid] = useState<number[][] | null>(null);
  const [playGrid, setPlayGrid] = useState<number[][] | null>(null);
  const [minesCoordinates, setMinesCoordinates] = useState<number[][] | null>(null);
  const [gameStatus, setGameStatus] = useState<GameStatus>(GameStatus.Running);

  useEffect(() => {
    const minesCoordinates = generateRandomPairs(minesCount, N, M);
    setMinesCoordinates(minesCoordinates);
    setReferenceGrid(buildGrid(minesCoordinates, N, M));
    setPlayGrid(buildNMGrid(N, M));
  }, [N, M]);

  function handleCellClick(cellValue: number, row: number, col: number) {
    if (playGrid === null || minesCoordinates === null) return;
    if (playGrid[row][col] === 1) return; // Already revealed

    const updatedGrid = playGrid.map((row) => [...row]);

    if (cellValue === -1) {
      // It's a BOMB! => Game over / Reveal all mines
      minesCoordinates.forEach(([row, col]) => {
        updatedGrid[row][col] = 1;
      });
      setGameStatus(GameStatus.Failure);
    } else {
      // Reveal that cell only
      updatedGrid[row][col] = 1;

      // Check if user won
      if (revealedCellsCount(updatedGrid) === N * M - minesCount) {
        setGameStatus(GameStatus.Success);
      }
    }

    setPlayGrid(updatedGrid);
  }

  function isRevealed(row: number, col: number): boolean {
    if (playGrid === null) return false;
    return playGrid[row][col] === 1;
  }

  function isAMine(cellValue: number) {
    return cellValue === -1;
  }

  return referenceGrid === null || playGrid === null ? (
    <p>Initialising...</p>
  ) : (
    <>
      <div className={`GameStatus ${gameStatus}`}>
        {gameStatus === GameStatus.Failure
          ? 'GAME OVER'
          : gameStatus === GameStatus.Success
          ? 'YOU WON!!!'
          : 'Running'}
      </div>
      <div className="Grid">
        {referenceGrid.map((row, rowIndex) => (
          <div className="Row" key={rowIndex}>
            {row.map((cellValue, colIndex) => (
              <div
                className={
                  'Cell' +
                  `${isAMine(cellValue) ? ' Mine' : ''}` +
                  `${!isRevealed(rowIndex, colIndex) ? ' Hidden' : ''}`
                }
                key={colIndex}
                onClick={() => {
                  gameStatus === GameStatus.Running &&
                    handleCellClick(cellValue, rowIndex, colIndex);
                }}>
                {isAMine(cellValue) && isRevealed(rowIndex, colIndex) ? (
                  <img className="Mine" alt="mine" src={mine} />
                ) : (
                  cellValue
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
    </>
  );
}

function buildGrid(minesCoordinates: number[][], n: number, m: number): number[][] {
  const _grid = buildNMGrid(n, m);

  minesCoordinates.forEach(([row, col]) => {
    // Mark as mine
    _grid[row][col] = -1;

    // Fill neighbors cells with adjacent mines count
    for (let i = -1; i <= 1; i++) {
      for (let j = -1; j <= 1; j++) {
        if (i === 0 && j === 0) continue; // The mine itself
        const r = row + i;
        const c = col + j;
        if (!(r >= 0 && r < n && c >= 0 && c < m)) continue;
        if (_grid[r][c] === -1) continue; // A neighboring mine => leave it as -1
        _grid[r][c] += 1;
      }
    }
  });
  return _grid;
}
