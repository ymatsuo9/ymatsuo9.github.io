'use strict'

{
    const AREA_HEIGHT = 9;
    const AREA_WIDTH = 9;
    const MINE_NUM = 10;

    const MINE_STR = 'X';

    const CLASS_CELL = 'cell';
    const CLASS_CLOSED = 'closed';
    const CLASS_MINE = 'mine';
    const CLASS_MINE_OPENED = 'mine-opened';
    const CLASS_PLAYING = 'playing';
    const CLASS_ROW = 'row';
    const CLASS_SAFE_OPENED = 'safe-opened';

    const MESSAGE_GAME_OVER = 'Game over';
    const MESSAGE_GAME_CLEAR = 'Congratulations!';

    class Cell {
        constructor(x, y, isMine, count, board) {
            this.x = x;
            this.y = y;
            this.isMine = isMine;
            this.count = count;
            this.board = board;
            this.neighborCells = undefined;

            this.element = document.createElement('div');
            this.element.classList.add(CLASS_CELL);
            this.element.classList.add(CLASS_CLOSED);

            this.element.addEventListener('click', () => {
                this.clickEvent();
            });
        }

        getX() {
            return this.x;
        }

        getY() {
            return this.y;
        }

        getIsMine() {
            return this.isMine;
        }

        getElement() {
            return this.element;
        }

        clickEvent() {
            if (this.board.getGame().getIsGameOver()) {
                return;
            } else if (!this.element.classList.contains(CLASS_CLOSED)) {
                return;
            } else if (this.board.getGame().getOpenedCellCount() === 0 &&
                       this.element.classList.contains(CLASS_MINE)) {
                this.shuffle();
                return;
            }
    
            this.element.classList.remove(CLASS_CLOSED);
    
            if (this.element.classList.contains(CLASS_MINE)) {
                this.clickEventMine();
                return;
            }
            
            this.element.classList.add(CLASS_SAFE_OPENED);
            this.board.getGame().addOpenedCellCount();
            if (this.count !== 0) {
                this.element.textContent = this.count;
            }
    
            if (this.board.getGame().isAllSafeCellOpened()) {
                this.board.clickEventGameClear();
                return;
            }
    
            if (this.count === 0) {
                this.board.openNeighborPanels(this.x, this.y);
            }
        }

        clickEventMine() {
            this.element.textContent = MINE_STR
            this.element.classList.add(CLASS_MINE_OPENED);
    
            this.board.getGame().setMessage(MESSAGE_GAME_OVER);
            this.board.getGame().setIsGameOver(true);
            this.board.getGame().getBtn().classList.remove(CLASS_PLAYING);
        }
    
        openPanel() {
            if (this.element.classList.contains(CLASS_CLOSED)) {
                this.element.click();
            }
        }

        shuffle() {
            this.board.getGame().shuffle(this);
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

        getGame() {
            return this.game;
        }

        getCells() {
            return this.cells;
        }

        createBoardContents() {
            this.createCells();

            while (this.board.firstChild) {
                this.board.removeChild(this.board.firstChild);
            }

            for (let hi = 0; hi < AREA_HEIGHT; hi++) {
                const row = document.createElement('div');
                row.classList.add(CLASS_ROW);
                
                for (let wi = 0; wi < AREA_WIDTH; wi++) {
                    let cell = this.cells[hi][wi];

                    if (cell.getIsMine()) {
                        cell.getElement().classList.add(CLASS_MINE);
                    }
                    
                    row.appendChild(cell.getElement());
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
            let indexes = [...Array(AREA_HEIGHT * AREA_WIDTH).keys()];
            let mineIndexes = [];
            for (let i = 0; i < MINE_NUM; i++) {
                mineIndexes.push(indexes.splice(Math.floor(Math.random() * indexes.length), 1)[0]);
            }
            return mineIndexes;
        }
    
        craeteCellsSub1(mineIndexes) {
            // create default cells            
            let cells = [];
            for (let y = 0; y < AREA_HEIGHT; y++) {
                const row = [];
                for (let x = 0; x < AREA_WIDTH; x++) {
                    let isMine = mineIndexes.includes(x + y * AREA_WIDTH);
                    row.push(new Cell(x, y, isMine, 0, this));
                }
                cells.push(row);
            }
            return cells;
        }

        createCellsSub2(cells) {
            // set neighbor cells
            for (let y = 0; y < AREA_HEIGHT; y++) {
                for (let x = 0; x < AREA_WIDTH; x++) {
                    let neighborCells = [];

                    if (y !== 0) {
                        if (x !== 0) {
                            neighborCells.push(cells[y - 1][x - 1]);
                        }
            
                        neighborCells.push(cells[y - 1][x]);
            
                        if (x !== (AREA_WIDTH - 1)) {
                            neighborCells.push(cells[y - 1][x + 1]);
                        }
                    }
            
                    if (x !== 0) {
                        neighborCells.push(cells[y][x - 1]);
                    }
            
                    if (x !== (AREA_WIDTH - 1)) {
                        neighborCells.push(cells[y][x + 1]);
                    }
            
                    if (y !== (AREA_HEIGHT - 1)) {
                        if (x !== 0) {
                            neighborCells.push(cells[y + 1][x - 1]);
                        }
            
                        neighborCells.push(cells[y + 1][x]);
            
                        if (x !== (AREA_WIDTH - 1)) {
                            neighborCells.push(cells[y + 1][x + 1]);
                        }
                    }

                    cells[y][x].setNeighborCells(neighborCells);
                }
            }
        }
    
        createCellsSub3(cells) {
            // call countUp method for board cells
            for (let y = 0; y < AREA_HEIGHT; y++) {
                for (let x = 0; x < AREA_WIDTH; x++) {
                    let cell = cells[y][x];
                    if (!cell.getIsMine()) {
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
            for (let y = 0; y < AREA_HEIGHT; y++) {
                for (let x = 0; x < AREA_WIDTH; x++) {
                    let element = this.cells[y][x].element;
                    if (element.classList.contains(CLASS_CLOSED) && 
                        element.classList.contains(CLASS_MINE)) {
                            element.classList.remove(CLASS_CLOSED);
                            element.classList.add(CLASS_SAFE_OPENED);
                            element.textContent = MINE_STR;
                    }
                }
            }
    
            this.game.setMessage(MESSAGE_GAME_CLEAR);
            this.game.setIsGameOver(true);
            this.game.btn.classList.remove(CLASS_PLAYING);
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
        constructor() {
            this.safeNum = AREA_HEIGHT * AREA_WIDTH - MINE_NUM;
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

        getIsGameOver() {
            return this.isGameOver;
        }

        setIsGameOver(isGameOver) {
            this.isGameOver = isGameOver;
        }

        getOpenedCellCount() {
            return this.openedCellCount;
        }

        getBtn() {
            return this.btn;
        }

        setMessage(message) {
            this.message.textContent = message;
        }

        addOpenedCellCount() {
            this.openedCellCount++;
        }

        isAllSafeCellOpened() {
            return this.safeNum === this.openedCellCount;
        }

        createNewGame() {
            this.board.createBoardContents();
    
            this.isGameOver = false;
            this.openedCellCount = 0;
            this.btn.classList.add(CLASS_PLAYING);
            this.message.textContent = '';
        }

        shuffle(oldCell) {
            let x = oldCell.getX();
            let y = oldCell.getY();
            this.createNewGame();
            let newCell = this.board.getCells()[y][x];
            newCell.getElement().click();
        }
    }

    new Game();
}