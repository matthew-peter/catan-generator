import { useState, useCallback } from 'react';
import { Board } from './components/Board';
import { OptionsPanel } from './components/OptionsPanel';
import { generateBoard } from './utils/boardGenerator';
import type { BoardConfig, GameSetup } from './types';

const DEFAULT_CONFIG: BoardConfig = {
  playerCount: '3-4',
  desertPlacement: 'center',
  numberPlacement: 'balanced',
  resourcePlacement: 'balanced',
  portPlacement: 'fixed',
};

function App() {
  const [pendingConfig, setPendingConfig] = useState<BoardConfig>(DEFAULT_CONFIG);
  const [activeConfig, setActiveConfig] = useState<BoardConfig>(DEFAULT_CONFIG);
  const [gameSetup, setGameSetup] = useState<GameSetup>(() => generateBoard(DEFAULT_CONFIG));
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = useCallback(() => {
    setIsGenerating(true);
    setTimeout(() => {
      setActiveConfig(pendingConfig);
      setGameSetup(generateBoard(pendingConfig));
      setIsGenerating(false);
    }, 50);
  }, [pendingConfig]);

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col">
      {/* Header */}
      <header className="px-4 py-2.5 bg-amber-800">
        <h1 className="text-center text-sm font-bold text-amber-100">Catan Board Generator</h1>
      </header>

      {/* Content */}
      <main className="flex-1 flex flex-col px-3 py-3 gap-3 max-w-lg mx-auto w-full">
        {/* Board */}
        <div className={`transition-opacity ${isGenerating ? 'opacity-50' : ''}`}>
          <Board tiles={gameSetup.tiles} config={activeConfig} />
        </div>
        
        {/* Options with Generate button */}
        <OptionsPanel 
          config={pendingConfig} 
          onConfigChange={setPendingConfig}
          onGenerate={handleGenerate}
          isGenerating={isGenerating}
        />
      </main>
    </div>
  );
}

export default App;
