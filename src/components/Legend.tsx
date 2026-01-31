import { RESOURCE_COLORS, RESOURCE_NAMES } from '../types';
import type { ResourceType } from '../types';

interface LegendProps {
  showPorts?: boolean;
}

function ResourceLegendItem({ resource }: { resource: ResourceType }) {
  return (
    <div className="flex items-center gap-2">
      <div
        className="w-6 h-6 rounded-md border-2 border-white/20 shadow-inner"
        style={{ backgroundColor: RESOURCE_COLORS[resource] }}
      />
      <span className="text-sm text-amber-100">{RESOURCE_NAMES[resource]}</span>
    </div>
  );
}

function PortLegendItem({ type, color }: { type: string; color: string }) {
  return (
    <div className="flex items-center gap-2">
      <div
        className="w-6 h-4 rounded border-2 border-amber-800/50"
        style={{ backgroundColor: color }}
      />
      <span className="text-xs text-amber-200">{type}</span>
    </div>
  );
}

export function Legend({ showPorts = true }: LegendProps) {
  const resources: ResourceType[] = ['wood', 'brick', 'wheat', 'sheep', 'ore', 'desert'];
  
  return (
    <div className="w-full max-w-lg mx-auto p-4 bg-gradient-to-b from-amber-950/60 to-amber-950/40 rounded-xl border border-amber-800/30">
      <h3 className="text-sm font-semibold text-amber-300 mb-3">Legend</h3>
      
      {/* Resources */}
      <div className="grid grid-cols-3 gap-x-4 gap-y-2 mb-4">
        {resources.map((resource) => (
          <ResourceLegendItem key={resource} resource={resource} />
        ))}
      </div>
      
      {/* Number probability explanation */}
      <div className="flex items-center gap-4 py-2 border-t border-amber-800/30">
        <div className="flex items-center gap-1">
          <span className="text-red-500 font-bold text-sm">6 8</span>
          <span className="text-xs text-amber-300">= High probability</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-amber-100 text-xs">• = 1 pip (probability)</span>
        </div>
      </div>

      {/* Ports */}
      {showPorts && (
        <div className="pt-2 border-t border-amber-800/30">
          <p className="text-xs text-amber-400 mb-2">Ports</p>
          <div className="grid grid-cols-3 gap-2">
            <PortLegendItem type="3:1 Any" color="#F5F5F5" />
            <PortLegendItem type="2:1 Wood" color={RESOURCE_COLORS.wood} />
            <PortLegendItem type="2:1 Brick" color={RESOURCE_COLORS.brick} />
            <PortLegendItem type="2:1 Wheat" color={RESOURCE_COLORS.wheat} />
            <PortLegendItem type="2:1 Sheep" color={RESOURCE_COLORS.sheep} />
            <PortLegendItem type="2:1 Ore" color={RESOURCE_COLORS.ore} />
          </div>
        </div>
      )}
    </div>
  );
}
