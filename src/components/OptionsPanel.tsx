import type { BoardConfig } from '../types';

interface OptionsPanelProps {
  config: BoardConfig;
  onConfigChange: (config: BoardConfig) => void;
  onGenerate: () => void;
  isGenerating: boolean;
}

function Toggle({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors
        ${on ? 'bg-amber-500 text-amber-950' : 'bg-slate-700/60 text-slate-400'}`}
    >
      {children}
    </button>
  );
}

export function OptionsPanel({ config, onConfigChange, onGenerate, isGenerating }: OptionsPanelProps) {
  const set = (u: Partial<BoardConfig>) => onConfigChange({ ...config, ...u });

  return (
    <div className="px-3 py-2.5 bg-slate-800/80 rounded-xl border border-slate-700/40 text-xs space-y-2">
      {/* Players row with Generate button */}
      <div className="flex justify-between items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-300">Players</span>
          <div className="flex gap-1">
            <Toggle on={config.playerCount === '3-4'} onClick={() => set({ playerCount: '3-4' })}>3-4</Toggle>
            <Toggle on={config.playerCount === '5-6'} onClick={() => set({ playerCount: '5-6' })}>5-6</Toggle>
          </div>
        </div>
        <button
          onClick={onGenerate}
          disabled={isGenerating}
          className="px-4 py-1 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 
                     text-amber-950 font-bold rounded text-xs transition-all active:scale-[0.98]"
        >
          {isGenerating ? '...' : 'Generate'}
        </button>
      </div>
      
      {/* Options grid */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 pt-1.5 border-t border-slate-700/40">
        <div className="flex justify-between items-center">
          <span className="text-slate-500">Desert</span>
          <div className="flex gap-1">
            <Toggle on={config.desertPlacement === 'center'} onClick={() => set({ desertPlacement: 'center' })}>Center</Toggle>
            <Toggle on={config.desertPlacement === 'random'} onClick={() => set({ desertPlacement: 'random' })}>Random</Toggle>
          </div>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-slate-500">Numbers</span>
          <div className="flex gap-1">
            <Toggle on={config.numberPlacement === 'balanced'} onClick={() => set({ numberPlacement: 'balanced' })}>Balanced</Toggle>
            <Toggle on={config.numberPlacement === 'random'} onClick={() => set({ numberPlacement: 'random' })}>Random</Toggle>
          </div>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-slate-500">Resources</span>
          <div className="flex gap-1">
            <Toggle on={config.resourcePlacement === 'balanced'} onClick={() => set({ resourcePlacement: 'balanced' })}>Balanced</Toggle>
            <Toggle on={config.resourcePlacement === 'random'} onClick={() => set({ resourcePlacement: 'random' })}>Random</Toggle>
          </div>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-slate-500">Ports</span>
          <div className="flex gap-1">
            <Toggle on={config.portPlacement === 'fixed'} onClick={() => set({ portPlacement: 'fixed' })}>Fixed</Toggle>
            <Toggle on={config.portPlacement === 'random'} onClick={() => set({ portPlacement: 'random' })}>Random</Toggle>
          </div>
        </div>
      </div>
    </div>
  );
}
