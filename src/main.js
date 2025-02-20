// Calculate grid size based on viewport and desired cell size
const CELL_SIZE = 20 // px
let GRID_COLS = Math.ceil(window.innerWidth / CELL_SIZE)
let GRID_ROWS = Math.ceil(window.innerHeight / CELL_SIZE)
const ANIMATION_INTERVAL = 100

let grid = Array(GRID_ROWS)
  .fill()
  .map(() => Array(GRID_COLS).fill(false))
const isRunning = true
let intervalId = null

// Initialize grid
const gridContainer = document.getElementById('grid')
gridContainer.style.gridTemplateColumns = `repeat(${GRID_COLS}, 1fr)`
gridContainer.style.gridTemplateRows = `repeat(${GRID_ROWS}, 1fr)`

// Create grid cells
for (let i = 0; i < GRID_ROWS; i++) {
  for (let j = 0; j < GRID_COLS; j++) {
    const cell = document.createElement('div')
    cell.className = 'cell'
    cell.dataset.row = i
    cell.dataset.col = j
    gridContainer.appendChild(cell)
  }
}

function updateCellDisplay(row, col) {
  const cell = gridContainer.children[row * GRID_COLS + col]
  cell.classList.toggle('alive', grid[row][col])
}

function countNeighbors(row, col) {
  let count = 0
  for (let i = -1; i <= 1; i++) {
    for (let j = -1; j <= 1; j++) {
      if (i === 0 && j === 0) continue
      const newRow = (row + i + GRID_ROWS) % GRID_ROWS
      const newCol = (col + j + GRID_COLS) % GRID_COLS
      if (grid[newRow][newCol]) count++
    }
  }
  return count
}

function nextGeneration() {
  const newGrid = grid.map(row => [...row])

  for (let i = 0; i < GRID_ROWS; i++) {
    for (let j = 0; j < GRID_COLS; j++) {
      const neighbors = countNeighbors(i, j)
      if (grid[i][j]) {
        newGrid[i][j] = neighbors === 2 || neighbors === 3
      } else {
        newGrid[i][j] = neighbors === 3
      }
    }
  }

  grid = newGrid

  // Update display
  for (let i = 0; i < GRID_ROWS; i++) {
    for (let j = 0; j < GRID_COLS; j++) {
      updateCellDisplay(i, j)
    }
  }
}

function randomize() {
  for (let i = 0; i < GRID_ROWS; i++) {
    for (let j = 0; j < GRID_COLS; j++) {
      grid[i][j] = Math.random() > 0.85
      updateCellDisplay(i, j)
    }
  }
}

// Handle window resize
window.addEventListener('resize', () => {
  const newCols = Math.ceil(window.innerWidth / CELL_SIZE)
  const newRows = Math.ceil(window.innerHeight / CELL_SIZE)

  if (newCols !== GRID_COLS || newRows !== GRID_ROWS) {
    GRID_COLS = newCols
    GRID_ROWS = newRows

    // Update grid size
    grid = Array(GRID_ROWS)
      .fill()
      .map(() => Array(GRID_COLS).fill(false))
    gridContainer.style.gridTemplateColumns = `repeat(${GRID_COLS}, 1fr)`
    gridContainer.style.gridTemplateRows = `repeat(${GRID_ROWS}, 1fr)`

    // Recreate cells
    gridContainer.innerHTML = ''
    for (let i = 0; i < GRID_ROWS; i++) {
      for (let j = 0; j < GRID_COLS; j++) {
        const cell = document.createElement('div')
        cell.className = 'cell'
        cell.dataset.row = i
        cell.dataset.col = j
        gridContainer.appendChild(cell)
      }
    }

    // Reinitialize with random cells
    randomize()
  }
})

// Start simulation
randomize()
intervalId = setInterval(nextGeneration, ANIMATION_INTERVAL)
