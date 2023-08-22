/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { useState, useEffect } from 'react';
import './Grid.css';
import { CellStatus, buildNMGrid, generateRandomPairs, revealedCellsCount } from './helpers';
import mine from './assets/mine.png';
import flag from './assets/flag.png';

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
  // N*M grid to track revealed / hidden / flagged cells
  const [playGrid, setPlayGrid] = useState<CellStatus[][] | null>(null);
  const [minesCoordinates, setMinesCoordinates] = useState<number[][] | null>(null);
  const [gameStatus, setGameStatus] = useState<GameStatus>(GameStatus.Running);

  function init() {
    const minesCoordinates = generateRandomPairs(minesCount, N, M);
    setMinesCoordinates(minesCoordinates);
    setReferenceGrid(buildGrid(minesCoordinates, N, M));
    setPlayGrid(buildNMGrid(N, M, CellStatus.Hidden));
    setGameStatus(GameStatus.Running);
  }

  useEffect(() => {
    init();
  }, [N, M]);

  function handleCellClick(e: any, cellValue: number, row: number, col: number) {
    if (isRevealed(row, col)) return; // Already revealed

    const updatedGrid = playGrid!.map((row) => [...row]);

    // LEFT CLICK: reveal cell
    if (e.type === 'click') {
      if (isAMine(cellValue)) {
        // It's a MINE! => Game over / Reveal all mines
        setGameStatus(GameStatus.Failure);
        minesCoordinates!.forEach(([row, col]) => {
          updatedGrid[row][col] = CellStatus.Revealed;
        });
      } else if (cellValue === 0) {
        // No adjacent cells, reveal adjacent cells recursively until it reaches cells with adjacent bombs or edges
        revealCellsRecursively(row, col, updatedGrid);
      } else {
        // Reveal that cell only
        updatedGrid[row][col] = CellStatus.Revealed;

        // Check if user won (all cells revealed except mines)
        if (revealedCellsCount(updatedGrid) === N * M - minesCount) {
          setGameStatus(GameStatus.Success);
        }
      }

      // RIGHT CLICK: flag or unflag cell
    } else if (e.type === 'contextmenu') {
      e.preventDefault();
      if (updatedGrid[row][col] !== CellStatus.Flagged) {
        updatedGrid[row][col] = CellStatus.Flagged;
      } else {
        updatedGrid[row][col] = CellStatus.Hidden;
      }
    }

    setPlayGrid(updatedGrid);
  }

  function revealCellsRecursively(
    startingRow: number,
    startingCol: number,
    updatedGrid: CellStatus[][]
  ) {
    function reveal(r: number, c: number) {
      if (r < 0 || r >= N || c < 0 || c >= M) return; // Out of range => ignore
      if (updatedGrid[r][c] === CellStatus.Revealed) return; // Already revealed

      updatedGrid[r][c] = CellStatus.Revealed; // Reveal grid

      if (referenceGrid![r][c] !== 0) return; // Stop

      // Otherwise, propagate reveal to all adjacent cells
      for (let i = r - 1; i <= r + 1; i++) {
        for (let j = c - 1; j <= c + 1; j++) {
          reveal(i, j);
        }
      }
    }

    reveal(startingRow, startingCol);
  }

  function isRevealed(row: number, col: number): boolean {
    return playGrid![row][col] === CellStatus.Revealed;
  }

  function isAMine(cellValue: number) {
    return cellValue === -1;
  }

  function isFlagged(row: number, col: number): boolean {
    return playGrid![row][col] === CellStatus.Flagged;
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
                onClick={(e) => {
                  gameStatus === GameStatus.Running &&
                    handleCellClick(e, cellValue, rowIndex, colIndex);
                }}
                onContextMenu={(e) => {
                  gameStatus === GameStatus.Running &&
                    handleCellClick(e, cellValue, rowIndex, colIndex);
                }}>
                {isAMine(cellValue) && isRevealed(rowIndex, colIndex) ? (
                  <img className="Mine" alt="mine" src={mine} />
                ) : isFlagged(rowIndex, colIndex) ? (
                  <img className="Flag" alt="flag" src={flag} />
                ) : !isRevealed(rowIndex, colIndex) || cellValue === 0 ? null : (
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
  const _grid = buildNMGrid(n, m, 0);

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
