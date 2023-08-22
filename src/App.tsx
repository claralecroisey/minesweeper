import { useState } from 'react';
import './App.css';
import { Grid } from './Grid';

function App() {
  const [n, setN] = useState(3);
  const [m, setM] = useState(3);

  return (
    <div className="App">
      <header className="App-header">
        <h1>Minesweeper</h1>
      </header>
      <div>
        <input
          type="number"
          value={n}
          onChange={(e) => {
            setN(+e.target.value);
          }}
        />
        <input
          type="number"
          value={m}
          onChange={(e) => {
            setM(+e.target.value);
          }}
        />
      </div>
      <br />
      <div className="Grid">
        <Grid n={n} m={m} />
      </div>
    </div>
  );
}

export default App;
