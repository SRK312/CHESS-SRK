
import React from 'react';
import { Screen, PlayerProgress, Character } from '../types';
import { CHARACTERS } from '../constants';

interface CharacterSelectProps {
  progress: PlayerProgress;
  onSelect: (id: string) => void;
  onNavigate: (screen: Screen) => void;
}

const CharacterSelect: React.FC<CharacterSelectProps> = ({ progress, onSelect, onNavigate }) => {
  return (
    <div className="min-h-screen bg-slate-900 p-8">
      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-center mb-12">
          <button 
            onClick={() => onNavigate(Screen.HOME)}
            className="text-slate-400 hover:text-white flex items-center gap-2"
          >
            ← BACK TO MENU
          </button>
          <h1 className="text-4xl font-game text-white">SELECT ARCHER</h1>
          <div className="w-24" />
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {CHARACTERS.map(char => {
            const isUnlocked = progress.unlockedCharacters.includes(char.id);
            const isSelected = progress.selectedCharacter === char.id;

            return (
              <div 
                key={char.id}
                className={`relative bg-slate-800 rounded-xl overflow-hidden border-2 transition-all p-6 flex flex-col items-center gap-4 ${
                  isSelected ? 'border-amber-500 scale-105 shadow-2xl shadow-amber-500/20' : 'border-white/10 hover:border-white/30'
                }`}
              >
                <div className="w-32 h-32 rounded-full bg-slate-700 flex items-center justify-center mb-4">
                  <img 
                    src={`https://picsum.photos/200?seed=${char.id}`} 
                    alt={char.name} 
                    className="w-full h-full rounded-full object-cover"
                  />
                </div>

                <h3 className="text-2xl font-game text-white">{char.name}</h3>
                <p className="text-amber-500 font-semibold">{char.ability}</p>
                <p className="text-slate-400 text-center text-sm mb-4">{char.description}</p>

                <div className="w-full space-y-2 mb-6">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">WIND HANDLING</span>
                    <span className="text-blue-400">{char.passiveBonus.windHandling * 100}%</span>
                  </div>
                  <div className="w-full bg-slate-700 h-1 rounded-full overflow-hidden">
                    <div className="bg-blue-400 h-full" style={{ width: `${char.passiveBonus.windHandling * 100}%` }} />
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">STEADINESS</span>
                    <span className="text-emerald-400">{char.passiveBonus.steadiness * 100}%</span>
                  </div>
                  <div className="w-full bg-slate-700 h-1 rounded-full overflow-hidden">
                    <div className="bg-emerald-400 h-full" style={{ width: `${char.passiveBonus.steadiness * 100}%` }} />
                  </div>
                </div>

                {isUnlocked ? (
                  <button
                    onClick={() => onSelect(char.id)}
                    className={`w-full py-3 rounded-lg font-bold transition-colors ${
                      isSelected ? 'bg-amber-500 text-slate-950' : 'bg-slate-700 text-white hover:bg-slate-600'
                    }`}
                  >
                    {isSelected ? 'SELECTED' : 'SELECT'}
                  </button>
                ) : (
                  <button
                    className="w-full py-3 rounded-lg font-bold bg-slate-600 text-slate-400 flex items-center justify-center gap-2 cursor-not-allowed"
                  >
                    <span>LOCKED</span>
                    <span className="text-xs">({char.cost} Coins)</span>
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CharacterSelect;
