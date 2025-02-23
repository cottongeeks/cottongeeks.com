const CELL_SIZE = 20 // px
const ANIMATION_INTERVAL = 100

export class GameOfLife {
  private GRID_COLS: number
  private GRID_ROWS: number
  private grid: boolean[][]
  private gridContainer: HTMLElement
  private intervalId: number | null = null

  constructor(containerId: string) {
    this.GRID_COLS = Math.ceil(window.innerWidth / CELL_SIZE)
    this.GRID_ROWS = Math.ceil(window.innerHeight / CELL_SIZE)
    this.gridContainer = document.getElementById(containerId)!
    this.grid = this.createGrid()

    this.initializeGrid()
    this.setupResizeHandler()
    this.start()
  }

  private createGrid(): boolean[][] {
    return Array.from({ length: this.GRID_ROWS }, () =>
      Array.from({ length: this.GRID_COLS }, () => false),
    )
  }

  private initializeGrid(): void {
    this.gridContainer.style.gridTemplateColumns = `repeat(${this.GRID_COLS}, 1fr)`
    this.gridContainer.style.gridTemplateRows = `repeat(${this.GRID_ROWS}, 1fr)`
    this.createCells()
  }

  private createCells(): void {
    const fragment = document.createDocumentFragment()
    for (let i = 0; i < this.GRID_ROWS; i++) {
      for (let j = 0; j < this.GRID_COLS; j++) {
        const cell = document.createElement('div')
        cell.className = 'cell'
        cell.dataset.row = i.toString()
        cell.dataset.col = j.toString()
        fragment.appendChild(cell)
      }
    }
    this.gridContainer.innerHTML = ''
    this.gridContainer.appendChild(fragment)
  }

  private updateCellDisplay(row: number, col: number): void {
    const cell = this.gridContainer.children[row * this.GRID_COLS + col] as HTMLElement
    cell.classList.toggle('alive', this.grid[row][col])
  }

  private countNeighbors(row: number, col: number): number {
    let count = 0
    for (let i = -1; i <= 1; i++) {
      for (let j = -1; j <= 1; j++) {
        if (i === 0 && j === 0) continue
        const newRow = (row + i + this.GRID_ROWS) % this.GRID_ROWS
        const newCol = (col + j + this.GRID_COLS) % this.GRID_COLS
        if (this.grid[newRow][newCol]) count++
      }
    }
    return count
  }

  private nextGeneration(): void {
    const newGrid = this.grid.map(row => [...row])

    for (let i = 0; i < this.GRID_ROWS; i++) {
      for (let j = 0; j < this.GRID_COLS; j++) {
        const neighbors = this.countNeighbors(i, j)
        if (this.grid[i][j]) {
          newGrid[i][j] = neighbors === 2 || neighbors === 3
        } else {
          newGrid[i][j] = neighbors === 3
        }
      }
    }

    this.grid = newGrid
    this.updateDisplay()
  }

  private updateDisplay(): void {
    for (let i = 0; i < this.GRID_ROWS; i++) {
      for (let j = 0; j < this.GRID_COLS; j++) {
        this.updateCellDisplay(i, j)
      }
    }
  }

  private randomize(): void {
    for (let i = 0; i < this.GRID_ROWS; i++) {
      for (let j = 0; j < this.GRID_COLS; j++) {
        this.grid[i][j] = Math.random() > 0.85
        this.updateCellDisplay(i, j)
      }
    }
  }

  private setupResizeHandler(): void {
    window.addEventListener('resize', () => {
      const newCols = Math.ceil(window.innerWidth / CELL_SIZE)
      const newRows = Math.ceil(window.innerHeight / CELL_SIZE)

      if (newCols !== this.GRID_COLS || newRows !== this.GRID_ROWS) {
        this.GRID_COLS = newCols
        this.GRID_ROWS = newRows
        this.grid = this.createGrid()
        this.initializeGrid()
        this.randomize()
      }
    })
  }

  public start(): void {
    this.randomize()
    this.intervalId = window.setInterval(() => this.nextGeneration(), ANIMATION_INTERVAL)
  }

  public stop(): void {
    if (this.intervalId) {
      window.clearInterval(this.intervalId)
      this.intervalId = null
    }
  }
}
