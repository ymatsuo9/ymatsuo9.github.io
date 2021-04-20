'use strict'

{
    const areaHeight = 9;
    const areaWidth = 9;
    const mineNum = 10;
    const safeNum = areaHeight * areaWidth - mineNum;

    const mineStr = 'X';

    let cells;
    let isGameOver = false;
    let openedCellCount = 0;

    function init() {
        createNewGame();

        document.getElementById('btn').addEventListener('click', () => {
            createNewGame();
        });
    }

    class cell {
        constructor(x, y, isMine, count) {
            this.x = x;
            this.y = y;
            this.isMine = isMine;
            this.count = count;
        }
    }

    function createMineIndexes() {
        let indexes = [...Array(areaHeight * areaWidth).keys()];
        let mineIndexes = [];
        for (let i = 0; i < mineNum; i++) {
            mineIndexes.push(indexes.splice(Math.floor(Math.random() * indexes.length), 1)[0]);
        }
        return mineIndexes;
    }

    function craeteCellsSub1(mineIndexes) {
        let cells = [];
        for (let y = 0; y < areaHeight; y++) {
            const row = [];
            for (let x = 0; x < areaWidth; x++) {
                let isMine = mineIndexes.includes(x + y * areaWidth);
                row.push(new cell(x, y, isMine, 0));
            }
            cells.push(row);
        }
        return cells;
    }

    function createCellsSub2(cells) {
        for (let y = 0; y < areaHeight; y++) {
            for (let x = 0; x < areaWidth; x++) {
                if (!cells[y][x].isMine) {
                    continue;
                }
    
                craeteCellsSub3(cells, x, y);
            }
        }
    }

    function craeteCellsSub3(cells, x, y) {
        if (y !== 0) {
            if (x !== 0) {
                cells[y - 1][x - 1].count++;
            }

            cells[y - 1][x].count++;

            if (x !== (areaWidth - 1)) {
                cells[y - 1][x + 1].count++;
            }
        }

        if (x !== 0) {
            cells[y][x - 1].count++;
        }

        if (x !== (areaWidth - 1)) {
            cells[y][x + 1].count++;
        }

        if (y !== (areaHeight - 1)) {
            if (x !== 0) {
                cells[y + 1][x - 1].count++;
            }

            cells[y + 1][x].count++;

            if (x !== (areaWidth - 1)) {
                cells[y + 1][x + 1].count++;
            }
        }
    }

    function createCells() {
        let mineIndexes = createMineIndexes();
        let cells = craeteCellsSub1(mineIndexes);
        createCellsSub2(cells);
        return cells;
    }

    function clickEventMine(cell) {
        cell.textContent = mineStr
        cell.classList.add('mine-opened');

        document.getElementById('message').textContent = 'Game over';
        isGameOver = true;
        document.getElementById('btn').classList.remove('playing');
    }

    function clickEventGameClear() {
        let main = document.getElementById('main');
        for (let y = 0; y < areaHeight; y++) {
            for (let x = 0; x < areaWidth; x++) {
                let cell = main.children[y].children[x];
                if (cell.classList.contains('closed') && 
                    cell.classList.contains('mine')) {
                        cell.classList.remove('closed');
                        cell.classList.add('safe-opened');
                        cell.textContent = mineStr;
                }
            }
        }

        document.getElementById('message').textContent = 'Congratulations!';
        isGameOver = true;
        document.getElementById('btn').classList.remove('playing');
    }

    function openPanel(x, y) {
        const cell = document.getElementById('main').children[y].children[x]
        if (cell.classList.contains('closed')) {
            cell.click();
        }
    }

    function openNeighborPanels(x, y) {
        if (y !== 0) {
            if (x !== 0) {
                openPanel(x - 1, y - 1);
            }

            openPanel(x, y - 1);

            if (x !== (areaWidth - 1)) {
                openPanel(x + 1, y - 1);
            }
        }

        if (x !== 0) {
            openPanel(x - 1, y);
        }

        if (x !== (areaWidth - 1)) {
            openPanel(x + 1, y);
        }

        if (y !== (areaHeight - 1)) {
            if (x !== 0) {
                openPanel(x - 1, y + 1);
            }

            openPanel(x, y + 1);

            if (x !== (areaWidth - 1)) {
                openPanel(x + 1, y + 1);
            }
        }
    }

    function clickEvent(cell) {
        if (isGameOver) {
            return;
        } else if (!cell.classList.contains('closed')) {
            return;
        }

        cell.classList.remove('closed');

        if (cell.classList.contains('mine')) {
            clickEventMine(cell);
            return;
        }
        
        cell.classList.add('safe-opened');
        openedCellCount++;
        if (cell.getAttribute('count') !== '0') {
            cell.textContent = cell.getAttribute('count');
        }

        if (safeNum === openedCellCount) {
            clickEventGameClear();
            return;
        }

        if (cell.getAttribute('count') === '0') {
            openNeighborPanels(Number(cell.getAttribute('x')), Number(cell.getAttribute('y')));
        }
    }

    function createMainContents() {
        cells = createCells();

        const main = document.getElementById('main');
        while (main.firstChild) {
            main.removeChild(main.firstChild);
        }

        for (let hi = 0; hi < areaHeight; hi++) {
            const row = document.createElement('div');
            row.classList.add('row');

            for (let wi = 0; wi < areaWidth; wi++) {
                const cell = document.createElement('div');
                cell.classList.add('cell');
                cell.classList.add('closed');

                cell.setAttribute('x', cells[hi][wi].x);
                cell.setAttribute('y', cells[hi][wi].y);

                if (cells[hi][wi].isMine) {
                    cell.classList.add('mine');
                } else {
                    cell.setAttribute('count', cells[hi][wi].count);
                }

                cell.addEventListener('click', () => {
                    clickEvent(cell);
                });

                row.appendChild(cell);
            }

            main.appendChild(row);
        }
    }
    
    function createNewGame() {
        createMainContents();

        document.getElementById('btn').classList.add('playing');
        isGameOver = false;
        openedCellCount = 0;
        document.getElementById('message').textContent = '';
    }

    init();
}