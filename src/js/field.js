import Game from './game';

class Field {
  constructor(size) {
    this.size = size;
    this.cells = [];
    this.init();
  }

  init() {
    for (let i = 0; i < this.size; i++) {
      let row = [];
      this.cells[i] = row;

      for (let j = 0; j < this.size; j++) {
        row.push(Game.cellType.empty);
      }
    }
  }

  updateCell(x, y, type, targetPlayer) {
    const player =
      targetPlayer === Game.playerId ? 'human-player' : 'computer-player';

    this.cells[x][y] = Game.cellType[type];
    document
      .querySelector(`.${player} [data-x="${x}"][data-y="${y}"]`)
      .classList.add('grid-cell', `grid-${type}`);
  }

  isMiss(x, y) {
    return this.cells[x][y] === Game.cellType.miss;
  }

  isUndamagedShip(x, y) {
    return this.cells[x][y] === Game.cellType.ship;
  }

  isDamagedShip(x, y) {
    return (
      this.cells[x][y] === Game.cellType.hit ||
      this.cells[x][y] === Game.cellType.sunk
    );
  }
}

export default Field;
