import Game from './game';

class Ship {
  static verticalDirectionId = 0;
  static horizontalDirectionId = 1;

  constructor(type, playerGrid, player) {
    this.damage = 0;
    this.type = type;
    this.playerGrid = playerGrid;
    this.player = player;

    switch (this.type) {
      case Game.availableShips[0]:
        this.shipLength = 4;
        break;
      case Game.availableShips[1]:
        this.shipLength = 3;
        break;
      case Game.availableShips[2]:
        this.shipLength = 3;
        break;
      case Game.availableShips[3]:
        this.shipLength = 2;
        break;
      case Game.availableShips[4]:
        this.shipLength = 2;
        break;
      case Game.availableShips[5]:
        this.shipLength = 2;
        break;
      case Game.availableShips[6]:
        this.shipLength = 1;
        break;
      case Game.availableShips[7]:
        this.shipLength = 1;
        break;
      case Game.availableShips[8]:
        this.shipLength = 1;
        break;
      case Game.availableShips[9]:
        this.shipLength = 1;
        break;
    }

    this.maxDamage = this.shipLength;
    this.sunk = false;
  }

  isPlacingOnExistingShip(x, y, i, direction) {
    const cells = this.playerGrid.cells;
    const ship = Game.cellType.ship;

    if (direction === Ship.verticalDirectionId) {
      if (
        cells[x + i][y] === ship ||
        (y + i + 1 < 10 && cells[x][y + 1] === ship) ||
        (y + i - 1 >= 0 && cells[x][y - 1] === ship) ||
        (x + i + 1 < 10 && cells[x + i + 1][y] === ship) ||
        (x + i + 1 < 10 && y + 1 < 10 && cells[x + i + 1][y + 1] === ship) ||
        (x + i + 1 < 10 && y - 1 >= 0 && cells[x + i + 1][y - 1] === ship) ||
        (x + i - 1 >= 0 && cells[x + i - 1][y] === ship) ||
        (x + i - 1 >= 0 && y + 1 < 10 && cells[x + i - 1][y + 1] === ship) ||
        (x + i - 1 >= 0 && y - 1 >= 0 && cells[x + i - 1][y - 1] === ship)
      ) {
        return true;
      }
    } else {
      if (
        cells[x][y + i] === ship ||
        (x + 1 < 10 && cells[x + 1][y] === ship) ||
        (x - 1 >= 0 && cells[x - 1][y] === ship) ||
        (y + i + 1 < 10 && cells[x][y + i + 1] === ship) ||
        (y + i + 1 < 10 && x + 1 < 10 && cells[x + 1][y + i + 1] === ship) ||
        (y + i + 1 < 10 && x - 1 >= 0 && cells[x - 1][y + i + 1] === ship) ||
        (y + i - 1 >= 0 && cells[x][y + i - 1] === ship) ||
        (y + i - 1 >= 0 && x + 1 < 10 && cells[x + 1][y + i - 1] === ship) ||
        (y + i - 1 >= 0 && x - 1 >= 0 && cells[x - 1][y + i - 1] === ship)
      ) {
        return true;
      }
    }

    return false;
  }

  isPlacementAllowed(x, y, direction) {
    if (!this.isWithinBounds(x, y, direction)) return false;

    for (let i = 0; i < this.shipLength; i++) {
      if (this.isPlacingOnExistingShip(x, y, i, direction)) {
        return false;
      }
    }

    return true;
  }

  isWithinBounds(x, y, direction) {
    if (direction === Ship.verticalDirectionId) {
      return x + this.shipLength <= 10;
    }

    return y + this.shipLength <= 10;
  }

  getAllShipCells() {
    let resultObject = [];
    for (var i = 0; i < this.shipLength; i++) {
      if (this.direction === Ship.verticalDirectionId) {
        resultObject[i] = { x: this.xPosition + i, y: this.yPosition };
      } else {
        resultObject[i] = { x: this.xPosition, y: this.yPosition + i };
      }
    }
    return resultObject;
  }

  create(x, y, direction, temporary) {
    this.xPosition = x;
    this.yPosition = y;
    this.direction = direction;

    if (temporary) return;

    for (var i = 0; i < this.shipLength; i++) {
      if (this.direction === Ship.verticalDirectionId) {
        this.playerGrid.cells[x + i][y] = Game.cellType.ship;
      } else {
        this.playerGrid.cells[x][y + i] = Game.cellType.ship;
      }
    }
  }

  isSunk() {
    return this.damage >= this.maxDamage;
  }

  sinkShip() {
    this.damage = this.maxDamage;
    this.sunk = true;

    const allCells = this.getAllShipCells();

    for (let i = 0; i < this.shipLength; i++) {
      this.playerGrid.updateCell(
        allCells[i].x,
        allCells[i].y,
        'sunk',
        this.player
      );
    }
  }

  incrementDamage() {
    this.damage++;

    if (!this.isSunk()) return Game.cellType.hit;

    this.sinkShip();
    return Game.cellType.sunk;
  }
}

export default Ship;
