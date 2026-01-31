import { useMemo } from 'react';
import type { HexTile, BoardConfig, PortType, ResourceType } from '../types';

interface BoardProps {
  tiles: HexTile[];
  config: BoardConfig;
}

function axialToPixel(q: number, r: number, size: number): { x: number; y: number } {
  return {
    x: size * (Math.sqrt(3) * q + (Math.sqrt(3) / 2) * r),
    y: size * (3 / 2) * r,
  };
}

function hexCorners(cx: number, cy: number, size: number): [number, number][] {
  const corners: [number, number][] = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 6;
    corners.push([cx + size * Math.cos(angle), cy + size * Math.sin(angle)]);
  }
  return corners;
}

function hexPath(cx: number, cy: number, size: number): string {
  const corners = hexCorners(cx, cy, size);
  return `M ${corners.map(c => c.join(',')).join(' L ')} Z`;
}

function areAdjacent(a: [number, number], b: [number, number]): boolean {
  const dq = b[0] - a[0];
  const dr = b[1] - a[1];
  return (
    (dq === 1 && dr === 0) || (dq === -1 && dr === 0) ||
    (dq === 0 && dr === 1) || (dq === 0 && dr === -1) ||
    (dq === 1 && dr === -1) || (dq === -1 && dr === 1)
  );
}

// ============================================================================
// REFINED COLOR PALETTE
// ============================================================================

const TILE_COLORS: Record<ResourceType, { fill: string; stroke: string; gradient: string }> = {
  wood: { fill: '#1B4D1B', stroke: '#0F2F0F', gradient: '#2D6B2D' },
  brick: { fill: '#A0522D', stroke: '#6B3A1F', gradient: '#C4713D' },
  wheat: { fill: '#DAA520', stroke: '#8B6914', gradient: '#F4C430' },
  sheep: { fill: '#7CB342', stroke: '#4A7A20', gradient: '#9CCC65' },
  ore: { fill: '#5C6370', stroke: '#3A3F47', gradient: '#787D87' },
  desert: { fill: '#D4B896', stroke: '#A08060', gradient: '#E8D4B8' },
};

const RESOURCE_ICONS: Record<ResourceType, string> = {
  wood: '🪵',
  brick: '🧱',
  wheat: '🌾',
  sheep: '🐑',
  ore: '🪨',
  desert: '🐫',
};

const PORT_ICONS: Record<PortType, string> = {
  wood: '🪵',
  brick: '🧱',
  wheat: '🌾',
  sheep: '🐑',
  ore: '🪨',
  any: '❓',
};

// Uniform icon size multiplier for both tiles and ports
const ICON_SIZE = 0.52;

// ============================================================================
// FRAME PIECES
// ============================================================================

interface PortOnPiece {
  hexIndex: number;
  type: PortType;
}

interface FramePieceDef {
  id: string;
  ports: PortOnPiece[];
}

const FRAME_PIECE_DEFS: FramePieceDef[] = [
  { id: '1', ports: [{ hexIndex: 0, type: 'any' }, { hexIndex: 2, type: 'wheat' }] },
  { id: '2', ports: [{ hexIndex: 0, type: 'any' }, { hexIndex: 2, type: 'brick' }] },
  { id: '3', ports: [{ hexIndex: 1, type: 'wood' }] },
  { id: '4', ports: [{ hexIndex: 1, type: 'ore' }] },
  { id: '5', ports: [{ hexIndex: 1, type: 'any' }] },
  { id: '6', ports: [{ hexIndex: 0, type: 'any' }, { hexIndex: 2, type: 'sheep' }] },
];

const EXTENSION_PIECE_DEFS: FramePieceDef[] = [
  { id: 'A', ports: [{ hexIndex: 0, type: 'any' }] },
  { id: 'B', ports: [{ hexIndex: 0, type: 'sheep' }] },
  { id: 'C', ports: [] },
  { id: 'D', ports: [] },
];

const SLOTS_3_4: [number, number][][] = [
  [[0, -1], [1, -1], [2, -1]],
  [[3, -1], [3, 0], [3, 1]],
  [[3, 2], [2, 3], [1, 4]],
  [[0, 5], [-1, 5], [-2, 5]],
  [[-3, 5], [-3, 4], [-3, 3]],
  [[-3, 2], [-2, 1], [-1, 0]],
];

// 5-6 player slot configuration
// Extension pieces CANNOT be adjacent to each other
// Each side (right & left) has 5 hexes: 3 for a long piece, 2 for extensions
// The only valid config: extensions at the ENDS of each side (not adjacent)
// This ensures the long piece fits in the middle 3 consecutive hexes

const SLOTS_5_6_LONG: [number, number][][] = [
  [[0, -1], [1, -1], [2, -1]],      // Top
  [[3, 0], [3, 1], [3, 2]],         // Right (middle 3, leaving ends for extensions)
  [[2, 4], [1, 5], [0, 6]],         // Bottom-right
  [[-1, 7], [-2, 7], [-3, 7]],      // Bottom
  [[-4, 6], [-4, 5], [-4, 4]],      // Left (middle 3, leaving ends for extensions)
  [[-3, 2], [-2, 1], [-1, 0]],      // Top-left
];

// Extensions at the ends of right and left sides (non-adjacent)
const SLOTS_5_6_EXT: [number, number][][] = [
  [[3, -1]],   // Right top end
  [[3, 3]],    // Right bottom end
  [[-4, 7]],   // Left bottom end
  [[-4, 3]],   // Left top end
];

function computeFrameShape(hexPositions: [number, number][], size: number): string {
  const hexCenters = hexPositions.map(([q, r]) => axialToPixel(q, r, size));
  const outerEdges: { x1: number; y1: number; x2: number; y2: number }[] = [];
  
  for (let h = 0; h < hexPositions.length; h++) {
    const center = hexCenters[h];
    const corners = hexCorners(center.x, center.y, size);
    
    for (let i = 0; i < 6; i++) {
      const next = (i + 1) % 6;
      const edgeMidX = (corners[i][0] + corners[next][0]) / 2;
      const edgeMidY = (corners[i][1] + corners[next][1]) / 2;
      
      let isShared = false;
      for (let h2 = 0; h2 < hexPositions.length; h2++) {
        if (h2 === h) continue;
        if (areAdjacent(hexPositions[h], hexPositions[h2])) {
          const otherCenter = hexCenters[h2];
          if (Math.hypot(edgeMidX - otherCenter.x, edgeMidY - otherCenter.y) < size * 0.9) {
            isShared = true;
            break;
          }
        }
      }
      
      if (!isShared) {
        outerEdges.push({ x1: corners[i][0], y1: corners[i][1], x2: corners[next][0], y2: corners[next][1] });
      }
    }
  }
  
  if (outerEdges.length === 0) return '';
  
  const path: { x: number; y: number }[] = [];
  const used = new Set<number>();
  path.push({ x: outerEdges[0].x1, y: outerEdges[0].y1 });
  path.push({ x: outerEdges[0].x2, y: outerEdges[0].y2 });
  used.add(0);
  
  while (used.size < outerEdges.length) {
    const last = path[path.length - 1];
    let found = false;
    for (let i = 0; i < outerEdges.length; i++) {
      if (used.has(i)) continue;
      const e = outerEdges[i];
      if (Math.hypot(last.x - e.x1, last.y - e.y1) < 1) {
        path.push({ x: e.x2, y: e.y2 });
        used.add(i);
        found = true;
        break;
      } else if (Math.hypot(last.x - e.x2, last.y - e.y2) < 1) {
        path.push({ x: e.x1, y: e.y1 });
        used.add(i);
        found = true;
        break;
      }
    }
    if (!found) break;
  }
  
  return `M ${path.map(p => `${p.x},${p.y}`).join(' L ')} Z`;
}

// ============================================================================
// FRAME PIECE COMPONENT
// ============================================================================

function FramePiece({ slotHexes, pieceDef, size, pieceId }: { 
  slotHexes: [number, number][]; 
  pieceDef: FramePieceDef; 
  size: number;
  pieceId: string;
}) {
  const shapePath = computeFrameShape(slotHexes, size);
  
  return (
    <g>
      {/* Water fill with gradient */}
      <path
        d={shapePath}
        fill={`url(#waterGradient${pieceId})`}
        stroke="#6B4423"
        strokeWidth="5"
        strokeLinejoin="round"
      />
      {/* Inner glow */}
      <path
        d={shapePath}
        fill="none"
        stroke="rgba(100,180,255,0.3)"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      
      {/* Ports */}
      {pieceDef.ports.map((port, idx) => {
        const [q, r] = slotHexes[port.hexIndex];
        const { x, y } = axialToPixel(q, r, size);
        return <PortToken key={idx} x={x} y={y} type={port.type} size={size} />;
      })}
    </g>
  );
}

// ============================================================================
// PORT TOKEN
// ============================================================================

// Shared icon token radius
const ICON_RADIUS = 0.32;

function PortToken({ x, y, type, size }: { x: number; y: number; type: PortType; size: number }) {
  return (
    <g transform={`translate(${x},${y})`}>
      <circle r={size * ICON_RADIUS} fill="#FFFEF8" />
      <text y={0} textAnchor="middle" fontSize={size * ICON_SIZE} dominantBaseline="central">
        {PORT_ICONS[type]}
      </text>
    </g>
  );
}

// ============================================================================
// LAND TILE
// ============================================================================

function LandTile({ tile, size, x, y }: { tile: HexTile; size: number; x: number; y: number }) {
  const colors = TILE_COLORS[tile.resource];
  const icon = RESOURCE_ICONS[tile.resource];
  
  return (
    <g transform={`translate(${x},${y})`}>
      {/* Tile */}
      <path d={hexPath(0, 0, size * 0.94)} fill={`url(#tileGradient${tile.resource})`} stroke={colors.stroke} strokeWidth="2" />
      
      {/* Resource icon token - identical to port tokens */}
      <g transform={`translate(0, ${tile.number ? -size * 0.18 : 0})`}>
        <circle r={size * ICON_RADIUS} fill="#FFFEF8" />
        <text y={0} textAnchor="middle" fontSize={size * ICON_SIZE} dominantBaseline="central">
          {icon}
        </text>
      </g>
      
      {/* Number token - at bottom */}
      {tile.number && (
        <g transform={`translate(0, ${size * 0.46})`}>
          <circle r={size * 0.18} fill="#FFFEF8" />
          <text
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={size * 0.18}
            fontWeight="bold"
            fontFamily="Georgia, serif"
            fill={tile.number === 6 || tile.number === 8 ? '#B71C1C' : '#2D2015'}
          >
            {tile.number}
          </text>
        </g>
      )}
    </g>
  );
}

// ============================================================================
// SHUFFLE
// ============================================================================

function shuffleArray<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

// ============================================================================
// BOARD
// ============================================================================

export function Board({ tiles, config }: BoardProps) {
  const is56 = config.playerCount === '5-6';
  const size = is56 ? 34 : 44;
  const randomizePorts = config.portPlacement === 'random';
  
  // Memoize piece shuffling (slots are fixed, but pieces can be shuffled among slots)
  const { longPieces, extPieces } = useMemo(() => {
    if (randomizePorts) {
      return {
        longPieces: shuffleArray(FRAME_PIECE_DEFS),
        extPieces: shuffleArray(EXTENSION_PIECE_DEFS),
      };
    }
    return { longPieces: FRAME_PIECE_DEFS, extPieces: EXTENSION_PIECE_DEFS };
  }, [tiles, randomizePorts]);
  
  const longSlots = is56 ? SLOTS_5_6_LONG : SLOTS_3_4;
  const extSlots = is56 ? SLOTS_5_6_EXT : [];
  
  const allHexes = [...longSlots.flat(), ...extSlots.flat()];
  const allPositions = allHexes.map(([q, r]) => axialToPixel(q, r, size));
  
  const padding = size * 1.3;
  const minX = Math.min(...allPositions.map(p => p.x)) - padding;
  const maxX = Math.max(...allPositions.map(p => p.x)) + padding;
  const minY = Math.min(...allPositions.map(p => p.y)) - padding;
  const maxY = Math.max(...allPositions.map(p => p.y)) + padding;
  
  const width = maxX - minX;
  const height = maxY - minY;
  const offsetX = -minX;
  const offsetY = -minY;

  return (
    <div className="w-full flex justify-center">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full max-w-3xl">
        <defs>
          {/* Ocean gradient */}
          <radialGradient id="oceanGradient" cx="50%" cy="40%" r="65%">
            <stop offset="0%" stopColor="#1A5276" />
            <stop offset="100%" stopColor="#0A2A3D" />
          </radialGradient>
          
          {/* Water gradients for frame pieces */}
          {['0', '1', '2', '3', '4', '5', 'A', 'B', 'C', 'D'].map(id => (
            <linearGradient key={id} id={`waterGradient${id}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#2E86AB" />
              <stop offset="50%" stopColor="#1B6B93" />
              <stop offset="100%" stopColor="#145374" />
            </linearGradient>
          ))}
          
          {/* Tile gradients */}
          {Object.entries(TILE_COLORS).map(([resource, colors]) => (
            <linearGradient key={resource} id={`tileGradient${resource}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={colors.gradient} />
              <stop offset="100%" stopColor={colors.fill} />
            </linearGradient>
          ))}
          
          {/* Token gradient */}
          <radialGradient id="tokenGradient" cx="35%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#FFFEF5" />
            <stop offset="100%" stopColor="#E8E0D0" />
          </radialGradient>
          
          {/* Port gradients */}
          <radialGradient id="portGradientany" cx="35%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#FFFEF8" />
            <stop offset="100%" stopColor="#E8DDD0" />
          </radialGradient>
          <radialGradient id="portGradientwheat" cx="35%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#F4D03F" />
            <stop offset="100%" stopColor="#C9A227" />
          </radialGradient>
          <radialGradient id="portGradientbrick" cx="35%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#CD6155" />
            <stop offset="100%" stopColor="#943126" />
          </radialGradient>
          <radialGradient id="portGradientwood" cx="35%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#52BE80" />
            <stop offset="100%" stopColor="#1E8449" />
          </radialGradient>
          <radialGradient id="portGradientsheep" cx="35%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#ABEBC6" />
            <stop offset="100%" stopColor="#7DCEA0" />
          </radialGradient>
          <radialGradient id="portGradientore" cx="35%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#85929E" />
            <stop offset="100%" stopColor="#5D6D7E" />
          </radialGradient>
          
          {/* Noise texture */}
          <filter id="noiseFilter">
            <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="4" result="noise" />
            <feColorMatrix type="saturate" values="0" />
          </filter>
          <pattern id="noiseTexture" width="100" height="100" patternUnits="userSpaceOnUse">
            <rect width="100" height="100" filter="url(#noiseFilter)" opacity="0.5" />
          </pattern>
        </defs>
        
        {/* Background */}
        <rect width={width} height={height} fill="url(#oceanGradient)" rx="12" />
        
        <g transform={`translate(${offsetX},${offsetY})`}>
          {/* Frame pieces */}
          {longSlots.map((slotHexes, idx) => (
            <FramePiece 
              key={`long-${idx}`} 
              slotHexes={slotHexes} 
              pieceDef={longPieces[idx]} 
              size={size}
              pieceId={String(idx)}
            />
          ))}
          {extSlots.map((slotHexes, idx) => (
            <FramePiece 
              key={`ext-${idx}`} 
              slotHexes={slotHexes} 
              pieceDef={extPieces[idx]} 
              size={size}
              pieceId={['A', 'B', 'C', 'D'][idx]}
            />
          ))}
          
          {/* Land tiles */}
          {tiles.map((tile) => {
            const pos = axialToPixel(tile.q, tile.r, size);
            return <LandTile key={tile.id} tile={tile} size={size} x={pos.x} y={pos.y} />;
          })}
        </g>
      </svg>
    </div>
  );
}
