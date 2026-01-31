// Resource types in Catan
export type ResourceType = 'wood' | 'brick' | 'wheat' | 'sheep' | 'ore' | 'desert';

// Number tokens (2-12, excluding 7)
export type NumberToken = 2 | 3 | 4 | 5 | 6 | 8 | 9 | 10 | 11 | 12;

// Port types
export type PortType = 'wood' | 'brick' | 'wheat' | 'sheep' | 'ore' | 'any';

// Hex tile representation
export interface HexTile {
  id: number;
  q: number; // axial coordinate
  r: number; // axial coordinate
  resource: ResourceType;
  number: NumberToken | null; // null for desert
}

// Port representation
export interface Port {
  id: number;
  q: number; // axial coordinate of the edge hex
  r: number; // axial coordinate of the edge hex
  direction: number; // which direction the port faces (0-5)
  edgeIndex: number; // which edge of the board (0-17 for 3-4 player)
  type: PortType;
  rotation: number; // degrees for visual orientation
}

// Board configuration
export interface BoardConfig {
  playerCount: '3-4' | '5-6';
  desertPlacement: 'center' | 'random';
  numberPlacement: 'default' | 'random' | 'balanced';
  resourcePlacement: 'random' | 'balanced';
  portPlacement: 'fixed' | 'random';
}

// Game setup data
export interface GameSetup {
  tiles: HexTile[];
  ports: Port[];
}

// Pip values for each number (probability indicators)
export const PIP_VALUES: Record<NumberToken, number> = {
  2: 1,
  3: 2,
  4: 3,
  5: 4,
  6: 5,
  8: 5,
  9: 4,
  10: 3,
  11: 2,
  12: 1,
};

// Resource colors for display
export const RESOURCE_COLORS: Record<ResourceType, string> = {
  wood: '#2D5016',    // Dark forest green
  brick: '#B84C2E',   // Terracotta
  wheat: '#E8C547',   // Golden yellow
  sheep: '#90C752',   // Light green
  ore: '#6B7280',     // Stone gray
  desert: '#D4B896',  // Sand
};

// Resource display names
export const RESOURCE_NAMES: Record<ResourceType, string> = {
  wood: 'Wood',
  brick: 'Brick',
  wheat: 'Wheat',
  sheep: 'Sheep',
  ore: 'Ore',
  desert: 'Desert',
};

// Port display names
export const PORT_NAMES: Record<PortType, string> = {
  wood: 'Wood 2:1',
  brick: 'Brick 2:1',
  wheat: 'Wheat 2:1',
  sheep: 'Sheep 2:1',
  ore: 'Ore 2:1',
  any: 'Any 3:1',
};
