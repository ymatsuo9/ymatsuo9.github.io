'use strict';

(() => {
  class Game {
    constructor(canvas) {
      this.MINO_PATTERN_COUNT = 7;
      this.ROW_COUNT = 20;
      this.COL_COUNT = 10;
      this.BLOCK_SIZE = 25;
      this.BORDER_WIDTH = 1;

      this.canvas = canvas;
      this.ctx = this.canvas.getContext('2d');

      this.scoreDiv = document.getElementById('score');
      
      this.rotateBuffer = 0;
      this.moveBuffer = 0;
      
      this.rotateLeftButton = document.getElementById('rotateLeft');
      this.rotateRightButton = document.getElementById('rotateRight');
      this.leftButton = document.getElementById('left');
      this.rightButton = document.getElementById('right');

      this.rotateLeftButton.addEventListener('click', () => this.rotateLeft());
      this.rotateRightButton.addEventListener('click', () => this.rotateRight());
      this.leftButton.addEventListener('click', () => this.pushLeft());
      this.rightButton.addEventListener('click', () => this.pushRight());

      this.minoFactory = new MinoFactory(canvas, this);
      this.blockFactory = new BlockFactory(canvas, this);

      this.nextMinos = this.getNextMinoSet();
      this.currentMino = this.getCurrentMino();
      this.areaBlocks = this.initializeAreaBlocks();
      this.isGameOver = false;
      this.score = 0;

      this.loop();
    }

    addScore(val) {
      this.score += val;
    }

    getAreaBlock(row, col) {
      return this.areaBlocks[row][col];
    }

    setAreaBlock(row, col, block) {
      this.areaBlocks[row][col] = block;
    }

    rotateLeft() {
      this.rotateBuffer--;
    }

    rotateRight() {
      this.rotateBuffer++;
    }

    pushLeft() {
      this.moveBuffer--;
    }  

    pushRight() {
      this.moveBuffer++;
    }  

    resetRotateBuffer() {
      this.rotateBuffer = 0;
    }

    resetMoveBuffer() {
      this.moveBuffer = 0;
    }  

    getNextMinoSet() {
      let minos = [];
      let minoPatterns = [];
      for (let i = 0; i < this.MINO_PATTERN_COUNT; i++) {
        minoPatterns.push(i);
      }
      for (let i = 0; i < this.MINO_PATTERN_COUNT; i++) {
        let pattern = minoPatterns.splice(Math.floor(Math.random() * minoPatterns.length), 1)[0];
        let minoStatus = i + 1;
        this.pushMino(pattern, minoStatus, minos);
      }
      return minos;
    }

    getCurrentMino() {
      let newCurrentMino = this.shiftMino();

      if (this.nextMinos.length < this.MINO_PATTERN_COUNT) {
        let nextMinoSet;
        do {
          nextMinoSet = this.getNextMinoSet();
          let oldLastMinoPattern = this.nextMinos[this.nextMinos.length - 1].getPattern();
          let newFirstMinoPattern = nextMinoSet[0].getPattern();
          if (oldLastMinoPattern !== newFirstMinoPattern) {
            break;
          }
        } while (true)
        this.nextMinos = this.nextMinos.concat(nextMinoSet);
      }

      return newCurrentMino;
    }

    shiftMino() {
      for (let i = 0; i < this.nextMinos.length; i++) {
        this.nextMinos[i].setMinoStatus(i);
      }
      return this.nextMinos.shift();
    }
    
    pushMino(pattern, minoStatus, minos) {   
      let newMino = this.minoFactory.createMino(pattern, minoStatus);
      minos.push(newMino);
    }

    initializeAreaBlocks() {
      let rows = [];
      for (let rowIndex = 0; rowIndex < this.ROW_COUNT; rowIndex++) {
        let row = [];
        for (let colIndex = 0; colIndex < this.COL_COUNT; colIndex++) {
          let pattern = undefined;
          row.push(this.blockFactory.createBlock(pattern, colIndex, rowIndex));
        }
        rows.push(row);
      }
      return rows;
    }

    loop() {
      if (this.isGameOver) {
        return;
      }

      this.update();
      this.draw();

      requestAnimationFrame(() => {
        this.loop();
      })
    }

    update() {
      this.currentMino.update(this.rotateBuffer, this.moveBuffer);
      this.resetRotateBuffer();
      this.resetMoveBuffer();

      if (this.currentMino.getMissedStatus()) {
        this.isGameOver = true;
        return;
      }
      
      if (this.currentMino.getDroppedStatus()) {
        this.clearFilledRow();
        this.currentMino = this.getCurrentMino();
        this.update();
      }
    }

    clearFilledRow() {
      let filledRowIndexes = [];
      for (let row = 0; row < this.ROW_COUNT; row++) {
        let isFilled = true;
        for (let col = 0; col < this.COL_COUNT; col++) {
          let block = this.getAreaBlock(row, col);
          if (block instanceof BlockEmpty) {
            isFilled = false;
            break;
          }
        }
        if (isFilled) {
          filledRowIndexes.push(row);
        }
      }
      for (let i = 0; i < filledRowIndexes.length; i++) {
        let filledRowIndex = filledRowIndexes[i];
        
        for (let row = (filledRowIndexes[i] - 1); 0 <= row; row--) {
          for (let col = 0; col < this.COL_COUNT; col++) {
            let upperBlock = this.getAreaBlock(row, col);
            upperBlock.setY(upperBlock.getY() + this.BLOCK_SIZE);
            this.setAreaBlock((row + 1), col, upperBlock);
          }
        }

        for (let col = 0; col < this.COL_COUNT; col++) {
          let pattern = undefined;
          let emptyBlock = this.blockFactory.createBlock(pattern, col, 0);
          this.setAreaBlock(0, col, emptyBlock);
        }
      }
    }

    draw() {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      // TODO: rewrite
      // for (let i = 0; i < this.nextMinos.length; i++) {
      //   let mino = this.nextMinos[i];
      //   mino.draw();
      // }
      this.currentMino.draw();

      for (let rowIndex = 0; rowIndex < this.areaBlocks.length; rowIndex++) {
        let row = this.areaBlocks[rowIndex];
        for (let colIndex = 0; colIndex < row.length; colIndex++) {
          let block = row[colIndex];
          block.draw();
        }
      }

      this.drawScore();

      if (this.isGameOver) {
        this.drawGameOver();
        return;
      }
    }

    drawGameOver() {
      this.ctx.font = '32px Arial';
      this.ctx.fillStyle = 'red';
      this.ctx.fillText('GAME OVER', 30, 100);
    }
    
    drawScore() {
      this.scoreDiv.textContent = this.score;
    }
  }

  class MinoConstant {
    constructor() {
      this.STATUS_CURRENT = 0;
    }
  }

  class MinoFactory {
    constructor(canvas, game) {
      this.MINO_PATTERNS = 7;

      this.canvas = canvas;
      this.ctx - this.canvas.getContext('2d');

      this.game = game;

      this.minoConstant = new MinoConstant();
    }

    createMino(pattern, minoStatus) {
      if (pattern === 0) {
        return new MinoI(this.canvas, this.game, minoStatus, this.minoConstant);
      }

      if (pattern === 1) {
        return new MinoO(this.canvas, this.game, minoStatus, this.minoConstant);
      }

      if (pattern === 2) {
        return new MinoS(this.canvas, this.game, minoStatus, this.minoConstant);
      }

      if (pattern === 3) {
        return new MinoZ(this.canvas, this.game, minoStatus, this.minoConstant);
      }

      if (pattern === 4) {
        return new MinoJ(this.canvas, this.game, minoStatus, this.minoConstant);
      }

      if (pattern === 5) {
        return new MinoL(this.canvas, this.game, minoStatus, this.minoConstant);
      }

      if (pattern === 6) {
        return new MinoT(this.canvas, this.game, minoStatus, this.minoConstant);
      }
    }
  }

  class Mino {
    constructor(canvas, game, minoStatus, minoConstant) {
      this.canvas = canvas;
      this.ctx = this.canvas.getContext('2d');

      this.game = game;

      this.minoStatus = minoStatus;

      this.minoConstant = minoConstant;

      this.blocks = [];

      this.x = 5 * this.game.BLOCK_SIZE;
      this.y = 0 * this.game.BLOCK_SIZE;

      this.vy = 3;

      this.rotateVal = 0;

      this.isMissed = false;
      this.isDropped = false;

      this.pattern = undefined;
    }

    getMinoStatus() {
      return this.minoStatus;
    }

    setMinoStatus(minoStatus) {
      this.minoStatus = minoStatus;
    }

    getX() {
      return this.x;
    }

    getY() {
      return this.y;
    }

    getMissedStatus() {
      return this.isMissed;
    }

    getDroppedStatus() {
      return this.isDropped;
    }

    getPattern() {
      return this.pattern;
    }

    update(rotateBuffer, moveBuffer) {
      if (this.minoStatus === this.minoConstant.STATUS_CURRENT) {
        this.rotateVal = (this.rotateVal + rotateBuffer) % 4;
        this.rotate();
        let isAllRotatable = true;
        for (let i = 0; i < this.blocks.length; i++) {
          if (!this.blocks[i].isRotatable(this)) {
            isAllRotatable = false;
          }
        }
        if (!isAllRotatable) {
          // reset mino's rotate value
          this.rotateVal = (this.rotateVal - rotateBuffer) % 4;
          this.rotate();
        }

        this.x += moveBuffer * this.game.BLOCK_SIZE;
        let isAllMovable = true;
        for (let i = 0; i < this.blocks.length; i++) {
          if (!this.blocks[i].isMovable(this)) {
            isAllMovable = false;
          }
        }
        if (!isAllMovable) {
          // reset mino's x value
          this.x -= moveBuffer * this.game.BLOCK_SIZE;
        }

        this.y += this.vy;

        let isAllUpdatable = true;
        for (let i = 0; i < this.blocks.length; i++) {
          if (!this.blocks[i].isUpdatable(this)) {
            isAllUpdatable = false;
          }
        }

        if (!isAllUpdatable) {
          this.isDropped = true;
        }
    
        for (let i = 0; i < this.blocks.length; i++) {
          this.blocks[i].update(this);
        }
        
        if (this.isDropped) {
          this.isMissed = this.changeMinoToBlocks();

          if (!this.isMissed) {
            this.game.addScore(1);
          }
        }
      }
    }

    rotate() {
      if (this.rotateVal === 0) {
        this.rotate0();
      } else if (this.rotateVal === 1) {
        this.rotate1();
      } else if (this.rotateVal === 2) {
        this.rotate2();
      } else {
        this.rotate3();
      }
    }

    rotate0() {
      // Not implemented
    }

    rotate1() {
      // Not implemented
    }

    rotate2() {
      // Not implemented
    }

    rotate3() {
      // Not implemented
    }

    changeMinoToBlocks() {
      let isMissed = false;

      for (let i = 0; i < this.blocks.length; i++) {
        if (this.y !== 0) {
          this.y -= this.vy;
        }

        const col = Math.floor((this.x + this.blocks[i].getOffsetX()) / this.game.BLOCK_SIZE);
        const row = Math.floor((this.y + this.blocks[i].getOffsetY()) / this.game.BLOCK_SIZE);

        this.blocks[i].update(this);

        let beforeBlock = this.game.getAreaBlock(row, col);
        if (beforeBlock instanceof BlockEmpty) {
          // Do nothing
        } else {
          isMissed = true;
        }
  
        this.game.setAreaBlock(row, col, this.blocks[i]);
      }

      this.blocks = [];

      return isMissed;
    }

    draw() {
      if (this.minoStatus === this.minoConstant.STATUS_CURRENT) {
        for (let i = 0; i < this.blocks.length; i++) {
          this.blocks[i].draw();
        }
      }
    }
  }

  // 0123
  class MinoI extends Mino {
    constructor(canvas, game, minoStatus, minoConstant) {
      super(canvas, game, minoStatus, minoConstant);

      let blockFactory = this.game.blockFactory;
      this.pattern = 0;

      this.blocks.push(blockFactory.createBlock(this.pattern, - 2 * this.game.BLOCK_SIZE, 0));
      this.blocks.push(blockFactory.createBlock(this.pattern, - this.game.BLOCK_SIZE, 0));
      this.blocks.push(blockFactory.createBlock(this.pattern, 0, 0));
      this.blocks.push(blockFactory.createBlock(this.pattern, this.game.BLOCK_SIZE, 0));
    }

    rotate0() {
      this.blocks[0].setOffsetX(-2 * this.game.BLOCK_SIZE);
      this.blocks[0].setOffsetY(0)
      this.blocks[1].setOffsetX(- this.game.BLOCK_SIZE);
      this.blocks[1].setOffsetY(0)
      this.blocks[2].setOffsetX(0);
      this.blocks[2].setOffsetY(0)
      this.blocks[3].setOffsetX(this.game.BLOCK_SIZE);
      this.blocks[3].setOffsetY(0)
    }

    rotate1() {
      this.blocks[0].setOffsetX(0)
      this.blocks[0].setOffsetY(-2 * this.game.BLOCK_SIZE);
      this.blocks[1].setOffsetX(0)
      this.blocks[1].setOffsetY(- this.game.BLOCK_SIZE);
      this.blocks[2].setOffsetX(0)
      this.blocks[2].setOffsetY(0);
      this.blocks[3].setOffsetX(0)
      this.blocks[3].setOffsetY(this.game.BLOCK_SIZE);
    }

    rotate2() {
      this.blocks[0].setOffsetX(2 * this.game.BLOCK_SIZE);
      this.blocks[0].setOffsetY(0)
      this.blocks[1].setOffsetX(this.game.BLOCK_SIZE);
      this.blocks[1].setOffsetY(0)
      this.blocks[2].setOffsetX(0);
      this.blocks[2].setOffsetY(0)
      this.blocks[3].setOffsetX(- this.game.BLOCK_SIZE);
      this.blocks[3].setOffsetY(0)
    }

    rotate3() {
      this.blocks[0].setOffsetX(0)
      this.blocks[0].setOffsetY(2 * this.game.BLOCK_SIZE);
      this.blocks[1].setOffsetX(0)
      this.blocks[1].setOffsetY(this.game.BLOCK_SIZE);
      this.blocks[2].setOffsetX(0)
      this.blocks[2].setOffsetY(0);
      this.blocks[3].setOffsetX(0)
      this.blocks[3].setOffsetY(- this.game.BLOCK_SIZE);
    }
  }

  // 01
  // 32
  class MinoO extends Mino {
    constructor(canvas, game, minoStatus, minoConstant) {
      super(canvas, game, minoStatus, minoConstant);

      let blockFactory = this.game.blockFactory;
      this.pattern = 1;

      this.blocks.push(blockFactory.createBlock(this.pattern, - this.game.BLOCK_SIZE, 0));
      this.blocks.push(blockFactory.createBlock(this.pattern, 0, 0));
      this.blocks.push(blockFactory.createBlock(this.pattern, 0, this.game.BLOCK_SIZE));
      this.blocks.push(blockFactory.createBlock(this.pattern, - this.game.BLOCK_SIZE, this.game.BLOCK_SIZE));
    }

    rotate0() {
      // Do nothing
    }

    rotate1() {
      // Do nothing
    }

    rotate2() {
      // Do nothing
    }

    rotate3() {
      // Do nothing
    }
  }

  //  01
  // 32
  class MinoS extends Mino {
    constructor(canvas, game, minoStatus, minoConstant) {
      super(canvas, game, minoStatus, minoConstant);

      let blockFactory = this.game.blockFactory;
      this.pattern = 2;

      this.blocks.push(blockFactory.createBlock(this.pattern, 0, 0));
      this.blocks.push(blockFactory.createBlock(this.pattern, this.game.BLOCK_SIZE, 0));
      this.blocks.push(blockFactory.createBlock(this.pattern, 0, this.game.BLOCK_SIZE));
      this.blocks.push(blockFactory.createBlock(this.pattern, - this.game.BLOCK_SIZE, this.game.BLOCK_SIZE));
    }
    
    rotate0() {
      this.blocks[0].setOffsetX(0);
      this.blocks[0].setOffsetY(0);
      this.blocks[1].setOffsetX(this.game.BLOCK_SIZE);
      this.blocks[1].setOffsetY(0);
      this.blocks[2].setOffsetX(0);
      this.blocks[2].setOffsetY(this.game.BLOCK_SIZE);
      this.blocks[3].setOffsetX(- this.game.BLOCK_SIZE);
      this.blocks[3].setOffsetY(this.game.BLOCK_SIZE);
    }

    rotate1() {
      this.blocks[0].setOffsetX(this.game.BLOCK_SIZE);
      this.blocks[0].setOffsetY(this.game.BLOCK_SIZE);
      this.blocks[1].setOffsetX(this.game.BLOCK_SIZE);
      this.blocks[1].setOffsetY(2 * this.game.BLOCK_SIZE);
      this.blocks[2].setOffsetX(0);
      this.blocks[2].setOffsetY(this.game.BLOCK_SIZE);
      this.blocks[3].setOffsetX(0);
      this.blocks[3].setOffsetY(0);
    }

    rotate2() {
      this.blocks[0].setOffsetX(0);
      this.blocks[0].setOffsetY(2 * this.game.BLOCK_SIZE);
      this.blocks[1].setOffsetX(- this.game.BLOCK_SIZE);
      this.blocks[1].setOffsetY(2 * this.game.BLOCK_SIZE);
      this.blocks[2].setOffsetX(0);
      this.blocks[2].setOffsetY(this.game.BLOCK_SIZE);
      this.blocks[3].setOffsetX(this.game.BLOCK_SIZE);
      this.blocks[3].setOffsetY(this.game.BLOCK_SIZE);
    }

    rotate3() {
      this.blocks[0].setOffsetX(- this.game.BLOCK_SIZE);
      this.blocks[0].setOffsetY(this.game.BLOCK_SIZE);
      this.blocks[1].setOffsetX(- this.game.BLOCK_SIZE);
      this.blocks[1].setOffsetY(0);
      this.blocks[2].setOffsetX(0);
      this.blocks[2].setOffsetY(this.game.BLOCK_SIZE);
      this.blocks[3].setOffsetX(0);
      this.blocks[3].setOffsetY(2 * this.game.BLOCK_SIZE);
    }
  }

  // 01
  //  23
  class MinoZ extends Mino {
    constructor(canvas, game, minoStatus, minoConstant) {
      super(canvas, game, minoStatus, minoConstant);

      let blockFactory = this.game.blockFactory;
      this.pattern = 3;

      this.blocks.push(blockFactory.createBlock(this.pattern, - this.game.BLOCK_SIZE, 0));
      this.blocks.push(blockFactory.createBlock(this.pattern, 0, 0));
      this.blocks.push(blockFactory.createBlock(this.pattern, 0, this.game.BLOCK_SIZE));
      this.blocks.push(blockFactory.createBlock(this.pattern, this.game.BLOCK_SIZE, this.game.BLOCK_SIZE));
    }

    rotate0() {
      this.blocks[0].setOffsetX(- this.game.BLOCK_SIZE);
      this.blocks[0].setOffsetY(0);
      this.blocks[1].setOffsetX(0);
      this.blocks[1].setOffsetY(0);
      this.blocks[2].setOffsetX(0);
      this.blocks[2].setOffsetY(this.game.BLOCK_SIZE);
      this.blocks[3].setOffsetX(this.game.BLOCK_SIZE);
      this.blocks[3].setOffsetY(this.game.BLOCK_SIZE);
    }

    rotate1() {
      this.blocks[0].setOffsetX(this.game.BLOCK_SIZE);
      this.blocks[0].setOffsetY(0);
      this.blocks[1].setOffsetX(this.game.BLOCK_SIZE);
      this.blocks[1].setOffsetY(this.game.BLOCK_SIZE);
      this.blocks[2].setOffsetX(0);
      this.blocks[2].setOffsetY(this.game.BLOCK_SIZE);
      this.blocks[3].setOffsetX(0);
      this.blocks[3].setOffsetY(2 * this.game.BLOCK_SIZE);
    }

    rotate2() {
      this.blocks[0].setOffsetX(this.game.BLOCK_SIZE);
      this.blocks[0].setOffsetY(2 * this.game.BLOCK_SIZE);
      this.blocks[1].setOffsetX(0);
      this.blocks[1].setOffsetY(2 * this.game.BLOCK_SIZE);
      this.blocks[2].setOffsetX(0);
      this.blocks[2].setOffsetY(this.game.BLOCK_SIZE);
      this.blocks[3].setOffsetX(this.game.BLOCK_SIZE);
      this.blocks[3].setOffsetY(- this.game.BLOCK_SIZE);
    }

    rotate3() {
      this.blocks[0].setOffsetX(- this.game.BLOCK_SIZE);
      this.blocks[0].setOffsetY(2 * this.game.BLOCK_SIZE);
      this.blocks[1].setOffsetX(- this.game.BLOCK_SIZE);
      this.blocks[1].setOffsetY(this.game.BLOCK_SIZE);
      this.blocks[2].setOffsetX(0);
      this.blocks[2].setOffsetY(this.game.BLOCK_SIZE);
      this.blocks[3].setOffsetX(0);
      this.blocks[3].setOffsetY(0);
    }
  }

  // 0
  // 123
  class MinoJ extends Mino {
    constructor(canvas, game, minoStatus, minoConstant) {
      super(canvas, game, minoStatus, minoConstant);

      let blockFactory = this.game.blockFactory;
      this.pattern = 4;

      this.blocks.push(blockFactory.createBlock(this.pattern, - this.game.BLOCK_SIZE, 0));
      this.blocks.push(blockFactory.createBlock(this.pattern, - this.game.BLOCK_SIZE, this.game.BLOCK_SIZE));
      this.blocks.push(blockFactory.createBlock(this.pattern, 0, this.game.BLOCK_SIZE));
      this.blocks.push(blockFactory.createBlock(this.pattern, this.game.BLOCK_SIZE, this.game.BLOCK_SIZE));
    }

    rotate0() {
      this.blocks[0].setOffsetX(- this.game.BLOCK_SIZE);
      this.blocks[0].setOffsetY(0);
      this.blocks[1].setOffsetX(- this.game.BLOCK_SIZE);
      this.blocks[1].setOffsetY(this.game.BLOCK_SIZE);
      this.blocks[2].setOffsetX(0);
      this.blocks[2].setOffsetY(this.game.BLOCK_SIZE);
      this.blocks[3].setOffsetX(this.game.BLOCK_SIZE);
      this.blocks[3].setOffsetY(this.game.BLOCK_SIZE);
    }

    rotate1() {
      this.blocks[0].setOffsetX(this.game.BLOCK_SIZE);
      this.blocks[0].setOffsetY(0);
      this.blocks[1].setOffsetX(0);
      this.blocks[1].setOffsetY(0);
      this.blocks[2].setOffsetX(0);
      this.blocks[2].setOffsetY(this.game.BLOCK_SIZE);
      this.blocks[3].setOffsetX(0);
      this.blocks[3].setOffsetY(2 * this.game.BLOCK_SIZE);
    }

    rotate2() {
      this.blocks[0].setOffsetX(this.game.BLOCK_SIZE);
      this.blocks[0].setOffsetY(2 * this.game.BLOCK_SIZE);
      this.blocks[1].setOffsetX(this.game.BLOCK_SIZE);
      this.blocks[1].setOffsetY(this.game.BLOCK_SIZE);
      this.blocks[2].setOffsetX(0);
      this.blocks[2].setOffsetY(this.game.BLOCK_SIZE);
      this.blocks[3].setOffsetX(- this.game.BLOCK_SIZE);
      this.blocks[3].setOffsetY(this.game.BLOCK_SIZE);
    }

    rotate3() {
      this.blocks[0].setOffsetX(- this.game.BLOCK_SIZE);
      this.blocks[0].setOffsetY(2 * this.game.BLOCK_SIZE);
      this.blocks[1].setOffsetX(0);
      this.blocks[1].setOffsetY(2 * this.game.BLOCK_SIZE);
      this.blocks[2].setOffsetX(0);
      this.blocks[2].setOffsetY(this.game.BLOCK_SIZE);
      this.blocks[3].setOffsetX(0);
      this.blocks[3].setOffsetY(0);
    }
  }

  //   0
  // 321
  class MinoL extends Mino {
    constructor(canvas, game, minoStatus, minoConstant) {
      super(canvas, game, minoStatus, minoConstant);

      let blockFactory = this.game.blockFactory;
      this.pattern = 5;

      this.blocks.push(blockFactory.createBlock(this.pattern, this.game.BLOCK_SIZE, 0));
      this.blocks.push(blockFactory.createBlock(this.pattern, this.game.BLOCK_SIZE, this.game.BLOCK_SIZE));
      this.blocks.push(blockFactory.createBlock(this.pattern, 0, this.game.BLOCK_SIZE));
      this.blocks.push(blockFactory.createBlock(this.pattern, - this.game.BLOCK_SIZE, this.game.BLOCK_SIZE));
    }

    rotate0() {
      this.blocks[0].setOffsetX(this.game.BLOCK_SIZE);
      this.blocks[0].setOffsetY(0);
      this.blocks[1].setOffsetX(this.game.BLOCK_SIZE);
      this.blocks[1].setOffsetY(this.game.BLOCK_SIZE);
      this.blocks[2].setOffsetX(0);
      this.blocks[2].setOffsetY(this.game.BLOCK_SIZE);
      this.blocks[3].setOffsetX(- this.game.BLOCK_SIZE);
      this.blocks[3].setOffsetY(this.game.BLOCK_SIZE);
    }

    rotate1() {
      this.blocks[0].setOffsetX(this.game.BLOCK_SIZE);
      this.blocks[0].setOffsetY(2 * this.game.BLOCK_SIZE);
      this.blocks[1].setOffsetX(0);
      this.blocks[1].setOffsetY(2 * this.game.BLOCK_SIZE);
      this.blocks[2].setOffsetX(0);
      this.blocks[2].setOffsetY(this.game.BLOCK_SIZE);
      this.blocks[3].setOffsetX(0);
      this.blocks[3].setOffsetY(0);
    }

    rotate2() {
      this.blocks[0].setOffsetX(- this.game.BLOCK_SIZE);
      this.blocks[0].setOffsetY(2 * this.game.BLOCK_SIZE);
      this.blocks[1].setOffsetX(- this.game.BLOCK_SIZE);
      this.blocks[1].setOffsetY(this.game.BLOCK_SIZE);
      this.blocks[2].setOffsetX(0);
      this.blocks[2].setOffsetY(this.game.BLOCK_SIZE);
      this.blocks[3].setOffsetX(this.game.BLOCK_SIZE);
      this.blocks[3].setOffsetY(this.game.BLOCK_SIZE);
    }

    rotate3() {
      this.blocks[0].setOffsetX(- this.game.BLOCK_SIZE);
      this.blocks[0].setOffsetY(0);
      this.blocks[1].setOffsetX(0);
      this.blocks[1].setOffsetY(0);
      this.blocks[2].setOffsetX(0);
      this.blocks[2].setOffsetY(this.game.BLOCK_SIZE);
      this.blocks[3].setOffsetX(0);
      this.blocks[3].setOffsetY(2 * this.game.BLOCK_SIZE);
    }
  }

  //  0
  // 123
  class MinoT extends Mino {
    constructor(canvas, game, minoStatus, minoConstant) {
      super(canvas, game, minoStatus, minoConstant);

      let blockFactory = this.game.blockFactory;
      this.pattern = 6;

      this.blocks.push(blockFactory.createBlock(this.pattern, 0, 0));
      this.blocks.push(blockFactory.createBlock(this.pattern, - this.game.BLOCK_SIZE, this.game.BLOCK_SIZE));
      this.blocks.push(blockFactory.createBlock(this.pattern, 0, this.game.BLOCK_SIZE));
      this.blocks.push(blockFactory.createBlock(this.pattern, this.game.BLOCK_SIZE, this.game.BLOCK_SIZE));
    }

    rotate0() {
      this.blocks[0].setOffsetX(0);
      this.blocks[0].setOffsetY(0);
      this.blocks[1].setOffsetX(- this.game.BLOCK_SIZE);
      this.blocks[1].setOffsetY(this.game.BLOCK_SIZE);
      this.blocks[2].setOffsetX(0);
      this.blocks[2].setOffsetY(this.game.BLOCK_SIZE);
      this.blocks[3].setOffsetX(this.game.BLOCK_SIZE);
      this.blocks[3].setOffsetY(this.game.BLOCK_SIZE);
    }

    rotate1() {
      this.blocks[0].setOffsetX(this.game.BLOCK_SIZE);
      this.blocks[0].setOffsetY(this.game.BLOCK_SIZE);
      this.blocks[1].setOffsetX(0);
      this.blocks[1].setOffsetY(0);
      this.blocks[2].setOffsetX(0);
      this.blocks[2].setOffsetY(this.game.BLOCK_SIZE);
      this.blocks[3].setOffsetX(0);
      this.blocks[3].setOffsetY(2 * this.game.BLOCK_SIZE);
    }

    rotate2() {
      this.blocks[0].setOffsetX(0);
      this.blocks[0].setOffsetY(2 * this.game.BLOCK_SIZE);
      this.blocks[1].setOffsetX(this.game.BLOCK_SIZE);
      this.blocks[1].setOffsetY(this.game.BLOCK_SIZE);
      this.blocks[2].setOffsetX(0);
      this.blocks[2].setOffsetY(this.game.BLOCK_SIZE);
      this.blocks[3].setOffsetX(- this.game.BLOCK_SIZE);
      this.blocks[3].setOffsetY(this.game.BLOCK_SIZE);
    }

    rotate3() {
      this.blocks[0].setOffsetX(- this.game.BLOCK_SIZE);
      this.blocks[0].setOffsetY(this.game.BLOCK_SIZE);
      this.blocks[1].setOffsetX(0);
      this.blocks[1].setOffsetY(2 * this.game.BLOCK_SIZE);
      this.blocks[2].setOffsetX(0);
      this.blocks[2].setOffsetY(this.game.BLOCK_SIZE);
      this.blocks[3].setOffsetX(0);
      this.blocks[3].setOffsetY(0);
    }
  }

  class BlockFactory {
    constructor(canvas, game) {
      this.canvas = canvas;
      this.ctx - this.canvas.getContext('2d');

      this.game = game;
    }

    createBlock(pattern, x, y) {
      if (typeof pattern === 'undefined') {
        return new BlockEmpty(this.canvas, this.game, x, y);
      }

      if (pattern === 0) {
        return new BlockI(this.canvas, this.game, x, y);
      }

      if (pattern === 1) {
        return new BlockO(this.canvas, this.game, x, y);
      }

      if (pattern === 2) {
        return new BlockS(this.canvas, this.game, x, y);
      }

      if (pattern === 3) {
        return new BlockZ(this.canvas, this.game, x, y);
      }

      if (pattern === 4) {
        return new BlockJ(this.canvas, this.game, x, y);
      }

      if (pattern === 5) {
        return new BlockL(this.canvas, this.game, x, y);
      }

      if (pattern === 6) {
        return new BlockT(this.canvas, this.game, x, y);
      }
    }
  }

  class Block {
    constructor(canvas, game, offsetX, offsetY) {
      this.canvas = canvas;
      this.ctx = this.canvas.getContext('2d');

      this.game = game;

      this.offsetX = offsetX;
      this.offsetY = offsetY;

      this.x = 0;
      this.y = 0;

      this.color = "#fff";
    }

    getOffsetX() {
      return this.offsetX;
    }

    setOffsetX(offsetX) {
      this.offsetX = offsetX;
    }

    getOffsetY() {
      return this.offsetY;
    }

    setOffsetY(offsetY) {
      this.offsetY = offsetY;
    }

    getX() {
      return this.x;
    }

    getY() {
      return this.y;
    }

    setY(y) {
      this.y = y;
    }

    isMissed(mino) {
      let col = Math.floor((mino.getX() + this.offsetX) / this.game.BLOCK_SIZE);
      let row = Math.floor((mino.getY() + this.offsetY) / this.game.BLOCK_SIZE);
      
      if (row !== 0) {
        return false;
      }

      let thisBlock = this.game.areaBlocks[row][col];
      if (thisBlock instanceof BlockEmpty) {
        return false;
      } else {
        return true;
      }
    }

    isRotatable(mino) {
      let newX = mino.getX() + this.offsetX;
      let newY = mino.getY() + this.offsetY;

      let col = Math.floor(newX / this.game.BLOCK_SIZE);
      let row = Math.floor(newY / this.game.BLOCK_SIZE);

      if (col < 0 || this.game.COL_COUNT <= col) {
        return false;
      }

      if (this.game.ROW_COUNT <= row) {
        return false;
      }  

      let moveToBlock = this.game.areaBlocks[row][col];
      if (moveToBlock instanceof BlockEmpty) {
        return true;
      } else {
        return false;
      }
    }

    isMovable(mino) {
      let newX = mino.getX() + this.offsetX;
      let newY = mino.getY() + this.offsetY;

      let col = Math.floor(newX / this.game.BLOCK_SIZE);
      let row = Math.floor(newY / this.game.BLOCK_SIZE);

      if (col < 0 || this.game.COL_COUNT <= col) {
        return false;
      }

      let moveToBlock = this.game.areaBlocks[row][col];
      if (moveToBlock instanceof BlockEmpty) {
        return true;
      } else {
        return false;
      }
    }

    isUpdatable(mino) {
      let newX = mino.getX() + this.offsetX;
      let newY = mino.getY() + this.offsetY;

      let col = Math.floor(newX / this.game.BLOCK_SIZE);
      let row = Math.floor(newY / this.game.BLOCK_SIZE);

      if (this.game.ROW_COUNT <= row) {
        return false;
      }  

      let belowBlock = this.game.areaBlocks[row][col];
      if (belowBlock instanceof BlockEmpty) {
        return true;
      } else {
        return false;
      }
    }

    update(mino) {
      this.x = mino.getX() + this.offsetX;
      this.y = mino.getY() + this.offsetY;
    }

    draw() {
      let remainder = this.y % this.game.BLOCK_SIZE;
      let rounddownY = this.y - remainder;

      // border
      this.ctx.beginPath();
      this.ctx.fillStyle = '#eee';
      this.ctx.fillRect(this.x, rounddownY, this.game.BLOCK_SIZE, this.game.BLOCK_SIZE);
      this.ctx.fill();        

      this.ctx.beginPath();
      this.ctx.fillStyle = this.color;
      this.ctx.fillRect(this.x + this.game.BORDER_WIDTH, rounddownY + this.game.BORDER_WIDTH, this.game.BLOCK_SIZE - this.game.BORDER_WIDTH * 2, this.game.BLOCK_SIZE - this.game.BORDER_WIDTH * 2);
      this.ctx.fill();
    }
  }

  class BlockEmpty extends Block {
    constructor(canvas, game, x, y) {
      super(canvas, game, x, y);
    }

    draw() {
      // Do nothing
    }
  }

  // Skyblue
  class BlockI extends Block {
    constructor(canvas, game, x, y) {
      super(canvas, game, x, y);

      this.color = '#89bdde';
    }
  }

  // Yellow
  class BlockO extends Block {
    constructor(canvas, game, x, y) {
      super(canvas, game, x, y);

      this.color = '#f4d500';
    }
  }

  // Green
  class BlockS extends Block {
    constructor(canvas, game, x, y) {
      super(canvas, game, x, y);

      this.color = '#009A57';
    }
  }

  // Red
  class BlockZ extends Block {
    constructor(canvas, game, x, y) {
      super(canvas, game, x, y);

      this.color = '#df3447';
    }
  }

  // Blue
  class BlockJ extends Block {
    constructor(canvas, game, x, y) {
      super(canvas, game, x, y);

      this.color = '#0000cd';
    }
  }

  // Orange
  class BlockL extends Block {
    constructor(canvas, game, x, y) {
      super(canvas, game, x, y);

      this.color = '#ef810f';
    }
  }

  // Purple
  class BlockT extends Block {
    constructor(canvas, game, x, y) {
      super(canvas, game, x, y);

      this.color = '#a757a8';
    }
  }

  const canvas = document.querySelector('canvas');

  if (typeof canvas.getContext === 'undefined') {
    return;
  }

  new Game(canvas);
})();