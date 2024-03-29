import Field from './field';
import Fleet from './fleet';
import Ship from './ship';
import Computer from './computer';

const FIELD_SIZE = 10;

class Game {
  static gameOver = false;
  static placeShipDirection = null;
  static placeShipType = '';
  static placeShipCoords = [];
  static availableShips = [
    'aerocarrier',
    'submarine',
    'submarine2',
    'galeon',
    'galeon2',
    'galeon3',
    'boat',
    'boat2',
    'boat3',
    'boat4',
  ];
  static playerId = 0;
  static computerId = 1;
  static cellType = {
    empty: 0,
    ship: 1,
    miss: 2,
    hit: 3,
    sunk: 4,
  };

  constructor() {
    this.fleetClickHandler = this.fleetClickHandler.bind(this);
    this.shootHandler = this.shootHandler.bind(this);
    this.placingHandler = this.placingHandler.bind(this);
    this.positioningMouseoverHandler =
      this.positioningMouseoverHandler.bind(this);
    this.positioningMouseoutHandler =
      this.positioningMouseoutHandler.bind(this);
    this.toggleRotationHandler = this.toggleRotationHandler.bind(this);
    this.startGameHandler = this.startGameHandler.bind(this);

    this.init();
  }

  init() {
    this.playerField = new Field(FIELD_SIZE);
    this.computerField = new Field(FIELD_SIZE);
    this.playerFleet = new Fleet(this.playerField, Game.playerId);
    this.computerFleet = new Fleet(this.computerField, Game.computerId);
    this.computer = new Computer(this);
    this.readyToPlay = false;
    this.placingOnGrid = false;

    this.drawBattlefields();
    this.setupEventListeneres();
    this.computerFleet.placeComputerShipsRandomly();
  }

  setupEventListeneres() {
    const computerField = document.querySelector('.computer-player');
    const humanField = document.querySelector('.human-player');
    const fleetList = document.querySelector('.fleet-list');

    computerField.addEventListener('click', (e) => {
      if (e.target.classList.contains('grid-cell')) {
        this.shootHandler(e);
      }
    });

    humanField.addEventListener('click', (e) => {
      if (e.target.classList.contains('grid-cell')) {
        this.placingHandler(e);
      }
    });
    humanField.addEventListener('mouseover', (e) => {
      if (e.target.classList.contains('grid-cell')) {
        this.positioningMouseoverHandler(e);
      }
    });
    humanField.addEventListener('mouseout', (e) => {
      if (e.target.classList.contains('grid-cell')) {
        this.positioningMouseoutHandler(e);
      }
    });

    fleetList.addEventListener('click', (e) => {
      if (Game.availableShips.includes(e.target.id)) {
        this.fleetClickHandler(e);
      }
    });

    document
      .getElementById('rotate-button')
      .addEventListener('click', this.toggleRotationHandler);
    document
      .getElementById('start-game')
      .addEventListener('click', this.startGameHandler);
  }

  drawBattlefields() {
    const fieldContainers = document.querySelectorAll('.grid');

    for (let i = 0; i < fieldContainers.length; i++) {
      for (let x = 0; x < FIELD_SIZE; x++) {
        for (let y = 0; y < FIELD_SIZE; y++) {
          let cell = document.createElement('div');
          cell.setAttribute('data-x', x);
          cell.setAttribute('data-y', y);
          cell.classList.add('grid-cell');
          fieldContainers[i].appendChild(cell);
        }
      }
    }
  }

  fleetClickHandler(event) {
    const fleetList = document.querySelectorAll('.fleet-list li');

    for (let ship of fleetList) {
      ship.classList.remove('placing');
    }

    Game.placeShipType = event.target.getAttribute('id');
    document.getElementById(Game.placeShipType).classList.add('placing');
    Game.placeShipDirection = parseInt(
      document.getElementById('rotate-button').getAttribute('data-direction'),
      10
    );

    this.placingOnGrid = true;
  }

  positioningMouseoverHandler(event) {
    if (!this.placingOnGrid) return;

    const x = parseInt(event.target.getAttribute('data-x'), 10);
    const y = parseInt(event.target.getAttribute('data-y'), 10);
    const fleetList = this.playerFleet.fleetList;

    for (let ship of fleetList) {
      if (
        Game.placeShipType === ship.type &&
        ship.isPlacementAllowed(x, y, Game.placeShipDirection)
      ) {
        ship.create(x, y, Game.placeShipDirection, true);
        Game.placeShipCoords = ship.getAllShipCells();

        for (let coord of Game.placeShipCoords) {
          let cell = document.querySelector(
            `[data-x="${coord.x}"][data-y="${coord.y}"]`
          );

          if (!cell.classList.contains('grid-ship')) {
            cell.classList.add('grid-ship');
          }
        }
      }
    }
  }

  positioningMouseoutHandler(event) {
    if (!this.placingOnGrid) return;

    for (let coord of Game.placeShipCoords) {
      let cell = document.querySelector(
        `[data-x="${coord.x}"][data-y="${coord.y}"]`
      );
      cell.classList.remove('grid-ship');
    }
  }

  placingHandler(event) {
    if (!this.placingOnGrid) return;

    const x = parseInt(event.target.getAttribute('data-x'), 10);
    const y = parseInt(event.target.getAttribute('data-y'), 10);
    const successful = this.playerFleet.placeShip(
      x,
      y,
      Game.placeShipDirection,
      Game.placeShipType
    );

    if (!successful) return;

    document.getElementById(Game.placeShipType).classList.add('placed');
    Game.placeShipDirection = null;
    Game.placeShipType = '';
    Game.placeShipCoords = [];
    this.placingOnGrid = false;

    const isAllShipsPlaced = this.isAllShipsPlaced();
    if (!isAllShipsPlaced) return;

    document.getElementById('rotate-button').classList.add('hidden');
    document.getElementById('start-game').classList = 'highlight';
  }

  isAllShipsPlaced() {
    const fleetList = document.querySelectorAll('.fleet-list li');

    for (let ship of fleetList) {
      if (!ship.classList.contains('placed')) return false;
    }

    return true;
  }

  toggleRotationHandler(event) {
    const direction = parseInt(event.target.getAttribute('data-direction'), 10);

    if (direction === Ship.verticalDirectionId) {
      event.target.setAttribute('data-direction', '1');
      Game.placeShipDirection = Ship.horizontalDirectionId;
      return;
    }
    event.target.setAttribute('data-direction', '0');
    Game.placeShipDirection = Ship.verticalDirectionId;
  }

  startGameHandler(event) {
    this.readyToPlay = true;
    document.getElementById('fleet-sidebar').classList.add('hidden');
  }

  shoot(x, y, targetPlayer) {
    let targetGrid = null;
    let targetFleet = null;
    let result = null;

    if (targetPlayer === Game.playerId) {
      targetGrid = this.playerField;
      targetFleet = this.playerFleet;
    } else {
      targetGrid = this.computerField;
      targetFleet = this.computerFleet;
    }

    if (targetGrid.isDamagedShip(x, y) || targetGrid.isMiss(x, y)) {
      return result;
    }

    if (targetGrid.isUndamagedShip(x, y)) {
      targetGrid.updateCell(x, y, 'hit', targetPlayer);
      result = targetFleet.findShipByCoords(x, y).incrementDamage();
      this.checkForGameOver();

      if (targetPlayer === Game.playerId && result === Game.cellType.hit) {
        Computer.damagedShipCoordsX.push(x);
        Computer.damagedShipCoordsY.push(y);
      }

      return result;
    }

    targetGrid.updateCell(x, y, 'miss', targetPlayer);
    result = Game.cellType.miss;
    return result;
  }

  shootHandler(event) {
    const x = parseInt(event.target.getAttribute('data-x'), 10);
    const y = parseInt(event.target.getAttribute('data-y'), 10);
    const result = this.readyToPlay ? this.shoot(x, y, Game.computerId) : null;

    if (!Game.gameOver && result === Game.cellType.miss) {
      this.computer.shoot();
    }
  }

  checkForGameOver() {
    if (this.computerFleet.isAllShipsSunk()) {
      alert('Congratulations, you have won!');
      Game.gameOver = true;
    } else if (this.playerFleet.isAllShipsSunk()) {
      alert('You have lost. Computer sunk all your ships');
      Game.gameOver = true;
    }
  }
}

export default Game;
