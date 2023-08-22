import { useState } from 'react';
import './App.css';
import { Grid } from './Grid';

enum Level {
  Beginner = 'Beginner',
  Intermediate = 'Intermediate',
  Expert = 'Expert'
}

const LEVELS = {
  [Level.Beginner]: { N: 9, M: 9, minesCount: 10 },
  [Level.Intermediate]: { N: 16, M: 16, minesCount: 40 },
  [Level.Expert]: { N: 30, M: 30, minesCount: 99 }
};

function App() {
  const [level, setLevel] = useState<Level>(Level.Beginner);

  return (
    <div className="App">
      <header className="App-header">
        <h1>Minesweeper</h1>
      </header>
      <div className="LevelButtonsContainer">
        {Object.keys(LEVELS).map((l) => (
          <button
            key={l}
            onClick={() => {
              setLevel(l as Level);
            }}>
            {l}
          </button>
        ))}
      </div>
      <br />
      <div className="Grid">
        <Grid N={LEVELS[level].N} M={LEVELS[level].N} NB_BOMBS={LEVELS[level].minesCount} />
      </div>
    </div>
  );
}

export default App;
