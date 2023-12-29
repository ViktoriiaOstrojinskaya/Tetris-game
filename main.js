import {
  PLAYFIELD_COLUMNS,
  PLAYFIELD_ROWS,
  TETROMINO_NAMES,
  TETROMINOES,
  gameOverBlock,
  btnRestart,
} from './utils.js';

let playfield,
  tetromino,
  timeoutId,
  requestId,
  cells,
  score = 0,
  isPaused = false,
  isGameOver = false;
init();

function init() {
  gameOverBlock.style.display = 'none';
  isGameOver = false;
  generatePlayfield();
  generateTetromino();
  startLoop();
  cells = document.querySelectorAll('.tetris div');
  score = 0;
  countScore(null);
}

// Ketdown events
document.addEventListener('keydown', onKeyDown);
const removeControl = document.querySelector('.controllers');
removeControl.addEventListener('click', onController);

btnRestart.addEventListener('click', function () {
  init();
});

function togglePauseGame() {
  isPaused = !isPaused;

  if (isPaused) {
    stopLoop();
  } else {
    startLoop();
  }
}

function onController(event) {
  let element = event.target;
  if (element.closest('.down')) {
    moveTetrominoDown();
  } else if (element.closest('.left')) {
    moveTetrominoLeft();
  } else if (element.closest('.right')) {
    moveTetrominoRight();
  } else if (element.closest('.rotate')) {
    rotateTetromino();
  } else if (element.closest('.pause')) {
    togglePauseGame();
  } else if (element.closest('.restart')) {
    gameOver();
  }
}

function onKeyDown(event) {
  if (event.key === 'p') {
    togglePauseGame();
  }
  if (isPaused) {
    return;
  }

  switch (event.key) {
    case ' ':
      dropTetrominoDown();
      break;
    case 'ArrowUp':
      rotateTetromino();
      break;
    case 'ArrowDown':
      moveTetrominoDown();
      break;
    case 'ArrowLeft':
      moveTetrominoLeft();
      break;
    case 'ArrowRight':
      moveTetrominoRight();
      break;
  }
  draw();
}

function dropTetrominoDown() {
  while (!isValid()) {
    tetromino.row++;
  }
  tetromino.row--;
}

function moveTetrominoDown() {
  tetromino.row += 1;
  if (isValid()) {
    tetromino.row -= 1;
    placeTetromino();
  }
}

function moveTetrominoLeft() {
  tetromino.column -= 1;
  if (isValid()) {
    tetromino.column += 1;
  }
}

function moveTetrominoRight() {
  tetromino.column += 1;
  if (isValid()) {
    tetromino.column -= 1;
  }
}

// Generate playdield and tetromino

function generatePlayfield() {
  document.querySelector('.tetris').innerHTML = '';
  for (let i = 0; i < PLAYFIELD_ROWS * PLAYFIELD_COLUMNS; i++) {
    const div = document.createElement('div');
    document.querySelector('.tetris').append(div);
  }

  playfield = new Array(PLAYFIELD_ROWS)
    .fill()
    .map(() => new Array(PLAYFIELD_COLUMNS).fill(0));
}

function generateTetromino() {
  const nameTetro = getRandomElement(TETROMINO_NAMES);
  const matrixTetro = TETROMINOES[nameTetro];

  const rowTetro = -2;
  const columnTetro = Math.floor(
    PLAYFIELD_COLUMNS / 2 - matrixTetro.length / 2
  );

  const colorTetro = getRandomColor();

  tetromino = {
    name: nameTetro,
    matrix: matrixTetro,
    row: rowTetro,
    column: columnTetro,
    color: colorTetro,
  };
}

// Draw

function drawPlayField() {
  for (let row = 0; row < PLAYFIELD_ROWS; row++) {
    for (let column = 0; column < PLAYFIELD_COLUMNS; column++) {
      const name = playfield[row][column];
      const cellIndex = convertPositionToIndex(row, column);
      if (name) {
        cells[cellIndex].classList.add(name);
      } else {
        cells[cellIndex].style.removeProperty('background');
      }
    }
  }
}

function drawTetromino() {
  const name = tetromino.name;
  const color = tetromino.color;
  const tetrominoMatrixSize = tetromino.matrix.length;

  for (let row = 0; row < tetrominoMatrixSize; row++) {
    for (let column = 0; column < tetrominoMatrixSize; column++) {
      if (isOutsideTopBoard(row)) {
        continue;
      }
      if (tetromino.matrix[row][column] == 0) {
        continue;
      }
      const cellIndex = convertPositionToIndex(
        tetromino.row + row,
        tetromino.column + column
      );
      cells[cellIndex].classList.add(name);
      cells[cellIndex].style.background = color;
    }
  }
}

function draw() {
  cells.forEach(function (cell) {
    cell.removeAttribute('class');
  });
  drawPlayField();
  drawTetromino();
}

function countScore(destroyLines) {
  switch (destroyLines) {
    case 1:
      score += 10;
      break;
    case 2:
      score += 25;
      break;
    case 3:
      score += 35;
      break;
    case 4:
      score += 50;
      break;
    default:
      score += 0;
  }
  document.querySelector('.board-score-number').innerHTML = score;
  document.querySelector('.game-over-score-number').innerHTML = score;
}

function gameOver() {
  stopLoop();
  gameOverBlock.style.display = 'flex';
}

function getRandomColor() {
  return (
    '#' +
    Math.floor(Math.random() * 16777215)
      .toString(16)
      .padStart(6, '0')
      .toUpperCase()
  );
}

function getRandomElement(array) {
  const randomIndex = Math.floor(Math.random() * array.length);
  return array[randomIndex];
}

function convertPositionToIndex(row, column) {
  return row * PLAYFIELD_COLUMNS + column;
}

function isOutsideTopBoard(row) {
  return tetromino.row + row < 0;
}

function placeTetromino() {
  const matrixSize = tetromino.matrix.length;
  for (let row = 0; row < matrixSize; row++) {
    for (let column = 0; column < matrixSize; column++) {
      if (!tetromino.matrix[row][column]) continue;
      if (isOutsideTopBoard(row)) {
        isGameOver = true;
        return;
      }
      playfield[tetromino.row + row][tetromino.column + column] =
        tetromino.name;
    }
  }
  const filledRows = findFilledRows();
  removeFilledRows(filledRows);
  generateTetromino();
}

function removeFilledRows(filledRows) {
  for (let i = 0; i < filledRows.length; i++) {
    const row = filledRows[i];
    dropRowsAbove(row);
  }
  countScore(filledRows.length);
}

function dropRowsAbove(rowDelete) {
  for (let row = rowDelete; row > 0; row--) {
    playfield[row] = playfield[row - 1];
  }
  playfield[0] = new Array(PLAYFIELD_COLUMNS).fill(0);
}

function findFilledRows() {
  const filledRows = [];
  for (let row = 0; row < PLAYFIELD_ROWS; row++) {
    let filledColumns = 0;
    for (let column = 0; column < PLAYFIELD_COLUMNS; column++) {
      if (playfield[row][column] != 0) {
        filledColumns++;
      }
    }
    if (PLAYFIELD_COLUMNS == filledColumns) {
      filledRows.push(row);
    }
  }
  return filledRows;
}

function moveDown() {
  moveTetrominoDown();
  draw();
  stopLoop();
  startLoop();
  if (isGameOver) {
    gameOver();
  }
}

function startLoop() {
  timeoutId = setTimeout(
    () => (requestId = requestAnimationFrame(moveDown)),
    700
  );
}

function stopLoop() {
  cancelAnimationFrame(requestId);
  timeoutId = clearTimeout(timeoutId);
}

function rotateTetromino() {
  const oldMatrix = tetromino.matrix;
  const rotatedMatrix = rotateMatrix(tetromino.matrix);
  tetromino.matrix = rotatedMatrix;
  if (isValid()) {
    tetromino.matrix = oldMatrix;
  }
}

function rotateMatrix(matrixTetromino) {
  const N = matrixTetromino.length;
  const rotateMatrix = [];
  for (let i = 0; i < N; i++) {
    rotateMatrix[i] = [];
    for (let j = 0; j < N; j++) {
      rotateMatrix[i][j] = matrixTetromino[N - j - 1][i];
    }
  }
  return rotateMatrix;
}

function isValid() {
  const matrixSize = tetromino.matrix.length;
  for (let row = 0; row < matrixSize; row++) {
    for (let column = 0; column < matrixSize; column++) {
      if (!tetromino.matrix[row][column]) {
        continue;
      }
      if (isOutsideOfGameBoard(row, column)) {
        return true;
      }
      if (hasCollisions(row, column)) {
        return true;
      }
    }
  }
  return false;
}

function isOutsideOfGameBoard(row, column) {
  return (
    tetromino.column + column < 0 ||
    tetromino.column + column >= PLAYFIELD_COLUMNS ||
    tetromino.row + row >= playfield.length
  );
}

function hasCollisions(row, column) {
  return playfield[tetromino.row + row]?.[tetromino.column + column];
}

// function getLevel(score) {
//   switch (score) {
//     case score <= 10:
//       level = "beginner";
//       break;
//     case score >= 25:
//       level = "intermediate";
//       break;
//     case score >= 35:
//       level = "advanced";
//       break;
//     case score >= 45:
//       level = "expert";
//       break;
//     default:
//       level = "beginner";
//   }
//   document.querySelector(".board-level-number").innerHTML = level;
// }
