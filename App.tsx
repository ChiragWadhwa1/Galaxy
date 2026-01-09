
import React, { useState, useEffect, useCallback } from 'react';
import { ParticleParams, ParticleMode } from './types';
import { DEFAULT_PARAMS } from './constants';
import { interpretUserRequest } from './services/geminiService';
import ParticleScene from './components/ParticleScene';

const App: React.FC = () => {
  const [params, setParams] = useState<ParticleParams>(DEFAULT_PARAMS);
  const [userInput, setUserInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<string[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim() || isProcessing) return;

    setIsProcessing(true);
    setError(null);
    const query = userInput.trim();

    try {
      const updates = await interpretUserRequest(query, params);
      setParams(prev => ({ ...prev, ...updates }));
      setHistory(prev => [query, ...prev.slice(0, 9)]);
      setUserInput('');
    } catch (err) {
      setError('System malfunction. The stars are silent. Try again.');
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const setMode = (mode: ParticleMode) => {
    setParams(prev => ({ ...prev, mode }));
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-between p-6 md:p-12 overflow-hidden bg-black text-white">
      {/* Three.js Background */}
      <ParticleScene params={params} />

      {/* Header */}
      <header className="z-10 w-full flex justify-between items-start">
        <div className="space-y-1">
          <h1 className="text-4xl font-black tracking-tighter uppercase italic bg-clip-text text-transparent bg-gradient-to-r from-blue-300 to-blue-600">
            Lumina
          </h1>
          <p className="text-xs font-medium text-blue-400 tracking-widest uppercase opacity-80">
            AI-Driven Blue Symphony
          </p>
        </div>
        
        <div className="hidden md:flex flex-col items-end space-y-2">
            <div className="flex space-x-2">
                {Object.values(ParticleMode).map((m) => (
                    <button
                        key={m}
                        onClick={() => setMode(m)}
                        className={`px-3 py-1 text-[10px] font-bold rounded-full border transition-all duration-300 uppercase tracking-tighter ${
                            params.mode === m 
                            ? 'bg-blue-600 text-white border-blue-600 shadow-[0_0_15px_rgba(37,99,235,0.4)]' 
                            : 'bg-transparent text-blue-300 border-blue-500/20 hover:border-blue-500/50'
                        }`}
                    >
                        {m}
                    </button>
                ))}
            </div>
            <div className="text-[10px] text-blue-900 font-mono">
                {params.count.toLocaleString()} particles • v2.5.1
            </div>
        </div>
      </header>

      {/* Main UI Overlay */}
      <main className="z-10 w-full max-w-2xl mt-auto">
        <div className="bg-blue-950/10 backdrop-blur-xl border border-blue-500/10 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden group transition-all duration-500 hover:bg-blue-900/[0.07] hover:border-blue-500/20">
          
          {/* Subtle decoration */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-3xl -mr-16 -mt-16 pointer-events-none group-hover:bg-blue-500/10 transition-all duration-500" />
          
          <form onSubmit={handleSubmit} className="relative z-10 flex flex-col space-y-4">
            <div className="flex items-center space-x-3 mb-2">
              <div className={`w-2 h-2 rounded-full ${isProcessing ? 'bg-amber-400 animate-pulse' : 'bg-blue-400'} shadow-[0_0_10px_rgba(37,99,235,0.5)]`} />
              <label className="text-xs font-bold uppercase tracking-widest text-blue-400">
                Command the Azure Cosmos
              </label>
            </div>

            <div className="relative flex items-center">
                <input
                    type="text"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    placeholder="e.g. 'Intense sapphire vortex with electric sparks'"
                    className="w-full bg-blue-950/20 border border-blue-500/20 rounded-2xl py-4 px-6 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all placeholder:text-blue-900 text-lg disabled:opacity-50 text-blue-50"
                    disabled={isProcessing}
                />
                <button 
                    type="submit" 
                    disabled={isProcessing || !userInput.trim()}
                    className="absolute right-3 bg-blue-600 text-white font-black px-6 py-2 rounded-xl text-sm uppercase tracking-tighter hover:bg-blue-500 transition-colors disabled:bg-gray-800 disabled:text-gray-600 shadow-lg shadow-blue-900/20"
                >
                    {isProcessing ? 'Pulsing...' : 'Evolve'}
                </button>
            </div>

            {error && (
              <p className="text-red-400 text-xs font-medium px-2 animate-bounce">{error}</p>
            )}

            <div className="flex justify-between items-center px-2">
                <div className="flex space-x-4">
                    <button 
                        type="button"
                        onClick={() => setShowHistory(!showHistory)}
                        className="text-[10px] text-blue-500 hover:text-blue-200 uppercase tracking-widest font-bold transition-colors"
                    >
                        {showHistory ? 'Hide History' : 'Recent Queries'}
                    </button>
                    <div className="flex space-x-2 items-center">
                        <span className="text-[10px] text-blue-700 uppercase tracking-widest font-bold">Base:</span>
                        <div className="w-3 h-3 rounded-full border border-blue-500/40 shadow-[0_0_5px_rgba(0,17,255,0.5)]" style={{ backgroundColor: params.color1 }} />
                        <div className="w-3 h-3 rounded-full border border-blue-500/40 shadow-[0_0_5px_rgba(0,204,255,0.5)]" style={{ backgroundColor: params.color2 }} />
                    </div>
                </div>
                <div className="flex items-center space-x-2">
                    <span className="text-[10px] text-blue-700 uppercase tracking-widest font-bold">Flow Speed:</span>
                    <span className="text-[10px] font-mono text-blue-300">{params.speed.toFixed(1)}x</span>
                </div>
            </div>

            {showHistory && history.length > 0 && (
              <div className="mt-4 pt-4 border-t border-blue-500/10 flex flex-wrap gap-2">
                {history.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => setUserInput(q)}
                    className="text-[10px] px-3 py-1 rounded-full bg-blue-500/5 hover:bg-blue-500/10 text-blue-400 hover:text-blue-100 transition-all border border-blue-500/10"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}
          </form>
        </div>
      </main>

      {/* Footer Branding */}
      <footer className="z-10 w-full mt-6 flex justify-center opacity-30">
        <p className="text-[10px] uppercase tracking-[0.4em] font-light text-blue-400">
          Blue Edition • Harnessing Gemini AI
        </p>
      </footer>
    </div>
  );
};

export default App;
