const CELL_SIZE = 20 // px
const ANIMATION_INTERVAL = 100
const MAX_REPEAT_HISTORY = 12

export class GameOfLife {
  private GRID_COLS: number
  private GRID_ROWS: number
  // Boolean cell state matrix for the current generation.
  private grid: boolean[][]
  private gridContainer: HTMLElement
  private intervalId: number | null = null
  // Recent state keys used to detect stable boards and short loops.
  private recentStateKeys: string[] = []
  private recentStateSet = new Set<string>()

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
    // Candidate next generation derived from the current grid.
    const newGrid = this.createGrid()
    const nextStateRows: string[] = []
    const changedCells: [row: number, col: number][] = []

    for (let i = 0; i < this.GRID_ROWS; i++) {
      let rowState = ''

      for (let j = 0; j < this.GRID_COLS; j++) {
        const neighbors = this.countNeighbors(i, j)
        const nextIsAlive = this.grid[i][j] ? neighbors === 2 || neighbors === 3 : neighbors === 3

        newGrid[i][j] = nextIsAlive
        rowState += nextIsAlive ? '1' : '0'

        // Track DOM updates so we only touch cells that actually changed.
        if (nextIsAlive !== this.grid[i][j]) {
          changedCells.push([i, j])
        }
      }

      nextStateRows.push(rowState)
    }

    const nextStateKey = nextStateRows.join('|')

    // If we've seen this state recently, the board is stuck in a stable or looping cycle.
    if (this.recentStateSet.has(nextStateKey)) {
      this.randomize()
      return
    }

    this.grid = newGrid
    this.updateChangedCells(changedCells)
    this.recordState(nextStateKey)
  }

  private resetStateHistory(): void {
    this.recentStateKeys = []
    this.recentStateSet.clear()
  }

  private recordState(stateKey: string): void {
    this.recentStateKeys.push(stateKey)
    this.recentStateSet.add(stateKey)

    if (this.recentStateKeys.length > MAX_REPEAT_HISTORY) {
      const expiredStateKey = this.recentStateKeys.shift()
      if (expiredStateKey) {
        this.recentStateSet.delete(expiredStateKey)
      }
    }
  }

  private updateChangedCells(changedCells: [row: number, col: number][]): void {
    for (const [row, col] of changedCells) {
      this.updateCellDisplay(row, col)
    }
  }

  private randomize(): void {
    const stateRows: string[] = []

    for (let i = 0; i < this.GRID_ROWS; i++) {
      let rowState = ''

      for (let j = 0; j < this.GRID_COLS; j++) {
        const isAlive = Math.random() > 0.85
        this.grid[i][j] = isAlive
        rowState += isAlive ? '1' : '0'
        this.updateCellDisplay(i, j)
      }

      stateRows.push(rowState)
    }

    this.resetStateHistory()
    this.recordState(stateRows.join('|'))
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
    this.stop()
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
