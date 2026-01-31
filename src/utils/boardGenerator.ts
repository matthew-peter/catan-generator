import type { 
  ResourceType, 
  NumberToken, 
  PortType, 
  HexTile, 
  Port, 
  BoardConfig, 
  GameSetup 
} from '../types';
import { PIP_VALUES } from '../types';

// Board definitions for different player counts
interface BoardDefinition {
  resources: Record<ResourceType, number>;
  numbers: NumberToken[];
  coordinates: [number, number][];
  portPositions: { q: number; r: number; direction: number }[];
  portTypes: PortType[];
}

// 3-4 player: 19 land hexes in rows of 3-4-5-4-3
const BOARD_3_4: BoardDefinition = {
  resources: {
    wood: 4,
    brick: 3,
    wheat: 4,
    sheep: 4,
    ore: 3,
    desert: 1,
  },
  numbers: [2, 3, 3, 4, 4, 5, 5, 6, 6, 8, 8, 9, 9, 10, 10, 11, 11, 12],
  coordinates: [
    // Row 0 (top): 3 hexes
    [0, 0], [1, 0], [2, 0],
    // Row 1: 4 hexes
    [-1, 1], [0, 1], [1, 1], [2, 1],
    // Row 2 (middle): 5 hexes
    [-2, 2], [-1, 2], [0, 2], [1, 2], [2, 2],
    // Row 3: 4 hexes
    [-2, 3], [-1, 3], [0, 3], [1, 3],
    // Row 4 (bottom): 3 hexes
    [-2, 4], [-1, 4], [0, 4],
  ],
  // 9 ports across 6 frame pieces (matching Board.tsx)
  // Piece 1: 3:1 + wheat | Piece 2: 3:1 + brick | Piece 3: wood
  // Piece 4: ore | Piece 5: 3:1 | Piece 6: 3:1 + sheep
  portPositions: [
    { q: 0, r: -1, direction: 0 },   // Piece 1 - 3:1
    { q: 2, r: -1, direction: 0 },   // Piece 1 - wheat
    { q: 3, r: -1, direction: 1 },   // Piece 2 - 3:1
    { q: 3, r: 1, direction: 1 },    // Piece 2 - brick
    { q: 2, r: 3, direction: 2 },    // Piece 3 - wood
    { q: -1, r: 5, direction: 3 },   // Piece 4 - ore
    { q: -3, r: 4, direction: 4 },   // Piece 5 - 3:1
    { q: -3, r: 2, direction: 5 },   // Piece 6 - 3:1
    { q: -1, r: 0, direction: 5 },   // Piece 6 - sheep
  ],
  portTypes: ['any', 'wheat', 'any', 'brick', 'wood', 'ore', 'any', 'any', 'sheep'],
};

// 5-6 player: 30 land hexes in rows of 3-4-5-6-5-4-3
const BOARD_5_6: BoardDefinition = {
  resources: {
    wood: 6,
    brick: 5,
    wheat: 6,
    sheep: 6,
    ore: 5,
    desert: 2,
  },
  numbers: [2, 2, 3, 3, 3, 4, 4, 4, 5, 5, 5, 6, 6, 6, 8, 8, 8, 9, 9, 9, 10, 10, 10, 11, 11, 11, 12, 12],
  coordinates: [
    // Row 0 (top): 3 hexes
    [0, 0], [1, 0], [2, 0],
    // Row 1: 4 hexes
    [-1, 1], [0, 1], [1, 1], [2, 1],
    // Row 2: 5 hexes
    [-2, 2], [-1, 2], [0, 2], [1, 2], [2, 2],
    // Row 3 (middle): 6 hexes
    [-3, 3], [-2, 3], [-1, 3], [0, 3], [1, 3], [2, 3],
    // Row 4: 5 hexes
    [-3, 4], [-2, 4], [-1, 4], [0, 4], [1, 4],
    // Row 5: 4 hexes
    [-3, 5], [-2, 5], [-1, 5], [0, 5],
    // Row 6 (bottom): 3 hexes
    [-3, 6], [-2, 6], [-1, 6],
  ],
  // 11 ports across 6 long pieces + 4 extensions (matching Board.tsx)
  // Long pieces: 1(3:1+wheat), 2(3:1+brick), 3(wood), 4(ore), 5(3:1), 6(3:1+sheep)
  // Extensions: A(3:1), B(sheep), C(none), D(none)
  portPositions: [
    { q: 0, r: -1, direction: 0 },   // Piece 1 - 3:1
    { q: 2, r: -1, direction: 0 },   // Piece 1 - wheat
    { q: 3, r: -1, direction: 1 },   // Piece 2 - 3:1
    { q: 3, r: 1, direction: 1 },    // Piece 2 - brick
    { q: 1, r: 5, direction: 2 },    // Piece 3 - wood
    { q: -2, r: 7, direction: 3 },   // Piece 4 - ore
    { q: -4, r: 4, direction: 4 },   // Piece 5 - 3:1
    { q: -3, r: 2, direction: 5 },   // Piece 6 - 3:1
    { q: -1, r: 0, direction: 5 },   // Piece 6 - sheep
    { q: 3, r: 2, direction: 1 },    // Extension A - 3:1
    { q: 3, r: 3, direction: 1 },    // Extension B - sheep
  ],
  portTypes: ['any', 'wheat', 'any', 'brick', 'wood', 'ore', 'any', 'any', 'sheep', 'any', 'sheep'],
};

// Fisher-Yates shuffle
function shuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

// Get neighbors for a hex using axial coordinates
function getNeighbors(q: number, r: number): [number, number][] {
  return [
    [q + 1, r],
    [q + 1, r - 1],
    [q, r - 1],
    [q - 1, r],
    [q - 1, r + 1],
    [q, r + 1],
  ];
}

// Check if a number is highly productive (6 or 8)
function isHighlyProductive(num: NumberToken | null): boolean {
  return num === 6 || num === 8;
}

// Get center index for the board
function getCenterIndex(definition: BoardDefinition): number {
  return Math.floor(definition.coordinates.length / 2);
}

// Build a coordinate lookup map for fast neighbor checking
function buildCoordMap(coords: [number, number][]): Map<string, number> {
  const map = new Map<string, number>();
  coords.forEach(([q, r], idx) => {
    map.set(`${q},${r}`, idx);
  });
  return map;
}

// Count same-type neighbors for a tile
function countSameTypeNeighbors(
  idx: number,
  values: (string | number | null)[],
  coords: [number, number][],
  coordMap: Map<string, number>
): number {
  const [q, r] = coords[idx];
  const val = values[idx];
  if (val === null) return 0;
  
  return getNeighbors(q, r).reduce((count, [nq, nr]) => {
    const nIdx = coordMap.get(`${nq},${nr}`);
    if (nIdx !== undefined && values[nIdx] === val) {
      return count + 1;
    }
    return count;
  }, 0);
}

// Simulated annealing optimization for resource/number placement
function optimizePlacement<T>(
  initial: T[],
  coords: [number, number][],
  scoreFn: (arr: T[], coords: [number, number][], coordMap: Map<string, number>) => number,
  canSwap: (i: number, j: number, arr: T[]) => boolean,
  iterations: number = 2000
): T[] {
  const coordMap = buildCoordMap(coords);
  let current = [...initial];
  let currentScore = scoreFn(current, coords, coordMap);
  let best = [...current];
  let bestScore = currentScore;
  
  let temperature = 1.0;
  const coolingRate = 0.995;
  
  for (let iter = 0; iter < iterations; iter++) {
    // Pick two random indices to swap
    const i = Math.floor(Math.random() * current.length);
    let j = Math.floor(Math.random() * current.length);
    while (j === i) {
      j = Math.floor(Math.random() * current.length);
    }
    
    // Check if swap is allowed
    if (!canSwap(i, j, current)) continue;
    
    // Swap and evaluate
    [current[i], current[j]] = [current[j], current[i]];
    const newScore = scoreFn(current, coords, coordMap);
    
    // Accept or reject
    const delta = newScore - currentScore;
    if (delta < 0 || Math.random() < Math.exp(-delta / temperature)) {
      currentScore = newScore;
      if (currentScore < bestScore) {
        best = [...current];
        bestScore = currentScore;
      }
    } else {
      // Revert swap
      [current[i], current[j]] = [current[j], current[i]];
    }
    
    temperature *= coolingRate;
  }
  
  return best;
}

// Score function for resource placement - penalizes same-type adjacencies
function scoreResources(
  resources: ResourceType[],
  coords: [number, number][],
  coordMap: Map<string, number>
): number {
  let score = 0;
  
  for (let i = 0; i < resources.length; i++) {
    // Each same-type neighbor adds to penalty
    score += countSameTypeNeighbors(i, resources, coords, coordMap) * 10;
  }
  
  return score;
}

// Score function for number placement - penalizes 6/8 adjacencies and same-number adjacencies
function scoreNumbers(
  numbers: (NumberToken | null)[],
  coords: [number, number][],
  coordMap: Map<string, number>,
  resources: ResourceType[]
): number {
  let score = 0;
  
  for (let i = 0; i < numbers.length; i++) {
    const num = numbers[i];
    if (num === null) continue;
    
    const [q, r] = coords[i];
    const neighbors = getNeighbors(q, r);
    
    for (const [nq, nr] of neighbors) {
      const nIdx = coordMap.get(`${nq},${nr}`);
      if (nIdx === undefined) continue;
      
      const nNum = numbers[nIdx];
      if (nNum === null) continue;
      
      // Heavy penalty for 6/8 adjacent to another 6/8
      if (isHighlyProductive(num) && isHighlyProductive(nNum)) {
        score += 100;
      }
      
      // Penalty for same number adjacent
      if (num === nNum) {
        score += 30;
      }
    }
  }
  
  // Penalty for uneven distribution of high numbers across resources
  const resourceHighCount: Record<ResourceType, number> = {
    wood: 0, brick: 0, wheat: 0, sheep: 0, ore: 0, desert: 0
  };
  
  for (let i = 0; i < numbers.length; i++) {
    if (isHighlyProductive(numbers[i])) {
      resourceHighCount[resources[i]]++;
    }
  }
  
  // Penalize any resource having more than 2 high-productivity numbers
  for (const resource of ['wood', 'brick', 'wheat', 'sheep', 'ore'] as ResourceType[]) {
    if (resourceHighCount[resource] > 2) {
      score += (resourceHighCount[resource] - 2) * 50;
    }
  }
  
  // Calculate pip totals per resource for balance
  const resourcePipTotals: Record<ResourceType, number> = {
    wood: 0, brick: 0, wheat: 0, sheep: 0, ore: 0, desert: 0
  };
  
  for (let i = 0; i < numbers.length; i++) {
    const num = numbers[i];
    if (num !== null) {
      resourcePipTotals[resources[i]] += PIP_VALUES[num];
    }
  }
  
  // Calculate variance in pip totals (excluding desert)
  const pipValues = (['wood', 'brick', 'wheat', 'sheep', 'ore'] as ResourceType[])
    .map(r => resourcePipTotals[r]);
  const avgPips = pipValues.reduce((a, b) => a + b, 0) / pipValues.length;
  const variance = pipValues.reduce((sum, v) => sum + Math.pow(v - avgPips, 2), 0) / pipValues.length;
  
  // Penalize high variance (unfair resource distribution)
  score += variance * 2;
  
  return score;
}

// Generate resources for tiles
function generateResources(
  config: BoardConfig,
  definition: BoardDefinition
): ResourceType[] {
  const coords = definition.coordinates;
  const resources: ResourceType[] = [];
  
  // Build resource pool
  for (const [resource, count] of Object.entries(definition.resources)) {
    for (let i = 0; i < count; i++) {
      resources.push(resource as ResourceType);
    }
  }

  if (config.resourcePlacement === 'random') {
    return shuffle(resources);
  }

  // Balanced placement using optimization
  let initial = shuffle(resources);
  
  // If desert should be centered, fix it in place
  if (config.desertPlacement === 'center') {
    const centerIdx = getCenterIndex(definition);
    const desertIdx = initial.indexOf('desert');
    if (desertIdx !== -1 && desertIdx !== centerIdx) {
      [initial[desertIdx], initial[centerIdx]] = [initial[centerIdx], initial[desertIdx]];
    }
  }
  
  // Optimize placement
  const canSwapResources = (i: number, j: number, arr: ResourceType[]): boolean => {
    // Don't move desert if it should be centered
    if (config.desertPlacement === 'center') {
      const centerIdx = getCenterIndex(definition);
      if ((i === centerIdx || j === centerIdx) && (arr[i] === 'desert' || arr[j] === 'desert')) {
        return false;
      }
    }
    return arr[i] !== arr[j]; // Only swap different resources
  };
  
  return optimizePlacement(
    initial,
    coords,
    scoreResources,
    canSwapResources,
    3000
  );
}

// Generate number tokens for tiles
function generateNumbers(
  config: BoardConfig,
  resources: ResourceType[],
  definition: BoardDefinition
): (NumberToken | null)[] {
  const coords = definition.coordinates;
  const result: (NumberToken | null)[] = resources.map(r => r === 'desert' ? null : null);
  const nonDesertIndices = resources.map((r, i) => r !== 'desert' ? i : -1).filter(i => i !== -1);
  const numbers = [...definition.numbers];
  
  if (config.numberPlacement === 'random') {
    const shuffled = shuffle(numbers);
    nonDesertIndices.forEach((idx, i) => {
      result[idx] = shuffled[i];
    });
    return result;
  }

  // Balanced placement using optimization
  const shuffledNumbers = shuffle(numbers);
  
  // Create initial assignment
  const numberAssignment: (NumberToken | null)[] = [...result];
  nonDesertIndices.forEach((idx, i) => {
    numberAssignment[idx] = shuffledNumbers[i];
  });
  
  // Optimize with resource awareness
  const coordMap = buildCoordMap(coords);
  const scoreWithResources = (nums: (NumberToken | null)[]) => 
    scoreNumbers(nums, coords, coordMap, resources);
  
  const canSwapNumbers = (i: number, j: number, arr: (NumberToken | null)[]): boolean => {
    // Don't swap nulls (desert tiles)
    // Allow swapping same numbers - they may be on different resources affecting pip balance
    return arr[i] !== null && arr[j] !== null;
  };
  
  // Custom optimization for numbers
  let current = [...numberAssignment];
  let currentScore = scoreWithResources(current);
  let best = [...current];
  let bestScore = currentScore;
  
  let temperature = 1.0;
  const coolingRate = 0.995;
  
  for (let iter = 0; iter < 4000; iter++) {
    // Pick two random non-desert indices
    const iLocal = Math.floor(Math.random() * nonDesertIndices.length);
    let jLocal = Math.floor(Math.random() * nonDesertIndices.length);
    while (jLocal === iLocal) {
      jLocal = Math.floor(Math.random() * nonDesertIndices.length);
    }
    
    const i = nonDesertIndices[iLocal];
    const j = nonDesertIndices[jLocal];
    
    if (!canSwapNumbers(i, j, current)) continue;
    
    // Swap and evaluate
    [current[i], current[j]] = [current[j], current[i]];
    const newScore = scoreWithResources(current);
    
    const delta = newScore - currentScore;
    if (delta < 0 || Math.random() < Math.exp(-delta / temperature)) {
      currentScore = newScore;
      if (currentScore < bestScore) {
        best = [...current];
        bestScore = currentScore;
      }
    } else {
      [current[i], current[j]] = [current[j], current[i]];
    }
    
    temperature *= coolingRate;
  }
  
  return best;
}

// Generate ports
function generatePorts(config: BoardConfig, definition: BoardDefinition): Port[] {
  const portTypes = config.portPlacement === 'random' 
    ? shuffle([...definition.portTypes])
    : [...definition.portTypes];

  return definition.portPositions.map((pos, index) => ({
    id: index,
    q: pos.q,
    r: pos.r,
    direction: pos.direction,
    edgeIndex: index,
    type: portTypes[index],
    rotation: pos.direction * 60,
  }));
}

// Main board generation function
export function generateBoard(config: BoardConfig): GameSetup {
  const definition = config.playerCount === '3-4' ? BOARD_3_4 : BOARD_5_6;
  const coords = definition.coordinates;

  // Generate resources
  let resources = generateResources(config, definition);

  // Ensure desert is at center if configured
  if (config.desertPlacement === 'center') {
    const centerIndex = getCenterIndex(definition);
    const desertIdx = resources.indexOf('desert');
    if (desertIdx !== -1 && desertIdx !== centerIndex) {
      [resources[desertIdx], resources[centerIndex]] = 
        [resources[centerIndex], resources[desertIdx]];
    }
  }

  // Generate numbers
  const numbers = generateNumbers(config, resources, definition);

  // Create tiles
  const tiles: HexTile[] = coords.map(([q, r], index) => ({
    id: index,
    q,
    r,
    resource: resources[index],
    number: numbers[index],
  }));

  // Generate ports
  const ports = generatePorts(config, definition);

  return { tiles, ports };
}

export { BOARD_3_4, BOARD_5_6 };
export type { BoardDefinition };
