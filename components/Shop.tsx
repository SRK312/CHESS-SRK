
import React from 'react';
import { Screen, PlayerProgress, Blade } from '../types';
import { BLADES } from '../constants';

interface ShopProps {
  progress: PlayerProgress;
  onNavigate: (screen: Screen) => void;
  onPurchase: (blade: Blade) => void;
  onSelect: (id: string) => void;
}

const Shop: React.FC<ShopProps> = ({ progress, onNavigate, onPurchase, onSelect }) => {
  return (
    <div className="min-h-screen bg-slate-50 p-8 md:p-16 text-slate-900">
      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-24 gap-8">
          <div className="space-y-4">
            <button onClick={() => onNavigate(Screen.HOME)} className="text-slate-400 hover:text-slate-900 text-[10px] font-black tracking-[0.3em] flex items-center gap-3 transition-colors uppercase">
              <span>←</span> Return to Dojo
            </button>
            <h1 className="text-7xl font-game tracking-tighter text-slate-900">THE ARMORY</h1>
          </div>
          <div className="bg-white border border-slate-200 px-10 py-6 rounded-[2.5rem] shadow-xl">
             <div className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mb-2">Available Coins</div>
             <div className="text-amber-500 font-game text-5xl">🪙 {progress.coins}</div>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {BLADES.map(blade => {
            const isUnlocked = progress.unlockedBlades.includes(blade.id);
            const isSelected = progress.selectedBlade === blade.id;
            const canAfford = progress.coins >= blade.cost;

            return (
              <div key={blade.id} className={`bg-white border-2 rounded-[3rem] p-10 flex flex-col items-center text-center transition-all ${
                isSelected ? 'border-sky-500 shadow-2xl shadow-sky-500/10 scale-105' : 'border-slate-100 hover:border-slate-200 shadow-lg'
              }`}>
                <div 
                  className="w-28 h-28 rounded-full mb-10 flex items-center justify-center relative shadow-inner"
                  style={{ background: `radial-gradient(circle, ${blade.color}22 0%, transparent 80%)`, border: `4px solid ${blade.color}` }}
                >
                  <div className="w-1.5 h-16 rotate-45 rounded-full" style={{ backgroundColor: blade.color }} />
                </div>

                <h3 className="text-2xl font-game mb-3 text-slate-900">{blade.name}</h3>
                <p className="text-slate-400 text-[10px] mb-10 uppercase tracking-[0.2em] font-black">Power Multiplier: {blade.trailWidth}x</p>

                {isUnlocked ? (
                  <button 
                    onClick={() => onSelect(blade.id)}
                    className={`w-full py-5 rounded-2xl font-black transition-all ${
                      isSelected ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/30' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                    }`}
                  >
                    {isSelected ? 'EQUIPPED' : 'SELECT'}
                  </button>
                ) : (
                  <button 
                    onClick={() => onPurchase(blade)}
                    disabled={!canAfford}
                    className={`w-full py-5 rounded-2xl font-black transition-all ${
                      canAfford ? 'bg-slate-900 text-white hover:scale-105 shadow-xl' : 'bg-slate-50 text-slate-300 cursor-not-allowed border border-slate-100'
                    }`}
                  >
                    🪙 {blade.cost}
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

export default Shop;
