import { getRandom } from './utilities';
import Ship from './ship';
import Game from './game';

class Fleet {
  constructor(playerGrid, player) {
    this.numShips = Game.availableShips.length;
    this.playerGrid = playerGrid;
    this.player = player;
    this.fleetList = [];
    this.populate();
  }

  populate() {
    for (let i = 0; i < this.numShips; i++) {
      this.fleetList.push(
        new Ship(Game.availableShips[i], this.playerGrid, this.player)
      );
    }
  }

  placeShip(x, y, direction, shipType) {
    let shipCoords = null;

    for (let ship of this.fleetList) {
      if (shipType !== ship.type || !ship.isPlacementAllowed(x, y, direction)) {
        continue;
      }

      ship.create(x, y, direction, false);
      shipCoords = ship.getAllShipCells();

      for (let shipCoord of shipCoords) {
        this.playerGrid.updateCell(
          shipCoord.x,
          shipCoord.y,
          'ship',
          this.player
        );
      }
      return true;
    }
    return false;
  }

  placeComputerShipsRandomly() {
    let x = null;
    let y = null;
    let direction = null;
    let illegalPlacement = null;

    for (let ship of this.fleetList) {
      illegalPlacement = true;

      while (illegalPlacement) {
        x = getRandom(0, 9);
        y = getRandom(0, 9);
        direction = getRandom(0, 1);

        if (!ship.isPlacementAllowed(x, y, direction)) continue;

        ship.create(x, y, direction, false);
        illegalPlacement = false;
      }
    }
  }

  findShipByCoords(x, y) {
    for (let ship of this.fleetList) {
      const isVerticalFound =
        ship.direction === Ship.verticalDirectionId &&
        y === ship.yPosition &&
        x >= ship.xPosition &&
        x < ship.xPosition + ship.shipLength;
      const isHorizontalFound =
        ship.direction === Ship.horizontalDirectionId &&
        x === ship.xPosition &&
        y >= ship.yPosition &&
        y < ship.yPosition + ship.shipLength;

      if (isVerticalFound || isHorizontalFound) return ship;
    }
    return null;
  }

  isAllShipsSunk() {
    return !this.fleetList.some((ship) => ship.sunk === false);
  }
}

export default Fleet;
