'use strict'

{
    const area_height = 9;
    const area_width = 9;
    const mine_num = 10;
    const safe_num = area_height * area_width - mine_num;

    const mine_str = 'X';

    let cells;
    let is_game_over = false;
    let opened_cell_count = 0;

    function init() {
        create_new_game();

        document.getElementById('btn').addEventListener('click', () => {
            create_new_game();
        });
    }

    class cell {
        constructor(x, y, is_mine, count) {
            this.x = x;
            this.y = y;
            this.is_mine = is_mine;
            this.count = count;
        }
    }

    function create_mine_indexes() {
        let indexes = [...Array(area_height * area_width).keys()];
        let mine_indexes = [];
        for (let i = 0; i < mine_num; i++) {
            mine_indexes.push(indexes.splice(Math.floor(Math.random() * indexes.length), 1)[0]);
        }
        return mine_indexes;
    }

    function craete_cells_sub1(mine_indexes) {
        let cells = [];
        for (let y = 0; y < area_height; y++) {
            const row = [];
            for (let x = 0; x < area_width; x++) {
                let is_mine = mine_indexes.includes(x + y * area_width);
                row.push(new cell(x, y, is_mine, 0));
            }
            cells.push(row);
        }
        return cells;
    }

    function create_cells_sub2(cells) {
        for (let y = 0; y < area_height; y++) {
            for (let x = 0; x < area_width; x++) {
                if (!cells[y][x].is_mine) {
                    continue;
                }
    
                craete_cells_sub3(cells, x, y);
            }
        }
    }

    function craete_cells_sub3(cells, x, y) {
        if (y !== 0) {
            if (x !== 0) {
                cells[y - 1][x - 1].count++;
            }

            cells[y - 1][x].count++;

            if (x !== (area_width - 1)) {
                cells[y - 1][x + 1].count++;
            }
        }

        if (x !== 0) {
            cells[y][x - 1].count++;
        }

        if (x !== (area_width - 1)) {
            cells[y][x + 1].count++;
        }

        if (y !== (area_height - 1)) {
            if (x !== 0) {
                cells[y + 1][x - 1].count++;
            }

            cells[y + 1][x].count++;

            if (x !== (area_width - 1)) {
                cells[y + 1][x + 1].count++;
            }
        }
    }

    function create_cells() {
        let mine_indexes = create_mine_indexes();
        let cells = craete_cells_sub1(mine_indexes);
        create_cells_sub2(cells);
        return cells;
    }

    function click_event_mine(cell) {
        cell.textContent = mine_str
        cell.classList.add('mine-opened');

        document.getElementById('message').textContent = 'Game over';
        is_game_over = true;
        document.getElementById('btn').classList.remove('playing');
    }

    function click_event_game_clear() {
        let main = document.getElementById('main');
        for (let y = 0; y < area_height; y++) {
            for (let x = 0; x < area_width; x++) {
                let cell = main.children[y].children[x];
                if (cell.classList.contains('closed') && 
                    cell.classList.contains('mine')) {
                        cell.classList.remove('closed');
                        cell.classList.add('safe-opened');
                        cell.textContent = mine_str;
                }
            }
        }

        document.getElementById('message').textContent = 'Congraturations!';
        is_game_over = true;
        document.getElementById('btn').classList.remove('playing');
    }

    function open_panel(x, y) {
        const cell = document.getElementById('main').children[y].children[x]
        if (cell.classList.contains('closed')) {
            cell.click();
        }
    }

    function open_neighbor_panels(x, y) {
        if (y !== 0) {
            if (x !== 0) {
                open_panel(x - 1, y - 1);
            }

            open_panel(x, y - 1);

            if (x !== (area_width - 1)) {
                open_panel(x + 1, y - 1);
            }
        }

        if (x !== 0) {
            open_panel(x - 1, y);
        }

        if (x !== (area_width - 1)) {
            open_panel(x + 1, y);
        }

        if (y !== (area_height - 1)) {
            if (x !== 0) {
                open_panel(x - 1, y + 1);
            }

            open_panel(x, y + 1);

            if (x !== (area_width - 1)) {
                open_panel(x + 1, y + 1);
            }
        }
    }

    function click_event(cell) {
        if (is_game_over) {
            return;
        } else if (cell.classList.contains('opened')) {
            return;
        }

        cell.classList.remove('closed');

        if (cell.classList.contains('mine')) {
            click_event_mine(cell);
            return;
        }
        
        cell.classList.add('safe-opened');
        opened_cell_count++;
        if (cell.getAttribute('count') !== '0') {
            cell.textContent = cell.getAttribute('count');
        }

        if (safe_num === opened_cell_count) {
            click_event_game_clear();
            return;
        }

        if (cell.getAttribute('count') === '0') {
            open_neighbor_panels(Number(cell.getAttribute('x')), Number(cell.getAttribute('y')));
        }
    }

    function create_main_contents() {
        cells = create_cells();

        const main = document.getElementById('main');
        while (main.firstChild) {
            main.removeChild(main.firstChild);
        }

        for (let hi = 0; hi < area_height; hi++) {
            const row = document.createElement('div');
            row.classList.add('row');

            for (let wi = 0; wi < area_width; wi++) {
                const cell = document.createElement('div');
                cell.classList.add('cell');
                cell.classList.add('closed');

                cell.setAttribute('x', cells[hi][wi].x);
                cell.setAttribute('y', cells[hi][wi].y);

                if (cells[hi][wi].is_mine) {
                    cell.classList.add('mine');
                } else {
                    cell.setAttribute('count', cells[hi][wi].count);
                }

                cell.addEventListener('click', () => {
                    click_event(cell);
                });

                row.appendChild(cell);
            }

            main.appendChild(row);
        }
    }
    
    function create_new_game() {
        create_main_contents();

        document.getElementById('btn').classList.add('playing');
        is_game_over = false;
        opened_cell_count = 0;
        document.getElementById('message').textContent = '';
    }

    init();
}