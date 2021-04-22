'use strict'

{
    const MINE_STR = 'X';

    class Cell {
        constructor(x, y, isMine, count, board) {
            this.x = x;
            this.y = y;
            this.isMine = isMine;
            this.count = count;
            this.board = board;
            this.neighborCells = undefined;

            this.element = document.createElement('div');
            this.element.classList.add('cell');
            this.element.classList.add('closed');
            this.element.setAttribute('x', this.x);
            this.element.setAttribute('y', this.y);

            this.element.addEventListener('click', () => {
                this.clickEvent();
            });
        }

        clickEvent() {
            if (this.board.game.isGameOver) {
                return;
            } else if (!this.element.classList.contains('closed')) {
                return;
            }
    
            this.element.classList.remove('closed');
    
            if (this.element.classList.contains('mine')) {
                this.clickEventMine();
                return;
            }
            
            this.element.classList.add('safe-opened');
            this.board.game.openedCellCount++;
            if (this.count !== 0) {
                this.element.textContent = this.count;
            }
    
            if (this.board.game.safeNum === this.board.game.openedCellCount) {
                this.board.clickEventGameClear();
                return;
            }
    
            if (this.count === 0) {
                this.board.openNeighborPanels(this.x, this.y);
            }
        }

        clickEventMine() {
            this.element.textContent = MINE_STR
            this.element.classList.add('mine-opened');
    
            this.board.game.message.textContent = 'Game over';
            this.board.game.isGameOver = true;
            this.board.game.btn.classList.remove('playing');
        }
    
        openPanel() {
            if (this.element.classList.contains('closed')) {
                this.element.click();
            }
        }

        setNeighborCells(neighborCells) {
            this.neighborCells = neighborCells;
        }

        countUp() {
            this.count++;
        }
    }

    class Board {
        constructor(game) {
            this.game = game;
            this.cells = undefined;

            this.board = document.getElementById('board');
        }

        createBoardContents() {
            this.createCells();

            while (this.board.firstChild) {
                this.board.removeChild(this.board.firstChild);
            }

            for (let hi = 0; hi < areaHeight; hi++) {
                const row = document.createElement('div');
                row.classList.add('row');
                
                for (let wi = 0; wi < areaWidth; wi++) {
                    let cell = this.cells[hi][wi];

                    if (cell.isMine) {
                        cell.element.classList.add('mine');
                    } else {
                        cell.element.setAttribute('count', cell.count);
                    }
                    
                    row.appendChild(cell.element);
                }
                
                this.board.appendChild(row);
            }
        }

        createCells() {
            let mineIndexes = this.createMineIndexes();
            let cellsTmp = this.craeteCellsSub1(mineIndexes);
            this.createCellsSub2(cellsTmp);
            this.createCellsSub3(cellsTmp);
            this.cells = cellsTmp;
        }

        createMineIndexes() {
            let indexes = [...Array(this.game.areaHeight * this.game.areaWidth).keys()];
            let mineIndexes = [];
            for (let i = 0; i < mineNum; i++) {
                mineIndexes.push(indexes.splice(Math.floor(Math.random() * indexes.length), 1)[0]);
            }
            return mineIndexes;
        }
    
        craeteCellsSub1(mineIndexes) {
            // create default cells            
            let cells = [];
            for (let y = 0; y < this.game.areaHeight; y++) {
                const row = [];
                for (let x = 0; x < this.game.areaWidth; x++) {
                    let isMine = mineIndexes.includes(x + y * this.game.areaWidth);
                    row.push(new Cell(x, y, isMine, 0, this));
                }
                cells.push(row);
            }
            return cells;
        }

        createCellsSub2(cells) {
            // set neighbor cells
            for (let y = 0; y < this.game.areaHeight; y++) {
                for (let x = 0; x < this.game.areaWidth; x++) {
                    let neighborCells = [];

                    if (y !== 0) {
                        if (x !== 0) {
                            neighborCells.push(cells[y - 1][x - 1]);
                        }
            
                        neighborCells.push(cells[y - 1][x]);
            
                        if (x !== (this.game.areaWidth - 1)) {
                            neighborCells.push(cells[y - 1][x + 1]);
                        }
                    }
            
                    if (x !== 0) {
                        neighborCells.push(cells[y][x - 1]);
                    }
            
                    if (x !== (this.game.areaWidth - 1)) {
                        neighborCells.push(cells[y][x + 1]);
                    }
            
                    if (y !== (this.game.areaHeight - 1)) {
                        if (x !== 0) {
                            neighborCells.push(cells[y + 1][x - 1]);
                        }
            
                        neighborCells.push(cells[y + 1][x]);
            
                        if (x !== (this.game.areaWidth - 1)) {
                            neighborCells.push(cells[y + 1][x + 1]);
                        }
                    }

                    cells[y][x].setNeighborCells(neighborCells);
                }
            }
        }
    
        createCellsSub3(cells) {
            // call countUp method for board cells
            for (let y = 0; y < this.game.areaHeight; y++) {
                for (let x = 0; x < this.game.areaWidth; x++) {
                    let cell = cells[y][x];
                    if (!cell.isMine) {
                        continue;
                    }
        
                    this.craeteCellsSub4(cell);
                }
            }
        }
    
        craeteCellsSub4(cell) {
            // call countUp method for neighbor cells
            for (let i = 0; i < cell.neighborCells.length; i++) {
                cell.neighborCells[i].countUp();
            }
        }

        clickEventGameClear() {
            for (let y = 0; y < this.game.areaHeight; y++) {
                for (let x = 0; x < this.game.areaWidth; x++) {
                    let element = this.cells[y][x].element;
                    if (element.classList.contains('closed') && 
                        element.classList.contains('mine')) {
                            element.classList.remove('closed');
                            element.classList.add('safe-opened');
                            element.textContent = MINE_STR;
                    }
                }
            }
    
            this.game.message.textContent = 'Congratulations!';
            this.game.isGameOver = true;
            this.game.btn.classList.remove('playing');
        }
    
        openNeighborPanels(x, y) {
            // call onclick method for neighbor cells
            let cell = this.cells[y][x];
            for (let i = 0; i < cell.neighborCells.length; i++) {
                cell.neighborCells[i].openPanel();
            }
        }
    }

    class Game {
        constructor(areaHeight, areaWidth, mineNum) {
            this.areaHeight = areaHeight;
            this.areaWidth = areaWidth;
            this.mineNum = mineNum;
            this.safeNum = areaHeight * areaWidth - mineNum;
            this.board = new Board(this);
            this.isGameOver = false;
            this.openedCellCount = 0;
            this.btn = document.getElementById('btn');
            this.message = document.getElementById('message');

            btn.addEventListener('click', () => {
                this.createNewGame();
            });

            this.createNewGame();
        }

        createNewGame() {
            this.board.createBoardContents();
    
            this.isGameOver = false;
            this.openedCellCount = 0;
            this.btn.classList.add('playing');
            this.message.textContent = '';
        }
    }

    const areaHeight = 9;
    const areaWidth = 9;
    const mineNum = 10;
    new Game(areaHeight, areaWidth, mineNum);
}