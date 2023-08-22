/* eslint-disable @typescript-eslint/no-non-null-assertion */
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
const COLORS: Record<number, string> = {
  0: 'black',
  1: 'blue',
  2: 'green',
  3: 'red',
  4: 'darkblue'
};

/***
 * GRID WITH N ROWS AND M COLUMNS
 * Cell values:
 * - -1 => Mine
 * - >= 0 => NB of adjacent mines, used to identify mines
 */
export function Grid({ N, M, minesCount }: GridProps) {
  // Grid containing the actual values
  const [referenceGrid, setReferenceGrid] = useState<number[][] | null>(null);
  // N*M grid to track revealed cells (0 = not revealed, 1 = revealed)
  const [playGrid, setPlayGrid] = useState<number[][] | null>(null);
  const [minesCoordinates, setMinesCoordinates] = useState<number[][] | null>(null);
  const [gameStatus, setGameStatus] = useState<GameStatus>(GameStatus.Running);

  function init() {
    const minesCoordinates = generateRandomPairs(minesCount, N, M);
    setMinesCoordinates(minesCoordinates);
    setReferenceGrid(buildGrid(minesCoordinates, N, M));
    setPlayGrid(buildNMGrid(N, M));
    setGameStatus(GameStatus.Running);
  }

  useEffect(() => {
    init();
  }, [N, M]);

  function handleCellClick(cellValue: number, row: number, col: number) {
    if (isRevealed(row, col)) return; // Already revealed
    const updatedGrid = playGrid!.map((row) => [...row]);

    if (isAMine(cellValue)) {
      // It's a MINE! => Game over / Reveal all mines
      setGameStatus(GameStatus.Failure);
      minesCoordinates!.forEach(([row, col]) => {
        updatedGrid[row][col] = 1;
      });
    } else if (cellValue === 0) {
      // No adjacent cells, reveal adjacent cells recursively until it reaches cells with adjacent bombs or edges
      revealCellsRecursively(row, col, updatedGrid);
    } else {
      // Reveal that cell only
      updatedGrid[row][col] = 1;

      // Check if user won (all cells revealed except mines)
      if (revealedCellsCount(updatedGrid) === N * M - minesCount) {
        setGameStatus(GameStatus.Success);
      }
    }

    setPlayGrid(updatedGrid);
  }

  function revealCellsRecursively(
    startingRow: number,
    startingCol: number,
    updatedGrid: number[][]
  ) {
    function reveal(r: number, c: number) {
      if (r < 0 || r >= N || c < 0 || c >= M) return; // Out of range => ignore
      if (updatedGrid[r][c] === 1) return; // Already revealed

      updatedGrid[r][c] = 1; // Reveal grid

      if (referenceGrid![r][c] !== 0) return; // Stop
      for (let i = r - 1; i <= r + 1; i++) {
        for (let j = c - 1; j <= c + 1; j++) {
          reveal(i, j);
        }
      }
    }

    reveal(startingRow, startingCol);
  }

  function isRevealed(row: number, col: number): boolean {
    return playGrid![row][col] === 1;
  }

  function isAMine(cellValue: number) {
    return cellValue === -1;
  }

  return referenceGrid === null || playGrid === null ? (
    <p>Initialising...</p>
  ) : (
    <>
      <button onClick={init}>Restart</button>
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
                style={isRevealed(rowIndex, colIndex) ? { color: COLORS[cellValue] } : {}}
                key={colIndex}
                onClick={() => {
                  gameStatus === GameStatus.Running &&
                    handleCellClick(cellValue, rowIndex, colIndex);
                }}>
                {isAMine(cellValue) && isRevealed(rowIndex, colIndex) ? (
                  <img className="Mine" alt="mine" src={mine} />
                ) : cellValue === 0 ? null : (
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
    for (let r = row - 1; r <= row + 1; r++) {
      for (let c = col - 1; c <= col + 1; c++) {
        if (r === row && c === col) continue; // The mine itself
        if (!(r >= 0 && r < n && c >= 0 && c < m)) continue;
        if (_grid[r][c] === -1) continue; // A neighboring mine => leave it as -1
        _grid[r][c] += 1;
      }
    }
  });
  return _grid;
}
