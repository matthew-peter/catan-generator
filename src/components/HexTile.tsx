import type { HexTile, NumberToken } from '../types';
import { RESOURCE_COLORS, PIP_VALUES } from '../types';

interface HexTileComponentProps {
  tile: HexTile;
  size: number;
  x: number;
  y: number;
}

// Get hex points for SVG polygon
function getHexPoints(size: number): string {
  const points: string[] = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 6;
    const x = size * Math.cos(angle);
    const y = size * Math.sin(angle);
    points.push(`${x},${y}`);
  }
  return points.join(' ');
}

// Generate unique gradient ID
function getGradientId(resource: string, id: number): string {
  return `hex-gradient-${resource}-${id}`;
}

// Resource textures and overlays
function ResourceTexture({ resource, size }: { resource: string; size: number }) {
  const iconScale = size * 0.6;
  
  switch (resource) {
    case 'wood':
      return (
        <g opacity="0.7">
          {/* Forest trees */}
          {[-0.3, 0, 0.3].map((offset, i) => (
            <g key={i} transform={`translate(${offset * size * 0.8}, ${-size * 0.15 + i * 4})`}>
              <polygon
                points={`0,${-iconScale * 0.4} ${-iconScale * 0.2},${iconScale * 0.1} ${iconScale * 0.2},${iconScale * 0.1}`}
                fill="#1B4D1B"
                stroke="#0D3D0D"
                strokeWidth="1"
              />
              <rect
                x={-iconScale * 0.04}
                y={iconScale * 0.1}
                width={iconScale * 0.08}
                height={iconScale * 0.12}
                fill="#5D3A1A"
              />
            </g>
          ))}
        </g>
      );
    case 'brick':
      return (
        <g opacity="0.6">
          {/* Brick pattern */}
          <rect x={-iconScale * 0.35} y={-iconScale * 0.15} width={iconScale * 0.32} height={iconScale * 0.18} fill="#7D3520" rx="2" />
          <rect x={iconScale * 0.05} y={-iconScale * 0.15} width={iconScale * 0.32} height={iconScale * 0.18} fill="#7D3520" rx="2" />
          <rect x={-iconScale * 0.15} y={iconScale * 0.08} width={iconScale * 0.32} height={iconScale * 0.18} fill="#8D4530" rx="2" />
        </g>
      );
    case 'wheat':
      return (
        <g opacity="0.7">
          {/* Wheat stalks */}
          {[-0.2, 0, 0.2].map((offset, i) => (
            <g key={i} transform={`translate(${offset * size * 0.9}, 0) rotate(${(i - 1) * 8})`}>
              <ellipse cx={0} cy={-iconScale * 0.35} rx={iconScale * 0.08} ry={iconScale * 0.25} fill="#B8860B" />
              <line x1={0} y1={-iconScale * 0.1} x2={0} y2={iconScale * 0.25} stroke="#8B6914" strokeWidth="2" />
            </g>
          ))}
        </g>
      );
    case 'sheep':
      return (
        <g opacity="0.6">
          {/* Fluffy sheep */}
          <ellipse cx={0} cy={0} rx={iconScale * 0.35} ry={iconScale * 0.22} fill="#E8E8E8" />
          <circle cx={-iconScale * 0.18} cy={-iconScale * 0.08} r={iconScale * 0.1} fill="#F0F0F0" />
          <circle cx={iconScale * 0.18} cy={-iconScale * 0.08} r={iconScale * 0.1} fill="#F0F0F0" />
          <circle cx={0} cy={-iconScale * 0.15} r={iconScale * 0.11} fill="#F0F0F0" />
          <ellipse cx={iconScale * 0.28} cy={iconScale * 0.02} rx={iconScale * 0.09} ry={iconScale * 0.07} fill="#333" />
        </g>
      );
    case 'ore':
      return (
        <g opacity="0.6">
          {/* Mountain/rocks */}
          <polygon
            points={`0,${-iconScale * 0.35} ${-iconScale * 0.3},${iconScale * 0.15} ${iconScale * 0.3},${iconScale * 0.15}`}
            fill="#4A5568"
            stroke="#2D3748"
            strokeWidth="1"
          />
          <polygon
            points={`${iconScale * 0.15},${-iconScale * 0.15} ${-iconScale * 0.05},${iconScale * 0.15} ${iconScale * 0.35},${iconScale * 0.15}`}
            fill="#5A6578"
          />
          {/* Ore sparkles */}
          <circle cx={-iconScale * 0.08} cy={-iconScale * 0.05} r={iconScale * 0.04} fill="#A0AEC0" />
          <circle cx={iconScale * 0.12} cy={iconScale * 0.02} r={iconScale * 0.03} fill="#CBD5E0" />
        </g>
      );
    case 'desert':
      return (
        <g opacity="0.5">
          {/* Cactus */}
          <rect x={-iconScale * 0.06} y={-iconScale * 0.25} width={iconScale * 0.12} height={iconScale * 0.4} fill="#2D6B2D" rx="3" />
          <rect x={-iconScale * 0.22} y={-iconScale * 0.08} width={iconScale * 0.15} height={iconScale * 0.06} fill="#2D6B2D" rx="2" />
          <rect x={-iconScale * 0.22} y={-iconScale * 0.08} width={iconScale * 0.06} height={iconScale * 0.15} fill="#2D6B2D" rx="2" />
          <rect x={iconScale * 0.08} y={-iconScale * 0.15} width={iconScale * 0.15} height={iconScale * 0.06} fill="#2D6B2D" rx="2" />
          <rect x={iconScale * 0.17} y={-iconScale * 0.15} width={iconScale * 0.06} height={iconScale * 0.18} fill="#2D6B2D" rx="2" />
        </g>
      );
    default:
      return null;
  }
}

// Probability pips (dots showing likelihood)
function ProbabilityPips({ number, size }: { number: NumberToken; size: number }) {
  const pips = PIP_VALUES[number];
  const pipRadius = size * 0.035;
  const spacing = size * 0.11;
  const startX = -((pips - 1) * spacing) / 2;
  
  return (
    <g transform={`translate(0, ${size * 0.12})`}>
      {Array.from({ length: pips }, (_, i) => (
        <circle
          key={i}
          cx={startX + i * spacing}
          cy={0}
          r={pipRadius}
          fill={number === 6 || number === 8 ? '#DC2626' : '#3D3426'}
        />
      ))}
    </g>
  );
}

export function HexTileComponent({ tile, size, x, y }: HexTileComponentProps) {
  const hexPoints = getHexPoints(size * 0.96);
  const innerHexPoints = getHexPoints(size * 0.88);
  const gradientId = getGradientId(tile.resource, tile.id);
  const baseColor = RESOURCE_COLORS[tile.resource];
  
  // Calculate lighter and darker shades
  const lighterColor = adjustColor(baseColor, 20);
  const darkerColor = adjustColor(baseColor, -25);

  return (
    <g transform={`translate(${x}, ${y})`}>
      <defs>
        {/* Radial gradient for hex */}
        <radialGradient id={gradientId} cx="35%" cy="35%" r="65%">
          <stop offset="0%" stopColor={lighterColor} />
          <stop offset="70%" stopColor={baseColor} />
          <stop offset="100%" stopColor={darkerColor} />
        </radialGradient>
      </defs>
      
      {/* Hex shadow */}
      <polygon
        points={hexPoints}
        fill="rgba(0,0,0,0.2)"
        transform="translate(2, 3)"
      />
      
      {/* Main hex background */}
      <polygon
        points={hexPoints}
        fill={`url(#${gradientId})`}
        stroke="#2D2015"
        strokeWidth="2.5"
      />
      
      {/* Inner border highlight */}
      <polygon
        points={innerHexPoints}
        fill="none"
        stroke="rgba(255,255,255,0.15)"
        strokeWidth="1"
      />
      
      {/* Resource texture at top */}
      <g transform={`translate(0, ${-size * 0.18})`}>
        <ResourceTexture resource={tile.resource} size={size} />
      </g>
      
      {/* Number token (if not desert) */}
      {tile.number && (
        <g transform={`translate(0, ${size * 0.22})`}>
          {/* Token shadow */}
          <circle
            r={size * 0.28}
            fill="rgba(0,0,0,0.2)"
            transform="translate(1, 2)"
          />
          
          {/* Token background */}
          <circle
            r={size * 0.28}
            fill="#FDF8ED"
            stroke="#5D4E37"
            strokeWidth="2.5"
          />
          
          {/* Inner ring */}
          <circle
            r={size * 0.22}
            fill="none"
            stroke="rgba(93, 78, 55, 0.2)"
            strokeWidth="1"
          />
          
          {/* Number */}
          <text
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={size * 0.3}
            fontWeight="bold"
            fontFamily="Georgia, 'Times New Roman', serif"
            fill={tile.number === 6 || tile.number === 8 ? '#DC2626' : '#3D3426'}
            y={-size * 0.02}
          >
            {tile.number}
          </text>
          
          {/* Probability pips */}
          <ProbabilityPips number={tile.number} size={size} />
        </g>
      )}
      
      {/* Desert robber placeholder */}
      {tile.resource === 'desert' && (
        <g transform={`translate(0, ${size * 0.25})`}>
          {/* Simple robber silhouette */}
          <circle r={size * 0.12} fill="rgba(60,60,60,0.6)" />
          <ellipse cx={0} cy={size * 0.18} rx={size * 0.08} ry={size * 0.12} fill="rgba(60,60,60,0.6)" />
        </g>
      )}
    </g>
  );
}

// Helper to adjust color brightness
function adjustColor(hex: string, percent: number): string {
  const num = parseInt(hex.slice(1), 16);
  const r = Math.min(255, Math.max(0, (num >> 16) + percent));
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00FF) + percent));
  const b = Math.min(255, Math.max(0, (num & 0x0000FF) + percent));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}
