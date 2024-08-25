import React, { useState } from 'react';
import { Button, Paper, TextField, Alert, Typography, Stack } from '@mui/material';

const SchellingSegregationModel: React.FC = () => {
  const [rows, setRows] = useState<number>(10);
  const [cols, setCols] = useState<number>(10);
  const [emptyPercentage, setEmptyPercentage] = useState<number>(10);
  const [tempRows, setTempRows] = useState<number>(rows);
  const [tempCols, setTempCols] = useState<number>(cols);
  const [tempEmptyPercentage, setTempEmptyPercentage] = useState<number>(emptyPercentage);
  const [grid, setGrid] = useState<number[][]>(initialGrid(rows, cols, emptyPercentage / 100));
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [showCompletionMessage, setShowCompletionMessage] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  function initialGrid(rows: number, cols: number, emptyRatio: number): number[][] {
    let grid = [];
    for (let i = 0; i < rows; i++) {
      let row = [];
      for (let j = 0; j < cols; j++) {
        const rand = Math.random();
        if (rand < emptyRatio) row.push(0);
        else if (rand < 0.3 + emptyRatio) row.push(1);
        else if (rand < 0.6 + emptyRatio) row.push(2);
        else row.push(3);
      }
      grid.push(row);
    }
    return grid;
  }

  const isSatisfied = (grid: number[][], x: number, y: number): boolean => {
    const cell = grid[x][y];
    if (cell === 0) return true;

    let similar = 0;
    let total = 0;

    for (let i = -1; i <= 1; i++) {
      for (let j = -1; j <= 1; j++) {
        if (i === 0 && j === 0) continue;
        const nx = x + i;
        const ny = y + j;
        if (nx >= 0 && nx < rows && ny >= 0 && ny < cols) {
          if (grid[nx][ny] !== 0) {
            total++;
            if (grid[nx][ny] === cell) similar++;
          }
        }
      }
    }

    return total === 0 ? true : (similar / total) >= 0.3;
  };

  const findEmptyCell = (grid: number[][]): [number, number] => {
    let emptyCells: [number, number][] = [];
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        if (grid[i][j] === 0) emptyCells.push([i, j]);
      }
    }
    return emptyCells[Math.floor(Math.random() * emptyCells.length)];
  };

  const runIteration = async () => {
    setIsRunning(true);
    setShowCompletionMessage(false);

    let moved;
    do {
      let newGrid = [...grid];
      moved = false;

      for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
          if (newGrid[i][j] !== 0 && !isSatisfied(newGrid, i, j)) {
            const [newX, newY] = findEmptyCell(newGrid);
            newGrid[newX][newY] = newGrid[i][j];
            newGrid[i][j] = 0;
            moved = true;
            setGrid([...newGrid]);
            await new Promise(resolve => setTimeout(resolve, 100));
          }
        }
      }

      setGrid(newGrid);
    } while (moved);

    setIsRunning(false);
    setShowCompletionMessage(true);
  };

  const handleApplySettings = () => {
    if (tempRows < 10 || tempCols < 10 || tempRows > 100 || tempCols > 100 || tempEmptyPercentage < 10) {
      setErrorMessage('Rows and columns must be between 10 and 100. Empty spaces must be at least 10%.');
    } else {
      setRows(tempRows);
      setCols(tempCols);
      setEmptyPercentage(tempEmptyPercentage);
      setGrid(initialGrid(tempRows, tempCols, tempEmptyPercentage / 100));
      setErrorMessage(null);
    }
  };

  const handleReset = () => {
    setGrid(initialGrid(rows, cols, emptyPercentage / 100));
    setShowCompletionMessage(false);
  };

  return (
    <div style={{ textAlign: 'center' }}>
      {showCompletionMessage && (
        <Alert
          variant="filled"
          severity="success"
          style={{ marginBottom: '20px' }}
          onClose={() => setShowCompletionMessage(false)}
        >
          <strong>Segregation reached a steady state!</strong>
        </Alert>
      )}
      <Stack direction={'column'} spacing={2} sx={{ mb: 10 }}>
        <div style={{ marginBottom: '20px' }}>
          <TextField
            label="Rows"
            type="number"
            value={tempRows}
            onChange={(e) => setTempRows(parseInt(e.target.value, 10))}
            style={{ margin: '10px', backgroundColor: '#333' }}
            InputLabelProps={{
              style: { color: '#B0B0B0' },
            }}
            InputProps={{
              style: { color: 'white' },
            }}
          />
          <TextField
            label="Cols"
            type="number"
            value={tempCols}
            onChange={(e) => setTempCols(parseInt(e.target.value, 10))}
            style={{ margin: '10px', backgroundColor: '#333' }}
            InputLabelProps={{
              style: { color: '#B0B0B0' },
            }}
            InputProps={{
              style: { color: 'white' },
            }}
          />
          <TextField
            label="Empty Percentage"
            type="number"
            value={tempEmptyPercentage}
            onChange={(e) => setTempEmptyPercentage(parseFloat(e.target.value))}
            style={{ margin: '10px', backgroundColor: '#333' }}
            InputLabelProps={{
              style: { color: '#B0B0B0' },
            }}
            InputProps={{
              style: { color: 'white' },
            }}
          />
        </div>
        {errorMessage && (
          <Typography variant="caption" style={{ color: 'red', marginTop: '10px' }}>
            {errorMessage}
          </Typography>
        )}
        <Typography variant="caption" style={{ color: '#B0B0B0', marginTop: '10px' }}>
          To a better experience use the minimum of 10 rows, 10 columns, 10% empty spaces. Maximum: 100 rows, 100 columns.
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={handleApplySettings}
        >
          Apply Settings
        </Button>
      </Stack>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${cols}, 10px)`,
          justifyContent: 'center',
          gap: '1px',
        }}
      >
        {grid.map((row, rowIndex) =>
          row.map((cell, colIndex) => (
            <Paper
              key={`${rowIndex}-${colIndex}`}
              style={{
                width: 10,
                height: 10,
                backgroundColor:
                  cell === 1 ? 'blue' : cell === 2 ? 'red' : cell === 3 ? 'green' : 'white',
              }}
            />
          ))
        )}
      </div>
      <div style={{ marginTop: '20px' }}>
        <Button
          variant="contained"
          color="primary"
          onClick={runIteration}
          disabled={isRunning}
          style={{ marginRight: '10px' }}
        >
          {isRunning ? 'Running...' : 'Run Iteration'}
        </Button>
        <Button
          variant="contained"
          color="secondary"
          onClick={handleReset}
        >
          Reset
        </Button>
      </div>
    </div>
  );
};

export default SchellingSegregationModel;
