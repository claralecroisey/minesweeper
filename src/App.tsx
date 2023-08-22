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
      <div className="App-title"># Minesweeper</div>
      <div className="LevelButtonsContainer">
        {Object.keys(LEVELS).map((l) => (
          <button
            className={l}
            key={l}
            onClick={() => {
              setLevel(l as Level);
            }}>
            {l}
          </button>
        ))}
      </div>
      <br />
      <Grid N={LEVELS[level].N} M={LEVELS[level].N} minesCount={LEVELS[level].minesCount} />
    </div>
  );
}

export default App;
