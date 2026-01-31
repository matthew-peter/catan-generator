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
      className={`px-2 py-1 rounded text-xs font-semibold transition-colors min-w-[52px]
        ${on ? 'bg-amber-500 text-amber-950' : 'bg-slate-700/60 text-slate-400'}`}
    >
      {children}
    </button>
  );
}

function OptionRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-slate-400 text-xs">{label}</span>
      <div className="flex gap-1">{children}</div>
    </div>
  );
}

export function OptionsPanel({ config, onConfigChange, onGenerate, isGenerating }: OptionsPanelProps) {
  const set = (u: Partial<BoardConfig>) => onConfigChange({ ...config, ...u });

  return (
    <div className="px-3 py-3 bg-slate-800/80 rounded-xl border border-slate-700/40 space-y-3">
      {/* Generate button - full width at top */}
      <button
        onClick={onGenerate}
        disabled={isGenerating}
        className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 
                   text-amber-950 font-bold rounded-lg text-sm transition-all active:scale-[0.98]"
      >
        {isGenerating ? 'Generating...' : 'Generate New Board'}
      </button>
      
      {/* Options - vertical stack */}
      <div className="space-y-2 pt-2 border-t border-slate-700/40">
        <OptionRow label="Players">
          <Toggle on={config.playerCount === '3-4'} onClick={() => set({ playerCount: '3-4' })}>3-4</Toggle>
          <Toggle on={config.playerCount === '5-6'} onClick={() => set({ playerCount: '5-6' })}>5-6</Toggle>
        </OptionRow>
        
        <OptionRow label="Desert">
          <Toggle on={config.desertPlacement === 'center'} onClick={() => set({ desertPlacement: 'center' })}>Center</Toggle>
          <Toggle on={config.desertPlacement === 'random'} onClick={() => set({ desertPlacement: 'random' })}>Random</Toggle>
        </OptionRow>
        
        <OptionRow label="Numbers">
          <Toggle on={config.numberPlacement === 'balanced'} onClick={() => set({ numberPlacement: 'balanced' })}>Balanced</Toggle>
          <Toggle on={config.numberPlacement === 'random'} onClick={() => set({ numberPlacement: 'random' })}>Random</Toggle>
        </OptionRow>
        
        <OptionRow label="Resources">
          <Toggle on={config.resourcePlacement === 'balanced'} onClick={() => set({ resourcePlacement: 'balanced' })}>Balanced</Toggle>
          <Toggle on={config.resourcePlacement === 'random'} onClick={() => set({ resourcePlacement: 'random' })}>Random</Toggle>
        </OptionRow>
        
        <OptionRow label="Ports">
          <Toggle on={config.portPlacement === 'fixed'} onClick={() => set({ portPlacement: 'fixed' })}>Fixed</Toggle>
          <Toggle on={config.portPlacement === 'random'} onClick={() => set({ portPlacement: 'random' })}>Random</Toggle>
        </OptionRow>
      </div>
    </div>
  );
}
