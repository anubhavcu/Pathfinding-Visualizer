import React, { Component } from "react";

import PathfindingVisualizer from "./PathfindingVisualizer/PathfindingVisualizer";
import NavBar from "./PathfindingVisualizer/NavBar";
import "./App.css";
import { dijkstra, getNodesInShortestPathOrder } from "./algorithms/dijkstra";
// import {
//   dijkstraToBomb,
//   getNodesInShortestPathOrderWithBomb
// } from "./algorithms/dijkstraWithBomb";
import { astar, getNodesInShortestPathOrderAstar } from "./algorithms/astar";
import { recursiveDivision } from "./mazeAlgorithms/recursiveDivision";
import { staircaseMaze } from "./mazeAlgorithms/staircaseMaze";
// import { staircaseMaze } from "./mazeAlgorithms/staircase";

let NUMBER_OF_ROWS = 22,
  NUMBER_OF_COLS = 56;
let START_NODE_ROW = 10,
  START_NODE_COL = 10,
  FINISH_NODE_ROW = 10,
  FINISH_NODE_COL = 40,
  BOMB_NODE_ROW = 18,
  BOMB_NODE_COL = 25;
let startNode = {
  row: START_NODE_ROW,
  col: START_NODE_COL
};
let finishNode = {
  row: FINISH_NODE_ROW,
  col: FINISH_NODE_COL
};
let bombNode = {
  row: BOMB_NODE_ROW,
  col: BOMB_NODE_COL,
  status: false
};
let bomb = false;
let draggingStart = false,
  draggingFinish = false,
  draggingBomb = false;
export class App extends Component {
  state = {
    grid: [],
    mouseIsPressed: false
  };
  getWindowSize() {
    // let height = window.screen.availHeight;
    // let height = window.screen.height;
    // let width = window.screen.availWidth;
    // let width = window.screen.width;
    // const width =
    //   window.innerWidth ||
    //   document.documentElement.clientWidth ||
    //   document.body.clientWidth;
    // const height =
    //   window.innerHeight ||
    //   document.documentElement.clientHeight ||
    //   document.body.clientHeight;
    const height = window.innerHeight;
    const width = window.innerWidth;
    console.log(height, width);
    if (height > 900 || width > 1800) {
      NUMBER_OF_ROWS = 30;
      NUMBER_OF_COLS = 65;
      START_NODE_ROW = 15;
      START_NODE_COL = 10;
      FINISH_NODE_ROW = 15;
      FINISH_NODE_COL = 55;
      BOMB_NODE_ROW = 25;
      BOMB_NODE_COL = 32;
      startNode.row = START_NODE_ROW;
      startNode.col = START_NODE_COL;
      finishNode.row = FINISH_NODE_ROW;
      finishNode.col = FINISH_NODE_COL;
      bombNode.row = BOMB_NODE_ROW;
      bombNode.col = BOMB_NODE_COL;
    } else if (
      (height >= 820 && height < 900) ||
      (width >= 1400 && width < 1800)
    ) {
      NUMBER_OF_ROWS = 22;
      NUMBER_OF_COLS = 56;
      START_NODE_ROW = 10;
      START_NODE_COL = 10;
      FINISH_NODE_ROW = 10;
      FINISH_NODE_COL = 40;
      BOMB_NODE_ROW = 18;
      BOMB_NODE_COL = 25;
      startNode.row = START_NODE_ROW;
      startNode.col = START_NODE_COL;
      finishNode.row = FINISH_NODE_ROW;
      finishNode.col = FINISH_NODE_COL;
      bombNode.row = BOMB_NODE_ROW;
      bombNode.col = BOMB_NODE_COL;
    } else {
      NUMBER_OF_ROWS = 18;
      NUMBER_OF_COLS = 42;
      START_NODE_ROW = 8;
      START_NODE_COL = 5;
      FINISH_NODE_ROW = 8;
      FINISH_NODE_COL = 35;
      BOMB_NODE_ROW = 12;
      BOMB_NODE_COL = 18;
      startNode.row = START_NODE_ROW;
      startNode.col = START_NODE_COL;
      finishNode.row = FINISH_NODE_ROW;
      finishNode.col = FINISH_NODE_COL;
      bombNode.row = BOMB_NODE_ROW;
      bombNode.col = BOMB_NODE_COL;
    }
  }
  componentDidMount() {
    this.getWindowSize();

    const grid = this.getInitialGrid();
    // console.log(grid);
    this.setState({ grid });
  }
  //mouse is pressed and not lifted up
  handleMouseDown = (row, col) => {
    const node = {
      row: row,
      col: col
    };
    if (node.row === startNode.row && node.col === startNode.col) {
      const newGrid = this.getNewGridWithStartNodeToggled(
        this.state.grid,
        row,
        col
      );
      // we don't want to create walls when we are dragging the start/finish node
      //mouseIsPressed is set to false so that onMouseEnter doesn't trigger
      this.setState({ grid: newGrid, mouseIsPressed: false });
      draggingStart = true;
    } else if (node.row === finishNode.row && node.col === finishNode.col) {
      const newGrid = this.getNewGridWithFinishNodeToggled(
        this.state.grid,
        row,
        col
      );
      this.setState({ grid: newGrid, mouseIsPressed: false });
      draggingFinish = true;
    } else if (
      node.row === bombNode.row &&
      node.col === bombNode.col &&
      bombNode.status //checking with status so it triggers only when addBomb is clicked else it will create a wall on that node
    ) {
      const newGrid = this.getNewGridWithBombNodeToggled(
        this.state.grid,
        row,
        col
      );
      this.setState({ grid: newGrid, mouseIsPressed: false });
      draggingBomb = true;
    } else {
      const newGrid = this.getNewGridWithWallToggled(this.state.grid, row, col);
      this.setState({ grid: newGrid, mouseIsPressed: true });
    }
    // console.log(node.row === startNode.row && node.col === startNode.col);
  };
  //hovering over an element
  //we want walls to be created when mouse is pressed and then dragged
  //**mouseEnter will won't work when we clicked start/finish node, as we are setting
  //mouseIsPressed as false in onMouseDown function(on the start/finish node)

  handleMouseEnter = (row, col) => {
    if (!this.state.mouseIsPressed) return;

    // if (!draggingStart || !draggingFinish) {
    const newGrid = this.getNewGridWithWallToggled(this.state.grid, row, col);
    this.setState({ grid: newGrid });
  };
  //when pressed mouse button is released
  handleMouseUp = (row, col) => {
    if (draggingStart) {
      const newGrid = this.getNewGridWithStartNodeToggled(
        this.state.grid,
        row,
        col
      );
      this.setState({ grid: newGrid });
      // draggingStart = false;
    } else if (draggingFinish) {
      const newGrid = this.getNewGridWithFinishNodeToggled(
        this.state.grid,
        row,
        col
      );
      this.setState({ grid: newGrid });
      // draggingFinish = false;
    } else if (draggingBomb) {
      const newGrid = this.getNewGridWithBombNodeToggled(
        this.state.grid,
        row,
        col
      );
      this.setState({ grid: newGrid });
    }
    this.setState({ mouseIsPressed: false });
    //resetting the dragging start/finish when mouse is lifted up
    draggingStart = false;
    draggingFinish = false;
    draggingBomb = false;
  };
  getNewGridWithBombNodeToggled = (grid, row, col) => {
    // console.log("bom node toggle");

    const newGrid = grid.slice();
    // console.log(newGrid);
    const node = newGrid[row][col];
    // console.log(node);
    const newNode = {
      ...node,
      isBomb: !node.isBomb,
      isWall: false
    };
    const element = document.getElementById(
      `node-${bombNode.row}-${bombNode.col}`
    );
    // const elementNew = document.getElementById(`node-${newNode.row}-${newNode.col}`)
    element.classList.remove("node-bomb");
    // element.classList.remove("node-wall");
    newGrid[row][col] = newNode;
    bombNode.row = row;
    bombNode.col = col;
    //adding className to new node (was working fine without this also), check it later
    // const newElement = document.getElementById(
    //   `node-${bombNode.row}-${bombNode.col}`
    // );
    // newElement.className = "node node-bomb";
    return newGrid;
  };
  getNewGridWithStartNodeToggled = (grid, row, col) => {
    const newGrid = grid.slice();
    const node = newGrid[row][col];
    const newNode = {
      ...node,
      isStart: !node.isStart,
      //maybe due to mouse click problem wall is set to true and we are not getting anything
      //in the visitedNodesInOrder from the dijkstra
      // *isWall is set to false also bcoz, in case we put walls first and then move the start/finish node on that wall

      isWall: false
      // distance: Infinity
      //distance setting to infinity not working, alternative is clearPath function
    };
    newGrid[row][col] = newNode;
    startNode.row = row;
    startNode.col = col;
    return newGrid;
  };
  getNewGridWithFinishNodeToggled = (grid, row, col) => {
    const newGrid = grid.slice();
    const node = newGrid[row][col];
    const newNode = {
      ...node,
      isFinish: !node.isFinish,
      isWall: false
      // distance: Infinity
    };
    newGrid[row][col] = newNode;
    finishNode.row = row;
    finishNode.col = col;
    return newGrid;
  };
  //changing the wall state
  getNewGridWithWallToggled = (grid, row, col) => {
    // if (row !== bombNode.row && col !== bombNode.col) {
    const newGrid = grid.slice();
    const node = newGrid[row][col];

    const newNode = {
      ...node,
      isWall: !node.isWall
      // isBomb: node.isBomb
    };
    newGrid[row][col] = newNode;
    return newGrid;
    // }
  };
  getInitialGrid = () => {
    let grid = [];
    for (let row = 0; row < NUMBER_OF_ROWS; row++) {
      let currentRow = [];
      for (let col = 0; col < NUMBER_OF_COLS; col++) {
        currentRow.push(this.createNode(col, row));
      }
      grid.push(currentRow);
    }
    return grid;
  };
  createNode = (col, row) => {
    return {
      isVisited: false,
      col,
      row,
      isStart: row === START_NODE_ROW && col === START_NODE_COL,
      isFinish: row === FINISH_NODE_ROW && col === FINISH_NODE_COL,
      distance: Infinity,
      isWall: false,
      previousNode: null,
      isBomb: false
      // isBomb: row === BOMB_NODE_ROW && col === BOMB_NODE_COL
      // isBomb: this.bombNode.status
    };
  };

  animateDijsktra = (
    visitedNodesInOrder,
    nodesInShortestPathOrder,
    bomb,
    nodesInShortestPathOrderWithBomb
  ) => {
    for (let i = 0; i <= visitedNodesInOrder.length; i++) {
      if (i === visitedNodesInOrder.length) {
        setTimeout(() => {
          if (!bomb) {
            //no bomb
            this.animateShortestPath(nodesInShortestPathOrder);
          } else {
            //bomb is present
            this.animateShortestPath(nodesInShortestPathOrderWithBomb);
            // return;
          }
        }, 10 * i);
        return;
      }
      setTimeout(() => {
        const node = visitedNodesInOrder[i];
        //if statement to avoid coloring of start and finish node
        if (!(node.isStart || node.isFinish || node.isBomb)) {
          document.getElementById(`node-${node.row}-${node.col}`).className =
            "node node-visited";
        }
        // bomb();
      }, 10 * i);
    }
  };
  animateShortestPath = nodesInShortestPathOrder => {
    for (let i = 0; i < nodesInShortestPathOrder.length; i++) {
      setTimeout(() => {
        const node = nodesInShortestPathOrder[i];
        if (!(node.isStart || node.isFinish || node.isBomb)) {
          document.getElementById(`node-${node.row}-${node.col}`).className =
            "node node-shortest-path";
        }
        if (i === nodesInShortestPathOrder.length - 1) {
          this.reEnableButtons();
          this.enableGrid();
        }
      }, 50 * i);
    }
  };

  animateDijsktraWithBomb = (
    newVisitedNodesInOrder,
    newNodesInShortestPathOrder0,
    newStart,
    newFinish
  ) => {
    for (let i = 0; i <= newVisitedNodesInOrder.length; i++) {
      if (i === newVisitedNodesInOrder.length) {
        setTimeout(() => {
          const { grid } = this.state;
          const visitedNodesInOrder = dijkstra(grid, newStart, newFinish);
          const nodesInShortestPathOrder1 = getNodesInShortestPathOrder(
            newFinish
          );
          const nodesInShortestPathOrder = [
            ...newNodesInShortestPathOrder0,
            ...nodesInShortestPathOrder1
          ];
          this.animateDijsktra(
            visitedNodesInOrder,
            nodesInShortestPathOrder1,
            true,
            nodesInShortestPathOrder
          );
        }, 10 * i);
        return;
      }
      setTimeout(() => {
        const node = newVisitedNodesInOrder[i];
        //if statement to avoid coloring of start and finish node
        if (!(node.isStart || node.isFinish || node.isBomb)) {
          document.getElementById(`node-${node.row}-${node.col}`).className =
            "node node-bomb-visited";
        }
      }, 10 * i);
    }
  };

  visualizeDijkstra = () => {
    //just to make sure that when visualize dijkstra button is clicked path is cleared so that in case we move the start Node without clearing the board algorithm starts from a new startPoint
    //*if we don't clearPath dijkstra algorithm will start from the node whose distance is minimum and in the algorithms we have set the distance of startNode as 0(initially), so when we don't call clearPath function(in which we reset all the distance back to Infinity), and move the startNode to a new Point,visualization starts from the previous node only.
    this.clearPath();
    this.disableButtons();
    this.disableGrid();
    // console.log(startNode, finishNode);
    const { grid } = this.state;
    let bombIsPresent = false;
    // let bombNode;
    for (const row of grid) {
      for (const node of row) {
        if (node.isBomb) {
          bombIsPresent = true;
        }
      }
    }
    const finish = grid[finishNode.row][finishNode.col];
    if (!bombIsPresent) {
      // const startNode = grid[START_NODE_ROW][START_NODE_COL];
      const start = grid[startNode.row][startNode.col];
      // const finishNode = grid[FINISH_NODE_ROW][FINISH_NODE_COL];
      const visitedNodesInOrder = dijkstra(grid, start, finish);
      const nodesInShortestPathOrder = getNodesInShortestPathOrder(finish);
      this.animateDijsktra(
        visitedNodesInOrder,
        nodesInShortestPathOrder,
        false,
        null
      );
    } else {
      const bombNode1 = grid[bombNode.row][bombNode.col];
      const start = grid[startNode.row][startNode.col];
      const visitedNodesInOrder = dijkstra(grid, start, bombNode1);

      const nodesInShortestPathOrder = getNodesInShortestPathOrder(bombNode1);
      this.animateDijsktraWithBomb(
        visitedNodesInOrder,
        nodesInShortestPathOrder,
        bombNode1,
        finish
      );
    }
  };

  clearBoard = () => {
    this.removeBomb();
    const { grid } = this.state;
    const newGrid = grid.slice();
    // console.log(newGrid[startNode.row][startNode.col]);
    for (let i = 0; i < newGrid.length; i++) {
      for (let j = 0; j < newGrid[i].length; j++) {
        // console.log(newGrid[i][j]);
        const element = document.getElementById(`node-${i}-${j}`);
        element.classList.remove("node-visited");
        element.classList.remove("node-shortest-path");
        // element.classList.remove("node-visiting-bomb");
        element.classList.remove("node-bomb-visited");
        //clearing class node-wall is optional(working fine otherwise also)
        element.classList.remove("node-wall");

        newGrid[i][j].isVisited = false;
        newGrid[i][j].distance = Infinity;
        newGrid[i][j].isWall = false;
        newGrid[i][j].previousNode = null;
      }
    }
    this.setState({ grid: newGrid });
  };
  clearPath = () => {
    // console.log(startNode, finishNode);
    const { grid } = this.state;
    const newGrid = grid.slice();
    // console.log(newGrid[startNode.row][startNode.col]);
    for (let i = 0; i < newGrid.length; i++) {
      for (let j = 0; j < newGrid[i].length; j++) {
        // console.log(newGrid[i][j]);
        const element = document.getElementById(`node-${i}-${j}`);
        element.classList.remove("node-visited");
        element.classList.remove("node-shortest-path");
        element.classList.remove("node-bomb-visited");
        newGrid[i][j].isVisited = false;
        newGrid[i][j].distance = Infinity;
        newGrid[i][j].previousNode = null;
      }
    }
    this.setState({ grid: newGrid });
  };
  animateAstar = (
    visitedNodesInOrder,
    nodesInShortestPathOrder,
    bomb,
    nodesInShortestPathOrderWithBomb
  ) => {
    for (let i = 0; i <= visitedNodesInOrder.length; i++) {
      if (i === visitedNodesInOrder.length) {
        setTimeout(() => {
          if (!bomb) {
            //no bomb
            this.animateShortestPath(nodesInShortestPathOrder);
          } else {
            this.animateShortestPath(nodesInShortestPathOrderWithBomb);
          }
        }, 10 * i);
        return;
      }
      setTimeout(() => {
        const node = visitedNodesInOrder[i];
        //if statement to avoid coloring of start and finish node
        if (!(node.isStart || node.isFinish || node.isBomb)) {
          document.getElementById(`node-${node.row}-${node.col}`).className =
            "node node-visited";
          // this.persistColor();
        }
      }, 10 * i);
    }
  };
  animateAstarWithBomb = (
    newVisitedNodesInOrder,
    newNodesInShortestPathOrder0,
    newStart,
    newFinish
  ) => {
    for (let i = 0; i <= newVisitedNodesInOrder.length; i++) {
      if (i === newVisitedNodesInOrder.length) {
        setTimeout(() => {
          const { grid } = this.state;
          const visitedNodesInOrder = astar(grid, newStart, newFinish);
          const nodesInShortestPathOrder1 = getNodesInShortestPathOrderAstar(
            newFinish
          );
          const nodesInShortestPathOrder = [
            ...newNodesInShortestPathOrder0,
            ...nodesInShortestPathOrder1
          ];
          // console.log("shortest path", nodesInShortestPathOrder);

          this.animateAstar(
            visitedNodesInOrder,
            nodesInShortestPathOrder1,
            true,
            nodesInShortestPathOrder
          );
        }, 10 * i);
        return;
      }
      setTimeout(() => {
        const node = newVisitedNodesInOrder[i];
        //if statement to avoid coloring of start and finish node
        if (!(node.isStart || node.isFinish || node.isBomb)) {
          document.getElementById(`node-${node.row}-${node.col}`).className =
            "node node-bomb-visited";
        }
      }, 10 * i);
    }
  };
  visualizeAstar = () => {
    //disabling all buttons while visualization
    this.disableButtons();
    this.disableGrid();
    this.clearPath();
    const { grid } = this.state;
    let bombIsPresent = false;
    // let bombNode;
    for (const row of grid) {
      for (const node of row) {
        if (node.isBomb) {
          bombIsPresent = true;
        }
      }
    }
    const start = grid[startNode.row][startNode.col];
    const finish = grid[finishNode.row][finishNode.col];
    if (!bombIsPresent) {
      const visitedNodesInOrder = astar(grid, start, finish);
      const nodesInShortestPathOrder = getNodesInShortestPathOrderAstar(finish);
      // console.log(nodesInShortestPathOrder);
      this.animateAstar(
        visitedNodesInOrder,
        nodesInShortestPathOrder,
        false,
        null
      );
    } else {
      const bombNode1 = grid[bombNode.row][bombNode.col];
      const visitedNodesInOrder = astar(grid, start, bombNode1);
      const nodesInShortestPathOrder = getNodesInShortestPathOrderAstar(
        bombNode1
      );
      this.animateAstarWithBomb(
        visitedNodesInOrder,
        nodesInShortestPathOrder,
        bombNode1,
        finish
      );
    }
  };
  addBomb = () => {
    const { grid } = this.state;
    for (const row of grid) {
      for (const node of row) {
        if (node.row === bombNode.row && node.col === bombNode.col) {
          node.isWall = false;
          node.isBomb = true;
        } else {
          // node.bombNode = false;
          // continue;
        }
      }
    }
    bombNode.status = true;
    document.getElementById(`node-${bombNode.row}-${bombNode.col}`).className =
      "node node-bomb";
  };
  removeBomb = () => {
    // bomb = false;
    const { grid } = this.state;
    const element = document.getElementById(
      `node-${bombNode.row}-${bombNode.col}`
    );
    element.classList.remove("node-bomb");
    for (const row of grid) {
      for (const node of row) {
        node.isBomb = false;
      }
    }
    bombNode.status = false;
  };
  genRandomNumber = () => {
    return Math.floor(Math.random() * (NUMBER_OF_COLS * NUMBER_OF_ROWS));
  };
  resetNodeWalls = () => {
    const { grid } = this.state;
    const newGrid = grid.slice();
    for (const row of newGrid) {
      for (const node of row) {
        node.isWall = false;
      }
    }
    this.setState({ grid: newGrid });
  };
  genRandomWalls = () => {
    this.resetNodeWalls();
    const { grid } = this.state;
    const newGrid = grid.slice();
    let nodes = [];
    for (const row of grid) {
      for (const node of row) {
        if (node !== bombNode && node !== finishNode && node !== startNode) {
          nodes.push(node);
        }
      }
    }
    let x = 200,
      random = this.genRandomNumber();
    while (x) {
      nodes[random].isWall = !nodes[random].isWall;
      x -= 1;

      random = this.genRandomNumber();
    }
    this.setState({ grid: newGrid });
  };
  visualizeRecursiveDivision = () => {
    this.clearBoard();
    this.disableButtons();
    this.disableGrid();
    const { grid } = this.state;
    const nodes = recursiveDivision(grid, NUMBER_OF_ROWS, NUMBER_OF_COLS);
    for (let k = 0; k < nodes.length; k++) {
      //our nodes array will always more likely be greater than the actual number of nodes on the grid (as the way we are filling the array (setting the pattern number of time,see while loop in corresponding maze algorithm), and then pruning our nodes array till it reaches undefined i.e to the size of the number of nodes in the grid)
      if (nodes[k] === undefined) {
        return;
      }

      setTimeout(() => {
        if (!(nodes[k].isStart || nodes[k].isFinish || nodes[k].isBomb)) {
          nodes[k].isWall = true;
          const element = document.getElementById(
            `node-${nodes[k].row}-${nodes[k].col}`
          );
          element.className = "node node-wall";
        }
        //we would'nt have reached nodes[k]===undefined as we are returning from that point so we are checking in advance (also so that disabling persists while walls are being drawn)
        if (nodes[k + 1] === undefined) {
          this.reEnableButtons();
          this.enableGrid();
        }
      }, k * 10);
    }
  };
  visualizeStaircase = () => {
    this.clearBoard();
    this.disableButtons();
    this.disableGrid();
    const { grid } = this.state;
    const nodes = staircaseMaze(grid, NUMBER_OF_ROWS, NUMBER_OF_COLS);
    for (let k = 0; k < nodes.length; k++) {
      if (nodes[k] === undefined) {
        return;
      }
      setTimeout(() => {
        if (!(nodes[k].isStart || nodes[k].isFinish || nodes[k].isBomb)) {
          nodes[k].isWall = true;
          const element = document.getElementById(
            `node-${nodes[k].row}-${nodes[k].col}`
          );
          element.className = "node node-wall";
        }
        if (nodes[k + 1] === undefined) {
          this.reEnableButtons();
          this.enableGrid();
        }
      }, k * 10);
    }
  };
  disableGrid = () => {
    const { grid } = this.state;
    for (const row of grid) {
      for (const node of row) {
        const element = document.getElementById(`node-${node.row}-${node.col}`);
        element.style.pointerEvents = "none";
      }
    }
  };
  enableGrid = () => {
    const { grid } = this.state;
    for (const row of grid) {
      for (const node of row) {
        const element = document.getElementById(`node-${node.row}-${node.col}`);
        element.style.pointerEvents = "auto";
      }
    }
  };
  disableButtons = () => {
    const buttons = document.getElementsByClassName("btn");
    for (let k = 0; k < buttons.length; k++) {
      buttons[k].disabled = true;
    }
  };
  reEnableButtons = () => {
    const buttons = document.getElementsByClassName("btn");

    for (let k = 0; k < buttons.length; k++) {
      buttons[k].disabled = false;
    }
  };
  render() {
    //check resizing later
    // const element = document.getElementById("mainContent");
    // element.addEventListener("onresize", () => {
    //   this.getWindowSize();
    //   const grid = this.getInitialGrid();
    //   this.setState({ grid });
    // });
    return (
      <div className="App" id="mainContent">
        <NavBar
          visualizeDijkstra={() => this.visualizeDijkstra()}
          visualizeAstar={() => this.visualizeAstar()}
          clearBoard={() => this.clearBoard()}
          clearPath={() => this.clearPath()}
          addBomb={() => this.addBomb()}
          removeBomb={() => this.removeBomb()}
          genRandomWalls={() => this.genRandomWalls()}
          visualizeRecursiveDivision={() => this.visualizeRecursiveDivision()}
          visualizeStaircase={() => this.visualizeStaircase()}
        />
        <PathfindingVisualizer
          grid={this.state.grid}
          mouseIsPressed={this.state.mouseIsPressed}
          handleMouseUp={(row, col) => this.handleMouseUp(row, col)}
          handleMouseEnter={(row, col) => this.handleMouseEnter(row, col)}
          handleMouseDown={(row, col) => this.handleMouseDown(row, col)}
        />
      </div>
    );
  }
}

export default App;
