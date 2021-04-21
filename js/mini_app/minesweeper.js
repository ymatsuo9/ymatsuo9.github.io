'use strict'

{
    const mineStr = 'X';

    class cell {
        constructor(x, y, isMine, count) {
            this.x = x;
            this.y = y;
            this.isMine = isMine;
            this.count = count;
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
                    const cell = document.createElement('div');
                    cell.classList.add('cell');
                    cell.classList.add('closed');
                    
                    cell.setAttribute('x', this.cells[hi][wi].x);
                    cell.setAttribute('y', this.cells[hi][wi].y);
                    
                    if (this.cells[hi][wi].isMine) {
                        cell.classList.add('mine');
                    } else {
                        cell.setAttribute('count', this.cells[hi][wi].count);
                    }
                    
                    cell.addEventListener('click', () => {
                        this.clickEvent(cell);
                    });
                    
                    row.appendChild(cell);
                }
                
                this.board.appendChild(row);
            }
        }

        createCells() {
            let mineIndexes = this.createMineIndexes();
            let cellsTmp = this.craeteCellsSub1(mineIndexes);
            this.createCellsSub2(cellsTmp);
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
            let cells = [];
            for (let y = 0; y < this.game.areaHeight; y++) {
                const row = [];
                for (let x = 0; x < this.game.areaWidth; x++) {
                    let isMine = mineIndexes.includes(x + y * this.game.areaWidth);
                    row.push(new cell(x, y, isMine, 0));
                }
                cells.push(row);
            }
            return cells;
        }
    
        createCellsSub2(cells) {
            for (let y = 0; y < this.game.areaHeight; y++) {
                for (let x = 0; x < this.game.areaWidth; x++) {
                    if (!cells[y][x].isMine) {
                        continue;
                    }
        
                    this.craeteCellsSub3(cells, x, y);
                }
            }
        }
    
        craeteCellsSub3(cells, x, y) {
            if (y !== 0) {
                if (x !== 0) {
                    cells[y - 1][x - 1].count++;
                }
    
                cells[y - 1][x].count++;
    
                if (x !== (this.game.areaWidth - 1)) {
                    cells[y - 1][x + 1].count++;
                }
            }
    
            if (x !== 0) {
                cells[y][x - 1].count++;
            }
    
            if (x !== (this.game.areaWidth - 1)) {
                cells[y][x + 1].count++;
            }
    
            if (y !== (this.game.areaHeight - 1)) {
                if (x !== 0) {
                    cells[y + 1][x - 1].count++;
                }
    
                cells[y + 1][x].count++;
    
                if (x !== (this.game.areaWidth - 1)) {
                    cells[y + 1][x + 1].count++;
                }
            }
        }

        clickEvent(cell) {
            if (this.game.isGameOver) {
                return;
            } else if (!cell.classList.contains('closed')) {
                return;
            }
    
            cell.classList.remove('closed');
    
            if (cell.classList.contains('mine')) {
                this.clickEventMine(cell);
                return;
            }
            
            cell.classList.add('safe-opened');
            this.game.openedCellCount++;
            if (cell.getAttribute('count') !== '0') {
                cell.textContent = cell.getAttribute('count');
            }
    
            if (this.game.safeNum === this.game.openedCellCount) {
                this.clickEventGameClear();
                return;
            }
    
            if (cell.getAttribute('count') === '0') {
                this.openNeighborPanels(Number(cell.getAttribute('x')), Number(cell.getAttribute('y')));
            }
        }

        clickEventMine(cell) {
            cell.textContent = mineStr
            cell.classList.add('mine-opened');
    
            this.game.message.textContent = 'Game over';
            this.game.isGameOver = true;
            this.game.btn.classList.remove('playing');
        }
    
        clickEventGameClear() {
            for (let y = 0; y < areaHeight; y++) {
                for (let x = 0; x < areaWidth; x++) {
                    let cell = this.board.children[y].children[x];
                    if (cell.classList.contains('closed') && 
                        cell.classList.contains('mine')) {
                            cell.classList.remove('closed');
                            cell.classList.add('safe-opened');
                            cell.textContent = mineStr;
                    }
                }
            }
    
            this.game.textContent = 'Congratulations!';
            this.game.isGameOver = true;
            this.game.btn.classList.remove('playing');
        }
    
        openNeighborPanels(x, y) {
            if (y !== 0) {
                if (x !== 0) {
                    this.openPanel(x - 1, y - 1);
                }
    
                this.openPanel(x, y - 1);
    
                if (x !== (this.game.areaWidth - 1)) {
                    this.openPanel(x + 1, y - 1);
                }
            }
    
            if (x !== 0) {
                this.openPanel(x - 1, y);
            }
    
            if (x !== (this.game.areaWidth - 1)) {
                this.openPanel(x + 1, y);
            }
    
            if (y !== (this.game.areaHeight - 1)) {
                if (x !== 0) {
                    this.openPanel(x - 1, y + 1);
                }
    
                this.openPanel(x, y + 1);
    
                if (x !== (this.game.areaWidth - 1)) {
                    this.openPanel(x + 1, y + 1);
                }
            }
        }

        openPanel(x, y) {
            const cell = this.board.children[y].children[x]
            if (cell.classList.contains('closed')) {
                cell.click();
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