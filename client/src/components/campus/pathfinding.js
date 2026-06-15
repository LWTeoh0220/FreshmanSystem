// Min-Heap Priority Queue for A* Search
class PriorityQueue {
  constructor() {
    this.elements = [];
  }
  
  isEmpty() {
    return this.elements.length === 0;
  }
  
  put(item, priority) {
    this.elements.push({ item, priority });
    this.elements.sort((a, b) => a.priority - b.priority);
  }
  
  get() {
    return this.elements.shift().item;
  }
}

// 100x100 Grid representing 0-100 percentage coordinates
const GRID_SIZE = 100;

// Precompute walkable grid (0 = walkable, 1 = wall)
const grid = Array.from({ length: GRID_SIZE }, () => new Uint8Array(GRID_SIZE));

export function buildGrid(collisions) {
  for (let x = 0; x < GRID_SIZE; x++) {
    for (let y = 0; y < GRID_SIZE; y++) {
      grid[x][y] = 0; // Default walkable
      
      // Check collision with inflation margin to prevent corner sticking
      for (const box of collisions) {
        const margin = 1.0; // Inflate collision box by 1% margin
        if (x + 1 > box.x - margin && x < box.x + box.w + margin && 
            y + 1 > box.y - margin && y < box.y + box.h + margin) {
          grid[x][y] = 1;
          break;
        }
      }
    }
  }
}

function heuristic(a, b) {
  // Manhattan distance
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

function getNeighbors(node) {
  const dirs = [[1, 0], [0, 1], [-1, 0], [0, -1]];
  const neighbors = [];
  for (const [dx, dy] of dirs) {
    const nx = node.x + dx;
    const ny = node.y + dy;
    if (nx >= 0 && nx < GRID_SIZE && ny >= 0 && ny < GRID_SIZE && grid[nx][ny] === 0) {
      neighbors.push({ x: nx, y: ny });
    }
  }
  return neighbors;
}

// A* Search Algorithm
// Returns an array of {x, y} percentage coordinates representing the path
export function findPath(startX, startY, goalX, goalY) {
  const start = { x: Math.floor(startX), y: Math.floor(startY) };
  let goal = { x: Math.floor(goalX), y: Math.floor(goalY) };

  if (start.x < 0 || start.x >= GRID_SIZE || start.y < 0 || start.y >= GRID_SIZE || grid[start.x][start.y] === 1) return [];

  // If goal is inside a wall or out of bounds, find the nearest walkable tile using BFS
  if (goal.x < 0 || goal.x >= GRID_SIZE || goal.y < 0 || goal.y >= GRID_SIZE || grid[goal.x][goal.y] === 1) {
    let nearestGoal = null;
    let queue = [goal];
    let visited = new Set();
    visited.add(`${goal.x},${goal.y}`);
    let bfsMax = 100; // Search radius limit
    while (queue.length > 0 && bfsMax > 0) {
      bfsMax--;
      const curr = queue.shift();
      if (curr.x >= 0 && curr.x < GRID_SIZE && curr.y >= 0 && curr.y < GRID_SIZE && grid[curr.x][curr.y] === 0) {
        nearestGoal = curr;
        break;
      }
      const dirs = [[1, 0], [0, 1], [-1, 0], [0, -1]];
      for (const [dx, dy] of dirs) {
        const nx = curr.x + dx;
        const ny = curr.y + dy;
        const key = `${nx},${ny}`;
        if (nx >= 0 && nx < GRID_SIZE && ny >= 0 && ny < GRID_SIZE && !visited.has(key)) {
          visited.add(key);
          queue.push({ x: nx, y: ny });
        }
      }
    }
    if (!nearestGoal) return [];
    goal = nearestGoal;
  }

  const frontier = new PriorityQueue();
  frontier.put(start, 0);
  
  const cameFrom = new Map();
  const costSoFar = new Map();
  
  const toKey = (p) => `${p.x},${p.y}`;
  const startKey = toKey(start);
  
  cameFrom.set(startKey, null);
  costSoFar.set(startKey, 0);
  
  let found = false;

  // Limit search space to prevent freezing the UI on long paths
  let iterations = 0;
  const MAX_ITERATIONS = 1000;

  while (!frontier.isEmpty()) {
    iterations++;
    if (iterations > MAX_ITERATIONS) break;

    const current = frontier.get();
    
    if (current.x === goal.x && current.y === goal.y) {
      found = true;
      break;
    }
    
    for (const next of getNeighbors(current)) {
      const isDiagonal = (Math.abs(current.x - next.x) + Math.abs(current.y - next.y)) === 2;
      const stepCost = isDiagonal ? 1.414 : 1;
      const newCost = costSoFar.get(toKey(current)) + stepCost;
      const nextKey = toKey(next);
      
      if (!costSoFar.has(nextKey) || newCost < costSoFar.get(nextKey)) {
        costSoFar.set(nextKey, newCost);
        const priority = newCost + heuristic(next, goal);
        frontier.put(next, priority);
        cameFrom.set(nextKey, current);
      }
    }
  }

  if (!found) return [];

  // Reconstruct path
  let current = goal;
  const path = [];
  while (current !== null) {
    // Add 0.5 to target the center of the grid cell
    path.push({ x: current.x + 0.5, y: current.y + 0.5 });
    const prevKey = toKey(current);
    current = cameFrom.get(prevKey);
  }
  
  path.reverse(); // Start to goal
  return path;
}

// Line of sight check using Bresenham's line algorithm
export function hasLineOfSight(x0, y0, x1, y1) {
  let x = Math.floor(x0);
  let y = Math.floor(y0);
  const endX = Math.floor(x1);
  const endY = Math.floor(y1);

  const dx = Math.abs(endX - x);
  const dy = -Math.abs(endY - y);
  const sx = x < endX ? 1 : -1;
  const sy = y < endY ? 1 : -1;
  let err = dx + dy;

  while (true) {
    if (x >= 0 && x < GRID_SIZE && y >= 0 && y < GRID_SIZE) {
      if (grid[x][y] === 1) return false; // Hit a wall
    }
    
    if (x === endX && y === endY) break;
    const e2 = 2 * err;
    if (e2 >= dy) { err += dy; x += sx; }
    if (e2 <= dx) { err += dx; y += sy; }
  }
  return true;
}
